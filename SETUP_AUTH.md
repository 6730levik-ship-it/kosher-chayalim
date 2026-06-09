# הגדרת התחברות Google + Apple

הקוד מוכן. נשארו 3 דברים שרק אתה יכול לעשות (דורש את חשבונות Google/Apple/Supabase שלך).

## פרטי הזיהוי של האפליקציה
| שדה | ערך |
|---|---|
| Bundle ID (iOS) | `com.fitnessil.app` |
| Package (Android) | `com.fitnessil.app` |
| Supabase Callback URL | `https://ujpslhbxmrpvtmdujigy.supabase.co/auth/v1/callback` |

---

## 1️⃣ Google

### א. Google Cloud Console (console.cloud.google.com)
1. צור פרויקט חדש → **APIs & Services → OAuth consent screen** → מלא שם אפליקציה ואימייל.
2. **Credentials → Create Credentials → OAuth client ID** — צור 3:
   - **Web application** → תקבל **Web Client ID** + **Client Secret**.
   - **iOS** → Bundle ID = `com.fitnessil.app` → תקבל **iOS Client ID**.
   - **Android** → Package = `com.fitnessil.app` + טביעת **SHA-1**
     (`eas credentials` או `keytool` נותנים אותה) → תקבל **Android Client ID**.

### ב. הדבק את המזהים בקוד — `app.json` → `expo.extra`
```jsonc
"googleWebClientId": "<WEB_CLIENT_ID>.apps.googleusercontent.com",
"googleIosClientId": "<IOS_CLIENT_ID>.apps.googleusercontent.com"
```
וב-`plugins` → `@react-native-google-signin/google-signin` → `iosUrlScheme`:
```
"com.googleusercontent.apps.<IOS_CLIENT_ID>"   // ה-iOS Client ID הפוך
```

### ג. Supabase → Authentication → Providers → **Google** → Enable
- **Client ID (for OAuth)** = ה-Web Client ID
- **Client Secret** = ה-Web Client Secret
- **Authorized Client IDs** = הוסף את ה-**iOS** וה-**Android** Client IDs (מופרדים בפסיק) — נדרש כדי ש-Supabase יאמת את ה-idToken הנייטיבי.

---

## 2️⃣ Apple (דורש Apple Developer Program — 99$/שנה)

### א. developer.apple.com → Certificates, IDs & Profiles
1. **Identifiers → App ID** `com.fitnessil.app` → סמן **Sign In with Apple**.
2. צור **Services ID** (למשל `com.fitnessil.signin`) → הפעל Sign In with Apple → הגדר את ה-Callback URL של Supabase.
3. צור **Key** עם Sign In with Apple → הורד את קובץ ה-`.p8`.

### ב. Supabase → Authentication → Providers → **Apple** → Enable
- **Client IDs (Authorized)** = הוסף `com.fitnessil.app` (ה-bundle id — לכניסה נייטיבית מ-iOS).
- למילוי הסוד: השתמש ב-Team ID, Key ID וקובץ ה-`.p8` ליצירת ה-Secret (Supabase מסביר בדף ה-Provider).

---

## 3️⃣ בנייה — חובה Dev Build (לא Expo Go)
ההתחברות הנייטיבית **לא רצה ב-Expo Go**. צריך build אמיתי:
```powershell
npm install -g eas-cli
eas login
eas build --profile development --platform ios      # או android
```
או הרצה מקומית (דורש Xcode/Android Studio):
```powershell
npx expo run:ios
npx expo run:android
```

לאחר שתמלא את המזהים — ההתחברות תעבוד בלחיצה אחת, עם קפיצת החשבון הקיים במכשיר. ✅
