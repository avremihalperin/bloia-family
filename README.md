# מאגר משפחתי — Bloia Family Tree

אפליקציית ווב פרטית לניהול עץ משפחה מורחב עם Supabase ו-Next.js.

## התחלה מהירה

### 1. התקנת תלויות

```bash
npm install
```

### 2. משתני סביבה

העתק `.env.example` ל-`.env.local` והשלם:

- `NEXT_PUBLIC_SUPABASE_URL` — כתובת הפרויקט ב-Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — מפתח anon
- `SUPABASE_SERVICE_ROLE_KEY` — (אופציונלי) מפתח service role
- `NEXT_PUBLIC_APP_URL` — כתובת האתר (לקישורי הזמנה)

### 3. הרצה מקומית

```bash
npm run dev
```

### 4. הגדרה ראשונית

1. פתח `http://localhost:3000/setup` — הגדר סיסמה משפחתית ושם העץ
2. פתח `http://localhost:3000/login` — התחבר עם הסיסמה
3. עבור ל**ניהול** — הזן דור 1 (סבא/סבתא) ודור 2 (בנים ובנות)
4. צור קישורי הזמנה ושלח לבני המשפחה

## תכונות

- סיסמה משפחתית לצפייה בכל העץ
- קישור הזמנה אישי + אימייל לעריכה עצמית
- תצוגות: עץ, טבלה, כרטיסים
- חיפוש וסינון לפי משפחה ודור
- תאריכי לידה לועזיים ועבריים
- העלאת תמונות
- ייצוא CSV

## פריסה ל-GitHub + Vercel

### GitHub
```bash
git add .
git commit -m "Family tree app"
git branch -M main
git remote add origin https://github.com/YOUR_USER/bloia.git
git push -u origin main
```

### Vercel
1. התחבר: `vercel login`
2. פרוס: `vercel --prod`
3. הגדר Environment Variables ב-Vercel (Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (אופציונלי)
   - `NEXT_PUBLIC_APP_URL` = כתובת ה-Vercel שלך
4. ב-Supabase → Authentication → URL Configuration: הוסף `https://YOUR-APP.vercel.app/**`

## מבנה מסד הנתונים

- `people` — אנשים בעץ
- `branches` — ענפי משפחה (כל בן/בת מדור 2)
- `invitations` — קישורי הזמנה
- `app_settings` — הגדרות וסיסמה משפחתית
- `family_sessions` — סשנים פעילים

מיגרציות SQL נמצאות בתיקיית `supabase/migrations/`.
