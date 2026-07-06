import * as XLSX from 'xlsx';

const headerAliases = {
  employeeCode: ['employee code', 'employeecode', 'emp code', 'emp id', 'employee id', 'staff code', 'staff id'],
  employeeName: ['employee name', 'employeename', 'emp name', 'staff name', 'full name'],
  department: ['department', 'dept', 'department name'],
  reportingPerson: ['reporting person', 'reportingperson', 'reporting to', 'report to', 'reporting manager', 'reports to', 'manager', 'supervisor', 'team lead'],
  hodEmail: ['hod email', 'hodemail', 'hod e-mail', 'hod e mail', 'head of department email', 'hod mail', 'hod email id', 'department head email', 'head email'],
};

export function normalizeHeader(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesHeader(header, alias) {
  const normalizedAlias = normalizeHeader(alias);

  if (!header || !normalizedAlias) {
    return false;
  }

  return header === normalizedAlias || header.includes(normalizedAlias) || normalizedAlias.includes(header);
}

export function cellToString(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(cellToString).filter(Boolean).join(' ').trim();
    }

    if (value.w) {
      return String(value.w).trim();
    }

    if (value.text) {
      return String(value.text).trim();
    }

    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text || '').join('').trim();
    }

    if (value.v !== undefined && value.v !== null) {
      return cellToString(value.v);
    }

    if (value.h) {
      return String(value.h).trim();
    }

    return '';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (Number.isInteger(value)) {
      return String(value);
    }

    return String(value).replace(/\.0+$/, '');
  }

  return String(value).trim();
}

function findColumnIndex(headers, key) {
  const aliases = headerAliases[key];
  if (!aliases) {
    return -1;
  }

  const normalizedAliases = aliases
    .map(normalizeHeader)
    .sort((left, right) => right.length - left.length);

  for (const alias of normalizedAliases) {
    const exactIndex = headers.findIndex((header) => header === alias);
    if (exactIndex >= 0) {
      return exactIndex;
    }
  }

  for (const alias of normalizedAliases) {
    if (alias.length < 4) {
      continue;
    }

    const partialIndex = headers.findIndex((header) => matchesHeader(header, alias));
    if (partialIndex >= 0) {
      return partialIndex;
    }
  }

  return -1;
}

function isHeaderRow(row) {
  const normalized = (row || []).map(normalizeHeader);
  const employeeCodeIndex = findColumnIndex(normalized, 'employeeCode');
  const employeeNameIndex = findColumnIndex(normalized, 'employeeName');

  return employeeCodeIndex >= 0 && employeeNameIndex >= 0 && employeeCodeIndex !== employeeNameIndex;
}

function findFallbackEmailColumn(headers, usedIndices) {
  const candidates = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header, index }) => !usedIndices.has(index) && (header.includes('email') || header.includes('mail')));

  if (candidates.length === 1) {
    return candidates[0].index;
  }

  return -1;
}

function getCell(row, index) {
  if (index < 0 || !Array.isArray(row)) {
    return '';
  }

  return cellToString(row[index]);
}

export function parseEmployeeRows(rows) {
  if (!Array.isArray(rows) || rows.length < 2) {
    throw new Error('The file must contain a header row and at least one data row.');
  }

  const headerIndex = rows.findIndex((row) => isHeaderRow(row));

  if (headerIndex === -1) {
    throw new Error('Could not find required headers: Employee Code and Employee Name.');
  }

  const headers = rows[headerIndex].map(normalizeHeader);
  const columnMap = {
    employeeCode: findColumnIndex(headers, 'employeeCode'),
    employeeName: findColumnIndex(headers, 'employeeName'),
    department: findColumnIndex(headers, 'department'),
    reportingPerson: findColumnIndex(headers, 'reportingPerson'),
    hodEmail: findColumnIndex(headers, 'hodEmail'),
  };

  if (columnMap.hodEmail < 0) {
    const usedIndices = new Set(Object.values(columnMap).filter((index) => index >= 0));
    columnMap.hodEmail = findFallbackEmailColumn(headers, usedIndices);
  }

  const employees = [];

  for (let i = headerIndex + 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row || row.every((cell) => !cellToString(cell))) {
      continue;
    }

    const employee = {
      employeeCode: getCell(row, columnMap.employeeCode),
      employeeName: getCell(row, columnMap.employeeName),
      department: getCell(row, columnMap.department),
      reportingPerson: getCell(row, columnMap.reportingPerson),
      hodEmail: getCell(row, columnMap.hodEmail),
    };

    if (employee.employeeCode || employee.employeeName) {
      employees.push(employee);
    }
  }

  if (employees.length === 0) {
    throw new Error('No employee rows found in the uploaded file.');
  }

  return {
    employees,
    columnMap,
    headers,
    headerIndex,
  };
}

export function parseEmployeeWorkbook(buffer) {
  const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });

  return parseEmployeeRows(rows);
}

export function parseEmployeeFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result = parseEmployeeWorkbook(event.target.result);
        resolve(result);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to parse the Excel file.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsArrayBuffer(file);
  });
}

export function summarizeSkipReasons(skipped = []) {
  const counts = new Map();

  for (const item of skipped) {
    const reason = item.reason || 'Unknown error';
    counts.set(reason, (counts.get(reason) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([reason, count]) => ({ reason, count }));
}

export function formatImportError(createdCount, skipped = []) {
  const skippedCount = skipped.length;

  if (createdCount > 0 || skippedCount === 0) {
    return '';
  }

  const summary = summarizeSkipReasons(skipped);
  const reasonLines = summary
    .slice(0, 4)
    .map(({ reason, count }) => `${reason} (${count} row${count === 1 ? '' : 's'})`)
    .join('; ');

  return `No employees were imported. ${skippedCount} row${skippedCount === 1 ? '' : 's'} skipped.${reasonLines ? ` Issues: ${reasonLines}.` : ''}`;
}
