'use client';

import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx-js-style';
import EmailReportModal from '@/components/EmailReportModal';

export const attendanceColumns = [
  { key: 'sNo', label: 'S.No', width: '65px' },
  { key: 'employeeCode', label: 'Employee Code', width: '83px' },
  { key: 'employeeName', label: 'EmployeeName', width: '110px' },
  { key: 'totalIn', label: 'Total IN', width: '65px' },
  { key: 'totalOut', label: 'Total OUT', width: '65px' },
  { key: 'firstIn', label: 'First IN', width: '70px' },
  { key: 'lastIn', label: 'Last IN', width: '70px' },
  { key: 'lastOut', label: 'Last OUT', width: '70px' },
  { key: 'totalLoginTime', label: 'Total Login Time', width: '88px' },
  { key: 'totalBreakTime', label: 'Total Break Time', width: '88px' },
];

const rowHeight = 32;
const overscan = 8;
const pageSize = 100;

function timeToMinutes(value) {
  if (!value) {
    return 0;
  }

  const text = String(value).trim();
  const colonMatch = text.match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?/);
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*h/i);
  const minuteMatch = text.match(/(\d+)\s*m/i);

  if (colonMatch) {
    return Number(colonMatch[1]) * 60 + Number(colonMatch[2]);
  }

  if (hourMatch || minuteMatch) {
    return Math.round(Number(hourMatch?.[1] || 0) * 60) + Number(minuteMatch?.[1] || 0);
  }

  return Number(text) || 0;
}

function loginCellClass(value) {
  const minutes = timeToMinutes(value);

  if (!value) {
    return 'bg-white';
  }

  if (minutes >= 540) { // 9 hours
    return 'bg-[#c6efce] text-[#006100]';
  }

  if (minutes >= 300) { // 5 hours
    return 'bg-[#fff2cc] text-[#7f6000]';
  }

  return 'bg-[#f4cccc] text-[#990000]';
}

function breakCellClass(value) {
  const minutes = timeToMinutes(value);

  if (!value) {
    return 'bg-white';
  }

  return minutes > 65 ? 'bg-[#f4cccc] text-[#990000]' : 'bg-[#c6efce] text-[#006100]';
}

function ProcessingState() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-[0px_4px_20px_rgba(26,43,76,0.05)] p-xl text-center fade-in">
      <div className="w-14 h-14 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin mx-auto mb-md"></div>
      <h4 className="font-title-lg text-title-lg text-primary mb-xs">Processing Attendance...</h4>
      <div className="max-w-md mx-auto h-2 rounded-full bg-surface-container-highest overflow-hidden">
        <div className="h-full w-2/3 bg-secondary animate-pulse"></div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-[0px_4px_20px_rgba(26,43,76,0.05)] p-xl text-center">
      <div className="w-14 h-14 rounded-full bg-surface-container-high mx-auto mb-md flex items-center justify-center">
        <span className="material-symbols-outlined text-secondary text-3xl">table_view</span>
      </div>
      <h4 className="font-title-lg text-title-lg text-primary mb-xs">No processed report yet</h4>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Upload an Excel or CSV attendance file and process it to render the spreadsheet-style report here.
      </p>
    </div>
  );
}

function getCellClass(key, value) {
  if (key === 'totalLoginTime') {
    return loginCellClass(value);
  }

  if (key === 'totalBreakTime') {
    return breakCellClass(value);
  }

  return 'bg-white';
}

function getExportFill(columnIndex, rowIndex, row) {
  if (rowIndex === 0) {
    return { fgColor: { rgb: 'D9D9D9' } };
  }

  const columnKey = attendanceColumns[columnIndex]?.key;

  if (columnKey === 'totalLoginTime') {
    const minutes = timeToMinutes(row.totalLoginTime);

    if (minutes >= 540) {
      return { fgColor: { rgb: 'C6EFCE' } };
    }

    if (minutes >= 300) {
      return { fgColor: { rgb: 'FFF2CC' } };
    }

    return { fgColor: { rgb: 'F4CCCC' } };
  }

  if (columnKey === 'totalBreakTime') {
    return { fgColor: { rgb: timeToMinutes(row.totalBreakTime) > 65 ? 'F4CCCC' : 'C6EFCE' } };
  }

  return { fgColor: { rgb: 'FFFFFF' } };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCellStyle(columnKey, row) {
  if (columnKey === 'totalLoginTime') {
    const minutes = timeToMinutes(row.totalLoginTime);
    if (minutes >= 540) {
      return 'background:#c6efce;color:#006100;';
    }
    if (minutes >= 300) {
      return 'background:#fff2cc;color:#7f6000;';
    }
    return 'background:#f4cccc;color:#990000;';
  }

  if (columnKey === 'totalBreakTime') {
    return timeToMinutes(row.totalBreakTime) > 65
      ? 'background:#f4cccc;color:#990000;'
      : 'background:#c6efce;color:#006100;';
  }

  return '';
}

function parseDateFromFileName(fileName) {
  if (!fileName) {
    return null;
  }

  const match = fileName.match(/(\d{4})-(\d{2})-(\d{2})(?:[T _-]?(\d{2})(\d{2})(\d{2})(?:\.(\d{1,3}))?)?/);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour = '00', minute = '00', second = '00', ms = '0'] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    Number(ms.padEnd(3, '0'))
  );
}

function formatReportDate(date) {
  const resolvedDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(resolvedDate);
}

function buildReportTitle(fileName) {
  const reportDate = formatReportDate(parseDateFromFileName(fileName));
  return `Biometric Attendance Report – ${reportDate}`;
}

const HARPREET_EMAIL = 'harpreet@tech2globe.com';
const HR_EMAIL = 'hr@tech2globe.com';
const PRIMARY_REPORT_EMAIL = 'monika.sharma@tech2globe.com';
const FULL_REPORT_CC = [HR_EMAIL, HARPREET_EMAIL];

function buildCcList(toEmail) {
  const normalized = String(toEmail || '').trim().toLowerCase();
  return normalized === HARPREET_EMAIL
    ? [HR_EMAIL]
    : [HARPREET_EMAIL, HR_EMAIL];
}

function getPresentRows(rows) {
  return rows.filter((row) => Number(row.totalIn || 0) > 0);
}

function buildFullReportEmailBatch(rows, fileName) {
  const presentRows = getPresentRows(rows);

  if (presentRows.length === 0) {
    throw new Error('No present employee rows found for the full attendance report.');
  }

  return {
    toEmail: PRIMARY_REPORT_EMAIL,
    ccEmails: FULL_REPORT_CC,
    reportTitle: buildReportTitle(fileName),
    reportHtml: buildReportHtml(presentRows, fileName),
    rowCount: presentRows.length,
  };
}

function normalizeEmployeeCode(value) {
  return String(value || '').trim().toLowerCase();
}

function buildReportHtml(rows, fileName, options = {}) {
  const { department } = options;
  const reportHeading = buildReportTitle(fileName);
  const introLine = department
    ? `Please find the processed attendance report for department: <strong>${escapeHtml(department)}</strong>.`
    : 'Please find the processed attendance report generated from the uploaded biometric attendance data.';
  const header = `
    <div style="font-family:'Open Sans', sans-serif;font-size:14px;color:#111;">
      <div style="text-align:center;margin-bottom:20px;">
        <h1 style="margin:0;font-size:24px;font-weight:700;text-align:center;">${escapeHtml(reportHeading)}</h1>
      </div>
      <p style="margin:0 0 16px 0;">Hello,</p>
      <p style="margin:0 0 20px 0;">${introLine}</p>
    </div>`;

  const tableHeader = `<tr>${attendanceColumns.map((column) => `
        <th style="border:1px solid #ccc;padding:6px 8px;background:#f7f7f7;text-align:center;font-weight:700;font-size:12px;">${escapeHtml(column.label)}</th>`).join('')}
      </tr>`;

  const tableRows = rows.map((row, index) => `
      <tr>${attendanceColumns.map((column) => {
    const value = column.key === 'sNo' ? index + 1 : row[column.key] ?? '';
    const style = getCellStyle(column.key, row);
    return `<td style="border:1px solid #ccc;padding:6px 8px;text-align:center;font-size:12px;${style}">${escapeHtml(value)}</td>`;
  }).join('')}</tr>`).join('');

  return `
    <div style="font-family:'Open Sans', sans-serif;color:#111;">
      ${header}
      <table style="width:100%;border-collapse:collapse;margin-top:6px;">
        <thead>${tableHeader}</thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  `;
}

async function buildDepartmentEmailBatches(rows, fileName) {
  const employeesResponse = await fetch('/api/employees', {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!employeesResponse.ok) {
    throw new Error('Failed to load employees for email routing.');
  }

  const payload = await employeesResponse.json();
  const employees = Array.isArray(payload?.employees) ? payload.employees : [];
  const employeesByCode = new Map(
    employees.map((employee) => [
      normalizeEmployeeCode(employee.employeeCode),
      employee,
    ]),
  );
  const grouped = new Map();

  rows.forEach((row) => {
    const employee = employeesByCode.get(normalizeEmployeeCode(row.employeeCode));
    if (!employee?.hodEmail) {
      return;
    }

    const department = String(employee.department || 'General').trim() || 'General';
    const toEmail = String(employee.hodEmail).trim().toLowerCase();
    const key = `${department}__${toEmail}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        department,
        toEmail,
        rows: [],
      });
    }
    grouped.get(key).rows.push(row);
  });

  if (grouped.size === 0) {
    throw new Error('No matching employee routing found. Please ensure Employee Code and HOD Email are available in Employee data.');
  }

  return Array.from(grouped.values()).map((group) => ({
    department: group.department,
    toEmail: group.toEmail,
    ccEmails: buildCcList(group.toEmail),
    reportTitle: `${buildReportTitle(fileName)} - ${group.department}`,
    reportHtml: buildReportHtml(group.rows, fileName, { department: group.department }),
    rowCount: group.rows.length,
  }));
}

export default function ProcessedAttendancePreview({ rows = [], isProcessing = false, fileName, onReset }) {
  const [nameQuery, setNameQuery] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [loginFilter, setLoginFilter] = useState('all');
  const [breakFilter, setBreakFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [emailBatches, setEmailBatches] = useState([]);
  const [emailSummaryTitle, setEmailSummaryTitle] = useState('Biometric Attendance Report');
  const [isPreparingEmail, setIsPreparingEmail] = useState(false);
  const [emailPrepError, setEmailPrepError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Show only those who are present and have punch records
      const totalInCount = Number(row.totalIn || 0);
      const isPresent = totalInCount > 0;
      if (!isPresent) return false;

      const loginMinutes = timeToMinutes(row.totalLoginTime);
      const breakMinutes = timeToMinutes(row.totalBreakTime);
      const matchesName = String(row.employeeName || '').toLowerCase().includes(nameQuery.toLowerCase());
      const matchesCode = String(row.employeeCode || '').toLowerCase().includes(codeQuery.toLowerCase());
      const matchesLogin = loginFilter === 'all'
        || (loginFilter === 'good' && loginMinutes >= 540)
        || (loginFilter === 'warning' && loginMinutes >= 300 && loginMinutes < 540)
        || (loginFilter === 'low' && loginMinutes < 300);
      const matchesBreak = breakFilter === 'all'
        || (breakFilter === 'excessive' && breakMinutes > 65)
        || (breakFilter === 'acceptable' && breakMinutes <= 65);

      return matchesName && matchesCode && matchesLogin && matchesBreak;
    });
  }, [rows, nameQuery, codeQuery, loginFilter, breakFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleCount = 18;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(pagedRows.length, startIndex + visibleCount + overscan * 2);
  const visibleRows = pagedRows.slice(startIndex, endIndex);
  const totalWidth = attendanceColumns.reduce((sum, column) => sum + Number(column.width.replace('px', '')), 0);
  const topSpacerHeight = startIndex * rowHeight;
  const bottomSpacerHeight = Math.max(0, (pagedRows.length - endIndex) * rowHeight);

  function downloadReport() {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRows.map((row, index) => ({
        'S.No': row.sNo || index + 1,
        'Employee Code': row.employeeCode,
        EmployeeName: row.employeeName,
        'Total IN': row.totalIn,
        'Total OUT': row.totalOut,
        'First IN': row.firstIn,
        'Last IN': row.lastIn,
        'Last OUT': row.lastOut,
        'Total Login Time': row.totalLoginTime,
        'Total Break Time': row.totalBreakTime,
      })),
      { header: attendanceColumns.map((column) => column.label) },
    );
    const workbook = XLSX.utils.book_new();

    worksheet['!cols'] = attendanceColumns.map((column) => ({ wch: Math.max(10, Number(column.width.replace('px', '')) / 8) }));
    worksheet['!rows'] = [{ hpt: 22 }, ...filteredRows.map(() => ({ hpt: 18 }))];
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
      for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
        const cell = worksheet[cellAddress];

        if (!cell) {
          continue;
        }

        cell.s = {
          font: { bold: rowIndex === 0, color: { rgb: '000000' } },
          fill: getExportFill(columnIndex, rowIndex, filteredRows[rowIndex - 1]),
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
    XLSX.writeFile(workbook, 'attendance-report.xlsx');
  }

  if (isProcessing) {
    return <ProcessingState />;
  }

  if (!rows.length) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0px_4px_20px_rgba(26,43,76,0.05)] overflow-hidden fade-in w-full min-w-0 max-w-full">
        <div className="px-4 py-4 sm:px-5 sm:py-5 border-b border-outline-variant/30 flex flex-col gap-4 min-w-0">
          <div className="min-w-0">
            <h4 className="font-title-lg text-title-lg text-primary mb-1.5">Daily Attendance Processing Report</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              {fileName || 'Processed attendance file'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center min-w-0">
            {onReset ? (
              <button className="h-9 px-3 py-2 border border-outline-variant/40 bg-white text-primary text-sm font-medium rounded-lg inline-flex items-center justify-center gap-1.5 transition-all duration-200 ease-out hover:bg-surface-container-low hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 whitespace-nowrap shrink-0" onClick={onReset} type="button">
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                <span className="hidden sm:inline">Upload New File</span>
                <span className="sm:hidden">Upload</span>
              </button>
            ) : null}
            <button className="h-9 px-3 py-2 border border-outline-variant/40 bg-white text-primary text-sm font-medium rounded-lg inline-flex items-center justify-center gap-1.5 transition-all duration-200 ease-out hover:bg-surface-container-low hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/30 whitespace-nowrap shrink-0" onClick={downloadReport} type="button">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span className="hidden sm:inline">Download Report</span>
              <span className="sm:hidden">Download</span>
            </button>
            <button className="h-9 px-3 py-2 bg-secondary text-on-secondary text-sm font-medium rounded-lg shadow-sm inline-flex items-center justify-center gap-1.5 transition-all duration-200 ease-out hover:bg-secondary-fixed-dim/85 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap shrink-0" onClick={async () => {
              setEmailPrepError('');
              setIsPreparingEmail(true);
              try {
                const fullBatch = buildFullReportEmailBatch(rows, fileName);
                const departmentBatches = await buildDepartmentEmailBatches(filteredRows, fileName);
                setEmailBatches([fullBatch, ...departmentBatches]);
                setEmailSummaryTitle(buildReportTitle(fileName));
                setIsEmailOpen(true);
              } catch (error) {
                setEmailPrepError(error.message || 'Unable to prepare attendance emails.');
              } finally {
                setIsPreparingEmail(false);
              }
            }} type="button" disabled={isPreparingEmail}>
              <span className="material-symbols-outlined text-[18px]">mail</span>
              {isPreparingEmail ? 'Preparing...' : 'Send Report'}
            </button>
          </div>
        </div>
        {emailPrepError ? (
          <div className="px-5 pb-4 sm:px-6 sm:pb-5">
            <div className="rounded-lg border border-error/30 bg-error-container/20 px-3 py-2 text-error text-sm">
              {emailPrepError}
            </div>
          </div>
        ) : null}

        <div className="px-5 py-5 sm:px-6 sm:py-6 bg-surface-container-low/40 border-b border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <label className="relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">person_search</span>
            <input
              className="w-full rounded-lg border border-outline-variant/40 bg-white pl-10 pr-sm py-2.5 font-body-sm text-body-sm outline-none focus:border-secondary"
              value={nameQuery}
              onChange={(event) => {
                setNameQuery(event.target.value);
                setPage(1);
                setScrollTop(0);
              }}
              placeholder="Search employee name"
            />
          </label>
          <label className="relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">badge</span>
            <input
              className="w-full rounded-lg border border-outline-variant/40 bg-white pl-10 pr-sm py-2.5 font-body-sm text-body-sm outline-none focus:border-secondary"
              value={codeQuery}
              onChange={(event) => {
                setCodeQuery(event.target.value);
                setPage(1);
                setScrollTop(0);
              }}
              placeholder="Search employee code"
            />
          </label>
          <select
            className="w-full rounded-lg border border-outline-variant/40 bg-white px-sm py-2.5 font-body-sm text-body-sm outline-none focus:border-secondary"
            value={loginFilter}
            onChange={(event) => {
              setLoginFilter(event.target.value);
              setPage(1);
              setScrollTop(0);
            }}
          >
            <option value="all">All login hours</option>
            <option value="good">9+ hours (Green)</option>
            <option value="warning">5-9 hours (Yellow)</option>
            <option value="low">Under 5 hours (Red)</option>
          </select>
          <select
            className="w-full rounded-lg border border-outline-variant/40 bg-white px-sm py-2.5 font-body-sm text-body-sm outline-none focus:border-secondary"
            value={breakFilter}
            onChange={(event) => {
              setBreakFilter(event.target.value);
              setPage(1);
              setScrollTop(0);
            }}
          >
            <option value="all">All break times</option>
            <option value="acceptable">Acceptable breaks</option>
            <option value="excessive">Excessive break time</option>
          </select>
        </div>

        <div className="overflow-x-auto bg-white">
          <div
            key={`${currentPage}-${nameQuery}-${codeQuery}-${loginFilter}-${breakFilter}`}
            className="max-h-[610px] overflow-y-auto min-w-full"
            onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          >
            <table className="w-full border-collapse table-auto text-[12px] leading-tight font-[Arial,Helvetica,sans-serif]">
              <colgroup>
                {attendanceColumns.map((column) => (
                  <col key={column.key} style={{ width: column.width }} />
                ))}
              </colgroup>
              <thead className="sticky top-0 z-10">
                <tr>
                  {attendanceColumns.map((column) => (
                    <th
                      key={column.key}
                      className="h-8 border border-black bg-[#d9d9d9] px-1.5 py-1 text-center font-bold text-black whitespace-nowrap"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topSpacerHeight ? (
                  <tr aria-hidden="true">
                    <td className="border-0 p-0" colSpan={attendanceColumns.length} style={{ height: `${topSpacerHeight}px` }}></td>
                  </tr>
                ) : null}
                {visibleRows.map((row, visibleIndex) => {
                  const absoluteIndex = startIndex + visibleIndex;

                  return (
                    <tr
                      key={`${row.originalIndex}-${absoluteIndex}`}
                      style={{ height: `${rowHeight}px` }}
                    >
                      {attendanceColumns.map((column) => (
                        <td
                          key={column.key}
                          className={`border border-black px-1.5 py-1 text-center text-black align-middle whitespace-nowrap overflow-hidden text-ellipsis ${getCellClass(column.key, row[column.key])}`}
                          style={{ width: column.width }}
                          title={String(row[column.key] ?? '')}
                        >
                          {column.key === 'sNo' ? (currentPage - 1) * pageSize + absoluteIndex + 1 : row[column.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {bottomSpacerHeight ? (
                  <tr aria-hidden="true">
                    <td className="border-0 p-0" colSpan={attendanceColumns.length} style={{ height: `${bottomSpacerHeight}px` }}></td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-6 sm:py-5 bg-surface-container-low border-t border-outline-variant/30 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Showing {filteredRows.length ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length} rows
          </p>
          <div className="flex items-center gap-xs flex-wrap">
            <button
              className="p-xs border border-outline-variant/30 rounded hover:bg-surface-container-highest transition-colors disabled:opacity-30"
              disabled={currentPage === 1}
              onClick={() => {
                setPage((value) => Math.max(1, value - 1));
                setScrollTop(0);
              }}
              type="button"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="px-sm py-xs font-body-sm text-body-sm text-primary">Page {currentPage} of {totalPages}</span>
            <button
              className="p-xs border border-outline-variant/30 rounded hover:bg-surface-container-highest transition-colors disabled:opacity-30"
              disabled={currentPage === totalPages}
              onClick={() => {
                setPage((value) => Math.min(totalPages, value + 1));
                setScrollTop(0);
              }}
              type="button"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <EmailReportModal
        isOpen={isEmailOpen}
        summaryTitle={emailSummaryTitle}
        emailBatches={emailBatches}
        onClose={() => setIsEmailOpen(false)}
        onSent={(count) => {
          setShowToast(true);
          window.setTimeout(() => setShowToast(false), 2800);
        }}
      />
      {showToast ? (
        <div className="fixed right-md bottom-md z-50 rounded-lg bg-secondary text-on-secondary shadow-xl px-md py-sm font-body-sm text-body-sm font-bold fade-in flex items-center gap-xs">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          Report sent successfully.
        </div>
      ) : null}
    </>
  );
}
