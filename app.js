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
    document.getElementById('dashboard-laatste').textContent = laatste.naam + ' — ' + laatste.datum;
  }

  if (metingen.length > 0) {
    const m = metingen[metingen.length - 1];
    document.getElementById('dashboard-gewicht').textContent =
      m.gewicht ? m.gewicht + ' kg — ' + m.datum : 'Nog geen gewicht ingevoerd.';
  }

  document.getElementById('dashboard-streak').textContent =
    workouts.length + ' workouts gelogd in totaal 🔥';
}

// ── WORKOUT (handmatig) ──
let oefeningTeller = 0;

function voegOefeningToe() {
  oefeningTeller++;
  const div = document.createElement('div');
  div.className = 'oefening-blok';
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
    if (blok.querySelector('.oef-header')) {
      // Training modus: meerdere sets per oefening
      const oefNaam = blok.querySelector('.oef-naam-tekst').textContent.trim();
      const sets = [];
      blok.querySelectorAll('.set-rij').forEach(rij => {
        const kg = rij.querySelector('.oef-gewicht')?.value;
        const reps = rij.querySelector('.oef-reps')?.value;
        sets.push({ kg: kg || '-', reps: reps || '-' });
      });
      oefeningen.push({ naam: oefNaam, sets });
    } else {
      // Handmatige modus
      const n = blok.querySelector('.oef-naam')?.value.trim();
      const s = blok.querySelector('.oef-sets')?.value;
      const r = blok.querySelector('.oef-reps')?.value;
      const g = blok.querySelector('.oef-gewicht')?.value;
      if (n) oefeningen.push({ naam: n, sets: [{ kg: g, reps: r }], aantalSets: s });
    }
  });

  if (oefeningen.length === 0) { alert('Voeg minimaal één oefening toe!'); return; }

  const workouts = laad('workouts');
  workouts.push({ naam, oefeningen, datum: new Date().toLocaleDateString('nl-NL') });
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
      <p>${w.oefeningen.map(o => {
        const maxKg = Array.isArray(o.sets)
          ? Math.max(...o.sets.map(s => parseFloat(s.kg) || 0))
          : parseFloat(o.sets?.[0]?.kg) || 0;
        return o.naam + (maxKg > 0 ? ' ' + maxKg + 'kg' : '');
      }).join(', ')}</p>
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

  const dagNamen = document.querySelectorAll('.dag-naam');
  const dagOef = document.querySelectorAll('.dag-oefeningen');
  const dagen = [];
  dagNamen.forEach((el, i) => {
    const dagNaam = el.value.trim();
    const oefeningenStr = dagOef[i].value.trim();
    if (dagNaam) {
      const oefeningen = oefeningenStr.split(',')
        .map(o => ({ naam: o.trim(), sets: 3, repRange: '' }))
        .filter(o => o.naam);
      dagen.push({ dag: dagNaam, oefeningen });
    }
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
  div.innerHTML = schemas.map((s, si) => `
    <div class="schema-item">
      <h4>${s.naam}</h4>
      ${s.dagen.map((d, di) => `
        <div class="dag-item">
          <p><strong>${d.dag}</strong></p>
          <p class="dag-oef-tekst">${Array.isArray(d.oefeningen)
            ? d.oefeningen.map(o => o.naam).join(', ')
            : d.oefeningen}</p>
          <button class="btn-secondary" onclick="startTraining(${si}, ${di})">▶ Start training</button>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function startTraining(schemaIndex, dagIndex) {
  const schemas = laad('schemas');
  const schema = schemas[schemaIndex];
  const dag = schema.dagen[dagIndex];

  showPage('workout');
  document.getElementById('workout-naam').value = schema.naam + ' — ' + dag.dag;
  document.getElementById('oefeningen-lijst').innerHTML = '';
  oefeningTeller = 0;

  const oefeningen = Array.isArray(dag.oefeningen)
    ? dag.oefeningen
    : dag.oefeningen.split(',').map(o => ({ naam: o.trim(), sets: 3, repRange: '' }));

  oefeningen.forEach(oef => {
    oefeningTeller++;
    const setsHTML = Array.from({ length: oef.sets }, (_, i) => `
      <div class="set-rij">
        <span class="set-label">Set ${i + 1}</span>
        <input type="number" placeholder="kg" class="oef-gewicht" step="0.5" min="0" />
        <input type="number" placeholder="reps" class="oef-reps" min="1" />
      </div>
    `).join('');

    const div = document.createElement('div');
    div.className = 'oefening-blok';
    div.innerHTML = `
      <div class="oef-header">
        <span class="oef-naam-tekst">${oef.naam}</span>
        ${oef.repRange ? '<span class="rep-range">' + oef.repRange + ' reps</span>' : ''}
      </div>
      ${setsHTML}
    `;
    document.getElementById('oefeningen-lijst').appendChild(div);
  });
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
      if (o.naam === oefening && Array.isArray(o.sets)) {
        const maxKg = Math.max(...o.sets.map(s => parseFloat(s.kg) || 0));
        if (maxKg > 0) data.push({ datum: w.datum, gewicht: maxKg });
      }
    });
  });

  if (data.length === 0) {
    recordsDiv.innerHTML = '<p>Geen data voor deze oefening.</p>';
    return;
  }

  const W = canvas.offsetWidth || 300;
  const H = 200;
  canvas.width = W;
  canvas.height = H;

  const maxG = Math.max(...data.map(d => d.gewicht));
  const minG = Math.min(...data.map(d => d.gewicht));
  const pad = 30;

  ctx.strokeStyle = '#6C63FF';
  ctx.lineWidth = 2.5;

  data.forEach((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((d.gewicht - minG) / (maxG - minG + 1)) * (H - pad * 2);

    ctx.fillStyle = '#6C63FF';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    if (i < data.length - 1) {
      const x2 = pad + ((i + 1) / Math.max(data.length - 1, 1)) * (W - pad * 2);
      const y2 = H - pad - ((data[i + 1].gewicht - minG) / (maxG - minG + 1)) * (H - pad * 2);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  });

  ctx.fillStyle = '#999';
  ctx.font = '11px sans-serif';
  ctx.fillText(maxG + ' kg', 2, pad);
  ctx.fillText(minG + ' kg', 2, H - pad + 12);

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
  metingen.push({ gewicht, vetpercentage: vet, taille, datum: new Date().toLocaleDateString('nl-NL') });
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

// ── SCHEMA VOORLADEN ──
function initData() {
  const schemas = laad('schemas');
  if (schemas.length === 0) {
    slaOp('schemas', [{
      naam: 'Mijn Trainingsschema',
      datum: new Date().toLocaleDateString('nl-NL'),
      dagen: [
        {
          dag: '🔴 DAG 1 – UPPER (BORST)',
          oefeningen: [
            { naam: 'Bench Press', sets: 3, repRange: '6–8' },
            { naam: 'Incline DB Press', sets: 3, repRange: '8–10' },
            { naam: 'Seated Row', sets: 3, repRange: '8–12' },
            { naam: 'Lateral Raises', sets: 3, repRange: '12–15' },
            { naam: 'Tricep Pushdown', sets: 3, repRange: '10–15' },
            { naam: 'Bicep Curl', sets: 3, repRange: '10–12' }
          ]
        },
        {
          dag: '🟠 DAG 2 – LOWER (QUADS)',
          oefeningen: [
            { naam: 'Squat', sets: 3, repRange: '5–8' },
            { naam: 'Leg Press', sets: 3, repRange: '10–15' },
            { naam: 'Leg Extension', sets: 3, repRange: '12–15' },
            { naam: 'Calf Raises', sets: 4, repRange: '10–15' },
            { naam: 'Abs (Hanging Leg Raises)', sets: 3, repRange: '10–15' }
          ]
        },
        {
          dag: '🟡 DAG 3 – UPPER (RUG)',
          oefeningen: [
            { naam: 'Pull-ups / Lat Pulldown', sets: 3, repRange: '6–10' },
            { naam: 'Barbell Row', sets: 3, repRange: '6–10' },
            { naam: 'Shoulder Press', sets: 3, repRange: '8–10' },
            { naam: 'Chest Fly', sets: 3, repRange: '10–15' },
            { naam: 'Hammer Curl', sets: 3, repRange: '10–12' },
            { naam: 'Tricep Overhead Extension', sets: 3, repRange: '10–12' }
          ]
        },
        {
          dag: '🔵 DAG 4 – LOWER (HAMSTRINGS)',
          oefeningen: [
            { naam: 'Romanian Deadlift', sets: 3, repRange: '6–10' },
            { naam: 'Leg Curl', sets: 3, repRange: '10–15' },
            { naam: 'Bulgarian Split Squat', sets: 3, repRange: '8–10' },
            { naam: 'Calf Raises (Seated)', sets: 4, repRange: '12–15' },
            { naam: 'Abs (Cable Crunch)', sets: 3, repRange: '12–15' }
          ]
        }
      ]
    }]);
  }
}

// Opstarten
initData();
laadDashboard();
updateVoortgangOpties();