/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 18752.
 */

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import {
  getSessionFromRequest,
  requireAuth,
  requireSuperAdmin,
} from '@/lib/auth';
import { getD1, getDb } from '@/lib/db';
import { adminUsers } from '@/lib/db/schema';

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: RouteContext) {
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

    const { id } = await params;
    if (session.id === id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 },
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
    const existing = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .get();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    }

    await db.delete(adminUsers).where(eq(adminUsers.id, id));
    return NextResponse.json({
      success: true,
      message: 'Admin user deleted successfully',
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
