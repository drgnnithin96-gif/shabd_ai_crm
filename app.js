// ── js/app.js — Shabd AI CRM main application ───────────────
import { initDB, getLeads, upsertLead, upsertLeads, deleteLead,
         getTemplates, upsertTemplate, upsertTemplates, deleteTemplate,
         isUsingLocal } from './db.js';
import { CONFIG } from './config.js';

// ── Constants ──────────────────────────────────────────────────
const STAGES = ['New', 'Contacted', 'Replied', 'Follow-up', 'Closed'];
const SCOL = { New: 'var(--bl)', Contacted: 'var(--am)', Replied: 'var(--gn)', 'Follow-up': 'var(--pu)', Closed: 'var(--mu)' };
const SPILL = { New: 'pN', Contacted: 'pC', Replied: 'pR', 'Follow-up': 'pF', Closed: 'pX' };
const LOGO_URI = "data:image/jpeg;base64,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LgMwqL4cmPJXtKTULYl8w0pKaKnmkUWiKmaTbEwB0V9U0V9129Z4RqNE9ZNviSKzDTQ/Wzqk81axop2LqdXStIqecoyEkgT/ALJCkGQUkl87SD7wwlbqBtObam5ouGBKW6ZE1cK7lAKWEWX81kT5zMsBdDeiPloNNoTNzwVCLkBZnhWqnzqj3CrmzpBMuxl/dRQ3L1AEIRIXqpkTouBvYQAJzoQCZ61yYf/aAAwDAQACAAMAAAAQ8887hX9188888885ulqVra888884fu6f+Ou88888/XM88888r6888Naf888888Y884HquTZ5aw53Y8t9v2GE2J/oPq88po/89c886Z8888Ru388880J8888+Yt25w2e+888888v54k3+4+88ww04400004888Djdj/DBj9988//EACcRAQABAwMEAgIDAQAAAAAAAAERACExQVFhcYGRoSCxEMEw0fBA/9oACAEDAQE/EPyoJaGoyjD9Tze1FkWTpHrfntUNRGf4GaW8vWNib7URSlEXOECCRyItOkRT8Jysir217RV+UdGI7zPqDinQFaKPBIDxbxUmi4founDfSaduliBbvs9fknSA/wB1XihYk4O8w2gCwb2YXipASTBg2MHdgOM1eE6q3ZEL1kOpU8vYt34hPea0ZaaEhq0luNxNkwlCIEE6C/o6ZGDSfgclFkJmZ03hjfNyBoC7ywuQmXurvYqJ9bhoZOhiNU6fIQkJqaUtiLyWvE7bi6wfmY5YnVZBEilkxrEY1EssuC2PbTh5W780aJhHsf1HT83dLp7oZOsYAvCIUeo8QRFaWBPS79hR1KF5JG5iOw/dadAEyJsplk3s0DocoQWaP9hSESIDFpLbz3inpHGIsE9D9tCSKxDPMziKSUhidM7WqXa1zu39UiM2g/CCQ0crceaHgpfQSfS1hlgkpHbCPNQik4SwEwFrt9goUmATkGDzUeyyyKw4xaNu9LSnRLba8eopYZlnZmcdJ71ApF9tPVIxuLm3FMdoPH5bTU+G53pFJYdhn3RhwqP99HJx+Dwmhk4TUcj0oJhSy8rld38gilcU/wCaLxiQIXEEwbopn4mWsd2zr9I2acDtXNu3U08bUnKEsjkfjHUi7Z6j/NdqZEkGXyY7Mvbn4ogVIlREnVhOXR6+aCV0+vUw/fNLLyJD4h6ml0vHS9gbo+iX6oQ8OJID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";

const DEFAULT_TMPLS = [
  { id: 't1', name: 'NGO & Social Impact', sector: 'NGO & Social Impact',
    subject: 'Localisation support for {company} — Shabd AI',
    body: `Hi {name},

I'm reaching out from Shabd AI (NSRCEL, IIM Bangalore incubated, Kotak Grantee), and a Top 30 finalist at the India AI Impact Summit 2026.

I came across {company} and was particularly impressed by your work in the social impact space.

Many organisations working across India face a common challenge — ensuring that program communication, training, and beneficiary engagement are clearly understood across diverse linguistic communities, especially in rural and semi-urban regions.

At Shabd AI, we help address this through contextual localisation of text, voice, and video across Indian languages, improving beneficiary understanding, participation, and overall program effectiveness.

We typically support with:
- Localisation of training content, curriculum, and awareness materials
- Multilingual communication for beneficiaries and field teams
- Voice-based solutions (IVR/WhatsApp) for low-literacy populations
- Translation and dubbing of program videos and impact content
- Digitisation of field workflows with multilingual interfaces

We currently support 40+ organisations including Quest Alliance, ARMMAN, CRY, and Central Square Foundation.

Happy to share a quick example or explore a small pilot aligned to your programs.

Would it make sense to connect briefly (10–15 mins)?
Alternatively, I'd appreciate if you could point me to the right person on your team.

Warm regards,
{sender}
Shabd AI | shabd.ai` },
  { id: 't2', name: 'Education', sector: 'Education',
    subject: 'Breaking language barriers for {company} — Shabd AI',
    body: `Hi {name},

Greetings from Shabd AI — an AI-powered localisation company incubated at IIM Bangalore (NSRCEL) and a Kotak Grantee.

I came across {company} and wanted to explore how we could support your learner outreach across India's diverse linguistic landscape.

At Shabd AI, we specialise in contextual translation, voice dubbing, and multilingual content for Indian learners — helping you reach students in their mother tongue.

We work with Quest Alliance and Central Square Foundation to localise curriculum and digital learning content across 10+ Indian languages.

Would love to show you a quick demo or explore a pilot. Are you available for a 15-minute call this week?

Warm regards,
{sender}
Shabd AI | shabd.ai` },
  { id: 't3', name: 'Healthcare', sector: 'Healthcare',
    subject: 'Multilingual patient communication for {company} — Shabd AI',
    body: `Hi {name},

I'm reaching out from Shabd AI, an AI-powered localisation platform incubated at IIM Bangalore (NSRCEL).

Patient communication and health literacy are deeply tied to language. At Shabd AI, we help localise patient education content, IVR scripts, WhatsApp messages, and field training material into 10+ Indian languages.

We've supported organisations like ARMMAN in multilingual beneficiary communication.

Could we connect for 15 minutes to explore a fit for {company}?

Warm regards,
{sender}
Shabd AI | shabd.ai` },
  { id: 't4', name: 'SaaS / Tech', sector: 'SaaS',
    subject: 'Localise {company} for Bharat — Shabd AI',
    body: `Hi {name},

I'm {sender} from Shabd AI — an AI-powered localisation platform built for Indian languages, incubated at IIM Bangalore (NSRCEL).

As {company} scales across India, we help localise your UI, onboarding flows, support content, and marketing across Hindi, Tamil, Telugu, Kannada, Bengali, and 10+ more Indian languages.

Happy to run a quick demo. 15 minutes this week?

Warm regards,
{sender}
Shabd AI | shabd.ai` },
  { id: 't5', name: 'E-commerce', sector: 'E-commerce',
    subject: 'Reach Bharat in their language — Shabd AI for {company}',
    body: `Hi {name},

I'm reaching out from Shabd AI, an AI-powered localisation platform incubated at IIM Bangalore (NSRCEL).

India's next 200 million online shoppers are coming from non-English-speaking regions. We help e-commerce brands localise product catalogues, WhatsApp nudges, push notifications, and support content across 10+ Indian languages.

15 minutes this week for a quick proof-of-concept?

Warm regards,
{sender}
Shabd AI | shabd.ai` },
];

// ── State ─────────────────────────────────────────────────────
let leads = [], templates = [], editId = null, detailId = null, emailLeadId = null, editTmplId = null;
let currentView = 'list', stageFilter = '', overdueFilter = false, activeTmplId = null;
let senderName = CONFIG.SENDER_NAME || localStorage.getItem('sai_sender') || 'Shabd AI Team';
let csvParsed = [], csvHeaders = [], csvColMap = {};

// ── Init ─────────────────────────────────────────────────────
async function init() {
  // Set logo
  const logoEl = document.getElementById('app-logo');
  if (logoEl) logoEl.src = LOGO_URI;

  // Set sender name
  senderName = CONFIG.SENDER_NAME || localStorage.getItem('sai_sender') || 'Shabd AI Team';

  // Connect DB
  updateDbStatus('connecting');
  const result = await initDB();
  updateDbStatus(result.ok ? 'connected' : 'local');

  // Load data
  try {
    leads = await getLeads();
    const tmplData = await getTemplates();
    templates = tmplData || JSON.parse(JSON.stringify(DEFAULT_TMPLS));
    if (!tmplData) await upsertTemplates(templates).catch(() => {});
  } catch (e) {
    console.error('Load error:', e);
    leads = JSON.parse(localStorage.getItem('sai_leads_v4') || '[]');
    templates = JSON.parse(localStorage.getItem('sai_tmpls_v2') || 'null') || JSON.parse(JSON.stringify(DEFAULT_TMPLS));
  }

  renderStats();
  renderSectorFilter();
  renderView();
}

function updateDbStatus(state) {
  const el = document.getElementById('db-status');
  if (!el) return;
  el.className = 'db-status';
  if (state === 'connected') { el.classList.add('connected'); el.innerHTML = '<span class="db-dot"></span> Supabase connected'; }
  else if (state === 'local') { el.innerHTML = '<span class="db-dot"></span> Local storage'; }
  else if (state === 'connecting') { el.innerHTML = '<span class="spinner"></span> Connecting...'; }
}

// ── Helpers ───────────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function addDays(dateStr, n) { const d = new Date(dateStr); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function fmtDate(s) { return s ? new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }
function personalize(text, lead) {
  return text.replace(/\{name\}/g, lead.name || 'there').replace(/\{company\}/g, lead.company || 'your organisation').replace(/\{sector\}/g, lead.sector || 'your sector').replace(/\{sender\}/g, senderName);
}
function autoReminders() {
  const sent = document.getElementById('f-sent').value;
  if (!sent) return;
  document.getElementById('f-r1').value = addDays(sent, 5);
  document.getElementById('f-r2').value = addDays(sent, 10);
  document.getElementById('f-r3').value = addDays(sent, 20);
}
window.autoReminders = autoReminders;

function computeReminders(sentDate) {
  if (!sentDate) return { r1: '', r2: '', r3: '' };
  return { r1: addDays(sentDate, 5), r2: addDays(sentDate, 10), r3: addDays(sentDate, 20) };
}
function reminderStatus(dateStr) {
  if (!dateStr) return { cls: 'rb-nn', label: '—' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 864e5);
  if (diff < 0) return { cls: 'rb-ov', label: Math.abs(diff) + 'd overdue' };
  if (diff === 0) return { cls: 'rb-sn', label: 'Today' };
  if (diff <= 3) return { cls: 'rb-sn', label: 'In ' + diff + 'd' };
  return { cls: 'rb-ok', label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) };
}
function nextDueReminder(l) {
  for (const f of ['r1', 'r2', 'r3']) {
    if (l[f]) { const rs = reminderStatus(l[f]); if (rs.cls === 'rb-ov' || rs.cls === 'rb-sn') return rs; }
  }
  return null;
}
function reminder3dots(l) {
  return ['r1', 'r2', 'r3'].map(f => {
    if (!l[f]) return '<span class="r3d pending"></span>';
    const rs = reminderStatus(l[f]);
    const cls = rs.cls === 'rb-ov' ? 'overdue' : rs.cls === 'rb-sn' ? 'due' : 'done';
    return `<span class="r3d ${cls}" title="${l[f]}"></span>`;
  }).join('');
}
function pill(stage) {
  const cls = SPILL[stage] || 'pX', col = SCOL[stage] || 'var(--mu)';
  return `<span class="pill ${cls}"><span class="pd" style="background:${col}"></span>${esc(stage)}</span>`;
}
function getOverdueCount() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return leads.filter(l => ['r1', 'r2', 'r3'].some(f => { if (!l[f]) return false; const d = new Date(l[f]); d.setHours(0, 0, 0, 0); return d <= today; })).length;
}

// ── Render ────────────────────────────────────────────────────
function renderStats() {
  document.getElementById('stats-row').innerHTML = STAGES.map(s => {
    const n = leads.filter(l => l.stage === s).length;
    return `<div class="sc" onclick="filterStage('${s}',null)"><div class="sn">${n}</div><div class="sl"><span class="sdot" style="background:${SCOL[s]}"></span>${s}</div></div>`;
  }).join('');
}
function renderSectorFilter() {
  const sel = document.getElementById('filter-sector');
  const secs = [...new Set(leads.map(l => l.sector).filter(Boolean))].sort();
  const cur = sel.value;
  sel.innerHTML = '<option value="">All sectors</option>' + secs.map(s => `<option${s === cur ? ' selected' : ''}>${esc(s)}</option>`).join('');
}
function getFiltered() {
  const q = (document.getElementById('search').value || '').toLowerCase();
  const fsc = document.getElementById('filter-sector').value;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return leads.filter(l => {
    if (stageFilter && l.stage !== stageFilter) return false;
    if (fsc && l.sector !== fsc) return false;
    if (overdueFilter) {
      const hasOv = ['r1', 'r2', 'r3'].some(f => { if (!l[f]) return false; const d = new Date(l[f]); d.setHours(0, 0, 0, 0); return d <= today; });
      if (!hasOv) return false;
    }
    if (q && !((l.name || '').toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q) || (l.email || '').toLowerCase().includes(q))) return false;
    return true;
  });
}

function switchView(v, el) {
  currentView = v; stageFilter = ''; overdueFilter = false;
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('page-title').textContent = { list: 'All leads', pipeline: 'Pipeline', templates: 'Email templates' }[v] || 'All leads';
  renderView();
}
window.switchView = switchView;

function filterStage(stage, el) {
  stageFilter = stageFilter === stage ? '' : stage;
  overdueFilter = false; currentView = 'list';
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  document.getElementById('nav-list').classList.add('active');
  document.getElementById('page-title').textContent = stageFilter || 'All leads';
  renderView();
}
window.filterStage = filterStage;

function filterOverdue(el) {
  overdueFilter = true; stageFilter = ''; currentView = 'list';
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('page-title').textContent = 'Overdue reminders';
  renderView();
}
window.filterOverdue = filterOverdue;

function renderView() {
  renderSectorFilter();
  if (currentView === 'pipeline') renderPipeline();
  else if (currentView === 'templates') renderTemplatesView();
  else renderList();
}
window.renderView = renderView;

function renderList() {
  const list = getFiltered(), el = document.getElementById('content');
  const oc = getOverdueCount();
  let banner = '';
  if (oc > 0 && !overdueFilter) {
    banner = `<div class="remind-banner" onclick="filterOverdue(document.getElementById('nav-ov'))">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
      <div><strong>${oc} lead${oc > 1 ? 's have' : ' has'} overdue reminders</strong> <span>— click to view</span></div>
    </div>`;
  }
  if (!list.length) {
    el.innerHTML = banner + `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><p>No leads found</p><small>Add your first lead, import CSV, or adjust filters</small></div>`;
    return;
  }
  el.innerHTML = banner + `<div style="overflow-x:auto"><table class="lt">
    <thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Sector</th><th>Stage</th><th>Sent</th><th>Reminders</th><th>Last contacted</th><th>Notes</th><th></th></tr></thead>
    <tbody>${list.map(l => {
      const nd = nextDueReminder(l);
      return `<tr onclick="openDetail('${l.id}')">
        <td style="font-weight:400">${esc(l.name)}</td>
        <td>${esc(l.company)}</td>
        <td style="font-size:12px;color:var(--mu)">${esc(l.email)}</td>
        <td><span class="spill">${esc(l.sector)}</span></td>
        <td>${pill(l.stage)}</td>
        <td class="dc">${l.sent ? new Date(l.sent).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
        <td><div class="r3">${reminder3dots(l)}</div>${nd ? `<div style="margin-top:3px"><span class="rb ${nd.cls}">${nd.label}</span></div>` : ''}</td>
        <td class="dc">${l.lc ? new Date(l.lc).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
        <td class="nc" title="${esc(l.notes)}">${esc(l.notes) || '—'}</td>
        <td class="ac" onclick="event.stopPropagation()">
          <button class="ib mb" title="Draft email" onclick="openEmail('${l.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></button>
          <button class="ib" title="Edit" onclick="openEdit('${l.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="ib" title="Delete" onclick="confirmDelete('${l.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
        </td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
}

function renderPipeline() {
  const el = document.getElementById('content');
  const q = (document.getElementById('search').value || '').toLowerCase();
  const fsc = document.getElementById('filter-sector').value;
  const ok = l => { if (fsc && l.sector !== fsc) return false; if (q && !((l.name || '').toLowerCase().includes(q) || (l.company || '').toLowerCase().includes(q))) return false; return true; };
  el.innerHTML = `<div class="pipeline">${STAGES.map(s => {
    const cards = leads.filter(l => l.stage === s && ok(l));
    return `<div class="stcol">
      <div class="sthd"><div class="stname"><span style="width:7px;height:7px;border-radius:50%;background:${SCOL[s]};display:inline-block"></span>${s}</div><span class="stcnt">${cards.length}</span></div>
      <div class="stcards">${cards.length ? cards.map(l => {
        const nd = nextDueReminder(l);
        return `<div class="pc" onclick="openDetail('${l.id}')">
          <div class="pcn">${esc(l.name)}</div><div class="pcc">${esc(l.company) || '—'}</div>
          <div class="pcm"><span class="spill">${esc(l.sector)}</span>${nd ? `<span class="rb ${nd.cls}">${nd.label}</span>` : ''}</div>
        </div>`;
      }).join('') : `<div class="ec">—</div>`}</div>
    </div>`;
  }).join('')}</div>`;
}

// ── Lead CRUD ─────────────────────────────────────────────────
function openAdd() {
  editId = null;
  document.getElementById('form-title').textContent = 'Add lead';
  ['name', 'company', 'email', 'notes'].forEach(f => document.getElementById('f-' + f).value = '');
  ['sent', 'r1', 'r2', 'r3', 'lc'].forEach(f => document.getElementById('f-' + f).value = '');
  document.getElementById('f-sector').value = 'NGO & Social Impact';
  document.getElementById('f-stage').value = 'New';
  document.getElementById('form-modal').classList.add('open');
}
window.openAdd = openAdd;

function openEdit(id) {
  const l = leads.find(x => x.id === id); if (!l) return;
  editId = id;
  document.getElementById('form-title').textContent = 'Edit lead';
  ['name', 'company', 'email', 'notes', 'sent', 'r1', 'r2', 'r3', 'lc'].forEach(f => document.getElementById('f-' + f).value = l[f] || '');
  document.getElementById('f-sector').value = l.sector || 'Other';
  document.getElementById('f-stage').value = l.stage || 'New';
  document.getElementById('form-modal').classList.add('open');
}
window.openEdit = openEdit;

function closeForm() { document.getElementById('form-modal').classList.remove('open'); }
window.closeForm = closeForm;

async function saveLead() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { document.getElementById('f-name').focus(); return; }
  const data = {
    id: editId || uid(),
    name, company: document.getElementById('f-company').value.trim(),
    email: document.getElementById('f-email').value.trim(),
    sector: document.getElementById('f-sector').value,
    stage: document.getElementById('f-stage').value,
    sent: document.getElementById('f-sent').value,
    r1: document.getElementById('f-r1').value,
    r2: document.getElementById('f-r2').value,
    r3: document.getElementById('f-r3').value,
    lc: document.getElementById('f-lc').value,
    notes: document.getElementById('f-notes').value.trim(),
    updated: new Date().toISOString(),
    created: editId ? (leads.find(l => l.id === editId)?.created || new Date().toISOString()) : new Date().toISOString()
  };
  try {
    await upsertLead(data);
    const i = leads.findIndex(l => l.id === data.id);
    if (i >= 0) leads[i] = data; else leads.unshift(data);
    closeForm(); renderStats(); renderSectorFilter(); renderView();
    showToast(editId ? 'Lead updated' : 'Lead added');
  } catch (e) { showToast('Error saving: ' + e.message); }
}
window.saveLead = saveLead;

function openDetail(id) {
  const l = leads.find(x => x.id === id); if (!l) return;
  detailId = id;
  document.getElementById('d-name').textContent = l.name;
  function rtlStep(label, dateStr) {
    const rs = reminderStatus(dateStr);
    if (!dateStr) return `<div class="rtl-step pending"><div class="rtl-day">${label}</div><div class="rtl-date">Not set</div></div>`;
    let cls = 'done';
    if (rs.cls === 'rb-ov') cls = 'overdue';
    else if (rs.cls === 'rb-sn') cls = 'due-soon';
    const col = cls === 'overdue' ? 'var(--rd)' : cls === 'due-soon' ? 'var(--or)' : 'var(--gn)';
    return `<div class="rtl-step ${cls}"><div class="rtl-day">${label}</div><div class="rtl-date">${dateStr}</div><div class="rtl-status" style="color:${col}">${rs.label}</div></div>`;
  }
  document.getElementById('d-content').innerHTML = `
    <div>
      <div class="dr"><span class="dl">Company</span><span class="dv">${esc(l.company) || '—'}</span></div>
      <div class="dr"><span class="dl">Email</span><span class="dv"><a href="mailto:${esc(l.email)}">${esc(l.email) || '—'}</a></span></div>
      <div class="dr"><span class="dl">Sector</span><span class="dv"><span class="spill">${esc(l.sector)}</span></span></div>
      <div class="dr"><span class="dl">Stage</span><span class="dv">${pill(l.stage)}</span></div>
      <div class="dr"><span class="dl">Email sent</span><span class="dv" style="color:var(--mu)">${fmtDate(l.sent)}</span></div>
      <div class="dr"><span class="dl">Last contacted</span><span class="dv" style="color:var(--mu)">${fmtDate(l.lc)}</span></div>
      <div class="dr"><span class="dl">Added</span><span class="dv" style="color:var(--mu)">${fmtDate(l.created)}</span></div>
    </div>
    <div class="slbl">Follow-up reminders</div>
    <div class="rtl">${rtlStep('Day 5', l.r1)}${rtlStep('Day 10', l.r2)}${rtlStep('Day 20', l.r3)}</div>
    <div class="slbl">Notes</div>
    <div class="dn">${esc(l.notes) || 'No notes added.'}</div>
    <div class="slbl">Move stage</div>
    <div class="mb2">${STAGES.map(s => `<button class="smb${l.stage === s ? ' cur' : ''}" onclick="moveStage('${id}','${s}')">${esc(s)}</button>`).join('')}</div>`;
  document.getElementById('detail-modal').classList.add('open');
}
window.openDetail = openDetail;

function closeDetail() { document.getElementById('detail-modal').classList.remove('open'); detailId = null; }
window.closeDetail = closeDetail;

async function moveStage(id, stage) {
  const l = leads.find(x => x.id === id); if (!l) return;
  l.stage = stage; l.updated = new Date().toISOString();
  if (stage === 'Contacted' && !l.lc) l.lc = new Date().toISOString().slice(0, 10);
  try { await upsertLead(l); renderStats(); renderView(); openDetail(id); showToast('Moved to ' + stage); }
  catch (e) { showToast('Error: ' + e.message); }
}
window.moveStage = moveStage;

function editFromDetail() { const id = detailId; closeDetail(); openEdit(id); }
window.editFromDetail = editFromDetail;

async function doDeleteLead() {
  if (!detailId) return;
  if (!confirm('Delete this lead? This cannot be undone.')) return;
  try {
    await deleteLead(detailId);
    leads = leads.filter(l => l.id !== detailId);
    closeDetail(); renderStats(); renderSectorFilter(); renderView();
    showToast('Lead deleted');
  } catch (e) { showToast('Error: ' + e.message); }
}
window.doDeleteLead = doDeleteLead;

async function confirmDelete(id) {
  if (!confirm('Delete this lead?')) return;
  try {
    await deleteLead(id);
    leads = leads.filter(l => l.id !== id);
    renderStats(); renderSectorFilter(); renderView();
    showToast('Lead deleted');
  } catch (e) { showToast('Error: ' + e.message); }
}
window.confirmDelete = confirmDelete;

// ── Email ─────────────────────────────────────────────────────
function openEmail(id) {
  emailLeadId = id;
  const lead = leads.find(x => x.id === id); if (!lead) return;
  const sorted = [...templates.filter(t => t.sector === lead.sector || t.sector === 'All sectors'), ...templates.filter(t => t.sector !== lead.sector && t.sector !== 'All sectors')];
  document.getElementById('email-ttabs').innerHTML = sorted.map((t, i) => `<button class="tt${i === 0 ? ' active' : ''}" onclick="selTmpl('${t.id}','${id}',this)">${esc(t.name)}</button>`).join('');
  activeTmplId = sorted[0]?.id || null;
  if (activeTmplId) renderEmailPrev(activeTmplId, lead);
  document.getElementById('email-modal').classList.add('open');
}
window.openEmail = openEmail;

function openEmailFromDetail() { const id = detailId; closeDetail(); openEmail(id); }
window.openEmailFromDetail = openEmailFromDetail;

function closeEmail() { document.getElementById('email-modal').classList.remove('open'); }
window.closeEmail = closeEmail;

function selTmpl(tid, lid, btn) {
  activeTmplId = tid;
  document.querySelectorAll('.tt').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const lead = leads.find(x => x.id === lid);
  if (lead) renderEmailPrev(tid, lead);
}
window.selTmpl = selTmpl;

function renderEmailPrev(tid, lead) {
  const t = templates.find(x => x.id === tid); if (!t) return;
  document.getElementById('email-subp').textContent = 'Subject: ' + personalize(t.subject, lead);
  document.getElementById('email-body').textContent = personalize(t.body, lead);
}
function copyBody() {
  const tx = document.getElementById('email-body').textContent;
  navigator.clipboard.writeText(tx).then(() => showToast('Email body copied!')).catch(() => { const ta = document.createElement('textarea'); ta.value = tx; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); showToast('Copied!'); });
}
window.copyBody = copyBody;
function copySubj() {
  const tx = document.getElementById('email-subp').textContent.replace('Subject: ', '');
  navigator.clipboard.writeText(tx).then(() => showToast('Subject copied!')).catch(() => { const ta = document.createElement('textarea'); ta.value = tx; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); showToast('Copied!'); });
}
window.copySubj = copySubj;

// ── Templates ─────────────────────────────────────────────────
function renderTemplatesView() {
  const el = document.getElementById('content');
  el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
    <div style="font-size:13px;color:var(--mu)">${templates.length} templates · <code>{name}</code> <code>{company}</code> <code>{sector}</code> <code>{sender}</code></div>
    <div style="display:flex;gap:8px">
      <button class="bg" style="font-size:12px;padding:6px 12px" onclick="setSender()">✏ Sender: ${esc(senderName)}</button>
      <button class="ab" onclick="openTmpl(null)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:14px;height:14px;stroke-width:2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New template</button>
    </div>
  </div>
  ${templates.map(t => `<div class="tcard">
    <div class="tch"><div><div class="tcn">${esc(t.name)}</div><div class="tcs">${esc(t.sector)}</div></div></div>
    <div class="tcsu">📧 ${esc(t.subject)}</div>
    <div class="tcb">${esc(t.body)}</div>
    <div class="tca">
      <button class="bg" style="font-size:12px;padding:5px 12px" onclick="openTmpl('${t.id}')">Edit</button>
      <button class="bg" style="font-size:12px;padding:5px 12px;color:var(--rd);border-color:rgba(248,113,113,.4)" onclick="doDeleteTemplate('${t.id}')">Delete</button>
    </div>
  </div>`).join('')}`;
}
function setSender() {
  const n = prompt('Your name (shown as {sender} in all templates):', senderName);
  if (n && n.trim()) { senderName = n.trim(); localStorage.setItem('sai_sender', senderName); renderTemplatesView(); showToast('Sender name updated'); }
}
window.setSender = setSender;
function openTmpl(id) {
  editTmplId = id;
  const t = id ? templates.find(x => x.id === id) : null;
  document.getElementById('tmpl-form-title').textContent = id ? 'Edit template' : 'New template';
  document.getElementById('tn').value = t ? t.name : '';
  document.getElementById('ts').value = t ? t.sector : 'All sectors';
  document.getElementById('tsu').value = t ? t.subject : '';
  document.getElementById('tb').value = t ? t.body : '';
  document.getElementById('tmpl-modal').classList.add('open');
}
window.openTmpl = openTmpl;
function closeTmpl() { document.getElementById('tmpl-modal').classList.remove('open'); }
window.closeTmpl = closeTmpl;
async function saveTmpl() {
  const name = document.getElementById('tn').value.trim();
  if (!name) { document.getElementById('tn').focus(); return; }
  const data = { id: editTmplId || uid(), name, sector: document.getElementById('ts').value, subject: document.getElementById('tsu').value.trim(), body: document.getElementById('tb').value.trim() };
  try {
    await upsertTemplate(data);
    const i = templates.findIndex(t => t.id === data.id);
    if (i >= 0) templates[i] = data; else templates.push(data);
    closeTmpl(); renderTemplatesView(); showToast(editTmplId ? 'Template updated' : 'Template saved');
  } catch (e) { showToast('Error: ' + e.message); }
}
window.saveTmpl = saveTmpl;
async function doDeleteTemplate(id) {
  if (!confirm('Delete this template?')) return;
  try { await deleteTemplate(id); templates = templates.filter(t => t.id !== id); renderTemplatesView(); showToast('Template deleted'); }
  catch (e) { showToast('Error: ' + e.message); }
}
window.doDeleteTemplate = doDeleteTemplate;

// ── CSV Import ────────────────────────────────────────────────
function openImport() {
  csvParsed = []; csvHeaders = []; csvColMap = {};
  document.getElementById('import-step1').style.display = '';
  document.getElementById('import-result').style.display = 'none';
  document.getElementById('import-footer').style.display = 'flex';
  document.getElementById('csv-map-section').style.display = 'none';
  document.getElementById('import-btn').disabled = true;
  document.getElementById('import-btn').style.opacity = '.5';
  document.getElementById('csv-file-input').value = '';
  document.getElementById('import-modal').classList.add('open');
}
window.openImport = openImport;
function closeImport() { document.getElementById('import-modal').classList.remove('open'); }
window.closeImport = closeImport;
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return { headers: [], rows: [] };
  function splitLine(l) {
    const r = []; let inQ = false, cur = '';
    for (let i = 0; i < l.length; i++) {
      if (l[i] === '"' && l[i + 1] === '"') { cur += '"'; i++; }
      else if (l[i] === '"') { inQ = !inQ; }
      else if (l[i] === ',' && !inQ) { r.push(cur.trim()); cur = ''; }
      else cur += l[i];
    }
    r.push(cur.trim()); return r;
  }
  return { headers: splitLine(lines[0]), rows: lines.slice(1).map(l => splitLine(l)) };
}
const FIELDS = ['name', 'company', 'email', 'sector', 'stage', 'notes', 'sent', 'lc'];
const FLABELS = { name: 'Name', company: 'Company', email: 'Email', sector: 'Sector', stage: 'Stage', notes: 'Notes', sent: 'Date sent', lc: 'Last contacted' };
const GUESSES = { name: ['name', 'full name', 'contact', 'person'], company: ['company', 'organisation', 'organization', 'org', 'employer'], email: ['email', 'e-mail', 'mail'], sector: ['sector', 'industry', 'vertical'], stage: ['stage', 'status'], notes: ['notes', 'note', 'remarks'], sent: ['sent', 'date sent', 'email date', 'contacted on'], lc: ['last contacted', 'last contact'] };
function guessCol(field, headers) {
  const h = headers.map(x => x.toLowerCase().trim());
  for (const kw of (GUESSES[field] || [])) { const i = h.findIndex(x => x.includes(kw)); if (i >= 0) return i; }
  return -1;
}
function handleCSVFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const { headers, rows } = parseCSV(e.target.result);
    if (!headers.length) { showToast('Could not parse CSV'); return; }
    csvHeaders = headers; csvParsed = rows;
    const mapRows = FIELDS.map(field => {
      const guess = guessCol(field, headers);
      csvColMap[field] = guess >= 0 ? guess : -1;
      const opts = `<option value="-1">— skip —</option>` + headers.map((h, i) => `<option value="${i}"${i === guess ? ' selected' : ''}>${esc(h)}</option>`).join('');
      return `<div class="map-row"><span>${FLABELS[field]}</span><select style="flex:1;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--r);padding:6px 10px;font-size:13px;color:var(--tx);font-family:'DM Sans',sans-serif;outline:none" onchange="csvColMap['${field}']=parseInt(this.value)">${opts}</select></div>`;
    });
    document.getElementById('csv-map-rows').innerHTML = mapRows.join('');
    const prev = rows.slice(0, 4);
    document.getElementById('csv-preview').innerHTML = `<table><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${prev.map(r => `<tr>${headers.map((_, i) => `<td>${esc(r[i] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    document.getElementById('csv-map-section').style.display = '';
    document.getElementById('import-btn').disabled = false;
    document.getElementById('import-btn').style.opacity = '1';
  };
  reader.readAsText(file);
}
window.handleCSVFile = handleCSVFile;
async function doImport() {
  let added = 0, skipped = 0;
  const existing = new Set(leads.map(l => l.email).filter(Boolean));
  const newLeads = [];
  for (const row of csvParsed) {
    const get = f => { const i = csvColMap[f]; return (i >= 0 && row[i]) ? row[i].trim() : ''; };
    const name = get('name'); if (!name) { skipped++; continue; }
    const email = get('email'); if (email && existing.has(email)) { skipped++; continue; }
    const sent = get('sent');
    const rem = computeReminders(sent);
    const lead = { id: uid(), created: new Date().toISOString(), name, company: get('company'), email, sector: get('sector') || 'Other', stage: STAGES.includes(get('stage')) ? get('stage') : 'New', notes: get('notes'), sent, lc: get('lc'), r1: rem.r1, r2: rem.r2, r3: rem.r3, updated: new Date().toISOString() };
    newLeads.push(lead);
    if (email) existing.add(email);
    added++;
  }
  try {
    if (newLeads.length) { await upsertLeads(newLeads); leads = [...newLeads, ...leads]; }
    document.getElementById('import-step1').style.display = 'none';
    document.getElementById('import-result').style.display = '';
    document.getElementById('import-footer').style.display = 'none';
    document.getElementById('import-result-msg').textContent = `${added} lead${added !== 1 ? 's' : ''} imported`;
    document.getElementById('import-result-sub').textContent = skipped ? `${skipped} row${skipped !== 1 ? 's' : ''} skipped` : '';
    renderStats(); renderSectorFilter(); renderView();
    setTimeout(() => closeImport(), 2200);
  } catch (e) { showToast('Import error: ' + e.message); }
}
window.doImport = doImport;

// Drag-drop
document.addEventListener('DOMContentLoaded', () => {
  const dz = document.getElementById('drop-zone');
  if (dz) {
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
    dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag'); const f = e.dataTransfer.files[0]; if (f) handleCSVFile(f); });
  }
});

// ── Export ────────────────────────────────────────────────────
function exportCSV() {
  const h = ['Name', 'Company', 'Email', 'Sector', 'Stage', 'Date Sent', 'Reminder 1 (Day 5)', 'Reminder 2 (Day 10)', 'Reminder 3 (Day 20)', 'Last Contacted', 'Notes', 'Date Added'];
  const rows = leads.map(l => [l.name, l.company, l.email, l.sector, l.stage, l.sent || '', l.r1 || '', l.r2 || '', l.r3 || '', l.lc || '', l.notes, l.created ? new Date(l.created).toLocaleDateString('en-IN') : ''].map(v => `"${(v || '').replace(/"/g, '""')}"`));
  const csv = [h.join(','), ...rows.map(r => r.join(','))].join('\n');
  const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv); a.download = 'shabd-ai-leads-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
  showToast('CSV exported');
}
window.exportCSV = exportCSV;

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2100);
}
window.showToast = showToast;

// ── Modal close ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ['form-modal', 'detail-modal', 'email-modal', 'tmpl-modal', 'import-modal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', function (e) { if (e.target === this) this.classList.remove('open'); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') ['form-modal', 'detail-modal', 'email-modal', 'tmpl-modal', 'import-modal'].forEach(id => document.getElementById(id)?.classList.remove('open'));
  });
  init();
});
