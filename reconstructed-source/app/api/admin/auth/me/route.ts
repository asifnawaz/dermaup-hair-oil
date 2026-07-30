/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 83444.
 */

import { NextResponse } from 'next/server';

import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);

  return session
    ? NextResponse.json({ success: true, data: { user: session } })
    : NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 },
      );
}
