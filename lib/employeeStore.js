 import { neon } from '@neondatabase/serverless';

let sqlClient = null;
let schemaReady = false;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not configured');
  }

  return url;
}

function getSql() {
  if (!sqlClient) {
    sqlClient = neon(getDatabaseUrl());
  }

  return sqlClient;
}

async function ensureSchema() {
  if (schemaReady) {
    return;
  }

  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS employees (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_code TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      department TEXT NOT NULL,
      reporting_person TEXT NOT NULL,
      hod_email TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS employees_employee_code_unique
    ON employees (LOWER(employee_code))
  `;

  schemaReady = true;
}

export function normalizeEmployeeInput(input) {
  return {
    employeeCode: String(input.employeeCode || '').trim(),
    employeeName: String(input.employeeName || '').trim(),
    department: String(input.department || '').trim(),
    reportingPerson: String(input.reportingPerson || '').trim(),
    hodEmail: normalizeEmail(input.hodEmail),
  };
}

export function normalizeEmail(value) {
  let raw = String(value || '').trim();

  if (!raw) {
    return '';
  }

  const bracketMatch = raw.match(/<([^>]+)>/);
  if (bracketMatch) {
    raw = bracketMatch[1].trim();
  }

  raw = raw.replace(/^mailto:/i, '').trim();
  raw = raw.split(/[,;]/)[0].trim();
  return raw.toLowerCase();
}

export function validateEmployee(data) {
  const errors = [];

  if (!data.employeeCode) {
    errors.push('Employee Code is required');
  }
  if (!data.employeeName) {
    errors.push('Employee Name is required');
  }
  if (!data.department) {
    errors.push('Department is required');
  }
  if (!data.reportingPerson) {
    errors.push('Reporting Person is required');
  }
  if (!data.hodEmail) {
    errors.push('HOD Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.hodEmail)) {
    errors.push('HOD Email must be a valid email address');
  }

  return errors;
}

function toIsoString(value) {
  if (!value) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}

function mapRowToEmployee(row) {
  return {
    id: String(row.id),
    employeeCode: row.employee_code,
    employeeName: row.employee_name,
    department: row.department,
    reportingPerson: row.reporting_person,
    hodEmail: row.hod_email,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export async function getAllEmployees() {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`SELECT * FROM employees ORDER BY employee_name ASC`;
  return rows.map(mapRowToEmployee);
}

export async function getEmployeeById(id) {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`SELECT * FROM employees WHERE id = ${id}`;
  return rows.length > 0 ? mapRowToEmployee(rows[0]) : null;
}

export async function createEmployee(input) {
  await ensureSchema();
  const sql = getSql();
  const data = normalizeEmployeeInput(input);
  const errors = validateEmployee(data);

  if (errors.length > 0) {
    return { error: errors.join(', ') };
  }

  const existing = await sql`SELECT id FROM employees WHERE LOWER(employee_code) = LOWER(${data.employeeCode})`;
  if (existing.length > 0) {
    return { error: `Employee Code "${data.employeeCode}" already exists` };
  }

  const rows = await sql`
    INSERT INTO employees (employee_code, employee_name, department, reporting_person, hod_email)
    VALUES (${data.employeeCode}, ${data.employeeName}, ${data.department}, ${data.reportingPerson}, ${data.hodEmail})
    RETURNING *
  `;

  return { employee: mapRowToEmployee(rows[0]) };
}

export async function bulkCreateEmployees(inputs) {
  await ensureSchema();
  const sql = getSql();
  const created = [];
  const skipped = [];

  const existingRows = await sql`SELECT employee_code FROM employees`;
  const existingCodes = new Set(existingRows.map((row) => row.employee_code.toLowerCase()));

  for (const input of inputs) {
    const data = normalizeEmployeeInput(input);
    const errors = validateEmployee(data);

    if (errors.length > 0) {
      skipped.push({ employeeCode: data.employeeCode || '(empty)', reason: errors.join(', ') });
      continue;
    }

    if (existingCodes.has(data.employeeCode.toLowerCase())) {
      skipped.push({ employeeCode: data.employeeCode, reason: 'Employee Code already exists' });
      continue;
    }

    try {
      const rows = await sql`
        INSERT INTO employees (employee_code, employee_name, department, reporting_person, hod_email)
        VALUES (${data.employeeCode}, ${data.employeeName}, ${data.department}, ${data.reportingPerson}, ${data.hodEmail})
        RETURNING *
      `;
      created.push(mapRowToEmployee(rows[0]));
      existingCodes.add(data.employeeCode.toLowerCase());
    } catch {
      skipped.push({ employeeCode: data.employeeCode, reason: 'Database error inserting row' });
    }
  }

  return { created, skipped };
}

export async function updateEmployee(id, input) {
  await ensureSchema();
  const sql = getSql();
  const data = normalizeEmployeeInput(input);
  const errors = validateEmployee(data);

  if (errors.length > 0) {
    return { error: errors.join(', ') };
  }

  const existing = await sql`SELECT id FROM employees WHERE id = ${id}`;
  if (existing.length === 0) {
    return { error: 'Employee not found' };
  }

  const duplicate = await sql`SELECT id FROM employees WHERE LOWER(employee_code) = LOWER(${data.employeeCode}) AND id != ${id}`;
  if (duplicate.length > 0) {
    return { error: `Employee Code "${data.employeeCode}" already exists` };
  }

  const rows = await sql`
    UPDATE employees
    SET employee_code = ${data.employeeCode},
        employee_name = ${data.employeeName},
        department = ${data.department},
        reporting_person = ${data.reportingPerson},
        hod_email = ${data.hodEmail},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;

  return { employee: mapRowToEmployee(rows[0]) };
}

export async function deleteEmployee(id) {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    DELETE FROM employees WHERE id = ${id} RETURNING *
  `;

  if (rows.length === 0) {
    return { error: 'Employee not found' };
  }

  return { employee: mapRowToEmployee(rows[0]) };
}
