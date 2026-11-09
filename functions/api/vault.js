// Daftar BULUT (shaxsiy kod bilan): ma'lumot brauzerda SHIFRLANADI (AES-GCM), server faqat shifrlangan paketni saqlaydi.
// Kalit va "id" shaxsiy koddan brauzerda hosil qilinadi — kod serverga hech qachon yuborilmaydi.
// Cloudflare D1: df_vault (bitta daftar) + df_vchunk (bo'laklar). Foydalanuvchi ma'lumotlari tarifga bog'liq emas.
import { guard, clientIp } from "./_db.js";

const ID_RE = /^[0-9a-f]{64}$/, TX_RE = /^[0-9a-f]{16,32}$/;
const MAX_CHUNK = 700000, MAX_N = 12, MAX_VAULTS = 20000, NEW_PER_IP_HOUR = 5;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
const out = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...CORS } });

let ready = false;
async function schema(db) {
  if (ready) return;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS df_vault (id TEXT PRIMARY KEY, ver INTEGER NOT NULL, tx TEXT, n INTEGER, size INTEGER, upd INTEGER, created INTEGER)"),
    db.prepare("CREATE TABLE IF NOT EXISTS df_vchunk (id TEXT NOT NULL, tx TEXT NOT NULL, i INTEGER NOT NULL, d TEXT NOT NULL, ts INTEGER, PRIMARY KEY (id, tx, i))"),
    db.prepare("CREATE TABLE IF NOT EXISTS df_vnew (ip TEXT, ts INTEGER)"),
  ]);
  ready = true;
}

export const onRequestOptions = () => new Response(null, { status: 204, headers: CORS });
export const onRequestGet = guard(async ({ request, env }) => {
  await schema(env.DB);
  const u = new URL(request.url), id = u.searchParams.get("id") || "";
  if (u.searchParams.has("ping")) return out({ ok: true });
  if (!ID_RE.test(id)) return out({ error: "id" }, 400);
  const v = await env.DB.prepare("SELECT ver, tx, n, size, upd FROM df_vault WHERE id = ?").bind(id).first();
  if (!v) return out({ error: "none" }, 404);
  if (u.searchParams.has("i")) {
    const i = parseInt(u.searchParams.get("i"), 10), tx = u.searchParams.get("tx") || v.tx;
    if (!(i >= 0 && i < v.n) || tx !== v.tx) return out({ error: "chunk" }, 404);
    const c = await env.DB.prepare("SELECT d FROM df_vchunk WHERE id = ? AND tx = ? AND i = ?").bind(id, v.tx, i).first();
    return c ? out({ i, d: c.d }) : out({ error: "chunk" }, 404);
  }
  return out({ ver: v.ver, tx: v.tx, n: v.n, size: v.size, upd: v.upd });
});

export const onRequestPost = guard(async ({ request, env }) => {
  await schema(env.DB);
  const db = env.DB, raw = await request.text();
  if (raw.length > MAX_CHUNK + 4000) return out({ error: "big" }, 413);
  let b; try { b = JSON.parse(raw); } catch { return out({ error: "json" }, 400); }
  const id = String(b.id || ""), op = String(b.op || "");
  if (!ID_RE.test(id)) return out({ error: "id" }, 400);
  const now = Date.now();

  if (op === "put") { // bo'lak yuklash (hali faol emas)
    const tx = String(b.tx || ""), i = b.i | 0, n = b.n | 0, d = String(b.d || "");
    if (!TX_RE.test(tx) || i < 0 || n < 1 || n > MAX_N || i >= n || !d || d.length > MAX_CHUNK) return out({ error: "param" }, 400);
    const v = await db.prepare("SELECT ver FROM df_vault WHERE id = ?").bind(id).first();
    if (!v) { // yangi daftar: suiiste'molga qarshi cheklov
      const ip = clientIp(request);
      await db.prepare("DELETE FROM df_vchunk WHERE ts < ? AND id NOT IN (SELECT id FROM df_vault)").bind(now - 86400000).run();
      await db.prepare("DELETE FROM df_vnew WHERE ts < ?").bind(now - 3600000).run();
      const c = await db.prepare("SELECT COUNT(*) AS c FROM df_vnew WHERE ip = ?").bind(ip).first();
      const tot = await db.prepare("SELECT COUNT(*) AS c FROM df_vault").first();
      if (tot.c >= MAX_VAULTS) return out({ error: "full", msg: "Bulut to'lgan" }, 507);
      if (i === 0) {
        if (c.c >= NEW_PER_IP_HOUR) return out({ error: "rate", msg: "Juda ko'p yangi daftar — bir soatdan keyin urinib ko'ring" }, 429);
        await db.prepare("INSERT INTO df_vnew (ip, ts) VALUES (?, ?)").bind(ip, now).run();
      }
    }
    await db.prepare("INSERT INTO df_vchunk (id, tx, i, d, ts) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id, tx, i) DO UPDATE SET d = excluded.d, ts = excluded.ts").bind(id, tx, i, d, now).run();
    return out({ ok: true });
  }

  if (op === "commit") { // hammasi yuklangach: kutilgan versiya mos bo'lsa faollashtirish
    const tx = String(b.tx || ""), n = b.n | 0, size = b.size | 0, base = b.base | 0;
    if (!TX_RE.test(tx) || n < 1 || n > MAX_N) return out({ error: "param" }, 400);
    const cnt = await db.prepare("SELECT COUNT(*) AS c FROM df_vchunk WHERE id = ? AND tx = ?").bind(id, tx).first();
    if (cnt.c !== n) return out({ error: "incomplete" }, 400);
    let ver;
    if (base === 0) {
      const r = await db.prepare("INSERT INTO df_vault (id, ver, tx, n, size, upd, created) VALUES (?, 1, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING").bind(id, tx, n, size, now, now).run();
      if (!r.meta || !r.meta.changes) { const cur = await db.prepare("SELECT ver FROM df_vault WHERE id = ?").bind(id).first(); return out({ error: "conflict", ver: cur ? cur.ver : 0 }, 409); }
      ver = 1;
    } else {
      const r = await db.prepare("UPDATE df_vault SET ver = ver + 1, tx = ?, n = ?, size = ?, upd = ? WHERE id = ? AND ver = ?").bind(tx, n, size, now, id, base).run();
      if (!r.meta || !r.meta.changes) { const cur = await db.prepare("SELECT ver FROM df_vault WHERE id = ?").bind(id).first(); return out({ error: "conflict", ver: cur ? cur.ver : 0 }, 409); }
      ver = base + 1;
    }
    await db.prepare("DELETE FROM df_vchunk WHERE id = ? AND tx <> ?").bind(id, tx).run();
    return out({ ok: true, ver, upd: now });
  }

  if (op === "del") { // butunlay o'chirish
    await db.batch([db.prepare("DELETE FROM df_vchunk WHERE id = ?").bind(id), db.prepare("DELETE FROM df_vault WHERE id = ?").bind(id)]);
    return out({ ok: true });
  }
  return out({ error: "op" }, 400);
});
