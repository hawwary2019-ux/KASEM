# 🔔 منبّهي الذكي — بناء APK

## الطريقة الأسرع: GitHub Actions (مجاني — بدون أي برامج على جهازك)

### الخطوات:

**١. إنشاء حساب GitHub (مجاني)**
- افتح https://github.com وسجّل حساباً

**٢. إنشاء مستودع جديد**
- اضغط "New repository"
- اسمه: `munabbahi-app`
- اجعله Public
- اضغط "Create repository"

**٣. رفع الملفات**
- اضغط "uploading an existing file"
- ارفع **كل محتوى هذا الـ ZIP** (افرد الملفات أولاً)
- اكتب في حقل الـ commit: `Initial commit`
- اضغط "Commit changes"

**٤. انتظر البناء التلقائي**
- اذهب لتبويب **Actions** في المستودع
- ستجد workflow يعمل تلقائياً باسم "Build Android APK"
- انتظر 5-10 دقائق

**٥. تحميل الـ APK**
- بعد اكتمال البناء، اضغط على اسم الـ workflow
- تجد في الأسفل قسم **Artifacts**
- اضغط **منبهي-الذكي-APK** لتحميله

**٦. تثبيت على Android**
- أرسل الـ APK لموبايلك
- فعّل "مصادر غير معروفة" في الإعدادات
- ثبّت التطبيق

---

## الطريقة البديلة: PWABuilder (أبسط — بدون GitHub)

١. افتح https://pwabuilder.com
٢. انشر الـ www/ على Netlify (netlify.com/drop)
٣. الصق الرابط في PWABuilder
٤. اختر Android → Generate Package
٥. حمّل الـ APK مباشرة

---

## ملاحظات مهمة
- الـ APK المبني بهذه الطريقة هو **debug APK** — يعمل مباشرة على أي Android
- المنبه يعمل في الخلفية حتى لو أغلقت التطبيق (عبر Local Notifications)
- لا يحتاج Google Play Store
