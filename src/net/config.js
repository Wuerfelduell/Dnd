// Online-Koop: Treffpunkt im Supabase-Projekt von Würfelduell (Diceduel). Nur Realtime-Broadcast, keine Tabellen.
// Der Schlüssel ist der öffentliche „publishable key“: Er ist für den Browser gedacht und darf im Code stehen.
// Geheime Schlüssel (service_role / secret) gehören NIE hierher.
export const SUPABASE_URL = 'https://gwjmemntmldzkynyxnvd.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_FQ6oHTqpoDACjw3XeFAUoQ_hDB-jm-t';
/** Eigenes Präfix, damit sich die Kanäle nicht mit denen von Würfelduell kreuzen. */
export const CHANNEL_PREFIX = 'nebelakten-koop-';
/** Öffentliche STUN-Server: helfen beiden Rechnern, den direkten Weg durch den Router zu finden. */
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
];
