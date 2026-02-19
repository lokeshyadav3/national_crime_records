import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET all persons (with optional search and station filter)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'persons.read')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const stationId = searchParams.get('station_id');

    // Base query with station info through case_persons -> cases -> police_stations
    let query = `
      SELECT DISTINCT p.id, p.first_name, p.middle_name, p.last_name, 
             p.national_id, p.gender, p.contact_number, p.city, p.state,
             p.email, p.date_of_birth, p.photo, p.created_at,
             (
               SELECT string_agg(DISTINCT ps.station_name, ', ')
               FROM case_persons cp2
               JOIN cases c2 ON cp2.case_id = c2.case_id
               JOIN police_stations ps ON c2.station_id = ps.id
               WHERE cp2.person_id = p.id
             ) as station_names,
             (
               SELECT string_agg(DISTINCT cp3.role, ', ')
               FROM case_persons cp3
               WHERE cp3.person_id = p.id
             ) as roles_in_cases
      FROM persons p
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    // Station filter
    if (stationId) {
      query += `
        JOIN case_persons cp ON cp.person_id = p.id
        JOIN cases c ON cp.case_id = c.case_id
      `;
      conditions.push('c.station_id = ?');
      params.push(stationId);
    }

    // Search filter — case-insensitive, searches first/middle/last name individually and as full name
    if (search) {
      const term = search.toLowerCase();
      conditions.push(`(
        LOWER(p.first_name) LIKE ? OR
        LOWER(p.middle_name) LIKE ? OR
        LOWER(p.last_name) LIKE ? OR
        LOWER(CONCAT(p.first_name, ' ', COALESCE(p.middle_name, ''), ' ', p.last_name)) LIKE ? OR
        LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE ? OR
        LOWER(p.national_id) LIKE ? OR
        LOWER(p.contact_number) LIKE ? OR
        LOWER(p.city) LIKE ?
      )`);
      params.push(`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY p.created_at DESC LIMIT 200`;

    const persons = await executeQuery(query, params);
    return NextResponse.json({ success: true, data: persons });
  } catch (error) {
    console.error('Get persons error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST create new person
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'persons.create')) {
      return NextResponse.json({ success: false, message: 'Unauthorized – only Station Admin and Officers can add persons' }, { status: 403 });
    }

    const data = await request.json();

    if (!data.first_name || !data.last_name) {
      return NextResponse.json({ success: false, message: 'First name and last name are required' }, { status: 400 });
    }

    // Map form fields to database columns
    const nationalId = data.citizenship_no || data.national_id || null;
    const contactNumber = data.phone || data.contact_number || null;
    const address = data.address_line || data.address || null;
    const city = data.municipality || data.city || null;
    const state = data.state_province || data.state || null;

    // Check for duplicate by national_id if provided
    if (nationalId) {
      const existing = await queryOne('SELECT id FROM persons WHERE national_id = ?', [nationalId]);
      if (existing) {
        return NextResponse.json({ success: false, message: 'Person with this National ID already exists' }, { status: 400 });
      }
    }

    const result = await executeQuery(
      `INSERT INTO persons 
       (first_name, middle_name, last_name, national_id, gender, contact_number, email, address, city, state, date_of_birth, citizenship, photo, signature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [
        data.first_name,
        data.middle_name || null,
        data.last_name,
        nationalId,
        data.gender || null,
        contactNumber,
        data.email || null,
        address,
        city,
        state,
        data.date_of_birth || null,
        data.nationality || 'Nepali',
        data.photo || null,
        data.signature || null
      ]
    );

    const personId = (result as any)[0]?.id || (result as any).insertId;

    return NextResponse.json({
      success: true,
      message: 'Person created successfully',
      data: { id: personId }
    });
  } catch (error) {
    console.error('Create person error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
