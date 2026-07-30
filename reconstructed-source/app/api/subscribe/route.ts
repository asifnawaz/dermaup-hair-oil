/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the latest deployed /api/subscribe route module and checked
 * against the surviving schema calls and source signature.
 */

import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { generateId, getD1, getDb } from '@/lib/db';
import { subscribers } from '@/lib/db/schema';
import {
  formatZodErrors,
  subscribeFormSchema,
} from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = subscribeFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: formatZodErrors(validationResult.error),
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;
    const email =
      data.email && data.email.length > 0 ? data.email : null;
    const phone =
      data.phone && data.phone.length > 0
        ? data.phone.replace(/[\s-]/g, '')
        : null;
    const d1 = getD1();

    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'Service unavailable' },
        { status: 503 },
      );
    }

    const db = getDb(d1);
    let existing = null;

    if (email) {
      existing = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, email))
        .get();
    }

    if (!existing && phone) {
      existing = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.phone, phone))
        .get();
    }

    if (existing) {
      const updates: {
        isActive: boolean;
        source: typeof data.source;
        email?: string;
        phone?: string;
        name?: string;
      } = {
        isActive: true,
        source: data.source,
      };

      if (email && !existing.email) updates.email = email;
      if (phone && !existing.phone) updates.phone = phone;
      if (data.name && !existing.name) updates.name = data.name;

      await db
        .update(subscribers)
        .set(updates)
        .where(eq(subscribers.id, existing.id));

      return NextResponse.json({
        success: true,
        data: { message: 'Already subscribed' },
      });
    }

    const subscriberId = generateId('sub');
    await db.insert(subscribers).values({
      id: subscriberId,
      email: email || '',
      name: data.name,
      phone,
      source: data.source,
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Subscribed successfully' },
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe' },
      { status: 500 },
    );
  }
}
