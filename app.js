// BASE DE DATOS AJUSTADA (Precios rebajados y optimizados)
const equipos = {
    'A': [{nombre: 'México', precio: 160, iso: 'mx'}, {nombre: 'R. Checa', precio: 130, iso: 'cz'}, {nombre: 'R. Corea', precio: 115, iso: 'kr'}, {nombre: 'Sudáfrica', precio: 60, iso: 'za'}],
    'B': [{nombre: 'Suiza', precio: 150, iso: 'ch'}, {nombre: 'Canadá', precio: 110, iso: 'ca'}, {nombre: 'Bosnia', precio: 80, iso: 'ba'}, {nombre: 'Catar', precio: 50, iso: 'qa'}],
    'C': [{nombre: 'Brasil', precio: 250, iso: 'br'}, {nombre: 'Marruecos', precio: 140, iso: 'ma'}, {nombre: 'Escocia', precio: 100, iso: 'gb-sct'}, {nombre: 'Haití', precio: 40, iso: 'ht'}],
    'D': [{nombre: 'EEUU', precio: 155, iso: 'us'}, {nombre: 'Turquía', precio: 120, iso: 'tr'}, {nombre: 'Australia', precio: 105, iso: 'au'}, {nombre: 'Paraguay', precio: 80, iso: 'py'}],
    'E': [{nombre: 'Alemania', precio: 235, iso: 'de'}, {nombre: 'Ecuador', precio: 125, iso: 'ec'}, {nombre: 'C. Marfil', precio: 105, iso: 'ci'}, {nombre: 'Curazao', precio: 35, iso: 'cw'}],
    'F': [{nombre: 'Países Bajos', precio: 210, iso: 'nl'}, {nombre: 'Japón', precio: 135, iso: 'jp'}, {nombre: 'Suecia', precio: 130, iso: 'se'}, {nombre: 'Túnez', precio: 70, iso: 'tn'}],
    'G': [{nombre: 'Bélgica', precio: 200, iso: 'be'}, {nombre: 'Egipto', precio: 110, iso: 'eg'}, {nombre: 'Irán', precio: 80, iso: 'ir'}, {nombre: 'N. Zelanda', precio: 55, iso: 'nz'}],
    'H': [{nombre: 'España', precio: 245, iso: 'es'}, {nombre: 'Uruguay', precio: 170, iso: 'uy'}, {nombre: 'Arabia S.', precio: 65, iso: 'sa'}, {nombre: 'Cabo Verde', precio: 45, iso: 'cv'}],
    'I': [{nombre: 'Francia', precio: 255, iso: 'fr'}, {nombre: 'Senegal', precio: 145, iso: 'sn'}, {nombre: 'Noruega', precio: 140, iso: 'no'}, {nombre: 'Irak', precio: 50, iso: 'iq'}],
    'J': [{nombre: 'Argentina', precio: 250, iso: 'ar'}, {nombre: 'Austria', precio: 150, iso: 'at'}, {nombre: 'Argelia', precio: 100, iso: 'dz'}, {nombre: 'Jordania', precio: 45, iso: 'jo'}],
    'K': [{nombre: 'Portugal', precio: 240, iso: 'pt'}, {nombre: 'Colombia', precio: 160, iso: 'co'}, {nombre: 'RD Congo', precio: 70, iso: 'cd'}, {nombre: 'Uzbekistán', precio: 60, iso: 'uz'}],
    'L': [{nombre: 'Inglaterra', precio: 245, iso: 'gb-eng'}, {nombre: 'Croacia', precio: 155, iso: 'hr'}, {nombre: 'Ghana', precio: 90, iso: 'gh'}, {nombre: 'Panamá', precio: 55, iso: 'pa'}]
};

// LOS 72 PARTIDOS DE FASE DE GRUPOS (Generación automática para el Panel)
const generarPartidosGrupos = () => {
    let partidos = [];
    for (const [grupo, lista] of Object.entries(equipos)) {
        partidos.push({l: lista[0].nombre, v: lista[3].nombre, g: grupo});
        partidos.push({l: lista[2].nombre, v: lista[1].nombre, g: grupo});
        partidos.push({l: lista[1].nombre, v: lista[3].nombre, g: grupo});
        partidos.push({l: lista[0].nombre, v: lista[2].nombre, g: grupo});
        partidos.push({l: lista[1].nombre, v: lista[0].nombre, g: grupo});
        partidos.push({l: lista[3].nombre, v: lista[2].nombre, g: grupo});
    }
    return partidos;
};

// ESTADO GLOBAL
const PRESUPUESTO_INICIAL = 1500;
let usuarioActual = '';
let seleccionesActuales = {};
let myChart = null;

let db = JSON.parse(localStorage.getItem('mundialDB_v4')) || {
    Jon: { draft: null, multiplicador: null, puntos: 0, historial: [0], partidosProcesados: [] },
    Lucia: { draft: null, multiplicador: null, puntos: 0, historial: [0], partidosProcesados: [] }
};

// NAVEGACIÓN
function mostrarPantalla(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0,0);
    if(id === 'screen-dashboard') verDashboard();
}
function volverInicio() { mostrarPantalla('screen-login'); seleccionesActuales = {}; }

function switchAdminTab(tab) {
    document.getElementById('tab-matches').style.display = tab === 'matches' ? 'block' : 'none';
    document.getElementById('tab-knockout').style.display = tab === 'knockout' ? 'block' : 'none';
    document.getElementById('tab-bonuses').style.display = tab === 'bonuses' ? 'block' : 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// LÓGICA DEL DRAFT
function iniciarDraft(nombre) {
    usuarioActual = nombre;
    if (db[nombre].draft) {
        alert(`Ya tienes tu equipo cerrado, ${nombre}.`); return;
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
        divGrupo.innerHTML = `<h3 style="color:#64748b; text-align:center; margin-bottom:10px;">Grupo ${grupo}</h3>`;
        lista.forEach(eq => {
            let divTeam = document.createElement('div');
            divTeam.className = 'team-btn';
            divTeam.id = `btn-${grupo}-${eq.iso}`;
            divTeam.onclick = () => toggleSeleccion(grupo, eq);
            divTeam.innerHTML = `
                <div style="display:flex; align-items:center; font-weight:600;"><img class="team-flag" src="https://flagcdn.com/w40/${eq.iso}.png"> ${eq.nombre}</div>
                <div style="color:var(--gold); font-weight:bold;">${eq.precio} 🪙</div>
            `;
            divGrupo.appendChild(divTeam);
        });
        container.appendChild(divGrupo);
    }
}

function toggleSeleccion(grupo, equipo) {
    if (seleccionesActuales[grupo] && seleccionesActuales[grupo].nombre === equipo.nombre) delete seleccionesActuales[grupo];
    else seleccionesActuales[grupo] = equipo;
    actualizarUI();
}

function actualizarUI() {
    let gastado = 0; let count = 0;
    document.querySelectorAll('.team-btn').forEach(btn => btn.classList.remove('selected'));
    
    let opcionesMultiplicador = [];

    for (const [grupo, eq] of Object.entries(seleccionesActuales)) {
        gastado += eq.precio; count++;
        document.getElementById(`btn-${grupo}-${eq.iso}`).classList.add('selected');
        if (eq.precio >= 100 && eq.precio <= 140) opcionesMultiplicador.push(eq.nombre);
    }
    
    const restante = PRESUPUESTO_INICIAL - gastado;
    document.getElementById('budget-display').innerText = restante;
    document.getElementById('budget-display').style.color = restante < 0 ? 'var(--danger)' : 'var(--gold)';
    document.getElementById('teams-count').innerText = `${count}/12 Equipos`;
    
    const btnConfirm = document.getElementById('btn-confirm-draft');
    const panelMult = document.getElementById('multiplier-panel');
    const selectMult = document.getElementById('multiplier-select');

    if (restante >= 0 && count === 12) {
        panelMult.style.display = 'block';
        selectMult.innerHTML = '';
        opcionesMultiplicador.forEach(nombre => {
            selectMult.innerHTML += `<option value="${nombre}">${nombre}</option>`;
        });
        
        if (opcionesMultiplicador.length > 0) {
            btnConfirm.disabled = false;
        } else {
            btnConfirm.disabled = true;
            selectMult.innerHTML = '<option>❌ No tienes equipos entre 100 y 140</option>';
        }
    } else {
        panelMult.style.display = 'none';
        btnConfirm.disabled = true;
    }
}

function confirmarDraft() {
    db[usuarioActual].draft = seleccionesActuales;
    db[usuarioActual].multiplicador = document.getElementById('multiplier-select').value;
    localStorage.setItem('mundialDB_v4', JSON.stringify(db));
    alert(`¡Selección bloqueada! Estrella: ${db[usuarioActual].multiplicador}`);
    volverInicio();
}

// EL MOTOR MATEMÁTICO (Separa positivos y negativos para el Multiplicador)
function calcularPuntosEquipo(equipoNombre, golesFavor, golesContra, esGrupo, jugador) {
    let ptsPositivos = 0;
    let ptsNegativos = 0;

    ptsPositivos += (golesFavor * 3);
    ptsNegativos += (golesContra * -1);

    if (golesContra === 0) ptsPositivos += 3;

    if (esGrupo) {
        if (golesFavor > golesContra) ptsPositivos += 5;
        else if (golesFavor < golesContra) ptsNegativos += -3;
    }

    if (db[jugador].multiplicador === equipoNombre) {
        ptsPositivos = ptsPositivos * 2;
    }

    return ptsPositivos + ptsNegativos;
}

function aplicarPuntosJugador(jugador, equipoNombre, golesFavor, golesContra, esGrupo) {
    if (!db[jugador].draft) return "";
    
    let mensaje = "";
    for (const eq of Object.values(db[jugador].draft)) {
        if (eq.nombre === equipoNombre) {
            let pts = calcularPuntosEquipo(equipoNombre, golesFavor, golesContra, esGrupo, jugador);
            db[jugador].puntos += pts;
            db[jugador].historial.push(db[jugador].puntos);
            let estrella = db[jugador].multiplicador === equipoNombre ? " ⭐(x2)" : "";
            mensaje = `➡️ ${jugador}: ${pts} pts por ${equipoNombre}${estrella}\n`;
        }
    }
    return mensaje;
}

// PANEL DE CONTROL (ADMIN)
function prepararAdmin() {
    const container = document.getElementById('group-matches-container');
    container.innerHTML = '';
    const partidos = generarPartidosGrupos();
    
    // Selects para Eliminatorias
    const koLocal = document.getElementById('ko-local');
    const koVisitor = document.getElementById('ko-visitor');
    koLocal.innerHTML = ''; koVisitor.innerHTML = '';
    let todos = [];
    Object.values(equipos).forEach(lista => lista.forEach(eq => todos.push(eq.nombre)));
    todos.sort().forEach(eq => {
        koLocal.innerHTML += `<option value="${eq}">${eq}</option>`;
        koVisitor.innerHTML += `<option value="${eq}">${eq}</option>`;
    });

    // Renderizar los 72 de grupos
    partidos.forEach((p, index) => {
        let matchId = `match-${index}`;
        let procesado = db.Jon.partidosProcesados.includes(matchId);
        
        container.innerHTML += `
            <div class="match-row">
                <div class="match-team" style="text-align:right;">${p.l}</div>
                <div class="match-inputs">
                    <input type="number" id="${matchId}-l" min="0" ${procesado ? 'disabled' : ''}>
                    <span style="color:#64748b;">-</span>
                    <input type="number" id="${matchId}-v" min="0" ${procesado ? 'disabled' : ''}>
                    <button class="btn-calc ${procesado ? 'done' : ''}" onclick="procesarPartidoGrupo('${matchId}', '${p.l}', '${p.v}')" ${procesado ? 'disabled' : ''}>${procesado ? '✓' : 'Calc'}</button>
                </div>
                <div class="match-team" style="text-align:left;">${p.v}</div>
            </div>
        `;
    });
}

function procesarPartidoGrupo(matchId, localName, visitorName) {
    const goalsL = parseInt(document.getElementById(`${matchId}-l`).value);
    const goalsV = parseInt(document.getElementById(`${matchId}-v`).value);
    if (isNaN(goalsL) || isNaN(goalsV)) return alert("Faltan goles");

    let msg = `G. ${localName} ${goalsL}-${goalsV} ${visitorName}\n\n`;
    ['Jon', 'Lucia'].forEach(jugador => {
        msg += aplicarPuntosJugador(jugador, localName, goalsL, goalsV, true);
        msg += aplicarPuntosJugador(jugador, visitorName, goalsV, goalsL, true);
        if(db[jugador].draft && !db[jugador].partidosProcesados.includes(matchId)) db[jugador].partidosProcesados.push(matchId);
    });

    localStorage.setItem('mundialDB_v4', JSON.stringify(db));
    alert(msg === `G. ${localName} ${goalsL}-${goalsV} ${visitorName}\n\n` ? "Ninguno tiene estos equipos." : msg);
    prepararAdmin();
}

function procesarEliminatoria() {
    const lName = document.getElementById('ko-local').value;
    const vName = document.getElementById('ko-visitor').value;
    const gL = parseInt(document.getElementById('ko-goals-local').value);
    const gV = parseInt(document.getElementById('ko-goals-visitor').value);
    
    if (isNaN(gL) || isNaN(gV) || lName === vName) return alert("Datos inválidos");

    let msg = `K.O. ${lName} ${gL}-${gV} ${vName}\n\n`;
    ['Jon', 'Lucia'].forEach(jugador => {
        msg += aplicarPuntosJugador(jugador, lName, gL, gV, false);
        msg += aplicarPuntosJugador(jugador, vName, gV, gL, false);
    });

    localStorage.setItem('mundialDB_v4', JSON.stringify(db));
    alert(msg);
    document.getElementById('ko-goals-local').value = ''; document.getElementById('ko-goals-visitor').value = '';
}

function aplicarBono() {
    const player = document.getElementById('bonus-player').value;
    const select = document.getElementById('bonus-type');
    const pts = parseInt(select.value);
    const reason = select.options[select.selectedIndex].text;

    db[player].puntos += pts;
    db[player].historial.push(db[player].puntos);
    localStorage.setItem('mundialDB_v4', JSON.stringify(db));
    alert(`✅ ${pts} pts sumados a ${player} por: ${reason}`);
}

// DASHBOARD
function verDashboard() {
    document.getElementById('pts-jon').innerText = db.Jon.puntos;
    document.getElementById('pts-lucia').innerText = db.Lucia.puntos;
    
    const ctx = document.getElementById('scoreChart').getContext('2d');
    const max = Math.max(db.Jon.historial.length, db.Lucia.historial.length);
    const labels = Array.from({length: max}, (_, i) => `E${i}`);

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
        options: { responsive: true, scales: { y: { grid: { color: 'rgba(255,255,255,0.1)' } }, x: { display: false } } }
    });
}
