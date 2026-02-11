-- PostgreSQL Database Schema for Ovrica Meeting Management App
-- Created: 11 Februari 2026
-- Description: Complete schema untuk manage users, meetings, notulen, attendance, dan action items

-- ============================================================================
-- DROP EXISTING TABLES (if exist)
-- ============================================================================
DROP TABLE IF EXISTS meeting_participants CASCADE;
DROP TABLE IF EXISTS action_items CASCADE;
DROP TABLE IF EXISTS attendees CASCADE;
DROP TABLE IF EXISTS agendas CASCADE;
DROP TABLE IF EXISTS notulens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
-- Menyimpan data user yang login via Google OAuth
-- Auto-created saat user pertama kali login
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa query by email dan google_id
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- ============================================================================
-- 2. NOTULENS TABLE
-- ============================================================================
-- Menyimpan data notulen meeting lengkap
CREATE TABLE notulens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meeting_id VARCHAR(255), -- Google Calendar Event ID (optional)
    title VARCHAR(500) NOT NULL,
    meeting_date DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    location TEXT,
    pic_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- PIC/Organizer meeting
    pic_name VARCHAR(255), -- Fallback jika PIC bukan user di system
    discussion TEXT, -- Pembahasan
    decisions TEXT, -- Keputusan
    conclusion TEXT, -- Kesimpulan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes untuk performa
CREATE INDEX idx_notulens_user_id ON notulens(user_id);
CREATE INDEX idx_notulens_meeting_id ON notulens(meeting_id);
CREATE INDEX idx_notulens_meeting_date ON notulens(meeting_date);
CREATE INDEX idx_notulens_pic_user_id ON notulens(pic_user_id);

-- ============================================================================
-- 3. AGENDAS TABLE
-- ============================================================================
-- Menyimpan agenda items untuk setiap notulen
CREATE TABLE agendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notulen_id UUID NOT NULL REFERENCES notulens(id) ON DELETE CASCADE,
    agenda_text TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0, -- Untuk sorting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk query by notulen
CREATE INDEX idx_agendas_notulen_id ON agendas(notulen_id);

-- ============================================================================
-- 4. ATTENDEES TABLE
-- ============================================================================
-- Menyimpan daftar kehadiran peserta meeting
CREATE TABLE attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notulen_id UUID NOT NULL REFERENCES notulens(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link ke user jika ada
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Hadir', -- 'Hadir', 'Telat', 'Izin', 'Tidak Hadir'
    notes TEXT, -- Catatan khusus untuk attendee
    check_in_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_attendee_status CHECK (status IN ('Hadir', 'Telat', 'Izin', 'Tidak Hadir'))
);

-- Indexes
CREATE INDEX idx_attendees_notulen_id ON attendees(notulen_id);
CREATE INDEX idx_attendees_user_id ON attendees(user_id);
CREATE INDEX idx_attendees_email ON attendees(email);

-- ============================================================================
-- 5. ACTION_ITEMS TABLE
-- ============================================================================
-- Menyimpan action items / task yang dihasilkan dari meeting
CREATE TABLE action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notulen_id UUID NOT NULL REFERENCES notulens(id) ON DELETE CASCADE,
    action_text TEXT NOT NULL,
    pic_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Person In Charge
    pic_name VARCHAR(255), -- Fallback name
    pic_email VARCHAR(255), -- Email PIC
    deadline DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Open', -- 'Open', 'In Progress', 'Done'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_action_status CHECK (status IN ('Open', 'In Progress', 'Done'))
);

-- Indexes
CREATE INDEX idx_action_items_notulen_id ON action_items(notulen_id);
CREATE INDEX idx_action_items_pic_user_id ON action_items(pic_user_id);
CREATE INDEX idx_action_items_status ON action_items(status);
CREATE INDEX idx_action_items_deadline ON action_items(deadline);

-- ============================================================================
-- 6. MEETING_PARTICIPANTS TABLE (Optional - for tracking meeting invitations)
-- ============================================================================
-- Menyimpan relasi many-to-many antara users dan meetings mereka
CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notulen_id UUID NOT NULL REFERENCES notulens(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'participant', -- 'organizer', 'participant', 'optional'
    response_status VARCHAR(50), -- 'accepted', 'declined', 'tentative', 'needsAction'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(notulen_id, user_id)
);

-- Indexes
CREATE INDEX idx_meeting_participants_notulen ON meeting_participants(notulen_id);
CREATE INDEX idx_meeting_participants_user ON meeting_participants(user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notulens_updated_at BEFORE UPDATE ON notulens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendees_updated_at BEFORE UPDATE ON attendees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at BEFORE UPDATE ON action_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE QUERIES
-- ============================================================================

-- Query untuk auto-create user saat login pertama kali
/*
INSERT INTO users (google_id, email, name, photo_url)
VALUES ($1, $2, $3, $4)
ON CONFLICT (google_id) 
DO UPDATE SET 
    last_login = CURRENT_TIMESTAMP,
    name = EXCLUDED.name,
    photo_url = EXCLUDED.photo_url,
    email = EXCLUDED.email
RETURNING *;
*/

-- Query untuk save notulen lengkap dengan attendees dan action items
/*
-- 1. Insert notulen
INSERT INTO notulens (user_id, meeting_id, title, meeting_date, time_start, time_end, location, pic_user_id, pic_name, discussion, decisions, conclusion)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING id;

-- 2. Insert agendas
INSERT INTO agendas (notulen_id, agenda_text, order_index)
VALUES ($1, $2, $3);

-- 3. Insert attendees
INSERT INTO attendees (notulen_id, user_id, email, name, photo_url, status, notes)
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- 4. Insert action items
INSERT INTO action_items (notulen_id, action_text, pic_user_id, pic_name, pic_email, deadline, status)
VALUES ($1, $2, $3, $4, $5, $6, $7);
*/

-- Query untuk get notulen by user dengan relasi lengkap
/*
SELECT 
    n.*,
    json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email,
        'photo_url', u.photo_url
    ) as creator,
    json_build_object(
        'id', pic.id,
        'name', pic.name,
        'email', pic.email
    ) as pic,
    (SELECT json_agg(json_build_object('id', id, 'text', agenda_text, 'order', order_index) ORDER BY order_index)
     FROM agendas WHERE notulen_id = n.id) as agendas,
    (SELECT json_agg(json_build_object('id', id, 'name', name, 'email', email, 'status', status, 'notes', notes, 'photo_url', photo_url))
     FROM attendees WHERE notulen_id = n.id) as attendees,
    (SELECT json_agg(json_build_object('id', id, 'action', action_text, 'pic_name', pic_name, 'deadline', deadline, 'status', status))
     FROM action_items WHERE notulen_id = n.id) as action_items
FROM notulens n
LEFT JOIN users u ON n.user_id = u.id
LEFT JOIN users pic ON n.pic_user_id = pic.id
WHERE n.user_id = $1
ORDER BY n.meeting_date DESC, n.time_start DESC;
*/

-- Query untuk get attendees by notulen with user info
/*
SELECT 
    a.*,
    json_build_object(
        'id', u.id,
        'google_id', u.google_id,
        'name', u.name,
        'email', u.email
    ) as user_info
FROM attendees a
LEFT JOIN users u ON a.user_id = u.id
WHERE a.notulen_id = $1
ORDER BY a.name;
*/

-- Query untuk get action items dengan PIC info
/*
SELECT 
    ai.*,
    json_build_object(
        'id', u.id,
        'name', u.name,
        'email', u.email,
        'photo_url', u.photo_url
    ) as pic_info
FROM action_items ai
LEFT JOIN users u ON ai.pic_user_id = u.id
WHERE ai.notulen_id = $1
ORDER BY ai.deadline ASC;
*/

-- ============================================================================
-- NOTES
-- ============================================================================
/*
FITUR UTAMA:
1. ✅ Auto-create user saat login pertama kali via Google OAuth
2. ✅ Save notulen lengkap dengan relasi ke user (creator)
3. ✅ Relasi PIC meeting dengan user (pic_user_id)
4. ✅ Attendees tracking dengan status kehadiran
5. ✅ Action items dengan PIC dan deadline
6. ✅ Agendas dengan ordering
7. ✅ Timestamps otomatis (created_at, updated_at)
8. ✅ Soft delete ready dengan ON DELETE CASCADE/SET NULL
9. ✅ Indexes untuk performa query

CARA IMPORT:
1. Login ke PostgreSQL: psql -U postgres
2. Create database: CREATE DATABASE ovrica;
3. Connect: \c ovrica
4. Import schema: \i schema.sql

ATAU via command line:
psql -U postgres -d ovrica -f schema.sql
*/
