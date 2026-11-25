# 🌟 LingvoCards — Interaktiv Lug'at va Flashcard Dasturi

Ushbu loyiha bolalar va til o'rganuvchilar uchun mo'ljallangan zamonaviy, qulay va interaktiv so'z yodlash veb-saytidir.

---

## 🚀 Asosiy Imkoniyatlar va Funksiyalar

1. **🎴 10 ta Kartali Mashq Rejimi (Flashcards)**:
   - Har bir yangi mashg'ulotda tanlangan daraja bo'yicha **10 ta maxsus karta** beriladi.
   - **Old tomoni (Front)**:
     - Inglizcha so'z (katta va ravshan shriftda)
     - Fonetik transkripsiyasi (masalan: `[ˈæpl]`)
     - So'z turkumi (noun, verb, adjective) va toifasi
     - Jonli ovozli talaffuz tugmasi (🔊 Web Speech API orqali ingliz tilida o'qib beradi)
     - Inglizcha namunaviy gap
   - **Orqa tomoni (Back)**:
     - 🇺🇿 **O'zbekcha tarjimasi**
     - 🇷🇺 **Ruscha tarjimasi**
     - Namunaviy gapning o'zbekcha va ruscha tarjimalari
   - **3D aylanish animatsiyasi**: Kartaning ustiga bosish yoki pastdagi **"🔄 Aylantirish"** tugmasi orqali karta silliq aylanadi.

2. **🧠 "Bildim / Davom etish" va "Bilmadim" Tizimi**:
   - **"✅ Bildim (Davom etish)"**: So'zning tarjimasini bilsangiz, ball qo'shiladi va keyingi kartaga o'tiladi.
   - **"❌ Bilmadim"**: So'z esdan chiqqan bo'lsa, u avtomatik ravishda **"Bilmagan so'zlar"** ro'yxatiga qo'shiladi va keyingi kartaga o'tiladi.
   - Har bir qadamda yuqorida `Karta: 3 / 10` ko'rinishidagi qulay progress chizig'i ko'rinib turadi.

3. **📊 Yakuniy Natijalar va Bilmagan So'zlar Tahlili**:
   - 10 ta karta tugagach, avtomatik ravishda **Natijalar ekrani** ochiladi.
   - **To'plangan ball** (masalan: `8 / 10`) va bayramona salyut (confetti) effekti.
   - **Bilmagan so'zlar bo'limi**: Bolaga aynan qaysi so'zlarni eslay olmagani ko'rsatiladi:
     - So'zning yozilishi, transkripsiyasi, o'zbekcha va ruscha tarjimalari
     - Ovozli eshitish tugmasi
   - **"🔁 Faqat bilmaganlarni takrorlash"**: Bolaga o'sha bilmagan so'zlarini darhol qaytadan mashq qilib yodlab olish imkonini beradi.
   - **"🚀 Yangi 10 ta so'z"**: Keyingi 10 ta so'zli yangi davrni boshlaydi.

4. **🎓 Barcha Darajalar (A1 — C2)**:
   - **A1** (Beginner — Boshlang'ich)
   - **A2** (Elementary — Oddiy)
   - **B1** (Intermediate — O'rta)
   - **B2** (Upper-Intermediate — O'rtadan yuqori)
   - **C1** (Advanced — Ilg'or)
   - **C2** (Proficiency — Mukammal)
   - **Aralash (Barchasi)**

5. **📖 Alohida To'liq Lug'at Bo'limi (Dictionary)**:
   - Real vaqt rejimida qidiruv (ingliz, o'zbek yoki rus tilidagi so'zlar bo'yicha tezkor qidiruv).
   - Darajalar bo'yicha saralash (A1..C2 chip-filtrlari).
   - Har bir so'zni ovozli tinglash imkoniyati.
   - **"➕ Yangi so'z qo'shish"**: Foydalanuvchi o'zi xohlagan yangi so'zlarni kiritishi mumkin (ma'lumotlar brauzer xotirasi `localStorage` da saqlanadi).

6. **🌐 Ko'p Tillilik va Sozlamalar**:
   - Interfeys tillari: 🇺🇿 O'zbekcha, 🇷🇺 Русский, 🇬🇧 English.
   - 🌙 Tun / Kun (Dark / Light mode) rejimi.
   - Klaviatura yordamida boshqarish:
     - `Space` — Kartani aylantirish
     - `O'ng strelka (➡️)` — Bildim (Davom etish)
     - `Chap strelka (⬅️)` — Bilmadim

---

## 💻 Qanday Ishga Tushiriladi?

Hech qanday qo'shimcha dastur o'rnatish shart emas!
Shunchaki `d:\vc\index.html` faylini istalgan brauzerda (Google Chrome, Microsoft Edge, Firefox, Opera, Safari) ikki marta bosib oching.
