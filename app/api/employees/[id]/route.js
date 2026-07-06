import { NextResponse } from 'next/server';
import { deleteEmployee, getEmployeeById, updateEmployee } from '@/lib/employeeStore';

function verifyOrigin(request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (origin && host && !origin.includes(host)) {
    return false;
  }

  return true;
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const employee = await getEmployeeById(id);

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ employee });
  } catch (error) {
    console.error('[ERROR] Failed to fetch employee:', error);
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    if (!verifyOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const result = await updateEmployee(id, body);

    if (result.error) {
      const status = result.error === 'Employee not found' ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ employee: result.employee });
  } catch (error) {
    console.error('[ERROR] Failed to update employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!verifyOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const result = await deleteEmployee(id);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ employee: result.employee });
  } catch (error) {
    console.error('[ERROR] Failed to delete employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
