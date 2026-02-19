import { getCurrentUser } from '@/lib/auth';
import { executeQuery } from '@/lib/db';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import StationAdminDashboard from '@/components/dashboards/StationAdminDashboard';
import OfficerDashboard from '@/components/dashboards/OfficerDashboard';

async function getStats(user: { role: string; station_id?: number | null }) {
  try {
    let stationFilter = '';
    const params: any[] = [];

    if (user.role !== 'Admin' && user.station_id) {
      stationFilter = 'WHERE station_id = $1';
      params.push(user.station_id);
    }

    // Run all queries in parallel
    const [
      totalCasesRes,
      totalStationsRes,
      totalOfficersRes,
      totalUsersRes,
      totalPersonsRes,
      casesByStatus,
      casesByPriority,
      casesByCrimeType,
      recentCases,
      monthlyTrends,
      casesByDistrict,
    ] = await Promise.all([
      executeQuery<any[]>(`SELECT COUNT(*) as count FROM cases ${stationFilter}`, params),
      executeQuery<any[]>(`SELECT COUNT(*) as count FROM police_stations`, []),
      executeQuery<any[]>(
        user.role === 'Admin'
          ? `SELECT COUNT(*) as count FROM officers`
          : `SELECT COUNT(*) as count FROM officers WHERE station_id = $1`,
        user.role === 'Admin' ? [] : [user.station_id]
      ),
      executeQuery<any[]>(`SELECT COUNT(*) as count FROM users`, []),
      executeQuery<any[]>(`SELECT COUNT(*) as count FROM persons`, []),
      executeQuery(
        `SELECT case_status as status, COUNT(*) as count FROM cases ${stationFilter} GROUP BY case_status`,
        params
      ),
      executeQuery(
        `SELECT case_priority as priority, COUNT(*) as count FROM cases ${stationFilter} GROUP BY case_priority`,
        params
      ),
      executeQuery(
        `SELECT crime_type as type, COUNT(*) as count FROM cases ${stationFilter} GROUP BY crime_type ORDER BY count DESC`,
        params
      ),
      executeQuery(
        `SELECT c.case_id as id, c.fir_no as fir_number, c.crime_type, c.case_status as status, c.case_priority as priority,
                c.fir_date_time as registered_date, s.station_name
         FROM cases c LEFT JOIN police_stations s ON c.station_id = s.id
         ${stationFilter ? 'WHERE c.station_id = $1' : ''}
         ORDER BY c.fir_date_time DESC LIMIT 10`,
        params
      ),
      executeQuery(
        `SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count
         FROM cases WHERE created_at >= (NOW() - INTERVAL '6 months')
         ${stationFilter ? 'AND station_id = $1' : ''}
         GROUP BY month ORDER BY month DESC`,
        params
      ),
      executeQuery(
        `SELECT UPPER(incident_district) as district, COUNT(*) as total,
           SUM(CASE WHEN case_status = 'Registered' THEN 1 ELSE 0 END) as registered,
           SUM(CASE WHEN case_status = 'Under Investigation' THEN 1 ELSE 0 END) as under_investigation,
           SUM(CASE WHEN case_status = 'Charge Sheet Filed' THEN 1 ELSE 0 END) as chargesheet,
           SUM(CASE WHEN case_status = 'Closed' THEN 1 ELSE 0 END) as closed
         FROM cases WHERE incident_district IS NOT NULL AND incident_district != ''
         ${stationFilter ? 'AND station_id = $1' : ''}
         GROUP BY UPPER(incident_district) ORDER BY total DESC`,
        params
      ),
    ]);

    return {
      totalCases: parseInt(totalCasesRes[0]?.count || 0),
      totalStations: parseInt(totalStationsRes[0]?.count || 0),
      totalOfficers: parseInt(totalOfficersRes[0]?.count || 0),
      totalUsers: parseInt(totalUsersRes[0]?.count || 0),
      totalPersons: parseInt(totalPersonsRes[0]?.count || 0),
      casesByStatus,
      casesByPriority,
      casesByCrimeType,
      recentCases,
      monthlyTrends,
      casesByDistrict,
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  const stats = await getStats(user);

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

  return (
    <>
      {user.role === 'Admin' ? (
        <AdminDashboard user={user} stats={safeStats} />
      ) : user.role === 'StationAdmin' ? (
        <StationAdminDashboard user={user} stats={safeStats} />
      ) : (
        <OfficerDashboard user={user} stats={safeStats} />
      )}
    </>
  );
}
