/**
 * RECONSTRUCTED SOURCE
 * Exact deployed route behavior recovered from the production Worker.
 */

import { eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';
import { safeJsonParse } from '@/lib/json';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  const d1 = getD1();
  if (!d1) {
    return NextResponse.json(
      { success: false, error: 'DB not available' },
      { status: 500 },
    );
  }

  const db = getDb(d1);
  const rows = await db.select().from(siteSettings).all();
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    result[row.key] = safeJsonParse(row.value, row.value);
  }

  return NextResponse.json({ success: true, data: result });
}

export async function PUT(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  const d1 = getD1();
  if (!d1) {
    return NextResponse.json(
      { success: false, error: 'DB not available' },
      { status: 500 },
    );
  }

  const db = getDb(d1);
  const body = (await request.json()) as Record<string, unknown>;
  const updatedAt = new Date().toISOString();

  for (const [key, rawValue] of Object.entries(body)) {
    const value =
      typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue);
    const existing = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .get();

    if (existing) {
      await db
        .update(siteSettings)
        .set({ value, updatedAt })
        .where(eq(siteSettings.key, key));
    } else {
      await db.insert(siteSettings).values({ key, value, updatedAt });
    }
  }

  revalidateTag('settings');
  return NextResponse.json({ success: true });
}
