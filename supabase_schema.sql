-- Warkop Chess & ChitChat Supabase Schema
-- Salin dan tempel skrip ini langsung ke Supabase SQL Editor untuk membuat semua tabel.

-- ===================================================
-- 1. Tabel: MEJA
-- ===================================================
CREATE TABLE IF NOT EXISTS meja (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '☕',
  count INTEGER DEFAULT 1,
  topic TEXT DEFAULT '',
  initial_topic_desc TEXT DEFAULT '',
  creator TEXT,
  invited_users JSONB DEFAULT '[]'::jsonb,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan RLS dimatikan atau ada kebijakan publik untuk demo
ALTER TABLE meja DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access meja" ON meja;
CREATE POLICY "Public access meja" ON meja FOR ALL USING (true) WITH CHECK (true);

-- Aktifkan Realtime untuk meja
ALTER TABLE meja REPLICA IDENTITY FULL;


-- ===================================================
-- 2. Tabel: PENGUNJUNG
-- ===================================================
CREATE TABLE IF NOT EXISTS pengunjung (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT '',
  avatar TEXT,
  name_changes JSONB DEFAULT '[]'::jsonb,
  is_online BOOLEAN DEFAULT true,
  table_id TEXT,
  pin TEXT,
  saldo BIGINT DEFAULT 20000,
  hunger INTEGER DEFAULT 100,
  thirst INTEGER DEFAULT 100,
  inventory JSONB DEFAULT '[]'::jsonb,
  tutorial_done BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pengunjung DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access pengunjung" ON pengunjung;
CREATE POLICY "Public access pengunjung" ON pengunjung FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE pengunjung REPLICA IDENTITY FULL;


-- ===================================================
-- 3. Tabel: LINIMASA_POSTS
-- ===================================================
CREATE TABLE IF NOT EXISTS linimasa_posts (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  author_id TEXT,
  avatar_color TEXT DEFAULT 'bg-[#D4A373]',
  text TEXT,
  image TEXT,
  timestamp TEXT,
  likes INTEGER DEFAULT 0,
  liked_by JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE linimasa_posts DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access posts" ON linimasa_posts;
CREATE POLICY "Public access posts" ON linimasa_posts FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE linimasa_posts REPLICA IDENTITY FULL;


-- ===================================================
-- 4. Tabel: LINIMASA_COMMENTS
-- ===================================================
CREATE TABLE IF NOT EXISTS linimasa_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES linimasa_posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  author_id TEXT,
  text TEXT NOT NULL,
  timestamp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE linimasa_comments DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access comments" ON linimasa_comments;
CREATE POLICY "Public access comments" ON linimasa_comments FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE linimasa_comments REPLICA IDENTITY FULL;


-- ===================================================
-- 5. Tabel: NOTIFICATIONS
-- ===================================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  sender TEXT NOT NULL,
  sender_id TEXT,
  post_id TEXT REFERENCES linimasa_posts(id) ON DELETE CASCADE,
  content TEXT,
  timestamp TEXT,
  is_read BOOLEAN DEFAULT false,
  recipient TEXT,
  recipient_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access notifications" ON notifications;
CREATE POLICY "Public access notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE notifications REPLICA IDENTITY FULL;


-- ===================================================
-- 6. Tabel: PESAN_CHAT
-- ===================================================
CREATE TABLE IF NOT EXISTS pesan_chat (
  id TEXT PRIMARY KEY,
  table_id TEXT,
  sender TEXT NOT NULL,
  sender_id TEXT,
  text TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  tag TEXT,
  timestamp TEXT,
  color TEXT,
  is_withdrawn BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pesan_chat DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access pesan_chat" ON pesan_chat;
CREATE POLICY "Public access pesan_chat" ON pesan_chat FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE pesan_chat REPLICA IDENTITY FULL;


-- ===================================================
-- INDEX UNTUK MENINGKATKAN KINERJA
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_pengunjung_table_id ON pengunjung(table_id);
CREATE INDEX IF NOT EXISTS idx_pesan_chat_table_id ON pesan_chat(table_id);
CREATE INDEX IF NOT EXISTS idx_linimasa_comments_post_id ON linimasa_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_post_id ON notifications(post_id);


-- ===================================================
-- AKTIFKAN FITUR REALTIME SUPABASE
-- ===================================================
-- Supabase menggunakan publikasi bernama 'supabase_realtime' untuk mengalirkan data secara real-time.
-- Skrip di bawah ini memastikan publikasi tersebut ada dan mendaftarkan tabel kita.

-- Jika publikasi belum ada, buat baru
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Daftarkan tabel ke publikasi realtime secara aman satu per satu
-- (Akan mengabaikan jika tabel sudah terdaftar sebelumnya)
DO $$
DECLARE
  t_name TEXT;
  tables_to_add TEXT[] := ARRAY['meja', 'pengunjung', 'linimasa_posts', 'linimasa_comments', 'notifications', 'pesan_chat'];
BEGIN
  FOREACH t_name IN ARRAY tables_to_add LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t_name);
    EXCEPTION
      WHEN duplicate_object THEN
        -- Abaikan jika tabel sudah terdaftar dalam publikasi
        NULL;
      WHEN others THEN
        -- Abaikan kesalahan lain untuk menjaga kelancaran instalasi
        NULL;
    END;
  END LOOP;
END $$;
