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
    const teamTable = document.getElementById(`roster-${battingTeam}`);
    if (!teamTable) return null;

    // Obtener todas las filas de jugadores (tbody > tr)
    const playerRows = teamTable.querySelectorAll('tbody tr');

    // Solo considerar los primeros 9 jugadores (lineup de bateo)
    if (batterIndex >= Math.min(playerRows.length, 9)) return null;

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
        gameState.visitanteBatterIndex = (gameState.visitanteBatterIndex + 1) % 9;
    } else {
        gameState.localBatterIndex = (gameState.localBatterIndex + 1) % 9;
    }

    console.log(`🏃 Siguiente bateador: ${getCurrentBatter()?.name || 'Desconocido'}`);
    console.log(`📊 Índice de bateador: ${getCurrentBatterIndex() + 1}/9`);

    // Actualizar la visualización
    updateGameDisplay();

    // Actualizar posición del sistema de dados si el juego está activo
    if (gameState.isGameActive) {
        updateDiceSystemPosition();
    }
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

    // Obtener la tabla del equipo que batea (usar los IDs correctos)
    const teamTable = document.getElementById(`roster-${battingTeam}`);
    if (!teamTable) {
        console.error(`No se encontró la tabla: roster-${battingTeam}`);
        return;
    }

    // Obtener la fila del bateador actual (solo lineup de bateo - primeros 9)
    const playerRows = teamTable.querySelectorAll('tbody tr');
    const maxLineupSize = Math.min(playerRows.length, 9);

    if (batterIndex < maxLineupSize) {
        playerRows[batterIndex].classList.add('current-batter');
        console.log(`Resaltando bateador ${batterIndex + 1}/9 del equipo ${battingTeam}: ${getCurrentBatter()?.name || 'Desconocido'}`);
    } else {
        console.error(`Índice de bateador fuera del lineup: ${batterIndex} >= ${maxLineupSize}`);
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

    // Mostrar el sistema de dados en la posición correcta
    updateDiceSystemPosition();

    console.log('🎮 ¡Nuevo juego iniciado! Batea el equipo visitante.');
    console.log(`🏃 Primer bateador: ${getCurrentBatter()?.name || 'Desconocido'}`);
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

        // Ocultar sistema de dados cuando el juego está inactivo
        const visitanteContainer = document.getElementById('dice-container-visitante');
        const localContainer = document.getElementById('dice-container-local');
        if (visitanteContainer) visitanteContainer.style.display = 'none';
        if (localContainer) localContainer.style.display = 'none';
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

// ===== SISTEMA DE DADOS AUTOMÁTICO =====

/*
  FUNCIONES PARA EL SISTEMA DE DADOS QUE FUNCIONA COMO UN RELOJ
  El jugador solo hace clic en "Tirar Dados" y todo se maneja automáticamente
*/

function updateDiceSystemPosition() {
    const visitanteContainer = document.getElementById('dice-container-visitante');
    const localContainer = document.getElementById('dice-container-local');

    if (!visitanteContainer || !localContainer) return;

    if (gameState.isTopHalf) {
        // Visitante batea - mostrar en columna izquierda
        visitanteContainer.style.display = 'block';
        localContainer.style.display = 'none';
        updateBatterInfo('visitante');
    } else {
        // Local batea - mostrar en columna derecha  
        visitanteContainer.style.display = 'none';
        localContainer.style.display = 'block';
        updateBatterInfo('local');
    }

    // Asegurarse de resaltar al bateador actual
    highlightCurrentBatter();
}

function updateBatterInfo(team) {
    const batter = getCurrentBatter();
    if (!batter) return;

    const infoElement = team === 'visitante' ?
        document.getElementById('current-batter-info') :
        document.getElementById('current-batter-info-local');

    if (infoElement) {
        const nameSpan = infoElement.querySelector('.batter-name');
        const statsSpan = infoElement.querySelector('.batter-stats');

        if (nameSpan) nameSpan.textContent = batter.name || 'Jugador';
        if (statsSpan) statsSpan.textContent = `AVG: ${batter.battingAvg || '.000'} | OBP: ${batter.onBasePct || '.000'}`;
    }
}

function rollDice() {
    // Determinar qué team está bateando y elementos correspondientes
    const team = gameState.isTopHalf ? 'visitante' : 'local';
    const resultsDisplay = document.getElementById(`dice-results-display${team === 'local' ? '-local' : ''}`);
    const finalResult = document.getElementById(`final-result${team === 'local' ? '-local' : ''}`);
    const description = document.getElementById(`result-description${team === 'local' ? '-local' : ''}`);

    if (!resultsDisplay || !finalResult || !description) {
        console.error('Elementos de resultado no encontrados');
        return;
    }

    // Simular tirada de dados (D20 + D100)
    const d20 = Math.floor(Math.random() * 20) + 1;
    const d100 = Math.floor(Math.random() * 100) + 1;
    const total = d20 + d100;

    // Mostrar resultados inmediatamente
    resultsDisplay.style.display = 'block';
    finalResult.textContent = total;

    // Determinar resultado de la jugada
    let resultText = '';
    let advanceOuts = false;

    if (total <= 30) {
        resultText = 'Out (flyout, strikeout, groundout)';
        advanceOuts = true;
    } else if (total <= 60) {
        resultText = 'Hit sencillo';
    } else if (total <= 80) {
        resultText = 'Hit doble';
    } else if (total <= 95) {
        resultText = 'Hit triple';
    } else {
        resultText = 'Home Run! 🏠';
    }

    description.textContent = `D20: ${d20} + D100: ${d100} = ${total} → ${resultText}`;

    // Procesar automáticamente el resultado después de mostrar
    setTimeout(() => {
        if (advanceOuts) {
            gameState.outs++;
            console.log(`Out registrado. Outs: ${gameState.outs}`);

            // Si son 3 outs, cambiar de inning
            if (gameState.outs >= 3) {
                changeInning();
            } else {
                // Solo avanzar al siguiente bateador
                nextBatter();
            }
        } else {
            // Es hit - avanzar bateador sin cambiar outs
            nextBatter();
        }

        // Actualizar toda la visualización
        updateGameDisplay();
        updateDiceSystemPosition();

        // Ocultar resultados después de un momento
        setTimeout(() => {
            resultsDisplay.style.display = 'none';
        }, 3000);

    }, 2000); // Dar tiempo para leer el resultado
}

function changeInning() {
    if (gameState.isTopHalf) {
        // Cambiar a la parte baja del mismo inning
        gameState.isTopHalf = false;
        gameState.outs = 0; // Resetear outs
        console.log(`Cambio a parte baja del inning ${gameState.currentInning}`);
    } else {
        // Avanzar al siguiente inning completo
        gameState.currentInning++;
        gameState.isTopHalf = true;
        gameState.outs = 0; // Resetear outs
        console.log(`Avanzar al inning ${gameState.currentInning}`);

        // Verificar si el juego ha terminado (9 innings)
        if (gameState.currentInning > 9) {
            endGame();
            return;
        }
    }

    // Actualizar toda la visualización después del cambio de inning
    updateGameDisplay();
    updateDiceSystemPosition();
}

function endGame() {
    gameState.isGameActive = false;
    const winner = gameState.score.totalVisitante > gameState.score.totalLocal ? 'Visitante' :
        gameState.score.totalLocal > gameState.score.totalVisitante ? 'Local' : 'Empate';

    alert(`¡Juego terminado! Ganador: ${winner}`);
    console.log('Juego terminado');

    // Ocultar sistema de dados
    document.getElementById('dice-container-visitante').style.display = 'none';
    document.getElementById('dice-container-local').style.display = 'none';
}

// Función para actualizar rango del dado del pitcher
function updatePitcherDiceRange(team) {
    const suffix = team === 'local' ? '-local' : '';
    const diceTypeSelect = document.getElementById(`pitcher-dice-type${suffix}`);
    const diceValueInput = document.getElementById(`pitcher-dice-value${suffix}`);

    console.log(`🎲 Buscando elementos para ${team}:`, {
        select: `pitcher-dice-type${suffix}`,
        input: `pitcher-dice-value${suffix}`,
        selectFound: !!diceTypeSelect,
        inputFound: !!diceValueInput
    });

    if (!diceTypeSelect || !diceValueInput) {
        console.error(`❌ Elementos no encontrados para ${team}`);
        return;
    }

    const diceValue = parseInt(diceTypeSelect.value);
    const isNegative = diceValue < 0;
    const diceSize = Math.abs(diceValue);

    console.log(`🎲 Actualizando rango ${team}: ${diceValue} (${isNegative ? 'negativo' : 'positivo'})`);

    // Establecer rangos
    let minVal, maxVal;
    if (isNegative) {
        minVal = -diceSize;
        maxVal = -1;
    } else {
        minVal = 1;
        maxVal = diceSize;
    }

    // Aplicar rangos de múltiples formas para asegurar compatibilidad
    diceValueInput.min = minVal;
    diceValueInput.max = maxVal;
    diceValueInput.setAttribute('min', minVal);
    diceValueInput.setAttribute('max', maxVal);

    // Actualizar placeholder para mostrar el rango
    diceValueInput.placeholder = `${minVal} a ${maxVal}`;

    // Limpiar el valor actual si está fuera del rango
    const currentValue = parseInt(diceValueInput.value);
    if (currentValue && (currentValue < minVal || currentValue > maxVal)) {
        diceValueInput.value = '';
        console.log(`⚠️ Valor ${currentValue} fuera de rango, limpiando...`);
        if (typeof calculateTotal === 'function') {
            calculateTotal(team);
        }
    }

    console.log(`✅ Rango establecido para ${team}: ${minVal} a ${maxVal}`);
}

// Funciones para tirar dados individuales
function rollPitcherDice(team) {
    const diceTypeSelect = document.getElementById(`pitcher-dice-type${team === 'local' ? '-local' : ''}`);
    const diceValueInput = document.getElementById(`pitcher-dice-value${team === 'local' ? '-local' : ''}`);

    const diceValue = parseInt(diceTypeSelect.value);
    const isNegative = diceValue < 0;
    const diceSize = Math.abs(diceValue);

    const roll = Math.floor(Math.random() * diceSize) + 1;
    const finalValue = isNegative ? -roll : roll;

    diceValueInput.value = finalValue;
    calculateTotal(team);
}

function rollBatterDice(team) {
    const diceValueInput = document.getElementById(`batter-dice-value${team === 'local' ? '-local' : ''}`);
    const roll = Math.floor(Math.random() * 100) + 1;

    diceValueInput.value = roll;
    calculateTotal(team);
}

function calculateTotal(team) {
    const pitcherValue = parseInt(document.getElementById(`pitcher-dice-value${team === 'local' ? '-local' : ''}`).value) || 0;
    const batterValue = parseInt(document.getElementById(`batter-dice-value${team === 'local' ? '-local' : ''}`).value) || 0;

    if (pitcherValue === 0 || batterValue === 0) {
        // Si no hay valores, ocultar confirmación
        hideResultConfirmation(team);
        return;
    }

    const total = pitcherValue + batterValue;

    const resultElement = document.getElementById(`final-result${team === 'local' ? '-local' : ''}`);
    resultElement.textContent = total;

    // Actualizar descripción del resultado
    updateResultDescription(team, total, pitcherValue, batterValue);

    // Mostrar botón de confirmación
    showResultConfirmation(team);
}

function updateResultDescription(team, total, pitcherValue, batterValue) {
    const description = document.getElementById(`result-description${team === 'local' ? '-local' : ''}`);

    let resultText = '';
    if (total <= 30) {
        resultText = 'Out (flyout, strikeout, groundout)';
    } else if (total <= 60) {
        resultText = 'Hit sencillo';
    } else if (total <= 80) {
        resultText = 'Hit doble';
    } else if (total <= 95) {
        resultText = 'Hit triple';
    } else {
        resultText = 'Home Run! 🏠';
    }

    description.textContent = `${pitcherValue} + ${batterValue} = ${total} → ${resultText}`;
}

function showResultConfirmation(team) {
    const confirmation = document.getElementById(`result-confirmation${team === 'local' ? '-local' : ''}`);

    if (confirmation) {
        confirmation.style.display = 'block';
    }
}

function hideResultConfirmation(team) {
    const confirmation = document.getElementById(`result-confirmation${team === 'local' ? '-local' : ''}`);

    if (confirmation) {
        confirmation.style.display = 'none';
    }
}

function confirmResult(team) {
    const total = parseInt(document.getElementById(`final-result${team === 'local' ? '-local' : ''}`).textContent);

    console.log(`🎯 Resultado confirmado para ${team}:`);
    console.log(`   Total: ${total}`);

    // Aquí comenzará la lógica en cascada
    processGameResult(team, total, true); // Por defecto siempre avanzar corredor

    // Ocultar confirmación después de procesar
    hideResultConfirmation(team);

    // Limpiar dados para la próxima tirada
    clearDiceValues(team);
}

function processGameResult(team, total, advanceRunner) {
    // PLACEHOLDER: Aquí iremos agregando la lógica en cascada
    console.log('🔄 Procesando resultado del juego...');

    let resultType = '';
    let isOut = false;

    if (total <= 30) {
        resultType = 'out';
        isOut = true;
    } else if (total <= 60) {
        resultType = 'single';
    } else if (total <= 80) {
        resultType = 'double';
    } else if (total <= 95) {
        resultType = 'triple';
    } else {
        resultType = 'homerun';
    }

    console.log(`   Tipo de resultado: ${resultType}`);

    if (isOut) {
        gameState.outs++;
        console.log(`   Outs: ${gameState.outs}`);

        if (gameState.outs >= 3) {
            console.log('   🔄 Cambio de inning');
            changeInning();
        } else {
            console.log('   ➡️ Siguiente bateador');
            nextBatter();
        }
    } else {
        console.log('   ⚾ Hit registrado');
        // TODO: Implementar lógica de hits y movimiento de corredores
        nextBatter();
    }

    // Actualizar visualización
    updateGameDisplay();
    updateDiceSystemPosition();
}

function clearDiceValues(team) {
    const pitcherInput = document.getElementById(`pitcher-dice-value${team === 'local' ? '-local' : ''}`);
    const batterInput = document.getElementById(`batter-dice-value${team === 'local' ? '-local' : ''}`);
    const resultElement = document.getElementById(`final-result${team === 'local' ? '-local' : ''}`);
    const description = document.getElementById(`result-description${team === 'local' ? '-local' : ''}`);

    if (pitcherInput) pitcherInput.value = '';
    if (batterInput) batterInput.value = '';
    if (resultElement) resultElement.textContent = '-';
    if (description) description.textContent = 'Esperando tirada...';
}

// Event listeners para inputs y inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para cálculo automático cuando se editan manualmente
    const inputs = ['pitcher-dice-value', 'batter-dice-value', 'pitcher-dice-value-local', 'batter-dice-value-local'];

    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                const team = inputId.includes('local') ? 'local' : 'visitante';

                // Validar rango solo para pitcher dice
                if (inputId.includes('pitcher-dice-value')) {
                    const value = parseInt(this.value);
                    const min = parseInt(this.min);
                    const max = parseInt(this.max);

                    if (value && (value < min || value > max)) {
                        console.log(`⚠️ Valor ${value} fuera de rango [${min}, ${max}]`);
                        this.style.borderColor = '#ef4444'; // Borde rojo
                        this.title = `Valor debe estar entre ${min} y ${max}`;
                        return; // No calcular total si está fuera de rango
                    } else {
                        this.style.borderColor = ''; // Quitar borde rojo
                        this.title = '';
                    }
                }

                calculateTotal(team);
            });
        }
    });

    // Inicializar rangos de dados al cargar la página
    setTimeout(() => {
        updatePitcherDiceRange('visitante');
        updatePitcherDiceRange('local');
        console.log('🎲 Rangos de dados inicializados con timeout');
    }, 100);

    console.log('🎲 Intentando inicializar rangos de dados...');

    // Inicializar el juego
    initializeGame();
});

// ===== SISTEMA DE DADOS DINÁMICO =====

/*
  FUNCIONES DE CONTROL DEL SISTEMA DE DADOS MÓVIL
  El sistema se mueve entre columnas según el turno al bate
*/

function updateDiceSystemPosition() {
    const visitanteContainer = document.getElementById('dice-container-visitante');
    const localContainer = document.getElementById('dice-container-local');

    if (gameState.isTopHalf) {
        // Visitante batea - mostrar en columna izquierda
        visitanteContainer.style.display = 'block';
        localContainer.style.display = 'none';
        updateBatterInfo('visitante');
    } else {
        // Local batea - mostrar en columna derecha  
        visitanteContainer.style.display = 'none';
        localContainer.style.display = 'block';
        updateBatterInfo('local');
    }
}

function updateBatterInfo(team) {
    const batter = getCurrentBatter();
    const infoElement = team === 'visitante' ?
        document.getElementById('current-batter-info') :
        document.getElementById('current-batter-info-local');

    if (batter && infoElement) {
        const nameSpan = infoElement.querySelector('.batter-name');
        const statsSpan = infoElement.querySelector('.batter-stats');

        nameSpan.textContent = batter.name || 'Jugador';
        statsSpan.textContent = `AVG: ${batter.battingAvg || '.000'} | OBP: ${batter.onBasePct || '.000'}`;
    }
}

function rollDice() {
    const team = gameState.isTopHalf ? 'visitante' : 'local';
    const resultsDisplay = team === 'visitante' ?
        document.getElementById('dice-results-display') :
        document.getElementById('dice-results-display-local');
    const finalResult = team === 'visitante' ?
        document.getElementById('final-result') :
        document.getElementById('final-result-local');
    const description = team === 'visitante' ?
        document.getElementById('result-description') :
        document.getElementById('result-description-local');

    // Simular tirada de dados (D20 + D100)
    const d20 = Math.floor(Math.random() * 20) + 1;
    const d100 = Math.floor(Math.random() * 100) + 1;
    const total = d20 + d100;

    // Mostrar resultados
    resultsDisplay.style.display = 'block';
    finalResult.textContent = total;

    // Determinar resultado de la jugada
    let resultText = '';
    if (total <= 30) {
        resultText = 'Out (foul, strikeout, groundout)';
    } else if (total <= 60) {
        resultText = 'Hit sencillo';
    } else if (total <= 80) {
        resultText = 'Hit doble';
    } else if (total <= 95) {
        resultText = 'Hit triple';
    } else {
        resultText = 'Home run!';
    }

    description.textContent = `D20: ${d20} + D100: ${d100} = ${total} → ${resultText}`;

    // Después de la tirada, avanzar al siguiente bateador
    setTimeout(() => {
        nextBatter();
        updateDiceSystemPosition();

        // Ocultar resultados después de un momento
        setTimeout(() => {
            resultsDisplay.style.display = 'none';
        }, 3000);
    }, 2000);
}

// Event listeners para los botones de dados
document.addEventListener('DOMContentLoaded', function() {
    const rollButtonVisitante = document.getElementById('roll-main-dice');
    const rollButtonLocal = document.getElementById('roll-main-dice-local');

    if (rollButtonVisitante) {
        rollButtonVisitante.addEventListener('click', rollDice);
    }

    if (rollButtonLocal) {
        rollButtonLocal.addEventListener('click', rollDice);
    }
});

// ===== SISTEMA DE CONFIGURACIÓN DE EQUIPOS =====
let currentTeamType = null; // 'visitante' o 'local'
let currentTeamData = null;

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
            { id: 9, name: "Isiah Kiner-Falefa", position: "SS", handedness: "R", battingAvg: ".261", onBasePct: ".314", traits: ["DEF"], malus: 0 }
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
            { id: 9, name: "Gavin Lux", position: "2B", handedness: "L", battingAvg: ".235", onBasePct: ".310", traits: ["SPD"], malus: 2 }
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
            { id: 9, name: "Bobby Dalbec", position: "1B", handedness: "R", battingAvg: ".204", onBasePct: ".282", traits: ["POW"], malus: 3 }
        ]
    }
};

// Funciones del modal
function openTeamConfig(teamType) {
    currentTeamType = teamType;
    console.log(`🔧 Abriendo configuración para equipo: ${teamType}`);

    // Actualizar título del modal
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
        modalTitle.textContent = `⚙️ Configurar ${teamType === 'visitante' ? 'Equipo Visitante' : 'Equipo Local'}`;
    }

    // Limpiar selección anterior
    const presetSelect = document.getElementById('preset-teams');
    const teamNameInput = document.getElementById('team-name');

    if (presetSelect) presetSelect.value = '';
    if (teamNameInput) teamNameInput.value = '';

    // Cargar datos actuales del equipo
    loadCurrentTeamData();

    // Mostrar modal
    const modal = document.getElementById('team-config-modal');
    if (modal) {
        modal.classList.add('active');
        console.log('✅ Modal de configuración mostrado');
    } else {
        console.error('❌ No se encontró el modal team-config-modal');
    }
}

function closeTeamConfig() {
    const modal = document.getElementById('team-config-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    console.log('📴 Modal de configuración cerrado');
}

function loadCurrentTeamData() {
    console.log('📋 Cargando datos actuales del equipo...');
    // PLACEHOLDER: Aquí se cargarían los datos actuales del equipo desde la tabla
}

function loadPresetTeam() {
    const presetSelect = document.getElementById('preset-teams');
    if (!presetSelect) return;

    const selectedTeam = presetSelect.value;
    if (!selectedTeam) return;

    console.log(`📦 Cargando equipo predefinido: ${selectedTeam}`);

    const teamData = PRESET_TEAMS[selectedTeam];
    if (teamData) {
        currentTeamData = teamData;

        // Actualizar campo nombre del equipo
        const teamNameInput = document.getElementById('team-name');
        if (teamNameInput) {
            teamNameInput.value = teamData.name;
        }

        console.log(`✅ Datos del equipo ${teamData.name} cargados`);
    }
}

function createCustomTeam() {
    console.log('🎨 Creando equipo personalizado...');
    // PLACEHOLDER: Aquí se abriría el editor de equipo personalizado
    alert('Función de equipo personalizado en desarrollo');
}

function saveTeamConfig() {
    console.log(`💾 Guardando configuración del equipo ${currentTeamType}...`);

    // Obtener datos del equipo a guardar
    const presetSelect = document.getElementById('preset-teams');
    const teamNameInput = document.getElementById('team-name');

    let teamToSave = null;

    if (presetSelect && presetSelect.value) {
        // Usar equipo predefinido
        teamToSave = PRESET_TEAMS[presetSelect.value];
        console.log(`📋 Aplicando equipo predefinido: ${presetSelect.value}`);
    } else if (currentTeamData) {
        // Usar datos cargados previamente
        teamToSave = currentTeamData;
        console.log(`📋 Aplicando datos del equipo cargado`);
    }

    if (teamToSave) {
        applyTeamToTable(currentTeamType, teamToSave);
        console.log(`✅ Equipo ${teamToSave.name} aplicado a ${currentTeamType}`);
    } else {
        console.warn('⚠️ No hay datos de equipo para guardar');
        alert('Por favor selecciona un equipo antes de guardar');
        return;
    }

    closeTeamConfig();
}

function applyTeamToTable(teamType, teamData) {
    console.log(`🏟️ Aplicando ${teamData.name} a tabla ${teamType}`);

    const tableId = `roster-${teamType}`;
    const table = document.getElementById(tableId);

    if (!table) {
        console.error(`❌ No se encontró la tabla ${tableId}`);
        return;
    }

    const tbody = table.querySelector('tbody');
    if (!tbody) {
        console.error(`❌ No se encontró tbody en tabla ${tableId}`);
        return;
    }

    // Limpiar filas existentes
    tbody.innerHTML = '';

    // Agregar cada jugador con la estructura completa de la tabla original
    teamData.players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.className = 'player-row';
        row.draggable = true;
        row.setAttribute('data-player-id', player.id || (index + 1));

        // Crear la estructura HTML completa con todas las clases CSS
        row.innerHTML = `
            <td class="drag-handle">⋮⋮</td>
            <td class="player-number">${index + 1}</td>
            <td class="player-photo">📷</td>
            <td class="player-name">${player.name}</td>
            <td>
                <select class="position-select" data-player="${player.id || (index + 1)}">
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
            </td>
            <td class="handedness">${player.handedness || 'R'}</td>
            <td class="batting-avg">${player.battingAvg}</td>
            <td class="on-base-pct">${player.onBasePct}</td>
            <td>${generateTraitTags(player.traits)}</td>
            <td class="game-status">⚾</td>
        `;

        tbody.appendChild(row);
    });

    // Actualizar nombre del equipo en el encabezado
    const teamHeader = document.querySelector(`#roster-${teamType}`).closest('.col').querySelector('.team-header h2');
    if (teamHeader) {
        const icon = teamType === 'visitante' ? '🛫' : '🏠';
        teamHeader.textContent = `${icon} ${teamData.name}`;
    }

    console.log(`✅ ${teamData.players.length} jugadores agregados a la tabla con formato completo`);
}

function generateTraitTags(traits) {
    if (!traits || traits.length === 0) return '-';

    return traits.map(trait => {
        const traitClass = `trait-${trait.toLowerCase()}`;
        return `<span class="trait-tag ${traitClass}">${trait}</span>`;
    }).join(' ');
}