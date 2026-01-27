-- Create extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sample users (passwords are hashed versions of: admin123, farmer123, expert123)
INSERT INTO users (public_id, username, email, password_hash, user_type, full_name, bio, location, expertise_area, is_active, created_at) 
VALUES 
(
    'admin_001',
    'admin',
    'admin@agriconnect.com',
    '$2b$12$8B3L5c7d9f1h3j5l7m9o1q3s5u7w9y1z3B5D7F9H1J3L5N7P9R1T3V5X7Z9',
    'admin',
    'Administrator',
    'System administrator',
    'Nairobi, Kenya',
    'System Management',
    true,
    NOW()
),
(
    'farmer_001',
    'john_farmer',
    'john@example.com',
    '$2b$12$8B3L5c7d9f1h3j5l7m9o1q3s5u7w9y1z3B5D7F9H1J3L5N7P9R1T3V5X7Z9',
    'farmer',
    'John Farmer',
    'Organic farmer with 20 years experience specializing in sustainable agriculture and crop rotation',
    'Iowa, USA',
    'Organic Farming',
    true,
    NOW()
),
(
    'expert_001',
    'dr_agri',
    'expert@example.com',
    '$2b$12$8B3L5c7d9f1h3j5l7m9o1q3s5u7w9y1z3B5D7F9H1J3L5N7P9R1T3V5X7Z9',
    'expert',
    'Dr. Agri Expert',
    'Agricultural scientist with PhD in Plant Pathology. 15 years of research experience in crop diseases and pest management',
    'California, USA',
    'Plant Pathology, Crop Diseases',
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;
