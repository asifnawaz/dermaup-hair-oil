/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 5847.
 */

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { subscribers } from '@/lib/db/schema';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as { isActive?: unknown };
    const d1 = getD1();

    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'DB unavailable' },
        { status: 503 },
      );
    }

    const updates: { isActive?: boolean } = {};
    if (typeof body.isActive === 'boolean') {
      updates.isActive = body.isActive;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 },
      );
    }

    await getDb(d1)
      .update(subscribers)
      .set(updates)
      .where(eq(subscribers.id, id));

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Subscriber update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subscriber' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const d1 = getD1();

    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'DB unavailable' },
        { status: 503 },
      );
    }

    await getDb(d1)
      .delete(subscribers)
      .where(eq(subscribers.id, id));
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Subscriber delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscriber' },
      { status: 500 },
    );
  }
}
