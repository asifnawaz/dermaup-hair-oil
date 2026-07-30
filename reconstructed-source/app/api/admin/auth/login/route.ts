/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 49844.
 */

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createToken,
  setSessionCookie,
  verifyPassword,
} from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);
    const d1 = getD1();

    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 },
      );
    }

    const db = getDb(d1);
    const admin = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .get();

    if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    await db
      .update(adminUsers)
      .set({ lastLogin: new Date().toISOString() })
      .where(eq(adminUsers.id, admin.id));

    const token = await createToken({
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role || 'admin',
    });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
