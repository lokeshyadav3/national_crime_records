import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getSession, verifyPassword } from '@/lib/auth';
import { User } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    console.log('Login attempt for username:', username);

    // Find user
    const user = await queryOne<User>(
      'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
      [username]
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash!);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await executeQuery(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Create session
    const session = await getSession();
    session.isLoggedIn = true;
    session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      station_id: user.station_id,
      officer_id: user.officer_id,
    };
    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: session.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
