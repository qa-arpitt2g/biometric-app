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

  if (minutes >= 540) {
    return 'bg-[#c6efce] text-[#006100]';
  }

  if (minutes >= 480) {
    return 'bg-[#fff2cc] text-[#7f6000]';
  }

  return 'bg-[#fce4d6] text-[#9c5700]';
}

function breakCellClass(value) {
  const minutes = timeToMinutes(value);

  if (!value) {
    return 'bg-white';
  }

  return minutes > 60 ? 'bg-[#f4cccc] text-[#990000]' : 'bg-[#c6efce] text-[#006100]';
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

    if (minutes >= 480) {
      return { fgColor: { rgb: 'FFF2CC' } };
    }

    return { fgColor: { rgb: 'FCE4D6' } };
  }

  if (columnKey === 'totalBreakTime') {
    return { fgColor: { rgb: timeToMinutes(row.totalBreakTime) > 60 ? 'F4CCCC' : 'C6EFCE' } };
  }

  return { fgColor: { rgb: 'FFFFFF' } };
}

export default function ProcessedAttendancePreview({ rows = [], isProcessing = false, fileName, onReset }) {
  const [nameQuery, setNameQuery] = useState('');
  const [codeQuery, setCodeQuery] = useState('');
  const [loginFilter, setLoginFilter] = useState('all');
  const [breakFilter, setBreakFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const loginMinutes = timeToMinutes(row.totalLoginTime);
      const breakMinutes = timeToMinutes(row.totalBreakTime);
      const matchesName = String(row.employeeName || '').toLowerCase().includes(nameQuery.toLowerCase());
      const matchesCode = String(row.employeeCode || '').toLowerCase().includes(codeQuery.toLowerCase());
      const matchesLogin = loginFilter === 'all'
        || (loginFilter === 'good' && loginMinutes >= 540)
        || (loginFilter === 'warning' && loginMinutes >= 480 && loginMinutes < 540)
        || (loginFilter === 'low' && loginMinutes < 480);
      const matchesBreak = breakFilter === 'all'
        || (breakFilter === 'excessive' && breakMinutes > 60)
        || (breakFilter === 'acceptable' && breakMinutes <= 60);

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
    XLSX.writeFile(workbook, 'processed-attendance-report.xlsx');
  }

  if (isProcessing) {
    return <ProcessingState />;
  }

  if (!rows.length) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-[0px_4px_20px_rgba(26,43,76,0.05)] overflow-hidden fade-in">
        <div className="px-lg py-md border-b border-outline-variant/30 flex flex-col gap-md xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h4 className="font-title-lg text-title-lg text-primary">Daily Attendance Processing Report</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 truncate">
              {fileName || 'Processed attendance file'} - {filteredRows.length} visible rows
            </p>
          </div>
          <div className="flex flex-wrap gap-sm">
            {onReset ? (
              <button className="px-md py-sm border border-outline-variant/40 rounded-lg font-bold text-primary hover:bg-surface-container-low flex items-center gap-xs" onClick={onReset} type="button">
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                Upload New File
              </button>
            ) : null}
            <button className="px-md py-sm border border-outline-variant/40 rounded-lg font-bold text-primary hover:bg-surface-container-low flex items-center gap-xs" onClick={downloadReport} type="button">
              <span className="material-symbols-outlined text-[20px]">download</span>
              Download Report
            </button>
            <button className="px-md py-sm bg-secondary text-on-secondary rounded-lg font-bold shadow-md hover:bg-secondary-fixed-dim/90 flex items-center gap-xs" onClick={() => setIsEmailOpen(true)} type="button">
              <span className="material-symbols-outlined text-[20px]">mail</span>
              Send Report
            </button>
          </div>
        </div>

        <div className="px-lg py-md bg-surface-container-low/40 border-b border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-sm">
          <label className="relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">person_search</span>
            <input
              className="w-full rounded-lg border border-outline-variant/40 bg-white pl-10 pr-sm py-sm font-body-sm text-body-sm outline-none focus:border-secondary"
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
              className="w-full rounded-lg border border-outline-variant/40 bg-white pl-10 pr-sm py-sm font-body-sm text-body-sm outline-none focus:border-secondary"
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
            className="w-full rounded-lg border border-outline-variant/40 bg-white px-sm py-sm font-body-sm text-body-sm outline-none focus:border-secondary"
            value={loginFilter}
            onChange={(event) => {
              setLoginFilter(event.target.value);
              setPage(1);
              setScrollTop(0);
            }}
          >
            <option value="all">All login hours</option>
            <option value="good">Good login hours</option>
            <option value="warning">8-9 login hours</option>
            <option value="low">Under 8 login hours</option>
          </select>
          <select
            className="w-full rounded-lg border border-outline-variant/40 bg-white px-sm py-sm font-body-sm text-body-sm outline-none focus:border-secondary"
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
            className="max-h-[610px] overflow-y-auto"
            onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
            style={{ minWidth: `${totalWidth}px` }}
          >
            <table className="w-full border-collapse table-fixed text-[12px] leading-tight font-[Arial,Helvetica,sans-serif]">
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

        <div className="px-lg py-sm bg-surface-container-low border-t border-outline-variant/30 flex flex-col sm:flex-row gap-sm sm:items-center sm:justify-between">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Showing {filteredRows.length ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length} rows
          </p>
          <div className="flex items-center gap-xs">
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
        onClose={() => setIsEmailOpen(false)}
        onSent={() => {
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
