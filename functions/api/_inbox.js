// TELEGRAM BAZASI (onlayn): kanal/guruh postlari va admin chatiga yuborilgan materiallar D1'ga yoziladi.
// Fayllar Telegram'da qoladi (file_id), ko'rish/yuklash imzolangan havola orqali Telegram'dan olib beriladi — asl shaklida.
import { kvGet, kvSet } from "./_db.js";
import { adminChat } from "./_daftar.js";

export const DEFCFG = { on: true, ack: true, allow: "" };
export async function inboxCfg(db) { try { return { ...DEFCFG, ...(JSON.parse((await kvGet(db, "inbox_cfg")) || "{}")) }; } catch { return { ...DEFCFG }; } }

const nz = (x) => String(x || "").toLowerCase().replace(/[\s_\-@.]/g, "");
export function allowed(cfg, chat) {
  const a = String(cfg.allow || "").split(/[,;\n]+/).map((x) => x.trim()).filter(Boolean);
  if (!a.length) return true;
  const id = String(chat.id), t = chat.title || chat.username || chat.first_name || "";
  return a.some((x) => { x = x.replace(/^(https?:\/\/)?(t\.me\/|telegram\.me\/)?@?/, "").replace(/\/+$/, ""); return x === id || x === id.replace(/^-100/, "") || nz(x) === nz(t) || nz(x) === nz(chat.username); });
}

function extOf(name, fallback) { const m = String(name || "").match(/\.[A-Za-z0-9]{1,5}$/); return m ? m[0].toLowerCase() : fallback; }
export function normalize(m) {
  let kind = "text", fid = null, fname = "", size = 0, ext = "";
  if (m.photo && m.photo.length) { const p = m.photo[m.photo.length - 1]; kind = "photo"; fid = p.file_id; size = p.file_size || 0; ext = ".jpg"; fname = "photo.jpg"; }
  else if (m.document) { kind = "doc"; fid = m.document.file_id; fname = m.document.file_name || "fayl"; size = m.document.file_size || 0; ext = extOf(fname, ""); }
  else if (m.voice) { kind = "voice"; fid = m.voice.file_id; size = m.voice.file_size || 0; ext = ".ogg"; fname = "ovoz.ogg"; }
  else if (m.audio) { kind = "audio"; fid = m.audio.file_id; fname = m.audio.file_name || m.audio.title || "audio.mp3"; size = m.audio.file_size || 0; ext = extOf(fname, ".mp3"); }
  else if (m.video) { kind = "video"; fid = m.video.file_id; fname = m.video.file_name || "video.mp4"; size = m.video.file_size || 0; ext = extOf(fname, ".mp4"); }
  else if (m.video_note) { kind = "video"; fid = m.video_note.file_id; fname = "video.mp4"; size = m.video_note.file_size || 0; ext = ".mp4"; }
  else if (m.animation) { kind = "video"; fid = m.animation.file_id; fname = m.animation.file_name || "animatsiya.mp4"; size = m.animation.file_size || 0; ext = ".mp4"; }
  else if (m.sticker) { kind = "photo"; fid = m.sticker.thumbnail && !m.sticker.is_animated && !m.sticker.is_video && m.sticker.file_id ? m.sticker.file_id : (m.sticker.is_animated || m.sticker.is_video ? (m.sticker.thumbnail || {}).file_id : m.sticker.file_id); fname = "stiker.webp"; ext = ".webp"; size = m.sticker.file_size || 0; }
  const text = m.text || m.caption || (m.sticker ? (m.sticker.emoji || "") + " (stiker)" : "");
  if (!fid && !text) return null; // xizmat xabarlari (a'zo qo'shildi va h.k.)
  const tags = [...new Set((String(text).match(/#[\p{L}\p{N}_]+/gu) || []).map((x) => x.slice(1).toLowerCase()))].slice(0, 12);
  return { kind, fid, fname, size, ext, text, tags };
}

export async function fileSig(env, fid) {
  const secret = (await kvGet(env.DB, "bot_secret")) || env.DAFTAR_PRIV || "x";
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode("f:" + fid)));
  let o = ""; for (let i = 0; i < 9; i++) o += s[i].toString(16).padStart(2, "0"); return o;
}

/** update ichidan Telegram bazasiga tegishli xabarni saqlaydi. Saqlangan (yoki e'tiborsiz qoldirilgan) bo'lsa true. */
export async function storeInbox(env, u) {
  const m = u.channel_post || u.edited_channel_post || u.message || u.edited_message;
  if (!m || !m.chat) return false;
  const db = env.DB, priv = m.chat.type === "private";
  if (priv) {
    const ac = await adminChat(db);
    if (!ac || String(m.chat.id) !== ac) return false; // oddiy foydalanuvchilar — to'lov boti oqimi
    if (String(m.text || "").startsWith("/")) return false; // buyruqlar
  }
  const cfg = await inboxCfg(db);
  const n = normalize(m);
  if (!n) return true;
  if (!cfg.on) return true;
  if (!allowed(cfg, m.chat)) {
    let sk = {}; try { sk = JSON.parse((await kvGet(db, "inbox_skipped")) || "{}"); } catch {}
    sk[String(m.chat.id)] = m.chat.title || m.chat.username || m.chat.first_name || "?";
    await kvSet(db, "inbox_skipped", JSON.stringify(sk));
    return true;
  }
  const chatn = m.chat.title || (m.chat.username ? "@" + m.chat.username : [m.chat.first_name, m.chat.last_name].filter(Boolean).join(" ")) || String(m.chat.id);
  const from = m.author_signature || (m.from && !m.from.is_bot ? [m.from.first_name, m.from.last_name].filter(Boolean).join(" ") || (m.from.username ? "@" + m.from.username : "") : "") || (m.sender_chat && m.sender_chat.title) || chatn;
  const id = m.chat.id + ":" + m.message_id, bot = (await kvGet(db, "bot_username")) || "";
  const fid = n.fid ? n.fid + "\u0001" + n.ext : null; // kengaytma file_id bilan birga saqlanadi
  await db.prepare("INSERT INTO df_inbox (id, bot, t, sender, chat, chatn, chatt, kind, text, file_id, fname, size, tags, done) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0) ON CONFLICT(id) DO UPDATE SET text = excluded.text, tags = excluded.tags, chatn = excluded.chatn")
    .bind(id, bot, m.date || Math.floor(Date.now() / 1000), from, String(m.chat.id), chatn, m.chat.type, n.kind, n.text, fid, n.fname, n.size, JSON.stringify(n.tags)).run();
  if (priv && cfg.ack && !u.edited_message) { try { const { send } = await import("./_daftar.js"); await send(env, m.chat.id, "✔ Bazaga saqlandi"); } catch (_) {} }
  return true;
}
