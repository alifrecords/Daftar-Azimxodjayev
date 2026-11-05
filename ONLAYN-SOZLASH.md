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

## DAW yangiliklari (v88)
- **Studio Setup (F4 yoki ⚙ Studio):** chiqish/kirish qurilmasi, kechikish rejimi, sample rate, fon rejimi, yozish sozlamalari, test ovozi.
- **Mixer (F3 yoki 🎚 Mixer):** treklar soniga qarab shakllanadi, ochiladi/yopiladi; fader, pan, M/S, metr, Fx, bus va MASTER. "🤖 Avto balans" — LUFS va trek nomiga asoslangan avtomatik balans (Ctrl+Z bilan qaytariladi).
- **Klip tutqichlari:** sichqoncha yaqinlashganda fade-in/out, klip ovozi (gain) va chetlarni kesish belgilari chiqadi; bosib turib suriladi.
- **Sizing:** Oddiy / Sizing Moves Contents / Sizing Applies Time Stretch (balandlik saqlansin belgisi bilan).

## Til (v89)
Yuqoridagi 🌐 tugmasi: O‘zbekcha / Русский / English. DAW (asboblar paneli, Mixer, Studio Setup, Sounds, Fx, AI, Pro, Drum) uchun oflayn lug‘at kiritilgan — internet shart emas. Boshqa bo‘limlarning lug‘atda yo‘q matnlari internet bo‘lsa avtomatik tarjima qilinadi. Qidiruv/kiritish maydonlaridagi yordamchi matnlar (placeholder) ham endi tarjima qilinadi.

## Konvertor va MIDI (v90) — DAW ichida «🔁 Konvert» tugmasi
- **Sample Rate Conversion:** 44.1/48/88.2/96 kHz, Kaiser oynali sinc (anti-alias).
- **Bit Depth:** 16/24-bit (TPDF dither) va 32-bit float WAV; tanlangan klip yoki butun miks.
- **Stem Separation:** Baraban · Bas · Vokal · Boshqa (HPSS + stereo markaz maskasi; AI model emas). «Pro» paneldagi «Ajratish» ham shuni ishlatadi.
- **Audio → MIDI:** monofonik melodiya yoki ritm (kick/snare/hat) → .mid fayl, oldindan tinglash bilan. Akkord/polifoniya yo‘q.

## Bounce va Avtomatizatsiya qatori (v91)
- **Bounce Selection (B):** tanlangan klip(lar)ni bitta audio klipga birlashtiradi (klip ovozi va fade pishiriladi). Sichqonchaning o‘ng tugmasi menyusida ham bor. Ctrl+Z qaytaradi.
- **Avtomatizatsiya qatori:** trek sarlavhasidagi «∿» tugmasi qatorni ochadi/yopadi. Volume yoki Pan; bosib nuqta qo‘shing, sudrang, ikki marta bosing yoki Alt+bosing — o‘chirish. R (o‘qish) / W (ijro paytida fader harakatini yozish). Audio to‘lqin shakli chiziqqa qarab pasayadi/ko‘tariladi.

## Tempoga avtomatik moslash (v92)
Audio import qilinganda yoki Sounds bo‘limidan (mening fayllarim / onlayn) qo‘shilganda va tinglanganda, u DAW loyiha tempoiga (BPM) moslanadi — tovush balandligi saqlanadi (WSOLA). Tempo fayl nomidan («96bpm») yoki audiodan aniqlanadi. Qisqa ovozlar (<1.6 s) o‘zgarmaydi. Yoqish/o‘chirish va qo‘lda moslash: 🔁 Konvert → «Tempoga moslash».

## v93 — Avtomatik akkord va uslub aniqlash (🎼 Akkord)
- DAW asboblar panelida «🎼 Akkord»: tanlangan klip yoki butun miksdan akkordlar, kalit, lad, tempo va uslub (top-3, foizda) aniqlanadi. Brauzerda, internetsiz.
- Natija: akkordlar ketma-ketligi (takt jadvali), rim raqamlari, vaqt chizig‘i, «Akkordlar» treki (ovozsiz markerlar), MIDI akkordlar, .txt va nusxa.
- Uslub — qoidalarga asoslangan taxmin (AI emas). Server/yangi sozlama kerak emas. UZ/RU/EN.

## v94 — DAW: kanal to‘lqinlari, Mono/Stereo tinglash, treklarni sudrab tartiblash
- Mono audio — bitta qator, stereo — L/R ikki qator, ko‘p kanalli — har kanal alohida qator (Logic/Cubase kabi). Klip nomida «Mono/Stereo/N ch» yoziladi.
- Trek sarlavhasida «St/Mo» tugmasi: trekni mono (L+R birlashgan) yoki stereo tinglash.
- Trek sarlavhasini sudrab tartibini almashtirish (Ctrl+Z bilan qaytariladi).
- Yangi sozlama/server kerak emas.

## v95 — DAW: 🎤 Vokal studiyasi
- Zanjir: tanlangan trekka bir tugma bilan vokal zanjiri (Pop, Rap, Ballada, Sharqona, Podkast, Radio) — mavjud AZ Vocal Repair/EQ/Kompressor/AZ Cleanup/Delay/Reverb asosida.
- Pitch: Auto-Tune uslubida kalit bo‘yicha to‘g‘rilash (avto kalit, lad, tezlik, kuch, formant saqlash).
- Harmoniya: ikkilash (Double L/R) va kalitga mos harmoniya ovozlari (terts, kvinta, kvarta, oktava) — alohida treklarda.
- Miks va master: vokal bilan masking tahlili (+EQ kesim), maqsad LUFS (−14/−16/−9) bo‘yicha master.
- Hammasi brauzerda, internetsiz, klassik DSP (neyron model emas). Server/sozlama kerak emas. UZ/RU/EN.

## v96 — Neyron stem ajratish (MDX-Net) + katta fayllar
- Konvert → «Stem Separation»: endi neyron model (KUIELab-MDX-Net, onnxruntime-web) bilan Vokal / Baraban / Bas / Boshqa ajratiladi. «Vokal + Minus» rejimi tezroq. Eski HPSS usuli «Tezkor» sifatida saqlandi (model fayllari bo‘lmasa avtomatik zaxira).
- Yangi papka: `models/` (~96 MB: `models/mdx` — 3 ta ONNX model 14 MB lik bo‘laklarda, `models/ort` — onnxruntime-web). **Saytga joylashda `models/` papkasi ham yuklanishi shart.** Har bir fayl 25 MB dan kichik (Cloudflare Pages limiti).
- Model brauzerda bir marta yig‘ilib, brauzer keshida (Cache Storage) saqlanadi; ikkinchi marta internet kerak emas. Service worker `models/` ni keshlamaydi.
- GPU (WebGPU) bo‘lsa tez, bo‘lmasa CPU da sekin. 6 daqiqagacha.
- Litsenziya: `models/NOTICE.txt` ga qarang (model og‘irliklari litsenziyasi aniq e’lon qilinmagan — tijorat tarqatishdan oldin tekshiring).
