# GFM Advertising — Corporate Gifts Website

موقع GFM Advertising (Brindes Publicitários) متعدد اللغات (Português · English · العربية) لسوق البرتغال.

## المميزات

- **1000+ منتج** من كتالوجات 2026 (مستخرجة من PDF)
- **3 لغات**: PT (افتراضي)، EN، AR (مع RTL)
- **Conjuntos VIP** و **Cortiça & Eco** — نقاط القوة التنافسية
- **Amostra Virtual** — رفع الشعار + معاينة + طلب
- **WhatsApp** ونماذج طلب عرض سعر
- **يعمل محلياً** ويمكن فتحه من أي جهاز على الشبكة

## التشغيل

```bash
cd c:\Website
npm install
npm run dev
```

- محلياً: http://localhost:3000
- من أي جهاز على نفس الـ Wi‑Fi: http://YOUR-PC-IP:3000

الموقع يعمل على `0.0.0.0` افتراضياً (`npm run dev`).

## اللغات

| اللغة | المسار |
|--------|--------|
| Português | `/pt` |
| English | `/en` |
| العربية | `/ar` |

## استخراج الكتالوج من PDF (منتجات + صور + أسماء)

```bash
npm run extract
```

- `src/data/products-raw.json` — بيانات خام
- `src/data/products.json` — أسماء سهلة (PT/EN/AR) + مسارات الصور
- `public/images/products/` — صور مستخرجة من الكتالوج (~473 منتج)

## طلبات العملاء

تُحفظ في `data/requests/` كملفات JSON.

## الإنتاج

```bash
npm run build
npm run start
```

## تخصيص

- رقم WhatsApp: `src/lib/utils.ts` → `WHATSAPP_NUMBER`
- البريد والهاتف: `Footer.tsx` و `contact/page.tsx`
