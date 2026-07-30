/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 82850.
 */

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getSessionFromRequest,
  hashPassword,
  requireAuth,
  requireSuperAdmin,
} from '@/lib/auth';
import { generateId, getD1, getDb } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['admin', 'super_admin']).default('admin'),
});

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!requireAuth(session)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    if (!requireSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, error: 'Super admin access required' },
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

    const data = await getDb(d1)
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        name: adminUsers.name,
        role: adminUsers.role,
        lastLogin: adminUsers.lastLogin,
        createdAt: adminUsers.createdAt,
      })
      .from(adminUsers)
      .all();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('List admins error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!requireAuth(session)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    if (!requireSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, error: 'Super admin access required' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { email, password, name, role } = createAdminSchema.parse(body);
    const d1 = getD1();

    if (!d1) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 },
      );
    }

    const db = getDb(d1);
    const existing = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .get();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
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
      role,
    });

    return NextResponse.json({
      success: true,
      data: { id, email, name, role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Create admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
