// Data opslaan en laden
function slaOp(sleutel, data) {
  localStorage.setItem(sleutel, JSON.stringify(data));
}

function laad(sleutel) {
  return JSON.parse(localStorage.getItem(sleutel)) || [];
}

// Navigatie
function showPage(pagina) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + pagina).classList.add('active');
  document.getElementById('nav-' + pagina).classList.add('active');

  if (pagina === 'voortgang') laadVoortgang();
  if (pagina === 'workout') laadWorkoutGeschiedenis();
  if (pagina === 'schema') laadSchemas();
  if (pagina === 'lichaam') laadMetingen();
  if (pagina === 'dashboard') laadDashboard();
}

// ── DASHBOARD ──
function laadDashboard() {
  const workouts = laad('workouts');
  const metingen = laad('metingen');

  if (workouts.length > 0) {
    const laatste = workouts[workouts.length - 1];
    document.getElementById('dashboard-laatste').textContent =
      laatste.naam + ' — ' + laatste.datum;
  }

  if (metingen.length > 0) {
    const m = metingen[metingen.length - 1];
    document.getElementById('dashboard-gewicht').textContent =
      m.gewicht ? m.gewicht + ' kg — ' + m.datum : 'Nog geen gewicht ingevoerd.';
  }

  document.getElementById('dashboard-streak').textContent =
    workouts.length + ' workouts gelogd in totaal 🔥';
}

// ── WORKOUT ──
let oefeningTeller = 0;

function voegOefeningToe() {
  oefeningTeller++;
  const id = 'oef-' + oefeningTeller;
  const div = document.createElement('div');
  div.className = 'oefening-blok';
  div.id = id;
  div.innerHTML = `
    <input type="text" placeholder="Oefening naam (bijv. Bankdrukken)" class="oef-naam" />
    <div class="set-rij">
      <input type="number" placeholder="Sets" class="oef-sets" min="1" />
      <input type="number" placeholder="Reps" class="oef-reps" min="1" />
      <input type="number" placeholder="Kg" class="oef-gewicht" step="0.5" min="0" />
    </div>
  `;
  document.getElementById('oefeningen-lijst').appendChild(div);
}

function slaWorkoutOp() {
  const naam = document.getElementById('workout-naam').value.trim();
  if (!naam) { alert('Geef de workout een naam!'); return; }

  const oefeningen = [];
  document.querySelectorAll('.oefening-blok').forEach(blok => {
    const n = blok.querySelector('.oef-naam').value.trim();
    const s = blok.querySelector('.oef-sets').value;
    const r = blok.querySelector('.oef-reps').value;
    const g = blok.querySelector('.oef-gewicht').value;
    if (n) oefeningen.push({ naam: n, sets: s, reps: r, gewicht: g });
  });

  if (oefeningen.length === 0) { alert('Voeg minimaal één oefening toe!'); return; }

  const workouts = laad('workouts');
  workouts.push({
    naam,
    oefeningen,
    datum: new Date().toLocaleDateString('nl-NL')
  });
  slaOp('workouts', workouts);

  document.getElementById('workout-naam').value = '';
  document.getElementById('oefeningen-lijst').innerHTML = '';
  oefeningTeller = 0;

  alert('Workout opgeslagen! 💪');
  laadWorkoutGeschiedenis();
  updateVoortgangOpties();
}

function laadWorkoutGeschiedenis() {
  const workouts = laad('workouts');
  const div = document.getElementById('workout-geschiedenis');
  if (workouts.length === 0) {
    div.innerHTML = '<p>Nog geen workouts gelogd.</p>';
    return;
  }
  div.innerHTML = [...workouts].reverse().slice(0, 10).map(w => `
    <div class="workout-item">
      <h4>${w.naam}</h4>
      <p>${w.datum} — ${w.oefeningen.length} oefeningen</p>
      <p>${w.oefeningen.map(o => o.naam + (o.gewicht ? ' ' + o.gewicht + 'kg' : '')).join(', ')}</p>
    </div>
  `).join('');
}

// ── SCHEMA'S ──
let dagTeller = 0;

function voegDagToe() {
  dagTeller++;
  const div = document.createElement('div');
  div.className = 'oefening-blok';
  div.innerHTML = `
    <input type="text" placeholder="Dag (bijv. Maandag — Push)" class="dag-naam" />
    <input type="text" placeholder="Oefeningen (bijv. Bankdrukken, Schouderpers)" class="dag-oefeningen" />
  `;
  document.getElementById('schema-dagen').appendChild(div);
}

function slaSchemaOp() {
  const naam = document.getElementById('schema-naam').value.trim();
  if (!naam) { alert('Geef het schema een naam!'); return; }

  const dagen = [];
  document.querySelectorAll('.dag-naam').forEach((el, i) => {
    const dagNaam = el.value.trim();
    const oefeningen = document.querySelectorAll('.dag-oefeningen')[i].value.trim();
    if (dagNaam) dagen.push({ dag: dagNaam, oefeningen });
  });

  const schemas = laad('schemas');
  schemas.push({ naam, dagen, datum: new Date().toLocaleDateString('nl-NL') });
  slaOp('schemas', schemas);

  document.getElementById('schema-naam').value = '';
  document.getElementById('schema-dagen').innerHTML = '';
  dagTeller = 0;

  alert('Schema opgeslagen! 📋');
  laadSchemas();
}

function laadSchemas() {
  const schemas = laad('schemas');
  const div = document.getElementById('schema-lijst');
  if (schemas.length === 0) {
    div.innerHTML = '<p>Nog geen schema\'s aangemaakt.</p>';
    return;
  }
  div.innerHTML = schemas.map(s => `
    <div class="schema-item">
      <h4>${s.naam}</h4>
      ${s.dagen.map(d => `<p><strong>${d.dag}:</strong> ${d.oefeningen}</p>`).join('')}
    </div>
  `).join('');
}

// ── VOORTGANG ──
function updateVoortgangOpties() {
  const workouts = laad('workouts');
  const oefeningen = new Set();
  workouts.forEach(w => w.oefeningen.forEach(o => oefeningen.add(o.naam)));

  const select = document.getElementById('voortgang-oefening');
  const huidige = select.value;
  select.innerHTML = '<option value="">-- Kies een oefening --</option>';
  oefeningen.forEach(naam => {
    const opt = document.createElement('option');
    opt.value = naam;
    opt.textContent = naam;
    if (naam === huidige) opt.selected = true;
    select.appendChild(opt);
  });
}

function laadVoortgang() {
  updateVoortgangOpties();
  toonVoortgang();
}

function toonVoortgang() {
  const oefening = document.getElementById('voortgang-oefening').value;
  const canvas = document.getElementById('voortgang-chart');
  const ctx = canvas.getContext('2d');
  const recordsDiv = document.getElementById('voortgang-records');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!oefening) {
    recordsDiv.innerHTML = '<p>Selecteer een oefening om records te zien.</p>';
    return;
  }

  const workouts = laad('workouts');
  const data = [];
  workouts.forEach(w => {
    w.oefeningen.forEach(o => {
      if (o.naam === oefening && o.gewicht) {
        data.push({ datum: w.datum, gewicht: parseFloat(o.gewicht) });
      }
    });
  });

  if (data.length === 0) {
    recordsDiv.innerHTML = '<p>Geen data voor deze oefening.</p>';
    return;
  }

  // Grafiek tekenen
  const W = canvas.offsetWidth || 300;
  const H = 200;
  canvas.width = W;
  canvas.height = H;

  const maxG = Math.max(...data.map(d => d.gewicht));
  const minG = Math.min(...data.map(d => d.gewicht));
  const pad = 30;

  ctx.strokeStyle = '#6C63FF';
  ctx.lineWidth = 2.5;
  ctx.beginPath();

  data.forEach((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((d.gewicht - minG) / (maxG - minG + 1)) * (H - pad * 2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);

    ctx.fillStyle = '#6C63FF';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    if (i < data.length - 1) {
      const x2 = pad + ((i+1) / Math.max(data.length - 1, 1)) * (W - pad * 2);
      const y2 = H - pad - ((data[i+1].gewicht - minG) / (maxG - minG + 1)) * (H - pad * 2);
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  });

  // Labels
  ctx.fillStyle = '#999';
  ctx.font = '11px sans-serif';
  ctx.fillText(maxG + ' kg', 2, pad);
  ctx.fillText(minG + ' kg', 2, H - pad + 12);

  // Records
  const pr = Math.max(...data.map(d => d.gewicht));
  recordsDiv.innerHTML = `
    <div class="record-item"><span>${oefening}</span><span>PR: ${pr} kg 🏆</span></div>
    <div class="record-item"><span>Totaal gelogd</span><span>${data.length}x</span></div>
  `;
}

// ── LICHAAM ──
function slaMeetingOp() {
  const gewicht = document.getElementById('lichaam-gewicht').value;
  const vet = document.getElementById('lichaam-vetpercentage').value;
  const taille = document.getElementById('lichaam-taille').value;

  if (!gewicht && !vet && !taille) { alert('Vul minimaal één waarde in!'); return; }

  const metingen = laad('metingen');
  metingen.push({
    gewicht, vetpercentage: vet, taille,
    datum: new Date().toLocaleDateString('nl-NL')
  });
  slaOp('metingen', metingen);

  document.getElementById('lichaam-gewicht').value = '';
  document.getElementById('lichaam-vetpercentage').value = '';
  document.getElementById('lichaam-taille').value = '';

  alert('Meting opgeslagen! ⚖️');
  laadMetingen();
}

function laadMetingen() {
  const metingen = laad('metingen');
  const div = document.getElementById('lichaam-geschiedenis');
  if (metingen.length === 0) {
    div.innerHTML = '<p>Nog geen metingen ingevoerd.</p>';
    return;
  }
  div.innerHTML = [...metingen].reverse().map(m => `
    <div class="meting-item">
      <p><strong>${m.datum}</strong></p>
      ${m.gewicht ? '<p>Gewicht: ' + m.gewicht + ' kg</p>' : ''}
      ${m.vetpercentage ? '<p>Vetpercentage: ' + m.vetpercentage + '%</p>' : ''}
      ${m.taille ? '<p>Taille: ' + m.taille + ' cm</p>' : ''}
    </div>
  `).join('');
}

// Opstarten
laadDashboard();
updateVoortgangOpties();