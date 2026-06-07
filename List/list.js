function toggleTheme() {
    const dark = document.body.classList.toggle('dark');
    localStorage.setItem('vedmak-theme', dark ? 'dark' : 'light');
    document.getElementById('theme-icon').textContent = dark ? '☀️' : '🌙';
    document.getElementById('theme-label').textContent = dark ? 'Светлая тема' : 'Тёмная тема';
}
(function () {
    if (localStorage.getItem('vedmak-theme') === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('theme-icon').textContent = '☀️';
        document.getElementById('theme-label').textContent = 'Светлая тема';
    }
})();

function showPage(i) {
    document.querySelectorAll('.sheet-page').forEach((p, j) => p.classList.toggle('active', i === j));
    document.querySelectorAll('.tab-btn').forEach((b, j) => b.classList.toggle('active', i === j));
}

function updatePointsColor(id) {
    const el = document.getElementById(id);
    const v = parseInt(el.value) || 0;
    el.classList.toggle('negative', v < 0);
}

const POINT_STATS = ['s-INT', 's-REA', 's-DEX', 's-BODY', 's-SPD', 's-EMP', 's-CRF', 's-WILL', 's-LUCK'];

const PUNCH_TABLE = [
    { min: 1, max: 2, punch: '1d6−4', kick: '1d6' },
    { min: 3, max: 4, punch: '1d6−2', kick: '1d6+2' },
    { min: 5, max: 6, punch: '1d6', kick: '1d6+4' },
    { min: 7, max: 8, punch: '1d6+2', kick: '1d6+6' },
    { min: 9, max: 10, punch: '1d6+4', kick: '1d6+8' },
    { min: 11, max: 12, punch: '1d6+6', kick: '1d6+10' },
    { min: 13, max: 99, punch: '1d6+8', kick: '1d6+12' },
];

function getBase(body, will) { return Math.floor((body + will) / 2); }

function getPunchKick(body) {
    if (!body) return { punch: '—', kick: '—' };
    for (const r of PUNCH_TABLE) {
        if (body >= r.min && body <= r.max) return { punch: r.punch, kick: r.kick };
    }
    return { punch: '—', kick: '—' };
}

function onStatInput(el) {
    clampV(el, 10);
    const prev = parseInt(el.dataset.prev) || 0;
    const curr = parseInt(el.value) || 0;
    if (POINT_STATS.includes(el.id)) {
        const diff = curr - prev;
        if (diff !== 0) {
            const pts = document.getElementById('stat-points');
            pts.value = (parseInt(pts.value) || 0) - diff;
            updatePointsColor('stat-points');
        }
    }
    el.dataset.prev = String(curr);
    recalcDerived();
    recalcAll();
}

function recalcDerived() {
    const body = parseInt(document.getElementById('s-BODY').value) || 0;
    const will = parseInt(document.getElementById('s-WILL').value) || 0;
    const spd = parseInt(document.getElementById('s-SPD').value) || 0;
    const rea = parseInt(document.getElementById('s-REA').value) || 0;
    const det = parseInt(document.getElementById('s-DET').value) || 0;

    const base = getBase(body, will);
    const hp = base > 0 ? base * 5 : '—';
    const stam = base > 0 ? base * 5 : '—';
    const rest = base > 0 ? base : '—';
    const carry = base > 0 ? base * 10 : '—';
    const run = spd * 3;
    const jump = Math.floor(run / 5);
    const init = rea + det;
    const pk = getPunchKick(body);

    setText('d-hp', hp);
    setText('d-stam', stam);
    setText('d-rest', rest);
    setText('d-run2', run || '—');
    setText('d-jump2', jump || '—');
    setText('d-carry', carry);
    setText('d-init', init || '—');
    setText('d-punch', pk.punch);
    setText('d-kick', pk.kick);
    const elRun = document.getElementById('d-run');
    if (elRun) { elRun.textContent = run || '—'; document.getElementById('d-jump').textContent = jump || '—'; }
    const elBP = document.getElementById('d-BODY-punch');
    if (elBP) { elBP.textContent = pk.punch !== '—' ? `${pk.punch} / ${pk.kick}` : ''; }
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

const STAT_MAP = { INT: 's-INT', REA: 's-REA', DEX: 's-DEX', BODY: 's-BODY', SPD: 's-SPD', EMP: 's-EMP', CRF: 's-CRF', WILL: 's-WILL', LUCK: 's-LUCK', STAB: 's-STAB', DET: 's-DET' };

function clampV(el, max) {
    const v = parseInt(el.value);
    if (isNaN(v)) return;
    if (v > max) el.value = max;
    if (v < 0) el.value = 0;
}

function getStat(key) {
    const el = document.getElementById(STAT_MAP[key]);
    return el ? Math.min(10, Math.max(0, parseInt(el.value) || 0)) : 0;
}

function onSkillInput(inp) {
    clampV(inp, 20);
    const row = inp.closest('.skill-row');
    if (!row) return;

    const cost = parseInt(row.dataset.cost || '1');
    const prev = parseInt(inp.dataset.prev) || 0;
    const curr = Math.min(20, Math.max(0, parseInt(inp.value) || 0));
    const diff = curr - prev;
    if (diff !== 0) {
        const pts = document.getElementById('skill-points');
        pts.value = (parseInt(pts.value) || 0) - (diff * cost);
        updatePointsColor('skill-points');
    }
    inp.dataset.prev = String(curr);
    recalcRow(inp);
}

function recalcRow(inp) {
    const row = inp.closest('.skill-row');
    if (!row) return;
    const key = row.dataset.s;
    const stat = getStat(key);
    const sk = Math.min(20, Math.max(0, parseInt(inp.value) || 0));
    const total = row.querySelector('.skill-total');
    if (!total) return;
    if (inp.value === '') { total.textContent = '—'; total.classList.remove('over'); return; }
    const sum = stat + sk;
    total.textContent = sum;
    total.title = `Хар. ${stat} + Навык ${sk} = ${sum}`;
    total.classList.toggle('over', stat === 10 && sk === 20);
}

function recalcAll() {
    document.querySelectorAll('.skill-row').forEach(row => {
        const inp = row.querySelector('.skill-box');
        if (inp) recalcRow(inp);
    });
}

function addTextEntry(listId) {
    const list = document.getElementById(listId);
    const d = document.createElement('div');
    d.className = 'text-entry';
    d.style.cssText = 'display:flex;align-items:flex-start;gap:4px;border-bottom:1px dotted var(--skill-border);padding:3px 0;';
    const ta = document.createElement('textarea');
    ta.style.cssText = "flex:1;background:transparent;border:none;outline:none;font-family:'EB Garamond',serif;font-size:11px;color:var(--input-color);resize:none;min-height:22px;";
    ta.rows = 1;
    ta.oninput = function () { this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'; };
    const btn = document.createElement('button');
    btn.className = 'del-btn'; btn.textContent = '×';
    btn.onclick = () => d.remove();
    d.appendChild(ta); d.appendChild(btn);
    list.appendChild(d); ta.focus();
}

const INIT_DECADES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];

function getLastDecade() {
    const rows = [...document.querySelectorAll('#lp-table tr:not(:first-child)')];
    if (rows.length === 0) return 0;
    let max = 0;
    rows.forEach(tr => {
        const inp = tr.querySelector('input');
        if (inp) { const v = parseInt(inp.value) || 0; if (v > max) max = v; }
    });
    return max;
}

function addLifeRow(forcedDecade) {
    const tb = document.getElementById('lp-table');
    const tr = document.createElement('tr');

    const dec = forcedDecade !== undefined ? forcedDecade : getLastDecade() + 10;

    const decTd = document.createElement('td');
    decTd.style.cssText = "font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:var(--red);text-align:center;";
    const decIn = document.createElement('input');
    decIn.type = 'text'; decIn.value = dec;
    decIn.style.cssText = "width:50px;text-align:center;background:transparent;border:none;outline:none;font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:var(--red);";
    decTd.appendChild(decIn);

    const evTd = document.createElement('td');
    const evIn = document.createElement('input');
    evIn.type = 'text'; evIn.className = 'left';
    evIn.style.cssText = "width:100%;background:transparent;border:none;outline:none;font-family:'EB Garamond',serif;font-size:11px;color:var(--input-color);";
    evTd.appendChild(evIn);

    const delTd = document.createElement('td');
    const btn = document.createElement('button');
    btn.className = 'del-btn'; btn.textContent = '×';
    btn.onclick = () => tr.remove();
    delTd.appendChild(btn);

    tr.appendChild(decTd); tr.appendChild(evTd); tr.appendChild(delTd);
    tb.appendChild(tr);
}
INIT_DECADES.forEach(d => addLifeRow(d));

function makeRowItem(listId, cols, gridCols) {
    const list = document.getElementById(listId);
    const d = document.createElement('div');
    d.className = 'row-item';
    d.style.gridTemplateColumns = gridCols;
    cols.forEach(c => {
        const cell = document.createElement('div');
        cell.style.cssText = c.style || '';
        if (c.btn) {
            const btn = document.createElement('button');
            btn.className = 'del-btn'; btn.textContent = '×';
            btn.onclick = () => d.remove();
            cell.appendChild(btn);
        } else {
            const inp = document.createElement('input');
            inp.type = 'text'; inp.className = c.cls || '';
            cell.appendChild(inp);
        }
        d.appendChild(cell);
    });
    list.appendChild(d);
    return d;
}

function getWeaponCount() {
    return document.querySelectorAll('#weapons-list .dyn-item').length;
}
function addWeapon() {
    const list = document.getElementById('weapons-list');
    const d = document.createElement('div');
    d.className = 'dyn-item';
    list.appendChild(d);
    const num = document.querySelectorAll('#weapons-list .dyn-item').length;
    d.innerHTML = `<div class="dyn-item-hdr"><span class="dyn-item-title">Оружие ${num}</span><button class="del-btn" onclick="this.closest('.dyn-item').remove()">×</button></div>
    <div class="field-row"><span class="field-label">Название:</span><input class="field-value" type="text"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:4px;">
      <div class="field-row"><span class="field-label">Точность:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Урон/тип:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Надёжность:</span><input class="field-value" type="text"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-top:4px;">
      <div class="field-row"><span class="field-label">Хват:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Дист.:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Вес:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Скрытн.:</span><input class="field-value" type="text"></div>
    </div>
    <div class="field-row" style="margin-top:4px;"><span class="field-label">Эффект:</span><input class="field-value" type="text"></div>
    <div class="field-row"><span class="field-label">Усиление:</span><input class="field-value" type="text"></div>`;
}
addWeapon(); addWeapon();

function addEquipRow() {
    makeRowItem('equip-list', [
        { style: 'border-right:1px solid var(--line);', cls: 'left' },
        { style: 'border-right:1px solid var(--line);text-align:center;', cls: 'center' },
        { style: 'border-right:1px solid var(--line);', cls: 'left' },
        { style: 'border-right:1px solid var(--line);text-align:center;', cls: 'center' },
        { style: 'display:flex;align-items:center;justify-content:center;', btn: true }
    ], '2fr 60px 1fr 50px 22px');
}
for (let i = 0; i < 5; i++) addEquipRow();

function addCompRow() {
    makeRowItem('comp-list', [
        { style: 'border-right:1px solid var(--line);', cls: 'left' },
        { style: 'border-right:1px solid var(--line);text-align:center;', cls: 'center' },
        { style: 'border-right:1px solid var(--line);text-align:center;', cls: 'center' },
        { style: 'display:flex;align-items:center;justify-content:center;', btn: true }
    ], '2fr 60px 50px 22px');
}
for (let i = 0; i < 4; i++) addCompRow();

function addInjury() {
    makeRowItem('injuries-list', [
        { style: 'border-right:1px solid var(--line);', cls: 'left' },
        { style: 'border-right:1px solid var(--line);text-align:center;', cls: 'center' },
        { style: 'border-right:1px solid var(--line);text-align:center;', cls: 'center' },
        { style: 'display:flex;align-items:center;justify-content:center;', btn: true }
    ], '2fr 1fr 60px 22px');
}

function addSpell() {
    const list = document.getElementById('spells-list');
    const d = document.createElement('div'); d.className = 'dyn-item';
    d.innerHTML = `<div class="dyn-item-hdr"><span class="dyn-item-title">Заклинание / Знак</span><button class="del-btn" onclick="this.closest('.dyn-item').remove()">×</button></div>
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:5px;">
      <div class="field-row"><span class="field-label">Название:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Затр. Вын.:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Дистанция:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Длительность:</span><input class="field-value" type="text"></div>
    </div>
    <div class="field-row" style="margin-top:3px;"><span class="field-label">Эффект:</span><input class="field-value" type="text"></div>`;
    list.appendChild(d);
}
addSpell(); addSpell();

function addCurse() {
    const list = document.getElementById('curses-list');
    const d = document.createElement('div'); d.className = 'dyn-item';
    d.innerHTML = `<div class="dyn-item-hdr"><span class="dyn-item-title">Порча</span><button class="del-btn" onclick="this.closest('.dyn-item').remove()">×</button></div>
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:5px;">
      <div class="field-row"><span class="field-label">Название:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Затр. Вын.:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Опасность:</span><input class="field-value" type="text"></div>
    </div>
    <div class="field-row" style="margin-top:3px;"><span class="field-label">Эффект:</span><input class="field-value" type="text"></div>
    <div class="field-row"><span class="field-label">Условия снятия:</span><input class="field-value" type="text"></div>`;
    list.appendChild(d);
}

function addRitual() {
    const list = document.getElementById('rituals-list');
    const d = document.createElement('div'); d.className = 'dyn-item';
    d.innerHTML = `<div class="dyn-item-hdr"><span class="dyn-item-title">Ритуал</span><button class="del-btn" onclick="this.closest('.dyn-item').remove()">×</button></div>
    <div style="display:grid;grid-template-columns:2fr 1fr 50px 50px 1fr;gap:5px;">
      <div class="field-row"><span class="field-label">Название:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Затр. Вын.:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Время:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">СЛ:</span><input class="field-value" type="text"></div>
      <div class="field-row"><span class="field-label">Длит.:</span><input class="field-value" type="text"></div>
    </div>
    <div class="field-row" style="margin-top:3px;"><span class="field-label">Ингредиенты / Эффект:</span><input class="field-value" type="text"></div>`;
    list.appendChild(d);
}
addRitual();

function addCraftRow() {
    const list = document.getElementById('craft-list');
    const isEven = list.children.length % 2 === 1;
    const d = document.createElement('div'); d.className = 'craft-row';
    if (isEven) d.style.background = 'var(--table-even)';
    d.innerHTML = `<div><input class="left" type="text"></div><div><input type="text"></div><div><input type="text"></div><div><input class="left" type="text"></div><div><input type="text"></div><div><input type="text"></div><div style="display:flex;align-items:center;justify-content:center;"><button class="del-btn" onclick="this.closest('.craft-row').remove()">×</button></div>`;
    list.appendChild(d);
}
for (let i = 0; i < 20; i++) addCraftRow();

const epContainer = document.getElementById('energy-pips');
for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'energy-pip'; p.title = 'Энергия ' + (i + 1);
    p.onclick = function () { this.classList.toggle('on'); };
    epContainer.appendChild(p);
}

const fsContainer = document.getElementById('fame-stars');
for (let i = 0; i < 10; i++) {
    const s = document.createElement('div');
    s.className = 'rep-star'; s.textContent = '★'; s.dataset.i = i;
    s.onclick = function () {
        const idx = parseInt(this.dataset.i);
        const stars = document.querySelectorAll('#fame-stars .rep-star');
        const currentMax = [...stars].filter(st => st.classList.contains('on')).length - 1;
        if (idx === currentMax) {
            stars.forEach(st => st.classList.remove('on'));
        } else {
            stars.forEach((st, j) => st.classList.toggle('on', j <= idx));
        }
    };
    fsContainer.appendChild(s);
}

document.querySelectorAll('[data-prev]').forEach(el => { el.dataset.prev = '0'; });

document.querySelectorAll('.skill-box').forEach(inp => {
    inp.dataset.prev = '0';
    inp.removeAttribute('oninput');
    inp.oninput = function () { onSkillInput(this); };
});

function collectData() {
    const data = {};

    document.querySelectorAll('input[id], textarea[id]').forEach(el => {
        data[el.id] = el.value;
    });

    const allFields = [...document.querySelectorAll('input:not([id]):not([type=radio]):not([type=file]), textarea:not([id])')];
    data._fields = allFields.map(el => el.value);

    const checkedRadio = document.querySelector('input[name=maglvl]:checked');
    data._magLevel = checkedRadio ? checkedRadio.parentElement.textContent.trim() : '';
    e
    data._energy = [...document.querySelectorAll('.energy-pip')].map(p => p.classList.contains('on'));

    data._fame = [...document.querySelectorAll('#fame-stars .rep-star')].map(s => s.classList.contains('on'));

    data._lifePath = [...document.querySelectorAll('#lp-table tr:not(:first-child)')].map(tr => {
        return [...tr.querySelectorAll('input')].map(i => i.value);
    });

    data._equip = [...document.querySelectorAll('#equip-list .row-item')].map(r => [...r.querySelectorAll('input')].map(i => i.value));
    data._comp = [...document.querySelectorAll('#comp-list .row-item')].map(r => [...r.querySelectorAll('input')].map(i => i.value));
    data._injuries = [...document.querySelectorAll('#injuries-list .row-item')].map(r => [...r.querySelectorAll('input')].map(i => i.value));

    const collectDyn = listId => [...document.querySelectorAll(`#${listId} .dyn-item`)].map(d => [...d.querySelectorAll('input,textarea')].map(i => i.value));
    data._spells = collectDyn('spells-list');
    data._rituals = collectDyn('rituals-list');
    data._curses = collectDyn('curses-list');
    data._weapons = collectDyn('weapons-list');

    const collectText = listId => [...document.querySelectorAll(`#${listId} textarea`)].map(t => t.value);
    data._abilities = collectText('prof-list');
    data._traits = collectText('traits-list');

    data._crafts = [...document.querySelectorAll('#craft-list .craft-row')].map(r => [...r.querySelectorAll('input')].map(i => i.value));

    return data;
}

function applyData(data) {
    Object.entries(data).forEach(([k, v]) => {
        if (k.startsWith('_')) return;
        const el = document.getElementById(k);
        if (el) el.value = v;
    });

    if (data._fields) {
        const allFields = [...document.querySelectorAll('input:not([id]):not([type=radio]):not([type=file]), textarea:not([id])')];
        data._fields.forEach((v, i) => { if (allFields[i]) allFields[i].value = v; });
    }

    if (data._magLevel) {
        document.querySelectorAll('input[name=maglvl]').forEach(r => {
            if (r.parentElement.textContent.trim() === data._magLevel) r.checked = true;
        });
    }

    if (data._energy) {
        document.querySelectorAll('.energy-pip').forEach((p, i) => p.classList.toggle('on', !!data._energy[i]));
    }

    if (data._fame) {
        document.querySelectorAll('#fame-stars .rep-star').forEach((s, i) => s.classList.toggle('on', !!data._fame[i]));
    }

    if (data._lifePath) {
        [...document.querySelectorAll('#lp-table tr:not(:first-child)')].forEach(tr => tr.remove());
        data._lifePath.forEach(values => {
            const dec = parseInt(values[0]) || 10;
            addLifeRow(dec);
            const rows = document.querySelectorAll('#lp-table tr:not(:first-child)');
            const tr = rows[rows.length - 1];
            [...tr.querySelectorAll('input')].forEach((inp, i) => { if (values[i]) inp.value = values[i]; });
        });
    }

    const restoreRows = (listId, addFn, savedData) => {
        if (!savedData) return;
        document.getElementById(listId).innerHTML = '';
        savedData.forEach(values => {
            addFn();
            const rows = document.querySelectorAll(`#${listId} .row-item`);
            const row = rows[rows.length - 1];
            [...row.querySelectorAll('input')].forEach((inp, i) => { if (values[i] !== undefined) inp.value = values[i]; });
        });
    };
    restoreRows('equip-list', addEquipRow, data._equip);
    restoreRows('comp-list', addCompRow, data._comp);
    restoreRows('injuries-list', addInjury, data._injuries);

    const restoreDyn = (listId, addFn, savedData) => {
        if (!savedData) return;
        document.getElementById(listId).innerHTML = '';
        savedData.forEach(values => {
            addFn();
            const items = document.querySelectorAll(`#${listId} .dyn-item`);
            const item = items[items.length - 1];
            [...item.querySelectorAll('input,textarea')].forEach((f, i) => { if (values[i] !== undefined) f.value = values[i]; });
        });
    };
    restoreDyn('spells-list', addSpell, data._spells);
    restoreDyn('rituals-list', addRitual, data._rituals);
    restoreDyn('curses-list', addCurse, data._curses);
    restoreDyn('weapons-list', addWeapon, data._weapons);

    const restoreText = (listId, savedData) => {
        if (!savedData) return;
        document.getElementById(listId).innerHTML = '';
        savedData.forEach(v => {
            addTextEntry(listId);
            const entries = document.querySelectorAll(`#${listId} .text-entry textarea`);
            const ta = entries[entries.length - 1];
            if (ta) { ta.value = v; ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
        });
    };
    restoreText('prof-list', data._abilities);
    restoreText('traits-list', data._traits);

    if (data._crafts) {
        document.getElementById('craft-list').innerHTML = '';
        data._crafts.forEach(values => {
            addCraftRow();
            const rows = document.querySelectorAll('#craft-list .craft-row');
            const row = rows[rows.length - 1];
            [...row.querySelectorAll('input')].forEach((inp, i) => { if (values[i] !== undefined) inp.value = values[i]; });
        });
    }

    updatePointsColor('stat-points');
    updatePointsColor('skill-points');
    recalcDerived();
    recalcAll();
}

function saveJSON() {
    const payload = collectData();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'vedmak_character.json';
    a.click();
    URL.revokeObjectURL(url);
}

function loadJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const payload = JSON.parse(e.target.result);
            applyData(payload);
        } catch (err) {
            alert('Ошибка при загрузке файла: ' + err.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}
