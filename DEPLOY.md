# نشر موقع GFM Advertising

## الطريقة الموصى بها: Vercel (مجاني)

Vercel مناسب جداً لمواقع Next.js ويعطيك رابط مثل: `https://gfm-advertising.vercel.app`

### المتطلبات

1. حساب مجاني على [vercel.com](https://vercel.com) (يمكن التسجيل بـ GitHub أو Google)
2. **Git** (اختياري لكن مُفضّل): [git-scm.com/download/win](https://git-scm.com/download/win)

---

### أ) النشر من GitHub (الأفضل — تحديثات تلقائية)

1. ثبّت Git وأعد تشغيل PowerShell
2. أنشئ مستودعاً على [github.com/new](https://github.com/new) (مثلاً `gfm-website`)
3. من مجلد المشروع:

```powershell
cd C:\Website
git init
git add .
git commit -m "Initial GFM Advertising website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gfm-website.git
git push -u origin main
```

4. ادخل [vercel.com/new](https://vercel.com/new) → **Import** المستودع
5. اضغط **Deploy** (لا تغيّر الإعدادات — Vercel يكتشف Next.js تلقائياً)
6. بعد دقيقتين: الموقع live + رابط عام

كل `git push` جديد يُحدّث الموقع تلقائياً.

---

### ب) النشر مباشرة من الكمبيوتر (بدون GitHub)

```powershell
cd C:\Website
npx vercel login
npx vercel --prod
```

- أول مرة: أجب على الأسئلة (اسم المشروع، إلخ)
- `--prod` = الرابط العام النهائي (ليس preview فقط)

---

## تشغيل محلي كـ Production (اختبار قبل النشر)

```powershell
cd C:\Website
npm run build
npm run start
```

افتح: http://localhost:3000/pt

---

## بعد النشر

| الإعداد | أين |
|---------|-----|
| رقم WhatsApp | `src/lib/utils.ts` → `WHATSAPP_NUMBER` |
| البريد | `src/lib/brand.ts` → `CONTACT_EMAIL` |
| نطاق خاص (مثل gfm.pt) | Vercel → Project → **Settings** → **Domains** |

---

## ملاحظات

- **طلبات النماذج** على Vercel تُحفظ مؤقتاً في `/tmp` (ليست دائمة). للإنتاج الحقيقي: اربط بريد (Resend) أو Google Sheets لاحقاً.
- حجم الصور ~35 MB — ضمن حدود Vercel المجانية.
- البناء نجح محلياً: `npm run build` ✓
