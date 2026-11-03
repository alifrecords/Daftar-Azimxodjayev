// Telegram bazasi API (onlayn). Barchasi admin tokeni bilan (Authorization: Bearer …), faqat fayl — imzolangan havola bilan.
// Yo'llar exe versiyadagi /__data/tgin* bilan bir xil mantiqda: list · cfg · act · diag · bots · botadd · hookdel · file
import { guard, json, isAdmin, readJson, kvGet, kvSet } from "../_db.js";
import { inboxCfg, fileSig } from "../_inbox.js";
import { tg, botToken } from "../_daftar.js";

const H = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Authorization, Content-Type" };
const out = (d, s = 200) => json(d, s, H);
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm", ".ogg": "audio/ogg", ".oga": "audio/ogg", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".wav": "audio/wav", ".pdf": "application/pdf", ".txt": "text/plain; charset=utf-8" };

async function row2msg(env, r) {
  let file = "", fid = "", ext = "";
  if (r.file_id) { [fid, ext] = r.file_id.split("\u0001"); file = fid + "~" + (await fileSig(env, fid)) + (ext || ""); }
  let tags = []; try { tags = JSON.parse(r.tags || "[]"); } catch {}
  return { id: r.id, t: r.t, from: r.sender, chat: r.chat, chatn: r.chatn, chatt: r.chatt, kind: r.kind, text: r.text || "", file, fname: r.fname || "", size: r.size || 0, tags, done: !!r.done, bot: r.bot || "" };
}

export const onRequest = guard(async ({ request, env, params }) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: H });
  const db = env.DB, name = [].concat(params.path || [])[0] || "", url = new URL(request.url);

  if (name === "file") { // imzolangan havola: auth sarlavhasi yo'q (<img>/<audio> uchun)
    const n = url.searchParams.get("n") || "", m = n.match(/^([\w-]+)~([0-9a-f]{18})(\.[A-Za-z0-9]{1,5})?$/);
    if (!m || (await fileSig(env, m[1])) !== m[2]) return out({ error: "bad sig" }, 403);
    let f; try { f = await tg(env, "getFile", { file_id: m[1] }); } catch (e) { return out({ error: "tg", msg: "Telegram faylni bermadi (20 MB dan katta yoki eskirgan): " + e.message }, 404); }
    const r = await fetch((env.TG_API || "https://api.telegram.org") + "/file/bot" + (await botToken(env)) + "/" + f.file_path);
    if (!r.ok) return out({ error: "tg" }, 502);
    const ext = (m[3] || (f.file_path.match(/\.[A-Za-z0-9]{1,5}$/) || [""])[0]).toLowerCase();
    const h = { ...H, "Content-Type": MIME[ext] || r.headers.get("content-type") || "application/octet-stream", "Cache-Control": "private, max-age=86400" };
    if (url.searchParams.get("dl")) { const row = await db.prepare("SELECT fname FROM df_inbox WHERE file_id = ? LIMIT 1").bind(m[1] + "\u0001" + (m[3] || "")).first(); h["Content-Disposition"] = "attachment; filename*=UTF-8''" + encodeURIComponent((row && row.fname) || "fayl" + ext); }
    return new Response(r.body, { headers: h });
  }

  if (!(await isAdmin(request, env))) return out({ error: "auth", msg: "Telegram bazasi — faqat admin (GitHub token) uchun" }, 401);

  if (name === "list") {
    const rows = (await db.prepare("SELECT * FROM df_inbox ORDER BY t DESC LIMIT 1500").all()).results || [];
    const cfg = await inboxCfg(db); let sk = {}; try { sk = JSON.parse((await kvGet(db, "inbox_skipped")) || "{}"); } catch {}
    const msgs = []; for (const r of rows.reverse()) msgs.push(await row2msg(env, r));
    const tok = !!(await botToken(env));
    return out({ ok: true, msgs, on: cfg.on, keep: false, ack: cfg.ack, allow: cfg.allow, err: tok ? "" : "Bot ulanmagan (admin sahifa → Telegram bot)", tok, lastOK: msgs.length ? Math.max(...msgs.map((x) => x.t)) : 0, skipped: cfg.allow ? sk : {}, seen: msgs.length, ign: 0, busy: false });
  }
  if (name === "cfg") {
    const b = await readJson(request, 2000), c = await inboxCfg(db);
    if (b.on !== undefined) c.on = !!b.on; if (b.ack !== undefined) c.ack = !!b.ack;
    if (b.allow !== undefined) { c.allow = String(b.allow).slice(0, 500); await kvSet(db, "inbox_skipped", "{}"); }
    await kvSet(db, "inbox_cfg", JSON.stringify(c)); return out({ ok: true });
  }
  if (name === "act") {
    const b = await readJson(request, 20000), ids = (Array.isArray(b.ids) ? b.ids : []).slice(0, 500).map(String);
    for (const id of ids) {
      if (b.a === "del") await db.prepare("DELETE FROM df_inbox WHERE id = ?").bind(id).run();
      else if (b.a === "done" || b.a === "undone") await db.prepare("UPDATE df_inbox SET done = ? WHERE id = ?").bind(b.a === "done" ? 1 : 0, id).run();
    }
    return out({ ok: true });
  }
  if (name === "diag") {
    if (!(await botToken(env))) return out({ tok: false });
    return out({ tok: true, bot: (await kvGet(db, "bot_username")) || "", hook: "", chatErr: false, status: "administrator", pending: 0 });
  }
  if (name === "bots") return out({ ok: true, main: { name: "@" + ((await kvGet(db, "bot_username")) || "bot") }, bots: [], max: 0 });
  if (name === "botadd") return out({ ok: false, err: "Onlayn versiyada bitta bot ishlaydi (admin sahifadagi bot). Qo‘shimcha botlar kompyuter versiyada." });
  if (name === "hookdel") return out({ ok: true });
  return out({ error: "bad" }, 404);
});
