import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  const pw = 'Admin@123';
  const hash = '$2b$10$i6hh8LpMapGExPVZtN8BEOdQrvJScN80RU6LIdIHkVvpKoIupLh0S';
  const match = await bcrypt.compare(pw, hash);
  return NextResponse.json({ match });
}
