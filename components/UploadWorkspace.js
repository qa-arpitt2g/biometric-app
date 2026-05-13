'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import ProcessedAttendancePreview from '@/components/ProcessedAttendancePreview';
import { GuidelinesCard, UploadCard } from '@/components/UploadSection';

const headerAliases = {
  employeeCode: ['employee code', 'employeecode', 'employee id', 'employeeid', 'emp code', 'emp id', 'emp no', 'employee no', 'enroll no', 'enrollment no', 'person id', 'personid', 'staff id', 'staff code', 'user id', 'userid', 'user no', 'code', 'id'],
  // NOTE: keep these specific; a generic alias like "employee" can match
  // "employee code" and incorrectly map the name column to the code column.
  employeeName: ['employeename', 'employee name', 'emp name', 'empname', 'person name', 'staff name', 'user name', 'username', 'name'],
  punchTimestamp: ['punch timestamp', 'punchtimestamp', 'punch time', 'punchtime', 'timestamp', 'date time', 'datetime', 'date/time', 'punch date time', 'punch datetime', 'attendance time', 'log time', 'log datetime', 'record time', 'event time', 'verify time', 'scan time'],
  punchDate: ['date', 'punch date', 'attendance date', 'log date', 'record date', 'event date', 'verify date'],
  // Avoid bare "time" — it matches unrelated columns like "A. InTime" on summary exports and breaks detection.
  punchTime: ['punch', 'punch time', 'log time', 'record time', 'event time', 'verify time', 'scan time'],
  punchType: ['in out', 'inout', 'in/out', 'i o', 'io', 'direction', 'status', 'punch type', 'punchtype', 'type', 'state'],
  punchRecords: ['punch records', 'punch record', 'punchrecords', 'raw punches', 'punches'],
};

const reportAliases = {
  sNo: ['s no', 'sno', 'sr no', 'serial no'],
  employeeCode: ['employee code', 'employeecode', 'emp code', 'employee id', 'emp id'],
  employeeName: ['employeename', 'employee name', 'emp name', 'name'],
  totalIn: ['total in', 'totalin'],
  totalOut: ['total out', 'totalout'],
  firstIn: ['first in', 'firstin'],
  lastIn: ['last in', 'lastin'],
  lastOut: ['last out', 'lastout'],
  totalLoginTime: ['total login time', 'totallogintime'],
  totalBreakTime: ['total break time', 'totalbreaktime'],
};

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function matchesHeader(header, alias) {
  return header === alias || header.includes(alias) || alias.includes(header);
}

function toCellValue(value) {
  if (value === undefined || value === null) {
    return '';
  }

  if (value instanceof Date) {
    return value;
  }

  return String(value).trim();
}

function findHeaderRow(rows) {
  return rows.findIndex((row) => {
    const normalized = row.map(normalizeHeader);
    const hasEmployee = headerAliases.employeeCode.some((alias) => normalized.some((header) => matchesHeader(header, alias)))
      || headerAliases.employeeName.some((alias) => normalized.some((header) => matchesHeader(header, alias)));
    const hasPunchTime = headerAliases.punchTimestamp.some((alias) => normalized.some((header) => matchesHeader(header, alias)))
      || headerAliases.punchTime.some((alias) => normalized.some((header) => matchesHeader(header, alias)));

    return hasEmployee && hasPunchTime;
  });
}

function findColumnIndex(headers, key) {
  const aliases = headerAliases[key];
  if (!aliases) {
    return -1;
  }

  return headers.findIndex((header) => aliases.some((alias) => matchesHeader(header, alias)));
}

function findReportColumnIndex(headers, key) {
  const aliases = reportAliases[key];
  return headers.findIndex((header) => aliases.some((alias) => matchesHeader(header, alias)));
}

function findProcessedReportHeaderRow(rows) {
  return rows.findIndex((row) => {
    const normalized = row.map(normalizeHeader);
    const requiredColumns = ['employeeCode', 'employeeName', 'totalIn', 'totalOut', 'firstIn', 'lastIn', 'lastOut', 'totalLoginTime', 'totalBreakTime'];

    return requiredColumns.every((key) => findReportColumnIndex(normalized, key) >= 0);
  });
}

function excelSerialToDate(serial) {
  const milliseconds = Math.round((Number(serial) - 25569) * 86400 * 1000);
  return new Date(milliseconds);
}

function parseDateOnly(value) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value || '').trim())) {
    return excelSerialToDate(value);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function combineDateAndTime(dateValue, timeValue) {
  const date = parseDateOnly(dateValue);

  if (!date) {
    return null;
  }

  if (timeValue instanceof Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeValue.getHours(), timeValue.getMinutes(), timeValue.getSeconds());
  }

  if (typeof timeValue === 'number' || /^\d+(\.\d+)?$/.test(String(timeValue || '').trim())) {
    const totalSeconds = Math.round((Number(timeValue) % 1) * 86400);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds);
  }

  return null;
}

function parseDateTime(value, dateValue = '') {
  const combinedDateTime = dateValue ? combineDateAndTime(dateValue, value) : null;

  if (combinedDateTime) {
    return combinedDateTime;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number') {
    return excelSerialToDate(value);
  }

  const text = String(value || '').trim();
  const dateText = dateValue instanceof Date ? formatDateKey(dateValue) : String(dateValue || '').trim();

  if (!text && !dateText) {
    return null;
  }

  if (/^\d+(\.\d+)?$/.test(text)) {
    return excelSerialToDate(text);
  }

  const combinedText = dateText && !text.match(/\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/)
    ? `${dateText} ${text}`
    : text;
  const parsed = new Date(combinedText);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const match = combinedText.match(/(?:(\d{1,2})[-/](\d{1,2})[-/](\d{2,4}))?.*?(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);

  if (!match) {
    return null;
  }

  const now = new Date();
  let day = Number(match[1] || now.getDate());
  let month = Number(match[2] || now.getMonth() + 1);
  let year = Number(match[3] || now.getFullYear());
  let hours = Number(match[4]);
  const minutes = Number(match[5]);
  const seconds = Number(match[6] || 0);
  const meridiem = match[7]?.toUpperCase();

  if (year < 100) {
    year += 2000;
  }

  if (month > 12 && day <= 12) {
    [day, month] = [month, day];
  }

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }

  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return new Date(year, month - 1, day, hours, minutes, seconds);
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatClock(date) {
  if (!(date instanceof Date)) {
    return '';
  }

  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatClockHm(date) {
  if (!(date instanceof Date)) {
    return '';
  }

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateKey(date) {
  if (!(date instanceof Date)) {
    return '';
  }

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function getPunchDirection(index) {
  return index % 2 === 0 ? 'IN' : 'OUT';
}

function normalizePunchType(raw) {
  const compact = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');

  if (compact === 'IN' || compact === 'I') {
    return 'IN';
  }

  if (compact === 'OUT' || compact === 'O') {
    return 'OUT';
  }

  if (compact === 'CHECKIN' || compact === 'C/IN') {
    return 'IN';
  }

  if (compact === 'CHECKOUT' || compact === 'C/OUT') {
    return 'OUT';
  }

  return '';
}

function resolvePunchDirections(punches) {
  return punches.map((punch, index) => {
    const resolved = normalizePunchType(punch.punchType);

    if (resolved) {
      return resolved;
    }

    return getPunchDirection(index);
  });
}

function parsePunchRecordsTokens(text, dateParsed) {
  const base = dateParsed instanceof Date && !Number.isNaN(dateParsed.getTime()) ? dateParsed : null;
  const results = [];
  const re = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*\(\s*(in|out)\s*\)/gi;
  let match = re.exec(String(text || ''));

  while (match !== null) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3] || 0);
    const direction = match[4].toUpperCase() === 'IN' ? 'IN' : 'OUT';
    let timestamp;

    if (base) {
      timestamp = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes, seconds);
    } else {
      const now = new Date();
      timestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
    }

    results.push({ timestamp, direction });
    match = re.exec(String(text || ''));
  }

  return results;
}

function findPunchRecordsSummaryHeaderRow(rows) {
  return rows.findIndex((row) => {
    const normalized = row.map(normalizeHeader);
    const punchRecordsIndex = findColumnIndex(normalized, 'punchRecords');
    const hasEmployee = findColumnIndex(normalized, 'employeeCode') >= 0
      || findColumnIndex(normalized, 'employeeName') >= 0;

    return punchRecordsIndex >= 0 && hasEmployee;
  });
}

function buildAttendanceReportFromPunchRecordsExport(sheetRows) {
  const headerIndex = findPunchRecordsSummaryHeaderRow(sheetRows);

  if (headerIndex === -1) {
    return null;
  }

  const headers = sheetRows[headerIndex].map(normalizeHeader);
  const columnMap = {
    employeeCode: findColumnIndex(headers, 'employeeCode'),
    employeeName: findColumnIndex(headers, 'employeeName'),
    punchRecords: findColumnIndex(headers, 'punchRecords'),
    punchDate: findColumnIndex(headers, 'punchDate'),
  };

  if (columnMap.punchRecords < 0 || (columnMap.employeeCode < 0 && columnMap.employeeName < 0)) {
    return null;
  }

  const reportRows = [];

  sheetRows.slice(headerIndex + 1).forEach((row) => {
    if (!row.some((cell) => String(cell || '').trim())) {
      return;
    }

    const employeeCode = columnMap.employeeCode >= 0 ? toCellValue(row[columnMap.employeeCode]) : '';
    const employeeName = columnMap.employeeName >= 0 ? toCellValue(row[columnMap.employeeName]) : '';

    if (!employeeCode && !employeeName) {
      return;
    }

    const dateValue = columnMap.punchDate >= 0 ? row[columnMap.punchDate] : '';
    const dateParsed = parseDateOnly(dateValue);
    const dateKey = dateParsed ? formatDateKey(dateParsed) : '';
    const punchRecordsRaw = toCellValue(row[columnMap.punchRecords]);
    const tokens = parsePunchRecordsTokens(punchRecordsRaw, dateParsed);
    const punches = tokens.map((entry, index) => ({
      timestamp: entry.timestamp,
      punchType: entry.direction,
      sourceOrder: index,
    }));

    reportRows.push({
      employeeCode: employeeCode || employeeName,
      employeeName,
      dateKey,
      punches,
    });
  });

  return reportRows.map((group, groupIndex) => summarizeAttendanceGroup(group, groupIndex));
}

function summarizeAttendanceGroup(group, groupIndex) {
  const { employeeCode, employeeName, dateKey, punches: rawPunches } = group;
  const punches = [...rawPunches].sort((first, second) => {
    const delta = first.timestamp - second.timestamp;

    if (delta !== 0) {
      return delta;
    }

    return (first.sourceOrder ?? 0) - (second.sourceOrder ?? 0);
  });

  if (!punches.length) {
    return {
      originalIndex: groupIndex,
      sNo: groupIndex + 1,
      employeeCode,
      employeeName,
      totalIn: 0,
      totalOut: 0,
      firstIn: '',
      lastIn: '',
      lastOut: '',
      totalLoginTime: '00:00:00',
      totalBreakTime: '00:00:00',
      dateKey,
    };
  }

  const directions = resolvePunchDirections(punches);
  let totalIn = 0;
  let totalOut = 0;
  let firstIn = null;
  let lastIn = null;
  let lastOut = null;

  punches.forEach((punch, index) => {
    const direction = directions[index];

    if (direction === 'IN') {
      totalIn += 1;
      firstIn = firstIn || punch.timestamp;
      lastIn = punch.timestamp;

      return;
    }

    totalOut += 1;
    lastOut = punch.timestamp;
  });

  let totalLoginMs = 0;

  if (firstIn && lastOut && lastOut >= firstIn) {
    totalLoginMs = lastOut - firstIn;
  }

  let totalBreakMs = 0;
  let pendingOut = null;
  let seenIn = false;

  punches.forEach((punch, index) => {
    const direction = directions[index];

    if (direction === 'IN') {
      if (pendingOut !== null && seenIn && punch.timestamp > pendingOut) {
        totalBreakMs += punch.timestamp - pendingOut;
      }

      pendingOut = null;
      seenIn = true;

      return;
    }

    if (direction === 'OUT' && seenIn) {
      pendingOut = punch.timestamp;
    }
  });

  return {
    originalIndex: groupIndex,
    sNo: groupIndex + 1,
    employeeCode,
    employeeName,
    totalIn,
    totalOut,
    firstIn: formatClockHm(firstIn),
    lastIn: formatClockHm(lastIn),
    lastOut: formatClockHm(lastOut),
    totalLoginTime: formatDuration(totalLoginMs),
    totalBreakTime: formatDuration(totalBreakMs),
    dateKey,
  };
}

function isLikelyDateTime(value) {
  return Boolean(parseDateTime(value));
}

function countMatches(rows, columnIndex, matcher) {
  return rows.reduce((count, row) => count + (matcher(row[columnIndex]) ? 1 : 0), 0);
}

function buildAttendanceReport(logs) {
  const groups = new Map();

  logs.forEach((log) => {
    const groupKey = `${log.employeeCode}__${formatDateKey(log.timestamp)}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        employeeCode: log.employeeCode,
        employeeName: log.employeeName,
        dateKey: formatDateKey(log.timestamp),
        punches: [],
      });
    }

    groups.get(groupKey).punches.push({
      timestamp: log.timestamp,
      punchType: log.punchType,
      sourceOrder: log.sourceOrder,
    });
  });

  return Array.from(groups.values()).map((group, groupIndex) => summarizeAttendanceGroup(group, groupIndex));
}

function extractPunchLogs(sheetRows) {
  const headerIndex = findHeaderRow(sheetRows);

  if (headerIndex === -1) {
    return inferPunchLogs(sheetRows);
  }

  const headers = sheetRows[headerIndex].map(normalizeHeader);
  const columnMap = {
    employeeCode: findColumnIndex(headers, 'employeeCode'),
    employeeName: findColumnIndex(headers, 'employeeName'),
    punchTimestamp: findColumnIndex(headers, 'punchTimestamp'),
    punchDate: findColumnIndex(headers, 'punchDate'),
    punchTime: findColumnIndex(headers, 'punchTime'),
    punchType: findColumnIndex(headers, 'punchType'),
  };

  if (columnMap.employeeCode === -1 && columnMap.employeeName === -1) {
    throw new Error('Missing employee identity columns.');
  }

  if (columnMap.punchTimestamp === -1 && columnMap.punchTime === -1) {
    throw new Error('Missing punch timestamp columns.');
  }

  return sheetRows.slice(headerIndex + 1).map((row, rowIndex) => {
    const employeeCode = toCellValue(row[columnMap.employeeCode]);
    const employeeName = toCellValue(row[columnMap.employeeName]);
    const timestampValue = columnMap.punchTimestamp >= 0 ? row[columnMap.punchTimestamp] : row[columnMap.punchTime];
    const dateValue = columnMap.punchDate >= 0 ? row[columnMap.punchDate] : '';
    const timestamp = parseDateTime(timestampValue, dateValue);

    if (!timestamp || (!employeeCode && !employeeName)) {
      return null;
    }

    return {
      employeeCode: employeeCode || employeeName,
      employeeName,
      timestamp,
      punchType: columnMap.punchType >= 0 ? toCellValue(row[columnMap.punchType]) : '',
      sourceOrder: rowIndex,
    };
  }).filter(Boolean);
}

function extractProcessedReportRows(sheetRows) {
  const headerIndex = findProcessedReportHeaderRow(sheetRows);

  if (headerIndex === -1) {
    return null;
  }

  const headers = sheetRows[headerIndex].map(normalizeHeader);
  const columnMap = {
    sNo: findReportColumnIndex(headers, 'sNo'),
    employeeCode: findReportColumnIndex(headers, 'employeeCode'),
    employeeName: findReportColumnIndex(headers, 'employeeName'),
    totalIn: findReportColumnIndex(headers, 'totalIn'),
    totalOut: findReportColumnIndex(headers, 'totalOut'),
    firstIn: findReportColumnIndex(headers, 'firstIn'),
    lastIn: findReportColumnIndex(headers, 'lastIn'),
    lastOut: findReportColumnIndex(headers, 'lastOut'),
    totalLoginTime: findReportColumnIndex(headers, 'totalLoginTime'),
    totalBreakTime: findReportColumnIndex(headers, 'totalBreakTime'),
  };

  // Guard against false positives: some biometric summary exports may contain a
  // header-like row, but no computed values in these columns. In that case we
  // want to fall back to parsing Punch Records / raw logs instead of returning
  // a blank report.
  const probeRows = sheetRows.slice(headerIndex + 1, headerIndex + 31).filter((row) => row.some((cell) => String(cell || '').trim()));
  const hasComputedData = probeRows.some((row) => {
    const values = [
      row[columnMap.totalIn],
      row[columnMap.totalOut],
      row[columnMap.firstIn],
      row[columnMap.lastIn],
      row[columnMap.lastOut],
      row[columnMap.totalLoginTime],
      row[columnMap.totalBreakTime],
    ];

    return values.some((value) => String(value || '').trim());
  });

  if (!hasComputedData) {
    return null;
  }

  return sheetRows.slice(headerIndex + 1)
    .filter((row) => row.some((cell) => String(cell || '').trim()))
    .map((row, index) => ({
      originalIndex: index,
      sNo: toCellValue(row[columnMap.sNo]) || index + 1,
      employeeCode: toCellValue(row[columnMap.employeeCode]),
      employeeName: toCellValue(row[columnMap.employeeName]),
      totalIn: toCellValue(row[columnMap.totalIn]),
      totalOut: toCellValue(row[columnMap.totalOut]),
      firstIn: toCellValue(row[columnMap.firstIn]),
      lastIn: toCellValue(row[columnMap.lastIn]),
      lastOut: toCellValue(row[columnMap.lastOut]),
      totalLoginTime: toCellValue(row[columnMap.totalLoginTime]),
      totalBreakTime: toCellValue(row[columnMap.totalBreakTime]),
    }));
}

function inferPunchLogs(sheetRows) {
  const dataRows = sheetRows.filter((row) => row.some((cell) => String(cell || '').trim()));
  const maxColumns = Math.max(...dataRows.map((row) => row.length));
  const sampleRows = dataRows.slice(0, 60);
  const columnScores = Array.from({ length: maxColumns }, (_, columnIndex) => ({
    columnIndex,
    dateTimeScore: countMatches(sampleRows, columnIndex, isLikelyDateTime),
    textScore: countMatches(sampleRows, columnIndex, (value) => {
      const text = String(value || '').trim();
      return text.length > 1 && !isLikelyDateTime(value) && !/^\d+(\.\d+)?$/.test(text);
    }),
    idScore: countMatches(sampleRows, columnIndex, (value) => {
      const text = String(value || '').trim();
      return text.length > 0 && !isLikelyDateTime(value);
    }),
  }));
  const punchColumn = columnScores
    .filter((column) => column.dateTimeScore > 0)
    .sort((first, second) => second.dateTimeScore - first.dateTimeScore)[0]?.columnIndex;

  if (punchColumn === undefined) {
    throw new Error('Could not detect a punch timestamp column in this file.');
  }

  const nameColumn = columnScores
    .filter((column) => column.columnIndex !== punchColumn && column.textScore > 0)
    .sort((first, second) => second.textScore - first.textScore)[0]?.columnIndex;
  const codeColumn = columnScores
    .filter((column) => column.columnIndex !== punchColumn && column.columnIndex !== nameColumn && column.idScore > 0)
    .sort((first, second) => second.idScore - first.idScore)[0]?.columnIndex;

  if (codeColumn === undefined && nameColumn === undefined) {
    throw new Error('Could not detect employee code or employee name columns in this file.');
  }

  return dataRows.map((row, rowIndex) => {
    const timestamp = parseDateTime(row[punchColumn]);
    const employeeCode = codeColumn !== undefined ? toCellValue(row[codeColumn]) : '';
    const employeeName = nameColumn !== undefined ? toCellValue(row[nameColumn]) : '';

    if (!timestamp || (!employeeCode && !employeeName)) {
      return null;
    }

    return {
      employeeCode: employeeCode || employeeName,
      employeeName,
      timestamp,
      punchType: '',
      sourceOrder: rowIndex,
    };
  }).filter(Boolean);
}

async function readAttendanceFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const sheetRows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: true,
    defval: '',
    blankrows: false,
  });
  const processedReportRows = extractProcessedReportRows(sheetRows);

  if (processedReportRows) {
    return processedReportRows;
  }

  const punchRecordsReport = buildAttendanceReportFromPunchRecordsExport(sheetRows);

  if (punchRecordsReport) {
    return punchRecordsReport;
  }

  const logs = extractPunchLogs(sheetRows);

  if (!logs.length) {
    throw new Error('No valid punch rows found in this file.');
  }

  return buildAttendanceReport(logs);
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
    } catch (processingError) {
      setError(processingError.message || 'Unable to process this file. Please upload a valid biometric punch export.');
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
