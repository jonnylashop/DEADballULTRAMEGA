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

    // SISTEMA DE INTENCIONES DEL BATEADOR
    currentIntention: null, // 'normal', 'steal', 'bunt', 'hitrun' o null
    gameComplete: false, // true cuando el juego ha terminado (9+ innings)
    winner: null, // 'visitante', 'local' o null si está empatado/en progreso

    // RESULTADO DE LA TIRADA ACTUAL
    currentDiceRoll: null, // Almacena el resultado total de la tirada actual (MSS + Event)

    // TODO: IMPLEMENTAR MÁS TARDE - HISTORIAL DE BATEADORES
    // batterHistory: [] // Array que contendrá el registro de cada bateador:
    // {
    //     batter: {name, position, stats...},
    //     diceRoll: number,
    //     result: string,
    //     inning: number,
    //     isTopHalf: boolean,
    //     timestamp: Date,
    //     outcome: string (hit, out, walk, etc.)
    // }
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

    // NO ACTUALIZAR VISUALIZACIÓN - Puede interferir con dados visibles
    // updateGameDisplay(); // COMENTADO - Mantener dados visibles

    // NO ACTUALIZAR POSICIÓN - Puede interferir con dados visibles  
    // if (gameState.isGameActive) {
    //     updateDiceSystemPosition();
    // }

    console.log(`✅ Bateador avanzado sin resetear dados`);
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
    
    // NUEVO: Actualizar validación de opciones de intención cuando hay cambios en el estado
    if (gameState.isGameActive) {
        const intentionContainer = document.getElementById('intention-container-visitante');
        const isIntentionSelectorVisible = intentionContainer && 
            intentionContainer.style.display !== 'none' &&
            intentionContainer.style.visibility !== 'hidden';
        
        if (isIntentionSelectorVisible) {
            updateIntentionSelector();
        }
    }
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
    console.log('🎮 Iniciando nuevo juego...');

    try {
        // RESETEO SELECTIVO - Solo elementos específicos de dados, NO todo el DOM
        console.log('🧹 Reseteo selectivo de elementos de dados...');

        // 1. RESETEAR SOLO cascada y confirmaciones (no dados históricos)
        console.log('⏳ Llamando resetCascadeSystemComplete()...');
        resetCascadeSystemComplete();
        console.log('✅ resetCascadeSystemComplete() completado');

        // 2. OCULTAR solo elementos específicos de dados recientes
        const knownDiceIds = [
            'dice-results-display',
            'dice-results-display-local'
        ];

        knownDiceIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
                console.log(`✅ Elemento de dados específico ocultado: ${id}`);
            }
        });

        // 3. RESETEAR campos de dados del lanzador y bateador
        const diceInputIds = [
            'pitcher-dice-value',
            'batter-dice-value',
            'pitcher-dice-value-local',
            'batter-dice-value-local'
        ];

        diceInputIds.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.value = '';
                console.log(`✅ Campo de dados reseteado: ${id}`);
            }
        });

        // 4. RESETEAR selectores de tipo de dados
        const diceTypeIds = [
            'pitcher-dice-type',
            'pitcher-dice-type-local'
        ];

        diceTypeIds.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.selectedIndex = 0; // Volver al primer valor
                console.log(`✅ Selector de dados reseteado: ${id}`);
            }
        });

        // 5. RESETEAR descripciones de resultados de dados
        const resultDescriptionIds = [
            'dice-result-description',
            'dice-result-description-local'
        ];

        resultDescriptionIds.forEach(id => {
            const description = document.getElementById(id);
            if (description) {
                description.textContent = 'Esperando tirada...';
                console.log(`✅ Descripción de resultado reseteada: ${id}`);
            }
        });

        // Resetear el estado del juego a valores iniciales
        console.log('⏳ Reseteando gameState...');
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

        // RESETEAR ESTADO DE DADOS
        gameState.currentDiceRoll = null;
        gameState.lastRollDetails = null;

        // Activar el juego
        console.log('⏳ Activando el juego...');
        gameState.isGameActive = true;
        gameState.gameComplete = false;
        gameState.winner = null;
        console.log('✅ gameState.isGameActive = ' + gameState.isGameActive);

        // Actualizar visualización
        console.log('⏳ Llamando updateGameDisplay()...');
        updateGameDisplay();
        console.log('✅ updateGameDisplay() completado');

        // Inicializar sistema de tokens visuales en el diamante
        console.log('⏳ Inicializando sistema de tokens del diamante...');
        updateDiamondDisplay();
        console.log('✅ Sistema de tokens del diamante inicializado');

        // Gestionar botones
        console.log('⏳ Llamando toggleGameControls()...');
        toggleGameControls();
        console.log('✅ toggleGameControls() completado');

        // Mostrar el sistema de dados en la posición correcta
        console.log('⏳ Llamando updateDiceSystemPosition()...');
        updateDiceSystemPosition();
        console.log('✅ updateDiceSystemPosition() completado');

        console.log('🎮 ¡Nuevo juego iniciado correctamente!');

        // Obtener bateador actual
        console.log('⏳ Obteniendo primer bateador...');
        const currentBatter = getCurrentBatter();
        console.log(`🏃 Primer bateador: ${currentBatter?.name || 'Desconocido'}`);

        // NO llamar a resetIntentionSelector aquí - el selector ya está visible por defecto
        console.log('🎯 Selector de intenciones ya visible por defecto');

    } catch (error) {
        console.error('❌ ERROR en startNewGame():', error);
        console.error('Error stack:', error.stack);
        alert('Error al iniciar el juego: ' + error.message);
    }
}

/*
  FUNCIÓN: resetGame()
  PROPÓSITO: Reinicia completamente el juego actual
  EXPLICACIÓN: Vuelve al estado inicial (juego inactivo) para que el usuario pueda hacer clic en "Iniciar Nuevo Juego"
*/
function resetGame() {
    if (!confirm('¿Estás seguro de que quieres reiniciar el juego? Se perderán todos los datos del partido actual.')) {
        return;
    }

    console.log('🔄 Reiniciando juego a estado inicial...');

    // PASO 1: Resetear estado del juego a valores iniciales (INACTIVO)
    gameState.isGameActive = false; // ¡IMPORTANTE! Volver a estado inactivo
    gameState.currentInning = 1;
    gameState.isTopHalf = true;
    gameState.visitanteBatterIndex = 0;
    gameState.localBatterIndex = 0;
    gameState.outs = 0;
    gameState.currentDiceRoll = null;
    gameState.lastRollDetails = null;
    gameState.currentIntention = null;

    // PASO 2: Resetear marcador
    gameState.score = {
        visitanteRuns: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        localRuns: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        totalVisitante: 0,
        totalLocal: 0
    };

    // PASO 3: Limpiar interfaz de dados
    resetCascadeSystemComplete();

    // PASO 4: Ocultar todos los contenedores de dados y selector de intenciones
    const visitanteContainer = document.getElementById('dice-container-visitante');
    const localContainer = document.getElementById('dice-container-local');
    const intentionContainer = document.getElementById('intention-container-visitante');

    if (visitanteContainer) visitanteContainer.style.display = 'none';
    if (localContainer) localContainer.style.display = 'none';
    if (intentionContainer) intentionContainer.style.display = 'none';

    // PASO 5: Limpiar campos de entrada
    const diceInputIds = [
        'pitcher-dice-value', 'batter-dice-value',
        'pitcher-dice-value-local', 'batter-dice-value-local'
    ];

    diceInputIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });

    // PASO 6: Actualizar display y mostrar botón "Iniciar Nuevo Juego"
    updateGameDisplay();

    console.log('🔍 Estado antes de toggleGameControls:', {
        isGameActive: gameState.isGameActive,
        startBtnExists: !!document.getElementById('start-game-btn'),
        resetBtnExists: !!document.getElementById('reset-game-btn')
    });

    toggleGameControls(); // Esto mostrará el botón "Iniciar Nuevo Juego" porque isGameActive = false

    // Verificar que el botón esté visible después de toggleGameControls
    const startBtn = document.getElementById('start-game-btn');
    console.log('🔍 Estado después de toggleGameControls:', {
        startBtnDisplay: startBtn ? startBtn.style.display : 'No encontrado',
        startBtnVisible: startBtn ? window.getComputedStyle(startBtn).display : 'No encontrado'
    });

    // FORZAR visibilidad del botón Iniciar Juego de manera agresiva
    if (startBtn) {
        startBtn.style.cssText = 'display: inline-block !important; visibility: visible !important; opacity: 1 !important;';

        // También forzar el contenedor padre
        const startContainer = startBtn.parentElement;
        if (startContainer) {
            startContainer.style.cssText = `
                position: absolute !important; 
                top: 50% !important; 
                left: 50% !important; 
                transform: translate(-50%, -50%) !important; 
                z-index: 100 !important; 
                display: flex !important; 
                justify-content: center !important; 
                align-items: center !important; 
                width: auto !important; 
                height: auto !important; 
                margin: 0 !important; 
                padding: 0 !important;
            `;
            console.log('🔨 Contenedor padre del botón FORZADO visible');
        }

        console.log('🔨 Botón Iniciar Juego FORZADO visible');
    } else {
        console.error('❌ CRÍTICO: No se encontró el botón start-game-btn');
    }

    console.log('🔄 Juego reiniciado a estado inicial. Presiona "Iniciar Nuevo Juego" para empezar.');
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
    const startContainer = document.querySelector('.start-game-container');

    console.log('🎮 toggleGameControls ejecutado:', {
        isGameActive: gameState.isGameActive,
        startBtn: !!startBtn,
        resetBtn: !!resetBtn,
        marcadorContainer: !!marcadorButtonContainer,
        gameControls: !!gameControls,
        startContainer: !!startContainer
    });

    if (gameState.isGameActive) {
        // Juego activo: ocultar iniciar, mover reiniciar al marcador
        if (startBtn) {
            startBtn.style.display = 'none';
            console.log('✅ Botón Iniciar ocultado (juego activo)');
        }
        if (startContainer) {
            startContainer.classList.remove('game-inactive');
            console.log('✅ Contenedor de inicio: clase game-inactive removida');
        }
        if (resetBtn && marcadorButtonContainer) {
            // Mover el botón al marcador si no está ya allí
            if (!marcadorButtonContainer.contains(resetBtn)) {
                marcadorButtonContainer.appendChild(resetBtn);
            }
            resetBtn.style.display = 'inline-block';
            console.log('✅ Botón Reiniciar movido al marcador y mostrado');
        }
    } else {
        // Juego inactivo: mostrar iniciar, mover reiniciar de vuelta a controles
        if (startBtn) {
            startBtn.style.display = 'inline-block';
            console.log('✅ Botón Iniciar mostrado (juego inactivo)');
        } else {
            console.error('❌ No se encontró el botón Iniciar');
        }
        if (startContainer) {
            startContainer.classList.add('game-inactive');
            console.log('✅ Contenedor de inicio: clase game-inactive agregada');
        }
        if (resetBtn && gameControls) {
            // Mover el botón de vuelta a los controles si no está ya allí
            if (!gameControls.contains(resetBtn)) {
                gameControls.appendChild(resetBtn);
            }
            resetBtn.style.display = 'none';
            console.log('✅ Botón Reiniciar ocultado (juego inactivo)');
        }

        // Ocultar sistema de dados cuando el juego está inactivo
        const visitanteContainer = document.getElementById('dice-container-visitante');
        const localContainer = document.getElementById('dice-container-local');
        if (visitanteContainer) visitanteContainer.style.display = 'none';
        if (localContainer) localContainer.style.display = 'none';
        console.log('✅ Contenedores de dados ocultados (juego inactivo)');
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

// ===== SISTEMA DE TOKENS VISUALES EN EL DIAMANTE =====
/*
  PROPÓSITO: Mostrar corredores como tokens animados sobre la imagen del diamante
  FUNCIONALIDAD: 
    - Crear/eliminar tokens dinámicamente según gameState.bases
    - Animar movimientos entre bases con CSS transitions
    - Sincronizar estado visual con estado del juego
    - Manejar anotación de carreras con animaciones especiales
  
  ESTRUCTURA:
    - basePositions: Coordenadas CSS de cada base en porcentajes
    - createRunnerToken(): Crear nuevo token para corredor
    - moveRunner(): Animar movimiento entre bases
    - updateDiamondDisplay(): Sincronizar tokens con gameState.bases
    - scoreRun(): Animación especial para carreras anotadas
*/

// Coordenadas de las bases en el diamante (porcentajes para responsive)
const basePositions = {
    home: { x: '50%', y: '40%' },    // Home plate - ajustado por usuario
    first: { x: '39%', y: '51%' },   // Primera base - ajustado por usuario
    second: { x: '52%', y: '62%' },  // Segunda base - ajustado por usuario
    third: { x: '61%', y: '51%' }    // Tercera base - ajustado por usuario
};

/**
 * Crea un token visual para un corredor en el diamante
 * @param {Object} player - Objeto jugador con propiedades name, id, team
 * @param {string} base - Base donde colocar el token ('first', 'second', 'third', 'home')
 * @returns {HTMLElement} - Elemento DOM del token creado
 */
function createRunnerToken(player, base) {
    console.log(`🏃 Creando token para ${player.name} en ${base}`);
    
    const token = document.createElement('div');
    token.className = `runner-token team-${player.team} entering`;
    token.dataset.playerId = player.id;
    token.dataset.currentBase = base;
    
    // Crear contenido del token (nombre abreviado o número)
    const nameSpan = document.createElement('span');
    nameSpan.className = 'runner-name';
    nameSpan.textContent = player.name.split(' ').map(n => n[0]).join('') || player.number || '?';
    token.appendChild(nameSpan);
    
    // Posicionar en la base especificada
    const position = basePositions[base];
    token.style.left = position.x;
    token.style.top = position.y;
    
    // Añadir tooltip con información completa
    token.title = `${player.name} (${player.team}) - ${base} base`;
    
    // Añadir al contenedor de tokens
    const container = document.getElementById('runners-container');
    if (container) {
        container.appendChild(token);
    } else {
        console.error('❌ No se encontró el contenedor de runners');
    }
    
    // Remover clase de entrada después de la animación
    setTimeout(() => {
        token.classList.remove('entering');
    }, 800);
    
    return token;
}

/**
 * Mueve un token de corredor de una base a otra con animación
 * @param {string} playerId - ID del jugador a mover
 * @param {string} fromBase - Base de origen
 * @param {string} toBase - Base de destino  
 * @param {Function} callback - Función a ejecutar cuando termine la animación
 */
function moveRunner(playerId, fromBase, toBase, callback = null) {
    console.log(`🏃‍♂️ Moviendo jugador ${playerId} de ${fromBase} a ${toBase}`);
    
    const token = document.querySelector(`[data-player-id="${playerId}"]`);
    if (!token) {
        console.error(`❌ No se encontró token para jugador ${playerId}`);
        return;
    }
    
    // Actualizar posición de destino
    const toPosition = basePositions[toBase];
    token.style.left = toPosition.x;
    token.style.top = toPosition.y;
    token.dataset.currentBase = toBase;
    
    // Actualizar tooltip
    const playerName = token.querySelector('.runner-name').textContent;
    token.title = `${playerName} - ${toBase} base`;
    
    // Ejecutar callback después de la animación (1.5s según CSS)
    if (callback) {
        setTimeout(callback, 1500);
    }
}

/**
 * Maneja la anotación de una carrera con animación especial
 * @param {string} playerId - ID del jugador que anota
 * @param {Function} callback - Función a ejecutar cuando termine la animación
 */
function scoreRun(playerId, callback = null) {
    console.log(`⚾ ¡Carrera anotada! Jugador ${playerId}`);
    
    const token = document.querySelector(`[data-player-id="${playerId}"]`);
    if (!token) {
        console.error(`❌ No se encontró token para jugador ${playerId}`);
        return;
    }
    
    // Mover a home plate y añadir animación de carrera
    const homePosition = basePositions.home;
    token.style.left = homePosition.x;
    token.style.top = homePosition.y;
    token.classList.add('scoring');
    
    // Remover token después de la animación (2s)
    setTimeout(() => {
        if (token.parentNode) {
            token.parentNode.removeChild(token);
        }
        console.log(`✅ Token de ${playerId} removido después de anotar`);
        
        if (callback) {
            callback();
        }
    }, 2000);
}

/**
 * Elimina un token de corredor del diamante
 * @param {string} playerId - ID del jugador cuyo token eliminar
 */
function removeRunnerToken(playerId) {
    console.log(`🗑️ Eliminando token de jugador ${playerId}`);
    
    const token = document.querySelector(`[data-player-id="${playerId}"]`);
    if (token && token.parentNode) {
        token.parentNode.removeChild(token);
        console.log(`✅ Token de ${playerId} eliminado`);
    }
}

/**
 * Actualiza la visualización del diamante para reflejar gameState.bases
 * Sincroniza los tokens visibles con el estado actual del juego
 */
function updateDiamondDisplay() {
    console.log('💎 Actualizando visualización del diamante...');
    
    const container = document.getElementById('runners-container');
    if (!container) {
        console.warn('⚠️ No se encontró contenedor de runners - sistema de tokens deshabilitado');
        return;
    }
    
    // Limpiar tokens existentes
    container.innerHTML = '';
    console.log('🧹 Tokens existentes limpiados');
    
    // Crear tokens para corredores actuales
    ['first', 'second', 'third'].forEach(base => {
        const runner = gameState.bases[base];
        if (runner) {
            console.log(`👤 Creando token para ${runner.name} en ${base}`);
            createRunnerToken(runner, base);
        }
    });
    
    console.log('✅ Visualización del diamante actualizada');
}

/**
 * Añade un corredor a una base específica (tanto en gameState como visualmente)
 * @param {Object} player - Objeto jugador
 * @param {string} base - Base de destino ('first', 'second', 'third')
 */
function addRunnerToBase(player, base) {
    console.log(`➕ Añadiendo ${player.name} a ${base} base`);
    
    // Actualizar gameState
    gameState.bases[base] = player;
    
    // Crear token visual
    createRunnerToken(player, base);
    
    console.log(`✅ ${player.name} añadido a ${base} base`);
}

/**
 * Mueve un corredor entre bases (actualiza gameState y anima visualmente)
 * @param {string} fromBase - Base de origen
 * @param {string} toBase - Base de destino
 * @param {Function} callback - Función a ejecutar cuando termine
 */
function moveRunnerBetweenBases(fromBase, toBase, callback = null) {
    const runner = gameState.bases[fromBase];
    if (!runner) {
        console.warn(`⚠️ No hay corredor en ${fromBase} para mover`);
        return;
    }
    
    console.log(`🔄 Moviendo ${runner.name} de ${fromBase} a ${toBase}`);
    
    // Si es carrera anotada (toBase = 'home')
    if (toBase === 'home') {
        // Actualizar gameState primero
        gameState.bases[fromBase] = null;
        
        // Animar carrera anotada
        scoreRun(runner.id, () => {
            // Sumar carrera al marcador
            const currentTeam = getCurrentBattingTeam();
            const currentInning = gameState.currentInning - 1; // Array indexing
            gameState.score[currentTeam][currentInning]++;
            gameState.score[`total${currentTeam.charAt(0).toUpperCase() + currentTeam.slice(1)}`]++;
            
            // Actualizar marcador visual
            updateGameDisplay();
            
            console.log(`⚾ ¡Carrera anotada por ${runner.name}!`);
            
            if (callback) callback();
        });
    } else {
        // Movimiento normal entre bases
        gameState.bases[toBase] = runner;
        gameState.bases[fromBase] = null;
        
        moveRunner(runner.id, fromBase, toBase, callback);
    }
}

/**
 * Función de prueba para demostrar el sistema de tokens
 * TEMPORAL - Para testing y demostración
 */
function testTokenSystem() {
    console.log('🧪 Ejecutando prueba del sistema de tokens...');
    
    // Jugador de prueba
    const testPlayer = {
        id: 'test-player-1',
        name: 'Juan Pérez',
        team: 'visitante',
        number: '7'
    };
    
    // Limpiar y reiniciar
    updateDiamondDisplay();
    
    // Secuencia de prueba
    setTimeout(() => {
        console.log('📍 Paso 1: Añadir corredor a primera base');
        addRunnerToBase(testPlayer, 'first');
    }, 1000);
    
    setTimeout(() => {
        console.log('📍 Paso 2: Mover a segunda base');
        moveRunnerBetweenBases('first', 'second');
    }, 3000);
    
    setTimeout(() => {
        console.log('📍 Paso 3: Mover a tercera base');
        moveRunnerBetweenBases('second', 'third');
    }, 5000);
    
    setTimeout(() => {
        console.log('📍 Paso 4: Anotar carrera');
        moveRunnerBetweenBases('third', 'home');
    }, 7000);
}

/**
 * Activa/desactiva el modo debug para posicionar bases
 * Hace visibles los marcadores de base para ajustar coordenadas
 */
function toggleBasePositionDebug() {
    const tokensLayer = document.querySelector('.diamond-tokens-layer');
    
    if (!tokensLayer) {
        console.error('❌ No se encontró la capa de tokens');
        return;
    }
    
    const isDebugActive = tokensLayer.classList.contains('debug-mode');
    
    if (isDebugActive) {
        // Desactivar debug
        tokensLayer.classList.remove('debug-mode');
        console.log('🔍 Modo debug de bases DESACTIVADO');
        alert('🔍 Modo debug DESACTIVADO\nLos marcadores de base ahora están ocultos.');
    } else {
        // Activar debug
        tokensLayer.classList.add('debug-mode');
        console.log('🔍 Modo debug de bases ACTIVADO');
        alert('🔍 Modo debug ACTIVADO\n\nAhora puedes ver los marcadores rojos de las bases.\nUsa la consola del navegador (F12) para ajustar las coordenadas.\n\nEjemplo:\nadjustBasePosition("first", "75%", "65%");');
    }
}

/**
 * Ajusta la posición de una base específica
 * @param {string} baseName - 'home', 'first', 'second', 'third'
 * @param {string} x - Coordenada X en porcentaje (ej: "75%")
 * @param {string} y - Coordenada Y en porcentaje (ej: "65%")
 */
function adjustBasePosition(baseName, x, y) {
    console.log(`🎯 Ajustando ${baseName} base a posición: ${x}, ${y}`);
    
    // Actualizar el objeto de coordenadas
    if (basePositions[baseName]) {
        basePositions[baseName].x = x;
        basePositions[baseName].y = y;
        
        // Actualizar marcador visual inmediatamente
        const marker = document.querySelector(`[data-base="${baseName}"]`);
        if (marker) {
            marker.style.left = x;
            marker.style.top = y;
        }
        
        // Actualizar tokens existentes en esa base
        const tokens = document.querySelectorAll(`[data-current-base="${baseName}"]`);
        tokens.forEach(token => {
            token.style.left = x;
            token.style.top = y;
        });
        
        console.log(`✅ ${baseName} base reposicionada a ${x}, ${y}`);
        
        // Mostrar coordenadas actuales de todas las bases
        console.log('📍 Coordenadas actuales de las bases:');
        console.log('basePositions =', JSON.stringify(basePositions, null, 2));
        
    } else {
        console.error(`❌ Base "${baseName}" no encontrada`);
        console.log('Bases válidas: home, first, second, third');
    }
}

// ===== SISTEMA DE VALIDACIÓN DE OPCIONES SEGÚN SITUACIÓN DE BASES =====
/*
  PROPÓSITO: Validar qué opciones de intención están disponibles según la situación actual
  FUNCIONALIDAD:
    - Validar si hay corredores para robo de bases
    - Validar si hay corredores para hit & run  
    - Deshabilitar botones de opciones no disponibles
    - Mostrar indicadores visuales de disponibilidad
  
  INTEGRACIÓN: Llamado cada vez que cambia el estado de las bases
*/

/**
 * Valida qué opciones de intención están disponibles según gameState.bases
 * @returns {Object} - Objeto con disponibilidad de cada opción
 */
function validateIntentionOptions() {
    console.log('🔍 Validando opciones de intención disponibles...');
    console.log('🔍 gameState.bases actual:', gameState.bases);
    
    const hasRunnersOnBase = gameState.bases.first !== null || 
                           gameState.bases.second !== null || 
                           gameState.bases.third !== null;
    
    console.log('🔍 ¿Hay corredores en base?', hasRunnersOnBase);
    
    // Detectar opciones específicas de robo disponibles
    const availableStealOptions = detectAvailableRunners();
    const canSteal = availableStealOptions.length > 0;
    
    console.log('🔍 Opciones de robo detectadas:', availableStealOptions);
    console.log('🔍 ¿Puede robar?', canSteal);
    
    // Hit & Run requiere al menos un corredor en base
    const canHitAndRun = hasRunnersOnBase;
    
    // Bunt siempre está disponible
    const canBunt = true;
    
    // Batear normal siempre está disponible  
    const canBatNormal = true;
    
    const validation = {
        normal: { available: canBatNormal, reason: '' },
        steal: { 
            available: canSteal, 
            reason: canSteal ? '' : 'No hay corredores en bases para robar',
            availableOptions: availableStealOptions.length,
            details: availableStealOptions.map(opt => opt.displayName)
        },
        bunt: { available: canBunt, reason: '' },
        hitrun: { 
            available: canHitAndRun, 
            reason: canHitAndRun ? '' : 'Necesitas corredores en bases para Hit & Run'
        }
    };
    
    console.log('📋 Resultado de validación:', validation);
    return validation;
}

/**
 * Actualiza la interfaz del selector de intenciones según la validación
 * @param {Object} validation - Resultado de validateIntentionOptions()
 */
function updateIntentionSelector(validation = null) {
    console.log('🎯 Actualizando selector de intenciones...');
    
    if (!validation) {
        validation = validateIntentionOptions();
    }
    
    // Actualizar cada botón según su disponibilidad
    Object.keys(validation).forEach(intention => {
        const button = document.getElementById(`intention-${intention}`);
        const isAvailable = validation[intention].available;
        
        if (button) {
            if (isAvailable) {
                // Opción disponible
                button.disabled = false;
                button.classList.remove('disabled', 'option-unavailable');
                button.classList.add('option-available');
                button.title = '';
                console.log(`✅ ${intention}: Disponible`);
            } else {
                // Opción no disponible
                button.disabled = true;
                button.classList.add('disabled', 'option-unavailable');
                button.classList.remove('option-available');
                button.title = validation[intention].reason;
                console.log(`❌ ${intention}: ${validation[intention].reason}`);
            }
        }
    });
    
    // Actualizar indicadores visuales especiales
    updateIntentionIndicators(validation);
    
    console.log('✅ Selector de intenciones actualizado');
}

/**
 * Añade indicadores visuales adicionales a las opciones
 * @param {Object} validation - Resultado de validación
 */
function updateIntentionIndicators(validation) {
    // Añadir contador de opciones de robo disponibles
    const stealButton = document.getElementById('intention-steal');
    if (stealButton && validation.steal.available) {
        const optionsCount = validation.steal.availableOptions;
        const existingBadge = stealButton.querySelector('.options-badge');
        
        if (existingBadge) {
            existingBadge.textContent = optionsCount;
        } else {
            const badge = document.createElement('span');
            badge.className = 'options-badge badge bg-warning text-dark position-absolute top-0 end-0';
            badge.style.cssText = 'font-size: 0.7rem; transform: translate(25%, -25%);';
            badge.textContent = optionsCount;
            badge.title = `${optionsCount} opciones disponibles: ${validation.steal.details.join(', ')}`;
            
            stealButton.style.position = 'relative';
            stealButton.appendChild(badge);
        }
    } else if (stealButton) {
        // Remover badge si no hay opciones
        const existingBadge = stealButton.querySelector('.options-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
    }
}

/**
 * Función mejorada para mostrar el selector de intenciones con validación
 */
function showIntentionSelectorWithValidation() {
    console.log('🎯 Mostrando selector de intenciones con validación...');
    
    // Primero mostrar el selector normal
    showIntentionSelector();
    
    // Luego validar y actualizar opciones
    setTimeout(() => {
        updateIntentionSelector();
    }, 100); // Pequeño delay para asegurar que el DOM está listo
}

/**
 * Función de prueba para el sistema de validación
 * TEMPORAL - Para testing y demostración
 */
function testValidationSystem() {
    console.log('🧪 Ejecutando prueba del sistema de validación...');
    
    // Limpiar bases para empezar
    gameState.bases = { first: null, second: null, third: null };
    updateIntentionSelector();
    console.log('📍 Paso 1: Sin corredores - robo y hit&run deshabilitados');
    
    setTimeout(() => {
        // Añadir corredor en primera
        gameState.bases.first = { id: 'test1', name: 'Juan Pérez', team: 'visitante' };
        updateIntentionSelector();
        console.log('📍 Paso 2: Corredor en 1ª - robo (1 opción) y hit&run habilitados');
    }, 2000);
    
    setTimeout(() => {
        // Añadir corredor en segunda también
        gameState.bases.second = { id: 'test2', name: 'María García', team: 'visitante' };
        updateIntentionSelector();
        console.log('📍 Paso 3: Corredores en 1ª y 2ª - robo (3 opciones) incluyendo doble robo');
    }, 4000);
    
    setTimeout(() => {
        // Limpiar para volver al estado inicial
        gameState.bases = { first: null, second: null, third: null };
        updateIntentionSelector();
        console.log('📍 Paso 4: Vuelta al estado inicial');
    }, 6000);
}

// ===== SISTEMA DE DADOS AUTOMÁTICO =====

/*
  FUNCIONES PARA EL SISTEMA DE DADOS QUE FUNCIONA COMO UN RELOJ
  El jugador solo hace clic en "Tirar Dados" y todo se maneja automáticamente
*/

function updateDiceSystemPosition() {
    const visitanteContainer = document.getElementById('dice-container-visitante');
    const localContainer = document.getElementById('dice-container-local');
    const intentionContainer = document.getElementById('intention-container-visitante');

    if (!visitanteContainer || !localContainer) return;

    // IMPORTANTE: Si el selector de intenciones está visible, NO tocar el contenedor de dados del visitante
    const intentionVisible = intentionContainer &&
        intentionContainer.style.display !== 'none' &&
        intentionContainer.style.visibility !== 'hidden';

    console.log('🎯 updateDiceSystemPosition - Selector visible:', intentionVisible);

    if (gameState.isTopHalf) {
        // Visitante batea - mostrar en columna izquierda
        // PERO solo si el selector de intenciones NO está visible
        if (!intentionVisible) {
            visitanteContainer.style.display = 'block';
            console.log('✅ Contenedor visitante mostrado (sin selector activo)');
        } else {
            console.log('🎯 Selector activo - NO modificando contenedor visitante');
        }
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

    // Almacenar resultado en gameState para usarlo en resaltado de dropdowns
    gameState.currentDiceRoll = total;

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

    // Inicializar sistema de cascada con la tirada actual
    let resultType = '';
    if (total === 1) {
        resultType = 'oddity';
    } else if (total >= 2 && total <= 5) {
        resultType = 'critical-hit';
    } else if (total >= 6 && total <= 10) {
        resultType = 'ordinary-hit';
    } else if (total >= 11 && total <= 15) {
        resultType = 'walk';
    } else if (total >= 16 && total <= 20) {
        resultType = 'possible-error';
    } else if (total >= 21 && total <= 49) {
        resultType = 'productive-out-1';
    } else if (total >= 50 && total <= 69) {
        resultType = 'productive-out-2';
    } else if (total >= 70 && total <= 98) {
        resultType = 'out';
    } else if (total === 99) {
        resultType = 'oddity';
    } else if (total >= 100) {
        resultType = 'out';
    }

    // Activar sistema de cascada inmediatamente
    initializeCascade(total, resultType);

    // NO procesar automáticamente - esperar confirmación manual
    console.log(`🎲 Tirada completada: ${total} → ${resultType}`);
    console.log(`📋 Esperando confirmación manual...`);
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

    // NO ACTUALIZAR VISUALIZACIÓN - Puede interferir con dados visibles
    // updateGameDisplay(); // COMENTADO - Mantener dados visibles  
    // updateDiceSystemPosition(); // COMENTADO - Mantener dados visibles

    console.log(`✅ Inning cambiado sin resetear dados`);
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

    // ¡IMPORTANTE! Guardar el total en gameState para que funcione la cascada
    gameState.currentDiceRoll = total;
    console.log(`🎲 Total calculado y guardado en gameState: ${total}`);

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

    // NO LIMPIAR DADOS - Mantener visibles para referencia
    // clearDiceValues(team); // COMENTADO - Los dados permanecen visibles

    console.log(`✅ Resultado confirmado sin limpiar dados`);
}

function processGameResult(team, total, advanceRunner) {
    // PLACEHOLDER: Aquí iremos agregando la lógica en cascada
    console.log('🔄 Procesando resultado del juego...');

    let resultType = '';
    let isOut = false;

    // Determinar resultado basado en la tabla real de Swing Result
    if (total === 1) {
        resultType = 'oddity';
    } else if (total >= 2 && total <= 5) {
        resultType = 'critical-hit';
    } else if (total >= 6) {
        // Aquí necesitaríamos saber BT (Batting Trait) del jugador
        // Por ahora usaremos valores aproximados: BT = 10 para jugador promedio
        const estimatedBT = 10;
        const estimatedOBT = 15; // OBT típicamente BT + 5

        if (total <= estimatedBT) {
            resultType = 'ordinary-hit';
        } else if (total <= estimatedOBT) {
            resultType = 'walk';
        } else if (total <= estimatedOBT + 5) {
            resultType = 'possible-error';
        } else if (total >= estimatedOBT + 6 && total <= 49) {
            resultType = 'productive-out-1';
            isOut = true;
        } else if (total >= 50 && total <= 69) {
            resultType = 'productive-out-2';
            isOut = true;
        } else if (total >= 70) {
            if (total === 99) {
                resultType = 'oddity';
            } else if (total >= 100) {
                resultType = 'out'; // Posible triple play
                isOut = true;
            } else {
                resultType = 'out';
                isOut = true;
            }
        }
    }

    console.log(`   Tipo de resultado: ${resultType}`);

    // Inicializar sistema de cascada para resolución
    initializeCascade(total, resultType);

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
        console.log('   ⚾ Hit registrado - cascada activada');
        // La cascada manejará el resto de la resolución
        // nextBatter(); // Se llamará después de resolver la cascada
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
    const intentionContainer = document.getElementById('intention-container-visitante');

    // PRESERVAR resultados de dados antes de cambiar visibilidad
    const visitanteResults = document.getElementById('dice-results-display');
    const localResults = document.getElementById('dice-results-display-local');

    const visitanteWasVisible = visitanteResults && visitanteResults.style.display === 'block';
    const localWasVisible = localResults && localResults.style.display === 'block';

    // IMPORTANTE: Si el selector de intenciones está visible, NO tocar el contenedor de dados del visitante
    const intentionVisible = intentionContainer &&
        intentionContainer.style.display !== 'none' &&
        intentionContainer.style.visibility !== 'hidden';

    console.log('🎯 updateDiceSystemPosition [SEGUNDA] - Selector visible:', intentionVisible);

    if (gameState.isTopHalf) {
        // Visitante batea - mostrar en columna izquierda
        // PERO solo si el selector de intenciones NO está visible
        if (!intentionVisible) {
            visitanteContainer.style.display = 'block';
            console.log('✅ Contenedor visitante mostrado [SEGUNDA] (sin selector activo)');
        } else {
            console.log('🎯 Selector activo [SEGUNDA] - NO modificando contenedor visitante');
        }
        localContainer.style.display = 'none';
        updateBatterInfo('visitante');
    } else {
        // Local batea - mostrar en columna derecha  
        visitanteContainer.style.display = 'none';
        localContainer.style.display = 'block';
        updateBatterInfo('local');
    }

    // RESTAURAR resultados que estaban visibles
    if (visitanteWasVisible && visitanteResults) {
        visitanteResults.style.display = 'block';
        console.log(`🔄 Manteniendo dados visitante visibles`);
    }
    if (localWasVisible && localResults) {
        localResults.style.display = 'block';
        console.log(`🔄 Manteniendo dados local visibles`);
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

    // MOSTRAR INMEDIATAMENTE EL BOTÓN "SIGUIENTE BATEADOR"
    const confirmation = document.getElementById('cascade-confirmation');
    const confirmationText = document.getElementById('confirmation-text');
    if (confirmation && confirmationText) {
        confirmationText.textContent = 'Dados tirados. ¿Continuar al siguiente bateador?';
        confirmation.style.display = 'block';
        console.log(`🎯 Botón "Siguiente Bateador" mostrado inmediatamente`);
    }

    // NO HACER NADA AUTOMÁTICAMENTE - Solo mostrar el botón y esperar
    // El usuario debe presionar "Siguiente Bateador" para continuar
    console.log(`✅ Dados mostrados. Esperando confirmación del usuario...`);
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

// ===== SISTEMA DE CASCADA DE RESOLUCIÓN =====

/*
  FUNCIONES PARA EL SISTEMA DE CASCADA
  Maneja la resolución paso a paso de jugadas complejas
*/

// Mostrar el sistema de cascada (contenedor siempre visible)
function showCascadeSystem() {
    // El contenedor ya está siempre visible por CSS
    // Solo activamos la visualización de contenido
    console.log('📋 Sistema de cascada activado (contenedor siempre visible)');
}

// Ocultar solo los dropdowns (contenedor siempre visible)
function hideCascadeSystem() {
    const cascadeSystem = document.getElementById('cascade-system');
    if (cascadeSystem) {
        // NO ocultar el contenedor - solo los dropdowns
        // cascadeSystem.style.display = 'none'; // REMOVIDO

        // Ocultar y resetear todos los dropdowns con position fixed
        const dropdowns = cascadeSystem.querySelectorAll('.cascade-dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
            dropdown.classList.remove('show');
            // Resetear posicionamiento fixed
            dropdown.style.left = '';
            dropdown.style.top = '';
            dropdown.style.transform = '';
        });

        // Actualizar estado a esperando
        const cascadeStatus = document.getElementById('cascade-current-action');
        if (cascadeStatus) {
            cascadeStatus.textContent = 'Sistema activo - Esperando tirada...';
        }

        console.log('📋 Dropdowns ocultos y reseteados (contenedor permanece visible)');
    }
}

// Inicializar cascada con resultado inicial
function initializeCascade(result, resultType) {
    showCascadeSystem();

    // Actualizar estado de la cascada con nombres más legibles
    const cascadeStatus = document.getElementById('cascade-current-action');
    if (cascadeStatus) {
        const typeNames = {
            'oddity': 'Oddity - Evento especial',
            'critical-hit': 'Critical Hit - Golpe crítico',
            'ordinary-hit': 'Ordinary Hit - Golpe ordinario',
            'walk': 'Walk - Base por bolas',
            'possible-error': 'Possible Error - Posible error',
            'productive-out-1': 'Productive Out - Out productivo',
            'productive-out-2': 'Productive Out - Elección del fildeador',
            'out': 'Out - Eliminación'
        };
        const displayName = typeNames[resultType] || resultType;
        cascadeStatus.textContent = `Resolviendo: ${displayName}`;
    }

    // Mostrar resultado inicial
    const initialResult = document.getElementById('initial-result');
    if (initialResult) {
        initialResult.textContent = result;
    }

    console.log(`🎲 Cascada inicializada: ${result} → ${resultType}`);

    // Aquí se determinará si necesita más resolución
    checkForAdditionalResolution(resultType);
}

// Verificar si el resultado necesita resolución adicional
function checkForAdditionalResolution(resultType) {
    // Todos los tipos de la tabla de Swing Result necesitan mostrar el dropdown
    const allResultTypes = [
        'oddity', 'critical-hit', 'ordinary-hit', 'walk', 'possible-error',
        'productive-out-1', 'productive-out-2', 'out'
    ];

    if (allResultTypes.includes(resultType) || resultType) {
        console.log(`⚡ ${resultType} - Mostrando tabla de Swing Result`);
        showCascadeDropdown(1, resultType);
    } else {
        console.log(`✅ ${resultType} - Tipo no reconocido, manteniendo visible`);
        // NO ocultar automáticamente - esperar confirmación manual
    }
}

// Mostrar dropdown de opciones de cascada
function showCascadeDropdown(stepNumber, resultType) {
    console.log(`🔍 Intentando mostrar dropdown ${stepNumber} con tipo: ${resultType}`);

    const dropdown = document.getElementById(`cascade-dropdown-${stepNumber}`);
    console.log(`🔍 Dropdown encontrado:`, dropdown);

    if (dropdown) {
        // Generar opciones según el tipo de resultado usando la nueva cascada simplificada
        const options = generateSimpleCascade(gameState.currentDiceRoll);
        console.log(`🔍 Opciones generadas:`, options.substring(0, 100) + '...');

        dropdown.innerHTML = options;

        // Posicionamiento fixed para que aparezca por encima de TODO
        positionFixedDropdown(dropdown, stepNumber);

        dropdown.style.display = 'block';
        dropdown.classList.add('show');

        console.log(`🔽 Dropdown mostrado para paso ${stepNumber}: ${resultType}`);
        console.log(`🔍 Estilos del dropdown:`, dropdown.style.cssText);
    } else {
        console.error(`❌ No se encontró dropdown con ID: cascade-dropdown-${stepNumber}`);
    }
}

// Posicionar dropdown con position fixed por encima de todas las capas
function positionFixedDropdown(dropdown, stepNumber) {
    const step = document.getElementById(`cascade-step-${stepNumber}`);
    if (step) {
        const rect = step.getBoundingClientRect();

        // Posicionar encima del resultado inicial con más espacio para la tabla
        let targetTop = rect.top - 420; // Más arriba para mostrar toda la tabla

        // Asegurar que no salga de la pantalla por arriba
        const minTop = 10;
        if (targetTop < minTop) {
            targetTop = minTop;
        }

        // Calcular posición fija en la pantalla
        dropdown.style.left = `${rect.left + (rect.width / 2)}px`;
        dropdown.style.top = `${targetTop}px`;
        dropdown.style.transform = 'translateX(-50%)';

        console.log(`📍 Dropdown posicionado sin tapar el número: left=${dropdown.style.left}, top=${dropdown.style.top}`);
    }
} // Determinar qué fila de la tabla debe resaltarse basado en la tirada y datos del bateador
function getHighlightedRowIndex(diceRoll) {
    if (!diceRoll) return -1; // No resaltar si no hay tirada

    console.log(`🎯 Calculando resaltado para tirada: ${diceRoll}`);

    // Obtener datos del bateador actual
    const currentBatter = getCurrentBatter();
    if (!currentBatter) {
        console.warn('❌ No hay bateador actual, usando valores por defecto');
        return getHighlightedRowIndexDefault(diceRoll);
    }

    console.log(`🏏 Datos del bateador:`, currentBatter);

    // Extraer BT y OBT del bateador
    const rawBT = currentBatter.battingAvg || 0.250;
    const rawOBT = currentBatter.onBasePct || 0.320;

    console.log(`📊 Raw BT: ${rawBT}, Raw OBT: ${rawOBT}`);

    // CONVERSIÓN MEJORADA: Coger los dos primeros números desde la izquierda
    let bt, obt;

    // Convertir a string para poder manipular
    const btString = rawBT.toString();
    const obtString = rawOBT.toString();

    // Extraer los dos primeros dígitos significativos
    if (rawBT >= 1) {
        // Si es >= 1, tomar los dos primeros dígitos: 25 → 25, 347 → 34
        bt = Math.floor(rawBT / Math.pow(10, Math.floor(Math.log10(rawBT)) - 1));
        if (bt > 99) bt = Math.floor(bt / 10); // Si sale 347 → 34
    } else {
        // Si es decimal, extraer después del punto: 0.347 → 34, 0.280 → 28
        const afterDecimal = btString.split('.')[1] || '00';
        bt = parseInt(afterDecimal.substring(0, 2).padEnd(2, '0'));
    }

    if (rawOBT >= 1) {
        // Si es >= 1, tomar los dos primeros dígitos
        obt = Math.floor(rawOBT / Math.pow(10, Math.floor(Math.log10(rawOBT)) - 1));
        if (obt > 99) obt = Math.floor(obt / 10);
    } else {
        // Si es decimal, extraer después del punto: 0.412 → 41
        const afterDecimal = obtString.split('.')[1] || '00';
        obt = parseInt(afterDecimal.substring(0, 2).padEnd(2, '0'));
    }

    console.log(`🏏 Bateador: ${currentBatter.name}`);
    console.log(`📊 BT calculado: ${bt} (de ${rawBT}), OBT calculado: ${obt} (de ${rawOBT})`);
    console.log(`🎯 Rangos variables serán: 6-${bt}, ${bt + 1}-${obt}, ${obt + 1}-${obt + 5}, ${obt + 6}-49`); // LÓGICA SEGÚN TU EXPLICACIÓN:

    // RANGOS FIJOS (no dependen de stats)
    if (diceRoll === 1) {
        console.log(`✅ Tirada ${diceRoll} → Oddity (fijo)`);
        return 0;
    } else if (diceRoll >= 2 && diceRoll <= 5) {
        console.log(`✅ Tirada ${diceRoll} → Critical Hit (fijo)`);
        return 1;
    } else if (diceRoll >= 50 && diceRoll <= 69) {
        console.log(`✅ Tirada ${diceRoll} → Productive Out 50-69 (fijo)`);
        return 6;
    } else if (diceRoll >= 70 && diceRoll <= 98) {
        console.log(`✅ Tirada ${diceRoll} → Out 70-98 (fijo)`);
        return 7;
    } else if (diceRoll === 99) {
        console.log(`✅ Tirada ${diceRoll} → Oddity 99 (fijo)`);
        return 8;
    } else if (diceRoll >= 100) {
        console.log(`✅ Tirada ${diceRoll} → Out 100+ (fijo)`);
        return 9;
    }

    // RANGOS VARIABLES (dependen de BT y OBT)
    else if (diceRoll >= 6 && diceRoll <= bt) {
        console.log(`✅ Tirada ${diceRoll} → Hit Ordinario [6-${bt}] (variable)`);
        return 2;
    } else if (diceRoll >= (bt + 1) && diceRoll <= obt) {
        console.log(`✅ Tirada ${diceRoll} → Base por Bolas [${bt + 1}-${obt}] (variable)`);
        return 3;
    } else if (diceRoll >= (obt + 1) && diceRoll <= (obt + 5)) {
        console.log(`✅ Tirada ${diceRoll} → Posible Error [${obt + 1}-${obt + 5}] (variable)`);
        return 4;
    } else if (diceRoll >= (obt + 6) && diceRoll <= 49) {
        console.log(`✅ Tirada ${diceRoll} → Out Productivo [${obt + 6}-49] (variable)`);
        return 5;
    }

    console.log(`❌ Tirada ${diceRoll} no encaja en ningún rango`);
    return -1;
}

// Función de respaldo con valores por defecto si no hay bateador
function getHighlightedRowIndexDefault(diceRoll) {
    const defaultBT = 10;
    const defaultOBT = 15;

    if (diceRoll === 1) return 0;
    else if (diceRoll >= 2 && diceRoll <= 5) return 1;
    else if (diceRoll >= 6 && diceRoll <= defaultBT) return 2;
    else if (diceRoll >= (defaultBT + 1) && diceRoll <= defaultOBT) return 3;
    else if (diceRoll >= (defaultOBT + 1) && diceRoll <= (defaultOBT + 5)) return 4;
    else if (diceRoll >= (defaultOBT + 6) && diceRoll <= 49) return 5;
    else if (diceRoll >= 50 && diceRoll <= 69) return 6;
    else if (diceRoll >= 70 && diceRoll <= 98) return 7;
    else if (diceRoll === 99) return 8;
    else if (diceRoll >= 100) return 9;

    return -1;
}

// NUEVA CASCADA SIMPLIFICADA - FUNCIONA SIEMPRE
function generateSimpleCascade(diceRoll) {
    console.log(`🆕 NUEVA CASCADA SIMPLIFICADA - Tirada: ${diceRoll}`);

    if (!diceRoll) {
        console.warn('❌ No hay tirada de dados');
        return '<div>No hay tirada</div>';
    }

    // OBTENER DATOS DEL BATEADOR ACTUAL PARA RANGOS DINÁMICOS
    const currentBatter = getCurrentBatter();
    let bt = 25,
        obt = 32; // Valores por defecto

    if (currentBatter) {
        const rawBT = currentBatter.battingAvg || 0.250;
        const rawOBT = currentBatter.onBasePct || 0.320;

        // Usar la misma lógica de conversión que en getHighlightedRowIndex
        if (rawBT >= 1) {
            bt = Math.floor(rawBT / Math.pow(10, Math.floor(Math.log10(rawBT)) - 1));
            if (bt > 99) bt = Math.floor(bt / 10);
        } else {
            const afterDecimal = rawBT.toString().split('.')[1] || '00';
            bt = parseInt(afterDecimal.substring(0, 2).padEnd(2, '0'));
        }

        if (rawOBT >= 1) {
            obt = Math.floor(rawOBT / Math.pow(10, Math.floor(Math.log10(rawOBT)) - 1));
            if (obt > 99) obt = Math.floor(obt / 10);
        } else {
            const afterDecimal = rawOBT.toString().split('.')[1] || '00';
            obt = parseInt(afterDecimal.substring(0, 2).padEnd(2, '0'));
        }

        console.log(`🎯 Cascada usando BT: ${bt}, OBT: ${obt} para ${currentBatter.name}`);
    }

    // Rangos dinámicos basados en el bateador actual
    const swingResults = [
        { range: "1", event: "Oddity", result: "Roll 2d10 on Oddities table", highlighted: diceRoll === 1 },
        { range: "2-5", event: "Critical Hit", result: "Roll d20 on Hit table. Increase hit by one level", highlighted: diceRoll >= 2 && diceRoll <= 5 },
        { range: `6-${bt}`, event: "Ordinary Hit", result: "Roll d20 on Hit Table", highlighted: diceRoll >= 6 && diceRoll <= bt },
        { range: `${bt + 1}-${obt}`, event: "Walk", result: "Batter advances to first", highlighted: diceRoll >= (bt + 1) && diceRoll <= obt },
        { range: `${obt + 1}-${obt + 5}`, event: "Possible Error", result: "Roll d12 on Defense Table", highlighted: diceRoll >= (obt + 1) && diceRoll <= (obt + 5) },
        { range: `${obt + 6}-49`, event: "Productive Out", result: "Runners advance, batter may be safe", highlighted: diceRoll >= (obt + 6) && diceRoll <= 49 },
        { range: "50-69", event: "Productive Out", result: "Limited runner advancement", highlighted: diceRoll >= 50 && diceRoll <= 69 },
        { range: "70-98", event: "Out", result: "Standard out, limited advancement", highlighted: diceRoll >= 70 && diceRoll <= 98 },
        { range: "99", event: "Oddity", result: "Roll 2d10 on Oddities table", highlighted: diceRoll === 99 },
        { range: "100+", event: "Out", result: "Possible triple play", highlighted: diceRoll >= 100 }
    ];

    let html = '<div class="simple-cascade-table">';
    html += `<div class="table-header">📊 SWING RESULT - TIRADA: ${diceRoll} | ${currentBatter ? currentBatter.name : 'Jugador'} (BT:${bt}, OBT:${obt})</div>`;

    swingResults.forEach((row, index) => {
        const highlightClass = row.highlighted ? 'highlighted-row' : '';
        const highlightStyle = row.highlighted ?
            'style="background-color: #ff0000 !important; color: #ffffff !important; border: 3px solid #ffff00 !important; font-weight: bold !important; transform: scale(1.05) !important; box-shadow: 0 0 15px #ffff00 !important;"' :
            '';

        html += `
            <div class="cascade-row ${highlightClass}" ${highlightStyle} onclick="selectResult('${row.event}', '${row.result}')">
                <div class="range-col">${row.range}</div>
                <div class="event-col">${row.event}</div>
                <div class="result-col">${row.result}</div>
            </div>
        `;

        if (row.highlighted) {
            console.log(`🎯 RESALTADO: Fila ${index} - ${row.range} - ${row.event}`);
        }
    });

    html += '</div>';
    return html;
}

// Función para seleccionar resultado
function selectResult(event, result) {
    console.log(`✅ Resultado seleccionado: ${event} - ${result}`);

    // Mostrar confirmación
    const confirmation = document.getElementById('cascade-confirmation');
    if (confirmation) {
        confirmation.style.display = 'block';
        confirmation.innerHTML = `
            <div style="background: #1e293b; color: white; padding: 1rem; border-radius: 8px; border: 2px solid #059669;">
                <h3>🎯 Resultado: ${event}</h3>
                <p>${result}</p>
                <button onclick="confirmAndNextBatter()" style="background: #059669; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; margin-right: 0.5rem;">✅ Confirmar y Siguiente Bateador</button>
                <button onclick="cancelSelection()" style="background: #dc2626; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px;">❌ Cancelar</button>
            </div>
        `;
    }
}

// Función para cancelar selección
function cancelSelection() {
    const confirmation = document.getElementById('cascade-confirmation');
    if (confirmation) {
        confirmation.style.display = 'none';
    }
}

// Resolver opción seleccionada de cascada
function resolveCascadeOption(option) {
    console.log(`🎯 Opción seleccionada: ${option}`);

    // Aquí es donde aparecería el dado flotante
    // TODO: Implementar dado flotante en el Paso 2

    // Por ahora, solo registrar la selección
    console.log(`✅ Opción ${option} registrada`);

    // Mostrar botón de confirmación para siguiente bateador
    showNextBatterConfirmation(option);
}

// Mostrar el botón de confirmación para avanzar al siguiente bateador
function showNextBatterConfirmation(selectedOption) {
    const confirmation = document.getElementById('cascade-confirmation');
    const confirmationText = document.getElementById('confirmation-text');

    if (confirmation && confirmationText) {
        // Personalizar el mensaje según la opción seleccionada
        const optionMessages = {
            'roll-oddity': 'Oddity procesado. ¿Continuar al siguiente bateador?',
            'roll-hit-table-critical': 'Critical Hit resuelto. ¿Continuar al siguiente bateador?',
            'roll-hit-table': 'Hit procesado. ¿Continuar al siguiente bateador?',
            'batter-walk': 'Base por bolas completada. ¿Continuar al siguiente bateador?',
            'roll-defense': 'Verificación defensiva completada. ¿Continuar al siguiente bateador?',
            'productive-out-1': 'Out productivo resuelto. ¿Continuar al siguiente bateador?',
            'productive-out-2': 'Out productivo resuelto. ¿Continuar al siguiente bateador?',
            'normal-out': 'Out completado. ¿Continuar al siguiente bateador?',
            'triple-play-out': 'Triple play procesado. ¿Continuar al siguiente bateador?'
        };

        const message = optionMessages[selectedOption] || 'Jugada resuelta. ¿Continuar al siguiente bateador?';
        confirmationText.textContent = message;

        confirmation.style.display = 'block';

        console.log(`🎯 Botón de confirmación mostrado: ${message}`);
    }
}

// Confirmar jugada y avanzar al siguiente bateador
function confirmAndNextBatter() {
    console.log(`🔄 Confirmando jugada y avanzando al siguiente bateador...`);

    // Determinar si fue out para procesar outs/innings
    const currentRoll = gameState.currentDiceRoll;
    let wasOut = false;

    if (currentRoll) {
        // Basado en los rangos de la tabla
        if ((currentRoll >= 21 && currentRoll <= 49) ||
            (currentRoll >= 50 && currentRoll <= 69) ||
            (currentRoll >= 70 && currentRoll <= 98) ||
            (currentRoll >= 100)) {
            wasOut = true;
        }
    }

    // Procesar outs si corresponde
    if (wasOut) {
        gameState.outs++;
        console.log(`📊 Out registrado. Total outs: ${gameState.outs}`);

        if (gameState.outs >= 3) {
            console.log(`🔄 Cambio de inning`);
            changeInning();
        } else {
            console.log(`➡️ Avanzar al siguiente bateador`);
            nextBatter();
        }
    } else {
        console.log(`➡️ Hit/Walk - Avanzar al siguiente bateador`);
        nextBatter();
    }

    // LIMPIAR TIRADA ACTUAL (NO RESETEO COMPLETO)
    console.log(`🧹 LIMPIANDO tirada actual - CONSERVANDO datos del juego...`);

    // TODO: Más tarde - GUARDAR la tirada actual en un registro/historial de bateadores
    // const baterRecord = {
    //     batter: getCurrentBatter(),
    //     diceRoll: gameState.currentDiceRoll,
    //     result: selectedOption,
    //     inning: gameState.currentInning,
    //     timestamp: Date.now()
    // };
    // gameState.batterHistory.push(baterRecord); // IMPLEMENTAR MÁS TARDE

    // 1. OCULTAR VISUALMENTE los dados (pero mantener datos)
    hideCurrentDiceResults();

    // 2. LIMPIAR campos de dados del lanzador y bateador (preparar para siguiente turno)
    console.log(`🧹 Limpiando campos de dados para siguiente bateador...`);

    const diceInputIds = [
        'pitcher-dice-value',
        'batter-dice-value',
        'pitcher-dice-value-local',
        'batter-dice-value-local'
    ];

    diceInputIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.value = '';
            console.log(`✅ Campo de dados limpiado: ${id}`);
        }
    });

    // 3. LIMPIAR totales mostrados (el número grande que se ve)
    const finalResultIds = [
        'final-result',
        'final-result-local'
    ];

    finalResultIds.forEach(id => {
        const resultElement = document.getElementById(id);
        if (resultElement) {
            resultElement.textContent = '-';
            console.log(`✅ Total limpiado: ${id}`);
        }
    });

    // 4. RESETEAR descripciones de resultados (preparar para nueva tirada)
    const resultDescriptionIds = [
        'dice-result-description',
        'dice-result-description-local'
    ];

    resultDescriptionIds.forEach(id => {
        const description = document.getElementById(id);
        if (description) {
            description.textContent = 'Esperando tirada...';
            console.log(`✅ Descripción limpiada: ${id}`);
        }
    });

    // 4. LIMPIAR la cascada visual (pero conservar el estado del juego)
    resetCascadeSystemComplete();

    // 5. LIMPIAR variables de la tirada actual (preparar para siguiente bateador)
    gameState.currentDiceRoll = null;
    gameState.lastRollDetails = null;

    // 6. ACTUALIZAR display (mantiene marcador, innings, etc.)
    updateGameDisplay();
    updateDiceSystemPosition();

    // 7. MOSTRAR SELECTOR DE INTENCIONES para el próximo bateador
    console.log('🎯 Mostrando selector de intenciones para el próximo bateador...');
    resetIntentionSelector();
}

// FUNCIÓN MEJORADA - Solo oculta dados específicos, NO elementos del DOM principal
function hideAllDiceEverywhere() {
    console.log(`🧹 Reseteo selectivo de dados (NO elementos principales)`);

    // 1. Lista específica de IDs de dados (solo estos)
    const specificDiceIds = [
        'dice-results-display',
        'dice-results-display-local',
        'dice-container-visitante',
        'dice-container-local'
    ];

    specificDiceIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
            console.log(`✅ Ocultado ID específico: ${id}`);
        }
    });

    // 2. Solo contenedores dinámicos de dados (con clase específica)
    const dynamicDiceContainers = document.querySelectorAll('.dynamic-dice-container');
    dynamicDiceContainers.forEach(container => {
        container.style.display = 'none';
        console.log(`✅ Contenedor dinámico ocultado:`, container.id);
    });

    // 3. NO TOCAR elementos principales del DOM (evitar pantalla en blanco)
    // NO buscar por texto - puede ocultar elementos importantes

    console.log(`🎉 Reseteo selectivo completado (DOM principal intacto)`);
}

// Resetear completamente el sistema de cascada
function resetCascadeSystem() {
    // Ocultar confirmación
    const confirmation = document.getElementById('cascade-confirmation');
    if (confirmation) {
        confirmation.style.display = 'none';
    }

    // Ocultar dropdown
    hideCascadeSystem();

    // Resetear resultado inicial
    const initialResult = document.getElementById('initial-result');
    if (initialResult) {
        initialResult.textContent = '-';
    }

    // Resetear estado
    const cascadeStatus = document.getElementById('cascade-current-action');
    if (cascadeStatus) {
        cascadeStatus.textContent = 'Sistema activo - Esperando tirada...';
    }

    // NO ocultar resultados de dados - deben permanecer visibles hasta el reset
    // Las tiradas permanecen visibles para referencia

    // Limpiar tirada actual
    gameState.currentDiceRoll = null;

    console.log(`🔄 Sistema de cascada completamente reseteado`);
}

// Reseteo COMPLETO del sistema para "Siguiente Bateador"
function resetCascadeSystemComplete() {
    console.log(`🧹 Iniciando reseteo completo del sistema...`);

    // 1. OCULTAR Y RESETEAR CONFIRMACIÓN
    const confirmation = document.getElementById('cascade-confirmation');
    if (confirmation) {
        confirmation.style.display = 'none';
        console.log(`✅ Confirmación ocultada`);
    }

    // 2. OCULTAR Y RESETEAR DROPDOWN/CASCADA
    hideCascadeSystem();
    console.log(`✅ Sistema de cascada ocultado`);

    // 3. RESETEAR RESULTADO INICIAL
    const initialResult = document.getElementById('initial-result');
    if (initialResult) {
        initialResult.textContent = '-';
        console.log(`✅ Resultado inicial reseteado`);
    }

    // 4. RESETEAR ESTADO DE CASCADA
    const cascadeStatus = document.getElementById('cascade-current-action');
    if (cascadeStatus) {
        cascadeStatus.textContent = 'Sistema activo - Esperando tirada...';
        console.log(`✅ Estado de cascada reseteado`);
    }

    // 5. LIMPIAR CONTENIDO DE OPCIONES DE CASCADA
    const cascadeOptions = document.getElementById('cascade-options');
    if (cascadeOptions) {
        cascadeOptions.innerHTML = '';
        console.log(`✅ Opciones de cascada limpiadas`);
    }

    // 6. RESETEAR VARIABLES GLOBALES RELACIONADAS
    if (window.currentCascadeLevel) {
        window.currentCascadeLevel = 0;
        console.log(`✅ Nivel de cascada reseteado`);
    }

    // 7. OCULTAR CUALQUIER TABLA DE SWING RESULT
    const swingTables = document.querySelectorAll('.swing-result-table');
    swingTables.forEach(table => {
        if (table.parentElement) {
            table.parentElement.style.display = 'none';
        }
    });
    console.log(`✅ Tablas de swing result ocultadas`);

    // 8. LIMPIAR CUALQUIER DROPDOWN ACTIVO
    const cascadeDropdown = document.getElementById('cascade-dropdown');
    if (cascadeDropdown) {
        cascadeDropdown.style.display = 'none';
        cascadeDropdown.innerHTML = '';
        console.log(`✅ Dropdown de cascada limpiado`);
    }

    console.log(`🎉 Reseteo completo finalizado`);
}

// LIMPIAR SOLO LA TIRADA ACTUAL (para siguiente bateador) - CONSERVA DATOS DEL JUEGO
function hideCurrentDiceResults() {
    console.log(`🧹 Ocultando tirada actual (conservando datos del juego)...`);

    const team = gameState.isTopHalf ? 'visitante' : 'local';

    // Buscar elementos de dados del equipo actual solamente
    const resultsDisplay = document.getElementById(`dice-results-display${team === 'local' ? '-local' : ''}`);
    if (resultsDisplay) {
        resultsDisplay.style.display = 'none';
        console.log(`✅ Resultados de dados ocultados para ${team}`);
    }

    // Buscar contenedores dinámicos de dados MÁS RECIENTES solamente (EXCLUIR SELECTOR DE INTENCIONES)
    const dynamicContainers = document.querySelectorAll('.dynamic-dice-container:not(.intention-selector)');
    let hiddenCount = 0;
    dynamicContainers.forEach(container => {
        // Solo ocultar los 2 más recientes (no todo el historial)
        if (hiddenCount < 2 && container.style.display !== 'none') {
            container.style.display = 'none';
            hiddenCount++;
            console.log(`✅ Contenedor dinámico reciente ocultado`);
        }
    });

    console.log(`🎯 Tirada actual limpiada (datos del juego conservados)`);

    // Mostrar selector de intenciones para el siguiente bateador
    // (Solo si no es un reinicio completo)
    setTimeout(() => {
        resetIntentionSelector();
        console.log('🎯 Selector de intenciones mostrado para siguiente bateador');
    }, 200);
}

// ===== SISTEMA DE SELECCIÓN DE INTENCIONES =====

/**
 * Maneja la selección de intención del bateador
 * @param {string} intention - La intención seleccionada ('normal', 'steal', 'bunt', 'hitrun')
 */
function selectIntention(intention) {
    console.log(`🎯 Intención seleccionada: ${intention}`);

    // Guardar la intención en el gameState para uso futuro
    gameState.currentIntention = intention;

    switch (intention) {
        case 'normal':
            // Batear Normal: Mostrar sistema de dados
            console.log('⚾ Activando sistema de bateo normal...');
            showDiceSystem();
            break;

        case 'steal':
            console.log('🏃‍♂️ Intención de robar base seleccionada');
            showStealBaseSystem();
            break;

        case 'bunt':
            console.log('🤏 Intención de toque/bunt seleccionada');
            alert('🤏 Sistema de toque/bunt - Por implementar');
            break;

        case 'hitrun':
            console.log('⚡ Intención de hit & run seleccionada');
            alert('⚡ Sistema de hit & run - Por implementar');
            break;

        default:
            console.error(`❌ Intención desconocida: ${intention}`);
    }
}

/**
 * Función simple para mostrar el sistema de dados y ocultar el selector
 */
function showDiceSystem() {
    console.log('🎲 [FORZADO] Mostrando sistema de dados...');

    const intentionContainer = document.getElementById('intention-container-visitante');
    const diceContainer = document.getElementById('dice-container-visitante');

    console.log('   - intentionContainer encontrado:', !!intentionContainer);
    console.log('   - diceContainer encontrado:', !!diceContainer);

    // PASO 1: Ocultar selector de manera agresiva
    if (intentionContainer) {
        intentionContainer.style.cssText = 'display: none !important; opacity: 0 !important; visibility: hidden !important;';
        console.log('✅ Selector FORZADAMENTE ocultado');
    }

    // PASO 2: Mostrar dados de manera súper agresiva
    if (diceContainer) {
        // Remover cualquier estilo inline que pueda estar ocultando
        diceContainer.removeAttribute('style');

        // Aplicar estilos forzados
        diceContainer.style.cssText = `
            display: block !important; 
            opacity: 1 !important; 
            visibility: visible !important; 
            position: relative !important; 
            z-index: 10 !important;
            background: linear-gradient(135deg, #1a2332 0%, #0f172a 100%) !important;
            border-radius: 20px !important;
            border: 3px solid #374151 !important;
            margin-top: 1rem !important;
            padding: 1.5rem !important;
        `;

        // Forzar visibilidad de contenido interno
        const diceSystem = diceContainer.querySelector('.dice-system');
        if (diceSystem) {
            diceSystem.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
            console.log('✅ Sistema de dados interno FORZADO visible');
        }

        // Forzar visibilidad de todos los elementos hijos
        const allChildren = diceContainer.querySelectorAll('*');
        allChildren.forEach(child => {
            if (child.style.display === 'none') {
                child.style.display = '';
            }
        });

        console.log('✅ Sistema de dados FORZADAMENTE mostrado');
        console.log('   - Display final:', diceContainer.style.display);
        console.log('   - Opacity final:', diceContainer.style.opacity);
        console.log('   - Visibility final:', diceContainer.style.visibility);

        // Verificar que realmente esté visible
        setTimeout(() => {
            const computedStyle = window.getComputedStyle(diceContainer);
            console.log('🔍 Estilo computado final:', {
                display: computedStyle.display,
                opacity: computedStyle.opacity,
                visibility: computedStyle.visibility
            });
        }, 100);

    } else {
        console.error('❌ No se encontró dice-container-visitante');
        // Buscar contenedores similares
        const similarContainers = document.querySelectorAll('[id*="dice"]');
        console.log('🔍 Contenedores con "dice" encontrados:', similarContainers.length);
        similarContainers.forEach((container, index) => {
            console.log(`   - ${index}: ${container.id} (display: ${container.style.display})`);
        });
    }
}

/**
 * Activa el sistema de dados normal (el que ya existía)
 */
function showNormalDiceSystem() {
    console.log('🎲 Activando sistema de dados normal...');

    const diceContainer = document.getElementById('dice-container-visitante');

    if (!diceContainer) {
        console.error('❌ No se encontró el contenedor de dados');
        return;
    }

    // Asegurarse de que el contenedor de dados esté visible
    diceContainer.style.display = 'block';
    diceContainer.style.opacity = '0';
    diceContainer.style.transform = 'translateY(20px)';
    diceContainer.style.transition = 'all 0.5s ease-out';

    // Animar la entrada del sistema de dados
    setTimeout(() => {
        diceContainer.style.opacity = '1';
        diceContainer.style.transform = 'translateY(0)';
    }, 100);

    // Cargar el sistema de dados normal si no está cargado
    if (!diceContainer.innerHTML.trim()) {
        console.log('🔄 Cargando sistema de dados normal...');
        // Aquí podríamos llamar a la función que ya existe para cargar el sistema de dados
        // Por ahora, asumamos que ya está cargado en el HTML
    }

    console.log('✅ Sistema de dados normal activado');
}

/**
 * Resetea el selector de intenciones (para volver a mostrar las opciones)
 */
/**
 * Función simple para mostrar el selector de intenciones y ocultar dados
 */
function showIntentionSelector() {
    console.log('🎯 [FORZADO] Mostrando selector de intenciones...');

    const intentionContainer = document.getElementById('intention-container-visitante');
    const diceContainer = document.getElementById('dice-container-visitante');

    // PASO 1: Ocultar dados de manera agresiva
    if (diceContainer) {
        diceContainer.style.cssText = 'display: none !important; opacity: 0 !important; visibility: hidden !important;';
        console.log('✅ Sistema de dados FORZADAMENTE ocultado');
    }

    // PASO 2: Mostrar selector de manera súper agresiva
    if (intentionContainer) {
        // Remover cualquier estilo inline que pueda estar ocultando
        intentionContainer.removeAttribute('style');

        // Aplicar estilos forzados
        intentionContainer.style.cssText = `
            display: block !important; 
            opacity: 1 !important; 
            visibility: visible !important; 
            position: relative !important; 
            z-index: 15 !important;
        `;

        // Forzar visibilidad de todos los botones internos
        const buttons = intentionContainer.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
        });

        console.log('✅ Selector de intenciones FORZADAMENTE mostrado');

        // Verificar que realmente esté visible
        setTimeout(() => {
            const computedStyle = window.getComputedStyle(intentionContainer);
            console.log('🔍 Estilo computado del selector:', {
                display: computedStyle.display,
                opacity: computedStyle.opacity,
                visibility: computedStyle.visibility
            });
        }, 100);

    } else {
        console.error('❌ No se encontró intention-container-visitante');

        // Buscar contenedores similares
        const similarContainers = document.querySelectorAll('[id*="intention"]');
        console.log('🔍 Contenedores con "intention" encontrados:', similarContainers.length);
        similarContainers.forEach((container, index) => {
            console.log(`   - ${index}: ${container.id} (display: ${container.style.display})`);
        });
    }

    // Limpiar la intención del gameState
    gameState.currentIntention = null;
    console.log('🧹 Estado de intención limpiado');
    
    // NUEVO: Validar y actualizar opciones disponibles
    setTimeout(() => {
        updateIntentionSelector();
        console.log('🎯 Validación de opciones aplicada');
    }, 150); // Delay para asegurar que el DOM está completamente renderizado
}

/**
 * Resetea el selector de intenciones (alias para compatibilidad)
 */
function resetIntentionSelector() {
    console.log('🔄 Reseteando selector de intenciones...');
    showIntentionSelector();
    console.log('✅ Selector de intenciones reseteado');
}

// ===== SISTEMA DE ROBO DE BASES =====

/**
 * Sistema principal de robo de bases
 * Detecta corredores en bases y presenta opciones de robo
 */
function showStealBaseSystem() {
    console.log('🏃‍♂️ Iniciando sistema de robo de bases...');

    // Ocultar selector de intenciones
    const intentionContainer = document.getElementById('intention-container-visitante');
    if (intentionContainer) {
        intentionContainer.style.display = 'none';
        console.log('✅ Selector de intenciones ocultado');
    }

    // Detectar corredores disponibles para robar
    const availableRunners = detectAvailableRunners();

    if (availableRunners.length === 0) {
        // No hay corredores en base
        alert('🚫 No hay corredores en base para intentar robo');
        showIntentionSelector(); // Volver al selector
        return;
    }

    // Mostrar interfaz de selección de robo
    showStealSelectionInterface(availableRunners);
}

/**
 * Detecta qué corredores están disponibles para robar bases
 * Implementa las 4 tablas de robo: 1B, 2B, 3B (S+), Doble robo
 */
function detectAvailableRunners() {
    const runners = [];

    console.log('🔍 Detectando corredores en bases:', gameState.bases);

    // TABLA 1: Corredor en primera base → segunda base
    if (gameState.bases.first !== null) {
        runners.push({
            runner: gameState.bases.first,
            fromBase: 'first',
            toBase: 'second',
            stealType: 'first_to_second',
            displayName: '1ª → 2ª Base',
            icon: '🥇➡️🥈',
            table: 'Tabla 1: Robo de 2ª'
        });
        console.log('✅ Corredor en 1ª base (Tabla 1: Robo de 2ª)');
    }

    // TABLA 2: Corredor en segunda base → tercera base
    if (gameState.bases.second !== null) {
        runners.push({
            runner: gameState.bases.second,
            fromBase: 'second',
            toBase: 'third',
            stealType: 'second_to_third',
            displayName: '2ª → 3ª Base',
            icon: '🥈➡️🥉',
            table: 'Tabla 2: Robo de 3ª'
        });
        console.log('✅ Corredor en 2ª base (Tabla 2: Robo de 3ª)');
    }

    // TABLA 3: Corredor en tercera base → home (solo con trait S+)
    if (gameState.bases.third !== null) {
        const thirdBaseRunner = gameState.bases.third;
        // TODO: Verificar trait S+ cuando implementemos traits
        const hasSPlusTrait = thirdBaseRunner.traits?.includes('S+') || false;

        if (hasSPlusTrait) {
            runners.push({
                runner: thirdBaseRunner,
                fromBase: 'third',
                toBase: 'home',
                stealType: 'third_to_home',
                displayName: '3ª → Home (S+)',
                icon: '🥉➡️🏠',
                table: 'Tabla 3: Robo de Home',
                requiresTrait: 'S+'
            });
            console.log('✅ Corredor en 3ª base con S+ (Tabla 3: Robo de Home)');
        } else {
            console.log('⚠️ Corredor en 3ª base SIN trait S+ - no puede robar home');
        }
    }

    // TABLA 4: Doble robo (corredores en 1ª y 2ª simultáneamente)
    if (gameState.bases.first !== null && gameState.bases.second !== null) {
        runners.push({
            runner: null, // Múltiples corredores
            runners: [gameState.bases.first, gameState.bases.second],
            fromBase: 'first_and_second',
            toBase: 'second_and_third',
            stealType: 'double_steal',
            displayName: 'Doble Robo (1ª→2ª, 2ª→3ª)',
            icon: '🥇🥈➡️🥈🥉',
            table: 'Tabla 4: Doble Robo'
        });
        console.log('✅ Doble robo disponible (Tabla 4)');
    }

    console.log(`🏃‍♂️ Total opciones de robo: ${runners.length}`);
    return runners;
}

/**
 * Muestra la interfaz de selección de robo con los corredores disponibles
 */
function showStealSelectionInterface(availableRunners) {
    console.log('🎯 Mostrando interfaz de selección de robo...');

    // Obtener o crear contenedor para el sistema de robo
    const diceContainer = document.getElementById('dice-container-visitante');

    if (!diceContainer) {
        console.error('❌ No se encontró contenedor de dados');
        return;
    }

    // Crear HTML para la interfaz de robo
    const stealHTML = createStealInterfaceHTML(availableRunners);

    // Reemplazar contenido del contenedor de dados
    diceContainer.innerHTML = stealHTML;

    // Mostrar el contenedor
    diceContainer.style.cssText = `
        display: block !important; 
        opacity: 1 !important; 
        visibility: visible !important; 
        position: relative !important; 
        z-index: 10 !important;
    `;

    console.log('✅ Interfaz de robo de bases mostrada');
}

/**
 * Crea el HTML para la interfaz de selección de robo
 */
function createStealInterfaceHTML(availableRunners) {
    let runnersHTML = '';

    availableRunners.forEach((runner, index) => {
        // Información del corredor/corredores
        let runnerInfo = '';
        if (runner.stealType === 'double_steal') {
            runnerInfo = `
                <div class="steal-runners">
                    <small>1ª Base: ${runner.runners[0]?.name || 'Desconocido'}</small><br>
                    <small>2ª Base: ${runner.runners[1]?.name || 'Desconocido'}</small>
                </div>
            `;
        } else {
            runnerInfo = `<small>Corredor: ${runner.runner?.name || 'Desconocido'}</small>`;
        }

        // Indicador de trait requerido
        const traitIndicator = runner.requiresTrait ?
            `<span class="trait-required">⭐ Requiere ${runner.requiresTrait}</span>` : '';

        runnersHTML += `
            <div class="steal-option" onclick="selectStealAttempt('${runner.fromBase}', '${runner.toBase}', ${index})">
                <div class="steal-option-header">
                    <div class="steal-icon">${runner.icon}</div>
                    <div class="steal-table-info">
                        <small class="steal-table-name">${runner.table}</small>
                    </div>
                </div>
                <div class="steal-description">
                    <strong>${runner.displayName}</strong>
                    ${runnerInfo}
                    ${traitIndicator}
                </div>
            </div>
        `;
    });

    return `
        <div class="steal-base-system">
            <div class="steal-header">
                <h3>🏃‍♂️ Selecciona el Tipo de Robo</h3>
                <p>Elige qué corredor(es) intentará(n) robar base:</p>
                <small class="text-muted">Cada opción usa una tabla de robo diferente</small>
            </div>
            
            <div class="steal-runners-grid">
                ${runnersHTML}
            </div>
            
            <div class="steal-actions">
                <button class="btn btn-secondary" onclick="cancelStealAttempt()">
                    ↩️ Cancelar
                </button>
            </div>
        </div>
    `;
}

/**
 * Maneja la selección de un intento de robo específico
 */
function selectStealAttempt(fromBase, toBase, runnerIndex) {
    console.log(`🎯 Intento de robo seleccionado: ${fromBase} → ${toBase}`);

    const availableRunners = detectAvailableRunners();
    const selectedSteal = availableRunners[runnerIndex];

    // Guardar información del robo en el gameState
    gameState.currentStealAttempt = {
        fromBase: fromBase,
        toBase: toBase,
        runnerIndex: runnerIndex,
        stealType: selectedSteal.stealType,
        table: selectedSteal.table,
        runner: selectedSteal.runner,
        runners: selectedSteal.runners // Para doble robo
    };

    console.log('💾 Información del robo guardada:', gameState.currentStealAttempt);

    // Mostrar sistema de dados para el robo
    showStealDiceSystem(selectedSteal);
}

/**
 * Cancela el intento de robo y vuelve al selector de intenciones
 */
function cancelStealAttempt() {
    console.log('❌ Intento de robo cancelado');

    // Limpiar información del robo
    gameState.currentStealAttempt = null;

    // Volver al selector de intenciones
    showIntentionSelector();
}

/**
 * Función temporal para probar el sistema de robo con corredores ficticios
 */
function testStealSystem() {
    console.log('🧪 Configurando corredores de prueba para el sistema de robo...');

    // Agregar corredores ficticios para probar
    gameState.bases.first = { name: 'Corredor 1ª', traits: [] };
    gameState.bases.second = { name: 'Corredor 2ª', traits: [] };
    gameState.bases.third = { name: 'Corredor 3ª S+', traits: ['S+'] };

    console.log('✅ Corredores de prueba configurados:', gameState.bases);

    // Mostrar el sistema de robo
    showStealBaseSystem();
}

/**
 * Obtiene la información del dado según el tipo de robo
 * TABLA 1: d8, TABLA 2: d8-1, TABLA 3: d8-1, TABLA 4: d8
 */
function getDiceInfoForStealType(stealType) {
    switch (stealType) {
        case 'first_to_second':
            return {
                description: 'd8',
                range: '1-8',
                min: 1,
                max: 8,
                modifier: null
            };

        case 'second_to_third':
            return {
                description: 'd8-1',
                range: '1-8 (luego -1)',
                min: 1,
                max: 8,
                modifier: '-1 al resultado'
            };

        case 'third_to_home':
            return {
                description: 'd8-1 (S+ requerido)',
                range: '1-8 (luego -1)',
                min: 1,
                max: 8,
                modifier: '-1 al resultado, Solo con trait S+'
            };

        case 'double_steal':
            return {
                description: 'd8 (Doble Robo)',
                range: '1-8',
                min: 1,
                max: 8,
                modifier: 'Afecta ambos corredores'
            };

        default:
            return {
                description: 'd8',
                range: '1-8',
                min: 1,
                max: 8,
                modifier: null
            };
    }
}

/**
 * Maneja la tirada del dado para el intento de robo
 * Similar al sistema de dados normal pero con lógica específica de robo
 */
function rollStealAttempt() {
    console.log('🎲 Ejecutando tirada de robo...');

    const diceInput = document.getElementById('steal-dice-value');
    const resultArea = document.getElementById('steal-result-area');
    const resultText = document.getElementById('steal-result-text');

    if (!diceInput || !resultArea || !resultText) {
        console.error('❌ No se encontraron elementos de la interfaz');
        return;
    }

    const diceValue = parseInt(diceInput.value);
    const stealInfo = gameState.currentStealAttempt;
    const diceInfo = getDiceInfoForStealType(stealInfo.stealType);

    if (!diceValue || diceValue < diceInfo.min || diceValue > diceInfo.max) {
        alert(`⚠️ Por favor ingresa un valor de dado válido (${diceInfo.range})`);
        return;
    }

    // Aplicar modificador para d8-1 en segunda a tercera Y tercera a home
    let finalValue = diceValue;
    if (stealInfo.stealType === 'second_to_third' || stealInfo.stealType === 'third_to_home') {
        finalValue = Math.max(0, diceValue - 1); // d8-1, mínimo 0
        console.log(`🔧 Aplicando modificador d8-1: ${diceValue} - 1 = ${finalValue}`);
    }

    console.log(`🎲 Valor del dado: ${diceValue}, Valor final: ${finalValue}`);

    // Evaluar resultado del robo (por ahora sistema básico)
    const isSuccessful = evaluateStealResult(finalValue, stealInfo.stealType);

    // Mostrar resultado
    resultArea.style.display = 'block';

    if (isSuccessful) {
        resultText.innerHTML = `
            <div class="alert alert-success">
                <strong>✅ ROBO EXITOSO!</strong><br>
                ${getSuccessMessage(stealInfo)}
                <br><small>Dado: ${diceValue}${(stealInfo.stealType === 'second_to_third' || stealInfo.stealType === 'third_to_home') ? ` - 1 = ${finalValue}` : ` = ${finalValue}`}</small>
            </div>
        `;
        
        console.log('✅ Robo exitoso');
        
    } else {
        resultText.innerHTML = `
            <div class="alert alert-danger">
                <strong>❌ ROBO FALLIDO!</strong><br>
                ${getFailureMessage(stealInfo)}
                <br><small>Dado: ${diceValue}${(stealInfo.stealType === 'second_to_third' || stealInfo.stealType === 'third_to_home') ? ` - 1 = ${finalValue}` : ` = ${finalValue}`}</small>
            </div>
        `;
        
        console.log('❌ Robo fallido');
    }
    
    // Agregar botón para continuar
    resultText.innerHTML += `
        <div class="steal-continue">
            <button class="btn btn-primary" onclick="finishStealAttempt(${isSuccessful})">
                ⚾ Continuar Juego
            </button>
        </div>
    `;
}

/**
 * Evalúa si el robo fue exitoso basado en el valor del dado
 * Por ahora sistema básico, después implementaremos las tablas reales
 */
function evaluateStealResult(finalValue, stealType) {
    // Sistema básico temporal: valores bajos = exitoso
    switch (stealType) {
        case 'first_to_second':
            return finalValue <= 4; // 1-4 exitoso en d8
        case 'second_to_third':
            return finalValue <= 3; // 0-3 exitoso en d8-1
        case 'third_to_home':
            return finalValue <= 2; // 0-2 exitoso en d8-1 (más difícil que segunda a tercera)
        case 'double_steal':
            return finalValue <= 4; // 1-4 exitoso en d8
        default:
            return finalValue <= 4;
    }
}

/**
 * Genera mensaje de éxito según el tipo de robo
 */
function getSuccessMessage(stealInfo) {
    switch (stealInfo.stealType) {
        case 'first_to_second':
            return `El corredor ${stealInfo.runner.name} llega seguro a segunda base.`;
        case 'second_to_third':
            return `El corredor ${stealInfo.runner.name} llega seguro a tercera base.`;
        case 'third_to_home':
            return `¡CARRERA! ${stealInfo.runner.name} anota desde tercera base.`;
        case 'double_steal':
            return `¡Doble robo exitoso! Ambos corredores avanzan una base.`;
        default:
            return `Robo exitoso.`;
    }
}

/**
 * Genera mensaje de fallo según el tipo de robo
 */
function getFailureMessage(stealInfo) {
    switch (stealInfo.stealType) {
        case 'first_to_second':
            return `${stealInfo.runner.name} es eliminado intentando robar segunda base.`;
        case 'second_to_third':
            return `${stealInfo.runner.name} es eliminado intentando robar tercera base.`;
        case 'third_to_home':
            return `${stealInfo.runner.name} es eliminado intentando robar home.`;
        case 'double_steal':
            return `Doble robo fallido. Ambos corredores son eliminados.`;
        default:
            return `Robo fallido. El corredor es eliminado.`;
    }
}

/**
 * Finaliza el intento de robo y actualiza el estado del juego
 */
function finishStealAttempt(wasSuccessful) {
    console.log(`🏁 Finalizando robo. Exitoso: ${wasSuccessful}`);
    
    const stealInfo = gameState.currentStealAttempt;
    
    if (wasSuccessful) {
        // ROBO EXITOSO: Actualizar bases
        handleSuccessfulSteal(stealInfo);
    } else {
        // ROBO FALLIDO: Eliminar corredor(es) y agregar out(s)
        handleFailedSteal(stealInfo);
    }
    
    // Limpiar información del robo
    gameState.currentStealAttempt = null;
    
    // Actualizar display del juego
    updateGameDisplay();
    
    // Volver al selector de intenciones para continuar el juego
    console.log('🔄 Volviendo al selector de intenciones...');
    showIntentionSelector();
}

/**
 * Maneja un robo exitoso actualizando las posiciones de los corredores
 */
function handleSuccessfulSteal(stealInfo) {
    console.log('✅ Procesando robo exitoso...');
    
    switch (stealInfo.stealType) {
        case 'first_to_second':
            gameState.bases.first = null;
            gameState.bases.second = stealInfo.runner;
            console.log(`📍 ${stealInfo.runner.name} movido a segunda base`);
            break;
            
        case 'second_to_third':
            gameState.bases.second = null;
            gameState.bases.third = stealInfo.runner;
            console.log(`📍 ${stealInfo.runner.name} movido a tercera base`);
            break;
            
        case 'third_to_home':
            gameState.bases.third = null;
            // TODO: Anotar carrera en el marcador
            console.log(`🏠 ¡CARRERA! ${stealInfo.runner.name} anota desde tercera base`);
            break;
            
        case 'double_steal':
            // Mover ambos corredores
            const runnerFrom1st = gameState.bases.first;
            const runnerFrom2nd = gameState.bases.second;
            
            gameState.bases.first = null;
            gameState.bases.second = runnerFrom1st;
            gameState.bases.third = runnerFrom2nd;
            
            console.log(`📍 Doble robo: ${runnerFrom1st.name} → 2ª, ${runnerFrom2nd.name} → 3ª`);
            break;
    }
}

/**
 * Maneja un robo fallido eliminando corredores y agregando outs
 */
function handleFailedSteal(stealInfo) {
    console.log('❌ Procesando robo fallido...');
    
    switch (stealInfo.stealType) {
        case 'first_to_second':
        case 'second_to_third':
        case 'third_to_home':
            // Eliminar corredor de la base
            gameState.bases[stealInfo.fromBase] = null;
            gameState.outs++;
            console.log(`❌ ${stealInfo.runner.name} eliminado. Outs: ${gameState.outs}`);
            break;
            
        case 'double_steal':
            // En doble robo fallido, eliminar ambos corredores
            gameState.bases.first = null;
            gameState.bases.second = null;
            gameState.outs += 2; // Doble eliminación
            console.log(`❌ Doble eliminación. Outs: ${gameState.outs}`);
            break;
    }
    
    // Verificar si hay 3 outs para cambiar inning
    if (gameState.outs >= 3) {
        console.log('🔄 3 outs alcanzados - cambio de inning necesario');
        // TODO: Implementar cambio de inning
    }
}

/**
 * Maneja la selección de un intento de robo específico
 */
function selectStealAttempt(fromBase, toBase, runnerIndex) {
    console.log(`🎯 Intento de robo seleccionado: ${fromBase} → ${toBase}`);
    
    // Guardar información del robo en el gameState
    gameState.currentStealAttempt = {
        fromBase: fromBase,
        toBase: toBase,
        runnerIndex: runnerIndex,
        runner: gameState.bases[fromBase]
    };
    
    console.log('💾 Información del robo guardada:', gameState.currentStealAttempt);
    
    // Mostrar sistema de dados para el robo
    showStealDiceSystem(fromBase, toBase);
}

/**
 * Cancela el intento de robo y vuelve al selector de intenciones
 */
function cancelStealAttempt() {
    console.log('❌ Intento de robo cancelado');
    
    // Limpiar información del robo
    gameState.currentStealAttempt = null;
    
    // Volver al selector de intenciones
    showIntentionSelector();
}

/**
 * Muestra el sistema de dados específico para robo de bases
 */
function showStealDiceSystem(fromBase, toBase) {
    console.log(`🎲 Mostrando sistema de dados para robo: ${fromBase} → ${toBase}`);
    
    const diceContainer = document.getElementById('dice-container-visitante');
    
    if (!diceContainer) {
        console.error('❌ No se encontró contenedor de dados');
        return;
    }
    
    // Crear HTML para el sistema de dados de robo
    const stealDiceHTML = createStealDiceHTML(fromBase, toBase);
    
    // Reemplazar contenido
    diceContainer.innerHTML = stealDiceHTML;
    
    console.log('✅ Sistema de dados de robo mostrado');
}

/**
 * Crea el HTML para el sistema de dados de robo
 */
function createStealDiceHTML(fromBase, toBase) {
    const stealInfo = gameState.currentStealAttempt;
    const baseNames = {
        'first': '1ª Base',
        'second': '2ª Base', 
        'third': '3ª Base',
        'home': 'Home'
    };
    
    return `
        <div class="steal-dice-system">
            <div class="steal-dice-header">
                <h3>🏃‍♂️ Intento de Robo: ${baseNames[fromBase]} → ${baseNames[toBase]}</h3>
                <p><strong>Corredor:</strong> ${stealInfo.runner?.name || 'Desconocido'}</p>
            </div>
            
            <div class="steal-dice-controls">
                <div class="dice-input-group">
                    <label for="steal-dice-value">🎲 Resultado del Dado:</label>
                    <input type="number" id="steal-dice-value" min="1" max="100" placeholder="1-100">
                </div>
                
                <button class="btn btn-primary steal-roll-btn" onclick="rollStealAttempt()">
                    🎲 Tirar Dado de Robo
                </button>
            </div>
            
            <div class="steal-result-area" id="steal-result-area" style="display: none;">
                <h4>📊 Resultado del Robo:</h4>
                <div id="steal-result-text"></div>
            </div>
            
            <div class="steal-actions">
                <button class="btn btn-secondary" onclick="cancelStealAttempt()">
                    ↩️ Cancelar Robo
                </button>
            </div>
        </div>
    `;
}