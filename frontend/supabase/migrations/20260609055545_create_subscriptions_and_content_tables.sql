/*
# Create subscriptions and AI content tables
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rss_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  category text DEFAULT 'All',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rss_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source text,
  category text DEFAULT 'All',
  published_date date,
  status text NOT NULL DEFAULT 'pending',
  image text,
  content text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  thumbnail text,
  blog_post text,
  facebook_post text,
  instagram_caption text,
  linkedin_post text,
  twitter_post text,
  ai_image text,
  seo_title text,
  meta_description text,
  hashtags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'generated',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_subscriptions" ON subscriptions;
CREATE POLICY "anon_select_subscriptions" ON subscriptions FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subscriptions" ON subscriptions;
CREATE POLICY "anon_insert_subscriptions" ON subscriptions FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_rss_feeds" ON rss_feeds;
CREATE POLICY "anon_select_rss_feeds" ON rss_feeds FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_rss_feeds" ON rss_feeds;
CREATE POLICY "anon_insert_rss_feeds" ON rss_feeds FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_rss_feeds" ON rss_feeds;
CREATE POLICY "anon_update_rss_feeds" ON rss_feeds FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_rss_feeds" ON rss_feeds;
CREATE POLICY "anon_delete_rss_feeds" ON rss_feeds FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_rss_items" ON rss_items;
CREATE POLICY "anon_select_rss_items" ON rss_items FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_rss_items" ON rss_items;
CREATE POLICY "anon_insert_rss_items" ON rss_items FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_rss_items" ON rss_items;
CREATE POLICY "anon_update_rss_items" ON rss_items FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_generated_content" ON generated_content;
CREATE POLICY "anon_select_generated_content" ON generated_content FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_generated_content" ON generated_content;
CREATE POLICY "anon_insert_generated_content" ON generated_content FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_generated_content" ON generated_content;
CREATE POLICY "anon_update_generated_content" ON generated_content FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);
