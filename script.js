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