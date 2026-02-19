-- ============================================================================
-- NATIONAL CRIME RECORDS - COMPLETE SEED DATA
-- ============================================================================
-- Run reset_database.sql FIRST, then this file.
-- Password for all users: admin123
-- Hash: $2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e
-- ============================================================================

-- ============================================================================
-- 1. POLICE STATIONS (8 stations across Kathmandu Valley + outside)
-- ============================================================================
INSERT INTO police_stations (station_code, station_name, state_province, district, municipality, ward_no, address_line, phone, email, jurisdiction_area, established_date, is_active) VALUES
('MPC-KTM-01', 'Metropolitan Police Circle, Teku', 'Bagmati', 'Kathmandu', 'Kathmandu Metropolitan City', '12', 'Teku, Kathmandu', '01-4228222', 'teku.mpc@nepalpolice.gov.np', 'Teku, Kalimati, Kuleshwor, Kalanki areas', '1990-01-15', TRUE),
('MPC-KTM-02', 'Metropolitan Police Circle, Durbar Marg', 'Bagmati', 'Kathmandu', 'Kathmandu Metropolitan City', '24', 'Durbar Marg, Kathmandu', '01-4220011', 'durbarmarg.mpc@nepalpolice.gov.np', 'Durbar Marg, New Road, Asan, Thamel areas', '1985-06-10', TRUE),
('MPC-KTM-03', 'Metropolitan Police Circle, Boudha', 'Bagmati', 'Kathmandu', 'Kathmandu Metropolitan City', '6', 'Boudha, Kathmandu', '01-4480222', 'boudha.mpc@nepalpolice.gov.np', 'Boudha, Jorpati, Chabahil, Mitrapark areas', '1992-04-20', TRUE),
('MPC-KTM-04', 'Metropolitan Police Circle, Maharajgunj', 'Bagmati', 'Kathmandu', 'Kathmandu Metropolitan City', '3', 'Maharajgunj, Kathmandu', '01-4720100', 'maharajgunj.mpc@nepalpolice.gov.np', 'Maharajgunj, Baluwatar, Lazimpat, Naxal areas', '1988-09-05', TRUE),
('DPC-LAL-01', 'District Police Office, Jawalakhel', 'Bagmati', 'Lalitpur', 'Lalitpur Metropolitan City', '4', 'Jawalakhel, Lalitpur', '01-5523222', 'jawalakhel.dpo@nepalpolice.gov.np', 'Jawalakhel, Kupondole, Pulchowk areas', '1993-02-18', TRUE),
('DPC-LAL-02', 'Area Police Office, Pulchowk', 'Bagmati', 'Lalitpur', 'Lalitpur Metropolitan City', '12', 'Pulchowk, Lalitpur', '01-5540100', 'pulchowk.apo@nepalpolice.gov.np', 'Pulchowk, Sanepa, Ekantakuna areas', '1997-11-25', TRUE),
('DPC-BKT-01', 'District Police Office, Suryabinayak', 'Bagmati', 'Bhaktapur', 'Suryabinayak Municipality', '3', 'Suryabinayak, Bhaktapur', '01-6614222', 'suryabinayak.dpo@nepalpolice.gov.np', 'Suryabinayak, Sallaghari, Katunje areas', '1995-08-14', TRUE),
('DPC-KSK-01', 'District Police Office, Lakeside', 'Gandaki', 'Kaski', 'Pokhara Metropolitan City', '6', 'Lakeside, Pokhara', '061-463222', 'lakeside.dpo@nepalpolice.gov.np', 'Lakeside, Baidam, Damside, Prithvi Chowk areas', '1991-03-22', TRUE);

-- ============================================================================
-- 2. OFFICERS (4-5 per station; Teku station_id=1 already has 5 from seed_officers)
-- ============================================================================
INSERT INTO officers (first_name, middle_name, last_name, rank, badge_number, station_id, department, contact_number, email, gender, date_of_joining, service_status, state_province, district, municipality, ward_no, address_line, photo, signature) VALUES
-- Teku (station 1) — already seeded via seed_officers.sql, skip here

-- Durbar Marg (station 2) — 5 officers
('Hari', 'Prasad', 'Gurung', 'DSP', 'NP-2001', 2, 'Operations', '9851100006', 'hari.gurung@nepalpolice.gov.np', 'Male', '2008-01-15', 'Active', 'Gandaki', 'Lamjung', 'Besisahar Mun', '3', 'Besisahar, Lamjung', NULL, NULL),
('Gita', NULL, 'Karki', 'Inspector', 'NP-2002', 2, 'Investigation', '9851100007', 'gita.karki@nepalpolice.gov.np', 'Female', '2012-07-20', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '4', 'Lazimpat, Kathmandu', NULL, NULL),
('Rajesh', 'Kumar', 'Poudel', 'Sub-Inspector', 'NP-2003', 2, 'Patrol Unit', '9851100008', 'rajesh.poudel@nepalpolice.gov.np', 'Male', '2016-09-05', 'Active', 'Lumbini', 'Rupandehi', 'Butwal Sub-Metro', '6', 'Butwal, Rupandehi', NULL, NULL),
('Kamala', NULL, 'Thapa', 'ASI', 'NP-2004', 2, 'Women Cell', '9851100009', 'kamala.thapa@nepalpolice.gov.np', 'Female', '2018-04-12', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '16', 'Balaju, Kathmandu', NULL, NULL),
('Dipendra', 'Bahadur', 'Shahi', 'Constable', 'NP-2005', 2, 'Traffic Division', '9851100010', 'dipendra.shahi@nepalpolice.gov.np', 'Male', '2020-01-20', 'Active', 'Karnali', 'Jumla', 'Chandannath Mun', '2', 'Jumla Bazar', NULL, NULL),

-- Boudha (station 3) — 5 officers
('Suresh', NULL, 'Lama', 'SP', 'NP-3001', 3, 'Administration', '9851200009', 'suresh.lama@nepalpolice.gov.np', 'Male', '2003-11-01', 'Active', 'Bagmati', 'Sindhupalchok', 'Melamchi Mun', '1', 'Melamchi', NULL, NULL),
('Pramila', 'Devi', 'Tamang', 'Inspector', 'NP-3002', 3, 'Women Cell', '9851200010', 'pramila.tamang@nepalpolice.gov.np', 'Female', '2014-05-12', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '7', 'Chabahil', NULL, NULL),
('Rajan', NULL, 'Maharjan', 'Sub-Inspector', 'NP-3003', 3, 'Crime Division', '9851200011', 'rajan.maharjan@nepalpolice.gov.np', 'Male', '2016-02-28', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '6', 'Jorpati', NULL, NULL),
('Sabina', 'Kumari', 'Shrestha', 'ASI', 'NP-3004', 3, 'Investigation', '9851200012', 'sabina.shrestha@nepalpolice.gov.np', 'Female', '2019-07-15', 'Active', 'Bagmati', 'Bhaktapur', 'Bhaktapur Mun', '8', 'Dudhpati', NULL, NULL),

-- Maharajgunj (station 4) — 5 officers
('Bikram', 'Singh', 'Rana', 'DSP', 'NP-4001', 4, 'Crime Branch', '9851300011', 'bikram.rana@nepalpolice.gov.np', 'Male', '2007-02-14', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '3', 'Maharajgunj', NULL, NULL),
('Mina', NULL, 'Shrestha', 'Inspector', 'NP-4002', 4, 'Investigation', '9851300012', 'mina.shrestha@nepalpolice.gov.np', 'Female', '2013-08-30', 'Active', 'Bagmati', 'Bhaktapur', 'Bhaktapur Mun', '5', 'Sallaghari', NULL, NULL),
('Arjun', 'Prasad', 'Sapkota', 'Sub-Inspector', 'NP-4003', 4, 'Patrol Unit', '9851300013', 'arjun.sapkota@nepalpolice.gov.np', 'Male', '2017-03-09', 'Active', 'Bagmati', 'Kavrepalanchok', 'Dhulikhel Mun', '4', 'Dhulikhel', NULL, NULL),
('Rekha', NULL, 'Pandey', 'ASI', 'NP-4004', 4, 'Women Cell', '9851300014', 'rekha.pandey@nepalpolice.gov.np', 'Female', '2019-11-18', 'Active', 'Bagmati', 'Nuwakot', 'Bidur Mun', '2', 'Bidur', NULL, NULL),
('Nabin', 'Kumar', 'Oli', 'Head Constable', 'NP-4005', 4, 'Traffic Division', '9851300015', 'nabin.oli@nepalpolice.gov.np', 'Male', '2020-06-01', 'Active', 'Lumbini', 'Palpa', 'Tansen Mun', '7', 'Tansen', NULL, NULL),

-- Jawalakhel (station 5) — 5 officers
('Bishnu', 'Maya', 'Rai', 'Inspector', 'NP-5001', 5, 'Investigation', '9851400013', 'bishnu.rai@nepalpolice.gov.np', 'Female', '2012-11-05', 'Active', 'Province 1', 'Dhankuta', 'Dhankuta Mun', '2', 'Dhankuta Bazar', NULL, NULL),
('Prakash', NULL, 'Tamang', 'DSP', 'NP-5002', 5, 'Crime Branch', '9851400014', 'prakash.tamang@nepalpolice.gov.np', 'Male', '2009-05-18', 'Active', 'Bagmati', 'Nuwakot', 'Bidur Mun', '4', 'Bidur', NULL, NULL),
('Sunita', 'Devi', 'Joshi', 'Sub-Inspector', 'NP-5003', 5, 'Women Cell', '9851400015', 'sunita.joshi@nepalpolice.gov.np', 'Female', '2014-02-12', 'Active', 'Sudurpashchim', 'Doti', 'Dipayal Silgadhi', '5', 'Silgadhi', NULL, NULL),
('Bibek', NULL, 'Gurung', 'ASI', 'NP-5004', 5, 'Patrol Unit', '9851400016', 'bibek.gurung@nepalpolice.gov.np', 'Male', '2018-09-22', 'Active', 'Gandaki', 'Kaski', 'Pokhara Metro', '9', 'Chipledhunga', NULL, NULL),
('Puja', NULL, 'Khadka', 'Constable', 'NP-5005', 5, 'Administration', '9851400017', 'puja.khadka@nepalpolice.gov.np', 'Female', '2021-03-14', 'Active', 'Bagmati', 'Lalitpur', 'Lalitpur Metro', '6', 'Kumaripati', NULL, NULL),

-- Pulchowk (station 6) — 4 officers
('Dipak', 'Raj', 'Bhandari', 'Inspector', 'NP-6001', 6, 'Traffic Control', '9851500016', 'dipak.bhandari@nepalpolice.gov.np', 'Male', '2011-06-25', 'Active', 'Bagmati', 'Lalitpur', 'Lalitpur Metro', '12', 'Pulchowk', NULL, NULL),
('Anita', NULL, 'Magar', 'Sub-Inspector', 'NP-6002', 6, 'Investigation', '9851500017', 'anita.magar@nepalpolice.gov.np', 'Female', '2015-01-08', 'Active', 'Gandaki', 'Syangja', 'Waling Mun', '3', 'Waling', NULL, NULL),
('Santosh', 'Bahadur', 'Chand', 'ASI', 'NP-6003', 6, 'Patrol Unit', '9851500018', 'santosh.chand@nepalpolice.gov.np', 'Male', '2018-08-10', 'Active', 'Sudurpashchim', 'Dadeldhura', 'Amargadhi Mun', '1', 'Amargadhi', NULL, NULL),
('Kopila', NULL, 'Bhatta', 'Constable', 'NP-6004', 6, 'Women Cell', '9851500019', 'kopila.bhatta@nepalpolice.gov.np', 'Female', '2021-05-20', 'Active', 'Bagmati', 'Lalitpur', 'Lalitpur Metro', '8', 'Sanepa', NULL, NULL),

-- Suryabinayak (station 7) — 4 officers
('Krishna', NULL, 'Shrestha', 'DSP', 'NP-7001', 7, 'Administration', '9851600018', 'krishna.shrestha@nepalpolice.gov.np', 'Male', '2007-03-30', 'Active', 'Bagmati', 'Bhaktapur', 'Bhaktapur Mun', '9', 'Dudhpati', NULL, NULL),
('Laxmi', 'Devi', 'Maharjan', 'Inspector', 'NP-7002', 7, 'Investigation', '9851600019', 'laxmi.maharjan@nepalpolice.gov.np', 'Female', '2013-04-22', 'Active', 'Bagmati', 'Bhaktapur', 'Madhyapur Thimi', '3', 'Bode', NULL, NULL),
('Roshan', NULL, 'Dangol', 'Sub-Inspector', 'NP-7003', 7, 'Crime Division', '9851600020', 'roshan.dangol@nepalpolice.gov.np', 'Male', '2017-10-15', 'Active', 'Bagmati', 'Bhaktapur', 'Suryabinayak Mun', '5', 'Katunje', NULL, NULL),
('Nirmala', 'Kumari', 'Pradhan', 'ASI', 'NP-7004', 7, 'Women Cell', '9851600021', 'nirmala.pradhan@nepalpolice.gov.np', 'Female', '2019-06-08', 'Active', 'Bagmati', 'Bhaktapur', 'Bhaktapur Mun', '2', 'Taumadhi', NULL, NULL),

-- Lakeside Pokhara (station 8) — 5 officers
('Narayan', 'Prasad', 'Acharya', 'SSP', 'NP-8001', 8, 'Crime Division', '9861100001', 'narayan.acharya@nepalpolice.gov.np', 'Male', '2002-07-16', 'Active', 'Gandaki', 'Kaski', 'Pokhara Metro', '8', 'Naya Bazar', NULL, NULL),
('Kabita', NULL, 'Pun', 'Inspector', 'NP-8002', 8, 'Women Cell', '9861100002', 'kabita.pun@nepalpolice.gov.np', 'Female', '2011-09-14', 'Active', 'Gandaki', 'Myagdi', 'Beni Mun', '2', 'Beni', NULL, NULL),
('Dilli', 'Ram', 'Neupane', 'Sub-Inspector', 'NP-8003', 8, 'Patrol Unit', '9861100003', 'dilli.neupane@nepalpolice.gov.np', 'Male', '2016-12-01', 'Active', 'Gandaki', 'Tanahun', 'Damauli Mun', '6', 'Damauli', NULL, NULL),
('Saraswati', NULL, 'Adhikari', 'ASI', 'NP-8004', 8, 'Investigation', '9861100004', 'saraswati.adhikari@nepalpolice.gov.np', 'Female', '2018-04-25', 'Active', 'Gandaki', 'Gorkha', 'Gorkha Mun', '3', 'Gorkha Bazar', NULL, NULL),
('Tek', 'Bahadur', 'Gurung', 'Constable', 'NP-8005', 8, 'Traffic Division', '9861100005', 'tek.gurung@nepalpolice.gov.np', 'Male', '2021-02-10', 'Active', 'Gandaki', 'Kaski', 'Pokhara Metro', '11', 'Chipledhunga', NULL, NULL);

-- Teku officers (station 1) — from existing seed_officers.sql
INSERT INTO officers (first_name, middle_name, last_name, rank, badge_number, station_id, department, contact_number, email, gender, date_of_joining, service_status, state_province, district, municipality, ward_no, address_line, photo, signature) VALUES
('Ram', 'Bahadur', 'Thapa', 'SSP', 'NP-1001', 1, 'Crime Division', '9851000001', 'ram.thapa@nepalpolice.gov.np', 'Male', '2005-04-14', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '15', 'Kalanki, Kathmandu', NULL, NULL),
('Sita', 'Kumari', 'Sharma', 'Inspector', 'NP-1002', 1, 'Women Cell', '9851000002', 'sita.sharma@nepalpolice.gov.np', 'Female', '2010-08-21', 'Active', 'Bagmati', 'Lalitpur', 'Lalitpur Metro', '8', 'Kupondole, Lalitpur', NULL, NULL),
('Mohan', 'Prasad', 'Adhikari', 'Sub-Inspector', 'NP-1003', 1, 'Traffic Division', '9851000003', 'mohan.adhikari@nepalpolice.gov.np', 'Male', '2015-03-10', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '29', 'Naikap, Kathmandu', NULL, NULL),
('Binod', NULL, 'KC', 'ASI', 'NP-1004', 1, 'Patrol Unit', '9851000004', 'binod.kc@nepalpolice.gov.np', 'Male', '2018-01-15', 'Active', 'Gandaki', 'Kaski', 'Pokhara Metro', '11', 'Chipledhunga, Pokhara', NULL, NULL),
('Deepa', NULL, 'Basnet', 'Head Constable', 'NP-1005', 1, 'Crime Division', '9851000005', 'deepa.basnet@nepalpolice.gov.np', 'Female', '2019-06-20', 'Active', 'Bagmati', 'Kathmandu', 'Kathmandu Metro', '10', 'Baneshwor, Kathmandu', NULL, NULL);

-- Update incharge officer for each station
UPDATE police_stations SET incharge_officer_id = (SELECT id FROM officers WHERE badge_number = 'NP-1001') WHERE station_code = 'MPC-KTM-01';
UPDATE police_stations SET incharge_officer_id = (SELECT id FROM officers WHERE badge_number = 'NP-2001') WHERE station_code = 'MPC-KTM-02';
UPDATE police_stations SET incharge_officer_id = (SELECT id FROM officers WHERE badge_number = 'NP-3001') WHERE station_code = 'MPC-KTM-03';
UPDATE police_stations SET incharge_officer_id = (SELECT id FROM officers WHERE badge_number = 'NP-4001') WHERE station_code = 'MPC-KTM-04';
UPDATE police_stations SET incharge_officer_id = (SELECT id FROM officers WHERE badge_number = 'NP-5002') WHERE station_code = 'DPC-LAL-01';
UPDATE police_stations SET incharge_officer_id = (SELECT id FROM officers WHERE badge_number = 'NP-6001') WHERE station_code = 'DPC-LAL-02';
UPDATE police_stations SET incharge_officer_id = (SELECT id FROM officers WHERE badge_number = 'NP-7001') WHERE station_code = 'DPC-BKT-01';
UPDATE police_stations SET incharge_officer_id = (SELECT id FROM officers WHERE badge_number = 'NP-8001') WHERE station_code = 'DPC-KSK-01';
-- ============================================================================
-- NATIONAL CRIME RECORDS - SEED PART 2: USERS, PERSONS, CASES & TRACKING
-- ============================================================================
-- Append this after seed_complete.sql (Part 1)
-- Uses DO $$ block for dynamic ID referencing
-- ============================================================================

-- ============================================================================
-- 3. USERS (1 StationAdmin + officers per station)
-- ============================================================================
-- Password for all: admin123
DO $$
DECLARE
  pw TEXT := '$2b$10$cOJGuhDw230bcNUAy/XZruoNC4GDM.Ww1Ry.G8d/DyMGgrUWp5I8e';
  -- Station IDs
  s1 INT; s2 INT; s3 INT; s4 INT; s5 INT; s6 INT; s7 INT; s8 INT;
  -- Officer IDs (by badge)
  o RECORD;
  -- User IDs for tracking
  u_admin INT;
  u_s1_sita INT; u_s1_mohan INT;
  u_s2_hari INT; u_s2_gita INT;
  u_s3_suresh INT; u_s3_pramila INT;
  u_s4_bikram INT; u_s4_mina INT;
  u_s5_prakash INT; u_s5_bishnu INT;
  u_s6_dipak INT; u_s6_anita INT;
  u_s7_krishna INT; u_s7_laxmi INT;
  u_s8_narayan INT; u_s8_kabita INT;
  -- Person IDs
  p1 INT; p2 INT; p3 INT; p4 INT; p5 INT; p6 INT; p7 INT; p8 INT; p9 INT; p10 INT;
  p11 INT; p12 INT; p13 INT; p14 INT; p15 INT; p16 INT; p17 INT; p18 INT; p19 INT; p20 INT;
  p21 INT; p22 INT; p23 INT; p24 INT; p25 INT; p26 INT; p27 INT; p28 INT; p29 INT; p30 INT;
  p31 INT; p32 INT; p33 INT; p34 INT; p35 INT; p36 INT; p37 INT; p38 INT; p39 INT; p40 INT;
  -- Case IDs
  c1 INT; c2 INT; c3 INT; c4 INT; c5 INT;
  c6 INT; c7 INT; c8 INT; c9 INT; c10 INT;
  c11 INT; c12 INT; c13 INT; c14 INT; c15 INT;
  c16 INT; c17 INT; c18 INT; c19 INT; c20 INT;
  c21 INT; c22 INT; c23 INT; c24 INT; c25 INT;
  c26 INT; c27 INT; c28 INT; c29 INT; c30 INT;
  c31 INT; c32 INT; c33 INT; c34 INT; c35 INT;
  c36 INT; c37 INT; c38 INT; c39 INT; c40 INT;
  -- Officer ref IDs
  of_1001 INT; of_1002 INT; of_1003 INT; of_1004 INT; of_1005 INT;
  of_2001 INT; of_2002 INT; of_2003 INT; of_2004 INT; of_2005 INT;
  of_3001 INT; of_3002 INT; of_3003 INT; of_3004 INT;
  of_4001 INT; of_4002 INT; of_4003 INT; of_4004 INT; of_4005 INT;
  of_5001 INT; of_5002 INT; of_5003 INT; of_5004 INT; of_5005 INT;
  of_6001 INT; of_6002 INT; of_6003 INT; of_6004 INT;
  of_7001 INT; of_7002 INT; of_7003 INT; of_7004 INT;
  of_8001 INT; of_8002 INT; of_8003 INT; of_8004 INT; of_8005 INT;
  cp_id INT;
BEGIN
  -- Get station IDs
  SELECT id INTO s1 FROM police_stations WHERE station_code='MPC-KTM-01';
  SELECT id INTO s2 FROM police_stations WHERE station_code='MPC-KTM-02';
  SELECT id INTO s3 FROM police_stations WHERE station_code='MPC-KTM-03';
  SELECT id INTO s4 FROM police_stations WHERE station_code='MPC-KTM-04';
  SELECT id INTO s5 FROM police_stations WHERE station_code='DPC-LAL-01';
  SELECT id INTO s6 FROM police_stations WHERE station_code='DPC-LAL-02';
  SELECT id INTO s7 FROM police_stations WHERE station_code='DPC-BKT-01';
  SELECT id INTO s8 FROM police_stations WHERE station_code='DPC-KSK-01';

  -- Get officer IDs
  SELECT id INTO of_1001 FROM officers WHERE badge_number='NP-1001';
  SELECT id INTO of_1002 FROM officers WHERE badge_number='NP-1002';
  SELECT id INTO of_1003 FROM officers WHERE badge_number='NP-1003';
  SELECT id INTO of_1004 FROM officers WHERE badge_number='NP-1004';
  SELECT id INTO of_1005 FROM officers WHERE badge_number='NP-1005';
  SELECT id INTO of_2001 FROM officers WHERE badge_number='NP-2001';
  SELECT id INTO of_2002 FROM officers WHERE badge_number='NP-2002';
  SELECT id INTO of_2003 FROM officers WHERE badge_number='NP-2003';
  SELECT id INTO of_2004 FROM officers WHERE badge_number='NP-2004';
  SELECT id INTO of_2005 FROM officers WHERE badge_number='NP-2005';
  SELECT id INTO of_3001 FROM officers WHERE badge_number='NP-3001';
  SELECT id INTO of_3002 FROM officers WHERE badge_number='NP-3002';
  SELECT id INTO of_3003 FROM officers WHERE badge_number='NP-3003';
  SELECT id INTO of_3004 FROM officers WHERE badge_number='NP-3004';
  SELECT id INTO of_4001 FROM officers WHERE badge_number='NP-4001';
  SELECT id INTO of_4002 FROM officers WHERE badge_number='NP-4002';
  SELECT id INTO of_4003 FROM officers WHERE badge_number='NP-4003';
  SELECT id INTO of_4004 FROM officers WHERE badge_number='NP-4004';
  SELECT id INTO of_4005 FROM officers WHERE badge_number='NP-4005';
  SELECT id INTO of_5001 FROM officers WHERE badge_number='NP-5001';
  SELECT id INTO of_5002 FROM officers WHERE badge_number='NP-5002';
  SELECT id INTO of_5003 FROM officers WHERE badge_number='NP-5003';
  SELECT id INTO of_5004 FROM officers WHERE badge_number='NP-5004';
  SELECT id INTO of_5005 FROM officers WHERE badge_number='NP-5005';
  SELECT id INTO of_6001 FROM officers WHERE badge_number='NP-6001';
  SELECT id INTO of_6002 FROM officers WHERE badge_number='NP-6002';
  SELECT id INTO of_6003 FROM officers WHERE badge_number='NP-6003';
  SELECT id INTO of_6004 FROM officers WHERE badge_number='NP-6004';
  SELECT id INTO of_7001 FROM officers WHERE badge_number='NP-7001';
  SELECT id INTO of_7002 FROM officers WHERE badge_number='NP-7002';
  SELECT id INTO of_7003 FROM officers WHERE badge_number='NP-7003';
  SELECT id INTO of_7004 FROM officers WHERE badge_number='NP-7004';
  SELECT id INTO of_8001 FROM officers WHERE badge_number='NP-8001';
  SELECT id INTO of_8002 FROM officers WHERE badge_number='NP-8002';
  SELECT id INTO of_8003 FROM officers WHERE badge_number='NP-8003';
  SELECT id INTO of_8004 FROM officers WHERE badge_number='NP-8004';
  SELECT id INTO of_8005 FROM officers WHERE badge_number='NP-8005';

  -- Get admin user ID
  SELECT id INTO u_admin FROM users WHERE username='admin';

  -- ========================================================================
  -- USERS: StationAdmin per station + Officer logins
  -- ========================================================================
  -- Station 1 Teku
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('sa.teku', pw, 'StationAdmin', of_1001, s1, TRUE) RETURNING id INTO u_s1_sita;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.sita', pw, 'Officer', of_1002, s1, TRUE) RETURNING id INTO u_s1_sita;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.mohan', pw, 'Officer', of_1003, s1, TRUE) RETURNING id INTO u_s1_mohan;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.binod', pw, 'Officer', of_1004, s1, TRUE);
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.deepa', pw, 'Officer', of_1005, s1, TRUE);

  -- Station 2 Durbar Marg
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('sa.durbarmarg', pw, 'StationAdmin', of_2001, s2, TRUE) RETURNING id INTO u_s2_hari;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.gita', pw, 'Officer', of_2002, s2, TRUE) RETURNING id INTO u_s2_gita;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.rajesh', pw, 'Officer', of_2003, s2, TRUE);
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.kamala', pw, 'Officer', of_2004, s2, TRUE);
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.dipendra', pw, 'Officer', of_2005, s2, TRUE);

  -- Station 3 Boudha
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('sa.boudha', pw, 'StationAdmin', of_3001, s3, TRUE) RETURNING id INTO u_s3_suresh;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.pramila', pw, 'Officer', of_3002, s3, TRUE) RETURNING id INTO u_s3_pramila;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.rajan', pw, 'Officer', of_3003, s3, TRUE);
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.sabina', pw, 'Officer', of_3004, s3, TRUE);

  -- Station 4 Maharajgunj
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('sa.maharajgunj', pw, 'StationAdmin', of_4001, s4, TRUE) RETURNING id INTO u_s4_bikram;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.mina', pw, 'Officer', of_4002, s4, TRUE) RETURNING id INTO u_s4_mina;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.arjun', pw, 'Officer', of_4003, s4, TRUE);
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.rekha', pw, 'Officer', of_4004, s4, TRUE);
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.nabin', pw, 'Officer', of_4005, s4, TRUE);

  -- Station 5 Jawalakhel
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('sa.jawalakhel', pw, 'StationAdmin', of_5002, s5, TRUE) RETURNING id INTO u_s5_prakash;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.bishnu', pw, 'Officer', of_5001, s5, TRUE) RETURNING id INTO u_s5_bishnu;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.sunita', pw, 'Officer', of_5003, s5, TRUE);
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.bibek', pw, 'Officer', of_5004, s5, TRUE);
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.puja', pw, 'Officer', of_5005, s5, TRUE);

  -- Station 6 Pulchowk
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('sa.pulchowk', pw, 'StationAdmin', of_6001, s6, TRUE) RETURNING id INTO u_s6_dipak;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.anita.m', pw, 'Officer', of_6002, s6, TRUE) RETURNING id INTO u_s6_anita;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.santosh', pw, 'Officer', of_6003, s6, TRUE);
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.kopila', pw, 'Officer', of_6004, s6, TRUE);

  -- Station 7 Suryabinayak
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('sa.suryabinayak', pw, 'StationAdmin', of_7001, s7, TRUE) RETURNING id INTO u_s7_krishna;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.laxmi', pw, 'Officer', of_7002, s7, TRUE) RETURNING id INTO u_s7_laxmi;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.roshan', pw, 'Officer', of_7003, s7, TRUE);
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.nirmala', pw, 'Officer', of_7004, s7, TRUE);

  -- Station 8 Lakeside
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('sa.lakeside', pw, 'StationAdmin', of_8001, s8, TRUE) RETURNING id INTO u_s8_narayan;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.kabita', pw, 'Officer', of_8002, s8, TRUE) RETURNING id INTO u_s8_kabita;
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.dilli', pw, 'Officer', of_8003, s8, TRUE);
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.saraswati', pw, 'Officer', of_8004, s8, TRUE);
  INSERT INTO users (username, password_hash, role, officer_id, station_id, is_active) VALUES
    ('officer.tek', pw, 'Officer', of_8005, s8, TRUE);

  -- ========================================================================
  -- 4. PERSONS (40 realistic Nepali persons)
  -- ========================================================================
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Rajendra','Prasad','Ghimire','1980-05-15','Male','Nepali','27-01-71-00123','9851023456','rajendra.g@gmail.com','Baneshwor-10','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p1;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Suman',NULL,'Karki','1988-11-22','Male','Nepali','27-01-75-09876','9841987654',NULL,'Kuleshwor-14','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p2;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Kiran','Kumar','Shrestha','1975-03-10','Male','Nepali',NULL,'9841112233','kiran.s@nabil.com','Lazimpat-2','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p3;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Anita',NULL,'Bajracharya','1992-07-08','Female','Nepali','27-01-73-11223','9803334455',NULL,'Asan-27','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p4;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Mahesh',NULL,'Thapa','1995-01-30','Male','Nepali',NULL,'9818556677',NULL,'Kalanki-14','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p5;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Pooja',NULL,'Lama','1998-04-12','Female','Nepali','27-01-76-23456','9849123456','pooja.l@gmail.com','Balkhu-14','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p6;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Rabin','Raj','Bhandari','1990-12-05','Male','Nepali','27-01-70-55667','9860112233',NULL,'Kalimati-13','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p7;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Sabin',NULL,'Shrestha','1997-08-15','Male','Nepali','27-01-77-99881','9841009988',NULL,'Sanepa-2','Lalitpur','Bagmati',NULL,NULL) RETURNING id INTO p8;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Bikram',NULL,'Ale','1985-02-20','Male','Nepali','33-02-74-00991','9813556677',NULL,'Kuleshwor-14','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p9;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Sangita','Devi','Acharya','1993-09-18','Female','Nepali','27-01-74-34567','9802445566','sangita.a@yahoo.com','Maharajgunj-3','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p10;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Dinesh',NULL,'Rai','1982-06-25','Male','Nepali','14-03-72-78901','9852334455',NULL,'Kupondole-5','Lalitpur','Bagmati',NULL,NULL) RETURNING id INTO p11;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Manisha',NULL,'Tamang','1999-01-14','Female','Nepali','27-01-78-12345','9843667788','manisha.t@hotmail.com','Jorpati-6','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p12;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Gopal','Bahadur','Magar','1978-12-03','Male','Nepali','27-01-68-54321','9841778899',NULL,'Thamel-26','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p13;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Nisha',NULL,'Gurung','1996-03-28','Female','Nepali','33-04-76-67890','9806112233',NULL,'New Road-22','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p14;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Ramesh','Prasad','Pandey','1983-07-19','Male','Nepali','27-01-73-09876','9851889900','ramesh.p@gmail.com','Baluwatar-4','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p15;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Priyanka',NULL,'Shah','2000-11-05','Female','Nepali','27-01-80-11111','9818990011',NULL,'Putalisadak-30','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p16;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Sunil','Kumar','Yadav','1987-04-08','Male','Nepali','22-05-77-22222','9847112233',NULL,'Teku-12','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p17;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Laxmi',NULL,'Khadka','1991-08-30','Female','Nepali','27-01-71-33333','9801223344',NULL,'Chabahil-7','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p18;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Arun',NULL,'Limbu','1994-02-14','Male','Nepali','14-01-74-44444','9862334455','arun.l@gmail.com','Boudha-6','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p19;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Sharmila','Devi','Adhikari','1986-10-22','Female','Nepali','27-01-66-55555','9841556677',NULL,'Patan-10','Lalitpur','Bagmati',NULL,NULL) RETURNING id INTO p20;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Dipak',NULL,'Khatri','1989-05-17','Male','Nepali','27-01-69-66666','9803667788',NULL,'Bhaktapur-3','Bhaktapur','Bagmati',NULL,NULL) RETURNING id INTO p21;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Kamala','Kumari','Basnet','1976-09-11','Female','Nepali','27-01-66-77777','9810778899','kamala.b@yahoo.com','Thimi-4','Bhaktapur','Bagmati',NULL,NULL) RETURNING id INTO p22;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Naresh',NULL,'Poudel','1984-01-26','Male','Nepali','33-06-74-88888','9856889900',NULL,'Lakeside-6','Pokhara','Gandaki',NULL,NULL) RETURNING id INTO p23;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Sarita',NULL,'Tiwari','1997-06-09','Female','Nepali','33-04-77-99999','9867990011',NULL,'Chipledhunga-11','Pokhara','Gandaki',NULL,NULL) RETURNING id INTO p24;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Bhim','Bahadur','Tharu','1979-03-05','Male','Nepali','21-01-69-10101','9848001122',NULL,'Baidam-8','Pokhara','Gandaki',NULL,NULL) RETURNING id INTO p25;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Jyoti',NULL,'Maharjan','2001-12-20','Female','Nepali','27-01-81-20202','9818223344',NULL,'Kirtipur-2','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p26;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Roshan',NULL,'Dahal','1990-07-13','Male','Nepali','27-01-70-30303','9841334455',NULL,'Koteshwor-32','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p27;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Maya',NULL,'Sherpa','1988-04-02','Female','Nepali','27-01-68-40404','9802445566','maya.s@gmail.com','Bouddha-7','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p28;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Prem','Bahadur','Tamang','1981-11-28','Male','Nepali','27-01-71-50505','9843556677',NULL,'Gongabu-29','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p29;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Rina',NULL,'Karki','1995-08-07','Female','Nepali','27-01-75-60606','9860667788',NULL,'Satdobato-14','Lalitpur','Bagmati',NULL,NULL) RETURNING id INTO p30;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Pawan',NULL,'Neupane','1986-02-16','Male','Nepali','33-04-76-70707','9867778899',NULL,'Naya Bazar-8','Pokhara','Gandaki',NULL,NULL) RETURNING id INTO p31;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Dipa','Kumari','Chaudhary','1993-05-24','Female','Nepali','22-03-73-80808','9804889900',NULL,'Damside-6','Pokhara','Gandaki',NULL,NULL) RETURNING id INTO p32;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Krishna',NULL,'Bhatt','1977-10-10','Male','Nepali','77-01-67-90909','9841990011','krishna.b@gmail.com','Putalisadak-31','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p33;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Urmila',NULL,'Subedi','1998-09-03','Female','Nepali','27-01-78-01010','9818001122',NULL,'Naxal-1','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p34;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Ganesh','Prasad','Sharma','1974-06-15','Male','Nepali','27-01-64-11112','9851112233',NULL,'Kamaladi-28','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p35;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Bipana',NULL,'Rana','2002-01-19','Female','Nepali','27-01-82-22223','9843223344',NULL,'Babarmahal-11','Kathmandu','Bagmati',NULL,NULL) RETURNING id INTO p36;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Hari',NULL,'Sunuwar','1991-12-08','Male','Nepali','14-02-71-33334','9862334455',NULL,'Suryabinayak-3','Bhaktapur','Bagmati',NULL,NULL) RETURNING id INTO p37;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Tara','Devi','Dangol','1984-08-21','Female','Nepali','27-01-64-44445','9801445566',NULL,'Taumadhi-9','Bhaktapur','Bagmati',NULL,NULL) RETURNING id INTO p38;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Manoj','Kumar','Thakur','1987-03-14','Male','Nepali','22-07-77-55556','9804556677',NULL,'Prithvi Chowk-11','Pokhara','Gandaki',NULL,NULL) RETURNING id INTO p39;
  INSERT INTO persons (first_name, middle_name, last_name, date_of_birth, gender, citizenship, national_id, contact_number, email, address, city, state, photo, signature) VALUES
  ('Sita',NULL,'BK','1996-07-30','Female','Nepali','33-04-76-66667','9867667788',NULL,'Simalchaur-17','Pokhara','Gandaki',NULL,NULL) RETURNING id INTO p40;

  RAISE NOTICE 'Created 40 persons, IDs % to %', p1, p40;

END $$;
-- CASES, CASE_PERSONS, FIR_TRACK_RECORDS
-- Run AFTER seed_complete.sql and seed_part2_users_persons.sql
DO $$
DECLARE
  s1 INT; s2 INT; s3 INT; s4 INT; s5 INT; s6 INT; s7 INT; s8 INT;
  o1 INT; o2 INT; o3 INT; o4 INT; o5 INT;
  u1 INT; u2 INT;
  cid INT;
  cpid INT;
  pid INT;
BEGIN
  SELECT id INTO s1 FROM police_stations WHERE station_code='MPC-KTM-01';
  SELECT id INTO s2 FROM police_stations WHERE station_code='MPC-KTM-02';
  SELECT id INTO s3 FROM police_stations WHERE station_code='MPC-KTM-03';
  SELECT id INTO s4 FROM police_stations WHERE station_code='MPC-KTM-04';
  SELECT id INTO s5 FROM police_stations WHERE station_code='DPC-LAL-01';
  SELECT id INTO s6 FROM police_stations WHERE station_code='DPC-LAL-02';
  SELECT id INTO s7 FROM police_stations WHERE station_code='DPC-BKT-01';
  SELECT id INTO s8 FROM police_stations WHERE station_code='DPC-KSK-01';

  -- ===================== STATION 1: TEKU (5 cases) =====================
  SELECT id INTO o1 FROM officers WHERE badge_number='NP-1002';
  SELECT id INTO o2 FROM officers WHERE badge_number='NP-1003';
  SELECT id INTO u1 FROM users WHERE username='officer.sita';
  SELECT id INTO u2 FROM users WHERE username='officer.mohan';

  -- Case T1: Banking Offense
  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-1001-2081',s1,o1,'Banking Offense','Banking Offense and Punishment Act, 2064',NOW()-INTERVAL '30 days','Nabil Bank, Teendhara Branch','Kathmandu','High','Under Investigation','Complaint regarding dishonored cheque of NPR 25,00,000 due to insufficient funds. Accused uncontactable since bounce.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-71-00123';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Filed legal notice and submitted original bounced cheque as evidence.');
  SELECT id INTO pid FROM persons WHERE national_id='27-01-75-09876';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);
  SELECT id INTO pid FROM persons WHERE last_name='Shrestha' AND first_name='Kiran';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Witness',FALSE,'Verified cheque return memo and account details as bank manager.');

  -- Case T2: Cyber Crime
  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-1002-2081',s1,o1,'Cyber Crime','Electronic Transactions Act, 2063',NOW()-INTERVAL '14 days','Social Media (Facebook)','Kathmandu','Medium','Registered','Fake Facebook profile created using victim photos without consent. Harassing messages sent to contacts.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-76-23456';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Provided screenshots of fake profile and harassing messages.');
  SELECT id INTO pid FROM persons WHERE national_id='27-01-70-55667';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  -- Case T3: Theft
  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-1003-2081',s1,o2,'Theft','Penal Code 2074, Section 203',NOW()-INTERVAL '45 days','Kalanki Chowk, Near Bus Park','Kathmandu','Medium','Charge Sheet Filed','Gold chain snatching incident near Kalanki bus park. Victim was walking home from work when two men on motorcycle snatched her necklace worth NPR 3,50,000.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-73-11223';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Victim',TRUE,'Was walking home around 7PM when two men on motorcycle grabbed chain from behind.');
  SELECT id INTO pid FROM persons WHERE last_name='Thapa' AND first_name='Mahesh';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Suspect',FALSE,'CCTV footage shows suspect near location at time of incident.');

  -- Case T4: Domestic Violence
  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-1004-2081',s1,o1,'Domestic Violence','Domestic Violence Act, 2066',NOW()-INTERVAL '10 days','Teku-12, Ward 12','Kathmandu','High','Under Investigation','Wife reports repeated physical and verbal abuse by husband. Medical report confirms injuries consistent with assault.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-71-33333';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Husband has been physically abusing me for 3 years. Last incident resulted in fractured wrist.');
  SELECT id INTO pid FROM persons WHERE national_id='22-05-77-22222';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  -- Case T5: Drug Offense
  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-1005-2081',s1,o2,'Drug Offense','Narcotics Drug Control Act, 2033',NOW()-INTERVAL '60 days','Teku, Near River Bank','Kathmandu','Critical','Closed','Seizure of 500g brown sugar during routine patrol near Teku river bank. Two suspects arrested on spot.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-69-66666';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);
  SELECT id INTO pid FROM persons WHERE national_id='27-01-70-30303';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',FALSE,NULL);

  -- ===================== STATION 2: DURBAR MARG (5 cases) =====================
  SELECT id INTO o1 FROM officers WHERE badge_number='NP-2002';
  SELECT id INTO o2 FROM officers WHERE badge_number='NP-2003';
  SELECT id INTO u1 FROM users WHERE username='officer.gita';
  SELECT id INTO u2 FROM users WHERE username='officer.rajesh';

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-2001-2081',s2,o1,'Robbery','Penal Code 2074, Section 204',NOW()-INTERVAL '20 days','New Road, Bishal Bazar','Kathmandu','High','Under Investigation','Armed robbery at a jewelry shop in Bishal Bazar. Two armed men robbed gold ornaments worth NPR 85 lakhs at gunpoint.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-68-54321';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Two masked men entered at closing time and held staff at gunpoint for 15 minutes.');
  SELECT id INTO pid FROM persons WHERE national_id='27-01-70-55667';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Suspect',FALSE,'CCTV shows suspect matching description near shop 30 min prior.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-2002-2081',s2,o1,'Fraud','Penal Code 2074, Section 213',NOW()-INTERVAL '35 days','Thamel, Tourist Area','Kathmandu','Medium','Charge Sheet Filed','Tourist scam ring defrauding foreign nationals through fake trekking agency. 8 victims identified so far with losses totaling USD 12,000.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='33-04-76-67890';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'The agency took full payment but never arranged the trek. Phone numbers disconnected.');
  SELECT id INTO pid FROM persons WHERE national_id='77-01-67-90909';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-2003-2081',s2,o2,'Assault','Penal Code 2074, Section 192',NOW()-INTERVAL '7 days','Asan Chowk, Near Temple','Kathmandu','Medium','Registered','Street fight between two groups near Asan temple. One person hospitalized with head injury.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-73-09876';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Victim',TRUE,'Was attacked without provocation while returning from evening prayer.');
  SELECT id INTO pid FROM persons WHERE national_id='27-01-70-30303';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-2004-2081',s2,o2,'Kidnapping','Penal Code 2074, Section 168',NOW()-INTERVAL '50 days','Durbar Square Area','Kathmandu','Critical','Closed','Missing 16-year-old girl found in Chitwan after anonymous tip. Two suspects arrested for human trafficking.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-82-22223';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Victim',TRUE,NULL);
  SELECT id INTO pid FROM persons WHERE national_id='27-01-71-50505';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);
  SELECT id INTO pid FROM persons WHERE national_id='27-01-64-11112';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',FALSE,'Filed missing person report for my daughter.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-2005-2081',s2,o1,'Vandalism','Penal Code 2074, Section 220',NOW()-INTERVAL '5 days','Ratna Park, Public Garden','Kathmandu','Low','Registered','Public property damage during late night gathering. Park benches and lights destroyed. Estimated damage NPR 1,20,000.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-80-11111';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Witness',FALSE,'Heard loud noises around midnight. Saw group of 4-5 young men.');

  -- ===================== STATION 3: BOUDHA (5 cases) =====================
  SELECT id INTO o1 FROM officers WHERE badge_number='NP-3002';
  SELECT id INTO o2 FROM officers WHERE badge_number='NP-3003';
  SELECT id INTO u1 FROM users WHERE username='officer.pramila';
  SELECT id INTO u2 FROM users WHERE username='officer.rajan';

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-3001-2081',s3,o1,'Burglary','Penal Code 2074, Section 205',NOW()-INTERVAL '18 days','Jorpati-6, Residential Area','Kathmandu','High','Under Investigation','House break-in while family on vacation. Cash NPR 8 lakhs and jewelry stolen. Lock broken.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-78-12345';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Returned from village trip and found house ransacked. Front lock broken.');
  SELECT id INTO pid FROM persons WHERE national_id='14-01-74-44444';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Witness',FALSE,'Saw unfamiliar person carrying bag from neighbor house around 2 AM.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-3002-2081',s3,o2,'Motor Vehicle Accident','Motor Vehicle Act, 2049',NOW()-INTERVAL '12 days','Chabahil-Jorpati Road','Kathmandu','High','Under Investigation','Hit-and-run case. Pedestrian struck by speeding car near Chabahil intersection. Victim in ICU with multiple fractures.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-71-33333';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Victim',TRUE,NULL);
  SELECT id INTO pid FROM persons WHERE national_id='27-01-68-40404';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Witness',FALSE,'Saw a red car speeding through the zebra crossing. Partial plate: Ba 1 Cha 4xxx.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-3003-2081',s3,o1,'Forgery','Penal Code 2074, Section 226',NOW()-INTERVAL '40 days','Boudha-7, Near Stupa','Kathmandu','Medium','Charge Sheet Filed','Land document forgery case. Accused used forged power of attorney to sell property worth NPR 2 crore.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-68-40404';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'My property was sold without my knowledge using forged documents.');
  SELECT id INTO pid FROM persons WHERE national_id='33-02-74-00991';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-3004-2081',s3,o2,'Theft','Penal Code 2074, Section 203',NOW()-INTERVAL '8 days','Mitrapark Area, Near School','Kathmandu','Low','Registered','Mobile phone snatching near school gate. Student reports phone grabbed by man on bicycle.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-81-20202';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Was talking on phone near school gate when man on cycle snatched it and fled.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-3005-2081',s3,o1,'Domestic Violence','Domestic Violence Act, 2066',NOW()-INTERVAL '25 days','Jorpati-8 Ward Office Area','Kathmandu','High','Under Investigation','Elderly mother reports neglect and financial abuse by son and daughter-in-law. Pension money seized forcibly.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-66-77777';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'My son takes my pension and does not provide food or medicine. I am diabetic.');
  SELECT id INTO pid FROM persons WHERE national_id='27-01-69-66666';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  -- ===================== STATION 4: MAHARAJGUNJ (5 cases) =====================
  SELECT id INTO o1 FROM officers WHERE badge_number='NP-4002';
  SELECT id INTO o2 FROM officers WHERE badge_number='NP-4003';
  SELECT id INTO u1 FROM users WHERE username='officer.mina';
  SELECT id INTO u2 FROM users WHERE username='officer.arjun';

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-4001-2081',s4,o1,'Corruption','Prevention of Corruption Act, 2059',NOW()-INTERVAL '22 days','Government Office, Baluwatar','Kathmandu','Critical','Under Investigation','Government official demanding bribe of NPR 5 lakhs for land registration approval. Audio evidence submitted.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-74-34567';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Official refused to process my application unless I paid NPR 5 lakhs.');
  SELECT id INTO pid FROM persons WHERE national_id='27-01-73-09876';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-4002-2081',s4,o2,'Assault','Penal Code 2074, Section 192',NOW()-INTERVAL '15 days','Naxal, Near Embassy Road','Kathmandu','Medium','Registered','Road rage incident. Driver attacked motorcyclist with iron rod after minor collision.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-78-01010';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Victim',TRUE,'After fender-bender the car driver came out with iron rod and hit my arm.');
  SELECT id INTO pid FROM persons WHERE national_id='22-05-77-22222';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-4003-2081',s4,o1,'Cyber Crime','Electronic Transactions Act, 2063',NOW()-INTERVAL '28 days','Online - Social Media','Kathmandu','Medium','Under Investigation','Online investment scam via Facebook. Victims lured with promise of 200% returns in cryptocurrency.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-80-11111';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Invested NPR 2 lakhs through Facebook ad. Account blocked after payment.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-4004-2081',s4,o2,'Murder','Penal Code 2074, Section 177',NOW()-INTERVAL '55 days','Lazimpat, Residential Lane','Kathmandu','Critical','Charge Sheet Filed','Body found in residential lane with stab wounds. Identified as local shopkeeper. Suspect is business rival.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='77-01-67-90909';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Victim',TRUE,NULL);
  SELECT id INTO pid FROM persons WHERE national_id='27-01-75-09876';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);
  SELECT id INTO pid FROM persons WHERE national_id='14-03-72-78901';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Witness',FALSE,'Heard shouting around 11 PM. Saw shadow running from the lane.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-4005-2081',s4,o1,'Drug Offense','Narcotics Drug Control Act, 2033',NOW()-INTERVAL '3 days','Maharajgunj, Near Hospital','Kathmandu','High','Registered','Suspicious package found near hospital boundary. Initial test positive for methamphetamine.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE first_name='Mahesh' AND last_name='Thapa';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Suspect',FALSE,'Seen loitering near drop location on multiple occasions per CCTV.');

  -- ===================== STATION 5: JAWALAKHEL (5 cases) =====================
  SELECT id INTO o1 FROM officers WHERE badge_number='NP-5001';
  SELECT id INTO o2 FROM officers WHERE badge_number='NP-5003';
  SELECT id INTO u1 FROM users WHERE username='officer.bishnu';
  SELECT id INTO u2 FROM users WHERE username='officer.sunita';

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-5001-2081',s5,o1,'Fraud','Penal Code 2074, Section 213',NOW()-INTERVAL '32 days','Kupondole, Lalitpur','Lalitpur','High','Under Investigation','Real estate fraud. Accused sold same plot of land to three different buyers using duplicate ownership certificates. Total fraud amount NPR 1.5 crore.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-66-55555';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Paid full amount for land but title deed is fake. Two other buyers also have same plot number.');
  SELECT id INTO pid FROM persons WHERE national_id='14-03-72-78901';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-5002-2081',s5,o2,'Domestic Violence','Domestic Violence Act, 2066',NOW()-INTERVAL '16 days','Jawalakhel-4, Lalitpur','Lalitpur','High','Under Investigation','Woman reports dowry harassment and threats by in-laws demanding additional dowry of NPR 10 lakhs.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-75-60606';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'In-laws demand additional dowry. Husband threatens divorce. Daily verbal abuse.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-5003-2081',s5,o1,'Theft','Penal Code 2074, Section 203',NOW()-INTERVAL '42 days','Lalitpur Metro, Ward 6','Lalitpur','Medium','Closed','Motorcycle theft from parking lot. Vehicle recovered from Birgunj border. Thief arrested.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-77-99881';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'My motorcycle Ba 42 Pa 7891 was stolen from office parking.');
  SELECT id INTO pid FROM persons WHERE national_id='27-01-70-30303';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-5004-2081',s5,o2,'Assault','Penal Code 2074, Section 192',NOW()-INTERVAL '9 days','Pulchowk Engineering Campus Area','Lalitpur','Medium','Registered','Eve-teasing escalated to physical assault near campus gate. Female student slapped by group of men.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-81-20202';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Victim',TRUE,'Group of 3 men started teasing. When I objected, one slapped me.');
  SELECT id INTO pid FROM persons WHERE national_id='27-01-77-99881';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Witness',FALSE,'I was nearby and saw the incident. Called police immediately.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-5005-2081',s5,o1,'Corruption','Prevention of Corruption Act, 2059',NOW()-INTERVAL '38 days','Lalitpur Sub-Metropolitan Office','Lalitpur','High','Charge Sheet Filed','Building permit officer accepting bribes for fast-tracking approvals. Sting operation conducted.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-71-00123';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Was asked to pay NPR 2 lakhs to get building permit approved within a week.');
  SELECT id INTO pid FROM persons WHERE national_id='27-01-64-11112';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  -- ===================== STATION 6: PULCHOWK (5 cases) =====================
  SELECT id INTO o1 FROM officers WHERE badge_number='NP-6001';
  SELECT id INTO o2 FROM officers WHERE badge_number='NP-6002';
  SELECT id INTO u1 FROM users WHERE username='sa.pulchowk';
  SELECT id INTO u2 FROM users WHERE username='officer.anita.m';

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-6001-2081',s6,o1,'Motor Vehicle Accident','Motor Vehicle Act, 2049',NOW()-INTERVAL '11 days','Sanepa-Ekantakuna Road','Lalitpur','High','Under Investigation','Bus vs microbus collision injuring 12 passengers. Bus driver suspected of driving under influence.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-66-55555';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Victim',FALSE,'Was in microbus. Bus came from opposite lane at high speed.');
  SELECT id INTO pid FROM persons WHERE national_id='27-01-71-50505';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-6002-2081',s6,o2,'Burglary','Penal Code 2074, Section 205',NOW()-INTERVAL '24 days','Ekantakuna-8, Shop Area','Lalitpur','Medium','Under Investigation','Electronics shop burglary. Goods worth NPR 15 lakhs stolen overnight. Alarm system disabled professionally.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='14-03-72-78901';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Alarm was disabled. Locks cut with professional tools. All laptops and phones stolen.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-6003-2081',s6,o1,'Fraud','Penal Code 2074, Section 213',NOW()-INTERVAL '48 days','Sanepa, NGO Office','Lalitpur','Medium','Closed','NGO fund embezzlement by accountant. NPR 35 lakhs misappropriated over 2 years through fake expense claims.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE first_name='Kiran' AND last_name='Shrestha';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Internal audit revealed systematic fund misappropriation through fake vendor invoices.');
  SELECT id INTO pid FROM persons WHERE national_id='22-05-77-22222';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-6004-2081',s6,o2,'Theft','Penal Code 2074, Section 203',NOW()-INTERVAL '4 days','Pulchowk, Near IOE Campus','Lalitpur','Low','Registered','Bicycle theft from college parking. Student reports locked bicycle stolen during class hours.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-82-22223';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Left bicycle locked at campus parking at 8 AM. Gone when returned at 2 PM.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-6005-2081',s6,o1,'Cyber Crime','Electronic Transactions Act, 2063',NOW()-INTERVAL '19 days','Online Banking','Lalitpur','High','Under Investigation','Online banking fraud. NPR 4.5 lakhs transferred from victim account via SIM swap attack.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-75-60606';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Received no OTPs. Bank shows 3 transfers I never authorized. SIM was cloned.');

  -- ===================== STATION 7: SURYABINAYAK (5 cases) =====================
  SELECT id INTO o1 FROM officers WHERE badge_number='NP-7002';
  SELECT id INTO o2 FROM officers WHERE badge_number='NP-7003';
  SELECT id INTO u1 FROM users WHERE username='officer.laxmi';
  SELECT id INTO u2 FROM users WHERE username='officer.roshan';

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-7001-2081',s7,o1,'Assault','Penal Code 2074, Section 192',NOW()-INTERVAL '13 days','Suryabinayak-3, Market Area','Bhaktapur','Medium','Under Investigation','Physical assault during land dispute. Neighbor attacked complainant with wooden stick causing injuries.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='14-02-71-33334';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Land boundary dispute escalated. Neighbor attacked with lathi. I have 7 stitches.');
  SELECT id INTO pid FROM persons WHERE national_id='27-01-69-66666';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-7002-2081',s7,o2,'Theft','Penal Code 2074, Section 203',NOW()-INTERVAL '30 days','Katunje-5, Brick Factory Area','Bhaktapur','Medium','Charge Sheet Filed','Copper wiring theft from under-construction building. Workers caught on CCTV.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-66-77777';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Copper wiring worth NPR 3 lakhs stolen from construction site overnight.');
  SELECT id INTO pid FROM persons WHERE first_name='Mahesh' AND last_name='Thapa';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-7003-2081',s7,o1,'Forgery','Penal Code 2074, Section 226',NOW()-INTERVAL '6 days','Bhaktapur Durbar Square Area','Bhaktapur','Medium','Registered','Antique artifact forgery and illegal sale. Fake UNESCO heritage items sold to tourists as genuine.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-64-44445';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Tourist complained to ward office about fake antiques sold as genuine heritage.'); 

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-7004-2081',s7,o2,'Drug Offense','Narcotics Drug Control Act, 2033',NOW()-INTERVAL '44 days','Sallaghari-Katunje Road','Bhaktapur','Critical','Under Investigation','Cannabis cultivation in private farm. 200 plants discovered during routine check.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='14-02-71-33334';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Witness',FALSE,'Noticed unusual activity in neighboring farm fields at night.');
  SELECT id INTO pid FROM persons WHERE national_id='27-01-69-66666';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-7005-2081',s7,o1,'Motor Vehicle Accident','Motor Vehicle Act, 2049',NOW()-INTERVAL '2 days','Arniko Highway, Near Suryabinayak','Bhaktapur','High','Registered','Truck overturned on highway blocking traffic. Driver and helper injured. Brake failure suspected.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='27-01-64-44445';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Witness',FALSE,'Truck was descending at high speed. Suddenly swerved and overturned.');

  -- ===================== STATION 8: LAKESIDE POKHARA (5 cases) =====================
  SELECT id INTO o1 FROM officers WHERE badge_number='NP-8002';
  SELECT id INTO o2 FROM officers WHERE badge_number='NP-8003';
  SELECT id INTO u1 FROM users WHERE username='officer.kabita';
  SELECT id INTO u2 FROM users WHERE username='officer.dilli';

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-8001-2081',s8,o1,'Theft','Penal Code 2074, Section 203',NOW()-INTERVAL '17 days','Lakeside-6, Hotel Area','Kaski','Medium','Under Investigation','Tourist hotel room theft. Laptop, camera, and USD 800 cash stolen from room during breakfast time.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='33-06-74-88888';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Left room locked for breakfast. Upon return found window broken and valuables missing.');
  SELECT id INTO pid FROM persons WHERE national_id='33-04-76-70707';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Suspect',FALSE,'Hotel staff reported seeing unfamiliar person near staff entrance.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-8002-2081',s8,o2,'Fraud','Penal Code 2074, Section 213',NOW()-INTERVAL '36 days','Baidam-8, Travel Agency','Kaski','High','Charge Sheet Filed','Paragliding company operating without license. Tourist injured during unlicensed flight. Company forged safety certificates.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='33-04-77-99999';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Victim',FALSE,'Was injured during landing. Later found company had no valid license.');
  SELECT id INTO pid FROM persons WHERE national_id='21-01-69-10101';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-8003-2081',s8,o1,'Assault','Penal Code 2074, Section 192',NOW()-INTERVAL '8 days','Damside, Bar Area','Kaski','Medium','Registered','Bar fight involving tourists and locals. 3 persons injured. Property damage to bar.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='21-01-69-10101';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Group of drunk tourists started fight. My bar furniture destroyed.');
  SELECT id INTO pid FROM persons WHERE national_id='33-04-76-70707';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Witness',FALSE,'Saw the entire fight. Locals tried to stop but tourists were aggressive.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-8004-2081',s8,o2,'Kidnapping','Penal Code 2074, Section 168',NOW()-INTERVAL '52 days','Prithvi Chowk, Bus Station','Kaski','Critical','Closed','Missing teenage girl from Pokhara found in India. Cross-border trafficking ring busted with Nepal Police-Indian Police collaboration.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='33-04-76-66667';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Victim',TRUE,NULL);
  SELECT id INTO pid FROM persons WHERE national_id='22-07-77-55556';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Accused',TRUE,NULL);
  SELECT id INTO pid FROM persons WHERE national_id='22-03-73-80808';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',FALSE,'My daughter went missing after school. She never reached home.');

  INSERT INTO cases (fir_no,station_id,officer_id,crime_type,crime_section,incident_date_time,incident_location,incident_district,case_priority,case_status,summary)
  VALUES ('FIR-8005-2081',s8,o1,'Vandalism','Penal Code 2074, Section 220',NOW()-INTERVAL '6 days','Phewa Lake, Boat Parking','Kaski','Low','Registered','Three rental boats damaged overnight at Phewa Lake boat parking. Holes drilled in hulls. Estimated loss NPR 2 lakhs.') RETURNING case_id INTO cid;
  SELECT id INTO pid FROM persons WHERE national_id='33-06-74-88888';
  INSERT INTO case_persons (case_id,person_id,role,is_primary,statement) VALUES (cid,pid,'Complainant',TRUE,'Found 3 of my boats sinking in morning. Each had drill holes in hull bottom.');

  RAISE NOTICE 'All 40 cases created successfully across 8 stations.';
END $$;
