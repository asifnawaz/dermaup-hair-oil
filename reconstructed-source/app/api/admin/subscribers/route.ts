/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 38908.
 */

import { and, count, desc, eq, like, or, type SQL } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import {
  subscribers,
  type SubscriberSource,
} from '@/lib/db/schema';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!requireAuth(session)) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const source = searchParams.get('source') || '';
    const offset = (page - 1) * limit;
    const d1 = getD1();

    if (!d1) {
      return NextResponse.json({
        success: true,
        data: {
          subscribers: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        },
      });
    }

    const db = getDb(d1);
    const conditions: SQL[] = [];

    if (search) {
      const searchCondition = or(
        like(subscribers.email, `%${search}%`),
        like(subscribers.name, `%${search}%`),
        like(subscribers.phone, `%${search}%`),
      );
      if (searchCondition) conditions.push(searchCondition);
    }
    if (source) {
      conditions.push(
        eq(subscribers.source, source as SubscriberSource),
      );
    }

    const where =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
          ? conditions[0]
          : and(...conditions);

    const countQuery = db.select({ count: count() }).from(subscribers);
    const countResult = where
      ? await countQuery.where(where).get()
      : await countQuery.get();
    const total = countResult?.count || 0;

    const listQuery = db.select().from(subscribers);
    const rows = await (where ? listQuery.where(where) : listQuery)
      .orderBy(desc(subscribers.subscribedAt))
      .limit(limit)
      .offset(offset)
      .all();

    return NextResponse.json({
      success: true,
      data: {
        subscribers: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Subscribers list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscribers' },
      { status: 500 },
    );
  }
}
