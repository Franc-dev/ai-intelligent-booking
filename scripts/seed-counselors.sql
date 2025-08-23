-- Seed script to create initial counselor data
INSERT INTO counselors (id, name, email, specialties, bio, is_active) VALUES
(
  'counselor_1',
  'Dr. Sarah Johnson',
  'sarah.johnson@example.com',
  ARRAY['Anxiety', 'Depression', 'Stress Management', 'Career Counseling'],
  'Dr. Sarah Johnson is a licensed clinical psychologist with over 10 years of experience helping individuals overcome anxiety and depression. She specializes in cognitive-behavioral therapy and mindfulness-based interventions.',
  true
),
(
  'counselor_2', 
  'Dr. Michael Chen',
  'michael.chen@example.com',
  ARRAY['Relationship Counseling', 'Family Therapy', 'Communication Skills', 'Conflict Resolution'],
  'Dr. Michael Chen is a marriage and family therapist with expertise in helping couples and families improve their relationships. He uses evidence-based approaches to help clients develop better communication and conflict resolution skills.',
  true
);

-- Add availability for Dr. Sarah Johnson (Monday-Friday, 9 AM - 5 PM)
INSERT INTO counselor_availability (counselor_id, day_of_week, start_time, end_time, timezone) VALUES
('counselor_1', 1, '09:00', '17:00', 'UTC'),
('counselor_1', 2, '09:00', '17:00', 'UTC'),
('counselor_1', 3, '09:00', '17:00', 'UTC'),
('counselor_1', 4, '09:00', '17:00', 'UTC'),
('counselor_1', 5, '09:00', '17:00', 'UTC');

-- Add availability for Dr. Michael Chen (Tuesday-Saturday, 10 AM - 6 PM)
INSERT INTO counselor_availability (counselor_id, day_of_week, start_time, end_time, timezone) VALUES
('counselor_2', 2, '10:00', '18:00', 'UTC'),
('counselor_2', 3, '10:00', '18:00', 'UTC'),
('counselor_2', 4, '10:00', '18:00', 'UTC'),
('counselor_2', 5, '10:00', '18:00', 'UTC'),
('counselor_2', 6, '10:00', '18:00', 'UTC');
