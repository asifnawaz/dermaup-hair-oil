/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the latest deployed /api/track route module and checked
 * against the surviving source index. Raw-body validation and cookie behavior
 * intentionally match production.
 */

import { NextRequest, NextResponse } from 'next/server';

import { generateId, getD1, getDb } from '@/lib/db';
import { analyticsEvents } from '@/lib/db/schema';

// Get or create session ID.
function getSessionId(request: NextRequest): string {
  const existingSession = request.cookies.get('upderma_session')?.value;
  return (
    existingSession ||
    `ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  );
}

export async function POST(request: NextRequest) {
  try {
    let body: {
      event?: unknown;
      properties?: unknown;
    };
    const rawBody = await request.text();

    if (!rawBody.trim()) {
      return NextResponse.json(
        { success: false, error: 'request body is required' },
        { status: 400 },
      );
    }

    try {
      body = JSON.parse(rawBody) as typeof body;
    } catch {
      return NextResponse.json(
        { success: false, error: 'invalid JSON body' },
        { status: 400 },
      );
    }

    const { event, properties } = body;

    if (typeof event !== 'string' || !event.trim()) {
      return NextResponse.json(
        { success: false, error: 'event is required' },
        { status: 400 },
      );
    }

    const sessionId = getSessionId(request);
    const d1 = getD1();

    if (!d1) {
      console.log('[Track Event]', event, properties, sessionId);
      const response = NextResponse.json({
        success: true,
        stored: false,
      });

      if (!request.cookies.get('upderma_session')) {
        response.cookies.set('upderma_session', sessionId, {
          maxAge: 60 * 60 * 24 * 7,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }

      return response;
    }

    const db = getDb(d1);
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipCountry = request.headers.get('cf-ipcountry') || undefined;

    await db.insert(analyticsEvents).values({
      id: generateId('evt'),
      eventType: event.trim(),
      eventData: properties ? JSON.stringify(properties) : null,
      sessionId,
      userAgent,
      ipCountry,
    });

    const response = NextResponse.json({ success: true, stored: true });

    if (!request.cookies.get('upderma_session')) {
      response.cookies.set('upderma_session', sessionId, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    return response;
  } catch (error) {
    console.error('Track event error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store event' },
      { status: 500 },
    );
  }
}
