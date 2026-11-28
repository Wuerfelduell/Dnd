// Online-Koop: Treffpunkt (Signalisierung). Host und Gast finden sich über einen Raumcode und tauschen darüber nur den
// Verbindungsaufbau aus (WebRTC-Angebot, Antwort, Netzwege). Das eigentliche Spiel läuft danach direkt zwischen beiden.
//
// Standard: Supabase Realtime (Broadcast-Kanal, keine Tabellen) im Projekt von Würfelduell. Für Tests: ?netlocal=1
// nutzt stattdessen einen BroadcastChannel des Browsers (zwei Tabs auf demselben Rechner).
import { SUPABASE_URL, SUPABASE_KEY, CHANNEL_PREFIX } from './config.js';

const useLocal = () => typeof location !== 'undefined' && new URLSearchParams(location.search).has('netlocal');

/**
 * Raum betreten. onMsg(payload) bekommt jede Nachricht der anderen Seite.
 * Rückgabe: { send(payload), close() }. Wirft, wenn der Treffpunkt nicht erreichbar ist.
 */
export async function openSignal(code, onMsg) {
  if (useLocal()) return openLocal(code, onMsg);
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    realtime: { params: { eventsPerSecond: 20 } },
  });
  const ch = sb.channel(`${CHANNEL_PREFIX}${code}`, { config: { broadcast: { self: false, ack: false } } });
  ch.on('broadcast', { event: 'sig' }, ({ payload }) => onMsg(payload));
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), 10000);
    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') { clearTimeout(timer); resolve(); }
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') { clearTimeout(timer); reject(new Error(status)); }
    });
  });
  return {
    send: (payload) => ch.send({ type: 'broadcast', event: 'sig', payload }),
    close: () => { try { sb.removeChannel(ch); sb.realtime?.disconnect?.(); } catch { /* egal */ } },
  };
}

function openLocal(code, onMsg) {
  const bc = new BroadcastChannel(`${CHANNEL_PREFIX}${code}`);
  bc.onmessage = (e) => onMsg(e.data);
  return { send: (payload) => bc.postMessage(payload), close: () => bc.close() };
}
