-- Supabase Schema for Maesymorfa School Management System
-- This file contains the database schema and RLS policies

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Settings table for key-value configuration storage
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for settings table
-- Allow anonymous users to read settings (for public site configuration)
CREATE POLICY "Allow anonymous read access to settings" ON settings
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert/update settings (for admin functionality)
CREATE POLICY "Allow authenticated users to modify settings" ON settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on settings changes
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default site settings if they don't exist
INSERT INTO settings (key, value) VALUES (
    'site',
    '{
        "schoolName_en": "Maesymorfa Primary School",
        "schoolName_cy": "Ysgol Gynradd Maesymorfa",
        "address": "School Address Here",
        "phone": "+44 1234 567890",
        "email": "admin@maesymorfa.edu",
        "website": "https://maesymorfa.edu",
        "headteacher": "Head Teacher Name",
        "established": "1950",
        "motto_en": "Learning Together",
        "motto_cy": "Dysgu Gyda'n Gilydd"
    }'
) ON CONFLICT (key) DO NOTHING;

-- Additional tables referenced in the codebase (for completeness)
-- These would need to be created based on the TypeScript interfaces

-- News table
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title_en" TEXT NOT NULL,
    "title_cy" TEXT,
    "body_en" TEXT NOT NULL,
    "body_cy" TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL,
    "isUrgent" BOOLEAN DEFAULT false,
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    published BOOLEAN DEFAULT true,
    "createdBy" TEXT,
    "lastEdited" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "linkedCalendarEventId" UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title_en" TEXT NOT NULL,
    "title_cy" TEXT,
    "description_en" TEXT,
    "description_cy" TEXT,
    "start_time" TIMESTAMP WITH TIME ZONE NOT NULL,
    "end_time" TIMESTAMP WITH TIME ZONE,
    "all_day" BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    "relevant_to" TEXT[] DEFAULT '{}',
    "attachment_url" TEXT,
    "attachment_name" TEXT,
    "is_urgent" BOOLEAN DEFAULT false,
    "show_on_homepage" BOOLEAN DEFAULT true,
    published BOOLEAN DEFAULT true,
    "linked_news_post_id" UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    team TEXT,
    email TEXT,
    "user_id" TEXT,
    "photo_url" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Children table
CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    "year_group" TEXT NOT NULL,
    dob DATE,
    "linked_parents" JSONB DEFAULT '[]',
    allergies TEXT,
    "one_page_profile_url" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    "image_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    "uploaded_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "taken_at" TIMESTAMP WITH TIME ZONE
);

-- Inbox messages table
CREATE TABLE IF NOT EXISTS inbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    "isReadByAdmin" BOOLEAN DEFAULT false,
    "isReadByParent" BOOLEAN DEFAULT false,
    "threadId" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (these can be customized based on specific requirements)
-- Allow anonymous read access to public content
CREATE POLICY "Allow anonymous read access to news" ON news
    FOR SELECT
    USING (published = true);

CREATE POLICY "Allow anonymous read access to calendar_events" ON calendar_events
    FOR SELECT
    USING (published = true);

CREATE POLICY "Allow anonymous read access to staff" ON staff
    FOR SELECT
    USING (true);

CREATE POLICY "Allow anonymous read access to documents" ON documents
    FOR SELECT
    USING (true);

CREATE POLICY "Allow anonymous read access to photos" ON photos
    FOR SELECT
    USING (true);

-- Allow authenticated users full access (for admin functionality)
CREATE POLICY "Allow authenticated users full access to news" ON news
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to calendar_events" ON calendar_events
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to staff" ON staff
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to documents" ON documents
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to parents" ON parents
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to children" ON children
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to photos" ON photos
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to inbox_messages" ON inbox_messages
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_published ON calendar_events(published);
CREATE INDEX IF NOT EXISTS idx_staff_team ON staff(team);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_created_at ON inbox_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Add updated_at triggers to all tables
CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON news
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parents_updated_at
    BEFORE UPDATE ON parents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at
    BEFORE UPDATE ON children
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inbox_messages_updated_at
    BEFORE UPDATE ON inbox_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();