-- ============================================================================
-- SEED: FIR TRACK RECORDS + SUPPLEMENTARY STATEMENTS
-- ============================================================================
-- Run AFTER seed_complete.sql
-- ============================================================================

TRUNCATE supplementary_statements RESTART IDENTITY CASCADE;
TRUNCATE fir_track_records RESTART IDENTITY CASCADE;

-- ============================================================================
-- BLOCK 1: Resolve IDs + Station 1 (Teku) + Station 2 (Durbar Marg)
-- ============================================================================
DO $$
DECLARE
  s1 INT; s2 INT; s3 INT; s4 INT; s5 INT; s6 INT; s7 INT; s8 INT;
  u_admin INT;
  u_s1_sa INT; u_s1_sita INT; u_s1_mohan INT; u_s1_binod INT; u_s1_deepa INT;
  u_s2_sa INT; u_s2_gita INT; u_s2_rajesh INT; u_s2_kamala INT; u_s2_dipendra INT;
  c_t1 INT; c_t2 INT; c_t3 INT; c_t4 INT; c_t5 INT;
  c_d1 INT; c_d2 INT; c_d3 INT; c_d4 INT; c_d5 INT;
  cp_id INT; fir_dt TIMESTAMP;
BEGIN
  SELECT id INTO s1 FROM police_stations WHERE station_code='MPC-KTM-01';
  SELECT id INTO s2 FROM police_stations WHERE station_code='MPC-KTM-02';
  SELECT id INTO u_admin        FROM users WHERE username='admin';
  SELECT id INTO u_s1_sa        FROM users WHERE username='sa.teku';
  SELECT id INTO u_s1_sita      FROM users WHERE username='officer.sita';
  SELECT id INTO u_s1_mohan     FROM users WHERE username='officer.mohan';
  SELECT id INTO u_s1_binod     FROM users WHERE username='officer.binod';
  SELECT id INTO u_s1_deepa     FROM users WHERE username='officer.deepa';
  SELECT id INTO u_s2_sa        FROM users WHERE username='sa.durbarmarg';
  SELECT id INTO u_s2_gita      FROM users WHERE username='officer.gita';
  SELECT id INTO u_s2_rajesh    FROM users WHERE username='officer.rajesh';
  SELECT id INTO u_s2_kamala    FROM users WHERE username='officer.kamala';
  SELECT id INTO u_s2_dipendra  FROM users WHERE username='officer.dipendra';
  SELECT case_id INTO c_t1 FROM cases WHERE fir_no='FIR-1001-2081';
  SELECT case_id INTO c_t2 FROM cases WHERE fir_no='FIR-1002-2081';
  SELECT case_id INTO c_t3 FROM cases WHERE fir_no='FIR-1003-2081';
  SELECT case_id INTO c_t4 FROM cases WHERE fir_no='FIR-1004-2081';
  SELECT case_id INTO c_t5 FROM cases WHERE fir_no='FIR-1005-2081';
  SELECT case_id INTO c_d1 FROM cases WHERE fir_no='FIR-2001-2081';
  SELECT case_id INTO c_d2 FROM cases WHERE fir_no='FIR-2002-2081';
  SELECT case_id INTO c_d3 FROM cases WHERE fir_no='FIR-2003-2081';
  SELECT case_id INTO c_d4 FROM cases WHERE fir_no='FIR-2004-2081';
  SELECT case_id INTO c_d5 FROM cases WHERE fir_no='FIR-2005-2081';

  -- ======== STATION 1: TEKU ========

  -- FIR-1001-2081 | Banking Offense | Under Investigation
  SELECT fir_date_time INTO fir_dt FROM cases WHERE case_id=c_t1;
  INSERT INTO fir_track_records (case_id,action_type,old_status,new_status,action_description,performed_by_user_id,track_date_time) VALUES
  (c_t1,'Registration',        NULL,                 'Registered',          'FIR registered electronically. Assigned to Inspector Sita Sharma. Original cheque and loan agreement received.',                                    u_s1_sita,  fir_dt),
  (c_t1,'Status Change',       'Registered',         'Under Investigation', 'Bank notified to preserve all account records. Account freeze request sent to Nabil Bank Teendhara Branch.',                                         u_s1_sita,  fir_dt+INTERVAL '4 days'),
  (c_t1,'Statement Recorded',  'Under Investigation','Under Investigation', 'Bank manager Kiran Kumar Shrestha recorded as witness. Cheque return memo and 6-month statement obtained.',                                           u_s1_sita,  fir_dt+INTERVAL '9 days'),
  (c_t1,'Evidence Collected',  'Under Investigation','Under Investigation', 'Original bounced cheque, signed loan agreement, and certified bank statement filed as exhibits E-1, E-2, E-3.',                                       u_s1_mohan, fir_dt+INTERVAL '11 days'),
  (c_t1,'Notice Issued',       'Under Investigation','Under Investigation', 'Legal notice sent by registered post to accused last known address at Kuleshwor-14. Returned uncollected.',                                           u_s1_sita,  fir_dt+INTERVAL '18 days'),
  (c_t1,'Investigation Update','Under Investigation','Under Investigation', 'Accused located at relative house in Pokhara-6. Coordination with Kaski District Police. Court warrant issued.',                                      u_s1_mohan, fir_dt+INTERVAL '25 days');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_t1 AND role='Complainant' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'I lent NPR 25,00,000 to Suman Karki in three installments between Shrawan and Poush 2080 under a notarized agreement. He gave me a cheque dated 2081-01-15 as full repayment. When I deposited it at Nabil Bank Teendhara Branch on 2081-01-18 it was returned on 2081-01-20 marked Insufficient Funds. Since that day his phone is switched off and his landlord confirmed he vacated Kuleshwor-14 two weeks prior. I am submitting the original cheque, bank return memo, and the signed loan agreement.',
   fir_dt+INTERVAL '3 days',u_s1_sita,'Complainant submitted 3 original documents. Copies retained as exhibits E-1 E-2 E-3.'),
  (cp_id,'I personally visited Nabil Bank and confirmed the account had only NPR 12,450 at time of cheque presentment. I had sent him a written demand notice 10 days before depositing the cheque. He started avoiding my calls weeks before the cheque date. I believe this was deliberate fraud. I request the court to order attachment of any property in his name.',
   fir_dt+INTERVAL '12 days',u_s1_sita,'Complainant submitted written demand notice copy. Property attachment request forwarded to court.');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_t1 AND role='Accused' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'Accused could not be located for initial statement. Legal notice delivered by post returned uncollected. Pokhara District Police alerted with photograph and identification details.',
   fir_dt+INTERVAL '19 days',u_s1_mohan,'Accused absconding. Inter-district coordination activated.'),
  (cp_id,'Accused produced at Teku MPC after being located at relative house in Pokhara-6. He denied intentional fraud claiming the cheque was issued expecting an incoming bank transfer that was delayed. He admitted being aware of the bounce but said he panicked and fled to avoid confrontation. Statement recorded under Section 26 caution.',
   fir_dt+INTERVAL '26 days',u_s1_mohan,'Accused produced. Denies criminal intent. Claims civil misunderstanding. Remanded for further investigation.');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_t1 AND role='Witness' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'I am Branch Manager of Nabil Bank Teendhara Branch. Cheque number 004521 on account 01-180100-XXXXX was presented on 2081-01-18 and returned unpaid on 2081-01-20. Account balance at presentment was NPR 12,450. No overdraft facility is attached. The account had zero transactions in the 45 days preceding presentment. I am submitting the certified account statement and cheque return memo.',
   fir_dt+INTERVAL '9 days',u_s1_sita,'Bank manager provided certified statement and cheque return memo. Filed as exhibit E-2 and E-3.'),
  (cp_id,'I have additionally verified that the account holder made no attempt to deposit funds between the cheque issue date and presentment date. The account appears to have been deliberately kept below the cheque amount. I am providing the complete 6-month transaction history as requested.',
   fir_dt+INTERVAL '14 days',u_s1_mohan,'Six-month history confirms deliberate inactivity. Strengthens prosecution case. Exhibit E-3 updated.');

  -- FIR-1002-2081 | Cyber Crime | Under Investigation
  SELECT fir_date_time INTO fir_dt FROM cases WHERE case_id=c_t2;
  INSERT INTO fir_track_records (case_id,action_type,old_status,new_status,action_description,performed_by_user_id,track_date_time) VALUES
  (c_t2,'Registration',        NULL,                 'Registered',          'FIR filed by victim Pooja Lama with screenshots of fake Facebook profile as primary evidence.',              u_s1_sita,  fir_dt),
  (c_t2,'Evidence Collected',  'Registered',         'Registered',          'Screenshots of fake profile and 12 harassing messages to contacts printed and filed as exhibits D-1 to D-13.',u_s1_sita,  fir_dt+INTERVAL '2 days'),
  (c_t2,'Referral',            'Registered',         'Registered',          'Digital evidence and case details forwarded to Nepal Police Cyber Bureau for IP address tracing.',            u_s1_mohan, fir_dt+INTERVAL '4 days'),
  (c_t2,'Status Change',       'Registered',         'Under Investigation', 'Cyber Bureau accepted referral. Facebook account data request initiated via official process.',               u_s1_sita,  fir_dt+INTERVAL '7 days'),
  (c_t2,'Investigation Update','Under Investigation','Under Investigation', 'Accused Rabin Raj Bhandari summoned to station. Mobile phone seized for digital forensic examination.',       u_s1_mohan, fir_dt+INTERVAL '10 days');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_t2 AND role='Complainant' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'I discovered the fake profile when my cousin called asking why I sent a money request. My real profile was still active. The fake account copied my profile picture, cover photo and 11 photos from my public albums and messaged all my contacts claiming I was stranded in Dubai needing NPR 50,000 urgently. At least 3 contacts had already transferred money to a number provided by the fake account. Total amount lost by contacts is approximately NPR 1,50,000.',
   fir_dt+INTERVAL '1 day',u_s1_sita,'Three contacts confirmed they transferred money. Receiving phone numbers recorded for tracing. Contacts to be recorded as complainants in separate filings.'),
  (cp_id,'Rabin Raj Bhandari had been sending unwanted romantic messages to me for 2 months which I ignored and eventually blocked on 2081-06-28. The fake profile appeared on 2081-07-01 exactly 3 days after blocking. I have WhatsApp screenshots of his prior harassment and the blocking timestamp visible in my chat settings. I believe he created the fake profile out of revenge.',
   fir_dt+INTERVAL '6 days',u_s1_sita,'WhatsApp harassment history and blocking timestamp submitted. Timeline strongly links accused to fake profile creation. Filed as exhibit D-14.');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_t2 AND role='Accused' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'Accused Rabin Raj Bhandari appeared voluntarily when summoned. He denied creating any fake profile and stated he deleted Facebook 6 months ago. He claims he has not contacted the complainant in months. He was asked to unlock his mobile for inspection and complied. WhatsApp chats showing messages to complainant found despite his denial.',
   fir_dt+INTERVAL '8 days',u_s1_mohan,'Phone seized. Prior WhatsApp contact with complainant found contradicting accused denial. Forensic analysis ordered at CIB Digital Lab.'),
  (cp_id,'Cyber Bureau preliminary IP trace links the fake profile creation to a mobile internet session from a tower in Kalimati ward consistent with accused home address at Kalimati-13. When confronted accused went silent and requested a lawyer. Device sent to CIB Digital Forensics Lab for full data extraction.',
   fir_dt+INTERVAL '11 days',u_s1_mohan,'IP evidence documented. Accused invoking right to counsel. Forensic lab report awaited. Case file referred to cyber crime prosecution unit.');

  -- FIR-1003-2081 | Theft Gold Chain Snatching | Charge Sheet Filed
  SELECT fir_date_time INTO fir_dt FROM cases WHERE case_id=c_t3;
  INSERT INTO fir_track_records (case_id,action_type,old_status,new_status,action_description,performed_by_user_id,track_date_time) VALUES
  (c_t3,'Registration',       NULL,                 'Registered',          'FIR registered. Victim Anita Bajracharya gave initial statement. Medical certificate for neck laceration obtained.',u_s1_mohan, fir_dt),
  (c_t3,'Status Change',      'Registered',         'Under Investigation', 'CCTV footage collected from 6 roadside shops along Kalanki Road and reviewed.',                                       u_s1_mohan, fir_dt+INTERVAL '4 days'),
  (c_t3,'Suspect Identified', 'Under Investigation','Under Investigation', 'Partial motorcycle plate Ba-1-Cha traced. Suspect Mahesh Thapa identified from CCTV still frames.',                    u_s1_binod, fir_dt+INTERVAL '9 days'),
  (c_t3,'Arrest Made',        'Under Investigation','Under Investigation', 'Suspect Mahesh Thapa arrested from Kalanki at 10 AM. Pulsar 150 motorcycle seized as evidence.',                       u_s1_mohan, fir_dt+INTERVAL '15 days'),
  (c_t3,'Evidence Collected', 'Under Investigation','Under Investigation', 'Gold chain recovered from Balaju pawn shop. Victim identified chain via unique custom clasp. Filed as exhibit P-1.',   u_s1_binod, fir_dt+INTERVAL '16 days'),
  (c_t3,'Status Change',      'Under Investigation','Charge Sheet Filed',  'Charge sheet filed at Kathmandu District Court under Penal Code 2074 Section 327. Co-accused lookout active.',         u_s1_mohan, fir_dt+INTERVAL '25 days');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_t3 AND role='Victim' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'I was walking home along Kalanki Road at approximately 7:10 PM after finishing my shift at the garment factory. I was wearing a 22-carat gold chain gifted by my mother at my wedding. Two men on a dark Pulsar 150 motorcycle came from behind. The pillion rider grabbed my chain from the back with both hands and yanked it hard. The clasp cut the back of my neck as it snapped. They sped off towards Ring Road. A nearby shop owner helped me up and called the police.',
   fir_dt+INTERVAL '1 day',u_s1_mohan,'Neck laceration documented. Medical certificate shows 2cm cut. Shop owner identified as Ramji Sahu to be formally recorded.'),
  (cp_id,'I have examined the gold chain recovered from Balaju pawn shop. I confirm it is my chain. It has a custom heart-shaped clasp I had made at Dharahara Jewellers in 2079. No other chain has this exact design. The jeweller can confirm this. I also identify the person in the CCTV screenshot as the man who grabbed my chain. I am fully willing to testify before the court.',
   fir_dt+INTERVAL '16 days',u_s1_mohan,'Victim confirmed chain via unique clasp. Jeweller Dharahara to be contacted to corroborate custom design. Identification parade result filed.');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_t3 AND role='Suspect' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'I am a construction laborer working in Kalanki. I was on my motorcycle that evening returning from a work site. I stopped at Balaju pawn shop to sell my own gold ring not any stolen chain. I did not snatch anything from anyone. I do not know this woman.',
   fir_dt+INTERVAL '15 days',u_s1_mohan,'Accused denies charge. Pawn shop register checked. Pawn shop owner Ramji Sahu to be questioned. Accused in remand.'),
  (cp_id,'Pawn shop owner Ramji Sahu confirmed accused Mahesh Thapa sold a 22-carat gold chain matching description on the evening of the incident and signed the purchase register at 7:35 PM. Confronted with this the accused admitted to the snatching but claims his motorcycle driver planned the crime. He provided a partial description of the co-accused. Statement recorded under legal caution.',
   fir_dt+INTERVAL '20 days',u_s1_binod,'Partial confession recorded. Co-accused description circulated to all Kathmandu units. Lookout notice issued. Pawn shop register filed as exhibit P-2.');

  -- FIR-1004-2081 | Domestic Violence | Under Investigation
  SELECT fir_date_time INTO fir_dt FROM cases WHERE case_id=c_t4;
  INSERT INTO fir_track_records (case_id,action_type,old_status,new_status,action_description,performed_by_user_id,track_date_time) VALUES
  (c_t4,'Registration',       NULL,                 'Registered',          'FIR registered at Women Cell. Complainant Laxmi Khadka accompanied by Maiti Nepal NGO worker.',                   u_s1_sita,  fir_dt),
  (c_t4,'Medical Referral',   'Registered',         'Registered',          'Complainant referred to Kanti Hospital for examination. Children confirmed safe at maternal grandparents in Lalitpur.',u_s1_sita, fir_dt+INTERVAL '1 day'),
  (c_t4,'Status Change',      'Registered',         'Under Investigation', 'Medical report received. Hairline fracture on right wrist and bruising. Injury pattern inconsistent with accidental fall.',u_s1_sita,fir_dt+INTERVAL '3 days'),
  (c_t4,'Accused Summoned',   'Under Investigation','Under Investigation', 'Accused Sunil Kumar Yadav summoned and appeared. Denied all charges. Statement recorded under caution.',             u_s1_mohan, fir_dt+INTERVAL '5 days'),
  (c_t4,'Protection Order',   'Under Investigation','Under Investigation', 'Temporary protection order issued by Kathmandu District Court. Complainant transferred to Women Shelter Teku.',      u_s1_sita,  fir_dt+INTERVAL '7 days'),
  (c_t4,'Witness Statement',  'Under Investigation','Under Investigation', 'Two neighbours recorded statements corroborating repeated incidents over 3 years. Statements filed in case diary.',  u_s1_sita,  fir_dt+INTERVAL '9 days');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_t4 AND role='Complainant' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'My husband Sunil Kumar Yadav has physically abused me since the second year of our marriage in 2077. The beatings happen mostly when he returns drunk at night. On the night of 2081 Kartik 26 he struck my right wrist repeatedly with a metal curtain rod after I refused to give him money for alcohol. I could not move my fingers the next morning. I did not report earlier because he threatened to harm our two children. My children are now safe at my parents home in Lalitpur.',
   fir_dt+INTERVAL '2 days',u_s1_sita,'Complainant visibly distressed. Hairline fracture confirmed by Kanti Hospital. Children safety verified by ward police. NGO counselor assigned.'),
  (cp_id,'I wish to press full charges. Prior incidents I recall: 2080 Bhadra 14 he threw a plate at my head causing a cut, 2080 Mangsir 2 he kicked me repeatedly, 2081 Chaitra 8 he choked me until I lost consciousness briefly. My neighbour Kamala Devi downstairs has heard the screaming on multiple occasions and once came up to check on me. I did not report because I had no money and was afraid of losing my children.',
   fir_dt+INTERVAL '8 days',u_s1_sita,'Four prior incidents documented. Neighbour Kamala Devi corroborated separately. Financial dependency noted as key barrier to earlier reporting.');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_t4 AND role='Accused' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'My wife is fabricating this to take the house with her family. We had an argument that night but I never struck her. Her wrist injury was from slipping in the bathroom earlier that week. She has always wanted to leave and is using the police to do it.',
   fir_dt+INTERVAL '5 days',u_s1_mohan,'Bathroom fall claim rejected. Hospital report states bruise age and fracture pattern consistent with forceful blunt strike not a fall. Medical opinion filed as exhibit M-2.'),
  (cp_id,'Accused was served the temporary protection order and warned of legal consequences of violation. He became visibly agitated and stated he would deal with this matter in his own way which was recorded verbatim as a potential threat. He was formally warned. Court date 2081-11-20 communicated.',
   fir_dt+INTERVAL '9 days',u_s1_mohan,'Implicit threat recorded in case diary. Protection order enforcement unit alerted. Accused warned of contempt consequences.');

  -- FIR-1005-2081 | Drug Offense | Closed
  SELECT fir_date_time INTO fir_dt FROM cases WHERE case_id=c_t5;
  INSERT INTO fir_track_records (case_id,action_type,old_status,new_status,action_description,performed_by_user_id,track_date_time) VALUES
  (c_t5,'Registration',       NULL,                 'Registered',         'FIR registered after patrol team seized 500g suspected narcotic substance near Teku riverbank.',                     u_s1_mohan, fir_dt),
  (c_t5,'Arrest Made',        'Registered',         'Registered',         'Dipak Khatri and Roshan Dahal arrested at scene. Substance sealed and labelled exhibit N-001.',                      u_s1_binod, fir_dt+INTERVAL '2 hours'),
  (c_t5,'Evidence Collected', 'Registered',         'Registered',         'Sealed exhibit N-001 sent to Government Drug Testing Lab Kathmandu for narcotic analysis.',                          u_s1_deepa, fir_dt+INTERVAL '1 day'),
  (c_t5,'Status Change',      'Registered',         'Under Investigation','Both accused sent to judicial remand pending lab results. Investigation unit formally assigned.',                     u_s1_mohan, fir_dt+INTERVAL '4 days'),
  (c_t5,'Lab Report',         'Under Investigation','Under Investigation', 'Lab confirms diacetylmorphine (brown sugar) at 78% purity. Net weight 498g. Lab certificate filed as exhibit N-002.',u_s1_binod, fir_dt+INTERVAL '20 days'),
  (c_t5,'Status Change',      'Under Investigation','Charge Sheet Filed',  'Charge sheet filed under Narcotics Drug Control Act 2033 Section 9 against both accused.',                          u_s1_mohan, fir_dt+INTERVAL '25 days'),
  (c_t5,'Court Hearing',      'Charge Sheet Filed', 'Charge Sheet Filed', 'District Court preliminary hearing held. Prosecution evidence admitted. Bail application rejected. Trial date set.',  u_s1_deepa, fir_dt+INTERVAL '45 days'),
  (c_t5,'Status Change',      'Charge Sheet Filed', 'Closed',             'Dipak Khatri sentenced 10 years. Roshan Dahal sentenced 8 years imprisonment. Case closed.',                         u_s1_sa,    fir_dt+INTERVAL '55 days');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_t5 AND role='Accused' AND person_id=(SELECT id FROM persons WHERE national_id='27-01-69-66666') LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'I was resting near the river after my shift at the brick kiln. An unknown man asked me to hold his bag for 10 minutes while he made a phone call. I agreed without asking what was inside. The police arrived while I was holding the bag. I had no knowledge of its contents.',
   fir_dt+INTERVAL '1 day',u_s1_mohan,'Claim of innocent possession investigated. No supporting witnesses found. Accused has one prior police record for loitering near a known narcotics area in Teku.'),
  (cp_id,'Following lab confirmation accused Dipak Khatri admitted during second interrogation that he knowingly agreed to carry the package for NPR 5,000 paid by a person he knew only as Daju. Contact was through a prepaid SIM that has since been discarded. He denies Roshan was involved in the arrangement.',
   fir_dt+INTERVAL '22 days',u_s1_binod,'Partial admission recorded. Burner SIM confirmed discarded. Call records from telecom provider obtained. Daju identity under active investigation.');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_t5 AND role='Accused' AND person_id=(SELECT id FROM persons WHERE national_id='27-01-70-30303') LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'I went to the riverbank with Dipak as a friend for an evening walk. I had no idea he was there to deliver anything illegal. I have worked at a garment factory for 5 years and have no criminal record. I want legal support and request the court to consider my situation.',
   fir_dt+INTERVAL '1 day',u_s1_mohan,'Factory employment verified. No prior criminal record confirmed. CCTV from Teku bridge shows both accused arriving together carrying the bag before splitting.'),
  (cp_id,'When shown CCTV footage of himself handling the bag at a location 300m from the riverbank 20 minutes before patrol arrived, accused admitted he knew Dipak was delivering something illegal but claimed he thought it was contraband cigarettes. Court found wilful participation sufficient for conviction under NDCA 2033.',
   fir_dt+INTERVAL '22 days',u_s1_binod,'Admission of knowing participation recorded. Defence of ignorance of substance type rejected. Convicted on all counts.');

  -- ======== STATION 2: DURBAR MARG ========

  -- FIR-2001-2081 | Robbery | Under Investigation
  SELECT fir_date_time INTO fir_dt FROM cases WHERE case_id=c_d1;
  INSERT INTO fir_track_records (case_id,action_type,old_status,new_status,action_description,performed_by_user_id,track_date_time) VALUES
  (c_d1,'Registration',        NULL,                 'Registered',          'FIR registered. Crime scene at Bishal Bazar jewelry shop secured. Forensic team dispatched.',               u_s2_gita,   fir_dt),
  (c_d1,'Status Change',       'Registered',         'Under Investigation', 'Armed robbery investigation commenced. 12 nearby CCTV cameras identified and footage collection started.',   u_s2_gita,   fir_dt+INTERVAL '2 days'),
  (c_d1,'Evidence Collected',  'Under Investigation','Under Investigation', 'Fingerprints lifted from glass display case. Partial boot print photographed near back exit door.',          u_s2_rajesh,  fir_dt+INTERVAL '3 days'),
  (c_d1,'Suspect Identified',  'Under Investigation','Under Investigation', 'CCTV still frame shows suspect scouting shop 30 minutes before closing. Image shared with all metro units.', u_s2_gita,   fir_dt+INTERVAL '7 days'),
  (c_d1,'Lookout Issued',      'Under Investigation','Under Investigation', 'Lookout notice circulated to all border checkpoints and Tribhuvan International Airport.',                   u_s2_rajesh,  fir_dt+INTERVAL '8 days'),
  (c_d1,'Investigation Update','Under Investigation','Under Investigation', 'Partial fingerprint submitted to Nepal Police Forensic Lab for database comparison. 64% match returned.',   u_s2_kamala,  fir_dt+INTERVAL '12 days');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_d1 AND role='Complainant' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'It was 6:15 PM and I was preparing to close. Two men in black jackets and full-face helmets entered the shop. One pointed a black pistol at me and my assistant Ramesh and ordered us to the ground. The second vaulted the display counter and used a cloth bag to scoop gold ornaments. They took 15 necklaces, 8 bangles, 4 rings and approximately 1 kilogram of loose chain. The entire robbery lasted less than 4 minutes. One robber spoke what sounded like a Madhesi dialect.',
   fir_dt+INTERVAL '1 day',u_s2_gita,'Full stolen item inventory valued at NPR 85 lakhs submitted. Insurance company document copy provided. Assistant Ramesh to be formally recorded as second witness.'),
  (cp_id,'After reviewing CCTV stills I recognized one individual as having visited my shop 3 days before the robbery. He spent nearly 20 minutes asking about 22-carat chain prices and asked to examine several items. In hindsight his questions about display stock weight now appear to be reconnaissance. He had a scar or burn mark near his right thumb.',
   fir_dt+INTERVAL '8 days',u_s2_gita,'Prior visit confirmed on shop CCTV from 3 days before robbery. Scar detail added to suspect profile and circulated to all units.');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_d1 AND role='Suspect' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'Suspect brought in for questioning. He denied involvement and stated he was at a friend house in Kalimati the entire evening. Could not provide the friend name or address. Could not explain why his image appears near Bishal Bazar 30 minutes before the robbery on CCTV footage.',
   fir_dt+INTERVAL '9 days',u_s2_rajesh,'Alibi completely unverifiable. CCTV places suspect 400m from scene. Bail denied. Under continued investigation.'),
  (cp_id,'Forensic Lab returned partial fingerprint match at 64% confidence with suspect left thumb from broken display case glass. Suspect was confronted with this finding and immediately requested a lawyer. Refused to speak further. Formal arrest warrant application submitted to court.',
   fir_dt+INTERVAL '14 days',u_s2_gita,'Partial fingerprint match documented. Suspect exercising right to counsel. Warrant application filed with court.');

  -- FIR-2002-2081 | Fraud Tourist Scam | Charge Sheet Filed
  SELECT fir_date_time INTO fir_dt FROM cases WHERE case_id=c_d2;
  INSERT INTO fir_track_records (case_id,action_type,old_status,new_status,action_description,performed_by_user_id,track_date_time) VALUES
  (c_d2,'Registration',       NULL,                 'Registered',          'FIR filed by tourist Nisha Gurung with embassy support. Eight victim statements collected.',                  u_s2_gita,   fir_dt),
  (c_d2,'Status Change',      'Registered',         'Under Investigation', 'Fake office at Thamel raided. Office found abandoned. Fake Nepal Tourism Board certificate recovered.',      u_s2_gita,   fir_dt+INTERVAL '6 days'),
  (c_d2,'Evidence Collected', 'Under Investigation','Under Investigation', 'Fake registration certificate and bank account statements linked to accused traced and filed.',               u_s2_rajesh,  fir_dt+INTERVAL '8 days'),
  (c_d2,'Arrest Made',        'Under Investigation','Under Investigation', 'Main accused Krishna Bhatt arrested at Putalisadak bus stop while attempting to flee.',                       u_s2_gita,   fir_dt+INTERVAL '24 days'),
  (c_d2,'Status Change',      'Under Investigation','Charge Sheet Filed',  'Charge sheet filed with 8 victim statements, financial transaction evidence, and confession details.',        u_s2_gita,   fir_dt+INTERVAL '26 days');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_d2 AND role='Complainant' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'I found the trekking agency through a Google search. Their website appeared professional with what looked like government tourism logos. I paid USD 1,500 via online bank transfer to their account. After payment all contact numbers went unanswered and the website disappeared within 3 days. My embassy helped me reach the police. I have full email correspondence, payment receipts, and WhatsApp chats with the agent who called himself Mr Raj.',
   fir_dt+INTERVAL '2 days',u_s2_gita,'Bank transfer receipt submitted. Website domain records subpoenaed. Seven similar complaints through embassy in same week. Digital evidence filed as exhibits F-1 to F-4.'),
  (cp_id,'The phone number used by Mr Raj is now switched off but I have provided the full WhatsApp chat history showing payment confirmation and fake booking reference codes. The domain registration details I obtained show it was registered only 6 months ago. I have confirmed with Nepal Tourism Board that this agency was never registered with them.',
   fir_dt+INTERVAL '7 days',u_s2_rajesh,'WhatsApp logs and email chain filed. Domain registration traced to accused. Nepal Tourism Board confirmation letter obtained and filed.');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_d2 AND role='Accused' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'Accused Krishna Bhatt denied operating the fake agency. He claimed he only rented his bank account to a friend named Ramesh for a monthly fee and was completely unaware of what it was used for. He could not provide Ramesh last name or contact details.',
   fir_dt+INTERVAL '25 days',u_s2_gita,'Account rental claim rejected. Bank records show accused personally withdrew NPR 12,80,000 across 8 transactions over 3 weeks matching victim payment dates exactly.'),
  (cp_id,'When shown bank withdrawal records totalling NPR 12,80,000 matching victim payment dates, accused partially admitted to running the operation himself citing financial desperation. He named no accomplices. He expressed willingness to make partial restitution in exchange for reduced charges.',
   fir_dt+INTERVAL '28 days',u_s2_gita,'Partial confession recorded. Financial gain fully established. Restitution offer noted but does not affect charge sheet. Prosecution proceeding on all counts.');

  -- FIR-2003-2081 | Assault | Under Investigation
  SELECT fir_date_time INTO fir_dt FROM cases WHERE case_id=c_d3;
  INSERT INTO fir_track_records (case_id,action_type,old_status,new_status,action_description,performed_by_user_id,track_date_time) VALUES
  (c_d3,'Registration',       NULL,        'Registered',          'FIR registered. Victim statement taken at Kanti Hospital where he was admitted for head injury.',        u_s2_rajesh,  fir_dt),
  (c_d3,'Medical Report',     'Registered','Registered',          'Medical report: 4cm scalp laceration and mild concussion. Injury consistent with blunt force impact.',   u_s2_rajesh,  fir_dt+INTERVAL '2 days'),
  (c_d3,'Status Change',      'Registered','Under Investigation', 'Asan ward CCTV footage requested. Witnesses at scene identified and summons issued.',                    u_s2_kamala,  fir_dt+INTERVAL '3 days'),
  (c_d3,'Suspect Identified', 'Under Investigation','Under Investigation','Accused Roshan Dahal identified from CCTV at exact incident time. Summons issued.',               u_s2_kamala,  fir_dt+INTERVAL '6 days'),
  (c_d3,'Accused Summoned',   'Under Investigation','Under Investigation','Accused appeared. Alibi claimed but disproved by CCTV and tea shop owner statement.',             u_s2_rajesh,  fir_dt+INTERVAL '9 days');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_d3 AND role='Victim' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'I was returning from evening prayer at Asan temple around 7 PM. Near the temple entrance a group of 4 to 5 young men were arguing with each other. As I tried to pass by, one of them pushed me deliberately and another struck me on the back of my head with what felt like a glass bottle. I fell and regained consciousness in the hospital. I did not know any of these men prior to the incident.',
   fir_dt+INTERVAL '1 day',u_s2_rajesh,'Victim identified in hospital. Scalp laceration and concussion confirmed by medical report filed as exhibit M-1.'),
  (cp_id,'After reviewing photographs from CCTV screenshots provided by the investigating officer, I identified Roshan Dahal as the man who struck me. I had seen him loitering near Asan temple on prior evenings. I am certain of my identification and am willing to attend an identification parade and testify in court.',
   fir_dt+INTERVAL '5 days',u_s2_kamala,'Victim photo identification done under standard controlled procedure. Identification result filed. Identification parade scheduled.');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_d3 AND role='Accused' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'Accused Roshan Dahal summoned and appeared voluntarily. He denied striking the victim and claimed he was not at Asan temple that evening. He stated he was at a tea shop in Indrachowk which is a few minutes away.',
   fir_dt+INTERVAL '6 days',u_s2_kamala,'Alibi inconsistent with CCTV showing accused at Asan temple at 6:55 PM. Tea shop owner being contacted for verification.'),
  (cp_id,'Asan ward office CCTV clearly shows the accused in the group at the exact incident location and time. The tea shop owner confirmed the accused was not at his shop that evening. Accused was formally charged. He has now engaged a lawyer.',
   fir_dt+INTERVAL '9 days',u_s2_rajesh,'CCTV evidence conclusive. Alibi fully disproved. Accused formally charged under Penal Code 2074 Section 192. Bail hearing pending.');

  -- FIR-2004-2081 | Kidnapping | Closed
  SELECT fir_date_time INTO fir_dt FROM cases WHERE case_id=c_d4;
  INSERT INTO fir_track_records (case_id,action_type,old_status,new_status,action_description,performed_by_user_id,track_date_time) VALUES
  (c_d4,'Registration',       NULL,                 'Registered',          'Missing person report filed for 16-year-old Bipana Rana by father Ganesh Prasad Sharma.',                       u_s2_rajesh,  fir_dt),
  (c_d4,'Status Change',      'Registered',         'Under Investigation', 'Last phone location traced near Durbar Square bus park. CCTV from 15 locations reviewed.',                      u_s2_kamala,  fir_dt+INTERVAL '4 days'),
  (c_d4,'Update',             'Under Investigation','Under Investigation', 'Anonymous tip received via 100 helpline. Victim believed to be held in Chitwan district.',                       u_s2_gita,    fir_dt+INTERVAL '15 days'),
  (c_d4,'Coordination',       'Under Investigation','Under Investigation', 'Chitwan District Police and Counter-Trafficking Response Team activated.',                                        u_s2_rajesh,  fir_dt+INTERVAL '16 days'),
  (c_d4,'Arrest Made',        'Under Investigation','Under Investigation', 'Victim rescued from Chitwan safe house. Accused Prem Bahadur Tamang arrested at rescue site.',                   u_s2_kamala,  fir_dt+INTERVAL '29 days'),
  (c_d4,'Status Change',      'Under Investigation','Charge Sheet Filed',  'Charge sheet filed under Human Trafficking and Transportation Control Act 2064 and Penal Code Section 168.',    u_s2_gita,    fir_dt+INTERVAL '30 days'),
  (c_d4,'Status Change',      'Charge Sheet Filed', 'Closed',              'Accused convicted under trafficking act. Sentenced to 15 years imprisonment. Victim referred to rehabilitation.',u_s2_sa,     fir_dt+INTERVAL '47 days');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_d4 AND role='Victim' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'Statement recorded post-rescue with female officer and child rights representative present. Victim stated she was approached near the bus park by an unknown woman who offered her a hotel receptionist job in Pokhara for NPR 25,000 per month. She was taken by bus to Chitwan where she was kept in a locked room with two other girls. She was told she would be sent to Dubai for work. She managed to borrow a phone from a cleaner and called her father.',
   fir_dt+INTERVAL '30 days',u_s2_kamala,'Statement recorded with full sensitivity protocol. Child rights organization representative present. Statement sealed pending court order for restricted access.'),
  (cp_id,'Victim identified Prem Bahadur Tamang as the man who received her from the woman at the bus park and transported her to Chitwan. She described a second woman at the Chitwan location who she believes arranged the whole operation. A sketch of the second suspect was prepared and circulated.',
   fir_dt+INTERVAL '32 days',u_s2_gita,'Second female suspect description noted. Sketch prepared and circulated. Inquiry into trafficking network ongoing.');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_d4 AND role='Accused' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'Accused Prem Bahadur Tamang claimed he is a legitimate job placement agent and was told by the recruiting woman that Bipana was 22 years old and had consented to the arrangement. He denied knowing she was a minor or that she was being trafficked.',
   fir_dt+INTERVAL '30 days',u_s2_rajesh,'Business registration found to be fake. School ID confirms victim is 16. Good faith claim rejected. Phone records show prior coordination with known trafficking contacts.'),
  (cp_id,'Phone records show accused made calls to 6 different numbers across 3 districts on the day of abduction. Two numbers are linked to persons under prior trafficking investigations. Accused remained silent when shown victim photo identification. Convicted on all counts.',
   fir_dt+INTERVAL '38 days',u_s2_gita,'Phone records filed as exhibit T-3. Network analysis completed. All counts proven beyond reasonable doubt. Conviction recorded.');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_d4 AND role='Complainant' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'My daughter Bipana left home at 9 AM saying she was going to tuition class. She never arrived. Her phone was switched off by 10:30 AM. I searched all day and filed this report in the evening. The previous day she had told me someone approached her about a job but I told her to focus on her studies. I did not think it was serious.',
   fir_dt+INTERVAL '1 day',u_s2_rajesh,'Tuition teacher confirmed victim did not attend class. Prior contact from unknown recruiter corroborated by father. Timeline consistent with planned abduction.'),
  (cp_id,'After being informed of my daughter rescue I am relieved but extremely disturbed by what she went through. I request maximum punishment for all involved. My daughter is receiving psychological support from Maiti Nepal. I request regular updates on court proceedings and the search for the second suspect.',
   fir_dt+INTERVAL '31 days',u_s2_gita,'Family informed of rescue. Victim referred to Maiti Nepal for rehabilitation and psychological support. Court hearing dates shared with family.');

  -- FIR-2005-2081 | Vandalism | Under Investigation
  SELECT fir_date_time INTO fir_dt FROM cases WHERE case_id=c_d5;
  INSERT INTO fir_track_records (case_id,action_type,old_status,new_status,action_description,performed_by_user_id,track_date_time) VALUES
  (c_d5,'Registration',       NULL,        'Registered',          'FIR filed by Kathmandu Metropolitan City Environment Department. Damage assessment report attached.',    u_s2_gita,    fir_dt),
  (c_d5,'Evidence Collected', 'Registered','Registered',          'Broken bench fragments, damaged solar light fixtures, and empty alcohol bottles collected from scene.',  u_s2_dipendra, fir_dt+INTERVAL '1 day'),
  (c_d5,'Status Change',      'Registered','Under Investigation', 'CCTV from Ratna Park main gate reviewed. Security guard on duty formally questioned.',                    u_s2_rajesh,  fir_dt+INTERVAL '2 days'),
  (c_d5,'Investigation Update','Under Investigation','Under Investigation','Vehicle plate partially captured on gate CCTV. Rental company contacted.',                       u_s2_dipendra, fir_dt+INTERVAL '4 days');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_d5 AND role='Witness' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'I live in the apartment adjacent to Ratna Park. Around midnight I was woken by loud music and shouting from inside the park. Looking from my window I saw a group of at least 5 young men, all appearing intoxicated, throwing park benches and smashing the solar lights along the pathway. I did not come down as I was afraid. I called the police helpline 100. I can confirm the time was approximately 12:15 AM based on my phone call record.',
   fir_dt+INTERVAL '1 day',u_s2_gita,'Witness provided 100 helpline call record confirming exact time. Partial vehicle plate number captured from her window view noted for tracing.'),
  (cp_id,'I have now reviewed the gate CCTV screenshots. The group clearly entered from the main gate at 11:42 PM. One person in a red jacket appears to be the one who first kicked a bench. I cannot identify individual faces from my window distance but the group size and clothing colours are consistent with what I observed. The vehicle parked near the gate was a white pickup truck.',
   fir_dt+INTERVAL '3 days',u_s2_dipendra,'CCTV entry time consistent with witness account. White pickup truck plate partially visible. Rental company records being subpoenaed.');

  RAISE NOTICE 'Block 1 complete: Teku and Durbar Marg FIR tracking and supplementary statements inserted.';
END $$;

-- ============================================================================
-- BLOCK 2: Station 3 (Boudha) + Station 4 (Maharajgunj)
-- ============================================================================
DO $$
DECLARE
  u_s3_sa INT; u_s3_pramila INT; u_s3_rajan INT; u_s3_sabina INT;
  u_s4_sa INT; u_s4_mina INT; u_s4_arjun INT; u_s4_rekha INT; u_s4_nabin INT;
  c_b1 INT; c_b2 INT; c_b3 INT; c_b4 INT; c_b5 INT;
  c_m1 INT; c_m2 INT; c_m3 INT; c_m4 INT; c_m5 INT;
  cp_id INT; fir_dt TIMESTAMP;
BEGIN
  SELECT id INTO u_s3_sa       FROM users WHERE username='sa.boudha';
  SELECT id INTO u_s3_pramila  FROM users WHERE username='officer.pramila';
  SELECT id INTO u_s3_rajan    FROM users WHERE username='officer.rajan';
  SELECT id INTO u_s3_sabina   FROM users WHERE username='officer.sabina';
  SELECT id INTO u_s4_sa       FROM users WHERE username='sa.maharajgunj';
  SELECT id INTO u_s4_mina     FROM users WHERE username='officer.mina';
  SELECT id INTO u_s4_arjun    FROM users WHERE username='officer.arjun';
  SELECT id INTO u_s4_rekha    FROM users WHERE username='officer.rekha';
  SELECT id INTO u_s4_nabin    FROM users WHERE username='officer.nabin';
  SELECT case_id INTO c_b1 FROM cases WHERE fir_no='FIR-3001-2081';
  SELECT case_id INTO c_b2 FROM cases WHERE fir_no='FIR-3002-2081';
  SELECT case_id INTO c_b3 FROM cases WHERE fir_no='FIR-3003-2081';
  SELECT case_id INTO c_b4 FROM cases WHERE fir_no='FIR-3004-2081';
  SELECT case_id INTO c_b5 FROM cases WHERE fir_no='FIR-3005-2081';
  SELECT case_id INTO c_m1 FROM cases WHERE fir_no='FIR-4001-2081';
  SELECT case_id INTO c_m2 FROM cases WHERE fir_no='FIR-4002-2081';
  SELECT case_id INTO c_m3 FROM cases WHERE fir_no='FIR-4003-2081';
  SELECT case_id INTO c_m4 FROM cases WHERE fir_no='FIR-4004-2081';
  SELECT case_id INTO c_m5 FROM cases WHERE fir_no='FIR-4005-2081';

  -- FIR-3001-2081 | Burglary | Under Investigation
  SELECT fir_date_time INTO fir_dt FROM cases WHERE case_id=c_b1;
  INSERT INTO fir_track_records (case_id,action_type,old_status,new_status,action_description,performed_by_user_id,track_date_time) VALUES
  (c_b1,'Registration',        NULL,                 'Registered',          'FIR registered. Crime scene at Jorpati-6 inspected. Front door lock broken with crowbar.',                   u_s3_pramila, fir_dt),
  (c_b1,'Evidence Collected',  'Registered',         'Registered',          'Fingerprints lifted from broken lock, window ledge, and steel almirah. Sent to forensic lab.',               u_s3_rajan,   fir_dt+INTERVAL '1 day'),
  (c_b1,'Status Change',       'Registered',         'Under Investigation', 'Witness Arun Limbu gave account of seeing unfamiliar person carrying bag near house at 2 AM.',               u_s3_pramila, fir_dt+INTERVAL '3 days'),
  (c_b1,'Investigation Update','Under Investigation','Under Investigation', 'All Chabahil and Jorpati area pawn shops checked. Chabahil pawn shop reported matching item purchase.',      u_s3_sabina,  fir_dt+INTERVAL '11 days'),
  (c_b1,'Investigation Update','Under Investigation','Under Investigation', 'Forensic lab returned partial fingerprint. Checking against known offenders database.',                       u_s3_rajan,   fir_dt+INTERVAL '15 days');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_b1 AND role='Complainant' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'We returned from a 4-day trip to Sindhupalchok on 2081-07-12. Upon arriving I found the front door lock broken and the door ajar. Every cupboard and drawer had been emptied. Stolen items include NPR 8,00,000 cash from the steel almirah, two pairs of 22-carat gold earrings, a 45-gram gold necklace, three silver deity idols, and my late mother bracelet which has a unique elephant motif engraving.',
   fir_dt+INTERVAL '1 day',u_s3_pramila,'Detailed inventory submitted. Photographs of remaining jewelry from insurance documents provided. Elephant motif bracelet detail noted for pawn shop identification.'),
  (cp_id,'My neighbour Sushma from flat 3B told me she noticed our apartment light was on at 2 AM on 2081-07-10 which is unusual as we always switch everything off when travelling. I had posted about our Sindhupalchok trip on Facebook two days before leaving. I now believe the burglar may have seen that post and planned accordingly.',
   fir_dt+INTERVAL '5 days',u_s3_rajan,'Social media post confirmed as publicly visible. Digital trace being investigated. Neighbour Sushma to be formally interviewed as additional witness.');

  SELECT id INTO cp_id FROM case_persons WHERE case_id=c_b1 AND role='Witness' LIMIT 1;
  INSERT INTO supplementary_statements (case_person_id,statement,statement_date,recorded_by_user_id,remarks) VALUES
  (cp_id,'On the night of 2081-07-10 at approximately 2 AM I was awake due to my child being unwell. Through my window I saw an unfamiliar man coming out of my neighbours front door carrying a large cloth bag over his shoulder. He walked briskly towards the lane leading to Chabahil main road. I did not call police at the time because I assumed the neighbour had returned unexpectedly from their trip.',
   fir_dt+INTERVAL '3 days',u_s3_pramila,'Witness provided detailed description: male, medium build, approximately 5 foot 8 inches, wearing dark clothing. Description circulated to area units.'),
  (cp_id,'I am now shown photographs of persons from the police database. I believe the person I saw most closely resembles photograph number 4. I am not fully certain but the build and walking manner are similar. I am willing to attend an identification parade if required.',
   fir_dt+INTERVAL '9 days',u_s3_rajan,'Tentative photograph identification noted. Formal identification parade to be conducted. Witness informed of procedure.');
     

   RAISE NOTICE 'Block 1 complete: Teku and Durbar Marg FIR tracking and supplementary statements inserted.';
END $$;    
  cls