import { adminOnly, json, getSettings, kvGet, adminRepo } from "../_db.js";
import { codeState, fmtDev } from "../_daftar.js";
export const onRequestGet = adminOnly(async ({ env }) => {
  const db = env.DB, now = Date.now();
  const s = await getSettings(db);
  const ms = new Date(); ms.setUTCDate(1); ms.setUTCHours(0, 0, 0, 0);
  const payments = (await db.prepare("SELECT id, dev, tariff, plan_name, amount, tg_user, tg_username, tg_name, photo, status, created, decided FROM df_payments ORDER BY created DESC LIMIT 200").all()).results || [];
  const codes = ((await db.prepare("SELECT id, dev, tariff, plan, days, status, created, expires, created_by, token FROM df_codes ORDER BY created DESC LIMIT 300").all()).results || []).map((c) => ({ ...c, state: codeState(c), devFmt: fmtDev(c.dev) }));
  const one = async (sql, ...a) => (await db.prepare(sql).bind(...a).first()) || {};
  const stats = {
    pending: (await one("SELECT COUNT(*) AS n FROM df_payments WHERE status = 'pending'")).n || 0,
    active: (await one("SELECT COUNT(DISTINCT dev) AS n FROM df_codes WHERE status = 'active' AND expires > ?", now)).n || 0,
    month: (await one("SELECT COALESCE(SUM(amount), 0) AS n FROM df_payments WHERE status = 'approved' AND decided >= ?", ms.getTime())).n || 0,
    all: (await one("SELECT COALESCE(SUM(amount), 0) AS n FROM df_payments WHERE status = 'approved'")).n || 0,
  };
  return json({
    stats, payments: payments.map((p) => ({ ...p, hasPhoto: !!p.photo, photo: undefined, devFmt: p.dev ? fmtDev(p.dev) : "" })), codes, settings: s,
    keyReady: !!env.DAFTAR_PRIV,
    bot: { connected: !!(await kvGet(db, "bot_username")), username: (await kvGet(db, "bot_username")) || "", adminChat: !!(await kvGet(db, "admin_chat")), adminChatName: (await kvGet(db, "admin_chat_name")) || "" },
    adminRepo: adminRepo(env),
  });
});
