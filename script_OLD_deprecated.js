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

    // ESTADÍSTICAS DE JUGADORES
    playerStats: {
        visitante: {}, // { playerName: { AB, H, R, RBI, BB, K, AVG } }
        local: {} // { playerName: { AB, H, R, RBI, BB, K, AVG } }
    },

    // HISTORIAL DE JUGADAS
    playByPlay: [] // Array con registro de cada jugada del partido
        // {
        //     inning: number,
        //     isTopHalf: boolean,
        //     batter: string,
        //     result: string,
        //     outs: number,
        //     timestamp: Date
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

    // Obtener ID y número del jugador desde la fila
    const playerId = playerRow.getAttribute('data-player-id') || (batterIndex + 1).toString();
    const playerNumber = cells[1].textContent.trim(); // Columna '#'
    const mlbId = playerRow.getAttribute('data-mlb-id') || null;
    const isCustomTeam = teamTable.getAttribute('data-is-custom-team') === 'true';
    const customPhotoUrl = playerRow.getAttribute('data-custom-photo') || null;

    // Crear objeto jugador con los datos de la tabla
    return {
        id: playerId,
        number: playerNumber,
        name: cells[3].textContent.trim(), // Columna 'Nombre'
        position: cells[4].textContent.trim(), // Columna 'Posición'
        battingAvg: parseFloat(cells[6].textContent.trim()) || 0, // Columna 'BT'
        onBasePct: parseFloat(cells[7].textContent.trim()) || 0, // Columna 'OBT'
        traits: cells[8].textContent.trim(), // Columna 'Traits'
        mlbId: mlbId,
        isCustomTeam: isCustomTeam,
        customPhotoUrl: customPhotoUrl
    };
}

/*
  FUNCIÓN: initializeFirstBatter()
  PROPÓSITO: Inicializa el primer bateador al inicio del juego SIN incrementar el índice
  EXPLICACIÓN: Crea el token del bateador actual sin avanzar al siguiente
*/
function initializeFirstBatter() {
    console.log('🚀 ========== INICIANDO initializeFirstBatter ==========');

    // IMPORTANTE: Solo crea el token, NO modifica índices (ya están en 0 desde startNewGame)
    const battingTeam = getCurrentBattingTeam();
    console.log(`🔍 Equipo bateando: ${battingTeam}`);
    console.log(`🔍 Índice actual: ${getCurrentBatterIndex()}`);

    const currentBatter = getCurrentBatter();

    console.log(`🏃 Primer bateador: ${currentBatter?.name || 'Desconocido'}`);
    console.log(`📊 Índice de bateador: ${getCurrentBatterIndex() + 1}/9`);

    if (currentBatter) {
        console.log('✅ Bateador obtenido correctamente:', currentBatter);

        // Limpiar tokens anteriores en home
        const runnersContainer = document.getElementById('runners-container');
        console.log(`🔍 Buscando contenedor 'runners-container'...`);
        console.log(`🔍 Contenedor encontrado:`, runnersContainer);
        console.log(`🔍 Contenedor existe:`, !!runnersContainer);

        if (runnersContainer) {
            console.log('✅ Contenedor runners-container ENCONTRADO');
            console.log(`📊 Posición del contenedor:`, runnersContainer.getBoundingClientRect());
            console.log(`📊 Display del contenedor:`, window.getComputedStyle(runnersContainer).display);
            console.log(`📊 Visibility del contenedor:`, window.getComputedStyle(runnersContainer).visibility);

            const existingBatterTokens = runnersContainer.querySelectorAll('[data-current-base="home"]');
            console.log(`🧹 Limpiando ${existingBatterTokens.length} tokens anteriores en home`);
            existingBatterTokens.forEach(token => token.remove());
        } else {
            console.error('❌❌❌ NO se encontró runners-container - Los tokens NO se mostrarán');
            console.error('🔍 Buscando elementos similares...');
            const allDivs = document.querySelectorAll('div[id*="runner"]');
            console.log(`🔍 Divs con 'runner' en ID:`, Array.from(allDivs).map(d => d.id));
            return;
        }

        // Crear token del primer bateador
        const batterData = {
            id: currentBatter.id || '1',
            number: currentBatter.number || '1',
            name: currentBatter.name,
            team: battingTeam,
            mlbId: currentBatter.mlbId || null,
            isCustomTeam: currentBatter.isCustomTeam || false,
            customPhotoUrl: currentBatter.customPhotoUrl || null
        };
        console.log('🎯 Datos del token a crear:', batterData);
        console.log('🎯 Posición home:', basePositions.home);

        const createdToken = createRunnerToken(batterData, 'home');
        if (createdToken) {
            createdToken.classList.add('current-batter');
            console.log('✅ Clase current-batter añadida al token del bateador');
        }
        console.log(`⚾ createRunnerToken() completado - Token devuelto:`, createdToken);

        // Verificar que el token se creó
        setTimeout(() => {
            const verifyToken = runnersContainer.querySelector('[data-current-base="home"]');
            console.log(`🔍 Verificación del token:`, verifyToken);
            if (verifyToken) {
                console.log(`✅✅✅ CONFIRMADO: Token visible en home plate`);
                console.log(`📊 Estilo del token:`, window.getComputedStyle(verifyToken).cssText);
            } else {
                console.error(`❌❌❌ ERROR: Token NO se creó correctamente`);
                console.error(`🔍 Contenido del contenedor:`, runnersContainer.innerHTML);
                console.error(`🔍 Hijos del contenedor:`, runnersContainer.children);
            }
        }, 300);
    } else {
        console.error('❌ No hay bateador actual - No se puede crear token');
        console.error('🔍 Revisando tablas de roster...');
        const visitanteTable = document.getElementById('roster-visitante');
        const localTable = document.getElementById('roster-local');
        console.log('🔍 Tabla visitante:', visitanteTable);
        console.log('🔍 Tabla local:', localTable);
    }

    // Actualizar display
    updateGameDisplay();

    // MOSTRAR SELECTOR DE INTENCIONES AUTOMÁTICAMENTE
    console.log('🎯 Mostrando selector de intenciones automáticamente...');
    showIntentionSelector();

    console.log('🏁 ========== FIN initializeFirstBatter ==========');
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

    // Resetear cuenta de strikes y balls para el nuevo bateador
    gameState.strikes = 0;
    gameState.balls = 0;
    console.log('🔄 Strikes y balls reseteados a 0');

    // Crear token del bateador en home plate
    const currentBatter = getCurrentBatter();
    console.log('🏃 Datos del bateador actual:', currentBatter);

    if (currentBatter) {
        // Limpiar tokens anteriores en home
        const runnersContainer = document.getElementById('runners-container');
        if (runnersContainer) {
            const existingBatterTokens = runnersContainer.querySelectorAll('[data-current-base="home"]');
            existingBatterTokens.forEach(token => token.remove());
            console.log(`🧹 Limpiados ${existingBatterTokens.length} tokens anteriores en home`);
        } else {
            console.error('❌ No se encontró runners-container');
        }

        // Crear nuevo token del bateador usando el ID del roster
        const batterData = {
            id: currentBatter.id,
            number: currentBatter.number,
            name: currentBatter.name,
            team: battingTeam,
            mlbId: currentBatter.mlbId,
            isCustomTeam: currentBatter.isCustomTeam || false,
            customPhotoUrl: currentBatter.customPhotoUrl || null
        };
        console.log('🎯 Creando token con datos:', batterData);
        const batterToken = createRunnerToken(batterData, 'home');
        if (batterToken) {
            batterToken.classList.add('current-batter');
            console.log('✅ Clase current-batter añadida al token del siguiente bateador');
        }
        console.log(`⚾ Token del bateador creado en home: ${currentBatter.name}`);
    }

    // Actualizar display para mostrar el nuevo bateador y cuenta reseteada
    updateGameDisplay();

    // Limpiar sistema de cascada
    resetCascadeSystemComplete();
    console.log('🧹 Sistema de cascada limpiado');

    // MOSTRAR SELECTOR DE INTENCIONES para el nuevo bateador
    console.log('🎯 Mostrando selector de intenciones para nuevo bateador...');
    setTimeout(() => {
        showIntentionSelector();
        updateIntentionSelector(); // Validar opciones disponibles
        console.log('✅ Selector de intenciones mostrado');
    }, 200);

    // Mostrar estadísticas actuales del jugador que acaba de batear
    const previousBatter = gameState.playerStats[battingTeam];
    if (Object.keys(previousBatter).length > 0) {
        showGameStats();
    }

    console.log(`✅ Bateador avanzado - Todo listo para nueva jugada`);

    // MOSTRAR SELECTOR DE INTENCIONES AUTOMÁTICAMENTE
    console.log('🎯 Mostrando selector de intenciones automáticamente...');
    showIntentionSelector();
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
    // VERIFICACIÓN DE SEGURIDAD: Asegurar que score está inicializado
    if (!gameState.score || !gameState.score.visitante || !gameState.score.local) {
        console.error('❌ ERROR: gameState.score no está inicializado correctamente');
        console.log('🔍 Estado actual de gameState.score:', gameState.score);
        // Inicializar score si no existe
        gameState.score = {
            visitante: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            local: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            totalVisitante: 0,
            totalLocal: 0
        };
        console.log('✅ gameState.score inicializado automáticamente');
    }

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

    // Actualizar visibilidad del botón de robo
    updateStealBaseButton();
}

// ===== FUNCIONES DE CONTROL DEL FLUJO DEL JUEGO =====

/*
  FUNCIÓN: startNewGame()
  PROPÓSITO: Inicializa un nuevo juego con valores por defecto
  EXPLICACIÓN: Resetea todo el estado del juego y actualiza la visualización
*/
function startNewGame() {
    console.log('🎮 Iniciando nuevo juego...');
    console.log('========================================');
    console.log('FUNCIÓN startNewGame() EJECUTADA');
    console.log('========================================');

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

        // Empezar desde el primer bateador (índice 0)
        gameState.visitanteBatterIndex = 0; // Primer bateador
        gameState.localBatterIndex = 0; // Primer bateador

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

        // Obtener primer bateador y crear su token
        console.log('⏳ Inicializando primer bateador...');
        console.log('🔍 Estado antes de initializeFirstBatter:');
        console.log('  - isGameActive:', gameState.isGameActive);
        console.log('  - currentInning:', gameState.currentInning);
        console.log('  - isTopHalf:', gameState.isTopHalf);
        console.log('  - batterIndex:', getCurrentBatterIndex());

        initializeFirstBatter();
        console.log('✅ Primer bateador inicializado');

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
    gameState.gameComplete = false;
    gameState.winner = null;
    gameState.currentInning = 1;
    gameState.isTopHalf = true;

    // Resetear índices al primer bateador
    gameState.visitanteBatterIndex = 0; // Primer bateador
    gameState.localBatterIndex = 0; // Primer bateador

    gameState.outs = 0;
    gameState.currentDiceRoll = null;
    gameState.lastRollDetails = null;
    gameState.currentIntention = null;
    gameState.strikes = 0;
    gameState.balls = 0;

    // PASO 2: Limpiar bases
    gameState.bases = { first: null, second: null, third: null };

    // PASO 3: Resetear marcador COMPLETAMENTE
    gameState.score = {
        visitante: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        local: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        totalVisitante: 0,
        totalLocal: 0
    };

    // PASO 4: RESETEAR ESTADÍSTICAS DEL PARTIDO
    gameState.hits = { visitante: 0, local: 0 };
    gameState.errors = { visitante: 0, local: 0 };

    // PASO 5: RESETEAR ESTADÍSTICAS DE JUGADORES
    gameState.playerStats = {
        visitante: {},
        local: {}
    };
    console.log('📊 Estadísticas de jugadores reseteadas');

    // PASO 6: LIMPIAR TOKENS DEL CAMPO
    const runnersContainer = document.getElementById('runners-container');
    if (runnersContainer) {
        runnersContainer.innerHTML = '';
        console.log('🧹 Tokens del campo limpiados');
    }

    // PASO 7: Limpiar interfaz de dados
    resetCascadeSystemComplete();

    // PASO 8: Ocultar todos los contenedores de dados y selector de intenciones
    const visitanteContainer = document.getElementById('dice-container-visitante');
    const localContainer = document.getElementById('dice-container-local');
    const intentionContainer = document.getElementById('intention-container-visitante');

    if (visitanteContainer) visitanteContainer.style.display = 'none';
    if (localContainer) localContainer.style.display = 'none';
    if (intentionContainer) intentionContainer.style.display = 'none';

    // PASO 9: Limpiar campos de entrada
    const diceInputIds = [
        'pitcher-dice-value', 'batter-dice-value',
        'pitcher-dice-value-local', 'batter-dice-value-local'
    ];

    diceInputIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });

    // PASO 10: Actualizar display y mostrar botón "Iniciar Nuevo Juego"
    updateGameDisplay();
    updateBasesDisplay();

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
    home: { x: '50%', y: '40%' }, // Home plate - ajustado por usuario
    first: { x: '39%', y: '51%' }, // Primera base - ajustado por usuario
    second: { x: '52%', y: '62%' }, // Segunda base - ajustado por usuario
    third: { x: '61%', y: '51%' } // Tercera base - ajustado por usuario
};

/**
 * Obtiene las iniciales de un nombre de jugador
 * @param {string} name - Nombre completo del jugador
 * @returns {string} - Iniciales (ej: "Juan Pérez" → "JP")
 */
function getPlayerInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        // Solo un nombre, tomar primeras 2 letras
        return parts[0].substring(0, 2).toUpperCase();
    }
    // Tomar primera letra de cada palabra (máximo 3)
    return parts.slice(0, 3).map(part => part.charAt(0).toUpperCase()).join('');
}

/**
 * Crea un token visual para un corredor en el diamante
 * @param {Object} player - Objeto jugador con propiedades name, id, team
 * @param {string} base - Base donde colocar el token ('first', 'second', 'third', 'home')
 * @returns {HTMLElement} - Elemento DOM del token creado
 */
function createRunnerToken(player, base) {
    console.log(`🏃 ========== INICIANDO createRunnerToken ==========`);
    console.log(`🏃 Jugador: ${player.name}, Base: ${base}`);
    console.log('📋 Datos completos del jugador:', player);
    console.log('📍 Posición base:', basePositions[base]);

    const token = document.createElement('div');
    token.className = `runner-token team-${player.team} entering`;
    token.dataset.playerId = player.id;
    token.dataset.currentBase = base;

    console.log(`✅ Token creado - className: ${token.className}`);
    console.log(`✅ Token ID: ${token.dataset.playerId}, Base: ${token.dataset.currentBase}`);

    // Crear imagen del jugador con fallback
    const playerImg = document.createElement('div');
    playerImg.className = 'runner-photo';

    // Obtener foto del jugador (usar API MLB, fotos custom o fotos locales)
    const photoUrl = getPlayerPhotoUrl(player);
    console.log(`🖼️ URL de foto obtenida: ${photoUrl}`);

    // Si hay foto, intentar cargarla
    if (photoUrl) {
        playerImg.style.backgroundImage = `url('${photoUrl}')`;
        console.log('✅ Foto asignada al background-image');

        // Si la foto falla al cargar, mostrar J# como fallback
        const testImg = new Image();
        testImg.onerror = () => {
            // La foto no cargó, mostrar J# en su lugar
            playerImg.style.backgroundImage = 'none';
            const playerNumberSpan = document.createElement('span');
            playerNumberSpan.className = 'player-initials';
            playerNumberSpan.textContent = player.number ? `J${player.number}` : getPlayerInitials(player.name);
            playerImg.appendChild(playerNumberSpan);
            console.log(`❌ Foto falló al cargar, mostrando ${playerNumberSpan.textContent}`);
        };
        testImg.onload = () => {
            console.log('✅ Foto cargada exitosamente');
        };
        testImg.src = photoUrl;
    } else {
        // No hay URL de foto, mostrar J# directamente
        const playerNumberSpan = document.createElement('span');
        playerNumberSpan.className = 'player-initials';
        playerNumberSpan.textContent = player.number ? `J${player.number}` : getPlayerInitials(player.name);
        playerImg.appendChild(playerNumberSpan);
        console.log(`📝 Sin foto: mostrando ${playerNumberSpan.textContent}`);
    }

    token.appendChild(playerImg);
    console.log(`✅ Imagen añadida al token`);

    // Si es equipo custom, añadir botón para cambiar foto
    if (player.isCustomTeam) {
        token.classList.add('custom-team');
        const changePhotoBtn = document.createElement('div');
        changePhotoBtn.className = 'change-photo-btn';
        changePhotoBtn.innerHTML = '📷';
        changePhotoBtn.title = 'Cambiar foto';
        changePhotoBtn.onclick = (e) => {
            e.stopPropagation();
            openPhotoSelector(player, token);
        };
        token.appendChild(changePhotoBtn);
        console.log(`✅ Botón de cambio de foto añadido para jugador custom`);
    }

    // Añadir nombre debajo del token
    const nameLabel = document.createElement('div');
    nameLabel.className = 'runner-label';
    // Mostrar número y apellido (ej: "J1 - Jugador")
    const displayName = player.number ?
        `J${player.number} - ${player.name.split(' ').pop()}` :
        player.name.split(' ').pop();
    nameLabel.textContent = displayName;
    token.appendChild(nameLabel);
    console.log(`✅ Etiqueta añadida: ${displayName}`);

    // Posicionar en la base especificada
    const position = basePositions[base];
    token.style.left = position.x;
    token.style.top = position.y;
    console.log(`✅ Posición establecida - Left: ${position.x}, Top: ${position.y}`);

    // Añadir tooltip con información completa
    token.title = `${player.name} (${player.team}) - ${base} base`;

    // Añadir al contenedor de tokens
    const container = document.getElementById('runners-container');
    console.log(`🔍 Buscando contenedor 'runners-container'...`);
    if (container) {
        console.log(`✅ Contenedor encontrado:`, container);
        container.appendChild(token);
        console.log(`✅ Token añadido al contenedor`);
        console.log(`📊 Total de hijos en contenedor: ${container.children.length}`);

        // Verificar que el token está realmente en el DOM
        setTimeout(() => {
            const verification = document.querySelector(`[data-player-id="${player.id}"]`);
            if (verification) {
                console.log(`✅✅✅ TOKEN CONFIRMADO EN EL DOM`);
                console.log(`📍 Posición computada:`, window.getComputedStyle(verification).left, window.getComputedStyle(verification).top);
            } else {
                console.error(`❌❌❌ TOKEN NO ENCONTRADO EN EL DOM`);
            }
        }, 50);
    } else {
        console.error('❌❌❌ NO se encontró el contenedor de runners');
        console.error('🔍 Buscando contenedores similares...');
        const allDivs = document.querySelectorAll('div');
        console.log(`📊 Total de divs en el documento: ${allDivs.length}`);
        const containersWithRunner = Array.from(allDivs).filter(div =>
            div.id && div.id.includes('runner')
        );
        console.log(`🔍 Divs con 'runner' en el ID:`, containersWithRunner.map(d => d.id));
    }

    // Remover clase de entrada después de la animación
    setTimeout(() => {
        token.classList.remove('entering');
        console.log(`✅ Clase 'entering' removida del token`);
    }, 800);

    console.log(`🏃 ========== FIN createRunnerToken ==========`);
    return token;
}

/**
 * Obtiene la URL de la foto del jugador
 * @param {Object} player - Objeto del jugador
 * @returns {string|null} - URL de la foto o null
 */
/**
 * Abre el selector de fotos para jugadores de equipos custom
 * @param {Object} player - Objeto del jugador
 * @param {HTMLElement} token - Elemento del token
 */
function openPhotoSelector(player, token) {
    const newUrl = prompt(
        `Cambiar foto de ${player.name}\n\nIntroduce la URL de la nueva foto:`,
        player.customPhotoUrl || ''
    );

    if (newUrl !== null && newUrl.trim() !== '') {
        // Guardar la URL custom en el jugador
        player.customPhotoUrl = newUrl.trim();

        // Actualizar la foto del token
        const photoDiv = token.querySelector('.runner-photo');
        if (photoDiv) {
            photoDiv.style.backgroundImage = `url('${newUrl.trim()}')`;

            // Limpiar iniciales si existían
            const initials = photoDiv.querySelector('.player-initials');
            if (initials) {
                initials.remove();
            }

            // Verificar si la imagen carga correctamente
            const testImg = new Image();
            testImg.onerror = () => {
                alert('⚠️ No se pudo cargar la imagen. Verifica la URL.');
                photoDiv.style.backgroundImage = 'none';
                const playerNumberSpan = document.createElement('span');
                playerNumberSpan.className = 'player-initials';
                playerNumberSpan.textContent = player.number ? `J${player.number}` : getPlayerInitials(player.name);
                photoDiv.appendChild(playerNumberSpan);
            };
            testImg.onload = () => {
                console.log(`✅ Foto custom actualizada para ${player.name}`);
            };
            testImg.src = newUrl.trim();
        }
    }
}

function getPlayerPhotoUrl(player) {
    console.log(`🔍 getPlayerPhotoUrl llamada para: ${player.name}`);

    // Si tiene foto custom (equipos custom), usarla primero
    if (player.customPhotoUrl) {
        console.log(`✅ Foto custom encontrada: ${player.customPhotoUrl}`);
        return player.customPhotoUrl;
    }

    // Base de datos de fotos de jugadores MLB (ejemplos populares)
    const mlbPhotos = {
        // Yankees
        'Aaron Judge': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/592450/headshot/67/current',
        'Gleyber Torres': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/650402/headshot/67/current',
        'Anthony Rizzo': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/519203/headshot/67/current',
        'Giancarlo Stanton': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/519317/headshot/67/current',
        'DJ LeMahieu': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/518934/headshot/67/current',
        'Jose Trevino': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/624431/headshot/67/current',
        'Andrew Benintendi': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/643217/headshot/67/current',
        'Harrison Bader': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/664056/headshot/67/current',
        'Isiah Kiner-Falefa': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/643396/headshot/67/current',
        // Dodgers
        'Mookie Betts': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/605141/headshot/67/current',
        'Freddie Freeman': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/518692/headshot/67/current',
        'Trea Turner': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/607208/headshot/67/current',
        'Will Smith': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/669257/headshot/67/current',
        'Max Muncy': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/571970/headshot/67/current',
        'Justin Turner': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/457759/headshot/67/current',
        'Chris Taylor': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/621035/headshot/67/current',
        'Cody Bellinger': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/641355/headshot/67/current',
        'Gavin Lux': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/666158/headshot/67/current',
        // Red Sox
        'Rafael Devers': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/646240/headshot/67/current',
        'Xander Bogaerts': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/593428/headshot/67/current',
        'Trevor Story': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/596115/headshot/67/current',
        'J.D. Martinez': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/502110/headshot/67/current',
        'Alex Verdugo': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/657077/headshot/67/current',
        'Christian Vazquez': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/543877/headshot/67/current',
        'Kike Hernandez': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/571771/headshot/67/current',
        'Franchy Cordero': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/614173/headshot/67/current',
        'Bobby Dalbec': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/666915/headshot/67/current',
        // Otros jugadores populares
        'Shohei Ohtani': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/660271/headshot/67/current',
        'Juan Soto': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/665742/headshot/67/current',
        'Ronald Acuña Jr.': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/660670/headshot/67/current',
        'Fernando Tatis Jr.': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/665487/headshot/67/current',
        'Mike Trout': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/545361/headshot/67/current',
        'Bryce Harper': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/547180/headshot/67/current',
        'José Altuve': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/514888/headshot/67/current',
        'Vladimir Guerrero Jr.': 'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/665489/headshot/67/current'
    };

    // Buscar por nombre exacto
    if (mlbPhotos[player.name]) {
        console.log(`✅ Foto encontrada por nombre exacto: ${player.name}`);
        return mlbPhotos[player.name];
    }

    // Si el jugador tiene un ID MLB, construir URL
    if (player.mlbId) {
        const url = `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${player.mlbId}/headshot/67/current`;
        console.log(`✅ URL construida con mlbId: ${url}`);
        return url;
    }

    // Fallback: intentar buscar por apellido
    const lastName = player.name.split(' ').pop();
    const match = Object.keys(mlbPhotos).find(name => name.includes(lastName));
    if (match) {
        console.log(`✅ Foto encontrada por apellido (${lastName}): ${match}`);
        return mlbPhotos[match];
    }

    console.log(`⚠️ No se encontró foto para: ${player.name}`);
    
    // Fallback final: generar avatar con iniciales usando UI Avatars
    return generateAvatarUrl(player.name);
}

/**
 * Genera una URL de avatar con las iniciales del jugador
 * Usa el servicio UI Avatars como alternativa cuando no hay foto de MLB
 * @param {string} playerName - Nombre del jugador
 * @returns {string} - URL del avatar generado
 */
function generateAvatarUrl(playerName) {
    // Extraer iniciales del nombre
    const nameParts = playerName.trim().split(' ');
    const initials = nameParts.length >= 2 
        ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`
        : nameParts[0].substring(0, 2);
    
    // Colores aleatorios pero consistentes basados en el nombre
    const colors = [
        { bg: '3B82F6', fg: 'FFFFFF' }, // Azul
        { bg: 'EF4444', fg: 'FFFFFF' }, // Rojo
        { bg: '10B981', fg: 'FFFFFF' }, // Verde
        { bg: 'F59E0B', fg: 'FFFFFF' }, // Amarillo/Naranja
        { bg: '8B5CF6', fg: 'FFFFFF' }, // Púrpura
        { bg: 'EC4899', fg: 'FFFFFF' }, // Rosa
        { bg: '06B6D4', fg: 'FFFFFF' }, // Cyan
        { bg: 'F97316', fg: 'FFFFFF' }  // Naranja
    ];
    
    // Seleccionar color basado en el primer caracter del nombre
    const colorIndex = playerName.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    // Generar URL de UI Avatars
    const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color.bg}&color=${color.fg}&size=128&bold=true&format=png`;
    
    console.log(`🎨 Avatar generado para ${playerName}: ${url}`);
    return url;
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

    // Activar sistema de cascada inmediatamente con la tirada completa
    console.log(`🎯 Llamando initializeCascade con tirada: ${total}`);
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
    gameState.gameComplete = true;

    const winner = gameState.score.totalVisitante > gameState.score.totalLocal ? 'Visitante' :
        gameState.score.totalLocal > gameState.score.totalVisitante ? 'Local' : 'Empate';

    gameState.winner = winner;

    // Guardar estadísticas del juego
    saveGameStats();

    // Mostrar estadísticas finales en consola
    console.log('');
    console.log('🏁 ═══════════════════════════════════════ 🏁');
    console.log('           JUEGO TERMINADO');
    console.log(`           Ganador: ${winner}`);
    console.log('🏁 ═══════════════════════════════════════ 🏁');
    showGameStats();

    alert(`¡Juego terminado!\n\nGanador: ${winner}\n\nVerifica la consola (F12) para ver las estadísticas completas del partido.`);
    console.log('💾 Estadísticas guardadas. Puedes verlas en la consola.');

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

        // Actualizar fotos de los jugadores
        refreshPlayerPhotos();
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

    const teamName = prompt('Introduce el nombre del equipo custom:', 'Mi Equipo');
    if (!teamName) return;

    // Crear equipo con jugadores genéricos
    const customTeam = {
        name: teamName,
        isCustom: true,
        players: []
    };

    // Crear 9 jugadores genéricos
    for (let i = 1; i <= 9; i++) {
        const playerName = prompt(`Jugador ${i} - Nombre:`, `Jugador ${i}`);
        if (!playerName) continue;

        customTeam.players.push({
            id: `custom_${i}`,
            name: playerName,
            number: i,
            position: i === 1 ? 'P' : i === 2 ? 'C' : i === 3 ? '1B' : i === 4 ? '2B' : i === 5 ? '3B' : i === 6 ? 'SS' : i === 7 ? 'LF' : i === 8 ? 'CF' : 'RF',
            handedness: 'R',
            battingAvg: 0.250,
            onBasePct: 0.320,
            traits: ['Balanced'],
            mlbId: null,
            customPhotoUrl: null
        });
    }

    // Aplicar el equipo custom a la tabla
    applyCustomTeamToTable(currentTeamType, customTeam);
    closeTeamConfig();
}

function applyCustomTeamToTable(teamType, teamData) {
    console.log(`🎨 Aplicando equipo custom ${teamData.name} a tabla ${teamType}`);

    const tableId = `roster-${teamType}`;
    const table = document.getElementById(tableId);

    if (!table) {
        console.error(`❌ No se encontró la tabla ${tableId}`);
        return;
    }

    // Marcar la tabla como equipo custom
    table.setAttribute('data-is-custom-team', 'true');

    const tbody = table.querySelector('tbody');
    if (!tbody) {
        console.error(`❌ No se encontró tbody en tabla ${tableId}`);
        return;
    }

    // Limpiar filas existentes
    tbody.innerHTML = '';

    // Agregar cada jugador
    teamData.players.forEach((player, index) => {
        const row = document.createElement('tr');
        row.className = 'player-row';
        row.draggable = true;
        row.setAttribute('data-player-id', player.id || `custom_${index + 1}`);
        if (player.customPhotoUrl) {
            row.setAttribute('data-custom-photo', player.customPhotoUrl);
        }

        // Token con opción de foto custom
        const photoHTML = `<div class="roster-player-token custom-photo-token" onclick="changePlayerPhoto(this, '${player.id}', '${teamType}')"><span>📷</span></div>`;

        row.innerHTML = `
            <td class="drag-handle">⋮⋮</td>
            <td class="player-number">${index + 1}</td>
            <td class="player-photo">${photoHTML}</td>
            <td class="player-name">${player.name}</td>
            <td>
                <select class="position-select" data-player="${player.id}">
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
    const teamHeader = table.closest('.col').querySelector('.team-header h2');
    if (teamHeader) {
        const icon = teamType === 'visitante' ? '🛫' : '🏠';
        teamHeader.textContent = `${icon} ${teamData.name} 🎨`;
    }

    console.log(`✅ Equipo custom con ${teamData.players.length} jugadores creado`);
}

// Función para cambiar foto desde el roster (equipos custom)
function changePlayerPhoto(element, playerId, teamType) {
    const newUrl = prompt('Introduce la URL de la foto del jugador:', '');
    if (!newUrl || newUrl.trim() === '') return;

    // Actualizar el elemento visual del roster
    element.innerHTML = `<img src="${newUrl.trim()}" onerror="this.parentElement.innerHTML='<span>❌</span>';" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;

    // Guardar la URL en el atributo data de la fila
    const row = element.closest('tr');
    if (row) {
        row.setAttribute('data-custom-photo', newUrl.trim());
        console.log(`✅ Foto actualizada para jugador ${playerId}: ${newUrl.trim()}`);
    }
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
        // Generar token con foto para el roster (ahora siempre hay URL: MLB o avatar)
        const photoUrl = getPlayerPhotoUrl(player);
        console.log(`📸 Jugador: ${player.name}, URL: ${photoUrl}`);
        
        const initials = `${player.name.split(' ')[0].charAt(0)}${player.name.split(' ').pop().charAt(0)}`;
        const photoHTML = `<div class="roster-player-token"><img src="${photoUrl}" onerror="console.error('Error cargando: ${player.name}'); this.style.display='none'; this.parentElement.innerHTML='<span style=\\"font-size: 14px; font-weight: bold\\">${initials}</span>';" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="${player.name}" /></div>`;

        row.innerHTML = `
            <td class="drag-handle">⋮⋮</td>
            <td class="player-number">${index + 1}</td>
            <td class="player-photo">${photoHTML}</td>
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

// Función para actualizar las fotos de los jugadores en las tablas existentes
function refreshPlayerPhotos() {
    console.log('🔄 Actualizando fotos de jugadores en las tablas...');

    const tables = ['roster-visitante', 'roster-local'];

    tables.forEach(tableId => {
        const table = document.getElementById(tableId);
        if (!table) {
            console.warn(`⚠️ No se encontró la tabla ${tableId}`);
            return;
        }

        const rows = table.querySelectorAll('tbody tr.player-row');
        console.log(`📊 Procesando ${rows.length} jugadores en ${tableId}`);

        rows.forEach((row, index) => {
            const playerNameCell = row.querySelector('.player-name');
            if (!playerNameCell) return;

            const playerName = playerNameCell.textContent.trim();
            const photoCell = row.querySelector('.player-photo');
            if (!photoCell) return;

            // Crear objeto player temporal para buscar foto
            const player = {
                name: playerName,
                mlbId: row.getAttribute('data-mlb-id') || null,
                customPhotoUrl: row.getAttribute('data-custom-photo') || null
            };

            const photoUrl = getPlayerPhotoUrl(player);
            const initials = `${playerName.split(' ')[0].charAt(0)}${playerName.split(' ').pop().charAt(0)}`;
            
            // Ahora siempre tenemos una URL (foto MLB o avatar generado)
            photoCell.innerHTML = `<div class="roster-player-token"><img src="${photoUrl}" onerror="console.error('Error cargando foto: ${playerName}'); this.style.display='none'; this.parentElement.innerHTML='<span style=\\"font-size: 14px; font-weight: bold\\">${initials}</span>';" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="${playerName}" /></div>`;
            console.log(`✅ Foto/Avatar actualizado para ${playerName}: ${photoUrl}`);
        });
    });

    console.log('✅ Fotos actualizadas');
}

// ===== SISTEMA DE CASCADA DE RESOLUCIÓN =====

/*
  FUNCIONES PARA EL SISTEMA DE CASCADA
  Maneja la resolución paso a paso de jugadas complejas
*/

// Inicializar cascada con resultado inicial (FUNCIÓN GLOBAL)
function initializeCascade(result, resultType) {
    console.log(`🎲 initializeCascade() llamada con: resultado=${result}, tipo=${resultType}`);

    // Mostrar la cascada completa con la tabla de Swing Result
    const cascadeConfirmation = document.getElementById('cascade-confirmation');
    if (cascadeConfirmation) {
        const cascadeHTML = generateSimpleCascade(result);
        console.log(`📋 HTML de cascada generado (${cascadeHTML.length} caracteres)`);

        cascadeConfirmation.innerHTML = `
            <div style="background: #1e3a5f; color: white; padding: 1.5rem; border-radius: 12px; border: 3px solid #fbbf24; box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);">
                <h2 style="margin: 0 0 1rem 0; color: #fbbf24;">🎯 SWING RESULT TABLE</h2>
                <p style="margin: 0 0 1rem 0; font-size: 0.9rem; opacity: 0.8;">Haz clic en la fila resaltada para continuar</p>
                ${cascadeHTML}
            </div>
        `;
        cascadeConfirmation.style.display = 'block';
        console.log(`✅ Cascada mostrada - Esperando selección del usuario`);
    } else {
        console.error('❌ No se encontró el elemento cascade-confirmation');
    }
}

// Generar cascada simplificada (FUNCIÓN GLOBAL)
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
        { range: `${obt + 6}-49`, event: "Productive Out 1", result: "Runners advance significantly", highlighted: diceRoll >= (obt + 6) && diceRoll <= 49 },
        { range: "50-69", event: "Productive Out 2", result: "Limited runner advancement", highlighted: diceRoll >= 50 && diceRoll <= 69 },
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

// Mostrar el sistema de cascada (contenedor siempre visible)
function showCascadeSystem() {
    // El contenedor ya está siempre visible por CSS
    // Solo activamos la visualización de contenido
    console.log('📋 Sistema de cascada activado (contenedor siempre visible)');
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

    // REMOVIDO - Se mueve fuera como función global

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

        // REMOVIDO - Movido como función global

        // ===== TABLAS OFICIALES DE DEADBALL MODERN ERA =====

        // HIT TABLE (D20) - Usada para Ordinary Hit y Critical Hit
        const hitTable = [
            { range: "1-2", result: "Single", def: null },
            { range: "3", result: "Single", def: "1B" },
            { range: "4", result: "Single", def: "2B" },
            { range: "5", result: "Single", def: "3B" },
            { range: "6", result: "Single", def: "SS" },
            { range: "7-9", result: "Single", def: null },
            { range: "10-14", result: "Single, runners adv. 2", def: null },
            { range: "15", result: "Double", def: "LF" },
            { range: "16", result: "Double", def: "CF" },
            { range: "17", result: "Double", def: "RF" },
            { range: "18", result: "Double, runners adv. 3", def: null },
            { range: "19-20", result: "Home Run", def: null }
        ];

        // ODDITIES TABLE (2d10) - ALL ERAS - Solo se accede con MSS=1 o MSS=99
        // Tirar 2 dados de 10 caras (resultado entre 2 y 20)
        const oddityTable = [
            { range: "2", result: "Fan Interference", effect: "Even PD: Home run overturned. Batter out. Odd PD: Fan catches a sure out. At-bat continues." },
            { range: "3", result: "Animal On Field", effect: "Roll d4: 1-Seagull steals pitcher's hat (reduce PD by 1). 2-Raccoon bites fielder. 3-Black cat spooks team. 4-Streaker inspires crowd." },
            { range: "4", result: "Rain Delay", effect: "Delay lasts d100*2 minutes." },
            { range: "5", result: "Fielder Appears Injured", effect: "Roll on injury table for fielder who made last out." },
            { range: "6", result: "Pitcher Appears Injured", effect: "Roll on injury table for pitcher." },
            { range: "7", result: "TOOTBLAN", effect: "Lead runner thrown out like a nincompoop. If no runner on base, batter logged out." },
            { range: "8", result: "Pick-Off", effect: "Runner at first picked off. If no runner at first, treat catcher as D+ for next stolen base attempt." },
            { range: "9", result: "Call Blown at First", effect: "If PD is even, batter wrongly called safe. If PD is odd, batter wrongly called out." },
            { range: "10", result: "Call Blown at Home Plate", effect: "If PD is even, batter draws walk. If PD is odd, batter called out on pitch that should have been a ball." },
            { range: "11", result: "Hit by Pitch", effect: "Batter goes to first." },
            { range: "12", result: "Wild Pitch", effect: "All runners advance one base." },
            { range: "13", result: "Pitcher Distracted", effect: "Add 1 to any stolen base attempt for this at-bat." },
            { range: "14", result: "Dropped Third Strike", effect: "Roll d8 for stolen base. If roll is successful, batter reaches first." },
            { range: "15", result: "Passed Ball", effect: "All runners advance one base." },
            { range: "16", result: "Current Batter Appears Injured", effect: "Roll on injury table for current batter." },
            { range: "17", result: "Previous Batter Appears Injured", effect: "Roll on injury table for previous batter." },
            { range: "18", result: "Pitcher Error", effect: "Batter reaches first. All runners advance one base." },
            { range: "19", result: "Balk", effect: "All runners advance one base." },
            { range: "20", result: "Catcher Interference", effect: "Batter goes to first." }
        ];

        // OUT TABLE - Para resolución de outs específicos
        const outTable = [
            { lastDigit: "0", result: "Strikeout", notation: "(K)", type: "strikeout" },
            { lastDigit: "1", result: "Strikeout", notation: "(K)", type: "strikeout" },
            { lastDigit: "2", result: "Strikeout", notation: "(K)", type: "strikeout" },
            { lastDigit: "3", result: "Groundout to 1B", notation: "(G-3)", type: "groundout" },
            { lastDigit: "4", result: "Groundout to 2B", notation: "(4-3)", type: "groundout" },
            { lastDigit: "5", result: "Groundout to 3B", notation: "(5-3)", type: "groundout" },
            { lastDigit: "6", result: "Groundout to SS", notation: "(6-3)", type: "groundout" },
            { lastDigit: "7", result: "Pop-up to LF", notation: "(F-7)", type: "flyout" },
            { lastDigit: "8", result: "Pop-up to CF", notation: "(F-8)", type: "flyout" },
            { lastDigit: "9", result: "Pop-up to RF", notation: "(F-9)", type: "flyout" }
        ];

        // PRODUCTIVE OUT TABLE 1 (OBP+6 a 49) - Mayor avance de corredores
        const productiveOutTable1 = [
            { lastDigit: "0", result: "Strikeout", notation: "(K)", advancement: "No runners advance" },
            { lastDigit: "1", result: "Strikeout", notation: "(K)", advancement: "No runners advance" },
            { lastDigit: "2", result: "Strikeout", notation: "(K)", advancement: "No runners advance" },
            { lastDigit: "3", result: "Groundout to 1B", notation: "(G-3)", advancement: "Runner on 3rd scores" },
            { lastDigit: "4", result: "Groundout to 2B", notation: "(4-3)", advancement: "Runner on 3rd scores" },
            { lastDigit: "5", result: "Groundout to 3B", notation: "(5-3)", advancement: "Runner on 3rd scores" },
            { lastDigit: "6", result: "Groundout to SS", notation: "(6-3)", advancement: "Runner on 3rd scores" },
            { lastDigit: "7", result: "Flyout to LF", notation: "(F-7)", advancement: "Runners on 2nd and 3rd advance" },
            { lastDigit: "8", result: "Flyout to CF", notation: "(F-8)", advancement: "Runners on 2nd and 3rd advance" },
            { lastDigit: "9", result: "Flyout to RF", notation: "(F-9)", advancement: "Runners on 2nd and 3rd advance" }
        ];

        // PRODUCTIVE OUT TABLE 2 (50-69) - Menor avance de corredores
        const productiveOutTable2 = [
            { lastDigit: "0", result: "Strikeout", notation: "(K)", advancement: "No runners advance" },
            { lastDigit: "1", result: "Strikeout", notation: "(K)", advancement: "No runners advance" },
            { lastDigit: "2", result: "Strikeout", notation: "(K)", advancement: "No runners advance" },
            { lastDigit: "3", result: "Groundout to 1B", notation: "(G-3)", advancement: "No runners advance" },
            { lastDigit: "4", result: "Groundout to 2B", notation: "(4-3)", advancement: "No runners advance" },
            { lastDigit: "5", result: "Groundout to 3B", notation: "(5-3)", advancement: "No runners advance" },
            { lastDigit: "6", result: "Groundout to SS", notation: "(6-3)", advancement: "No runners advance" },
            { lastDigit: "7", result: "Flyout to LF", notation: "(F-7)", advancement: "Runner on 3rd scores" },
            { lastDigit: "8", result: "Flyout to CF", notation: "(F-8)", advancement: "Runner on 3rd scores" },
            { lastDigit: "9", result: "Flyout to RF", notation: "(F-9)", advancement: "Runner on 3rd scores" }
        ];

        // DEFENSE TABLE (D12) - Usada para Possible Error
        // NOTA: Esta tabla no está completamente visible en la imagen
        // Se mantiene estructura básica
        const defenseTable = [
            { range: "1-2", result: "Error. Runners take an extra base" },
            { range: "3-9", result: "No change" },
            { range: "10-11", result: "Double turns into a single, runners advance 2" },
            { range: "12", result: "Hit turned into out. Runners hold" }
        ];

        // BASE STEALING TABLE (D8) - Robo de bases individual
        const baseStealingTable = [
            { roll: 1, result: "Success", description: "Runner steals successfully" },
            { roll: 2, result: "Success", description: "Runner steals successfully" },
            { roll: 3, result: "Success", description: "Runner steals successfully" },
            { roll: 4, result: "Success", description: "Runner steals successfully" },
            { roll: 5, result: "Success", description: "Runner steals successfully" },
            { roll: 6, result: "Failure", description: "Runner is out" },
            { roll: 7, result: "Failure", description: "Runner is out" },
            { roll: 8, result: "Double Play", description: "Batter out on popup/strikeout, runner caught stealing" }
        ];

        // DOUBLE STEAL TABLE (D8) - Robo doble (dos corredores)
        const doubleStealTable = [
            { roll: 1, result: "Both Safe", description: "Both runners steal successfully" },
            { roll: 2, result: "Both Safe", description: "Both runners steal successfully" },
            { roll: 3, result: "Lead Runner Out", description: "Lead runner caught, trailing runner safe" },
            { roll: 4, result: "Lead Runner Out", description: "Lead runner caught, trailing runner safe" },
            { roll: 5, result: "Trailing Runner Out", description: "Trailing runner caught, lead runner safe" },
            { roll: 6, result: "Trailing Runner Out", description: "Trailing runner caught, lead runner safe" },
            { roll: 7, result: "Both Out", description: "Both runners caught stealing" },
            { roll: 8, result: "Both Out", description: "Both runners caught stealing" }
        ];

        // ===== SISTEMA DE CASCADA DE DADOS =====

        // HACER cascadeState GLOBAL para que sea accesible desde todas las funciones
        window.cascadeState = {
            currentTable: null, // Qué tabla secundaria se está usando
            firstRoll: null, // Primera tirada (Swing Result)
            secondRoll: null, // Segunda tirada (tabla secundaria)
            eventType: null, // Tipo de evento (oddity, critical hit, etc.)
            finalResult: null // Resultado final interpretado
        };

        // Función global para calcular total de 2d10 (Oddities)
        function calculateOddityTotal() {
            const input1 = document.getElementById('oddity-dice-1');
            const input2 = document.getElementById('oddity-dice-2');
            const dice1 = parseInt(input1 && input1.value || 0) || 0;
            const dice2 = parseInt(input2 && input2.value || 0) || 0;
            const totalElement = document.getElementById('oddity-total');

            if (!totalElement) return;

            if (dice1 > 0 && dice2 > 0 && dice1 <= 10 && dice2 <= 10) {
                const total = dice1 + dice2;
                totalElement.textContent = total;
                totalElement.style.background = '#fbbf24';
                updateSecondaryTable('Oddity', total);
            } else {
                totalElement.textContent = '-';
                totalElement.style.background = '#6b7280';
            }
        }

        // Funciones para tirar dados secundarios automáticamente
        function rollSecondaryDice(maxValue) {
            const roll = Math.floor(Math.random() * maxValue) + 1;
            const input = document.getElementById('secondary-dice-value');
            if (input) {
                input.value = roll;
                input.dispatchEvent(new Event('input'));
            }
        }

        function rollOddityDice() {
            const roll1 = Math.floor(Math.random() * 10) + 1;
            const roll2 = Math.floor(Math.random() * 10) + 1;

            const input1 = document.getElementById('oddity-dice-1');
            const input2 = document.getElementById('oddity-dice-2');

            if (input1 && input2) {
                input1.value = roll1;
                input2.value = roll2;
                calculateOddityTotal();
            }
        }

        function rollOutLastDigit() {
            const roll = Math.floor(Math.random() * 10); // 0-9
            const input = document.getElementById('secondary-dice-value');
            if (input) {
                input.value = roll;
                input.dispatchEvent(new Event('input'));
            }
        }

        // Función para seleccionar resultado y determinar si necesita cascada
        function selectResult(event, result) {
            console.log(`✅ Resultado seleccionado: ${event} - ${result}`);

            window.cascadeState.eventType = event;

            // Determinar si necesita segunda tirada
            const needsSecondRoll = [
                'Oddity',
                'Critical Hit',
                'Ordinary Hit',
                'Possible Error',
                'Out',
                'Productive Out 1',
                'Productive Out 2'
            ].includes(event);

            if (needsSecondRoll) {
                console.log(`🎲 Se requiere segunda tirada para: ${event}`);

                // Guardar el tipo de evento
                window.cascadeState.eventType = event;
                window.cascadeState.firstRoll = gameState.currentDiceRoll;

                console.log(`📊 Estado de cascada guardado:`, window.cascadeState);

                // Para OUT TABLE y Productive Out, extraer último dígito de la tirada original
                if ((event === 'Out' || event === 'Productive Out 1' || event === 'Productive Out 2') && gameState.currentDiceRoll) {
                    const lastDigit = Math.abs(gameState.currentDiceRoll) % 10;
                    console.log(`📊 ${event}: Último dígito de ${gameState.currentDiceRoll} = ${lastDigit}`);
                    showSecondaryDiceBox(event, lastDigit);
                } else {
                    showSecondaryDiceBox(event);
                }
            } else {
                // No necesita segunda tirada, procesar directamente
                console.log(`✅ No se requiere segunda tirada. Procesando...`);
                showFinalConfirmation(event, result);
            }
        }

        // Mostrar caja de dados secundaria para tabla específica
        function showSecondaryDiceBox(tableType, prefilledValue = null) {
            console.log(`🎲 showSecondaryDiceBox llamado - Tipo: ${tableType}, Valor prellenado: ${prefilledValue}`);

            const cascadeContainer = document.getElementById('cascade-confirmation');
            if (!cascadeContainer) {
                console.error('❌ No se encontró cascade-confirmation');
                return;
            }

            let diceType = '';
            let tableName = '';
            let maxValue = 20;

            switch (tableType) {
                case 'Oddity':
                    diceType = '2d10';
                    tableName = 'Oddity Table';
                    maxValue = 20;
                    break;
                case 'Critical Hit':
                    diceType = 'd20';
                    tableName = 'Critical Hit Table (con upgrade +1)';
                    maxValue = 20;
                    break;
                case 'Ordinary Hit':
                    diceType = 'd20';
                    tableName = 'Hit Table';
                    maxValue = 20;
                    break;
                case 'Possible Error':
                    diceType = 'd12';
                    tableName = 'Defense Table';
                    maxValue = 12;
                    break;
                case 'Out':
                    diceType = 'último dígito';
                    tableName = 'Out Table (último dígito de la tirada)';
                    maxValue = 9;
                    break;
                case 'Productive Out 1':
                    diceType = 'último dígito';
                    tableName = 'Productive Out Table (OBP+6 a 49) - Mayor avance';
                    maxValue = 9;
                    break;
                case 'Productive Out 2':
                    diceType = 'último dígito';
                    tableName = 'Productive Out Table (50-69) - Menor avance';
                    maxValue = 9;
                    break;
                default:
                    diceType = 'd20';
                    tableName = 'Secondary Table';
                    maxValue = 20;
            }

            window.cascadeState.currentTable = tableType;

            // Crear interfaz especial para 2d10 (Oddities)
            let diceInputHTML = '';
            if (tableType === 'Oddity') {
                diceInputHTML = `
            <div style="background: rgba(251, 191, 36, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <div style="display: flex; gap: 1rem; align-items: center; justify-content: center; flex-wrap: wrap;">
                    <div style="text-align: center; position: relative;">
                        <label style="font-weight: bold; display: block; margin-bottom: 0.5rem; color: #fbbf24;">🎲 Dado 1</label>
                        <div style="position: relative; display: inline-block;">
                            <input type="number" id="oddity-dice-1" min="1" max="10" placeholder="1-10"
                                   style="width: 70px; padding: 0.5rem; font-size: 1.2rem; border: 2px solid #fbbf24; border-radius: 4px; text-align: center; -moz-appearance: textfield;"
                                   oninput="calculateOddityTotal()">
                            <div class="mini-dice" onclick="rollOddityDice()" title="Tirar 2d10" 
                                 style="position: absolute; bottom: 2px; right: 2px; font-size: 0.7rem; cursor: pointer; opacity: 0.7; padding: 2px; border-radius: 3px;">🎲</div>
                        </div>
                    </div>
                    <div style="font-size: 2rem; padding-top: 1.5rem; color: #fbbf24;">+</div>
                    <div style="text-align: center; position: relative;">
                        <label style="font-weight: bold; display: block; margin-bottom: 0.5rem; color: #fbbf24;">🎲 Dado 2</label>
                        <div style="position: relative; display: inline-block;">
                            <input type="number" id="oddity-dice-2" min="1" max="10" placeholder="1-10"
                                   style="width: 70px; padding: 0.5rem; font-size: 1.2rem; border: 2px solid #fbbf24; border-radius: 4px; text-align: center; -moz-appearance: textfield;"
                                   oninput="calculateOddityTotal()">
                            <div class="mini-dice" onclick="rollOddityDice()" title="Tirar 2d10" 
                                 style="position: absolute; bottom: 2px; right: 2px; font-size: 0.7rem; cursor: pointer; opacity: 0.7; padding: 2px; border-radius: 3px;">🎲</div>
                        </div>
                    </div>
                    <div style="font-size: 2rem; padding-top: 1.5rem; color: #fbbf24;">=</div>
                    <div style="text-align: center;">
                        <label style="font-weight: bold; display: block; margin-bottom: 0.5rem; color: #fbbf24;">Total</label>
                        <div id="oddity-total" style="width: 70px; padding: 0.5rem; font-size: 1.5rem; font-weight: bold; 
                                                       background: #fbbf24; color: #1e3a5f; border-radius: 4px; text-align: center; min-height: 40px; line-height: 40px;">
                            -
                        </div>
                    </div>
                </div>
            </div>
        `;
            } else if (tableType === 'Out') {
                // Para OUT TABLE mostrar solo la tabla sin input (se usa último dígito)
                diceInputHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: center;">
                <p style="margin: 0; color: #ef4444; font-weight: bold; font-size: 1.1rem;">
                    📊 Último dígito de la tirada: <span style="font-size: 1.5rem; background: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; margin-left: 0.5rem;">${prefilledValue}</span>
                </p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; opacity: 0.8;">
                    Consulta automática en OUT TABLE
                </p>
            </div>
        `;
            } else if (tableType === 'Productive Out 1') {
                // Para Productive Out 1 mostrar solo la tabla sin input
                diceInputHTML = `
            <div style="background: rgba(251, 191, 36, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: center;">
                <p style="margin: 0; color: #f59e0b; font-weight: bold; font-size: 1.1rem;">
                    📊 Último dígito de la tirada: <span style="font-size: 1.5rem; background: #f59e0b; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; margin-left: 0.5rem;">${prefilledValue}</span>
                </p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; opacity: 0.8;">
                    Productive Out - Mayor avance de corredores
                </p>
            </div>
        `;
            } else if (tableType === 'Productive Out 2') {
                // Para Productive Out 2 mostrar solo la tabla sin input
                diceInputHTML = `
            <div style="background: rgba(234, 179, 8, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: center;">
                <p style="margin: 0; color: #ca8a04; font-weight: bold; font-size: 1.1rem;">
                    📊 Último dígito de la tirada: <span style="font-size: 1.5rem; background: #ca8a04; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; margin-left: 0.5rem;">${prefilledValue}</span>
                </p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; opacity: 0.8;">
                    Productive Out - Menor avance de corredores
                </p>
            </div>
        `;
            } else {
                diceInputHTML = `
            <div style="display: flex; gap: 1rem; align-items: center; justify-content: center; margin: 1rem 0;">
                <label style="font-weight: bold;">Resultado del dado (1-${maxValue}):</label>
                <div style="position: relative; display: inline-block;">
                    <input type="number" id="secondary-dice-value" min="1" max="${maxValue}" 
                           style="width: 100px; padding: 0.5rem; font-size: 1.2rem; border: 2px solid #fbbf24; border-radius: 4px; text-align: center; -moz-appearance: textfield;"
                           oninput="updateSecondaryTable('${tableType}', this.value)">
                    <div class="mini-dice" onclick="rollSecondaryDice(${maxValue})" title="Tirar d${maxValue}" 
                         style="position: absolute; bottom: 2px; right: 2px; font-size: 0.7rem; cursor: pointer; opacity: 0.7; padding: 2px; border-radius: 3px;">🎲</div>
                </div>
            </div>
        `;
            }

            cascadeContainer.style.display = 'block';

            // Debug: verificar qué tipo de tabla es
            console.log(`🔍 Tipo de tabla: "${tableType}"`);
            console.log(`🔍 Es OUT/Productive Out? ${tableType === 'Out' || tableType === 'Productive Out 1' || tableType === 'Productive Out 2'}`);

            cascadeContainer.innerHTML = `
        <div style="background: #1e3a5f; color: white; padding: 1.5rem; border-radius: 12px; border: 3px solid #fbbf24; box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);">
            <h2 style="margin: 0 0 1rem 0; color: #fbbf24;">🎲 SEGUNDA TIRADA REQUERIDA</h2>
            <h3 style="margin: 0 0 0.5rem 0;">${tableName}</h3>
            <p style="margin: 0 0 1rem 0; font-size: 0.9rem; opacity: 0.8;">Tira ${diceType} para determinar el resultado exacto</p>
            
            ${diceInputHTML}
            
            <div id="secondary-table-display" style="margin: 1rem 0;"></div>
            
            ${(tableType === 'Out' || tableType === 'Productive Out 1' || tableType === 'Productive Out 2') ? `
                <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: center;">
                    <p style="margin: 0; color: #10b981; font-weight: bold;">
                        ⏱️ Aplicando resultado automáticamente...
                    </p>
                </div>
            ` : `
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button onclick="confirmSecondaryResult()" 
                            style="flex: 1; background: #059669; color: white; padding: 0.75rem; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                        ✅ Confirmar Resultado
                    </button>
                    <button onclick="cancelCascade()" 
                            style="flex: 1; background: #dc2626; color: white; padding: 0.75rem; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                        ❌ Cancelar
                    </button>
                </div>
            `}
        </div>
    `;

    // Si es OUT TABLE o Productive Out con valor pre-rellenado, mostrar tabla inmediatamente
    if ((tableType === 'Out' || tableType === 'Productive Out 1' || tableType === 'Productive Out 2') && prefilledValue !== null) {
        // Primero actualizar la tabla para que establezca el finalResult
        updateSecondaryTable(tableType, prefilledValue);
        
        // Auto-confirmar después de un breve delay para que el usuario vea la tabla
        setTimeout(() => {
            console.log('🎯 Auto-confirmando resultado de OUT/Productive Out...');
            
            // Verificar que finalResult esté definido antes de confirmar
            if (window.cascadeState.finalResult) {
                confirmSecondaryResult();
            } else {
                console.error('❌ No se pudo auto-confirmar: finalResult no está definido');
                console.log('Estado de cascada:', window.cascadeState);
            }
        }, 2500); // 2.5 segundos para asegurar que la tabla se renderice
    }
}

// Actualizar tabla secundaria según la tirada
function updateSecondaryTable(tableType, diceValue) {
    console.log(`🔄 updateSecondaryTable llamado - Tipo: ${tableType}, Valor: ${diceValue}`);
    
    const value = parseInt(diceValue);

    // Validación especial para tablas basadas en último dígito (permite 0-9)
    if (tableType === 'Out' || tableType === 'Productive Out 1' || tableType === 'Productive Out 2') {
        if (isNaN(value) || value < 0 || value > 9) {
            console.error(`❌ Valor inválido para ${tableType}: ${value}`);
            return;
        }
    } else if (isNaN(value) || value < 1) {
        console.error(`❌ Valor inválido: ${value}`);
        return;
    }

    console.log(`✅ Valor validado: ${value}`);

    window.cascadeState.secondRoll = value;

    const displayDiv = document.getElementById('secondary-table-display');
    if (!displayDiv) return;

    let table = [];
    let isCritical = tableType === 'Critical Hit';

    switch (tableType) {
        case 'Oddity':
            table = oddityTable;
            break;
        case 'Critical Hit':
        case 'Ordinary Hit':
            table = hitTable; // Ambos usan la misma HIT TABLE
            break;
        case 'Possible Error':
            table = defenseTable;
            break;
        case 'Out':
            table = outTable;
            break;
        case 'Productive Out 1':
            table = productiveOutTable1;
            break;
        case 'Productive Out 2':
            table = productiveOutTable2;
            break;
    }

    let html = '<div class="secondary-table">';
    html += '<table style="width: 100%; border-collapse: collapse;">';

    // Encabezados diferentes según el tipo de tabla
    if (tableType === 'Oddity') {
        html += '<tr style="background: #374151; border-bottom: 2px solid #fbbf24;"><th style="padding: 0.5rem;">Roll</th><th style="padding: 0.5rem;">Oddity</th><th style="padding: 0.5rem;">Effect</th></tr>';
    } else if (tableType === 'Out' || tableType === 'Productive Out 1' || tableType === 'Productive Out 2') {
        html += '<tr style="background: #374151; border-bottom: 2px solid #fbbf24;"><th style="padding: 0.5rem;">Dígito</th><th style="padding: 0.5rem;">Resultado</th><th style="padding: 0.5rem;">Notación</th><th style="padding: 0.5rem;">Avance</th></tr>';
    } else {
        html += '<tr style="background: #374151; border-bottom: 2px solid #fbbf24;"><th style="padding: 0.5rem;">Rango</th><th style="padding: 0.5rem;">Resultado</th></tr>';
    }

    table.forEach(row => {
        let isMatch = false;

        // Para OUT TABLE, comparar con lastDigit en lugar de range
        if (tableType === 'Out') {
            isMatch = value === parseInt(row.lastDigit);
        } else {
            isMatch = checkRangeMatch(value, row.range);
        }

        const highlightStyle = isMatch ?
            'background: #dc2626; color: white; font-weight: bold; border: 2px solid #fbbf24;' :
            'background: #1f2937;';

        if (tableType === 'Oddity') {
            // Formato especial para Oddities con efecto
            html += `<tr style="${highlightStyle}">
                <td style="padding: 0.5rem; text-align: center;">${row.range}</td>
                <td style="padding: 0.5rem;">${row.result}</td>
                <td style="padding: 0.5rem; font-size: 0.9rem;">${row.effect}</td>
            </tr>`;
        } else if (tableType === 'Out') {
            // Formato especial para OUT TABLE con notación
            html += `<tr style="${highlightStyle}">
                <td style="padding: 0.5rem; text-align: center; font-size: 1.2rem; font-weight: bold;">${row.lastDigit}</td>
                <td style="padding: 0.5rem;">${row.result}</td>
                <td style="padding: 0.5rem; color: #fbbf24; font-family: monospace;">${row.notation}</td>
                <td style="padding: 0.5rem; font-size: 0.85rem; opacity: 0.8;">-</td>
            </tr>`;
        } else if (tableType === 'Productive Out 1' || tableType === 'Productive Out 2') {
            // Formato especial para Productive Out con avance de corredores
            html += `<tr style="${highlightStyle}">
                <td style="padding: 0.5rem; text-align: center; font-size: 1.2rem; font-weight: bold;">${row.lastDigit}</td>
                <td style="padding: 0.5rem;">${row.result}</td>
                <td style="padding: 0.5rem; color: #fbbf24; font-family: monospace;">${row.notation}</td>
                <td style="padding: 0.5rem; font-size: 0.85rem; color: ${isMatch ? '#10b981' : 'inherit'};">${row.advancement}</td>
            </tr>`;
        } else {
            // Formato para HIT TABLE y otras tablas
            let displayResult = row.result;
            if (row.def) {
                displayResult += `, DEF (${row.def})`;
            }

            html += `<tr style="${highlightStyle}">
                <td style="padding: 0.5rem; text-align: center;">${row.range}</td>
                <td style="padding: 0.5rem;">${displayResult}${isCritical && isMatch ? ' <strong>(+1 nivel)</strong>' : ''}</td>
            </tr>`;
        }

        if (isMatch) {
            window.cascadeState.finalResult = row.result;

            // Guardar información adicional para Productive Out
            if (tableType === 'Productive Out 1' || tableType === 'Productive Out 2') {
                window.cascadeState.advancement = row.advancement;
                window.cascadeState.outType = row.type || 'unknown';
            }
            console.log(`✅ Match encontrado! finalResult = "${row.result}"`);

            if (isCritical) {
                // Upgrade según reglas de Critical Hit
                if (row.result === 'Single' || row.result.includes('Single')) {
                    window.cascadeState.finalResult = 'Double (upgraded from Single)';
                } else if (row.result === 'Double' || row.result.includes('Double')) {
                    window.cascadeState.finalResult = 'Triple (upgraded from Double)';
                } else if (row.result === 'Triple') {
                    window.cascadeState.finalResult = 'Home Run (upgraded from Triple)';
                } else if (row.result === 'Home Run') {
                    window.cascadeState.finalResult = 'Home Run'; // Home Run se mantiene
                }
                console.log(`🔼 Critical Hit upgrade: finalResult = "${window.cascadeState.finalResult}"`);
            }
        }
    });

    html += '</table></div>';
    displayDiv.innerHTML = html;
}

// Verificar si un valor está en un rango
function checkRangeMatch(value, range) {
    if (range.includes('-')) {
        const [min, max] = range.split('-').map(n => parseInt(n.trim()));
        return value >= min && value <= max;
    } else {
        return value === parseInt(range);
    }
}

// Confirmar resultado de tabla secundaria
function confirmSecondaryResult() {
    console.log(`🔍 Intentando confirmar resultado...`);
    console.log(`📋 Estado cascada:`, window.cascadeState);

    if (!window.cascadeState.finalResult) {
        console.warn('❌ No hay finalResult definido');
        alert('⚠️ Por favor ingresa un valor de dado válido y espera a que se resalte una fila');
        return;
    }

    console.log(`✅ Resultado secundario confirmado: ${window.cascadeState.finalResult}`);

    // DETECTAR SI EL RESULTADO TIENE DEF (Defense Position)
    const resultText = window.cascadeState.finalResult.toLowerCase();
    const defMatch = window.cascadeState.finalResult.match(/\((1B|2B|3B|SS|LF|CF|RF)\)/);
    
    if (defMatch && window.cascadeState.currentTable === 'Hit Table') {
        const defPosition = defMatch[1];
        console.log(`🛡️ Detectado DEF: ${defPosition} - Mostrando Defense Table`);
        window.cascadeState.defensePosition = defPosition;
        showDefenseTable(defPosition);
        return; // No procesar aún, esperar resultado de Defense Table
    }

    // Si viene de Defense Table, combinar con resultado de Hit
    if (window.cascadeState.currentTable === 'Defense Table' && window.cascadeState.hitResult) {
        const finalResult = applyDefenseResult(window.cascadeState.hitResult, window.cascadeState.finalResult);
        processFinalResult(finalResult);
    } else {
        // Procesar el resultado final directamente
        processFinalResult(window.cascadeState.finalResult);
    }

    // Limpiar cascada (después de procesar)
    setTimeout(() => {
        closeCascade();
    }, 500);
}

// Mostrar Defense Table cuando un hit tiene DEF
function showDefenseTable(defPosition) {
    console.log(`🛡️ Mostrando Defense Table para posición: ${defPosition}`);
    
    const confirmation = document.getElementById('cascade-confirmation');
    if (!confirmation) return;

    // Guardar el resultado del hit actual
    cascadeState.hitResult = cascadeState.finalResult;
    cascadeState.currentTable = 'Defense Table';

    const defenseTable = [
        { range: "1-2", result: "Error - Runners take extra base" },
        { range: "3-9", result: "No change" },
        { range: "10-11", result: "Double → Single, runners advance 2" },
        { range: "12", result: "Hit → Out, runners hold" }
    ];

    let html = `
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 1.5rem; border-radius: 8px; border: 2px solid #f59e0b; max-width: 600px;">
            <h3 style="color: #f59e0b; margin: 0 0 1rem 0; text-align: center;">🛡️ DEFENSE TABLE (d12) - ${defPosition}</h3>
            <p style="color: #94a3b8; margin-bottom: 1rem; text-align: center;">Tira d12 para verificar jugada defensiva</p>
            
            <div style="display: flex; gap: 1rem; align-items: center; justify-content: center; margin-bottom: 1rem;">
                <label style="color: white; font-weight: bold;">Tirada d12:</label>
                <input type="number" id="defense-dice-input" min="1" max="12" 
                       style="width: 80px; padding: 0.5rem; font-size: 1.2rem; border: 2px solid #f59e0b; border-radius: 4px; text-align: center;"
                       oninput="validateDefenseDice()" />
                <button onclick="rollDefenseDice()" 
                        style="background: #f59e0b; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    🎲 Tirar d12
                </button>
            </div>
            
            <div id="defense-table-display" style="margin: 1rem 0;"></div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                <button id="confirm-defense-btn" onclick="confirmDefenseResult()" 
                        style="background: #059669; color: white; padding: 0.8rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; display: none;">
                    ✅ Confirmar Resultado
                </button>
            </div>
        </div>
    `;

    confirmation.innerHTML = html;
    confirmation.style.display = 'block';
}

// Validar entrada de dado de defensa
function validateDefenseDice() {
    const input = document.getElementById('defense-dice-input');
    if (!input) return;
    
    const value = parseInt(input.value);
    if (value >= 1 && value <= 12) {
        displayDefenseTable(value);
    }
}

// Tirar dado de defensa automáticamente
function rollDefenseDice() {
    const roll = Math.floor(Math.random() * 12) + 1;
    const input = document.getElementById('defense-dice-input');
    if (input) {
        input.value = roll;
        displayDefenseTable(roll);
    }
}

// Mostrar tabla de defensa con resultado resaltado
function displayDefenseTable(diceValue) {
    console.log(`🎲 Defense dice: ${diceValue}`);
    
    const displayDiv = document.getElementById('defense-table-display');
    if (!displayDiv) return;

    const defenseTable = [
        { range: "1-2", result: "Error - Runners take extra base" },
        { range: "3-9", result: "No change" },
        { range: "10-11", result: "Double → Single, runners advance 2" },
        { range: "12", result: "Hit → Out, runners hold" }
    ];

    let html = '<table style="width: 100%; border-collapse: collapse; background: #0f172a; margin: 1rem 0;">';
    html += '<tr style="background: #1e293b; border-bottom: 2px solid #f59e0b;"><th style="padding: 0.5rem; color: white;">Rango</th><th style="padding: 0.5rem; color: white;">Resultado</th></tr>';

    let selectedResult = null;

    defenseTable.forEach(row => {
        const [min, max] = row.range.includes('-') ? row.range.split('-').map(Number) : [parseInt(row.range), parseInt(row.range)];
        const isMatch = diceValue >= min && diceValue <= max;
        const highlightStyle = isMatch ? 
            'background-color: #dc2626 !important; color: #ffffff !important; font-weight: bold; border: 2px solid #fbbf24;' : 
            '';

        html += `<tr style="${highlightStyle}">
            <td style="padding: 0.5rem; text-align: center; color: white;">${row.range}</td>
            <td style="padding: 0.5rem; color: white;">${row.result}</td>
        </tr>`;

        if (isMatch) {
            selectedResult = row.result;
        }
    });

    html += '</table>';
    displayDiv.innerHTML = html;

    cascadeState.finalResult = selectedResult;
    
    const confirmBtn = document.getElementById('confirm-defense-btn');
    if (confirmBtn) {
        confirmBtn.style.display = 'inline-block';
    }
    
    console.log(`🛡️ Defense result: ${selectedResult}`);
}

// Confirmar resultado de defensa
function confirmDefenseResult() {
    console.log(`✅ Confirmando resultado de defensa`);
    confirmSecondaryResult();
}

// Aplicar resultado de Defense Table al hit original
function applyDefenseResult(hitResult, defenseResult) {
    console.log(`🔧 Aplicando defensa: Hit="${hitResult}", Defense="${defenseResult}"`);
    
    const defenseLower = defenseResult.toLowerCase();
    
    if (defenseLower.includes('error')) {
        return hitResult + " + Error (extra base)";
    } else if (defenseLower.includes('double → single')) {
        return 'Single (downgraded from Double)';
    } else if (defenseLower.includes('hit → out')) {
        return 'Out (great defensive play)';
    } else {
        return hitResult; // No change
    }
}

// Procesar el resultado final de la tirada
function processFinalResult(result) {
    console.log(`📊 Procesando resultado final: ${result}`);

    let hitType = null;
    let runnerAdvancement = 0;
    let isOut = false;
    let isWalk = false;
    let isError = false;
    const resultLower = result.toLowerCase();

    // ANÁLISIS EXHAUSTIVO DEL RESULTADO
    if (resultLower.includes('single')) {
        hitType = 'single';
        
        // Detectar avances especiales
        if (resultLower.includes('runners adv. 2') || resultLower.includes('runners advance 2')) {
            runnerAdvancement = 2; // Corredores avanzan 2, bateador a 1B
            console.log(`📊 Single con corredores avanzando 2 bases`);
        } else if (resultLower.includes('downgraded from double')) {
            runnerAdvancement = 1; // Single normal (rebajado)
        } else {
            runnerAdvancement = 1;
        }
    } else if (resultLower.includes('double')) {
        hitType = 'double';
        
        if (resultLower.includes('runners adv. 3') || resultLower.includes('runners advance 3')) {
            runnerAdvancement = 3; // Corredores avanzan 3, bateador a 2B
            console.log(`📊 Double con corredores avanzando 3 bases`);
        } else {
            runnerAdvancement = 2;
        }
    } else if (resultLower.includes('triple')) {
        hitType = 'triple';
        runnerAdvancement = 3;
    } else if (resultLower.includes('home run')) {
        hitType = 'homerun';
        runnerAdvancement = 4;
    } else if (resultLower.includes('walk') || resultLower.includes('hit by pitch') || resultLower.includes('interference')) {
        hitType = 'walk';
        runnerAdvancement = 1;
        isWalk = true;
    } else if (resultLower.includes('error') || resultLower.includes('extra base')) {
        hitType = 'error';
        isError = true;
        
        if (resultLower.includes('extra base')) {
            runnerAdvancement = 2; // Error da base extra
        } else {
            runnerAdvancement = 1;
        }
    } else if (resultLower.includes('out')) {
        isOut = true;

        // OUTS PRODUCTIVOS - Detectar avance de corredores
        if (resultLower.includes('runner on 3rd scores') || resultLower.includes('scores')) {
            runnerAdvancement = 1; // Solo corredor de 3ra anota
            console.log(`📊 Out productivo: Corredor de 3ra anota`);
        } else if (resultLower.includes('runners on 2nd and 3rd advance')) {
            runnerAdvancement = 1; // Corredores de 2da y 3ra avanzan
            console.log(`📊 Out productivo: Corredores de 2da y 3ra avanzan`);
        } else if (resultLower.includes('great defensive play')) {
            runnerAdvancement = 0; // No avanzan
            console.log(`🥊 Gran jugada defensiva - Corredores no avanzan`);
        }
    }

    console.log(`📊 Tipo: ${hitType || 'out'}, Avance: ${runnerAdvancement}, Out: ${isOut}`);

    // ACTUALIZAR ESTADÍSTICAS
    if (isOut) {
        console.log('⚾ Out registrado');
        // Procesar outs productivos
        if (runnerAdvancement > 0) {
            advanceRunnersOnOut(runnerAdvancement);
        }
    } else {
        // Es un hit o walk
        gameState.hits[gameState.isTopHalf ? 'visitante' : 'local']++;

        if (isError) {
            gameState.errors[gameState.isTopHalf ? 'local' : 'visitante']++;
        }

        console.log(`✅ ${hitType.toUpperCase()}! Avance: ${runnerAdvancement} base(s)`);

        // MOVER TOKENS Y AVANZAR CORREDORES
        // Si hay "extra base", los corredores avanzan una base adicional
        if (resultLower.includes('extra base') && !resultLower.includes('out')) {
            advanceRunnersWithExtraBase(runnerAdvancement, true);
        } else {
            advanceRunners(runnerAdvancement, true);
        }
        
        // Actualizar display
        updateGameDisplay();
        updateBasesDisplay();

        console.log('⏸️ Esperando confirmación del usuario para avanzar...');
    }

    // Mostrar animación en el campo
    animateFieldResult(hitType, runnerAdvancement, isOut);
}

// Avanzar corredores solo en outs productivos (sin incluir bateador)
function advanceRunnersOnOut(advancement) {
    console.log(`🏃 Out productivo - Avanzando corredores ${advancement} base(s)`);

    const newBases = {
        first: null,
        second: null,
        third: null
    };

    // Solo mover corredores existentes, NO agregar bateador
    if (gameState.bases.third && advancement >= 1) {
        // Corredor de 3ra anota
        const runner = gameState.bases.third;
        const team = gameState.isTopHalf ? 'visitante' : 'local';
        
        if (gameState.isTopHalf) {
            gameState.score.totalVisitante++;
            gameState.score.visitante[gameState.currentInning - 1]++;
        } else {
            gameState.score.totalLocal++;
            gameState.score.local[gameState.currentInning - 1]++;
        }
        
        console.log(`🏠 ¡Carrera anotada en out productivo! ${runner.name}`);
        animateRunnerScoring('third');
    }

    if (gameState.bases.second && advancement >= 1) {
        newBases.third = gameState.bases.second;
        animateRunnerMoving('second', 'third');
    }

    if (gameState.bases.first && advancement >= 1) {
        newBases.second = gameState.bases.first;
        animateRunnerMoving('first', 'second');
    }

    gameState.bases = newBases;
    updateGameDisplay();
    updateBasesDisplay();
}

// Avanzar corredores CON BASE EXTRA (Defense Table: "Runners take an extra base")
// Los corredores existentes avanzan una base ADICIONAL, el bateador va a su base normal
function advanceRunnersWithExtraBase(batterAdvancement, includeBatter = false) {
    console.log(`🏃💨 AVANCE CON BASE EXTRA: Bateador ${batterAdvancement} base(s), Corredores ${batterAdvancement + 1} base(s)`);

    const battingTeam = getCurrentBattingTeam();
    const currentBatter = getCurrentBatter();
    let rbisScored = 0;

    const newBases = {
        first: null,
        second: null,
        third: null
    };

    // CORREDORES AVANZAN UNA BASE EXTRA (batterAdvancement + 1)
    const runnerAdvancement = batterAdvancement + 1;

    // Procesar corredor en 3ra
    if (gameState.bases.third) {
        const runner = gameState.bases.third;
        if (runnerAdvancement >= 1) {
            // Anota desde 3ra
            const team = gameState.isTopHalf ? 'visitante' : 'local';
            if (gameState.isTopHalf) {
                gameState.score.totalVisitante++;
                gameState.score.visitante[gameState.currentInning - 1]++;
            } else {
                gameState.score.totalLocal++;
                gameState.score.local[gameState.currentInning - 1]++;
            }
            rbisScored++;
            console.log(`🏠 ¡Carrera anotada desde 3ra! ${runner.name} (RBI)`);
            animateRunnerScoring('third');
        }
    }

    // Procesar corredor en 2da
    if (gameState.bases.second) {
        const runner = gameState.bases.second;
        if (runnerAdvancement >= 2) {
            // Anota desde 2da (con base extra)
            const team = gameState.isTopHalf ? 'visitante' : 'local';
            if (gameState.isTopHalf) {
                gameState.score.totalVisitante++;
                gameState.score.visitante[gameState.currentInning - 1]++;
            } else {
                gameState.score.totalLocal++;
                gameState.score.local[gameState.currentInning - 1]++;
            }
            rbisScored++;
            console.log(`🏠 ¡Carrera anotada desde 2da con base extra! ${runner.name} (RBI)`);
            animateRunnerScoring('second');
        } else if (runnerAdvancement === 1) {
            newBases.third = runner;
            animateRunnerMoving('second', 'third');
        }
    }

    // Procesar corredor en 1ra
    if (gameState.bases.first) {
        const runner = gameState.bases.first;
        if (runnerAdvancement >= 3) {
            // Anota desde 1ra (con base extra)
            const team = gameState.isTopHalf ? 'visitante' : 'local';
            if (gameState.isTopHalf) {
                gameState.score.totalVisitante++;
                gameState.score.visitante[gameState.currentInning - 1]++;
            } else {
                gameState.score.totalLocal++;
                gameState.score.local[gameState.currentInning - 1]++;
            }
            rbisScored++;
            console.log(`🏠 ¡Carrera anotada desde 1ra con base extra! ${runner.name} (RBI)`);
            animateRunnerScoring('first');
        } else if (runnerAdvancement === 2) {
            newBases.third = runner;
            animateRunnerMoving('first', 'third');
        } else if (runnerAdvancement === 1) {
            newBases.second = runner;
            animateRunnerMoving('first', 'second');
        }
    }

    // BATEADOR va a su base NORMAL (sin base extra)
    if (includeBatter && currentBatter) {
        // Eliminar token del bateador de home antes de moverlo
        const runnersContainer = document.getElementById('runners-container');
        if (runnersContainer) {
            const batterToken = runnersContainer.querySelector('[data-current-base="home"]');
            if (batterToken) {
                batterToken.remove();
                console.log('✅ Token del bateador removido de home (extra base)');
            }
        }
        
        const batterData = {
            id: currentBatter.id,
            number: currentBatter.number,
            name: currentBatter.name,
            team: battingTeam,
            mlbId: currentBatter.mlbId,
            isCustomTeam: currentBatter.isCustomTeam || false,
            customPhotoUrl: currentBatter.customPhotoUrl || null
        };

        if (batterAdvancement >= 4) {
            // Home run del bateador
            const team = gameState.isTopHalf ? 'visitante' : 'local';
            if (gameState.isTopHalf) {
                gameState.score.totalVisitante++;
                gameState.score.visitante[gameState.currentInning - 1]++;
            } else {
                gameState.score.totalLocal++;
                gameState.score.local[gameState.currentInning - 1]++;
            }
            rbisScored++;
            animateRunnerScoring('batter');
        } else if (batterAdvancement === 3) {
            newBases.third = batterData;
            createRunnerToken(batterData, 'third');
        } else if (batterAdvancement === 2) {
            newBases.second = batterData;
            createRunnerToken(batterData, 'second');
        } else if (batterAdvancement === 1) {
            newBases.first = batterData;
            createRunnerToken(batterData, 'first');
        }
    }

    // Actualizar RBIs del bateador
    if (rbisScored > 0 && currentBatter) {
        console.log(`📊 ${rbisScored} RBI(s) para ${currentBatter.name}`);
    }

    // Actualizar estado
    gameState.bases = newBases;
    updateGameDisplay();
    updateBasesDisplay();
}

// Avanzar corredores en las bases
// Avanzar corredores en las bases CON ANIMACIÓN Y RBIs
function advanceRunners(bases, includeBatter = false) {
    console.log(`🏃 Avanzando corredores ${bases} base(s), incluir bateador: ${includeBatter}`);

    const battingTeam = getCurrentBattingTeam();
    const currentBatter = getCurrentBatter();
    let rbisScored = 0; // Contador de RBIs

    // Calcular nuevas posiciones Y contar carreras
    const newBases = {
        first: null,
        second: null,
        third: null
    };

    // PASO 1: Procesar corredor en 3ra base
    if (gameState.bases.third) {
        const runner = gameState.bases.third;
        if (bases >= 1) {
            // Anota desde 3ra
function advanceRunners(bases, includeBatter = false) {
    console.log(`🏃 Avanzando corredores ${bases} base(s), incluir bateador: ${includeBatter}`);

    // Calcular nuevas posiciones
    const newBases = {
        first: null,
        second: null,
        third: null
    };

    // Mover corredores existentes
    if (gameState.bases.third) {
        const runner = gameState.bases.third;
        // Corredor de 3ra anota
        const team = gameState.isTopHalf ? 'visitante' : 'local';
        if (gameState.isTopHalf) {
            gameState.score.totalVisitante++;
            gameState.score.visitante[gameState.currentInning - 1]++;
        } else {
            gameState.score.totalLocal++;
            gameState.score.local[gameState.currentInning - 1]++;
        }
        console.log(`🏠 ¡Carrera anotada! Score ${team}: ${gameState.score[team]}`);

        // Animar desaparición del corredor de 3ra
        animateRunnerScoring('third');
    }

    if (gameState.bases.second) {
        const runner = gameState.bases.second;
        if (bases >= 2) {
            // Anota desde 2da
            const team = gameState.isTopHalf ? 'visitante' : 'local';
            if (gameState.isTopHalf) {
                gameState.score.totalVisitante++;
                gameState.score.visitante[gameState.currentInning - 1]++;
            } else {
                gameState.score.totalLocal++;
                gameState.score.local[gameState.currentInning - 1]++;
            }
            animateRunnerScoring('second');
        } else if (bases === 1) {
            newBases.third = runner;
            animateRunnerMoving('second', 'third');
        }
    }

    if (gameState.bases.first) {
        const runner = gameState.bases.first;
        if (bases >= 3) {
            // Anota desde 1ra
            const team = gameState.isTopHalf ? 'visitante' : 'local';
            if (gameState.isTopHalf) {
                gameState.score.totalVisitante++;
                gameState.score.visitante[gameState.currentInning - 1]++;
            } else {
                gameState.score.totalLocal++;
                gameState.score.local[gameState.currentInning - 1]++;
            }
            animateRunnerScoring('first');
        } else if (bases === 2) {
            newBases.third = runner;
            animateRunnerMoving('first', 'third');
        } else if (bases === 1) {
            newBases.second = runner;
            animateRunnerMoving('first', 'second');
        }
    }

    // Colocar bateador si corresponde
    if (includeBatter) {
        const currentBatter = getCurrentBatter();
        const battingTeam = getCurrentBattingTeam();
        
        // Eliminar token del bateador de home antes de moverlo
        const runnersContainer = document.getElementById('runners-container');
        if (runnersContainer) {
            const batterToken = runnersContainer.querySelector('[data-current-base="home"]');
            if (batterToken) {
                batterToken.remove();
                console.log('✅ Token del bateador removido de home');
            }
        }
        
        if (currentBatter) {
            const batterData = {
                id: currentBatter.id,
                number: currentBatter.number,
                name: currentBatter.name,
                team: battingTeam,
                mlbId: currentBatter.mlbId,
                isCustomTeam: currentBatter.isCustomTeam || false,
                customPhotoUrl: currentBatter.customPhotoUrl || null
            };
            
            if (bases >= 4) {
                // Home run del bateador
                const team = gameState.isTopHalf ? 'visitante' : 'local';
                if (gameState.isTopHalf) {
                    gameState.score.totalVisitante++;
                    gameState.score.visitante[gameState.currentInning - 1]++;
                } else {
                    gameState.score.totalLocal++;
                    gameState.score.local[gameState.currentInning - 1]++;
                }
                animateRunnerScoring('batter');
            } else if (bases === 3) {
                newBases.third = batterData;
                createRunnerToken(batterData, 'third');
            } else if (bases === 2) {
                newBases.second = batterData;
                createRunnerToken(batterData, 'second');
            } else if (bases === 1) {
                newBases.first = batterData;
                createRunnerToken(batterData, 'first');
            }
        }
    }

    // Actualizar estado
    gameState.bases = newBases;
}

// Animar corredor anotando (desaparece con pop)
function animateRunnerScoring(from) {
    console.log(`🏠 Animando anotación desde ${from}`);
    // TODO: Implementar animación visual con efecto pop
    // Por ahora solo log
}

// Animar corredor moviéndose entre bases
function animateRunnerMoving(from, to) {
    console.log(`🏃 Animando movimiento: ${from} → ${to}`);
    // TODO: Implementar animación visual de transición
    // Por ahora solo log           style="background: #059669; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; margin-right: 0.5rem;">
                    ✅ Confirmar
                </button>
                <button onclick="cancelCascade()" 
                        style="background: #dc2626; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px;">
                    ❌ Cancelar
                </button>
            </div>
        `;
    }
}

// Mostrar Defense Table como cascada adicional
// Cancelar cascada
function cancelCascade() {
    closeCascade();
    console.log('❌ Cascada cancelada');
}

// Cerrar cascada
function closeCascade() {
    const confirmation = document.getElementById('cascade-confirmation');
    if (confirmation) {
        confirmation.style.display = 'none';
        confirmation.innerHTML = '';
    }

    // Resetear estado de cascada
    cascadeState = {
        currentTable: null,
        firstRoll: null,
        secondRoll: null,
        eventType: null,
        finalResult: null
    };
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
    const currentRoll = gameState.currentDiceRoll || gameState.lastRollDetails?.total;
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

    // LIMPIAR CASCADA Y DADOS ANTES DE AVANZAR
    console.log('🧹 Limpiando cascada y dados antes de avanzar...');
    resetCascadeSystemComplete();
    
    // Limpiar dados visualmente
    const diceResults = document.querySelectorAll('[id*="dice-results-display"]');
    diceResults.forEach(result => {
        result.style.display = 'none';
    });
    
    // Limpiar valores de dados
    gameState.currentDiceRoll = null;
    gameState.lastRollDetails = null;

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
    
    // Actualizar display y mostrar selector de intenciones
    updateGameDisplay();
    console.log('✅ Jugada confirmada y siguiente bateador listo');
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

    // 2. SOLO OCULTAR CASCADA SI NO HAY TIRADA ACTIVA
    if (!gameState.currentDiceRoll) {
        hideCascadeSystem();
        console.log(`✅ Sistema de cascada ocultado (no hay tirada activa)`);
    } else {
        console.log(`⏭️ Sistema de cascada PRESERVADO (hay tirada activa: ${gameState.currentDiceRoll})`);
    }

    // 3. RESETEAR RESULTADO INICIAL SOLO SI NO HAY TIRADA
    const initialResult = document.getElementById('initial-result');
    if (initialResult && !gameState.currentDiceRoll) {
        initialResult.textContent = '-';
        console.log(`✅ Resultado inicial reseteado`);
    }

    // 4. RESETEAR ESTADO DE CASCADA SOLO SI NO HAY TIRADA
    const cascadeStatus = document.getElementById('cascade-current-action');
    if (cascadeStatus && !gameState.currentDiceRoll) {
        cascadeStatus.textContent = 'Sistema activo - Esperando tirada...';
        console.log(`✅ Estado de cascada reseteado`);
    }

    // 5. LIMPIAR CONTENIDO DE OPCIONES DE CASCADA SOLO SI NO HAY TIRADA
    const cascadeOptions = document.getElementById('cascade-options');
    if (cascadeOptions && !gameState.currentDiceRoll) {
        cascadeOptions.innerHTML = '';
        console.log(`✅ Opciones de cascada limpiadas`);
    }

    // 6. RESETEAR VARIABLES GLOBALES RELACIONADAS
    if (window.currentCascadeLevel && !gameState.currentDiceRoll) {
        window.currentCascadeLevel = 0;
        console.log(`✅ Nivel de cascada reseteado`);
    }

    // 7-8: NO OCULTAR NADA SI HAY TIRADA ACTIVA
    if (!gameState.currentDiceRoll) {
        // OCULTAR CUALQUIER TABLA DE SWING RESULT
        const swingTables = document.querySelectorAll('.swing-result-table');
        swingTables.forEach(table => {
            if (table.parentElement) {
                table.parentElement.style.display = 'none';
            }
        });
        console.log(`✅ Tablas de swing result ocultadas`);

        // LIMPIAR CUALQUIER DROPDOWN ACTIVO
        const cascadeDropdown = document.getElementById('cascade-dropdown');
        if (cascadeDropdown) {
            cascadeDropdown.style.display = 'none';
            cascadeDropdown.innerHTML = '';
            console.log(`✅ Dropdown de cascada limpiado`);
        }
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
          OCULTAR Y RESETEAR DROPDOWN/CASCADA
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
        console.log(`✅ Nivel de cascada reseteado`);   z-index: 10 !important;
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

    // Mostrar sistema de robo de base si hay corredores
    const hasRunners = gameState.bases.first || gameState.bases.second || gameState.bases.third;
    if (hasRunners) {
        showStealBaseSystem();
    } else {
        const stealBtn = document.getElementById('steal-base-container');
        if (stealBtn) stealBtn.style.display = 'none';
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

// ===== TABLA DE BUNTING (D6) - TABLA OFICIAL DEADBALL =====
// Usada cuando el bateador intenta un toque/bunt
// TODOS los resultados son FINALES (no hay strikes/balls)
const buntTable = [
    { range: '1-2', event: 'Lead Runner Out', result: 'Corredor líder out, bateador safe en 1B', highlighted: false },
    { range: '3', event: 'Situational', result: 'Si corredor en 1B/2B: corredor avanza, bateador out. Si corredor en 3B: corredor out, bateador safe', highlighted: false },
    { range: '4-5', event: 'Sacrifice', result: 'Corredor líder avanza, bateador out', highlighted: false },
    { range: '6', event: 'Hit Check', result: 'Si bateador 5+ hitting: Single DEF (-1B). Si no: corredor avanza, bateador out', highlighted: false }
];

// ===== SISTEMA DE ROBO DE BASES =====

/**
 * Actualiza la visibilidad del botón de Robar Base
 * Se muestra solo si hay corredores en base
 */
function updateStealBaseButton() {
    const stealContainer = document.getElementById('steal-base-container');
    if (!stealContainer) return;

    // Verificar si hay corredores en base
    const hasRunners = gameState.bases.first !== null ||
        gameState.bases.second !== null ||
        gameState.bases.third !== null;

    if (hasRunners && gameState.outs < 3) {
        stealContainer.style.display = 'block';
    } else {
        stealContainer.style.display = 'none';
    }
}

/**
 * Abre el diálogo para seleccionar qué corredor(es) intentan robar
 */
function openStealBaseDialog() {
    console.log('⚡ Abriendo diálogo de robo de bases...');

    const runners = [];

    // Detectar corredores disponibles para robo
    if (gameState.bases.first !== null) {
        runners.push({ base: 'first', target: 'second', name: gameState.bases.first.name });
    }
    if (gameState.bases.second !== null) {
        runners.push({ base: 'second', target: 'third', name: gameState.bases.second.name, penalty: -1 });
    }
    if (gameState.bases.third !== null) {
        runners.push({ base: 'third', target: 'home', name: gameState.bases.third.name });
    }

    if (runners.length === 0) {
        alert('No hay corredores en base');
        return;
    }

    // Mostrar diálogo de selección
    showStealSelectionDialog(runners);
}

/**
 * Muestra el diálogo para seleccionar corredor(es)
 */
function showStealSelectionDialog(runners) {
    const cascadeContainer = document.getElementById('cascade-confirmation');
    if (!cascadeContainer) return;

    let html = `
        <div style="background: #1e3a5f; color: white; padding: 1.5rem; border-radius: 12px; border: 3px solid #fbbf24; box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);">
            <h2 style="margin: 0 0 1rem 0; color: #fbbf24;">⚡ ROBO DE BASES</h2>
            <p style="margin: 0 0 1rem 0; opacity: 0.9;">Selecciona qué corredor(es) intentan robar:</p>
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
    `;

    runners.forEach((runner, index) => {
        const penaltyText = runner.penalty ? ` <span style="color: #ef4444;">(${runner.penalty})</span>` : '';
        html += `
            <label style="display: flex; align-items: center; padding: 0.75rem; background: rgba(251, 191, 36, 0.1); border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;">
                <input type="checkbox" id="steal-runner-${index}" value="${runner.base}" 
                       style="width: 20px; height: 20px; margin-right: 0.75rem; cursor: pointer;">
                <span style="flex: 1; font-size: 1.1rem;">
                    <strong>${runner.name}</strong>: ${runner.base === 'first' ? '1ª' : runner.base === 'second' ? '2ª' : '3ª'} → 
                    ${runner.target === 'second' ? '2ª' : runner.target === 'third' ? '3ª' : 'Home'}${penaltyText}
                </span>
            </label>
        `;
    });

    html += `
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="executeStealAttempt()" 
                        style="flex: 1; background: #f59e0b; color: white; padding: 0.75rem; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                    🎲 Intentar Robo
                </button>
                <button onclick="closeCascade()" 
                        style="flex: 1; background: #dc2626; color: white; padding: 0.75rem; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                    ❌ Cancelar
                </button>
            </div>
        </div>
    `;

    cascadeContainer.style.display = 'block';
    cascadeContainer.innerHTML = html;
}

/**
 * Ejecuta el intento de robo según la selección
 */
function executeStealAttempt() {
    const selected = [];
    const inputs = document.querySelectorAll('[id^="steal-runner-"]');

    inputs.forEach((input, index) => {
        if (input.checked) {
            selected.push(input.value);
        }
    });

    if (selected.length === 0) {
        alert('⚠️ Selecciona al menos un corredor');
        return;
    }

    console.log(`🏃 Intentando robo: ${selected.join(', ')}`);

    // Determinar si es robo simple o doble
    if (selected.length === 1) {
        performSingleSteal(selected[0]);
    } else if (selected.length === 2) {
        performDoubleSteal(selected);
    } else {
        alert('⚠️ Solo puedes intentar robar con 1 o 2 corredores a la vez');
    }
}

/**
 * Realiza un robo simple
 */
function performSingleSteal(base) {
    const runner = gameState.bases[base];
    if (!runner) return;

    // Aplicar penalizador si es de 2ª a 3ª
    const penalty = base === 'second' ? -1 : 0;

    // Tirar d8
    const roll = Math.floor(Math.random() * 8) + 1;
    const adjustedRoll = Math.max(1, Math.min(8, roll + penalty));

    const result = baseStealingTable.find(r => r.roll === adjustedRoll);

    console.log(`🎲 Robo simple: d8=${roll}${penalty !== 0 ? ` (${roll}${penalty}=${adjustedRoll})` : ''} → ${result.result}`);
    
    // Mostrar resultado
    showStealResult(base, null, roll, penalty, adjustedRoll, result, false);
}

/**
 * Realiza un robo doble
 */
function performDoubleSteal(bases) {
    // Tirar d8
    const roll = Math.floor(Math.random() * 8) + 1;
    const result = doubleStealTable.find(r => r.roll === roll);
    
    console.log(`🎲 Robo doble: d8=${roll} → ${result.result}`);
    
    // Mostrar resultado
    showStealResult(bases[0], bases[1], roll, 0, roll, result, true);
}

/**
 * Muestra el resultado del intento de robo
 */
function showStealResult(base1, base2, originalRoll, penalty, finalRoll, result, isDouble) {
    const cascadeContainer = document.getElementById('cascade-confirmation');
    if (!cascadeContainer) return;
    
    const baseNames = {
        'first': '1ª Base',
        'second': '2ª Base',
        'third': '3ª Base'
    };
    
    const penaltyText = penalty !== 0 ? `<p style="margin: 0.5rem 0; color: #ef4444;">Penalizador 2ª→3ª: ${penalty}</p>` : '';
    
    let html = `
        <div style="background: #1e3a5f; color: white; padding: 1.5rem; border-radius: 12px; border: 3px solid #fbbf24;">
            <h2 style="margin: 0 0 1rem 0; color: #fbbf24;">⚡ RESULTADO DEL ROBO</h2>
            
            <div style="background: rgba(251, 191, 36, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <p style="margin: 0; font-size: 1.2rem;"><strong>Tirada:</strong> d8 = ${originalRoll}</p>
                ${penaltyText}
                ${penalty !== 0 ? `<p style="margin: 0.5rem 0; color: #fbbf24;"><strong>Tirada Final:</strong> ${finalRoll}</p>` : ''}
            </div>
            
            <div style="background: ${result.result.includes('Success') || result.result.includes('Safe') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <p style="margin: 0 0 0.5rem 0; font-size: 1.3rem; font-weight: bold; color: ${result.result.includes('Success') || result.result.includes('Safe') ? '#10b981' : '#ef4444'};">
                    ${result.result}
                </p>
                <p style="margin: 0; opacity: 0.9;">${result.description}</p>
            </div>
            
            <button onclick="applyStealResult('${base1}', '${base2}', '${result.result}', ${isDouble})" 
                    style="width: 100%; background: #059669; color: white; padding: 0.75rem; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                ✅ Aplicar Resultado
            </button>
        </div>
    `;
    
    cascadeContainer.innerHTML = html;
}

/**
 * Aplica el resultado del robo al campo
 */
function applyStealResult(base1, base2, resultText, isDouble) {
    console.log(`✅ Aplicando resultado de robo: ${resultText}`);
    
    if (!isDouble) {
        // Robo simple
        const runner = gameState.bases[base1];
        if (!runner) return;
        
        if (resultText.includes('Success')) {
            // Éxito - mover corredor
            const targetBase = base1 === 'first' ? 'second' : base1 === 'second' ? 'third' : null;
            if (targetBase) {
                gameState.bases[targetBase] = runner;
                gameState.bases[base1] = null;
                console.log(`🏃 ${runner.name} roba ${targetBase}`);
            } else if (base1 === 'third') {
                // Robo de home - anota carrera
                const team = gameState.isTopHalf ? 'visitante' : 'local';
                gameState.score[team]++;
                gameState.bases.third = null;
                console.log(`⚾ ${runner.name} roba home y anota!`);
            }
        } else if (resultText.includes('Failure')) {
            // Out - eliminar corredor
            gameState.bases[base1] = null;
            gameState.outs++;
            console.log(`❌ ${runner.name} eliminado intentando robar`);
            
            if (gameState.outs >= 3) {
                changeInning();
            }
        }
    } else {
        // Robo doble - lógica más compleja
        // (implementación simplificada)
        if (resultText.includes('Both Safe')) {
            // Ambos seguros
            console.log('✅ Robo doble exitoso');
        } else if (resultText.includes('Both Out')) {
            gameState.outs += 2;
            if (gameState.outs >= 3) changeInning();
        }
    }
    
    // Actualizar displays
    updateBasesDisplay();
    updateGameDisplay();
    updateStealBaseButton();
    
    // Cerrar diálogo
    closeCascade();
}

// ===== SISTEMA DE BUNTING =====
// El bunt se accede SOLO desde el selector de intenciones inicial
// NO tiene botón durante el bateo normal

function showBuntDiceSystem() {
    console.log('🎯 Mostrando sistema de dados para BUNT (d6)...');

    // Determinar qué equipo está bateando
    const battingTeam = getCurrentBattingTeam();
    console.log(`🎯 Equipo bateando: ${battingTeam}`);

    // Ocultar selector de intenciones del equipo correspondiente
    const intentionContainer = document.getElementById(`intention-container-${battingTeam}`);
    if (intentionContainer) {
        intentionContainer.style.cssText = 'display: none !important;';
    }

    // Crear interfaz de dados específica para bunt
    const diceContainer = document.getElementById(`dice-container-${battingTeam}`);
    if (!diceContainer) {
        console.error(`❌ No se encontró dice-container-${battingTeam}`);
        return;
    }

    // Forzar visibilidad
    diceContainer.style.cssText = `
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%) !important;
        border-radius: 20px !important;
        border: 3px solid #a78bfa !important;
        padding: 2rem !important;
        margin-top: 1rem !important;
    `;

    diceContainer.innerHTML = `
        <div class="bunt-dice-system" style="color: white;">
            <div class="dice-header" style="text-align: center; margin-bottom: 1.5rem;">
                <h3 style="color: #fbbf24; font-size: 1.8rem; margin-bottom: 0.5rem;">🎯 INTENTO DE TOQUE/BUNT</h3>
                <p class="dice-instruction" style="font-size: 1.1rem; color: #e5e7eb;">Tira 1d6 para el resultado del bunt</p>
            </div>
            
            <div class="dice-controls" style="margin-bottom: 1.5rem;">
                <div class="dice-input-group" style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
                    <label style="font-size: 1.1rem; font-weight: bold; color: white;">Resultado d6:</label>
                    <div class="dice-input-wrapper" style="display: flex; gap: 0.5rem;">
                        <input type="number" id="bunt-dice-value" min="1" max="6" value="1" 
                               class="dice-input" 
                               style="width: 80px; padding: 0.5rem; font-size: 1.2rem; border-radius: 8px; border: 2px solid #a78bfa; text-align: center;">
                        <button onclick="rollBuntDice()" class="mini-dice-btn" 
                                style="padding: 0.5rem 1rem; font-size: 1.5rem; background: #fbbf24; border: none; border-radius: 8px; cursor: pointer;">🎲</button>
                    </div>
                </div>
            </div>

            <div class="dice-actions" style="display: flex; justify-content: center; gap: 1rem;">
                <button onclick="processBuntRoll()" 
                        class="roll-dice-btn" 
                        style="background: #10b981; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer;">✓ Ver Resultado</button>
                <button onclick="cancelBunt()" 
                        class="cancel-btn" 
                        style="background: #6c757d; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer;">✗ Cancelar</button>
            </div>
        </div>
    `;

    console.log('✅ Sistema de dados de bunt mostrado');
}

function rollBuntDice() {
    const roll = Math.floor(Math.random() * 6) + 1;
    const input = document.getElementById('bunt-dice-value');
    if (input) {
        input.value = roll;
    }
    console.log(`🎲 Tirada de bunt: ${roll}`);
}

function cancelBunt() {
    console.log('❌ Bunt cancelado');
    
    // Determinar qué equipo está bateando
    const battingTeam = getCurrentBattingTeam();
    
    // Volver a mostrar el selector de intenciones
    const intentionContainer = document.getElementById(`intention-container-${battingTeam}`);
    if (intentionContainer) {
        intentionContainer.style.display = 'block';
    }
    
    const diceContainer = document.getElementById(`dice-container-${battingTeam}`);
    if (diceContainer) {
        diceContainer.style.display = 'none';
        diceContainer.innerHTML = '';
    }
}

function processBuntRoll() {
    const input = document.getElementById('bunt-dice-value');
    if (!input) return;

    const diceRoll = parseInt(input.value);
    if (isNaN(diceRoll) || diceRoll < 1 || diceRoll > 6) {
        alert('⚠️ Por favor ingresa un valor válido entre 1 y 6');
        return;
    }

    console.log(`🎯 Procesando tirada de bunt: ${diceRoll}`);

    // Buscar resultado en la tabla
    const result = buntTable.find(row => {
        const [min, max] = row.range.includes('-') 
            ? row.range.split('-').map(Number) 
            : [Number(row.range), Number(row.range)];
        return diceRoll >= min && diceRoll <= max;
    });

    if (result) {
        console.log(`✅ Resultado de bunt: ${result.event} - ${result.result}`);
        showBuntResult(diceRoll, result);
    }
}

function openBuntDialog() {
    console.log('🎯 Abriendo diálogo de Bunt');

    const modal = document.createElement('div');
    modal.className = 'steal-base-modal';
    modal.id = 'bunt-modal';

    modal.innerHTML = `
        <div class="steal-base-dialog">
            <div class="steal-dialog-header">
                <h3>🎯 Intentar Bunt</h3>
                <button class="close-btn" onclick="closeBuntDialog()">×</button>
            </div>
            <div class="steal-dialog-content">
                <p class="steal-info">El bateador intentará un bunt.</p>
                <p class="steal-warning">⚠️ Se tirará d20 en la tabla de Bunting</p>
                <div class="steal-actions">
                    <button class="steal-confirm-btn" onclick="executeBunt()">
                        ✓ Ejecutar Bunt
                    </button>
                    <button class="steal-cancel-btn" onclick="closeBuntDialog()">
                        ✗ Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Animación de entrada
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeBuntDialog() {
    const modal = document.getElementById('bunt-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function executeBunt() {
    console.log('🎯 Ejecutando bunt desde diálogo...');
    closeBuntDialog();

    // Tirar d6 para la tabla de bunting
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    console.log(`🎲 Tirada de bunt: ${diceRoll}`);

    // Buscar resultado en la tabla
    const result = buntTable.find(row => {
        const [min, max] = row.range.includes('-') 
            ? row.range.split('-').map(Number) 
            : [Number(row.range), Number(row.range)];
        return diceRoll >= min && diceRoll <= max;
    });

    if (result) {
        console.log(`✅ Resultado de bunt: ${result.event} - ${result.result}`);
        showBuntResult(diceRoll, result);
    }
}

function showBuntResult(diceRoll, result) {
    const cascadeContainer = document.getElementById('cascade-confirmation');
    if (!cascadeContainer) return;

    cascadeContainer.style.display = 'block';

    // Crear tabla HTML para mostrar resultado
    const highlightedTable = buntTable.map(row => {
        const [min, max] = row.range.includes('-') 
            ? row.range.split('-').map(Number) 
            : [Number(row.range), Number(row.range)];
        const isHighlighted = diceRoll >= min && diceRoll <= max;
        return `
            <tr class="${isHighlighted ? 'highlighted' : ''}">
                <td class="range-column">${row.range}</td>
                <td class="event-column">${row.event}</td>
                <td class="result-column">${row.result}</td>
            </tr>
        `;
    }).join('');

    cascadeContainer.innerHTML = `
        <div class="cascade-header">
            <h4>🎯 Resultado del Bunt (d6: ${diceRoll})</h4>
        </div>
        <div class="cascade-table-container">
            <table class="cascade-table">
                <thead>
                    <tr>
                        <th>Tirada</th>
                        <th>Evento</th>
                        <th>Resultado</th>
                    </tr>
                </thead>
                <tbody>
                    ${highlightedTable}
                </tbody>
            </table>
        </div>
        <div class="cascade-actions">
            <button class="cascade-confirm-btn" onclick="processBuntResult('${result.event}', '${result.result.replace(/'/g, "\\'")}')">✓ Aplicar Resultado</button>
        </div>
    `;
}

function processBuntResult(event, result) {
    console.log(`🎯 Procesando resultado de bunt: ${event}`);

    // Obtener información del bateador actual y equipo
    const currentBatter = getCurrentBatter();
    const battingTeam = getCurrentBattingTeam();
    const battingAvg = currentBatter ? currentBatter.battingAvg : 0;

    // Variables para estadísticas
    let isOut = false;
    let isHit = false;
    let hitType = null;

    // Identificar corredor líder
    const leadRunner = getLeadRunner();
    const leadRunnerBase = leadRunner;

    // Procesar según el tipo de resultado (TABLA OFICIAL)
    switch (event) {
        case 'Lead Runner Out':
            // 1-2: Corredor líder out, bateador safe en 1B
            if (leadRunner) {
                eliminateRunner(leadRunner);
                gameState.outs++;
                console.log(`❌ Corredor de ${leadRunner} out`);
            }
            moveBatterToBase('first');
            isHit = true;
            hitType = 'Single';
            console.log('✅ Bateador safe en 1B');
            break;

        case 'Situational':
            // 3: Depende de dónde está el corredor líder
            if (leadRunnerBase === 'third') {
                // Corredor en 3B: corredor out, bateador safe
                eliminateRunner('third');
                gameState.outs++;
                moveBatterToBase('first');
                isHit = true;
                hitType = 'Single';
                console.log('❌ Corredor de 3B out, ✅ bateador safe en 1B');
            } else if (leadRunnerBase === 'second' || leadRunnerBase === 'first') {
                // Corredor en 1B/2B: corredor avanza, bateador out
                advanceAllRunners(1);
                eliminateBatter();
                gameState.outs++;
                isOut = true;
                console.log('✅ Corredor avanza, ❌ bateador out');
            } else {
                // Sin corredores: bateador out
                eliminateBatter();
                gameState.outs++;
                isOut = true;
                console.log('❌ Bateador out');
            }
            break;

        case 'Sacrifice':
            // 4-5: Corredor líder avanza, bateador out
            advanceAllRunners(1);
            eliminateBatter();
            gameState.outs++;
            isOut = true;
            console.log('✅ Corredor avanza, ❌ bateador out (sacrifice)');
            break;

        case 'Hit Check':
            // 6: Verificar hitting del bateador
            if (battingAvg >= 0.285) { // 5+ en la escala de DEADBALL ≈ .285+
                // Single DEF (-1B): Es un hit, todos avanzan
                advanceAllRunners(1);
                moveBatterToBase('first');
                isHit = true;
                hitType = 'Single';
                console.log('✅ SINGLE! Bateador tiene 5+ hitting');
            } else {
                // Corredor avanza, bateador out
                advanceAllRunners(1);
                eliminateBatter();
                gameState.outs++;
                isOut = true;
                console.log('✅ Corredor avanza, ❌ bateador out (menos de 5+ hitting)');
            }
            break;

        default:
            console.error(`❌ Evento de bunt desconocido: ${event}`);
    }

    // Actualizar estadísticas del jugador
    if (currentBatter && battingTeam) {
        updatePlayerStats(currentBatter.name, battingTeam, {
            isOut: isOut,
            isHit: isHit,
            isWalk: false,
            hitType: hitType
        });
        console.log(`📊 Estadísticas actualizadas para ${currentBatter.name}`);
    }

    updateGameDisplay();

    // Cerrar cascada con delay (TODO ES FINAL, siempre avanzar)
    setTimeout(() => {
        const cascadeContainer = document.getElementById('cascade-confirmation');
        if (cascadeContainer) {
            cascadeContainer.style.display = 'none';
            cascadeContainer.innerHTML = '';
        }

        // Si hay 3 outs, cambiar de inning
        if (gameState.outs >= 3) {
            changeInning();
        } else {
            nextBatter();
        }
    }, 2500);
}

// Funciones auxiliares para bunting
function getLeadRunner() {
    const bases = ['third', 'second', 'first'];
    for (const base of bases) {
        if (gameState.bases[base]) {
            return base;
        }
    }
    return null;
}

function eliminateRunner(base) {
    const token = document.querySelector(`[data-current-base="${base}"]`);
    if (token) {
        token.remove();
    }
    gameState.bases[base] = null;
}

function scoreRunnerFromThird() {
    if (gameState.bases.third) {
        const battingTeam = getCurrentBattingTeam();
        const currentInning = gameState.currentInning - 1; // Array indexing (0-based)
        
        if (battingTeam === 'visitante') {
            gameState.score.visitante[currentInning]++;
            gameState.score.totalVisitante++;
        } else {
            gameState.score.local[currentInning]++;
            gameState.score.totalLocal++;
        }
        eliminateRunner('third');
        console.log('🏃💨 Corredor de 3B anota!');
        
        // Actualizar marcador visual
        updateScoreboard();
    }
}

function advanceOtherRunners(bases) {
    // Avanzar todos los corredores excepto el que está en 3B
    if (gameState.bases.second && !gameState.bases.third) {
        moveRunner('second', 'third');
    }
    if (gameState.bases.first && !gameState.bases.second) {
        moveRunner('first', 'second');
    }
}

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

// ===== SISTEMA DE ESTADÍSTICAS DE JUGADORES =====

/**
 * Inicializa las estadísticas de un jugador
 */
function initPlayerStats(playerName, team) {
    if (!gameState.playerStats[team][playerName]) {
        gameState.playerStats[team][playerName] = {
            AB: 0,  // At Bats (turnos al bate)
            H: 0,   // Hits
            R: 0,   // Runs (carreras anotadas)
            RBI: 0, // Runs Batted In (carreras impulsadas)
            BB: 0,  // Bases on Balls (walks)
            K: 0,   // Strikeouts
            AVG: '.000' // Batting Average
        };
    }
}

/**
 * Actualiza las estadísticas del jugador después de cada turno al bate
 */
function updatePlayerStats(player, team, outcome) {
    if (!player) return;
    
    initPlayerStats(player.name, team);
    const stats = gameState.playerStats[team][player.name];
    
    // Actualizar At Bats (se cuenta todo excepto walks)
    if (!outcome.isWalk) {
        stats.AB++;
    }
    
    // Actualizar Hits
    if (outcome.isHit) {
        stats.H++;
    }
    
    // Actualizar Walks
    if (outcome.isWalk) {
        stats.BB++;
    }
    
    // Actualizar Strikeouts
    if (outcome.isOut && outcome.hitType === 'strikeout') {
        stats.K++;
    }
    
    // Calcular Average
    if (stats.AB > 0) {
        const avg = (stats.H / stats.AB).toFixed(3);
        stats.AVG = avg;
    }
    
    console.log(`📊 Estadísticas actualizadas para ${player.name}:`, stats);
}

/**
 * Muestra un resumen de estadísticas del partido en consola
 */
function showGameStats() {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('📊 ESTADÍSTICAS DEL PARTIDO');
    console.log('═══════════════════════════════════════');
    
    ['visitante', 'local'].forEach(team => {
        console.log('');
        console.log(`🏟️ Equipo ${team.toUpperCase()}:`);
        console.log('───────────────────────────────────────');
        console.log('Jugador          AB  H  BB  K   AVG');
        console.log('───────────────────────────────────────');
        
        const stats = gameState.playerStats[team];
        Object.keys(stats).forEach(playerName => {
            const s = stats[playerName];
            console.log(
                `${playerName.padEnd(15)} ${String(s.AB).padStart(2)} ` +
                `${String(s.H).padStart(2)} ${String(s.BB).padStart(2)} ` +
                `${String(s.K).padStart(2)}  ${s.AVG}`
            );
        });
    });
    
    console.log('═══════════════════════════════════════');
    
    // Actualizar también el panel visual
    updateStatsPanel();
}

/**
 * Alterna la visibilidad del panel de estadísticas
 */
function toggleStatsPanel() {
    const panel = document.getElementById('stats-panel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        updateStatsPanel();
    } else {
        panel.style.display = 'none';
    }
}

/**
 * Actualiza el contenido visual del panel de estadísticas
 */
function updateStatsPanel() {
    const content = document.getElementById('stats-content');
    if (!content) return;
    
    let html = '';
    
    // Información del juego
    html += `
        <div style="background: rgba(251, 191, 36, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
            <h3 style="margin: 0 0 0.5rem 0; color: #fbbf24;">Información del Partido</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                <div>
                    <strong>Inning:</strong> ${gameState.currentInning}° 
                    ${gameState.isTopHalf ? '⬆️ (Arriba)' : '⬇️ (Abajo)'}
                </div>
                <div><strong>Outs:</strong> ${gameState.outs}</div>
                <div><strong>Score:</strong> ${gameState.score.totalVisitante} - ${gameState.score.totalLocal}</div>
            </div>
        </div>
    `;
    
    ['visitante', 'local'].forEach(team => {
        const teamIcon = team === 'visitante' ? '🛫' : '🏠';
        const teamColor = team === 'visitante' ? '#3b82f6' : '#ef4444';
        const stats = gameState.playerStats[team];
        
        html += `
            <div style="margin-bottom: 2rem;">
                <h3 style="margin: 0 0 1rem 0; color: ${teamColor};">${teamIcon} Equipo ${team.charAt(0).toUpperCase() + team.slice(1)}</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; background: rgba(0, 0, 0, 0.3); border-radius: 8px; overflow: hidden;">
                        <thead style="background: ${teamColor};">
                            <tr>
                                <th style="padding: 0.75rem; text-align: left;">Jugador</th>
                                <th style="padding: 0.75rem; text-align: center;">AB</th>
                                <th style="padding: 0.75rem; text-align: center;">H</th>
                                <th style="padding: 0.75rem; text-align: center;">BB</th>
                                <th style="padding: 0.75rem; text-align: center;">K</th>
                                <th style="padding: 0.75rem; text-align: center;">AVG</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        if (Object.keys(stats).length === 0) {
            html += `
                <tr>
                    <td colspan="6" style="padding: 1rem; text-align: center; opacity: 0.6;">
                        No hay estadísticas aún
                    </td>
                </tr>
            `;
        } else {
            Object.keys(stats).forEach((playerName, index) => {
                const s = stats[playerName];
                const rowBg = index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent';
                html += `
                    <tr style="background: ${rowBg};">
                        <td style="padding: 0.75rem;">${playerName}</td>
                        <td style="padding: 0.75rem; text-align: center;">${s.AB}</td>
                        <td style="padding: 0.75rem; text-align: center;">${s.H}</td>
                        <td style="padding: 0.75rem; text-align: center;">${s.BB}</td>
                        <td style="padding: 0.75rem; text-align: center;">${s.K}</td>
                        <td style="padding: 0.75rem; text-align: center; font-weight: bold; color: ${s.AVG >= '.300' ? '#4ade80' : s.AVG >= '.250' ? '#fbbf24' : 'white'};">
                            ${s.AVG}
                        </td>
                    </tr>
                `;
            });
        }
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    content.innerHTML = html;
}

/**
 * Guarda las estadísticas del partido en localStorage
 */
function saveGameStats() {
    const gameData = {
        date: new Date().toISOString(),
        score: gameState.score,
        playerStats: gameState.playerStats,
        playByPlay: gameState.playByPlay,
        innings: gameState.currentInning
    };
    
    // Guardar en localStorage
    const savedGames = JSON.parse(localStorage.getItem('deadballGames') || '[]');
    savedGames.push(gameData);
    
    // Mantener solo los últimos 10 juegos
    if (savedGames.length > 10) {
        savedGames.shift();
    }
    
    localStorage.setItem('deadballGames', JSON.stringify(savedGames));
    console.log('💾 Estadísticas del juego guardadas');
}