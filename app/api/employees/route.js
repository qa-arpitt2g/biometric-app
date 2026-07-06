import { NextResponse } from 'next/server';
import {
  bulkCreateEmployees,
  createEmployee,
  getAllEmployees,
} from '@/lib/employeeStore';

function verifyOrigin(request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (origin && host && !origin.includes(host)) {
    return false;
  }

  return true;
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database is not configured. Set DATABASE_URL in your environment variables.' },
        { status: 503 }
      );
    }

    const employees = await getAllEmployees();
    return NextResponse.json({ employees });
  } catch (error) {
    console.error('[ERROR] Failed to fetch employees:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch employees';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!verifyOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (Array.isArray(body.employees)) {
      const result = await bulkCreateEmployees(body.employees);
      return NextResponse.json(result, { status: 201 });
    }

    const result = await createEmployee(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ employee: result.employee }, { status: 201 });
  } catch (error) {
    console.error('[ERROR] Failed to create employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
