/**
 * RECONSTRUCTED SOURCE
 * Recovered from deployed route module 12029.
 */

import { NextResponse } from 'next/server';

import { getSessionFromRequest, requireAuth } from '@/lib/auth';
import { getD1 } from '@/lib/db';

type CustomerCount = { total: number };

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
    const offset = (page - 1) * limit;
    const d1 = getD1();

    if (!d1) {
      return NextResponse.json({
        success: true,
        data: {
          customers: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        },
      });
    }

    let whereClause = '';
    if (search) {
      const escapedSearch = search.replace(/'/g, "''");
      whereClause =
        `WHERE customer_phone LIKE '%${escapedSearch}%' ` +
        `OR customer_name LIKE '%${escapedSearch}%' ` +
        `OR customer_email LIKE '%${escapedSearch}%'`;
    }

    const countResult = await d1
      .prepare(
        `SELECT COUNT(*) as total FROM (` +
          `SELECT customer_phone FROM orders ${whereClause} ` +
          `GROUP BY customer_phone)`,
      )
      .first<CustomerCount>();
    const total = countResult?.total || 0;

    const result = await d1
      .prepare(
        `SELECT
          customer_phone as phone,
          MAX(customer_name) as name,
          MAX(customer_email) as email,
          MAX(city) as city,
          COUNT(*) as orderCount,
          SUM(total) as totalSpent,
          MAX(created_at) as lastOrderAt
        FROM orders
        ${whereClause}
        GROUP BY customer_phone
        ORDER BY MAX(created_at) DESC
        LIMIT ? OFFSET ?`,
      )
      .bind(limit, offset)
      .all();

    return NextResponse.json({
      success: true,
      data: {
        customers: result.results || [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Customers list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 },
    );
  }
}
