-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default values
INSERT INTO public.site_settings (key, value) VALUES
('contact', '{
  "email": "coroa.cosmica@gmail.com",
  "whatsapp_numbers": [
    { "label": "Egypt", "number": "+201227644162" },
    { "label": "Egypt", "number": "+201000223632" },
    { "label": "Portugal", "number": "+351937438070" }
  ]
}'::jsonb),
('social', '{
  "facebook": "https://www.facebook.com/profile.php?id=61590414132209",
  "instagram": "https://www.instagram.com/coroacosmica/",
  "youtube": "https://youtube.com/@coroa_cosmica?si=1iQmUKQyXFEvKhe1",
  "tiktok": "https://www.tiktok.com/@coroa_cosmica?lang=en"
}'::jsonb),
('hero_slides', '[
  {
    "title": "COROA CÓSMICA",
    "subtitle": "VIP Sets · Cork · Eco",
    "image": "/images/placeholders/vip.svg",
    "href": "/catalogue?category=vip-sets"
  },
  {
    "title": "CORTIÇA PORTUGUESA",
    "subtitle": "Brindes sustentáveis",
    "image": "/images/placeholders/cork.svg",
    "href": "/catalogue?category=cork-eco"
  },
  {
    "title": "TECNOLOGIA & NEGÓCIOS",
    "subtitle": "1000+ produtos",
    "image": "/images/placeholders/tech.svg",
    "href": "/catalogue"
  }
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Allow full access to authenticated users
CREATE POLICY "Allow all actions for authenticated users on site_settings"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'authenticated');
