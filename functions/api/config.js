// Ochiq: karta, tariflar, bot nomi (Daftar "To'lov" oynasi shuni o'qiydi).
import { guard, jsonPublic, optionsPublic } from "./_db.js";
import { publicConfig } from "./_daftar.js";
export const onRequestOptions = optionsPublic;
export const onRequestGet = guard(async ({ env }) => jsonPublic(await publicConfig(env.DB)));
