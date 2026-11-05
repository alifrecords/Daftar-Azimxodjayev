# Daftar — onlayn sayt, to'lov boti va admin (AZ-ARENA bilan bir xil tuzilish)

Kod GitHub'da, sayt va server qismi **Cloudflare Pages** (bepul), baza **D1**, to'lov cheklari **Telegram bot** orqali, adminga **GitHub tokeni** bilan kiriladi.

| Fayl | Vazifasi |
| --- | --- |
| `index.html`, `sw.js`, `manifest.webmanifest` | Daftar (PWA: PC va telefonga "O'rnatish" tugmasi) |
| `admin.html` | Faqat siz uchun: to'lovlar, kodlar, karta, tariflar, bot |
| `functions/api/` | Server: `config`, `license` (ochiq) · `admin/*`, `tg/hook` (himoyalangan) |
| `online.json` | Saytni boshqa joyda (masalan GitHub Pages) ochsangiz, server manzili: `{"api":"https://SIZNING-LOYIHA.pages.dev"}` |

## 1. Cloudflare Pages'ga ulash (bir marta)
1. dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → `Daftar-Azimxodjayev`.
2. Framework: **None** · Build command: **bo'sh** · Output directory: **/** → **Save and Deploy**.

## 2. D1 bazasini ulash
Settings → **Bindings** → **Add** → **D1 database** → Variable name: **`DB`** → mavjud bazani (AZ-Playlist/ARENA'dagi) tanlang yoki yangisini yarating. Jadvallar `df_` bilan boshlanadi, boshqa loyihalarga tegmaydi. Jadvallar o'zi yaratiladi.

## 3. Imzo kaliti (muhim)
Settings → **Variables and Secrets** → **Add** → nomi **`DAFTAR_PRIV`**, turi **Secret**, qiymati: sizdagi **ADMIN-KALIT.txt** ichidagi matn (to'liq, `{"kty":"EC",…}`).
Shu kalit bilan berilgan kodlar eski kodlar bilan **bir xil** ishlaydi. Kalitni hech qachon GitHub'ga yuklamang.
Keyin: **Deployments → Retry deployment**.

## 4. Admin tokeni
github.com/settings/personal-access-tokens → `az-admin` → **Edit** → *Only select repositories* ga **Daftar-Azimxodjayev** ni ham qo'shing → **Contents: Read and write**. Bitta token hamma admin sahifalarda ishlaydi. (Repo nomi boshqacha bo'lsa: `ADMIN_REPO` = `alifrecords/NOM`.)

## 5. Admin sahifa
`https://SIZNING-LOYIHA.pages.dev/admin` → tokenni kiriting → 
1. **To'lov kartasi**ni saqlang.
2. **Telegram bot**: @BotFather → `/newbot` → token → **Botni ulash** → **Bog'lash** (havolani telefonda oching, START).
3. **Tariflar**: Standart 25 000 / Pro 49 000 (o'zgartirsangiz mijozlarda ham yangilanadi).

## 6. Avtomatik jarayon
| Qadam | Kim | Nima bo'ladi |
| --- | --- | --- |
| 1 | Foydalanuvchi | Daftar → 💎 → **Telegram'da to'lash** (qurilma kodi botga o'zi o'tadi) |
| 2 | Bot | Tarif → karta va summa |
| 3 | Foydalanuvchi | Pul o'tkazadi, chek rasmini botga yuboradi |
| 4 | Bot → Siz | Chek **Tasdiqlash / Rad etish** tugmalari bilan keladi |
| 5 | Siz | Kartaga tushganini tekshirib **Tasdiqlash** |
| 6 | Server | Shu qurilmaga imzolangan litsenziya yaratadi, botga yuboradi |
| 7 | Daftar | Ochiq bo'lsa **o'zi faollashadi** (kod nusxalash shart emas) |

Qo'lda kod: admin sahifa → *Qo'lda kod berish* yoki botda `/kod PRO DF-XXXX-XXXX-XXXX`.

## 7. Ma'lumotlar (telefon va PC)
Daftar ma'lumotlari qurilmaning **o'zida** (brauzer/ilova xotirasi, IndexedDB + zaxira) saqlanadi va har ochilganda tiklanadi; "O'rnatish"dan keyin ham shunday. Serverga foydalanuvchi ma'lumotlari **yuborilmaydi** — faqat qurilma kodi (litsenziya uchun).

## Eslatma
- Litsenziya imzolangan va qurilmada oflayn tekshiriladi; **bekor qilish** (revoke) muddati tugagunicha qurilmadagi nusxaga ta'sir qilmaydi.
- Muammo: "D1 ulanmagan" → 2-bo'lim va Retry deployment; "DAFTAR_PRIV o'rnatilmagan" → 3-bo'lim.

## 📥 Telegram bazasi (onlayn)
1. Botni Telegram kanalingizga **administrator** qilib qo‘shing.
2. Admin panelda «Botni ulash» tugmasini **qayta** bosing (webhook `channel_post` yangilanishlarini oladi).
3. Saytda 📥 tugmasi → GitHub tokeningizni bir marta kiriting (faqat admin ko‘radi).
4. Filtr/manbalar, «Jadvalga», «Ko‘rildi» — exe bilan bir xil. Fayllar Telegramda qoladi (limit ~20 MB).
5. Birinchi yuklashda eski xabarlar olinmaydi — faqat ulangandan keyingilari.

## 📁 Qurilmadagi ma'lumot papkasi (o'rnatilgan ilova)
- Ilova o'rnatilgach (yoki «Saqlash joyi» oynasidan) **Papka yaratish** → oyna Hujjatlar (Documents) da ochiladi, ichida `Daftar-Azimxodjayev-Malumot` yaratiladi.
- Ichida: `daftar-zaxira.json` (tiklash manbai), `.html` nusxa, dars fayllari, `malumot-haqida.txt` (joy, vaqt, qurilma).
- Ilova har ochilganda papkadan tiklaydi; ruxsat so'ralsa, pastdagi ko'k panelda «Ulanish».
- Faqat kompyuterdagi Chrome/Edge. Telefonda brauzer papka bermaydi — «Zaxira faylini saqlash / tiklash» ishlatiladi.
- Chrome Documents papkasining o'zini tanlatmaydi: uning ichida yangi papka yarating.

## 🎵 Sounds va Fx (DAW)
- **🎵 Sounds**: 61 ta ichki (sintez qilingan, oflayn) ovoz — Cinematic, Kino FX, Teatr/Foley, Rizer, Drums, Bass, Pads, Stabs, Arranger (tempoga mos fill/loop). Qidiruv, kategoriya, paketlar, sevimli. **Online** tabi: Freesound.org (o'z API kalitingiz kerak). **Mening fayllarim**: kompyuterdagi sample papkasini oflayn qidirish (Chrome/Edge).
- **Fx**: trek yoki Master uchun insert zanjiri — D-Verb uslubidagi reverb (Hall/Church/Plate/Room/Ambient/Nonlin), delay, distortion, EQ, compressor, limiter, chorus, flanger, phaser va boshqalar. Eksport (WAV) effektlar bilan chiqadi.
- Brauzerda VST/AU plaginlar ishlamaydi; AutoTune kiritilmagan.

## 🤖 AI Studio va 🛠 Pro vositalar (DAW)
- **AI Studio**: tanlangan klip/treklarni tahlil qiladi (chastota, LUFS, peak, LRA, stereo) va qoidalar bo'yicha avto-zanjir tuzadi (Vocal Repair, EQ, Compressor, Audio Cleanup, Limiter). Cubase uchun matnli tavsiyalar. Haqiqiy AI emas.
- **Pro**: Stem Separation (taxminiy, chastota/stereo), Spectral Editing, Automation (volume), Group Bus, Sidechain, BeatBox ulanishi, Quick Export (miks WAV / stemlar ZIP).
