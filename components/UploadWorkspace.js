'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import ProcessedAttendancePreview, { attendanceColumns } from '@/components/ProcessedAttendancePreview';
import { GuidelinesCard, UploadCard } from '@/components/UploadSection';

const headerAliases = {
  sNo: ['s.no', 'sno', 'sr no', 'serial no', 'serial number'],
  employeeCode: ['employee code', 'employeecode', 'employee id', 'employeeid', 'emp code', 'emp id', 'code'],
  employeeName: ['employeename', 'employee name', 'emp name', 'name'],
  totalIn: ['total in', 'totalin', 'in count', 'punch in count'],
  totalOut: ['total out', 'totalout', 'out count', 'punch out count'],
  firstIn: ['first in', 'firstin', 'checkin', 'check in', 'in time'],
  lastIn: ['last in', 'lastin'],
  lastOut: ['last out', 'lastout', 'checkout', 'check out', 'out time'],
  totalLoginTime: ['total login time', 'totallogintime', 'login hours', 'working hours', 'total hours'],
  totalBreakTime: ['total break time', 'totalbreaktime', 'break time', 'break hours'],
};

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/[_-]/g, ' ').replace(/\s+/g, ' ');
}

function findHeaderRow(rows) {
  return rows.findIndex((row) => {
    const normalized = row.map(normalizeHeader);
    const matchedColumns = attendanceColumns.filter((column) => {
      const aliases = headerAliases[column.key] || [];
      return aliases.some((alias) => normalized.includes(alias));
    });

    return matchedColumns.length >= 3;
  });
}

function createColumnMap(headerRow) {
  const normalizedHeaders = headerRow.map(normalizeHeader);

  return attendanceColumns.reduce((map, column) => {
    const aliases = headerAliases[column.key] || [];
    const index = normalizedHeaders.findIndex((header) => aliases.includes(header));

    return { ...map, [column.key]: index };
  }, {});
}

function toCellValue(value) {
  return value === undefined || value === null ? '' : String(value);
}

function parseDurationMinutes(value) {
  const text = String(value || '').trim();
  const colonMatch = text.match(/^(\d{1,2}):(\d{2})/);
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*h/i);
  const minuteMatch = text.match(/(\d+)\s*m/i);

  if (colonMatch) {
    return Number(colonMatch[1]) * 60 + Number(colonMatch[2]);
  }

  if (hourMatch || minuteMatch) {
    return Math.round(Number(hourMatch?.[1] || 0) * 60) + Number(minuteMatch?.[1] || 0);
  }

  return 0;
}

function formatDuration(minutes) {
  if (!minutes) {
    return '';
  }

  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function parseClockMinutes(value) {
  const text = String(value || '').trim();
  const match = text.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }

  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

function buildReportRows(sheetRows) {
  const headerIndex = findHeaderRow(sheetRows);

  if (headerIndex === -1) {
    return sheetRows
      .filter((row) => row.some((cell) => toCellValue(cell).trim()))
      .map((row, index) => ({
        originalIndex: index,
        sNo: toCellValue(row[0]) || index + 1,
        employeeCode: toCellValue(row[1]),
        employeeName: toCellValue(row[2]),
        totalIn: toCellValue(row[3]),
        totalOut: toCellValue(row[4]),
        firstIn: toCellValue(row[5]),
        lastIn: toCellValue(row[6]),
        lastOut: toCellValue(row[7]),
        totalLoginTime: toCellValue(row[8]),
        totalBreakTime: toCellValue(row[9]),
      }));
  }

  const columnMap = createColumnMap(sheetRows[headerIndex]);
  const dataRows = sheetRows.slice(headerIndex + 1).filter((row) => row.some((cell) => toCellValue(cell).trim()));
  const hasReportColumns = columnMap.totalLoginTime !== -1 || columnMap.totalBreakTime !== -1;

  if (hasReportColumns) {
    return dataRows.map((row, index) => {
      const getValue = (key) => {
        const columnIndex = columnMap[key];
        return columnIndex >= 0 ? toCellValue(row[columnIndex]) : '';
      };

      return {
        originalIndex: index,
        sNo: getValue('sNo') || index + 1,
        employeeCode: getValue('employeeCode'),
        employeeName: getValue('employeeName'),
        totalIn: getValue('totalIn'),
        totalOut: getValue('totalOut'),
        firstIn: getValue('firstIn'),
        lastIn: getValue('lastIn'),
        lastOut: getValue('lastOut'),
        totalLoginTime: getValue('totalLoginTime'),
        totalBreakTime: getValue('totalBreakTime'),
      };
    });
  }

  const groups = new Map();

  dataRows.forEach((row, index) => {
    const getValue = (key) => {
      const columnIndex = columnMap[key];
      return columnIndex >= 0 ? toCellValue(row[columnIndex]) : '';
    };
    const employeeCode = getValue('employeeCode');
    const employeeName = getValue('employeeName');
    const groupKey = employeeCode || `${employeeName}__${index}`;
    const firstIn = getValue('firstIn');
    const lastOut = getValue('lastOut');
    const lastIn = getValue('lastIn') || firstIn;
    const firstInMinutes = parseClockMinutes(firstIn);
    const lastInMinutes = parseClockMinutes(lastIn);
    const lastOutMinutes = parseClockMinutes(lastOut);
    const existing = groups.get(groupKey);

    if (existing) {
      const existingFirstIn = parseClockMinutes(existing.firstIn);
      const existingLastIn = parseClockMinutes(existing.lastIn);
      const existingLastOut = parseClockMinutes(existing.lastOut);
      const nextFirstIn = existingFirstIn === null || (firstInMinutes !== null && firstInMinutes < existingFirstIn)
        ? firstIn
        : existing.firstIn;
      const nextLastIn = existingLastIn === null || (lastInMinutes !== null && lastInMinutes > existingLastIn)
        ? lastIn
        : existing.lastIn;
      const nextLastOut = existingLastOut === null || (lastOutMinutes !== null && lastOutMinutes > existingLastOut)
        ? lastOut
        : existing.lastOut;
      const loginStart = parseClockMinutes(nextFirstIn);
      const loginEnd = parseClockMinutes(nextLastOut);
      const totalLoginMinutes = loginStart !== null && loginEnd !== null && loginEnd >= loginStart
        ? loginEnd - loginStart
        : parseDurationMinutes(existing.totalLoginTime);

      groups.set(groupKey, {
        ...existing,
        totalIn: String(Number(existing.totalIn || 0) + (firstIn ? 1 : 0)),
        totalOut: String(Number(existing.totalOut || 0) + (lastOut ? 1 : 0)),
        firstIn: nextFirstIn,
        lastIn: nextLastIn,
        lastOut: nextLastOut,
        totalLoginTime: formatDuration(totalLoginMinutes),
      });
      return;
    }

    const totalLoginMinutes = firstInMinutes !== null && lastOutMinutes !== null && lastOutMinutes >= firstInMinutes
      ? lastOutMinutes - firstInMinutes
      : parseDurationMinutes(getValue('totalLoginTime'));

    groups.set(groupKey, {
      originalIndex: index,
      sNo: groups.size + 1,
      employeeCode,
      employeeName,
      totalIn: firstIn ? '1' : '',
      totalOut: lastOut ? '1' : '',
      firstIn,
      lastIn,
      lastOut,
      totalLoginTime: formatDuration(totalLoginMinutes),
      totalBreakTime: getValue('totalBreakTime'),
    });
  });

  return Array.from(groups.values());
}

async function readAttendanceFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const sheetRows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: false,
  });

  return buildReportRows(sheetRows);
}

export default function UploadWorkspace() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  async function processFile(file) {
    if (!file) {
      return;
    }

    setError('');
    setIsProcessing(true);
    setRows([]);
    setUploadProgress(100);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      const parsedRows = await readAttendanceFile(file);
      setRows(parsedRows);
    } catch {
      setError('Unable to process this file. Please upload a valid .xls, .xlsx, or .csv attendance export.');
    } finally {
      setIsProcessing(false);
    }
  }

  function handleFileSelect(file) {
    if (!file) {
      return;
    }

    setSelectedFile(file);
    setUploadProgress(100);
    setRows([]);
    setError('');
  }

  function resetUpload() {
    setSelectedFile(null);
    setUploadProgress(0);
    setIsProcessing(false);
    setRows([]);
    setError('');
  }

  if (isProcessing || rows.length) {
    return (
      <ProcessedAttendancePreview
        rows={rows}
        isProcessing={isProcessing}
        fileName={selectedFile?.name}
        onReset={resetUpload}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-gutter mb-xl fade-in">
        <UploadCard
          selectedFile={selectedFile}
          uploadProgress={uploadProgress}
          isProcessing={isProcessing}
          onFileSelect={handleFileSelect}
          onClearFile={resetUpload}
          onProcess={() => processFile(selectedFile)}
        />
        <GuidelinesCard />
      </div>

      {error ? (
        <div className="mb-lg bg-error-container text-on-error-container border border-error/20 rounded-lg p-md font-body-sm text-body-sm">
          {error}
        </div>
      ) : null}

      <ProcessedAttendancePreview rows={[]} isProcessing={false} />
    </>
  );
}
