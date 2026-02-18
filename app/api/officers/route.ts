import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET all officers
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'officers.read')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const stationIdParam = searchParams.get('station_id');
    const rank = searchParams.get('rank');
    const status = searchParams.get('status');

    const requestedStationId = stationIdParam ? Number(stationIdParam) : undefined;
    if (
      stationIdParam &&
      (requestedStationId === undefined ||
        !Number.isFinite(requestedStationId) ||
        requestedStationId <= 0)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid station_id' },
        { status: 400 }
      );
    }

    let query = `
      SELECT o.*, s.station_name, s.station_code
      FROM officers o
      LEFT JOIN police_stations s ON o.station_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    const userStationId = user.station_id ? Number(user.station_id) : undefined;
    if (user.role !== 'Admin' && userStationId) {
      if (requestedStationId && requestedStationId !== userStationId) {
        return NextResponse.json(
          {
            success: false,
            message: 'Forbidden: cannot access officers from another station',
            details: {
              requestedStationId,
              userStationId,
            },
          },
          { status: 403 }
        );
      }

      query += ' AND o.station_id = ?';
      params.push(userStationId);
    } else if (requestedStationId) {
      query += ' AND o.station_id = ?';
      params.push(requestedStationId);
    }

    if (search) {
      const searchTerm = search.trim();
      // Split search into individual words for flexible matching
      const words = searchTerm.split(/\s+/).filter(w => w.length > 0);

      if (words.length > 1) {
        // Multi-word search: match full search against concatenated name, OR each word independently

        // Strategy: match full search against concatenated name, OR match each word independently
        const fullNameMatch = `CONCAT(o.first_name, ' ', COALESCE(o.middle_name, ''), ' ', o.last_name) ILIKE ?`;
        params.push(`%${searchTerm}%`);

        const perWordConditions = words.map((word) => {
          const wordParam = `%${word}%`;
          params.push(wordParam, wordParam, wordParam, wordParam, wordParam);
          return `(o.first_name ILIKE ? OR o.middle_name ILIKE ? OR o.last_name ILIKE ? OR o.badge_number ILIKE ? OR s.station_name ILIKE ?)`;
        });

        query += ` AND (${fullNameMatch} OR (${perWordConditions.join(' AND ')}))`;
      } else {
        // Single word search: match against any field
        query += ' AND (o.first_name ILIKE ? OR o.middle_name ILIKE ? OR o.last_name ILIKE ? OR o.badge_number ILIKE ? OR s.station_name ILIKE ?)';
        params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
      }
    }

    if (rank) {
      query += ' AND o.rank = ?';
      params.push(rank);
    }

    if (status) {
      query += ' AND o.service_status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.rank, o.first_name ASC';

    const officers = await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      data: officers,
    });
  } catch (error) {
    console.error('Get officers error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new officer
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'officers.create')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Map form fields to DB columns
    const first_name = (data.first_name || '').trim();
    const middle_name = (data.middle_name || '').trim() || null;
    const last_name = (data.last_name || '').trim();

    const badge_number = (data.badge_no || '').trim();

    // Check if badge number already exists
    const existing = await queryOne(
      'SELECT id FROM officers WHERE badge_number = ?',
      [badge_number]
    );

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Badge number already exists' },
        { status: 400 }
      );
    }

    // Only include station_id if provided and valid
    const station_id = data.station_id && data.station_id !== '' ? Number(data.station_id) : null;

    // If station_id is null, don't include it in the insert (schema requires NOT NULL)
    let query: string;
    let params: any[];

    if (station_id) {
      query = `INSERT INTO officers 
       (badge_number, first_name, middle_name, last_name, rank, department, station_id,
        contact_number, email, gender, service_status, date_of_joining,
        state_province, district, municipality, ward_no, address_line,
        photo, signature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      params = [
        badge_number,
        first_name,
        middle_name,
        last_name,
        data.rank,
        data.department_unit || null,
        station_id,
        data.phone || null,
        data.email || null,
        data.gender || null,
        data.service_status || 'Active',
        data.join_date || null,
        data.state_province || null,
        data.district || null,
        data.municipality || null,
        data.ward_no || null,
        data.address_line || null,
        data.photo || null,
        data.signature || null,
      ];
    } else {
      return NextResponse.json(
        { success: false, message: 'Station ID is required' },
        { status: 400 }
      );
    }

    const result = await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      message: 'Officer created successfully',
      data: { id: (result as any).insertId },
    });
  } catch (error) {
    console.error('Create officer error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
