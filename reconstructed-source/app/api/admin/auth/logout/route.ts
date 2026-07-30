/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 21088.
 */

import { NextResponse } from 'next/server';

import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
}
