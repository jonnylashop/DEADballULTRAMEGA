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
    gameComplete: false, // true cuando el juego ha terminado (9+ innings)
    winner: null // 'visitante', 'local' o null si está empatado/en progreso
};

// ===== FUNCIONES DE NAVEGACIÓN DE JUGADORES =====

/*
  FUNCIÓN: getCurrentBattingTeam()
  PROPÓSITO: Obtiene qué equipo está bateando actualmente
  RETORNA: String ('visitante' o 'local')
  EXPLICACIÓN: Determina el equipo según isTopHalf del gameState
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
        name: cells[3].textContent.trim(), // Columna 'Nombre'
        position: cells[4].textContent.trim(), // Columna 'Posición'
        battingAvg: parseFloat(cells[6].textContent.trim()) || 0, // Columna 'BT'
        onBasePct: parseFloat(cells[7].textContent.trim()) || 0, // Columna 'OBT'
        traits: cells[8].textContent.trim() // Columna 'Traits'
    };
}

/*
  FUNCIÓN: nextBatter()
  PROPÓSITO: Avanza al siguiente bateador en el orden de bateo
  EXPLICACIÓN: Incrementa el índice del bateador y maneja el cambio de inning
*/
function nextBatter() {
    const battingTeam = getCurrentBattingTeam();

    if (battingTeam === 'visitante') {
        gameState.visitanteBatterIndex = (gameState.visitanteBatterIndex + 1) % 11;
    } else {
        gameState.localBatterIndex = (gameState.localBatterIndex + 1) % 11;
    }

    console.log(`🏃 Siguiente bateador: ${getCurrentBatter()?.name || 'Desconocido'}`);

    // Actualizar la visualización
    updateGameDisplay();
}

// ===== FUNCIONES DE ACTUALIZACIÓN VISUAL DEL ESTADO =====

/*
  FUNCIÓN: updateGameDisplay()
  PROPÓSITO: Actualiza todos los elementos visuales para reflejar el estado actual del juego
  PARÁMETROS: Ninguno (usa el gameState global)
  EXPLICACIÓN: Función principal que sincroniza la UI. 
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
  PROPÓSITO: Actualiza el marcador visual con las carreras por inning
  EXPLICACIÓN: Sincroniza la tabla del marcador con el gameState.score
*/
function updateScoreboard() {
    // Actualizar carreras por inning para visitante
    const visitanteRow = document.querySelector('tbody tr:first-child');
    if (visitanteRow) {
        const inningCells = visitanteRow.querySelectorAll('.inning-score');
        gameState.score.visitante.forEach((runs, index) => {
            if (inningCells[index]) {
                inningCells[index].textContent = runs;
            }
        });

        // Actualizar totales
        const totalRunsCell = visitanteRow.querySelector('.total-runs');
        const totalHitsCell = visitanteRow.querySelector('.total-hits');
        const totalErrorsCell = visitanteRow.querySelector('.total-errors');

        if (totalRunsCell) totalRunsCell.textContent = gameState.score.totalVisitante;
        if (totalHitsCell) totalHitsCell.textContent = gameState.hits.visitante;
        if (totalErrorsCell) totalErrorsCell.textContent = gameState.errors.visitante;
    }

    // Actualizar carreras por inning para local
    const localRow = document.querySelector('tbody tr:last-child');
    if (localRow) {
        const inningCells = localRow.querySelectorAll('.inning-score');
        gameState.score.local.forEach((runs, index) => {
            if (inningCells[index]) {
                inningCells[index].textContent = runs;
            }
        });

        // Actualizar totales
        const totalRunsCell = localRow.querySelector('.total-runs');
        const totalHitsCell = localRow.querySelector('.total-hits');
        const totalErrorsCell = localRow.querySelector('.total-errors');

        if (totalRunsCell) totalRunsCell.textContent = gameState.score.totalLocal;
        if (totalHitsCell) totalHitsCell.textContent = gameState.hits.local;
        if (totalErrorsCell) totalErrorsCell.textContent = gameState.errors.local;
    }
}

/*
  FUNCIÓN: highlightCurrentInning()
  PROPÓSITO: Resalta visualmente el inning actual en el marcador
  EXPLICACIÓN: Aplica clases CSS para destacar el inning y equipo que batea
*/
function highlightCurrentInning() {
    // Remover highlighting previo
    document.querySelectorAll('.current-inning, .batting-team').forEach(cell => {
        cell.classList.remove('current-inning', 'batting-team');
    });

    // Obtener columnas del inning actual (índice + 1 porque la primera columna es "Equipo")
    const inningColumnIndex = gameState.currentInning;
    const inningCells = document.querySelectorAll(`th:nth-child(${inningColumnIndex + 1}), td:nth-child(${inningColumnIndex + 1})`);

    // Aplicar highlighting al inning actual
    inningCells.forEach(cell => {
        cell.classList.add('current-inning');
    });

    // Destacar el equipo que está bateando
    const battingTeamRow = gameState.isTopHalf ?
        document.querySelector('tbody tr:first-child') :
        document.querySelector('tbody tr:last-child');

    if (battingTeamRow) {
        const teamInningCell = battingTeamRow.querySelector(`td:nth-child(${inningColumnIndex + 1})`);
        if (teamInningCell) {
            teamInningCell.classList.add('batting-team');
        }
    }
}

/*
  FUNCIÓN: highlightCurrentBatter()
  PROPÓSITO: Resalta visualmente al bateador actual en las alineaciones
  EXPLICACIÓN: Aplica clase CSS para destacar la fila del jugador que está al bate
*/
function highlightCurrentBatter() {
    // Remover highlighting previo
    document.querySelectorAll('.current-batter').forEach(row => {
        row.classList.remove('current-batter');
    });

    const battingTeam = getCurrentBattingTeam();
    const batterIndex = getCurrentBatterIndex();

    // Obtener la tabla del equipo que batea
    const teamTable = document.getElementById(`table-${battingTeam}`);
    if (!teamTable) return;

    // Obtener la fila del bateador actual
    const playerRows = teamTable.querySelectorAll('tbody tr');
    if (batterIndex < playerRows.length) {
        playerRows[batterIndex].classList.add('current-batter');
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
    gameState.localBatterIndex = 0; // Primer bateador del local (para cuando les toque)

    // Resetear count
    gameState.outs = 0;
    gameState.strikes = 0;
    gameState.balls = 0;

    // Limpiar bases
    gameState.bases = { first: null, second: null, third: null };

    // Resetear marcador
    gameState.score = {
        visitante: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        local: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        totalVisitante: 0,
        totalLocal: 0
    };

    // Resetear estadísticas
    gameState.hits = { visitante: 0, local: 0 };
    gameState.errors = { visitante: 0, local: 0 };

    // Activar el juego
    gameState.isGameActive = true;
    gameState.gameComplete = false;
    gameState.winner = null;

    // Actualizar visualización
    updateGameDisplay();

    // Gestionar botones
    toggleGameControls();

    console.log('🎮 ¡Nuevo juego iniciado! Batea el equipo visitante.');
}

/*
  FUNCIÓN: resetGame()
  PROPÓSITO: Reinicia completamente el juego actual
  EXPLICACIÓN: Equivale a startNewGame() pero con confirmación del usuario
*/
function resetGame() {
    if (!confirm('¿Estás seguro de que quieres reiniciar el juego? Se perderán todos los datos del partido actual.')) {
        return;
    }

    // Usar la misma lógica que startNewGame
    startNewGame();
    console.log('🔄 Juego reiniciado.');
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
  PROPÓSITO: Configuración inicial cuando se carga la página
  EXPLICACIÓN: Prepara el estado inicial sin comenzar el juego
*/
function initializeGame() {
    // Configurar estado inicial (juego sin empezar)
    gameState.isGameActive = false;

    // Configurar controles iniciales
    updateGameDisplay();
    toggleGameControls();

    // El juego empieza inactivo hasta que el usuario presione "Iniciar Juego"
    console.log('🏟️ Sistema de béisbol inicializado.');
    console.log('📋 Para comenzar: 1) Configura los equipos, 2) Presiona "Iniciar Nuevo Juego"');
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initializeGame);

// Actualizar la función startNewGame para usar toggleGameControls
if (typeof startNewGame === 'function') {
    // La función ya está definida arriba
}