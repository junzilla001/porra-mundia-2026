import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// !!! PEGA TUS DATOS DE FIREBASE AQUÍ !!!
const firebaseConfig = {

  apiKey: "AIzaSyCAOF7ENV5MSHYQp_-nGqhrcinZK0dOSSI",

  authDomain: "porramundial2026-7e8a8.firebaseapp.com",

  projectId: "porramundial2026-7e8a8",

  storageBucket: "porramundial2026-7e8a8.firebasestorage.app",

  messagingSenderId: "427609716936",

  appId: "1:427609716936:web:0ea087f0ecaa96b1fc8dfd",

  measurementId: "G-EWT5BZPWY3"

};

const app = initializeApp(firebaseConfig);
const dbFirestore = getFirestore(app);

onSnapshot(doc(dbFirestore, "juego", "estado"), (doc) => {
    if (doc.exists()) {
        db = doc.data();
        if (document.getElementById('screen-dashboard').classList.contains('active')) verDashboard();
        renderizarResumenEquipos(); // Actualiza los equipos en la pantalla principal
    }
});

async function guardarDB() {
    try { await setDoc(doc(dbFirestore, "juego", "estado"), db); } 
    catch (e) { console.error("Error al guardar:", e); }
}

// BASE DE DATOS EQUIPOS
const equipos = {
    'A': [{nombre: 'México', precio: 160, iso: 'mx'}, {nombre: 'R. Checa', precio: 130, iso: 'cz'}, {nombre: 'R. Corea', precio: 115, iso: 'kr'}, {nombre: 'Sudáfrica', precio: 60, iso: 'za'}],
    'B': [{nombre: 'Suiza', precio: 150, iso: 'ch'}, {nombre: 'Canadá', precio: 130, iso: 'ca'}, {nombre: 'Bosnia', precio: 80, iso: 'ba'}, {nombre: 'Catar', precio: 50, iso: 'qa'}],
    'C': [{nombre: 'Brasil', precio: 250, iso: 'br'}, {nombre: 'Marruecos', precio: 155, iso: 'ma'}, {nombre: 'Escocia', precio: 100, iso: 'gb-sct'}, {nombre: 'Haití', precio: 40, iso: 'ht'}],
    'D': [{nombre: 'EEUU', precio: 155, iso: 'us'}, {nombre: 'Turquía', precio: 120, iso: 'tr'}, {nombre: 'Australia', precio: 105, iso: 'au'}, {nombre: 'Paraguay', precio: 70, iso: 'py'}],
    'E': [{nombre: 'Alemania', precio: 235, iso: 'de'}, {nombre: 'Ecuador', precio: 125, iso: 'ec'}, {nombre: 'C. Marfil', precio: 110, iso: 'ci'}, {nombre: 'Curazao', precio: 35, iso: 'cw'}],
    'F': [{nombre: 'Países Bajos', precio: 210, iso: 'nl'}, {nombre: 'Japón', precio: 135, iso: 'jp'}, {nombre: 'Suecia', precio: 130, iso: 'se'}, {nombre: 'Túnez', precio: 70, iso: 'tn'}],
    'G': [{nombre: 'Bélgica', precio: 200, iso: 'be'}, {nombre: 'Egipto', precio: 110, iso: 'eg'}, {nombre: 'Irán', precio: 80, iso: 'ir'}, {nombre: 'N. Zelanda', precio: 55, iso: 'nz'}],
    'H': [{nombre: 'España', precio: 255, iso: 'es'}, {nombre: 'Uruguay', precio: 170, iso: 'uy'}, {nombre: 'Arabia S.', precio: 65, iso: 'sa'}, {nombre: 'Cabo Verde', precio: 45, iso: 'cv'}],
    'I': [{nombre: 'Francia', precio: 255, iso: 'fr'}, {nombre: 'Senegal', precio: 145, iso: 'sn'}, {nombre: 'Noruega', precio: 140, iso: 'no'}, {nombre: 'Irak', precio: 50, iso: 'iq'}],
    'J': [{nombre: 'Argentina', precio: 245, iso: 'ar'}, {nombre: 'Austria', precio: 150, iso: 'at'}, {nombre: 'Argelia', precio: 100, iso: 'dz'}, {nombre: 'Jordania', precio: 45, iso: 'jo'}],
    'K': [{nombre: 'Portugal', precio: 240, iso: 'pt'}, {nombre: 'Colombia', precio: 160, iso: 'co'}, {nombre: 'RD Congo', precio: 70, iso: 'cd'}, {nombre: 'Uzbekistán', precio: 60, iso: 'uz'}],
    'L': [{nombre: 'Inglaterra', precio: 245, iso: 'gb-eng'}, {nombre: 'Croacia', precio: 155, iso: 'hr'}, {nombre: 'Ghana', precio: 90, iso: 'gh'}, {nombre: 'Panamá', precio: 55, iso: 'pa'}]
};

const generarPartidosGrupos = () => {
    let partidos = [];
    for (const [grupo, lista] of Object.entries(equipos)) {
        partidos.push({l: lista[0].nombre, v: lista[3].nombre}); partidos.push({l: lista[2].nombre, v: lista[1].nombre});
        partidos.push({l: lista[1].nombre, v: lista[3].nombre}); partidos.push({l: lista[0].nombre, v: lista[2].nombre});
        partidos.push({l: lista[1].nombre, v: lista[0].nombre}); partidos.push({l: lista[3].nombre, v: lista[2].nombre});
    }
    return partidos;
};

const PRESUPUESTO_INICIAL = 1500;
let usuarioActual = '';
let seleccionesActuales = {};
let myChart = null;

let db = JSON.parse(localStorage.getItem('mundialDB_v4')) || {
    Jon: { draft: null, multiplicador: null, puntos: 0, historial: [0], partidosProcesados: [] },
    Lucia: { draft: null, multiplicador: null, puntos: 0, historial: [0], partidosProcesados: [] }
};

// SEGURIDAD Y NAVEGACIÓN
function intentarEntrarDraft(nombre) {
    if (db[nombre].draft) {
        alert(`Ya has elegido tus equipos, ${nombre}.`); return;
    }
    let pwd = prompt(`Introduce la contraseña para ${nombre}:`);
    if (nombre === 'Jon' && pwd === 'Jonymelavo') iniciarDraft(nombre);
    else if (nombre === 'Lucia' && pwd === 'Lucilinda') iniciarDraft(nombre);
    else if (pwd !== null) alert("Contraseña incorrecta ❌");
}

function intentarEntrarAdmin() {
    let pwd = prompt("Introduce la Contraseña de Administrador:");
    if (pwd === '241010') { prepararAdmin(); mostrarPantalla('screen-admin'); } 
    else if (pwd !== null) alert("Contraseña incorrecta ❌");
}

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
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// RENDERIZAR RESUMEN EQUIPOS EN INICIO
function renderizarResumenEquipos() {
    const container = document.getElementById('equipos-resumen-container');
    const resJon = document.getElementById('resumen-jon');
    const resLucia = document.getElementById('resumen-lucia');
    
    if (!db.Jon.draft && !db.Lucia.draft) { container.style.display = 'none'; return; }
    container.style.display = 'block';

    const renderDraft = (jugador, draftObj, multiplicador) => {
        if (!draftObj) return `<h3 style="text-align:center; color:#94a3b8;">${jugador} aún no ha fichado</h3>`;
        let html = `<h3 style="text-align:center; margin-bottom: 15px; color: ${jugador === 'Jon' ? 'var(--jon-color)' : 'var(--lucia-color)'};">${jugador}</h3>`;
        
        // Ordenar equipos por puntos de mayor a menor
        let equiposList = Object.values(draftObj).sort((a, b) => (b.puntosGanados || 0) - (a.puntosGanados || 0));
        
        equiposList.forEach(eq => {
            let pts = eq.puntosGanados || 0;
            let estrella = (eq.nombre === multiplicador) ? '⭐' : '';
            html += `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:0.95rem; background:rgba(0,0,0,0.2); padding:5px 10px; border-radius:5px;">
                    <span><img src="https://flagcdn.com/w20/${eq.iso}.png" style="width:20px; vertical-align:middle; margin-right:8px; border-radius:2px;">${eq.nombre} ${estrella}</span>
                    <span style="font-weight:bold; color:var(--gold);">${pts} pts</span>
                </div>`;
        });
        return html;
    };

    resJon.innerHTML = renderDraft('Jon', db.Jon.draft, db.Jon.multiplicador);
    resLucia.innerHTML = renderDraft('Lucia', db.Lucia.draft, db.Lucia.multiplicador);
}

// LÓGICA DRAFT
function iniciarDraft(nombre) {
    usuarioActual = nombre;
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
        panelMult.style.display = 'block'; selectMult.innerHTML = '';
        opcionesMultiplicador.forEach(nombre => selectMult.innerHTML += `<option value="${nombre}">${nombre}</option>`);
        if (opcionesMultiplicador.length > 0) btnConfirm.disabled = false;
        else { btnConfirm.disabled = true; selectMult.innerHTML = '<option>❌ Faltan equipos entre 100 y 140</option>'; }
    } else { panelMult.style.display = 'none'; btnConfirm.disabled = true; }
}

async function confirmarDraft() {
    db[usuarioActual].draft = seleccionesActuales;
    db[usuarioActual].multiplicador = document.getElementById('multiplier-select').value;
    
    // Inicializar puntosGanados a 0 en cada equipo
    for (const key in db[usuarioActual].draft) {
        db[usuarioActual].draft[key].puntosGanados = 0;
    }

    await guardarDB();
    alert(`¡Selección bloqueada! Estrella: ${db[usuarioActual].multiplicador}`);
    volverInicio();
}

// MOTOR MATEMÁTICO
function calcularPuntosEquipo(equipoNombre, golesFavor, golesContra, esGrupo, jugador) {
    let ptsPositivos = 0; let ptsNegativos = 0;
    ptsPositivos += (golesFavor * 3);
    ptsNegativos += (golesContra * -1);
    if (golesContra === 0) ptsPositivos += 3;

    if (esGrupo) {
        if (golesFavor > golesContra) ptsPositivos += 5;
        else if (golesFavor < golesContra) ptsNegativos += -3;
    }

    if (db[jugador].multiplicador === equipoNombre) ptsPositivos = ptsPositivos * 2;
    return ptsPositivos + ptsNegativos;
}

function aplicarPuntosJugador(jugador, equipoNombre, golesFavor, golesContra, esGrupo) {
    if (!db[jugador].draft) return "";
    let mensaje = "";
    for (const key in db[jugador].draft) {
        let eq = db[jugador].draft[key];
        if (eq.nombre === equipoNombre) {
            let pts = calcularPuntosEquipo(equipoNombre, golesFavor, golesContra, esGrupo, jugador);
            db[jugador].puntos += pts;
            db[jugador].historial.push(db[jugador].puntos);
            
            // Sumar puntos individuales al equipo
            eq.puntosGanados = (eq.puntosGanados || 0) + pts;

            let estrella = db[jugador].multiplicador === equipoNombre ? " ⭐(x2)" : "";
            mensaje = `➡️ ${jugador}: ${pts} pts por ${equipoNombre}${estrella}\n`;
        }
    }
    return mensaje;
}

// PANEL DE ADMIN (AUTOMATIZADO)
function prepararAdmin() {
    const contGrupos = document.getElementById('group-matches-container');
    const contKnockout = document.getElementById('knockout-container');
    
    // 1. Renderizar Grupos
    contGrupos.innerHTML = '';
    generarPartidosGrupos().forEach((p, index) => {
        let matchId = `match-g-${index}`;
        let procesado = db.Jon.partidosProcesados.includes(matchId);
        contGrupos.innerHTML += `
            <div class="match-row">
                <div class="match-team" style="text-align:right;">${p.l}</div>
                <div class="match-inputs">
                    <input type="number" id="${matchId}-l" min="0" ${procesado ? 'disabled' : ''}>
                    <span style="color:#64748b;">-</span>
                    <input type="number" id="${matchId}-v" min="0" ${procesado ? 'disabled' : ''}>
                    <button class="btn-calc ${procesado ? 'done' : ''}" onclick="procesarPartidoGrupo('${matchId}', '${p.l}', '${p.v}')" ${procesado ? 'disabled' : ''}>${procesado ? '✓' : 'Calc'}</button>
                </div>
                <div class="match-team" style="text-align:left;">${p.v}</div>
            </div>`;
    });

    // 2. Renderizar Cuadro
    contKnockout.innerHTML = `
        <div class="admin-panel glass" style="margin-bottom: 20px;">
            <h3 style="color: var(--gold); margin-bottom: 15px;">Cierre Fase de Grupos</h3>
            <div style="display:flex; gap:10px;">
                <select id="team-bonus-group" class="custom-select"></select>
                <button class="btn-main" style="background:#10b981; padding:10px;" onclick="aplicarBonoGrupos(10)">Pasa (+10)</button>
                <button class="btn-main" style="background:#ef4444; padding:10px;" onclick="aplicarBonoGrupos(-5)">Cae (-5)</button>
            </div>
        </div>`;

    const fasesKnockout = [
        { id: '16avos', name: '16avos de Final', bonus: 15, matches: 16 },
        { id: '8avos', name: 'Octavos de Final', bonus: 20, matches: 8 },
        { id: 'cuartos', name: 'Cuartos de Final', bonus: 25, matches: 4 },
        { id: 'semis', name: 'Semifinales', bonus: 30, matches: 2 },
        { id: 'final', name: 'La Gran Final', bonus: 40, matches: 1 }
    ];

    fasesKnockout.forEach(fase => {
        let htmlFase = `<div class="admin-panel glass" style="margin-bottom: 20px;"><h3 style="color: var(--accent); margin-bottom: 15px;">${fase.name} (+${fase.bonus} pts)</h3>`;
        for(let i=0; i<fase.matches; i++) {
            let matchId = `ko-${fase.id}-${i}`;
            let procesado = db.Jon.partidosProcesados.includes(matchId);
            htmlFase += `
                <div class="match-row" style="flex-direction:column; gap:10px; background: rgba(15,23,42,0.8); padding:15px;">
                    <div style="display:flex; width:100%; gap:10px; align-items:center;">
                        <select id="${matchId}-l" class="custom-select" style="flex:3;" ${procesado?'disabled':''}></select>
                        <input type="number" id="${matchId}-gl" style="flex:1;" placeholder="Goles" ${procesado?'disabled':''}>
                    </div>
                    <div style="text-align:center; color:var(--accent); font-weight:bold; font-size:0.9rem;">VS</div>
                    <div style="display:flex; width:100%; gap:10px; align-items:center;">
                        <select id="${matchId}-v" class="custom-select" style="flex:3;" ${procesado?'disabled':''}></select>
                        <input type="number" id="${matchId}-gv" style="flex:1;" placeholder="Goles" ${procesado?'disabled':''}>
                    </div>
                    <button class="btn-main" style="margin: 5px 0 0; padding:10px; ${procesado?'background:#475569;':''}" onclick="procesarFaseFinal('${matchId}', ${fase.bonus})" ${procesado?'disabled':''}>
                        ${procesado ? 'Procesado ✓' : 'Calcular Avance ⚙️'}
                    </button>
                </div>`;
        }
        htmlFase += `</div>`; contKnockout.innerHTML += htmlFase;
    });

    let todos = []; Object.values(equipos).forEach(lista => lista.forEach(eq => todos.push(eq.nombre)));
    todos.sort(); let opciones = `<option value="">Selecciona equipo...</option>` + todos.map(t => `<option value="${t}">${t}</option>`).join('');
    document.getElementById('team-bonus-group').innerHTML = opciones;
    document.querySelectorAll('#knockout-container select').forEach(sel => { if(sel.id.startsWith('ko-')) sel.innerHTML = opciones; });
}

async function procesarPartidoGrupo(matchId, localName, visitorName) {
    const goalsL = parseInt(document.getElementById(`${matchId}-l`).value);
    const goalsV = parseInt(document.getElementById(`${matchId}-v`).value);
    if (isNaN(goalsL) || isNaN(goalsV)) return alert("Faltan goles");

    let msg = `G. ${localName} ${goalsL}-${goalsV} ${visitorName}\n\n`;
    ['Jon', 'Lucia'].forEach(jugador => {
        msg += aplicarPuntosJugador(jugador, localName, goalsL, goalsV, true);
        msg += aplicarPuntosJugador(jugador, visitorName, goalsV, goalsL, true);
        if(db[jugador].draft && !db[jugador].partidosProcesados.includes(matchId)) db[jugador].partidosProcesados.push(matchId);
    });

    try { await guardarDB(); alert(msg === `G. ${localName} ${goalsL}-${goalsV} ${visitorName}\n\n` ? "Ninguno tiene estos equipos." : msg); prepararAdmin(); } 
    catch (e) { alert("Error guardando en la nube."); }
}

async function procesarFaseFinal(matchId, bonusPts) {
    const localName = document.getElementById(`${matchId}-l`).value;
    const visitorName = document.getElementById(`${matchId}-v`).value;
    const goalsL = parseInt(document.getElementById(`${matchId}-gl`).value);
    const goalsV = parseInt(document.getElementById(`${matchId}-gv`).value);

    if(!localName || !visitorName || isNaN(goalsL) || isNaN(goalsV)) return alert("Rellena todos los campos.");
    if(localName === visitorName) return alert("Los equipos no pueden ser iguales.");

    let ganador = null;
    if (goalsL > goalsV) ganador = localName;
    else if (goalsV > goalsL) ganador = visitorName;
    else {
        let penaltis = prompt(`¡Empate! ¿Quién ganó en penaltis?\nEscribe: "${localName}" o "${visitorName}"`);
        if (penaltis === localName || penaltis === visitorName) ganador = penaltis;
        else return alert("Nombre incorrecto. Cancelado.");
    }

    let msg = `Cruce: ${localName} ${goalsL}-${goalsV} ${visitorName}\n¡${ganador} avanza!\n\n`;

    ['Jon', 'Lucia'].forEach(jugador => {
        msg += aplicarPuntosJugador(jugador, localName, goalsL, goalsV, false);
        msg += aplicarPuntosJugador(jugador, visitorName, goalsV, goalsL, false);
        
        if(db[jugador].draft) {
            for (const key in db[jugador].draft) {
                let eq = db[jugador].draft[key];
                if (eq.nombre === ganador) {
                    db[jugador].puntos += bonusPts;
                    db[jugador].historial.push(db[jugador].puntos);
                    eq.puntosGanados = (eq.puntosGanados || 0) + bonusPts;
                    msg += `🏆 ${jugador}: +${bonusPts} pts EXTRA porque ${ganador} avanza.\n`;
                }
            }
        }
        if(db[jugador].draft && !db[jugador].partidosProcesados.includes(matchId)) db[jugador].partidosProcesados.push(matchId);
    });

    try { await guardarDB(); alert(msg); prepararAdmin(); } 
    catch (e) { alert("Error guardando."); }
}

async function aplicarBonoGrupos(bonusPts) {
    const eqName = document.getElementById('team-bonus-group').value;
    if(!eqName) return alert("Selecciona un equipo primero.");
    
    let msg = `Bono de ${bonusPts} pts aplicado a ${eqName}\n\n`;
    let found = false;

    ['Jon', 'Lucia'].forEach(jugador => {
        if(db[jugador].draft) {
            for (const key in db[jugador].draft) {
                let eq = db[jugador].draft[key];
                if (eq.nombre === eqName) {
                    db[jugador].puntos += bonusPts;
                    db[jugador].historial.push(db[jugador].puntos);
                    eq.puntosGanados = (eq.puntosGanados || 0) + bonusPts;
                    msg += `➡️ ${jugador} suma ${bonusPts} pts.\n`;
                    found = true;
                }
            }
        }
    });

    try { await guardarDB(); alert(found ? msg : "Ninguno tiene este equipo."); } 
    catch(e) { alert("Error al guardar."); }
}

function verDashboard() {
    document.getElementById('pts-jon').innerText = db.Jon.puntos;
    document.getElementById('pts-lucia').innerText = db.Lucia.puntos;
    
    const ctx = document.getElementById('scoreChart').getContext('2d');
    const max = Math.max(db.Jon.historial.length, db.Lucia.historial.length);
    const labels = Array.from({length: max}, (_, i) => `E${i}`);

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line', data: { labels: labels, datasets: [
            { label: 'Jon', data: db.Jon.historial, borderColor: '#10b981', tension: 0.3, borderWidth: 3 },
            { label: 'Lucía', data: db.Lucia.historial, borderColor: '#ec4899', tension: 0.3, borderWidth: 3 }
        ]},
        options: { responsive: true, scales: { y: { grid: { color: 'rgba(255,255,255,0.1)' } }, x: { display: false } } }
    });
}

// EXPORTACIÓN OBLIGATORIA (Asegura que el HTML pueda usar las funciones)
window.intentarEntrarDraft = intentarEntrarDraft;
window.intentarEntrarAdmin = intentarEntrarAdmin;
window.mostrarPantalla = mostrarPantalla;
window.volverInicio = volverInicio;
window.switchAdminTab = switchAdminTab;
window.iniciarDraft = iniciarDraft;
window.toggleSeleccion = toggleSeleccion;
window.actualizarUI = actualizarUI;
window.confirmarDraft = confirmarDraft;
window.procesarPartidoGrupo = procesarPartidoGrupo;
window.procesarFaseFinal = procesarFaseFinal;
window.aplicarBonoGrupos = aplicarBonoGrupos;
