const API = 'https://mano-keto-sync.gailius-besusparis.chatgpt.site/api';
const AUTH_KEY = 'keto-auth-v1';
const QUEUE_KEY = 'keto-sync-operations-v1';
const REVISIONS_KEY = 'keto-sync-revisions-v1';
const DEVICE_KEY = 'keto-device-v1';

const clone = value => JSON.parse(JSON.stringify(value));
function deviceId() { let value = localStorage.getItem(DEVICE_KEY); if (!value) { value = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, value); } return value; }
function auth() { try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; } }
const groups = [['user','users'],['recipe','recipes'],['cart','cart'],['pin','pins'],['pantry','pantry'],['translation','translations']];

function recordsFromStore(store) {
  const result = {};
  for (const [type, key] of groups) result[type] = new Map((store[key] || []).map(item => [item.id, item]));
  return result;
}
function diff(before, after, revisions) {
  const oldRecords = recordsFromStore(before); const newRecords = recordsFromStore(after); const result = [];
  for (const [type] of groups) {
    for (const [id, payload] of newRecords[type]) if (JSON.stringify(oldRecords[type].get(id)) !== JSON.stringify(payload)) result.push({ id: crypto.randomUUID(), deviceId: deviceId(), entityType: type, entityId: id, action: 'upsert', payload, baseRevision: revisions[`${type}:${id}`] || 0, createdAt: new Date().toISOString() });
    for (const id of oldRecords[type].keys()) if (!newRecords[type].has(id)) result.push({ id: crypto.randomUUID(), deviceId: deviceId(), entityType: type, entityId: id, action: 'delete', payload: null, baseRevision: revisions[`${type}:${id}`] || 0, createdAt: new Date().toISOString() });
  }
  return result;
}
function mergeQueue(queue, additions) { const map = new Map(queue.map(op => [`${op.entityType}:${op.entityId}`, op])); for (const op of additions) map.set(`${op.entityType}:${op.entityId}`, op); return [...map.values()]; }
function storeFromRecords(records) {
  const store = { users: [], recipes: [], cart: [], pins: [], pantry: [], translations: [] }; const revisions = {};
  const keys = Object.fromEntries(groups.map(([type,key]) => [type,key]));
  for (const record of records) { revisions[`${record.entityType}:${record.entityId}`] = record.revision; if (!record.deleted && record.payload && keys[record.entityType]) store[keys[record.entityType]].push(record.payload); }
  return { store, revisions };
}
function applyQueue(store, queue) {
  const next = clone(store); const keys = Object.fromEntries(groups.map(([type,key]) => [type,key]));
  for (const op of queue) { const list = next[keys[op.entityType]]; if (!list) continue; const index = list.findIndex(item => item.id === op.entityId); if (op.action === 'delete') { if (index >= 0) list.splice(index, 1); } else if (index >= 0) list[index] = op.payload; else list.push(op.payload); }
  return next;
}

export async function loginWithPassword(password) {
  const response = await fetch(`${API}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) });
  const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result.error || 'Prisijungti nepavyko');
  localStorage.setItem(AUTH_KEY, JSON.stringify({ token: result.token })); return result;
}
export function hasSession() { return Boolean(auth()?.token); }
export function logoutSession() { localStorage.removeItem(AUTH_KEY); }
export async function validateRecipeUrls(urls) {
  const credentials = auth(); if (!credentials?.token) throw new Error('Reikia prisijungti');
  const response = await fetch(`${API}/validate`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${credentials.token}` }, body: JSON.stringify({ urls }) });
  if (response.status === 401) { logoutSession(); throw new Error('Sesija baigėsi. Prisijunkite dar kartą.'); }
  const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result.error || 'Nuorodų patikrinti nepavyko');
  return result.results || [];
}

export function createSyncEngine({ getStore, applyStore, onAuthRequired, onStatus, onFirstSync }) {
  let baseline = { users: [], recipes: [], cart: [], pins: [], pantry: [], translations: [] };
  let queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  let revisions = JSON.parse(localStorage.getItem(REVISIONS_KEY) || '{}');
  let timer; let syncing = false; let started = false;
  const persist = () => { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); localStorage.setItem(REVISIONS_KEY, JSON.stringify(revisions)); };
  const changed = () => {
    if (!started) return;
    const current = clone(getStore()); queue = mergeQueue(queue, diff(baseline, current, revisions)); baseline = current; persist();
    clearTimeout(timer); timer = setTimeout(flush, 550);
  };
  const flush = async () => {
    const credentials = auth(); if (!credentials?.token || syncing || document.visibilityState === 'hidden') return;
    syncing = true; onStatus('saving'); const sent = [...queue];
    try {
      const response = await fetch(`${API}/sync`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${credentials.token}` }, body: JSON.stringify({ operations: sent }) });
      if (response.status === 401) { logoutSession(); onAuthRequired(); throw new Error('session'); }
      if (!response.ok) throw new Error('sync');
      const result = await response.json(); const acknowledged = new Set(result.acknowledged || []); queue = queue.filter(op => !acknowledged.has(op.id));
      const remote = storeFromRecords(result.records || []); revisions = remote.revisions; queue = queue.map(op => ({ ...op, baseRevision: revisions[`${op.entityType}:${op.entityId}`] || 0 }));
      const merged = applyQueue(remote.store, queue); baseline = clone(merged); persist(); await applyStore(merged); onStatus('synced'); onFirstSync(result.conflicts || []);
    } catch (error) { if (error.message !== 'session') onStatus('offline'); }
    finally { syncing = false; }
  };
  const start = async () => { started = true; baseline = { users: [], recipes: [], cart: [], pins: [], pantry: [], translations: [] }; changed(); await flush(); };
  window.addEventListener('online', flush); window.addEventListener('focus', flush); setInterval(flush, 15000);
  const syncNow = async () => { changed(); clearTimeout(timer); await flush(); };
  return { start, changed, flush, syncNow };
}
