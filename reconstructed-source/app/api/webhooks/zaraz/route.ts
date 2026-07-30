/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the latest deployed /api/webhooks/zaraz route module and
 * cross-checked against the surviving route signature and call evidence.
 */

import { NextRequest, NextResponse } from 'next/server';

import { generateId, getD1, getDb } from '@/lib/db';
import { analyticsEvents } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const { eventType, eventData, sessionId } = (await request.json()) as {
      eventType?: unknown;
      eventData?: unknown;
      sessionId?: unknown;
    };

    if (!eventType) {
      return NextResponse.json(
        { success: false, error: 'eventType is required' },
        { status: 400 },
      );
    }

    const d1 = getD1();

    if (!d1) {
      console.log('[Analytics Event]', eventType, eventData);
      return NextResponse.json({ success: true, stored: false });
    }

    const db = getDb(d1);
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipCountry = request.headers.get('cf-ipcountry') || undefined;

    await db.insert(analyticsEvents).values({
      id: generateId('evt'),
      eventType: eventType as string,
      eventData: eventData ? JSON.stringify(eventData) : null,
      sessionId: (sessionId as string) || null,
      userAgent,
      ipCountry,
    });

    return NextResponse.json({ success: true, stored: true });
  } catch (error) {
    console.error('Zaraz webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store event' },
      { status: 500 },
    );
  }
}
