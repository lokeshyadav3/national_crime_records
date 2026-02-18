import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET all cases with filters
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'cases.read')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = `
          SELECT c.case_id as id, c.fir_no as fir_number, c.crime_type, c.case_status as status,
            c.case_priority as priority, c.summary as incident_description,
            c.fir_date_time as registered_date, c.incident_date_time as incident_date,
            s.station_name, s.station_code,
            CONCAT(ro.first_name, ' ', ro.last_name) as registered_by_name
          FROM cases c
      LEFT JOIN police_stations s ON c.station_id = s.id
      LEFT JOIN officers ro ON c.officer_id = ro.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Restrict to user's station when not Admin
    if (user.role !== 'Admin' && user.station_id) {
      query += ' AND c.station_id = ?';
      params.push(user.station_id);
    }

    // Only support search by exact FIR number (FIR numbers are unique)
    if (search) {
      const fir = search.trim();
      query += ' AND c.fir_no = ?';
      params.push(fir);
    }

    query += ' ORDER BY c.fir_date_time DESC';

    const cases = await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      data: cases,
    });
  } catch (error) {
    console.error('Get cases error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new case/FIR
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'cases.create')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Use provided fir_no or generate a temporary one if needed
    let firNo = data.fir_no;
    if (!firNo) {
      const stationId = parseInt(data.station_id);
      const station = await queryOne<{ station_code: string }>(
        'SELECT station_code FROM police_stations WHERE id = ?',
        [stationId]
      );

      if (!station) {
        return NextResponse.json({ success: false, message: 'Invalid Station ID' }, { status: 400 });
      }

      const year = new Date().getFullYear();
      // use fir_date_time for year check as it is more reliable for business logic
      const count = await queryOne<any>(
        'SELECT COUNT(*) as count FROM cases WHERE station_id = ? AND EXTRACT(YEAR FROM fir_date_time) = ?',
        [stationId, year]
      );

      const sequence = (parseInt(count?.count || '0') + 1).toString().padStart(4, '0');
      firNo = `${station.station_code}/${year}/${sequence}`;
    }

    // Check if FIR number already exists
    const existing = await queryOne(
      'SELECT case_id FROM cases WHERE fir_no = ?',
      [firNo]
    );

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'FIR number already exists. Please try again.' },
        { status: 400 }
      );
    }

    // Determine officer_id
    let officerId = data.officer_id ? parseInt(data.officer_id) : user.officer_id;
    const stationId = parseInt(data.station_id);

    if (!officerId) {
      // Get first active officer from the station
      const firstOfficer = await queryOne<any>(
        'SELECT id FROM officers WHERE station_id = ? LIMIT 1',
        [stationId]
      );
      officerId = firstOfficer?.id;
    }

    if (!officerId) {
      return NextResponse.json(
        { success: false, message: 'No officer available for this station. Please add an officer first.' },
        { status: 400 }
      );
    }

    // Ensure valid incident date
    if (!data.incident_date) {
      return NextResponse.json({ success: false, message: 'Incident date is required' }, { status: 400 });
    }

    const result = await executeQuery(
      `INSERT INTO cases 
       (fir_no, fir_date_time, station_id, officer_id, crime_type, crime_section, 
        incident_date_time, incident_location, incident_district, 
        case_priority, case_status, summary)
       VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING case_id`,
      [
        firNo,
        stationId,
        officerId,
        data.crime_type,
        data.crime_section || null,
        data.incident_date,
        data.incident_location,
        data.incident_district || 'Unknown',
        data.priority || 'Medium',
        data.status || 'Registered',
        data.incident_description,
      ]
    );

    const caseId = (result as any)[0]?.case_id || (result as any).insertId;

    // Create initial tracking record
    await executeQuery(
      `INSERT INTO fir_track_records 
       (case_id, action_type, action_description, old_status, new_status, performed_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        caseId,
        'Status Change',
        `FIR ${firNo} registered`,
        null,
        'Registered',
        user.id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'FIR registered successfully',
      data: { id: caseId, fir_number: firNo },
    });
  } catch (error) {
    console.error('Create case error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
