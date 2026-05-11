// ── js/db.js — Supabase database layer ───────────────────────
// All data operations go through this file.
// Falls back to localStorage if Supabase is not configured.

import { CONFIG } from './config.js';

let supabase = null;
let useLocal = false;

// ── Init ──────────────────────────────────────────────────────
export async function initDB() {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
    console.warn('[DB] No Supabase config — using localStorage fallback');
    useLocal = true;
    return { ok: false, mode: 'local' };
  }
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    // Test connection
    const { error } = await supabase.from('leads').select('id').limit(1);
    if (error) throw error;
    useLocal = false;
    return { ok: true, mode: 'supabase' };
  } catch (e) {
    console.error('[DB] Supabase connection failed:', e.message);
    useLocal = true;
    return { ok: false, mode: 'local', error: e.message };
  }
}

// ── LEADS ─────────────────────────────────────────────────────
export async function getLeads() {
  if (useLocal) return localGet('sai_leads_v4') || [];
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertLead(lead) {
  if (useLocal) {
    const leads = localGet('sai_leads_v4') || [];
    const i = leads.findIndex(l => l.id === lead.id);
    if (i >= 0) leads[i] = lead; else leads.unshift(lead);
    localSet('sai_leads_v4', leads);
    return lead;
  }
  const { data, error } = await supabase
    .from('leads')
    .upsert(lead, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function upsertLeads(leadsArr) {
  if (useLocal) {
    const existing = localGet('sai_leads_v4') || [];
    const map = new Map(existing.map(l => [l.id, l]));
    leadsArr.forEach(l => map.set(l.id, l));
    localSet('sai_leads_v4', [...map.values()]);
    return leadsArr;
  }
  const { data, error } = await supabase
    .from('leads')
    .upsert(leadsArr, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

export async function deleteLead(id) {
  if (useLocal) {
    const leads = (localGet('sai_leads_v4') || []).filter(l => l.id !== id);
    localSet('sai_leads_v4', leads);
    return;
  }
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
}

// ── TEMPLATES ─────────────────────────────────────────────────
export async function getTemplates() {
  if (useLocal) return localGet('sai_tmpls_v2') || null;
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created', { ascending: true });
  if (error) throw error;
  return data && data.length ? data : null;
}

export async function upsertTemplate(tmpl) {
  if (useLocal) {
    const tmpls = localGet('sai_tmpls_v2') || [];
    const i = tmpls.findIndex(t => t.id === tmpl.id);
    if (i >= 0) tmpls[i] = tmpl; else tmpls.push(tmpl);
    localSet('sai_tmpls_v2', tmpls);
    return tmpl;
  }
  const { data, error } = await supabase
    .from('templates')
    .upsert(tmpl, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function upsertTemplates(tmplArr) {
  if (useLocal) {
    localSet('sai_tmpls_v2', tmplArr);
    return tmplArr;
  }
  const { data, error } = await supabase
    .from('templates')
    .upsert(tmplArr, { onConflict: 'id' })
    .select();
  if (error) throw error;
  return data;
}

export async function deleteTemplate(id) {
  if (useLocal) {
    const tmpls = (localGet('sai_tmpls_v2') || []).filter(t => t.id !== id);
    localSet('sai_tmpls_v2', tmpls);
    return;
  }
  const { error } = await supabase.from('templates').delete().eq('id', id);
  if (error) throw error;
}

export function isUsingLocal() { return useLocal; }

// ── localStorage helpers ───────────────────────────────────────
function localGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function localSet(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
