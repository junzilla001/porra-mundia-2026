// 1. BASE DE DATOS DE EQUIPOS
const equipos = {
    'A': [{nombre: 'México', precio: 165, iso: 'mx'}, {nombre: 'R. Checa', precio: 135, iso: 'cz'}, {nombre: 'R. Corea', precio: 120, iso: 'kr'}, {nombre: 'Sudáfrica', precio: 65, iso: 'za'}],
    'B': [{nombre: 'Suiza', precio: 155, iso: 'ch'}, {nombre: 'Canadá', precio: 115, iso: 'ca'}, {nombre: 'Bosnia', precio: 85, iso: 'ba'}, {nombre: 'Catar', precio: 55, iso: 'qa'}],
    'C': [{nombre: 'Brasil', precio: 255, iso: 'br'}, {nombre: 'Marruecos', precio: 145, iso: 'ma'}, {nombre: 'Escocia', precio: 105, iso: 'gb-sct'}, {nombre: 'Haití', precio: 40, iso: 'ht'}],
    'D': [{nombre: 'EEUU', precio: 160, iso: 'us'}, {nombre: 'Turquía', precio: 125, iso: 'tr'}, {nombre: 'Australia', precio: 110, iso: 'au'}, {nombre: 'Paraguay', precio: 85, iso: 'py'}],
    'E': [{nombre: 'Alemania', precio: 240, iso: 'de'}, {nombre: 'Ecuador', precio: 130, iso: 'ec'}, {nombre: 'C. Marfil', precio: 110, iso: 'ci'}, {nombre: 'Curazao', precio: 35, iso: 'cw'}],
    'F': [{nombre: 'Países Bajos', precio: 215, iso: 'nl'}, {nombre: 'Japón', precio: 140, iso: 'jp'}, {nombre: 'Suecia', precio: 135, iso: 'se'}, {nombre: 'Túnez', precio: 75, iso: 'tn'}],
    'G': [{nombre: 'Bélgica', precio: 205, iso: 'be'}, {nombre: 'Egipto', precio: 115, iso: 'eg'}, {nombre: 'Irán', precio: 85, iso: 'ir'}, {nombre: 'N. Zelanda', precio: 60, iso: 'nz'}],
    'H': [{nombre: 'España', precio: 250, iso: 'es'}, {nombre: 'Uruguay', precio: 175, iso: 'uy'}, {nombre: 'Arabia S.', precio: 70, iso: 'sa'}, {nombre: 'Cabo Verde', precio: 45, iso: 'cv'}],
    'I': [{nombre: 'Francia', precio: 260, iso: 'fr'}, {nombre: 'Senegal', precio: 150, iso: 'sn'}, {nombre: 'Noruega', precio: 145, iso: 'no'}, {nombre: 'Irak', precio: 50, iso: 'iq'}],
    'J': [{nombre: 'Argentina', precio: 255, iso: 'ar'}, {nombre: 'Austria', precio: 155, iso: 'at'}, {nombre: 'Argelia', precio: 105, iso: 'dz'}, {nombre: 'Jordania', precio: 45, iso: 'jo'}],
    'K': [{nombre: 'Portugal', precio: 245, iso: 'pt'}, {nombre: 'Colombia', precio: 165, iso: 'co'}, {nombre: 'RD Congo', precio: 75, iso: 'cd'}, {nombre: 'Uzbekistán', precio: 65, iso: 'uz'}],
    'L': [{nombre: 'Inglaterra', precio: 250, iso: 'gb-eng'}, {nombre: 'Croacia', precio: 160, iso: 'hr'}, {nombre: 'Ghana', precio: 95, iso: 'gh'}, {nombre: 'Panamá', precio: 60, iso: 'pa'}]
};

// 2. ESTADO DE LA APP
const PRESUPUESTO_INICIAL = 1500;
let usuarioActual = '';
let seleccionesActuales = {};
let myChart = null;

let db = JSON.parse(localStorage.getItem('mundialDB_v3')) || {
    Jon: { draft: null, puntos: 0, historial: [0] },
    Lucia: { draft: null, puntos: 0, historial: [0] }
};

// 3. NAVEGACIÓN
function mostrarPantalla(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0,0);
    if(id === 'screen-dashboard') verDashboard();
}
function volverInicio() { mostrarPantalla('screen-login'); seleccionesActuales = {}; }

// 4. LÓGICA DEL DRAFT
function iniciarDraft(nombre) {
    usuarioActual = nombre;
    if (db[nombre].draft) {
        alert(`¡Oye ${nombre}! Ya tienes tu equipo cerrado. Ve al Dashboard a ver los puntos.`);
        return;
    }
    seleccionesActuales = {}; 
    renderizarGrupos();
    actualizarUI();
    mostrarPantalla('screen-draft');
}

function renderizarGrupos() {
    const container = document.getElementById('groups-container');
    container.innerHTML = '';
    for (const [grupo, lista] of Object.entries(equipos)) {
        let divGrupo = document.createElement('div');
        divGrupo.className = 'group-card';
        divGrupo.innerHTML = `<h3>Grupo ${grupo}</h3>`;
        lista.forEach(eq => {
            let divTeam = document.createElement('div');
            divTeam.className = 'team-btn';
            divTeam.id = `btn-${grupo}-${eq.iso}`;
            divTeam.onclick = () => toggleSeleccion(grupo, eq);
            divTeam.innerHTML = `
                <div style="display:flex; align-items:center; font-weight:600;">
                    <img class="team-flag" src="https://flagcdn.com/w40/${eq.iso}.png"> ${eq.nombre}
                </div>
                <div style="color:var(--gold); font-weight:bold;">${eq.precio} 🪙</div>
            `;
            divGrupo.appendChild(divTeam);
        });
        container.appendChild(divGrupo);
    }
}

function toggleSeleccion(grupo, equipo) {
    if (seleccionesActuales[grupo] && seleccionesActuales[grupo].nombre === equipo.nombre) {
        delete seleccionesActuales[grupo];
    } else {
        seleccionesActuales[grupo] = equipo;
    }
    actualizarUI();
}

function actualizarUI() {
    let gastado = 0;
    let count = 0;
    document.querySelectorAll('.team-btn').forEach(btn => btn.classList.remove('selected'));
    
    for (const [grupo, eq] of Object.entries(seleccionesActuales)) {
        gastado += eq.precio;
        count++;
        document.getElementById(`btn-${grupo}-${eq.iso}`).classList.add('selected');
    }
    
    const restante = PRESUPUESTO_INICIAL - gastado;
    document.getElementById('budget-display').innerText = restante;
    document.getElementById('budget-display').style.color = restante < 0 ? 'var(--danger)' : 'var(--gold)';
    document.getElementById('teams-count').innerText = `${count}/12 Equipos`;
    
    const btnConfirm = document.getElementById('btn-confirm-draft');
    if (restante >= 0 && count === 12) {
        btnConfirm.disabled = false;
        btnConfirm.innerText = "Bloquear Mi Selección 🔒";
    } else {
        btnConfirm.disabled = true;
        btnConfirm.innerText = restante < 0 ? "Presupuesto Excedido" : "Faltan Equipos";
    }
}

function confirmarDraft() {
    db[usuarioActual].draft = seleccionesActuales;
    localStorage.setItem('mundialDB_v3', JSON.stringify(db));
    alert(`¡Selección de ${usuarioActual} guardada con éxito!`);
    volverInicio();
}

// 5. MOTOR DE CÁLCULO DE PARTIDOS AUTOMÁTICO
function cargarSelectsPartidos() {
    const local = document.getElementById('team-local');
    const visitor = document.getElementById('team-visitor');
    local.innerHTML = '<option value="">Equipo Local...</option>';
    visitor.innerHTML = '<option value="">Equipo Visitante...</option>';
    
    let todosLosEquipos = [];
    for (const lista of Object.values(equipos)) {
        lista.forEach(eq => todosLosEquipos.push(eq.nombre));
    }
    todosLosEquipos.sort();
    
    todosLosEquipos.forEach(eq => {
        local.innerHTML += `<option value="${eq}">${eq}</option>`;
        visitor.innerHTML += `<option value="${eq}">${eq}</option>`;
    });
}

function procesarPartido() {
    const localName = document.getElementById('team-local').value;
    const visitorName = document.getElementById('team-visitor').value;
    const goalsLocal = parseInt(document.getElementById('goals-local').value);
    const goalsVisitor = parseInt(document.getElementById('goals-visitor').value);

    if (!localName || !visitorName || isNaN(goalsLocal) || isNaN(goalsVisitor)) {
        alert("Por favor, rellena todos los campos del partido."); return;
    }
    if (localName === visitorName) {
        alert("Un equipo no puede jugar contra sí mismo."); return;
    }

    // Calcular puntos brutos para el equipo local y visitante
    let ptsLocal = 0; let ptsVisitor = 0;

    // Puntos por victoria/empate
    if (goalsLocal > goalsVisitor) ptsLocal += 3;
    else if (goalsVisitor > goalsLocal) ptsVisitor += 3;
    else { ptsLocal += 1; ptsVisitor += 1; }

    // Puntos por goles
    ptsLocal += goalsLocal;
    ptsVisitor += goalsVisitor;

    // Puntos por portería a cero
    if (goalsVisitor === 0) ptsLocal += 2;
    if (goalsLocal === 0) ptsVisitor += 2;

    // Buscar a quién le pertenecen los puntos y asignarlos
    let mensajeResumen = `Resultado procesado: ${localName} ${goalsLocal} - ${goalsVisitor} ${visitorName}\n\n`;
    
    ['Jon', 'Lucia'].forEach(jugador => {
        if (!db[jugador].draft) return; // Si no han hecho draft, saltar
        
        let equipoEncontrado = false;
        // Revisar los 12 equipos del jugador
        for (const eq of Object.values(db[jugador].draft)) {
            if (eq.nombre === localName) {
                db[jugador].puntos += ptsLocal;
                db[jugador].historial.push(db[jugador].puntos);
                mensajeResumen += `➡️ ${jugador} suma ${ptsLocal} pts (Tiene a ${localName})\n`;
                equipoEncontrado = true;
            }
            if (eq.nombre === visitorName) {
                db[jugador].puntos += ptsVisitor;
                db[jugador].historial.push(db[jugador].puntos);
                mensajeResumen += `➡️ ${jugador} suma ${ptsVisitor} pts (Tiene a ${visitorName})\n`;
                equipoEncontrado = true;
            }
        }
    });

    localStorage.setItem('mundialDB_v3', JSON.stringify(db));
    alert(mensajeResumen);
    
    // Limpiar campos
    document.getElementById('goals-local').value = '';
    document.getElementById('goals-visitor').value = '';
}

// 6. DASHBOARD Y GRÁFICO
function verDashboard() {
    document.getElementById('pts-jon').innerText = db.Jon.puntos;
    document.getElementById('pts-lucia').innerText = db.Lucia.puntos;
    
    const ctx = document.getElementById('scoreChart').getContext('2d');
    const maxHistorial = Math.max(db.Jon.historial.length, db.Lucia.historial.length);
    const labels = Array.from({length: maxHistorial}, (_, i) => `P${i}`);

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Jon', data: db.Jon.historial, borderColor: '#10b981', tension: 0.3, borderWidth: 3 },
                { label: 'Lucía', data: db.Lucia.historial, borderColor: '#ec4899', tension: 0.3, borderWidth: 3 }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#f8fafc' } } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}
