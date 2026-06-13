-- Insert GFM Products into the database


INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-BC-001', 'Premium business cards printing with various finishes including matte, glossy, and spot UV', 'product', 'gfm-business-cards', NULL, '/images/products/gfm-business-cards.png', '["/images/products/gfm-business-cards.png"]'::jsonb, true, '{"pt":"Cartões de Visita","en":"Business Cards","ar":"كروت شخصية"}'::jsonb, '{}'::text[], '{"featured"}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-FL-001', 'High-quality flyer printing in A4, A5, and DL sizes with vibrant colors', 'product', 'gfm-flyers', NULL, '/images/products/gfm-flyers.png', '["/images/products/gfm-flyers.png"]'::jsonb, false, '{"pt":"Panfletos","en":"Flyers","ar":"فلايرز"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-BR-001', 'Professional brochure printing - bi-fold, tri-fold, and z-fold options available', 'product', 'gfm-brochures', NULL, '/images/products/gfm-brochures.png', '["/images/products/gfm-brochures.png"]'::jsonb, false, '{"pt":"Brochuras","en":"Brochures","ar":"بروشورات"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-BK-001', 'Custom book printing - hardcover and softcover, perfect binding and saddle stitch', 'product', 'gfm-books', NULL, '/images/products/gfm-books.png', '["/images/products/gfm-books.png"]'::jsonb, false, '{"pt":"Livros","en":"Books","ar":"كتب"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-BB-001', 'Custom printed boxes and branded paper bags for retail and corporate packaging', 'product', 'gfm-boxes-bags', NULL, '/images/products/gfm-boxes-bags.png', '["/images/products/gfm-boxes-bags.png"]'::jsonb, false, '{"pt":"Caixas e Sacos","en":"Boxes & Bags","ar":"علب وأكياس"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-IC-001', 'Elegant invitation cards with custom designs, embossing, and foil stamping', 'product', 'gfm-invitation-cards', NULL, '/images/products/gfm-invitation-cards.png', '["/images/products/gfm-invitation-cards.png"]'::jsonb, false, '{"pt":"Cartões de Convite","en":"Invitation Cards","ar":"كروت دعوة"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-CT-001', 'Professional certificates with gold borders, seals, and premium paper finishes', 'product', 'gfm-certificates', NULL, '/images/products/gfm-certificates.png', '["/images/products/gfm-certificates.png"]'::jsonb, false, '{"pt":"Certificados","en":"Certificates","ar":"شهادات"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-OS-001', 'Durable outdoor signage with weather-resistant materials and LED illumination options', 'product', 'gfm-outdoor-signage', NULL, '/images/products/gfm-outdoor-signage.png', '["/images/products/gfm-outdoor-signage.png"]'::jsonb, true, '{"pt":"Sinalização Exterior","en":"Outdoor Signage","ar":"لافتات خارجية"}'::jsonb, '{}'::text[], '{"featured"}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-BF-001', 'Large-scale building facade branding with vinyl wraps and cladding systems', 'product', 'gfm-building-facades', NULL, '/images/products/gfm-building-facades.png', '["/images/products/gfm-building-facades.png"]'::jsonb, false, '{"pt":"Fachadas de Edifícios","en":"Building Facades","ar":"واجهات مباني"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-SF-001', 'Illuminated and non-illuminated shop front signs with channel letters and lightboxes', 'product', 'gfm-shop-fronts', NULL, '/images/products/gfm-shop-fronts.png', '["/images/products/gfm-shop-fronts.png"]'::jsonb, true, '{"pt":"Placas de Lojas","en":"Shop Front Signs","ar":"لافتات محلات"}'::jsonb, '{}'::text[], '{"featured"}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-BL-001', 'High-impact billboard advertising in various sizes for maximum brand visibility', 'product', 'gfm-billboards', NULL, '/images/products/gfm-billboards.png', '["/images/products/gfm-billboards.png"]'::jsonb, false, '{"pt":"Outdoors","en":"Billboards","ar":"لوحات إعلانية"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-OB-001', 'Large format outdoor vinyl banners with reinforced grommets and UV-resistant printing', 'product', 'gfm-outdoor-banners', NULL, '/images/products/gfm-outdoor-banners.png', '["/images/products/gfm-outdoor-banners.png"]'::jsonb, false, '{"pt":"Banners Exteriores","en":"Outdoor Banners","ar":"بانرات خارجية"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-VB-001', 'Full vehicle branding with vinyl wraps for cars, vans, trucks, and fleet graphics', 'product', 'gfm-vehicle-branding', NULL, '/images/products/gfm-vehicle-branding.png', '["/images/products/gfm-vehicle-branding.png"]'::jsonb, false, '{"pt":"Decoração de Veículos","en":"Vehicle Branding","ar":"تجليد سيارات"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-WF-001', 'Interior and exterior wayfinding sign systems for buildings, malls, and campuses', 'product', 'gfm-wayfinding', NULL, '/images/products/gfm-wayfinding.png', '["/images/products/gfm-wayfinding.png"]'::jsonb, false, '{"pt":"Placas de Sinalização","en":"Wayfinding Signs","ar":"لوحات إرشادية"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-OFS-001', 'Modern office signs including reception signs, door signs, and wall-mounted directory boards', 'product', 'gfm-office-signs', NULL, '/images/products/gfm-office-signs.png', '["/images/products/gfm-office-signs.png"]'::jsonb, false, '{"pt":"Placas de Escritório","en":"Office Signs","ar":"لافتات مكتبية"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-DS-001', 'Directional and navigational signs for buildings, hospitals, and public spaces', 'product', 'gfm-directional-signs', NULL, '/images/products/gfm-directional-signs.png', '["/images/products/gfm-directional-signs.png"]'::jsonb, false, '{"pt":"Sinalização Direcional","en":"Directional Signs","ar":"لوحات توجيهية"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-NP-001', 'Engraved and printed name plates in brass, aluminum, acrylic, and stainless steel', 'product', 'gfm-name-plates', NULL, '/images/products/gfm-name-plates.png', '["/images/products/gfm-name-plates.png"]'::jsonb, false, '{"pt":"Placas de Identificação","en":"Name Plates","ar":"لوحات أسماء"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-RS-001', 'Custom rubber stamps with wooden and plastic handles for office and business use', 'product', 'gfm-rubber-stamps', NULL, '/images/products/gfm-rubber-stamps.png', '["/images/products/gfm-rubber-stamps.png"]'::jsonb, false, '{"pt":"Carimbos de Borracha","en":"Rubber Stamps","ar":"أختام مطاطية"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-CS-001', 'Self-inking company stamps with logos, dates, and custom text for corporate use', 'product', 'gfm-company-stamps', NULL, '/images/products/gfm-company-stamps.png', '["/images/products/gfm-company-stamps.png"]'::jsonb, false, '{"pt":"Carimbos de Empresa","en":"Company Stamps","ar":"أختام شركات"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-CSL-001', 'Premium embossing seals and wax seal stamps for corporate documents and certificates', 'product', 'gfm-custom-seals', NULL, '/images/products/gfm-custom-seals.png', '["/images/products/gfm-custom-seals.png"]'::jsonb, false, '{"pt":"Selos Personalizados","en":"Custom Seals","ar":"أختام مخصصة"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-RB-001', 'Retractable roll-up banner stands in standard and wide formats for events and exhibitions', 'product', 'gfm-rollup-banners', NULL, '/images/products/gfm-rollup-banners.png', '["/images/products/gfm-rollup-banners.png"]'::jsonb, false, '{"pt":"Banners Roll-Up","en":"Roll-Up Banners","ar":"رول أب"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-PS-001', 'Portable pop-up display stands with custom printed graphics for trade shows', 'product', 'gfm-popup-stands', NULL, '/images/products/gfm-popup-stands.png', '["/images/products/gfm-popup-stands.png"]'::jsonb, false, '{"pt":"Stands Pop-Up","en":"Pop-Up Stands","ar":"بوب أب ستاند"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-CNF-001', 'Custom conference display stands and exhibition booths for professional events', 'product', 'gfm-conference-stands', NULL, '/images/products/gfm-conference-stands.png', '["/images/products/gfm-conference-stands.png"]'::jsonb, false, '{"pt":"Stands de Conferência","en":"Conference Stands","ar":"ستاندات مؤتمرات"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-FF-001', 'Teardrop and feather flag banners with custom printing for outdoor promotions', 'product', 'gfm-feather-flags', NULL, '/images/products/gfm-feather-flags.png', '["/images/products/gfm-feather-flags.png"]'::jsonb, false, '{"pt":"Bandeiras Pena","en":"Feather Flags","ar":"أعلام ريشة"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-EF-001', 'Custom printed event flags and promotional flags for conferences and ceremonies', 'product', 'gfm-event-flags', NULL, '/images/products/gfm-event-flags.png', '["/images/products/gfm-event-flags.png"]'::jsonb, false, '{"pt":"Bandeiras de Eventos","en":"Event Flags","ar":"أعلام فعاليات"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;

INSERT INTO public.products (
  code, description, type, category, category_name, image, images, featured, names, includes, tags, catalogue, price, prices
) VALUES (
  'GFM-ID-001', 'Printed ID cards and name badges with lanyards for corporate and event identification', 'product', 'gfm-id-cards', NULL, '/images/products/gfm-id-cards.png', '["/images/products/gfm-id-cards.png"]'::jsonb, false, '{"pt":"Crachás e Cartões","en":"ID Cards & Badges","ar":"بطاقات تعريف"}'::jsonb, '{}'::text[], '{}'::text[], 'gfm', 0, '{"USD":0,"EUR":0,"EGP":0,"SAR":0}'::jsonb
) ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  category_name = EXCLUDED.category_name,
  image = EXCLUDED.image,
  images = EXCLUDED.images,
  featured = EXCLUDED.featured,
  names = EXCLUDED.names,
  includes = EXCLUDED.includes,
  tags = EXCLUDED.tags,
  catalogue = EXCLUDED.catalogue,
  price = EXCLUDED.price,
  prices = EXCLUDED.prices;
