// ===== ESTADO DEL JUEGO =====

/* 
  GAMESTATE: Objeto que contiene todo el estado actual del partido de béisbol
  Este objeto centraliza toda la información del juego para mantener sincronizados
  todos los elementos visuales (marcador, alineaciones, etc.)
*/
const gameState = {
    // ESTADO DEL INNING
    currentInning: 1, // Inning actual del juego (1-9, puede extenderse en extras)
    isTopHalf: true, // true = arriba del inning (visitante batea)
    // false = abajo del inning (local batea)

    // ESTADO DEL BATEO
    visitanteBatterIndex: 0, // Índice (0-10) del bateador actual del equipo visitante
    localBatterIndex: 0, // Índice (0-10) del bateador actual del equipo local

    // ESTADO DE LA JUGADA ACTUAL  
    outs: 0, // Número de outs en el inning actual (0-3)
    strikes: 0, // Strikes del bateador actual (0-3)
    balls: 0, // Bolas del bateador actual (0-4)

    // ESTADO DE LAS BASES
    bases: {
        first: null, // Jugador en primera base (null si está vacía)
        second: null, // Jugador en segunda base (null si está vacía)  
        third: null // Jugador en tercera base (null si está vacía)
    },

    // MARCADOR DEL JUEGO
    score: {
        visitante: [0, 0, 0, 0, 0, 0, 0, 0, 0], // Array con las carreras por inning del visitante
        local: [0, 0, 0, 0, 0, 0, 0, 0, 0], // Array con las carreras por inning del local
        totalVisitante: 0, // Total de carreras del visitante
        totalLocal: 0 // Total de carreras del local
    },

    // ESTADÍSTICAS DEL JUEGO
    hits: {
        visitante: 0, // Total de hits del equipo visitante
        local: 0 // Total de hits del equipo local
    },

    errors: {
        visitante: 0, // Total de errores del equipo visitante  
        local: 0 // Total de errores del equipo local
    },

    // ESTADO DEL JUEGO
    isGameActive: false, // true cuando el juego está en progreso
    isGameOver: false, // true cuando el juego ha terminado
    winner: null // 'visitante', 'local', o null si no hay ganador aún
};

/*
  FUNCIÓN: getCurrentBattingTeam()  
  PROPÓSITO: Determina qué equipo está bateando actualmente
  RETORNA: String 'visitante' o 'local'
  EXPLICACIÓN: Usa el estado isTopHalf para saber si batea visitante (arriba) o local (abajo)
*/
function getCurrentBattingTeam() {
    return gameState.isTopHalf ? 'visitante' : 'local';
}

/*
  FUNCIÓN: getCurrentBatterIndex()
  PROPÓSITO: Obtiene el índice del bateador actual del equipo que está bateando
  RETORNA: Number (0-10, índice en el array de jugadores)
  EXPLICACIÓN: Consulta el índice apropiado según qué equipo esté bateando
*/
function getCurrentBatterIndex() {
    return gameState.isTopHalf ? gameState.visitanteBatterIndex : gameState.localBatterIndex;
}

/*
  FUNCIÓN: getCurrentBatter()
  PROPÓSITO: Obtiene el objeto del jugador que está bateando actualmente
  RETORNA: Object con datos del jugador o null si no hay equipos configurados
  EXPLICACIÓN: Combina getCurrentBattingTeam() y getCurrentBatterIndex() para obtener el jugador
*/
function getCurrentBatter() {
    const battingTeam = getCurrentBattingTeam();
    const batterIndex = getCurrentBatterIndex();

    // Obtener la tabla del equipo que está bateando
    const teamTable = document.getElementById(`table-${battingTeam}`);
    if (!teamTable) return null;

    // Obtener todas las filas de jugadores (tbody > tr)
    const playerRows = teamTable.querySelectorAll('tbody tr');
    if (batterIndex >= playerRows.length) return null;

    // Extraer datos del jugador desde la fila de la tabla
    const playerRow = playerRows[batterIndex];
    const cells = playerRow.querySelectorAll('td');

    if (cells.length < 6) return null;

    // Crear objeto jugador con los datos de la tabla
    return {
        name: cells[1].textContent.trim(), // Nombre del jugador
        position: cells[2].textContent.trim(), // Posición
        handedness: cells[3].textContent.trim(), // Zurdo/Diestro
        battingAvg: cells[4].textContent.trim(), // Promedio de bateo
        onBasePct: cells[5].textContent.trim() // Porcentaje en base
    };
}

// ===== CONFIGURACIÓN DE EQUIPOS =====

// Equipos predefinidos
const PRESET_TEAMS = {
    "yankees": {
        name: "New York Yankees",
        players: [
            { id: 1, name: "Aaron Judge", position: "RF", handedness: "R", battingAvg: ".311", onBasePct: ".425", traits: ["POW"], malus: 0 },
            { id: 2, name: "Gleyber Torres", position: "2B", handedness: "R", battingAvg: ".273", onBasePct: ".340", traits: ["SPD"], malus: 1 },
            { id: 3, name: "Anthony Rizzo", position: "1B", handedness: "L", battingAvg: ".263", onBasePct: ".338", traits: ["PWR"], malus: 0 },
            { id: 4, name: "Giancarlo Stanton", position: "DH", handedness: "R", battingAvg: ".247", onBasePct: ".339", traits: ["POW"], malus: 2 },
            { id: 5, name: "DJ LeMahieu", position: "3B", handedness: "R", battingAvg: ".243", onBasePct: ".320", traits: ["CON"], malus: 0 },
            { id: 6, name: "Jose Trevino", position: "C", handedness: "R", battingAvg: ".248", onBasePct: ".283", traits: ["DEF"], malus: 1 },
            { id: 7, name: "Andrew Benintendi", position: "LF", handedness: "L", battingAvg: ".269", onBasePct: ".330", traits: ["SPD"], malus: 0 },
            { id: 8, name: "Harrison Bader", position: "CF", handedness: "R", battingAvg: ".256", onBasePct: ".303", traits: ["SPD"], malus: 1 },
            { id: 9, name: "Isiah Kiner-Falefa", position: "SS", handedness: "R", battingAvg: ".261", onBasePct: ".314", traits: ["DEF"], malus: 0 },
            { id: 10, name: "Oswaldo Cabrera", position: "LF", handedness: "S", battingAvg: ".221", onBasePct: ".290", traits: ["VER"], malus: 2 },
            { id: 11, name: "Kyle Higashioka", position: "C", handedness: "R", battingAvg: ".192", onBasePct: ".260", traits: ["POW"], malus: 3 }
        ]
    },
    "dodgers": {
        name: "Los Angeles Dodgers",
        players: [
            { id: 1, name: "Mookie Betts", position: "RF", handedness: "R", battingAvg: ".307", onBasePct: ".408", traits: ["SPD", "POW"], malus: 0 },
            { id: 2, name: "Freddie Freeman", position: "1B", handedness: "L", battingAvg: ".325", onBasePct: ".407", traits: ["CON"], malus: 0 },
            { id: 3, name: "Trea Turner", position: "SS", handedness: "R", battingAvg: ".298", onBasePct: ".343", traits: ["SPD"], malus: 0 },
            { id: 4, name: "Will Smith", position: "C", handedness: "R", battingAvg: ".261", onBasePct: ".365", traits: ["POW"], malus: 1 },
            { id: 5, name: "Max Muncy", position: "3B", handedness: "L", battingAvg: ".196", onBasePct: ".360", traits: ["POW"], malus: 2 },
            { id: 6, name: "Justin Turner", position: "DH", handedness: "R", battingAvg: ".278", onBasePct: ".350", traits: ["CON"], malus: 1 },
            { id: 7, name: "Chris Taylor", position: "LF", handedness: "R", battingAvg: ".221", onBasePct: ".302", traits: ["VER"], malus: 2 },
            { id: 8, name: "Cody Bellinger", position: "CF", handedness: "L", battingAvg: ".210", onBasePct: ".265", traits: ["POW"], malus: 3 },
            { id: 9, name: "Gavin Lux", position: "2B", handedness: "L", battingAvg: ".235", onBasePct: ".310", traits: ["SPD"], malus: 2 },
            { id: 10, name: "Trayce Thompson", position: "LF", handedness: "R", battingAvg: ".268", onBasePct: ".324", traits: ["POW"], malus: 1 },
            { id: 11, name: "Austin Barnes", position: "C", handedness: "R", battingAvg: ".167", onBasePct: ".217", traits: ["DEF"], malus: 4 }
        ]
    },
    "red_sox": {
        name: "Boston Red Sox",
        players: [
            { id: 1, name: "Rafael Devers", position: "3B", handedness: "L", battingAvg: ".295", onBasePct: ".358", traits: ["POW"], malus: 0 },
            { id: 2, name: "Xander Bogaerts", position: "SS", handedness: "R", battingAvg: ".307", onBasePct: ".377", traits: ["CON"], malus: 0 },
            { id: 3, name: "Trevor Story", position: "2B", handedness: "R", battingAvg: ".238", onBasePct: ".295", traits: ["POW"], malus: 2 },
            { id: 4, name: "J.D. Martinez", position: "DH", handedness: "R", battingAvg: ".274", onBasePct: ".341", traits: ["POW"], malus: 1 },
            { id: 5, name: "Alex Verdugo", position: "LF", handedness: "L", battingAvg: ".280", onBasePct: ".329", traits: ["CON"], malus: 0 },
            { id: 6, name: "Christian Vazquez", position: "C", handedness: "R", battingAvg: ".258", onBasePct: ".308", traits: ["DEF"], malus: 1 },
            { id: 7, name: "Kike Hernandez", position: "CF", handedness: "R", battingAvg: ".219", onBasePct: ".282", traits: ["VER"], malus: 2 },
            { id: 8, name: "Franchy Cordero", position: "RF", handedness: "L", battingAvg: ".219", onBasePct: ".283", traits: ["SPD"], malus: 2 },
            { id: 9, name: "Bobby Dalbec", position: "1B", handedness: "R", battingAvg: ".204", onBasePct: ".282", traits: ["POW"], malus: 3 },
            { id: 10, name: "Christian Arroyo", position: "2B", handedness: "R", battingAvg: ".263", onBasePct: ".316", traits: ["CON"], malus: 1 },
            { id: 11, name: "Connor Wong", position: "C", handedness: "R", battingAvg: ".234", onBasePct: ".270", traits: ["DEF"], malus: 2 }
        ]
    },
    "giants": {
        name: "San Francisco Giants",
        players: [
            { id: 1, name: "Mike Yastrzemski", position: "RF", handedness: "L", battingAvg: ".214", onBasePct: ".339", traits: ["POW"], malus: 2 },
            { id: 2, name: "Thairo Estrada", position: "2B", handedness: "R", battingAvg: ".260", onBasePct: ".322", traits: ["SPD"], malus: 1 },
            { id: 3, name: "Wilmer Flores", position: "1B", handedness: "R", battingAvg: ".233", onBasePct: ".309", traits: ["POW"], malus: 2 },
            { id: 4, name: "Joc Pederson", position: "DH", handedness: "L", battingAvg: ".274", onBasePct: ".353", traits: ["POW"], malus: 1 },
            { id: 5, name: "Evan Longoria", position: "3B", handedness: "R", battingAvg: ".244", onBasePct: ".313", traits: ["CON"], malus: 2 },
            { id: 6, name: "Joey Bart", position: "C", handedness: "R", battingAvg: ".233", onBasePct: ".294", traits: ["DEF"], malus: 2 },
            { id: 7, name: "Luis Gonzalez", position: "LF", handedness: "L", battingAvg: ".269", onBasePct: ".327", traits: ["SPD"], malus: 1 },
            { id: 8, name: "Austin Slater", position: "CF", handedness: "R", battingAvg: ".271", onBasePct: ".342", traits: ["VER"], malus: 1 },
            { id: 9, name: "Brandon Crawford", position: "SS", handedness: "L", battingAvg: ".230", onBasePct: ".305", traits: ["DEF"], malus: 2 },
            { id: 10, name: "LaMonte Wade Jr.", position: "1B", handedness: "L", battingAvg: ".185", onBasePct: ".325", traits: ["CON"], malus: 3 },
            { id: 11, name: "Curt Casali", position: "C", handedness: "R", battingAvg: ".200", onBasePct: ".265", traits: ["DEF"], malus: 3 }
        ]
    }
};

// Variables globales
let currentTeamType = null; // 'visitante' o 'local'
let currentTeamData = null;

// Funciones del modal
function openTeamConfig(teamType) {
    currentTeamType = teamType;

    // Actualizar título del modal
    const modalTitle = document.getElementById('modal-title');
    modalTitle.textContent = `⚙️ Configurar ${teamType === 'visitante' ? 'Equipo Visitante' : 'Equipo Local'}`;

    // Limpiar selección anterior
    document.getElementById('preset-teams').value = '';
    document.getElementById('team-name').value = '';

    // Cargar datos actuales del equipo
    loadCurrentTeamData();

    // Mostrar modal
    document.getElementById('team-config-modal').classList.add('active');
}

function closeTeamConfig() {
    document.getElementById('team-config-modal').classList.remove('active');
    currentTeamType = null;
    currentTeamData = null;
}

function loadPresetTeam() {
    const presetSelect = document.getElementById('preset-teams');
    const selectedPreset = presetSelect.value;

    if (selectedPreset && selectedPreset !== 'custom') {
        const teamData = PRESET_TEAMS[selectedPreset];
        if (teamData) {
            document.getElementById('team-name').value = teamData.name;
            currentTeamData = JSON.parse(JSON.stringify(teamData)); // Deep copy
            renderPlayersEditor();
        }
    } else if (selectedPreset === 'custom') {
        document.getElementById('team-name').value = '';
        createCustomTeam();
    }
}

function loadCurrentTeamData() {
    // Por ahora crear un equipo genérico basado en los datos actuales de la tabla
    currentTeamData = {
        name: currentTeamType === 'visitante' ? 'Equipo Visitante' : 'Equipo Local',
        players: []
    };

    // Generar 11 jugadores genéricos
    for (let i = 1; i <= 11; i++) {
        currentTeamData.players.push({
            id: i,
            name: `Jugador ${i}`,
            position: ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH', 'LF'][i - 1] || 'P',
            handedness: 'R',
            battingAvg: '.250',
            onBasePct: '.320',
            traits: ['CON'],
            malus: 0
        });
    }

    renderPlayersEditor();
}

function createCustomTeam() {
    currentTeamData = {
        name: 'Equipo Personalizado',
        players: []
    };

    // Crear 11 jugadores en blanco
    for (let i = 1; i <= 11; i++) {
        currentTeamData.players.push({
            id: i,
            name: '',
            position: 'P',
            handedness: 'R',
            battingAvg: '.000',
            onBasePct: '.000',
            traits: [],
            malus: 0
        });
    }

    renderPlayersEditor();
}

function renderPlayersEditor() {
    const container = document.getElementById('players-editor');
    container.innerHTML = '';

    if (!currentTeamData || !currentTeamData.players) return;

    currentTeamData.players.forEach((player, index) => {
        const row = document.createElement('div');
        row.className = 'player-editor-row';

        row.innerHTML = `
            <span>${index + 1}</span>
            <input type="text" value="${player.name}" onchange="updatePlayer(${index}, 'name', this.value)" placeholder="Nombre del jugador">
            <select onchange="updatePlayer(${index}, 'position', this.value)">
                <option value="P" ${player.position === 'P' ? 'selected' : ''}>P</option>
                <option value="C" ${player.position === 'C' ? 'selected' : ''}>C</option>
                <option value="1B" ${player.position === '1B' ? 'selected' : ''}>1B</option>
                <option value="2B" ${player.position === '2B' ? 'selected' : ''}>2B</option>
                <option value="3B" ${player.position === '3B' ? 'selected' : ''}>3B</option>
                <option value="SS" ${player.position === 'SS' ? 'selected' : ''}>SS</option>
                <option value="LF" ${player.position === 'LF' ? 'selected' : ''}>LF</option>
                <option value="CF" ${player.position === 'CF' ? 'selected' : ''}>CF</option>
                <option value="RF" ${player.position === 'RF' ? 'selected' : ''}>RF</option>
                <option value="DH" ${player.position === 'DH' ? 'selected' : ''}>DH</option>
            </select>
            <input type="text" value="${player.battingAvg}" onchange="updatePlayer(${index}, 'battingAvg', this.value)" style="width: 60px;" placeholder=".000">
            <input type="text" value="${player.onBasePct}" onchange="updatePlayer(${index}, 'onBasePct', this.value)" style="width: 60px;" placeholder=".000">
            <input type="number" value="${player.malus}" onchange="updatePlayer(${index}, 'malus', parseInt(this.value))" style="width: 50px;" min="-5" max="10">
        `;

        container.appendChild(row);
    });
}

function updatePlayer(index, field, value) {
    if (currentTeamData && currentTeamData.players[index]) {
        currentTeamData.players[index][field] = value;
    }
}

function saveTeamConfig() {
    if (!currentTeamData || !currentTeamType) return;

    // Actualizar nombre del equipo
    const teamName = document.getElementById('team-name').value;
    if (teamName) {
        currentTeamData.name = teamName;
    }

    // Aplicar los cambios a la tabla del juego
    applyTeamToTable();

    // Cerrar modal
    closeTeamConfig();

    alert(`Equipo ${currentTeamData.name} guardado correctamente!`);
}

function applyTeamToTable() {
    const tableId = currentTeamType === 'visitante' ? 'roster-visitante' : 'roster-local';
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tbody .player-row');

    // Actualizar header del equipo
    const header = currentTeamType === 'visitante' ?
        document.querySelector('.col-visitante .team-header h2') :
        document.querySelector('.col-local .team-header h2');

    if (header) {
        const icon = currentTeamType === 'visitante' ? '🛫' : '🏠';
        header.textContent = `${icon} ${currentTeamData.name}`;
    }

    // Actualizar filas de jugadores
    currentTeamData.players.forEach((player, index) => {
        if (rows[index]) {
            const row = rows[index];

            // Actualizar nombre
            const nameCell = row.querySelector('.player-name');
            if (nameCell) nameCell.textContent = player.name || `Jugador ${index + 1}`;

            // Actualizar posición
            const positionSelect = row.querySelector('.position-select');
            if (positionSelect) positionSelect.value = player.position;

            // Actualizar handedness
            const handednessCell = row.querySelector('.handedness');
            if (handednessCell) handednessCell.textContent = player.handedness;

            // Actualizar batting average
            const battingAvgCell = row.querySelector('.batting-avg');
            if (battingAvgCell) battingAvgCell.textContent = player.battingAvg;

            // Actualizar on-base percentage
            const onBasePctCell = row.querySelector('.on-base-pct');
            if (onBasePctCell) onBasePctCell.textContent = player.onBasePct;

            // Actualizar traits (si hay)
            const traitsCell = row.querySelector('td:nth-child(8)'); // Columna de traits
            if (traitsCell && player.traits && player.traits.length > 0) {
                traitsCell.innerHTML = player.traits.map(trait =>
                    `<span class="trait-tag trait-${trait.toLowerCase()}">${trait}</span>`
                ).join(' ');
            }
        }
    });
}

// Cerrar modal al hacer clic fuera de él
document.addEventListener('click', function(event) {
    const modal = document.getElementById('team-config-modal');
    const modalContent = modal.querySelector('.modal-content');

    if (event.target === modal && !modalContent.contains(event.target)) {
        closeTeamConfig();
    }
});

// Atajos de teclado
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeTeamConfig();
    }
});

console.log('Sistema de configuración de equipos cargado!');

// ===== FUNCIONES DE ACTUALIZACIÓN VISUAL DEL ESTADO =====

/*
  FUNCIÓN: updateGameDisplay()
  PROPÓSITO: Actualiza todos los elementos visuales para reflejar el estado actual del juego
  PARÁMETROS: Ninguno
  EXPLICACIÓN: Esta es la función "maestra" que coordina todas las actualizaciones visuales
               Debe llamarse cada vez que cambie el estado del juego
*/
function updateGameDisplay() {
    updateScoreboard(); // Actualiza el marcador con carreras por inning
    highlightCurrentInning(); // Resalta el inning actual en el marcador
    highlightCurrentBatter(); // Resalta al bateador actual en las alineaciones
    updateGameInfo(); // Actualiza información del juego (outs, strikes/balls)
    updateBasesDisplay(); // Actualiza visualización de corredores en bases
}

/*
  FUNCIÓN: updateScoreboard()
  PROPÓSITO: Actualiza las celdas del marcador con las carreras de cada inning
  EXPLICACIÓN: Recorre los arrays de carreras y actualiza cada celda del marcador HTML
*/
function updateScoreboard() {
    // Actualizar carreras por inning para equipo visitante
    gameState.score.visitante.forEach((runs, inningIndex) => {
        // Buscar la celda del inning específico en la fila del visitante
        const cell = document.querySelector(`tbody tr:first-child .inning-score:nth-child(${inningIndex + 2})`);
        if (cell) {
            cell.textContent = runs; // Actualizar el número de carreras
        }
    });

    // Actualizar carreras por inning para equipo local
    gameState.score.local.forEach((runs, inningIndex) => {
        // Buscar la celda del inning específico en la fila del local
        const cell = document.querySelector(`tbody tr:last-child .inning-score:nth-child(${inningIndex + 2})`);
        if (cell) {
            cell.textContent = runs; // Actualizar el número de carreras
        }
    });

    // Actualizar totales de carreras (columna R)
    const visitanteTotal = document.querySelector('tbody tr:first-child td:nth-child(11)');
    const localTotal = document.querySelector('tbody tr:last-child td:nth-child(11)');

    if (visitanteTotal) visitanteTotal.textContent = gameState.score.totalVisitante;
    if (localTotal) localTotal.textContent = gameState.score.totalLocal;

    // Actualizar hits (columna H)
    const visitanteHits = document.querySelector('tbody tr:first-child td:nth-child(12)');
    const localHits = document.querySelector('tbody tr:last-child td:nth-child(12)');

    if (visitanteHits) visitanteHits.textContent = gameState.hits.visitante;
    if (localHits) localHits.textContent = gameState.hits.local;

    // Actualizar errores (columna E)
    const visitanteErrors = document.querySelector('tbody tr:first-child td:nth-child(13)');
    const localErrors = document.querySelector('tbody tr:last-child td:nth-child(13)');

    if (visitanteErrors) visitanteErrors.textContent = gameState.errors.visitante;
    if (localErrors) localErrors.textContent = gameState.errors.local;
}

/*
  FUNCIÓN: highlightCurrentInning()
  PROPÓSITO: Resalta visualmente el inning actual en el marcador
  EXPLICACIÓN: Añade/quita clases CSS para destacar la columna del inning activo
*/
function highlightCurrentInning() {
    // Primero, quitar resaltado de todas las columnas de innings
    document.querySelectorAll('.marcador-table th, .marcador-table td').forEach(cell => {
        cell.classList.remove('current-inning');
    });

    // Resaltar el encabezado del inning actual
    const inningHeader = document.querySelector(`.marcador-table th:nth-child(${gameState.currentInning + 1})`);
    if (inningHeader) {
        inningHeader.classList.add('current-inning');
    }

    // Resaltar las celdas del inning actual para ambos equipos
    const visitanteCell = document.querySelector(`tbody tr:first-child td:nth-child(${gameState.currentInning + 1})`);
    const localCell = document.querySelector(`tbody tr:last-child td:nth-child(${gameState.currentInning + 1})`);

    if (visitanteCell) visitanteCell.classList.add('current-inning');
    if (localCell) localCell.classList.add('current-inning');

    // Resaltar adicionalmente el equipo que está bateando
    if (gameState.isTopHalf && visitanteCell) {
        visitanteCell.classList.add('batting-team');
    } else if (!gameState.isTopHalf && localCell) {
        localCell.classList.add('batting-team');
    }
}

/*
  FUNCIÓN: highlightCurrentBatter()
  PROPÓSITO: Resalta visualmente al jugador que está bateando actualmente
  EXPLICACIÓN: Añade clase CSS al jugador actual y quita resaltado de otros jugadores
*/
function highlightCurrentBatter() {
    // Quitar resaltado de todos los jugadores
    document.querySelectorAll('.player-row').forEach(row => {
        row.classList.remove('current-batter');
    });

    // Determinar qué equipo está bateando
    const battingTeam = getCurrentBattingTeam();
    const batterIndex = getCurrentBatterIndex();

    // Buscar la tabla del equipo que está bateando
    const teamTable = document.getElementById(`table-${battingTeam}`);
    if (!teamTable) return;

    // Buscar la fila del jugador actual
    const playerRows = teamTable.querySelectorAll('tbody tr');
    if (batterIndex < playerRows.length) {
        const currentBatterRow = playerRows[batterIndex];
        currentBatterRow.classList.add('current-batter');

        // Hacer scroll para que el bateador actual sea visible (opcional)
        currentBatterRow.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
}

/*
  FUNCIÓN: updateGameInfo()
  PROPÓSITO: Actualiza información del estado actual (outs, strikes, balls)
  EXPLICACIÓN: Busca elementos en el HTML para mostrar el count actual
*/
function updateGameInfo() {
    // Buscar o crear área de información del juego
    let gameInfoElement = document.getElementById('game-info');

    if (!gameInfoElement) {
        // Si no existe, crear el elemento de información
        gameInfoElement = document.createElement('div');
        gameInfoElement.id = 'game-info';
        gameInfoElement.className = 'game-info-compact';

        // Insertarlo en la columna central, después de la imagen del terreno pero antes de los controles
        const centralColumn = document.querySelector('.col-central');
        const terrenoImg = document.querySelector('.terreno-img');
        const gameControls = document.querySelector('.game-controls');

        if (centralColumn && terrenoImg && gameControls) {
            centralColumn.insertBefore(gameInfoElement, gameControls);
        }
    }

    // Obtener información del bateador actual
    const currentBatter = getCurrentBatter();
    const batterName = currentBatter ? currentBatter.name : 'No configurado';
    const battingTeam = getCurrentBattingTeam();

    // Actualizar contenido del elemento con formato compacto de una línea
    gameInfoElement.innerHTML = `
        <div class="game-status-compact">
            Inning ${gameState.currentInning}${gameState.isTopHalf ? '↑' : '↓'} | 
            Al bate: ${batterName} (${battingTeam}) | 
            Outs: ${gameState.outs}
        </div>
    `;
}

/*
  FUNCIÓN: updateBasesDisplay()
  PROPÓSITO: Actualiza la visualización de los corredores en las bases
  EXPLICACIÓN: Muestra qué jugadores están en cada base (para futuras implementaciones)
*/
function updateBasesDisplay() {
    // Esta función se puede expandir más adelante para mostrar 
    // gráficamente los corredores en las bases
    console.log('Bases actuales:', gameState.bases);
}

// ===== FUNCIONES DE CONTROL DEL FLUJO DEL JUEGO =====
    const resultDisplay = document.getElementById(`${team}-result-display`);
    const additionalRolls = document.getElementById(`${team}-additional-rolls`);

    // Actualizar display principal
    resultDisplay.innerHTML = `
        <span class="result-value">${totalResult}</span>
        <span class="result-description">${description}</span>
    `;

    // Mostrar/ocultar tiradas adicionales
    if (requiresAdditional && additionalTypes.length > 0) {
        updateAdditionalRollButtons(team, additionalTypes);
        additionalRolls.style.display = 'block';
    } else {
        additionalRolls.style.display = 'none';
    }
}

// Función para actualizar los botones de tiradas adicionales
function updateAdditionalRollButtons(team, rollTypes) {
    const rollButtons = document.querySelector(`#${team}-additional-rolls .roll-buttons`);
    rollButtons.innerHTML = '';

    rollTypes.forEach(rollType => {
        const button = document.createElement('button');
        button.className = 'roll-btn';
        button.onclick = () => performAdditionalRoll(team, rollType.type);

        const icons = {
            'defense': '🛡️',
            'steal': '🏃',
            'injury': '🩹',
            'error': '⚠️',
            'double_play': '⚡',
            'wild_pitch': '🌪️',
            'home_run': '💥'
        };

        button.innerHTML = `${icons[rollType.type] || '🎲'} ${rollType.description}`;
        rollButtons.appendChild(button);
    });
}

// Función para realizar tiradas adicionales
function performAdditionalRoll(team, rollType) {
    const d100Result = Math.floor(Math.random() * 100) + 1;
    let result = '';
    let description = '';

    switch (rollType) {
        case 'fielding':
            // TABLA DE FILDEO - Deadball Official
            result = `D100: ${d100Result}`;
            if (d100Result <= 5) {
                description = '⚠️ ERROR GRAVE - Todos los corredores avanzan 2 bases';
            } else if (d100Result <= 15) {
                description = '⚠️ ERROR - Todos los corredores avanzan 1 base extra';
            } else if (d100Result <= 85) {
                description = '🥎 JUGADA NORMAL - Sin efectos adicionales';
            } else if (d100Result <= 95) {
                description = '✨ GRAN JUGADA - Corredores no pueden avanzar';
            } else {
                description = '🌟 JUGADA ESPECTACULAR - Posible out adicional';
            }
            break;

        case 'steal':
            // TABLA DE ROBO DE BASES - Deadball Official
            result = `D100: ${d100Result}`;
            if (d100Result <= 30) {
                description = '💨 ROBO EXITOSO - El corredor avanza a la siguiente base';
            } else if (d100Result <= 60) {
                description = '🚫 ROBO FALLIDO - El corredor es eliminado';
            } else if (d100Result <= 85) {
                description = '⏸️ ROBO CANCELADO - El corredor se queda en su base';
            } else {
                description = '⚡ ROBO PERFECTO - Avanza 2 bases';
            }
            break;

        case 'sacrifice':
            // TABLA DE SACRIFICIO - Deadball Official
            result = `D100: ${d100Result}`;
            if (d100Result <= 40) {
                description = '🏃 SACRIFICIO EXITOSO - Corredor avanza, bateador out';
            } else if (d100Result <= 70) {
                description = '❌ SACRIFICIO FALLIDO - Bateador out, corredor no avanza';
            } else {
                description = '🎯 ¡HIT EN VEZ DE SACRIFICIO! - Todos seguros';
            }
            break;

        case 'doubleplay':
            // TABLA DE DOBLE PLAY - Deadball Official
            result = `D100: ${d100Result}`;
            if (d100Result <= 20) {
                description = '⚡⚡ DOBLE PLAY EXITOSO - 2 outs';
            } else if (d100Result <= 50) {
                description = '⚡ DOBLE PLAY PARCIAL - 1 out, corredor avanza';
            } else if (d100Result <= 80) {
                description = '🏃 SOLO UN OUT - Otros corredores avanzan';
            } else {
                description = '⚠️ ERROR EN DOBLE PLAY - Todos seguros, avanzan';
            }
            break;

        case 'advancement':
            // TABLA DE AVANCE DE CORREDORES - Deadball Official
            result = `D100: ${d100Result}`;
            if (d100Result <= 20) {
                description = '🏃💨 AVANCE AGRESIVO - Todos avanzan 1 base extra';
            } else if (d100Result <= 80) {
                description = '🏃 AVANCE NORMAL - Corredores avanzan según reglas';
            } else {
                description = '🐌 AVANCE CONSERVADOR - Corredores avanzan mínimo';
            }
            break;

        case 'special_event':
            // TABLA DE EVENTOS ESPECIALES - Deadball Official
            result = `D100: ${d100Result}`;
            if (d100Result <= 10) {
                description = '🩹 LESIÓN - Jugador debe hacer tirada de lesión';
            } else if (d100Result <= 20) {
                description = '⚡ CLIMA - Condiciones afectan el próximo turno';
            } else if (d100Result <= 30) {
                description = '👥 MULTITUD - Los fanáticos afectan la jugada';
            } else if (d100Result <= 50) {
                description = '🎯 MOMENTO CLUTCH - Bonificación en próxima tirada';
            } else {
                description = '✨ JUGADA HISTÓRICA - Bonificación permanente';
            }
            break;

        default:
            result = `D100: ${d100Result}`;
            description = `🎲 Tirada adicional de ${rollType} realizada`;
    }

    // Mostrar resultado de la tirada adicional
    displayDiceResult(team, result, description, false);

    console.log(`🎲 Tirada adicional: ${rollType} - ${result} - ${description}`);
}

/*
  FUNCIÓN: applyGameEffect(effect, team)
  PROPÓSITO: Aplica los efectos de las tiradas adicionales al estado del juego
  PARÁMETROS:
    - effect (Object): Objeto con tipo y detalles del efecto
    - team (String): Equipo que realizó la tirada
  EXPLICACIÓN: Conecta los resultados de las tiradas con el estado real del juego
*/
function applyGameEffect(effect, team) {
    if (!effect || !gameState.isGameActive) return;

    console.log(`🎯 Aplicando efecto: ${effect.type} para ${team}`);

    switch (effect.type) {
        case 'error':
            // Añadir error al equipo defensor
            const defendingTeam = team === 'visitante' ? 'local' : 'visitante';
            gameState.errors[defendingTeam]++;
            console.log(`⚠️ Error registrado para ${defendingTeam}`);
            break;

        case 'steal_success':
            console.log('💨 Robo exitoso aplicado');
            // TODO: Mover corredor en las bases
            break;

        case 'steal_out':
            recordOut('caught stealing');
            console.log('🚫 Corredor eliminado intentando robar');
            break;

        case 'double_play_success':
            recordOut('double play');
            if (gameState.outs < 3) {
                recordOut('double play');
            }
            console.log('⚡⚡ Doble play aplicado');
            break;

        case 'sacrifice_success':
            recordOut('sacrifice');
            console.log('🏃 Sacrificio exitoso aplicado');
            break;

        default:
            console.log(`🔧 Efecto ${effect.type} pendiente de implementación`);
    }

    updateGameDisplay();
}

/*
  FUNCIÓN: interpretMainDiceResult(totalResult)
  PROPÓSITO: Interpreta el resultado de la tirada principal según las tablas oficiales de Deadball
  PARÁMETROS: totalResult (Number) - Total de la tirada de dados
  RETORNA: Object con description, requiresAdditional, additionalTypes, outcome
  EXPLICACIÓN: Implementa las tablas oficiales de resolución de turnos al bate del Deadball
*/
function interpretMainDiceResult(totalResult) {
    let description = '';
    let requiresAdditional = false;
    let additionalTypes = [];
    let outcome = '';

    // TABLA OFICIAL DE RESOLUCIÓN DE TURNOS AL BATE - DEADBALL
    if (totalResult <= 12) {
        // 1-12: STRIKEOUT
        description = `⚾ STRIKEOUT (${totalResult}) - El bateador es eliminado`;
        outcome = 'strikeout';
        requiresAdditional = false;

    } else if (totalResult <= 24) {
        // 13-24: FLYOUT
        description = `🌤️ FLYOUT (${totalResult}) - Elevado al aire`;
        outcome = 'flyout';
        requiresAdditional = true;
        additionalTypes = [
            { type: 'fielding', description: '🥎 Tirada de Fildeo' },
            { type: 'sacrifice', description: '🏃 Posible Sacrificio' }
        ];

    } else if (totalResult <= 36) {
        // 25-36: GROUNDOUT
        description = `⚾ GROUNDOUT (${totalResult}) - Rolata al suelo`;
        outcome = 'groundout';
        requiresAdditional = true;
        additionalTypes = [
            { type: 'fielding', description: '🥎 Tirada de Fildeo' },
            { type: 'doubleplay', description: '⚡ Posible Doble Play' },
            { type: 'advancement', description: '🏃 Avance de Corredores' }
        ];

    } else if (totalResult <= 48) {
        // 37-48: WALK
        description = `🚶 BASE POR BOLAS (${totalResult}) - El bateador camina`;
        outcome = 'walk';
        requiresAdditional = true;
        additionalTypes = [
            { type: 'advancement', description: '🏃 Avance de Corredores' },
            { type: 'steal', description: '💨 Oportunidad de Robo' }
        ];

    } else if (totalResult <= 60) {
        // 49-60: SINGLE
        description = `🎯 HIT SENCILLO (${totalResult}) - El bateador llega a primera`;
        outcome = 'single';
        requiresAdditional = true;
        additionalTypes = [
            { type: 'advancement', description: '🏃 Avance de Corredores' },
            { type: 'fielding', description: '🥎 Tirada de Fildeo' }
        ];

    } else if (totalResult <= 72) {
        // 61-72: DOUBLE
        description = `🎯🎯 DOBLE (${totalResult}) - El bateador llega a segunda`;
        outcome = 'double';
        requiresAdditional = true;
        additionalTypes = [
            { type: 'advancement', description: '🏃 Avance de Corredores' },
            { type: 'fielding', description: '🥎 Tirada de Fildeo' }
        ];

    } else if (totalResult <= 84) {
        // 73-84: TRIPLE
        description = `🎯🎯🎯 TRIPLE (${totalResult}) - El bateador llega a tercera`;
        outcome = 'triple';
        requiresAdditional = true;
        additionalTypes = [
            { type: 'advancement', description: '🏃 Avance de Corredores' },
            { type: 'fielding', description: '🥎 Tirada de Fildeo' }
        ];

    } else if (totalResult <= 96) {
        // 85-96: HOME RUN
        description = `🏠⚾ HOME RUN (${totalResult}) - ¡Vuelta completa!`;
        outcome = 'homerun';
        requiresAdditional = false;

    } else {
        // 97+: HOME RUN + EVENTO ESPECIAL
        description = `🏠⚾✨ HOME RUN ÉPICO (${totalResult}) - ¡Con evento especial!`;
        outcome = 'epic_homerun';
        requiresAdditional = true;
        additionalTypes = [
            { type: 'special_event', description: '⭐ Evento Especial' }
        ];
    }

    return { description, requiresAdditional, additionalTypes, outcome };
}

// ===== FUNCIONES DE CONTROL DEL FLUJO DEL JUEGO =====

/*
  FUNCIÓN: startNewGame()
  PROPÓSITO: Inicializa un nuevo juego con valores por defecto
  EXPLICACIÓN: Resetea todo el estado del juego y actualiza la visualización
*/
function startNewGame() {
    // Resetear el estado del juego a valores iniciales
    gameState.currentInning = 1;
    gameState.isTopHalf = true; // Siempre empieza bateando el visitante
    gameState.visitanteBatterIndex = 0; // Primer bateador del visitante
    gameState.localBatterIndex = 0; // Primer bateador del local (cuando le toque)
    gameState.outs = 0;
    gameState.strikes = 0;
    gameState.balls = 0;

    // Resetear bases
    gameState.bases.first = null;
    gameState.bases.second = null;
    gameState.bases.third = null;

    // Resetear marcador
    gameState.score.visitante = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    gameState.score.local = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    gameState.score.totalVisitante = 0;
    gameState.score.totalLocal = 0;

    // Resetear estadísticas
    gameState.hits.visitante = 0;
    gameState.hits.local = 0;
    gameState.errors.visitante = 0;
    gameState.errors.local = 0;

    // Activar el juego
    gameState.isGameActive = true;
    gameState.isGameOver = false;
    gameState.winner = null;

    // Actualizar toda la visualización
    updateGameDisplay();

    console.log('🎮 ¡Nuevo juego iniciado! Batea el equipo visitante.');
}

/*
  FUNCIÓN: nextBatter()
  PROPÓSITO: Avanza al siguiente bateador en el orden al bate
  EXPLICACIÓN: Incrementa el índice del bateador actual, considerando que hay 9 bateadores
               en el orden (índices 0-8, los jugadores 10-11 son suplentes)
*/
function nextBatter() {
    // Resetear el count del bateador (strikes y balls)
    gameState.strikes = 0;
    gameState.balls = 0;

    if (gameState.isTopHalf) {
        // Si batea el visitante, avanzar su índice
        gameState.visitanteBatterIndex = (gameState.visitanteBatterIndex + 1) % 9;
    } else {
        // Si batea el local, avanzar su índice  
        gameState.localBatterIndex = (gameState.localBatterIndex + 1) % 9;
    }

    console.log(`🏃 Siguiente bateador: ${getCurrentBatter()?.name || 'Desconocido'}`);
}

/*
  FUNCIÓN: recordOut()
  PROPÓSITO: Registra un out y maneja el cambio de inning si es necesario
  PARÁMETROS: reason (String) - Razón del out (strikeout, flyout, etc.)
  EXPLICACIÓN: Incrementa outs, y si llega a 3, cambia de media entrada o inning
*/
function recordOut(reason = 'out') {
    gameState.outs++;
    console.log(`❌ Out registrado (${reason}). Outs: ${gameState.outs}`);

    // Si hay 3 outs, cambiar de media entrada
    if (gameState.outs >= 3) {
        changeHalfInning();
    } else {
        // Si no hay 3 outs, solo avanzar al siguiente bateador
        nextBatter();
        updateGameDisplay();
    }
}

/*
  FUNCIÓN: changeHalfInning()
  PROPÓSITO: Cambia de la parte alta a la baja del inning (o viceversa)
  EXPLICACIÓN: Gestiona el cambio entre equipos que batean y el avance de innings
*/
function changeHalfInning() {
    gameState.outs = 0; // Resetear outs para la nueva media entrada

    if (gameState.isTopHalf) {
        // Cambiar del visitante (arriba) al local (abajo)
        gameState.isTopHalf = false;
        console.log(`🔄 Fin del arriba del inning ${gameState.currentInning}. Ahora batea el equipo local.`);
    } else {
        // Cambiar del local (abajo) al siguiente inning
        gameState.isTopHalf = true;
        gameState.currentInning++;
        console.log(`🔄 Fin del inning ${gameState.currentInning - 1}. Inning ${gameState.currentInning}, batea el visitante.`);

        // Verificar si el juego debe terminar
        if (gameState.currentInning > 9) {
            checkGameEnd();
            return;
        }
    }

    // Limpiar las bases al cambiar de media entrada
    gameState.bases.first = null;
    gameState.bases.second = null;
    gameState.bases.third = null;

    updateGameDisplay();
}

/*
  FUNCIÓN: checkGameEnd()
  PROPÓSITO: Verifica si el juego debe terminar y determina el ganador
  EXPLICACIÓN: Aplica las reglas de béisbol para determinar cuando termina un juego
*/
function checkGameEnd() {
    // Si estamos en el noveno inning o más
    if (gameState.currentInning >= 9) {
        const visitanteScore = gameState.score.totalVisitante;
        const localScore = gameState.score.totalLocal;

        if (visitanteScore !== localScore) {
            // Hay un ganador claro
            gameState.isGameOver = true;
            gameState.isGameActive = false;
            gameState.winner = visitanteScore > localScore ? 'visitante' : 'local';

            console.log(`🏆 ¡Juego terminado! Ganador: ${gameState.winner} (${visitanteScore}-${localScore})`);
            updateGameDisplay();

            // Mostrar mensaje de victoria
            alert(`🏆 ¡Juego terminado!\nGanador: ${gameState.winner}\nMarcador final: ${visitanteScore}-${localScore}`);
        } else {
            // Empate, continuar en innings extras
            console.log(`⚡ Innings extras - Marcador empatado ${visitanteScore}-${localScore}`);
            updateGameDisplay();
        }
    }
}

/*
  FUNCIÓN: addRun(team, runs)
  PROPÓSITO: Añade carreras al marcador de un equipo
  PARÁMETROS: 
    - team (String): 'visitante' o 'local'
    - runs (Number): Número de carreras a añadir (generalmente 1)
  EXPLICACIÓN: Actualiza tanto el total como el inning actual en el marcador
*/
function addRun(team, runs = 1) {
    // Añadir al total del equipo
    if (team === 'visitante') {
        gameState.score.totalVisitante += runs;
        gameState.score.visitante[gameState.currentInning - 1] += runs;
    } else if (team === 'local') {
        gameState.score.totalLocal += runs;
        gameState.score.local[gameState.currentInning - 1] += runs;
    }

    console.log(`🏃‍♂️ ${runs} carrera(s) para ${team}. Nuevo total: ${team === 'visitante' ? gameState.score.totalVisitante : gameState.score.totalLocal}`);
    updateGameDisplay();
}

/*
  FUNCIÓN: addHit(team)
  PROPÓSITO: Registra un hit para un equipo
  PARÁMETROS: team (String): 'visitante' o 'local'  
  EXPLICACIÓN: Incrementa el conteo de hits del equipo especificado
*/
function addHit(team) {
    if (team === 'visitante') {
        gameState.hits.visitante++;
    } else if (team === 'local') {
        gameState.hits.local++;
    }

    console.log(`🎯 Hit registrado para ${team}. Hits: ${team === 'visitante' ? gameState.hits.visitante : gameState.hits.local}`);
    updateGameDisplay();
}

// Event listener para los botones de dados principales
document.addEventListener('DOMContentLoaded', function() {
    // Manejar clicks en botones de dados
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('dice-roll-btn')) {
            const diceType = event.target.getAttribute('data-dice');

            if (diceType === 'variable') {
                // Lanzar dado variable (el selector)
                const selector = document.getElementById('dice-type-selector');
                const diceValue = parseInt(selector.value);
                const result = Math.floor(Math.random() * Math.abs(diceValue)) + 1;
                const actualResult = diceValue < 0 ? -result : result;

                document.getElementById('dice-lanzador').querySelector('.dice-value').textContent = actualResult;

            } else if (diceType === 'd100') {
                // Lanzar D100
                const result = Math.floor(Math.random() * 100) + 1;
                document.getElementById('dice-bateador').querySelector('.dice-value').textContent = result;

                // Calcular resultado total y mostrar en contenedores
                calculateTotalResult();
            }
        }
    });
});

/*
  FUNCIÓN: calculateTotalResult()
  PROPÓSITO: Calcula el resultado total integrando dados, OBT, malus y modificadores de traits
  EXPLICACIÓN: Esta función implementa el sistema completo de cálculo del Deadball
*/
function calculateTotalResult() {
    const diceResultLanzador = parseInt(document.getElementById('dice-lanzador').querySelector('.dice-value').textContent);
    const diceResultBateador = parseInt(document.getElementById('dice-bateador').querySelector('.dice-value').textContent);
    const obtValue = parseInt(document.getElementById('obt-value').querySelector('.dice-value').textContent) || 0;
    const malus = parseInt(document.getElementById('malus-value').querySelector('.dice-value').textContent) || 0;

    if (!isNaN(diceResultLanzador) && !isNaN(diceResultBateador)) {
        // CÁLCULO BASE: Dados + OBT - Malus
        let total = diceResultLanzador + diceResultBateador + obtValue - malus;

        console.log(`🎲 Cálculo base: ${diceResultLanzador} + ${diceResultBateador} + ${obtValue} - ${malus} = ${total}`);

        // APLICAR MODIFICADORES DE TRAITS
        const currentBatter = getCurrentBatter();
        const currentSituation = getCurrentSituation();
        const traitModifier = calculateBatterModifiers(currentBatter, currentSituation);

        // Sumar modificadores de traits
        total += traitModifier;

        console.log(`🎯 Resultado final con traits: ${total} (modificador: ${traitModifier > 0 ? '+' : ''}${traitModifier})`);
        console.log(`📋 Situación: ${currentSituation}, Bateador: ${currentBatter?.name || 'Desconocido'}`);

        // Mostrar resultado total
        document.getElementById('total-result').querySelector('.dice-value').textContent = total;

        // Interpretar resultado con las tablas oficiales
        const interpretation = interpretMainDiceResult(total);

        // Mostrar resultado solo para el equipo que está bateando
        const battingTeam = getCurrentBattingTeam();
        displayDiceResult(battingTeam, total, interpretation.description, interpretation.requiresAdditional, interpretation.additionalTypes);

        // Procesar el resultado del bateo automáticamente
        processAtBatResult(total, interpretation);

        console.log(`⚾ Turno completado para ${currentBatter?.name || 'jugador'} - Resultado: ${interpretation.outcome}`);
    } else {
        console.log('⚠️ Error: No se pudieron leer los valores de los dados');
    }
}

// ===== FUNCIONES ADICIONALES DEL CONTROL DEL JUEGO =====

/*
  FUNCIÓN: resetGame()
  PROPÓSITO: Reinicia completamente el juego manteniendo los equipos configurados
  EXPLICACIÓN: Limpia el estado pero conserva las configuraciones de equipos
*/
function resetGame() {
    // Confirmar con el usuario
    if (!confirm('¿Estás seguro de que quieres reiniciar el juego? Se perderán todos los datos del partido actual.')) {
        return;
    }

    // Llamar a startNewGame para reiniciar todo
    startNewGame();

    console.log('🔄 Juego reiniciado completamente.');
}

/*
  FUNCIÓN: processAtBatResult(diceTotal, interpretation)
  PROPÓSITO: Procesa el resultado de una tirada de bateo y actualiza el estado del juego
  PARÁMETROS:
    - diceTotal (Number): Total de la tirada de dados
    - interpretation (Object): Objeto con descripción y tipos de tiradas adicionales
  EXPLICACIÓN: Esta función conecta el sistema de dados con el estado del juego
*/
function processAtBatResult(diceTotal, interpretation) {
    // Solo procesar si el juego está activo
    if (!gameState.isGameActive || gameState.isGameOver) {
        console.log('⚠️ El juego no está activo, no se procesa el resultado.');
        return;
    }

    const battingTeam = getCurrentBattingTeam();
    const currentBatter = getCurrentBatter();

    console.log(`⚾ Procesando resultado de bateo: ${diceTotal} para ${currentBatter?.name || 'Jugador desconocido'} (${battingTeam})`);

    // Usar el outcome de la interpretación oficial
    const outcome = interpretation.outcome;

    switch (outcome) {
        case 'strikeout':
            recordOut('strikeout');
            console.log(`⚾ Strikeout de ${currentBatter?.name || 'jugador'}`);
            break;

        case 'flyout':
            recordOut('flyout');
            console.log(`🌤️ Flyout de ${currentBatter?.name || 'jugador'}`);
            break;

        case 'groundout':
            recordOut('groundout');
            console.log(`⚾ Groundout de ${currentBatter?.name || 'jugador'}`);
            break;

        case 'walk':
            // Base por bolas - bateador a primera, posible avance de corredores
            console.log(`🚶 Base por bolas de ${currentBatter?.name || 'jugador'}`);
            // TODO: Colocar bateador en primera base
            nextBatter();
            updateGameDisplay();
            break;

        case 'single':
            addHit(battingTeam);
            console.log(`🎯 Hit sencillo de ${currentBatter?.name || 'jugador'}`);
            // TODO: Colocar bateador en primera, mover corredores
            nextBatter();
            updateGameDisplay();
            break;

        case 'double':
            addHit(battingTeam);
            console.log(`🎯🎯 Doble de ${currentBatter?.name || 'jugador'}`);
            // TODO: Colocar bateador en segunda, mover corredores
            nextBatter();
            updateGameDisplay();
            break;

        case 'triple':
            addHit(battingTeam);
            console.log(`🎯🎯🎯 Triple de ${currentBatter?.name || 'jugador'}`);
            // TODO: Colocar bateador en tercera, mover corredores
            nextBatter();
            updateGameDisplay();
            break;

        case 'homerun':
            addHit(battingTeam);
            addRun(battingTeam, 1); // Carrera del bateador
            console.log(`🏠⚾ ¡HOME RUN de ${currentBatter?.name || 'jugador'}!`);
            // TODO: Agregar carreras de corredores en bases
            nextBatter();
            updateGameDisplay();
            break;

        case 'epic_homerun':
            addHit(battingTeam);
            addRun(battingTeam, 1); // Carrera del bateador
            console.log(`🏠⚾✨ ¡HOME RUN ÉPICO de ${currentBatter?.name || 'jugador'}!`);
            // TODO: Agregar carreras de corredores en bases + evento especial
            nextBatter();
            updateGameDisplay();
            break;

        default:
            console.log(`⚠️ Outcome desconocido: ${outcome}`);
            nextBatter();
            updateGameDisplay();
            break;
    }
}

/*
  FUNCIÓN: calculateBatterModifiers(batter, situation)
  PROPÓSITO: Calcula los modificadores de un bateador según sus traits y la situación
  PARÁMETROS:
    - batter (Object): Objeto del jugador bateador
    - situation (String): Situación del juego ('normal', 'clutch', 'runners_on', etc.)
  RETORNA: Number - Modificador total a aplicar a la tirada
  EXPLICACIÓN: Implementa el sistema de traits del Deadball para modificar tiradas
*/
function calculateBatterModifiers(batter, situation = 'normal') {
    if (!batter) return 0;

    let modifier = 0;

    // Buscar traits del jugador en la tabla
    const battingTeam = getCurrentBattingTeam();
    const teamTable = document.getElementById(`table-${battingTeam}`);
    if (!teamTable) return 0;

    const playerRows = teamTable.querySelectorAll('tbody tr');
    const batterIndex = getCurrentBatterIndex();

    if (batterIndex >= playerRows.length) return 0;

    const playerRow = playerRows[batterIndex];
    const cells = playerRow.querySelectorAll('td');

    // Buscar la celda de traits (columna 9)
    if (cells.length < 9) return 0;

    const traitsCell = cells[8]; // 0-indexed, columna 9
    const traitElements = traitsCell.querySelectorAll('.trait-tag');

    console.log(`🔍 Calculando modificadores para ${batter.name}:`);

    traitElements.forEach(traitElement => {
        const traitClass = traitElement.className;

        // POWER (PWR) - Bonificación en home runs potenciales
        if (traitClass.includes('trait-pwr')) {
            if (situation === 'power_situation') {
                modifier += 10;
                console.log(`💪 Trait POWER: +10 en situación de poder`);
            } else {
                modifier += 3;
                console.log(`💪 Trait POWER: +3 general`);
            }
        }

        // SPEED (SPD) - Bonificación en hits sencillos y robos
        if (traitClass.includes('trait-spd')) {
            if (situation === 'speed_situation') {
                modifier += 8;
                console.log(`💨 Trait SPEED: +8 en situación de velocidad`);
            } else {
                modifier += 2;
                console.log(`💨 Trait SPEED: +2 general`);
            }
        }

        // CONTACT (CON) - Reduce strikeouts
        if (traitClass.includes('trait-con')) {
            modifier += 5;
            console.log(`🎯 Trait CONTACT: +5 (reduce strikeouts)`);
        }

        // CLUTCH (CLU) - Bonificación con corredores en bases
        if (traitClass.includes('trait-clu')) {
            if (situation === 'clutch') {
                modifier += 12;
                console.log(`⭐ Trait CLUTCH: +12 con corredores en bases`);
            } else {
                modifier += 1;
                console.log(`⭐ Trait CLUTCH: +1 general`);
            }
        }

        // VETERAN (VET) - Bonificación general pequeña
        if (traitClass.includes('trait-vet')) {
            modifier += 3;
            console.log(`🧓 Trait VETERAN: +3 experiencia`);
        }
    });

    console.log(`📊 Modificador total para ${batter.name}: ${modifier > 0 ? '+' : ''}${modifier}`);
    return modifier;
}

/*
  FUNCIÓN: getCurrentSituation()
  PROPÓSITO: Determina la situación actual del juego para calcular modificadores
  RETORNA: String - Tipo de situación ('normal', 'clutch', 'power_situation', etc.)
  EXPLICACIÓN: Analiza el estado del juego para determinar qué modificadores aplicar
*/
function getCurrentSituation() {
    let situation = 'normal';

    // Situación CLUTCH: Corredores en bases con 2 outs o menos
    const runnersOnBase = gameState.bases.first || gameState.bases.second || gameState.bases.third;
    if (runnersOnBase && gameState.outs < 2) {
        situation = 'clutch';
    }

    // Situación POWER: Count favorable (más bolas que strikes)
    if (gameState.balls > gameState.strikes) {
        situation = 'power_situation';
    }

    // Situación SPEED: Necesidad de hit sencillo
    if (gameState.outs === 2 && runnersOnBase) {
        situation = 'speed_situation';
    }

    return situation;
}

/*
  FUNCIÓN: toggleGameControls()
  PROPÓSITO: Alterna la visibilidad de los botones de control del juego
  EXPLICACIÓN: Muestra/oculta botones según el estado del juego
*/
function toggleGameControls() {
    const startBtn = document.getElementById('start-game-btn');
    const resetBtn = document.getElementById('reset-game-btn');
    const marcadorButtonContainer = document.querySelector('.marcador-button-container');
    const gameControls = document.querySelector('.game-controls');

    if (gameState.isGameActive) {
        // Juego activo: ocultar iniciar, mover reiniciar al marcador
        if (startBtn) startBtn.style.display = 'none';
        if (resetBtn && marcadorButtonContainer) {
            // Mover el botón al marcador si no está ya allí
            if (!marcadorButtonContainer.contains(resetBtn)) {
                marcadorButtonContainer.appendChild(resetBtn);
            }
            resetBtn.style.display = 'inline-block';
        }
    } else {
        // Juego inactivo: mostrar iniciar, mover reiniciar de vuelta a controles
        if (startBtn) startBtn.style.display = 'inline-block';
        if (resetBtn && gameControls) {
            // Mover el botón de vuelta a los controles si no está ya allí
            if (!gameControls.contains(resetBtn)) {
                gameControls.appendChild(resetBtn);
            }
            resetBtn.style.display = 'none';
        }
    }
}

// ===== INICIALIZACIÓN DEL JUEGO =====

/*
  FUNCIÓN: initializeGame()
  PROPÓSITO: Inicializa el sistema cuando se carga la página
  EXPLICACIÓN: Configura el estado inicial y prepara la interfaz
*/
function initializeGame() {
    console.log('🎮 Inicializando sistema de juego de béisbol...');

    // El juego empieza inactivo hasta que el usuario presione "Iniciar Juego"
    gameState.isGameActive = false;
    gameState.isGameOver = false;

    // Configurar controles iniciales
    toggleGameControls();

    // Mostrar información inicial
    const gameInfoElement = document.getElementById('game-info');
    if (!gameInfoElement) {
        updateGameInfo(); // Esto creará el elemento si no existe
    }

    // Actualizar display inicial
    updateGameDisplay();

    console.log('✅ Sistema de juego inicializado correctamente.');
    console.log('📋 Para comenzar: 1) Configura los equipos, 2) Presiona "Iniciar Nuevo Juego"');
}

// Actualizar la función startNewGame para usar toggleGameControls
const originalStartNewGame = startNewGame;
startNewGame = function() {
    originalStartNewGame();
    toggleGameControls();
}

/*
  INICIALIZACIÓN AUTOMÁTICA
  Se ejecuta cuando el DOM está completamente cargado
*/
document.addEventListener('DOMContentLoaded', function() {
    // Retrasar la inicialización para asegurar que todo está cargado
    setTimeout(initializeGame, 100);
});