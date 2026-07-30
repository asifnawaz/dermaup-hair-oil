/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 53769.
 */

import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { generateId, getD1, getDb } from '@/lib/db';
import { orderActivity, orders } from '@/lib/db/schema';

type BulkAction = 'confirm' | 'cancel';

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    const { ids, action } = (await request.json()) as {
      ids?: unknown;
      action?: unknown;
    };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No order IDs provided' },
        { status: 400 },
      );
    }

    const validActions: BulkAction[] = ['confirm', 'cancel'];
    if (
      typeof action !== 'string' ||
      !validActions.includes(action as BulkAction)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid action. Must be one of: ${validActions.join(', ')}`,
        },
        { status: 400 },
      );
    }

    const d1 = getD1();
    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'DB unavailable' },
        { status: 503 },
      );
    }

    const db = getDb(d1);
    const typedAction = action as BulkAction;
    const actionMap = {
      confirm: 'confirmed',
      cancel: 'cancelled',
    } as const;
    const newStatus = actionMap[typedAction];
    let updated = 0;

    for (const id of ids) {
      if (typeof id !== 'string') continue;

      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .get();
      const isAllowed =
        order &&
        (typedAction !== 'confirm' || order.orderStatus === 'pending') &&
        (typedAction !== 'cancel' ||
          (order.orderStatus !== 'delivered' &&
            order.orderStatus !== 'cancelled'));

      if (!isAllowed) continue;

      await db
        .update(orders)
        .set({
          orderStatus: newStatus,
          updatedAt: sql`datetime('now')`,
        })
        .where(eq(orders.id, id));
      await db.insert(orderActivity).values({
        id: generateId('act'),
        orderId: id,
        action: newStatus,
        details: JSON.stringify({ bulkAction: true }),
        performedBy: session.id,
      });
      updated += 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        updated,
        total: ids.length,
        action: newStatus,
      },
    });
  } catch (error) {
    console.error('Bulk order action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process bulk action' },
      { status: 500 },
    );
  }
}
