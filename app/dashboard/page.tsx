import DashboardLayout from '@/components/DashboardLayout';
import { getCurrentUser } from '@/lib/auth';
import { cookies, headers } from 'next/headers';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import StationAdminDashboard from '@/components/dashboards/StationAdminDashboard';
import OfficerDashboard from '@/components/dashboards/OfficerDashboard';

async function getStats() {
  try {
    const cookieStore = await cookies();
    const cookieHeaders = { Cookie: cookieStore.toString() };

    // Server-side fetch needs an absolute URL. On Vercel, derive it from request headers.
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    const proto = h.get('x-forwarded-proto') ?? 'http';
    const vercelUrl = process.env.VERCEL_URL;
    const origin = host
      ? `${proto}://${host}`
      : vercelUrl
        ? `https://${vercelUrl}`
        : 'http://localhost:3000';

    const statsUrl = new URL('/api/reports/stats', origin).toString();

    const response = await fetch(statsUrl, {
      cache: 'no-store',
      headers: cookieHeaders,
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    } else {
      console.error('Stats API returned:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
  return null;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const stats = await getStats();

  // If fetch fails (or no stats), provide a fallback structure to prevent UI crash
  const safeStats = stats || {
    totalCases: 0,
    totalStations: 0,
    totalOfficers: 0,
    totalUsers: 0,
    casesByStatus: [],
    casesByPriority: [],
    casesByCrimeType: [],
    recentCases: [],
    monthlyTrends: [],
    casesByDistrict: []
  };

  if (!user) {
    return <div>Unauthorized</div>; // Should be handled by middleware/layout, but safety first
  }

  return (
    <DashboardLayout>
      {user.role === 'Admin' ? (
        <AdminDashboard user={user} stats={safeStats} />
      ) : user.role === 'StationAdmin' ? (
        <StationAdminDashboard user={user} stats={safeStats} />
      ) : (
        <OfficerDashboard user={user} stats={safeStats} />
      )}
    </DashboardLayout>
  );
}
