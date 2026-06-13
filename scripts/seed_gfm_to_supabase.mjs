import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import WebSocket from 'ws';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Polyfill WebSocket for RealtimeClient in Node.js < 22
globalThis.WebSocket = WebSocket;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const productsPath = path.join(process.cwd(), 'src', 'data', 'products.json');
  const productsRaw = fs.readFileSync(productsPath, 'utf8');
  let products = JSON.parse(productsRaw);

  // 1. Mark some GFM products as featured
  const featuredCodes = ['GFM-BC-001', 'GFM-RU-001', 'GFM-SF-001', 'GFM-OS-001'];
  let modified = false;
  
  products = products.map(p => {
    if (featuredCodes.includes(p.code)) {
      if (!p.featured || !(p.tags || []).includes('featured')) {
        modified = true;
        p.featured = true;
        p.tags = [...new Set([...(p.tags || []), 'featured'])];
      }
    }
    return p;
  });

  if (modified) {
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
    console.log('Updated products.json with featured tags.');
  }

  // 2. Fetch all GFM categories and insert them
  // We can insert them directly using the SQL query or by inserting objects
  const categoriesToInsert = [
    { slug: 'gfm-indoor-printing', name_en: 'Indoor Printing', name_ar: 'طباعة داخلية', name_pt: 'Impressão Interior', order_index: 20 },
    { slug: 'gfm-business-cards', name_en: 'Business Cards', name_ar: 'كروت شخصية', name_pt: 'Cartões de Visita', order_index: 21 },
    { slug: 'gfm-flyers', name_en: 'Flyers', name_ar: 'فلايرز', name_pt: 'Panfletos', order_index: 22 },
    { slug: 'gfm-brochures', name_en: 'Brochures', name_ar: 'بروشورات', name_pt: 'Brochuras', order_index: 23 },
    { slug: 'gfm-books', name_en: 'Books', name_ar: 'كتب', name_pt: 'Livros', order_index: 24 },
    { slug: 'gfm-boxes-bags', name_en: 'Boxes & Bags', name_ar: 'علب وأكياس', name_pt: 'Caixas e Sacos', order_index: 25 },
    { slug: 'gfm-invitation-cards', name_en: 'Invitation Cards', name_ar: 'كروت دعوة', name_pt: 'Cartões de Convite', order_index: 26 },
    { slug: 'gfm-certificates', name_en: 'Certificates', name_ar: 'شهادات', name_pt: 'Certificados', order_index: 27 },
    { slug: 'gfm-events-conferences', name_en: 'Events & Conferences', name_ar: 'فعاليات ومؤتمرات', name_pt: 'Eventos e Conferências', order_index: 28 },
    { slug: 'gfm-rollup-banners', name_en: 'Roll-Up Banners', name_ar: 'رول أب', name_pt: 'Banners Roll-Up', order_index: 29 },
    { slug: 'gfm-popup-stands', name_en: 'Pop-Up Stands', name_ar: 'بوب أب ستاند', name_pt: 'Stands Pop-Up', order_index: 30 },
    { slug: 'gfm-conference-stands', name_en: 'Conference Stands', name_ar: 'ستاندات مؤتمرات', name_pt: 'Stands de Conferência', order_index: 31 },
    { slug: 'gfm-feather-flags', name_en: 'Feather Flags', name_ar: 'أعلام ريشة', name_pt: 'Bandeiras Pena', order_index: 32 },
    { slug: 'gfm-event-flags', name_en: 'Event Flags', name_ar: 'أعلام فعاليات', name_pt: 'Bandeiras de Eventos', order_index: 33 },
    { slug: 'gfm-id-cards', name_en: 'ID Cards & Badges', name_ar: 'بطاقات تعريف', name_pt: 'Crachás e Cartões', order_index: 34 },
    { slug: 'gfm-outdoor-printing', name_en: 'Outdoor Printing', name_ar: 'طباعة خارجية', name_pt: 'Impressão Exterior', order_index: 35 },
    { slug: 'gfm-outdoor-signage', name_en: 'Outdoor Signage', name_ar: 'لافتات خارجية', name_pt: 'Sinalização Exterior', order_index: 36 },
    { slug: 'gfm-building-facades', name_en: 'Building Facades', name_ar: 'واجهات مباني', name_pt: 'Fachadas de Edifícios', order_index: 37 },
    { slug: 'gfm-shop-fronts', name_en: 'Shop Front Signs', name_ar: 'لافتات محلات', name_pt: 'Placas de Lojas', order_index: 38 },
    { slug: 'gfm-billboards', name_en: 'Billboards', name_ar: 'لوحات إعلانية', name_pt: 'Outdoors', order_index: 39 },
    { slug: 'gfm-outdoor-banners', name_en: 'Outdoor Banners', name_ar: 'بانرات خارجية', name_pt: 'Banners Exteriores', order_index: 40 },
    { slug: 'gfm-vehicle-branding', name_en: 'Vehicle Branding', name_ar: 'تجليد سيارات', name_pt: 'Decoração de Veículos', order_index: 41 },
    { slug: 'gfm-wayfinding', name_en: 'Wayfinding Signs', name_ar: 'لوحات إرشادية', name_pt: 'Placas de Sinalização', order_index: 42 },
    { slug: 'gfm-geographic-office', name_en: 'Geographic & Office Solutions', name_ar: 'حلول جغرافية ومكتبية', name_pt: 'Soluções Geográficas e de Escritório', order_index: 43 },
    { slug: 'gfm-office-signs', name_en: 'Office Signs', name_ar: 'لافتات مكتبية', name_pt: 'Placas de Escritório', order_index: 44 },
    { slug: 'gfm-directional-signs', name_en: 'Directional Signs', name_ar: 'لوحات توجيهية', name_pt: 'Sinalização Direcional', order_index: 45 },
    { slug: 'gfm-name-plates', name_en: 'Name Plates', name_ar: 'لوحات أسماء', name_pt: 'Placas de Identificação', order_index: 46 },
    { slug: 'gfm-rubber-stamps', name_en: 'Rubber Stamps', name_ar: 'أختام مطاطية', name_pt: 'Carimbos de Borracha', order_index: 47 },
    { slug: 'gfm-company-stamps', name_en: 'Company Stamps', name_ar: 'أختام شركات', name_pt: 'Carimbos de Empresa', order_index: 48 },
    { slug: 'gfm-custom-seals', name_en: 'Custom Seals', name_ar: 'أختام مخصصة', name_pt: 'Selos Personalizados', order_index: 49 }
  ];

  for (const cat of categoriesToInsert) {
    const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
    if (error) console.error(`Error inserting category ${cat.slug}:`, error.message);
  }
  console.log('Categories synced to Supabase.');

  // 3. Sync GFM products to Supabase
  const gfmProducts = products.filter(p => p.code.startsWith('GFM-'));
  
  for (const p of gfmProducts) {
    const payload = {
      code: p.code,
      description: p.description,
      type: p.type || 'product',
      category: p.category,
      category_name: p.category_name,
      image: p.image,
      images: p.images || [p.image],
      featured: p.featured,
      names: p.names,
      includes: p.includes || [],
      tags: p.tags || [],
      catalogue: p.catalogue || 'gfm',
      is_active: p.is_active !== false,
      price: p.price ?? 0,
      prices: p.prices || { USD: p.price ?? 0, EUR: 0, EGP: 0, SAR: 0 },
    };

    // First check if product exists by code
    const { data: existing } = await supabase.from('products').select('id').eq('code', p.code).single();
    
    if (existing) {
      const { error } = await supabase.from('products').update(payload).eq('id', existing.id);
      if (error) console.error(`Error updating product ${p.code}:`, error.message);
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) console.error(`Error inserting product ${p.code}:`, error.message);
    }
  }

  console.log(`Synced ${gfmProducts.length} GFM products to Supabase.`);
}

run();
