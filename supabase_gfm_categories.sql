-- Insert GFM (Global Factory & Media) Categories into the database

INSERT INTO public.categories (slug, name_en, name_ar, name_pt, order_index)
VALUES
  -- Indoor Printing
  ('gfm-indoor-printing', 'Indoor Printing', 'طباعة داخلية', 'Impressão Interior', 20),
  ('gfm-business-cards', 'Business Cards', 'كروت شخصية', 'Cartões de Visita', 21),
  ('gfm-flyers', 'Flyers', 'فلايرز', 'Panfletos', 22),
  ('gfm-brochures', 'Brochures', 'بروشورات', 'Brochuras', 23),
  ('gfm-books', 'Books', 'كتب', 'Livros', 24),
  ('gfm-boxes-bags', 'Boxes & Bags', 'علب وأكياس', 'Caixas e Sacos', 25),
  ('gfm-invitation-cards', 'Invitation Cards', 'كروت دعوة', 'Cartões de Convite', 26),
  ('gfm-certificates', 'Certificates', 'شهادات', 'Certificados', 27),
  
  -- Events & Conferences
  ('gfm-events-conferences', 'Events & Conferences', 'فعاليات ومؤتمرات', 'Eventos e Conferências', 28),
  ('gfm-rollup-banners', 'Roll-Up Banners', 'رول أب', 'Banners Roll-Up', 29),
  ('gfm-popup-stands', 'Pop-Up Stands', 'بوب أب ستاند', 'Stands Pop-Up', 30),
  ('gfm-conference-stands', 'Conference Stands', 'ستاندات مؤتمرات', 'Stands de Conferência', 31),
  ('gfm-feather-flags', 'Feather Flags', 'أعلام ريشة', 'Bandeiras Pena', 32),
  ('gfm-event-flags', 'Event Flags', 'أعلام فعاليات', 'Bandeiras de Eventos', 33),
  ('gfm-id-cards', 'ID Cards & Badges', 'بطاقات تعريف', 'Crachás e Cartões', 34),

  -- Outdoor Printing
  ('gfm-outdoor-printing', 'Outdoor Printing', 'طباعة خارجية', 'Impressão Exterior', 35),
  ('gfm-outdoor-signage', 'Outdoor Signage', 'لافتات خارجية', 'Sinalização Exterior', 36),
  ('gfm-building-facades', 'Building Facades', 'واجهات مباني', 'Fachadas de Edifícios', 37),
  ('gfm-shop-fronts', 'Shop Front Signs', 'لافتات محلات', 'Placas de Lojas', 38),
  ('gfm-billboards', 'Billboards', 'لوحات إعلانية', 'Outdoors', 39),
  ('gfm-outdoor-banners', 'Outdoor Banners', 'بانرات خارجية', 'Banners Exteriores', 40),
  ('gfm-vehicle-branding', 'Vehicle Branding', 'تجليد سيارات', 'Decoração de Veículos', 41),
  ('gfm-wayfinding', 'Wayfinding Signs', 'لوحات إرشادية', 'Placas de Sinalização', 42),

  -- Geographic & Office Solutions
  ('gfm-geographic-office', 'Geographic & Office Solutions', 'حلول جغرافية ومكتبية', 'Soluções Geográficas e de Escritório', 43),
  ('gfm-office-signs', 'Office Signs', 'لافتات مكتبية', 'Placas de Escritório', 44),
  ('gfm-directional-signs', 'Directional Signs', 'لوحات توجيهية', 'Sinalização Direcional', 45),
  ('gfm-name-plates', 'Name Plates', 'لوحات أسماء', 'Placas de Identificação', 46),
  ('gfm-rubber-stamps', 'Rubber Stamps', 'أختام مطاطية', 'Carimbos de Borracha', 47),
  ('gfm-company-stamps', 'Company Stamps', 'أختام شركات', 'Carimbos de Empresa', 48),
  ('gfm-custom-seals', 'Custom Seals', 'أختام مخصصة', 'Selos Personalizados', 49)
ON CONFLICT (slug) DO UPDATE SET 
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  name_pt = EXCLUDED.name_pt,
  order_index = EXCLUDED.order_index;
