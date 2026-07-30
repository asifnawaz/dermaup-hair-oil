/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 61646.
 */

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { hashPassword } from '@/lib/auth';
import { generateId, getD1, getDb } from '@/lib/db';
import { adminUsers, settings } from '@/lib/db/schema';
import { getRequiredEnv } from '@/lib/env';

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  setupKey: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, setupKey } = setupSchema.parse(body);

    if (setupKey !== getRequiredEnv('ADMIN_SETUP_KEY')) {
      return NextResponse.json(
        { success: false, error: 'Invalid setup key' },
        { status: 403 },
      );
    }

    const d1 = getD1();
    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 },
      );
    }

    const db = getDb(d1);
    const setupState = await db
      .select()
      .from(settings)
      .where(eq(settings.key, 'setup_complete'))
      .get();

    if (setupState?.value === 'true') {
      return NextResponse.json(
        {
          success: false,
          error:
            'Setup already completed. Use admin panel to add more users.',
        },
        { status: 400 },
      );
    }

    const existingAdmin = await db.select().from(adminUsers).get();
    if (existingAdmin) {
      await db
        .insert(settings)
        .values({ key: 'setup_complete', value: 'true' })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: 'true' },
        });

      return NextResponse.json(
        {
          success: false,
          error: 'Admin already exists. Use admin panel to add more users.',
        },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);
    const id = generateId('admin');

    await db.insert(adminUsers).values({
      id,
      email,
      passwordHash,
      name,
      role: 'super_admin',
    });
    await db
      .insert(settings)
      .values({ key: 'setup_complete', value: 'true' });

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      data: { id, email, name, role: 'super_admin' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const d1 = getD1();
    if (!d1) {
      return NextResponse.json({
        success: true,
        data: {
          setupRequired: true,
          reason: 'Database not connected',
        },
      });
    }

    const db = getDb(d1);
    const admin = await db.select().from(adminUsers).get();

    return NextResponse.json({
      success: true,
      data: {
        setupRequired: !admin,
        adminCount: Number(Boolean(admin)),
      },
    });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json({
      success: true,
      data: {
        setupRequired: true,
        reason: 'Database error',
      },
    });
  }
}
