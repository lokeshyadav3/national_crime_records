-- ============================================
-- RESET DATABASE - DELETE ALL DATA
-- ============================================
-- This script will delete all data from all tables
-- and create a single super admin user

-- Delete data in reverse order of dependencies
DELETE FROM supplementary_statements;
DELETE FROM fir_track_records;
DELETE FROM evidence;
DELETE FROM case_persons;
DELETE FROM cases;
DELETE FROM persons;
DELETE FROM users;
DELETE FROM officers;
DELETE FROM police_stations;

-- Reset sequences (auto-increment IDs) to start from 1
ALTER SEQUENCE police_stations_id_seq RESTART WITH 1;
ALTER SEQUENCE officers_id_seq RESTART WITH 1;
ALTER SEQUENCE persons_id_seq RESTART WITH 1;
ALTER SEQUENCE cases_case_id_seq RESTART WITH 1;
ALTER SEQUENCE case_persons_id_seq RESTART WITH 1;
ALTER SEQUENCE evidence_id_seq RESTART WITH 1;
ALTER SEQUENCE fir_track_records_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE supplementary_statements_id_seq RESTART WITH 1;

-- ============================================
-- CREATE SUPER ADMIN USER
-- ============================================
-- Username: admin
-- Password: admin123
-- Role: Admin (System Administrator)
-- No station or officer linkage required

INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active)
VALUES
('admin', '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e', 'Admin', NULL, NULL, TRUE);

-- ============================================
-- VERIFICATION
-- ============================================
-- Check if super admin was created
SELECT id, username, role, is_active, created_at 
FROM users 
WHERE username = 'admin';

-- ============================================
-- LOGIN CREDENTIALS
-- ============================================
-- Username: admin
-- Password: admin123
-- Role: Admin (Full system access)
-- ============================================
