// DEADBALL - SCRIPT LIMPIO Y FUNCIONAL

const gameState = {
    currentInning: 1,
    isTopHalf: true,
    visitanteBatterIndex: 0,
    localBatterIndex: 0,
    outs: 0,
    strikes: 0,
    balls: 0,
    bases: { first: null, second: null, third: null },
    score: {
        visitante: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        local: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        totalVisitante: 0,
        totalLocal: 0
    },
    hits: { visitante: 0, local: 0 },
    errors: { visitante: 0, local: 0 },
    isGameActive: false,
    currentIntention: null,
    lastPitcherDice: null, // Almacena el último valor del dado del pitcher para Oddities
    baseStealModifier: 0, // Modificador temporal para robo de bases (Oddity 13)
    pitcher: {
        visitante: {
            basePitchDie: 'd12',
            currentPitchDie: 'd12',
            handedness: 'R',
            type: 'starter',
            scorelessInnings: 0,
            runsAllowedThisInning: 0,
            runsAllowedLastTwoInnings: 0,
            totalRunsAllowed: 0,
            inningsPitched: 0,
            strikeoutsThisInning: 0,
            battersThisInning: 0
        },
        local: {
            basePitchDie: 'd12',
            currentPitchDie: 'd12',
            handedness: 'R',
            type: 'starter',
            scorelessInnings: 0,
            runsAllowedThisInning: 0,
            runsAllowedLastTwoInnings: 0,
            totalRunsAllowed: 0,
            inningsPitched: 0,
            strikeoutsThisInning: 0,
            battersThisInning: 0
        }
    }
};

const basePositions = {
    home: { x: '50%', y: '40%' },
    first: { x: '39%', y: '51%' },
    second: { x: '52%', y: '62%' },
    third: { x: '61%', y: '51%' }
};

function getCurrentBattingTeam() {
    return gameState.isTopHalf ? 'visitante' : 'local';
}

function getCurrentBatterIndex() {
    return gameState.isTopHalf ? gameState.visitanteBatterIndex : gameState.localBatterIndex;
}

function getCurrentBatter() {
    const team = getCurrentBattingTeam();
    const index = getCurrentBatterIndex();
    const table = document.getElementById('roster-' + team);

    if (!table) return null;

    const rows = table.querySelectorAll('tbody tr');
    if (index >= rows.length) return null;

    const row = rows[index];
    const cells = row.querySelectorAll('td');

    const avgText = cells[6] ? cells[6].textContent.trim() : '.250';
    const obpText = cells[7] ? cells[7].textContent.trim() : '.300';

    // Obtener trait del jugador
    const traitSelect = cells[8] ? cells[8].querySelector('.trait-select') : null;
    const trait = traitSelect ? traitSelect.value : '';

    // Obtener handedness (R/L) del bateador
    const handednessSelect = cells[5] ? cells[5].querySelector('.handedness-select') : null;
    const handedness = handednessSelect ? handednessSelect.value : 'R';

    return {
        id: row.getAttribute('data-player-id') || String(index + 1),
        number: cells[1] ? cells[1].textContent.trim() : String(index + 1),
        name: cells[3] ? cells[3].textContent.trim() : 'Jugador ' + (index + 1),
        position: cells[4] ? cells[4].textContent.trim() : 'P',
        handedness: handedness,
        mlbId: row.getAttribute('data-mlb-id') || null,
        avg: avgText,
        obp: obpText,
        trait: trait
    };
}

function createRunnerToken(player, base) {
    console.log(`🏃 Creando token para ${player.name} en ${base}`);

    const token = document.createElement('div');
    token.className = `runner-token team-${player.team}`;
    token.dataset.playerId = player.id;
    token.dataset.currentBase = base;

    if (base === 'home') {
        token.classList.add('current-batter');
    }

    // Crear imagen del jugador con fallback
    const playerImg = document.createElement('div');
    playerImg.className = 'runner-photo';

    // Obtener foto del jugador
    const photoUrl = getPlayerPhotoUrl(player);
    console.log(`🖼️ URL de foto obtenida: ${photoUrl.substring(0, 100)}`);

    // Si hay foto, intentar cargarla
    if (photoUrl) {
        playerImg.style.backgroundImage = `url('${photoUrl}')`;
        playerImg.style.backgroundSize = 'cover';
        playerImg.style.backgroundPosition = 'center';
        console.log('✅ Foto asignada al background-image');

        // Si la foto falla al cargar, mostrar iniciales como fallback
        const testImg = new Image();
        testImg.onerror = () => {
            playerImg.style.backgroundImage = 'none';
            const playerNumberSpan = document.createElement('span');
            playerNumberSpan.className = 'player-initials';
            const initials = player.name.split(' ').map(n => n[0]).join('').toUpperCase();
            playerNumberSpan.textContent = initials;
            playerImg.appendChild(playerNumberSpan);
            console.log(`❌ Foto falló, mostrando iniciales: ${initials}`);
        };
        testImg.onload = () => {
            console.log('✅ Foto cargada exitosamente');
        };
        testImg.src = photoUrl;
    } else {
        // No hay URL de foto, mostrar iniciales directamente
        const playerNumberSpan = document.createElement('span');
        playerNumberSpan.className = 'player-initials';
        const initials = player.name.split(' ').map(n => n[0]).join('').toUpperCase();
        playerNumberSpan.textContent = initials;
        playerImg.appendChild(playerNumberSpan);
        console.log(`📝 Sin foto: mostrando ${initials}`);
    }

    token.appendChild(playerImg);

    // Añadir nombre debajo del token
    const nameLabel = document.createElement('div');
    nameLabel.className = 'runner-label';
    nameLabel.textContent = '#' + player.number;
    token.appendChild(nameLabel);

    // Posicionar en la base especificada
    const position = basePositions[base];
    token.style.left = position.x;
    token.style.top = position.y;

    // Añadir al contenedor de tokens
    const container = document.getElementById('runners-container');
    if (container) {
        container.appendChild(token);
        console.log('[TOKEN] Token añadido al DOM');
    }

    return token;
}

function clearTokensAtBase(base, animated = false) {
    const container = document.getElementById('runners-container');
    if (!container) return;

    const tokens = container.querySelectorAll('[data-current-base="' + base + '"]');

    if (animated) {
        // Reproducir sonido pop
        const popSound = new Audio('data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU4AAAAAgICAgICAgICAfn18fXp5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRUREQ0NCQUFAQEBAQEBAQEFBQkJDQ0RERUVGRkdHSEhJSUpKS0tMTE1NTk5OT09PT09PT05OTk1NTExLSkpJSUhHRkZFREREQ0JBQUBAQEBAQEBBQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gICAgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQEBAQEBAQEFBQkNEREVGR0hJSUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CAgICAgIA=');
        popSound.volume = 0.3;
        popSound.play().catch(() => {});

        // Aplicar animación pop antes de eliminar
        tokens.forEach(function(t) {
            t.style.animation = 'tokenPop 0.5s ease-out forwards';
            setTimeout(() => t.remove(), 500);
        });
    }
}

function startNewGame() {
    // PROTECCIÓN: No permitir iniciar juego si el modal de foto está abierto
    const photoModal = document.getElementById('playerPhotoModal');
    if (photoModal && photoModal.style.display === 'flex') {
        console.warn('🚫 BLOQUEADO: No se puede iniciar juego con modal de foto abierto');
        return;
    }

    console.log('[GAME] Iniciando nuevo juego');

    gameState.currentInning = 1;
    gameState.isTopHalf = true;
    gameState.visitanteBatterIndex = 0;
    gameState.localBatterIndex = 0;
    gameState.outs = 0;
    gameState.strikes = 0;
    gameState.balls = 0;
    gameState.bases = { first: null, second: null, third: null };
    gameState.score = {
        visitante: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        local: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        totalVisitante: 0,
        totalLocal: 0
    };
    gameState.hits = { visitante: 0, local: 0 };
    gameState.errors = { visitante: 0, local: 0 };
    gameState.isGameActive = true;
    gameState.currentIntention = null;

    // Iniciar música de fondo
    setTimeout(() => AudioSystem.playMusic(), 500);

    // Inicializar pitchers
    gameState.pitcher = {
        visitante: {
            basePitchDie: 'd12',
            currentPitchDie: 'd12',
            handedness: 'R',
            type: 'starter',
            scorelessInnings: 0,
            runsAllowedThisInning: 0,
            runsAllowedLastTwoInnings: 0,
            totalRunsAllowed: 0,
            inningsPitched: 0,
            strikeoutsThisInning: 0,
            battersThisInning: 0
        },
        local: {
            basePitchDie: 'd12',
            currentPitchDie: 'd12',
            handedness: 'R',
            type: 'starter',
            scorelessInnings: 0,
            runsAllowedThisInning: 0,
            runsAllowedLastTwoInnings: 0,
            totalRunsAllowed: 0,
            inningsPitched: 0,
            strikeoutsThisInning: 0,
            battersThisInning: 0
        }
    };

    // Actualizar displays de Pitch Die
    updatePitchDieDisplay('visitante');
    updatePitchDieDisplay('local');

    const container = document.getElementById('runners-container');
    if (container) container.innerHTML = '';

    hideAllIntentionSelectors();

    updateGameDisplay();
    toggleGameControls();
    initializeFirstBatter();
    updateGameButtons();

    console.log('[GAME] Juego iniciado correctamente');
}

function updateGameButtons() {
    const startBtn = document.getElementById('start-game-btn');
    const resetBtn = document.getElementById('reset-game-btn');

    if (gameState.isGameActive) {
        // Cambiar a modo "Reanudar"
        if (startBtn) {
            startBtn.textContent = '▶️ Reanudar Juego';
            startBtn.classList.add('resume-mode');
            startBtn.onclick = resumeGame;
        }
        // Mostrar botón de reset
        if (resetBtn) {
            resetBtn.style.display = 'inline-block';
        }
    } else {
        // Modo inicial "Iniciar Nuevo Juego"
        if (startBtn) {
            startBtn.textContent = '🎮 Iniciar Nuevo Juego';
            startBtn.classList.remove('resume-mode');
            startBtn.onclick = startNewGame;
        }
        // Ocultar botón de reset
        if (resetBtn) {
            resetBtn.style.display = 'none';
        }
    }
}

function resumeGame() {
    console.log('[GAME] Reanudando juego');
    // Solo ocultar el botón o realizar acciones necesarias
    // El juego ya está activo, solo necesitamos continuar
    alert('✅ Juego reanudado');
}

function confirmResetGame() {
    const confirmation = confirm('⚠️ ¿RESETEAR PARTIDO?\n\nSe perderá todo el progreso actual:\n• Marcador\n• Estadísticas\n• Corredores en base\n• Entrada actual\n\n¿Estás seguro?');

    if (confirmation) {
        resetGame();
    }
}

function resetGame() {
    console.log('[GAME] Reseteando partido completo');

    // Resetear completamente el estado
    gameState.isGameActive = false;
    gameState.currentInning = 1;
    gameState.isTopHalf = true;
    gameState.visitanteBatterIndex = 0;
    gameState.localBatterIndex = 0;
    gameState.outs = 0;
    gameState.strikes = 0;
    gameState.balls = 0;
    gameState.bases = { first: null, second: null, third: null };
    gameState.score = {
        visitante: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        local: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        totalVisitante: 0,
        totalLocal: 0
    };
    gameState.hits = { visitante: 0, local: 0 };
    gameState.errors = { visitante: 0, local: 0 };
    gameState.currentIntention = null;

    // Limpiar tokens
    const container = document.getElementById('runners-container');
    if (container) container.innerHTML = '';

    // Ocultar selectores
    hideAllIntentionSelectors();

    // Actualizar display
    updateGameDisplay();
    updateGameButtons();

    alert('🔄 Partido reseteado. Pulsa "Iniciar Nuevo Juego" para comenzar.');
    console.log('[GAME] Partido reseteado correctamente');
}

function initializeFirstBatter() {
    const team = getCurrentBattingTeam();
    const player = getCurrentBatter();

    if (player) {
        const batterData = {
            id: player.id,
            number: player.number,
            name: player.name,
            team: team,
            mlbId: player.mlbId
        };

        createRunnerToken(batterData, 'home');
        console.log('[BATTER] Primer bateador: ' + player.name);
    }

    updateGameDisplay();
    showIntentionSelector();
}

function nextBatter() {
    const team = getCurrentBattingTeam();

    if (team === 'visitante') {
        gameState.visitanteBatterIndex = (gameState.visitanteBatterIndex + 1) % 9;
    } else {
        gameState.localBatterIndex = (gameState.localBatterIndex + 1) % 9;
    }

    gameState.strikes = 0;
    gameState.balls = 0;
    gameState.currentIntention = null;

    // Limpiar dados del equipo visitante
    const pitcherValue = document.getElementById('pitcher-dice-value');
    const batterValue = document.getElementById('batter-dice-value');
    const finalResult = document.getElementById('final-result');
    const resultDescription = document.getElementById('result-description');
    const confirmSection = document.getElementById('result-confirmation');

    if (pitcherValue) pitcherValue.value = '';
    if (batterValue) batterValue.value = '';
    if (finalResult) finalResult.textContent = '-';
    if (resultDescription) resultDescription.textContent = 'Esperando tirada...';
    if (confirmSection) confirmSection.style.display = 'none';

    // Limpiar dados del equipo local
    const pitcherValueLocal = document.getElementById('pitcher-dice-value-local');
    const batterValueLocal = document.getElementById('batter-dice-value-local');
    const finalResultLocal = document.getElementById('final-result-local');
    const resultDescriptionLocal = document.getElementById('result-description-local');
    const confirmSectionLocal = document.getElementById('result-confirmation-local');

    if (pitcherValueLocal) pitcherValueLocal.value = '';
    if (batterValueLocal) batterValueLocal.value = '';
    if (finalResultLocal) finalResultLocal.textContent = '-';
    if (resultDescriptionLocal) resultDescriptionLocal.textContent = 'Esperando tirada...';
    if (confirmSectionLocal) confirmSectionLocal.style.display = 'none';

    clearTokensAtBase('home');

    const player = getCurrentBatter();
    if (player) {
        const batterData = {
            id: player.id,
            number: player.number,
            name: player.name,
            team: team,
            mlbId: player.mlbId
        };

        createRunnerToken(batterData, 'home');
        console.log('[BATTER] Siguiente bateador: ' + player.name);
    }

    updateGameDisplay();
    updateDiceSystemPosition();
    showIntentionSelector();
}

function confirmAndNextBatter() {
    console.log('[GAME] Confirmando jugada y avanzando');
    gameState.outs++;
    AudioSystem.play('out');

    if (gameState.outs >= 3) {
        AudioSystem.play('crowd_aww');
        changeInning();
    } else {
        nextBatter();
    }
}

function changeInning() {
    console.log('[INNING] Cambiando de inning');

    // Registrar fin de inning para el equipo que estaba lanzando
    const pitchingTeam = getCurrentPitchingTeam();
    onInningEnd(pitchingTeam);

    gameState.outs = 0;
    gameState.bases = { first: null, second: null, third: null };

    const container = document.getElementById('runners-container');
    if (container) container.innerHTML = '';

    if (gameState.isTopHalf) {
        gameState.isTopHalf = false;
    } else {
        gameState.isTopHalf = true;
        gameState.currentInning++;
    }

    initializeFirstBatter();
    updateDiceSystemPosition();
    updateGameDisplay();
}

function updateGameDisplay() {
    updateScoreboard();
    updateGameInfo();
    highlightCurrentBatter();
}

function updateScoreboard() {
    if (!gameState.score || !gameState.score.visitante || !gameState.score.local) {
        gameState.score = {
            visitante: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            local: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            totalVisitante: 0,
            totalLocal: 0
        };
    }

    const rows = document.querySelectorAll('tbody tr');
    if (rows.length >= 2) {
        const visitanteCells = rows[0].querySelectorAll('.inning-score');
        for (var i = 0; i < gameState.score.visitante.length; i++) {
            if (visitanteCells[i]) visitanteCells[i].textContent = gameState.score.visitante[i];
        }

        const localCells = rows[1].querySelectorAll('.inning-score');
        for (var j = 0; j < gameState.score.local.length; j++) {
            if (localCells[j]) localCells[j].textContent = gameState.score.local[j];
        }

        const visitanteTotal = rows[0].querySelector('.total-runs');
        const localTotal = rows[1].querySelector('.total-runs');
        if (visitanteTotal) visitanteTotal.textContent = gameState.score.totalVisitante;
        if (localTotal) localTotal.textContent = gameState.score.totalLocal;
    }
}

function updateGameInfo() {
    const inningEl = document.getElementById('current-inning');
    const outsEl = document.getElementById('current-outs');
    const countEl = document.getElementById('current-count');

    if (inningEl) {
        inningEl.textContent = gameState.isTopHalf ?
            'Top ' + gameState.currentInning :
            'Bot ' + gameState.currentInning;
    }

    if (outsEl) {
        outsEl.textContent = gameState.outs + ' outs';
    }

    if (countEl) {
        countEl.textContent = gameState.balls + '-' + gameState.strikes;
    }
}

function highlightCurrentBatter() {
    const team = getCurrentBattingTeam();
    const index = getCurrentBatterIndex();

    const allRows = document.querySelectorAll('.current-batter-row');
    allRows.forEach(function(row) {
        row.classList.remove('current-batter-row');
    });

    const table = document.getElementById('roster-' + team);
    if (table) {
        const rows = table.querySelectorAll('tbody tr');
        if (rows[index]) {
            rows[index].classList.add('current-batter-row');

            // Actualizar estadísticas visuales del bateador actual
            const batter = getCurrentBatter();
            if (batter) {
                const cells = rows[index].querySelectorAll('td');
                if (cells[6]) cells[6].textContent = batter.avg;
                if (cells[7]) cells[7].textContent = batter.obp;

                // Actualizar el display de "Bateador Actual"
                updateBatterInfo(team, batter);
            }

            console.log('[HIGHLIGHT] Resaltado jugador ' + (index + 1) + ' de ' + team);
        }
    }
}

function updateBatterInfo(team, batter) {
    if (!batter) return;

    const infoElement = team === 'visitante' ?
        document.getElementById('current-batter-info') :
        document.getElementById('current-batter-info-local');

    if (infoElement) {
        const nameSpan = infoElement.querySelector('.batter-name');
        const statsSpan = infoElement.querySelector('.batter-stats');

        if (nameSpan) nameSpan.textContent = batter.name || 'Jugador';
        if (statsSpan) statsSpan.textContent = `AVG: ${batter.avg || '.000'} | OBP: ${batter.obp || '.000'}`;
    }
}

// ====== SISTEMA DE LANZADORES (PITCH DIE) ======

const PITCH_DIE_LADDER = ['-d20', '-d12', '-d8', '-d4', 'd4', 'd8', 'd12', 'd20'];

function getCurrentPitchingTeam() {
    // El equipo que lanza es el contrario al que batea
    return gameState.isTopHalf ? 'local' : 'visitante';
}

function getPitchDieLevel(pitchDie) {
    return PITCH_DIE_LADDER.indexOf(pitchDie);
}

function adjustPitchDie(team, levels) {
    const pitcher = gameState.pitcher[team];
    const currentLevel = getPitchDieLevel(pitcher.currentPitchDie);
    let newLevel = currentLevel + levels;

    // Aplicar límites según tipo de lanzador
    if (pitcher.type === 'starter') {
        newLevel = Math.max(0, Math.min(6, newLevel)); // Máximo d12 para starters (índice 6)
    } else {
        newLevel = Math.max(0, Math.min(7, newLevel)); // Máximo d20 para relievers (índice 7)
    }

    pitcher.currentPitchDie = PITCH_DIE_LADDER[newLevel];
    console.log(`[PITCHER] ${team} Pitch Die ajustado a ${pitcher.currentPitchDie} (${levels > 0 ? '+' : ''}${levels} niveles)`);
    updatePitchDieDisplay(team);
}

function updatePitchDieWithHandedness(team) {
    const pitcher = gameState.pitcher[team];
    const batter = getCurrentBatter();

    if (!batter) return;

    // Resetear a base Pitch Die
    pitcher.currentPitchDie = pitcher.basePitchDie;

    // Aplicar ventaja R/L: si mismo handedness, sube un nivel
    if (pitcher.handedness === batter.handedness) {
        const currentLevel = getPitchDieLevel(pitcher.currentPitchDie);
        let newLevel = currentLevel + 1;

        // Aplicar límites según tipo
        if (pitcher.type === 'starter') {
            newLevel = Math.min(6, newLevel); // Máximo d12
        } else {
            newLevel = Math.min(7, newLevel); // Máximo d20
        }

        pitcher.currentPitchDie = PITCH_DIE_LADDER[newLevel];
        console.log(`[PITCHER] Ventaja ${pitcher.handedness} vs ${batter.handedness}: ${pitcher.basePitchDie} → ${pitcher.currentPitchDie}`);
    }

    updatePitchDieDisplay(team);
}

function updatePitchDieDisplay(team) {
    const pitcher = gameState.pitcher[team];
    const displayId = team === 'visitante' ? 'pitch-die-visitante' : 'pitch-die-local';
    const displayElement = document.getElementById(displayId);

    if (displayElement) {
        displayElement.textContent = pitcher.currentPitchDie;
        console.log(`[PITCHER] Display actualizado: ${team} = ${pitcher.currentPitchDie}`);
    }
}

function checkPitcherPerformance(team) {
    const pitcher = gameState.pitcher[team];

    // Verificar strikeout de todos los bateadores del inning
    if (pitcher.strikeoutsThisInning === pitcher.battersThisInning && pitcher.battersThisInning >= 3) {
        console.log(`[PITCHER] ${team} ponchó a todos en el inning!`);
        adjustPitchDie(team, 1);
    }

    // Verificar 3 innings consecutivos sin carreras
    if (pitcher.scorelessInnings >= 3) {
        console.log(`[PITCHER] ${team} ha lanzado ${pitcher.scorelessInnings} innings sin carreras`);
        const levels = Math.floor(pitcher.scorelessInnings / 3);
        adjustPitchDie(team, levels);
        pitcher.scorelessInnings = 0; // Reset después de aplicar bonus
    }
}

function applyPitcherFatigue(team, runsAllowed) {
    const pitcher = gameState.pitcher[team];
    const inning = gameState.currentInning;

    pitcher.runsAllowedThisInning += runsAllowed;
    pitcher.totalRunsAllowed += runsAllowed;

    console.log(`[PITCHER] ${team} permitió ${runsAllowed} carreras. Total inning: ${pitcher.runsAllowedThisInning}`);

    // Regla especial: carrera en 7mo inning o después = automático a d4
    if (inning >= 7 && runsAllowed > 0 && pitcher.type === 'starter') {
        const targetLevel = getPitchDieLevel('d4');
        const currentLevel = getPitchDieLevel(pitcher.currentPitchDie);
        if (currentLevel > targetLevel) {
            pitcher.currentPitchDie = 'd4';
            console.log(`[PITCHER] ${team} permitió carrera en inning ${inning}. Pitch Die bajado automáticamente a d4`);
            updatePitchDieDisplay(team);
        }
    }

    // 3+ carreras en un inning
    if (pitcher.runsAllowedThisInning >= 3) {
        adjustPitchDie(team, -1);
    }

    // 4+ carreras en dos innings
    pitcher.runsAllowedLastTwoInnings += runsAllowed;
    if (pitcher.runsAllowedLastTwoInnings >= 4) {
        adjustPitchDie(team, -1);
        pitcher.runsAllowedLastTwoInnings = 0; // Reset
    }

    // Por cada carrera después de 4
    if (pitcher.totalRunsAllowed > 4) {
        const extraRuns = pitcher.totalRunsAllowed - 4;
        adjustPitchDie(team, -extraRuns);
    }

    // Fatiga por innings (después del 6to)
    if (inning > 6 && pitcher.type === 'starter') {
        const fatigueInnings = inning - 6;
        adjustPitchDie(team, -fatigueInnings);
    }
}

function onInningEnd(team) {
    const pitcher = gameState.pitcher[team];

    // Si no permitió carreras, incrementar contador
    if (pitcher.runsAllowedThisInning === 0) {
        pitcher.scorelessInnings++;
    } else {
        pitcher.scorelessInnings = 0; // Reset si permitió carreras
    }

    // Guardar carreras de este inning para tracking de dos innings
    const runsThisInning = pitcher.runsAllowedThisInning;

    // Reset contadores del inning
    pitcher.runsAllowedThisInning = 0;
    pitcher.strikeoutsThisInning = 0;
    pitcher.battersThisInning = 0;
    pitcher.inningsPitched++;

    // Actualizar runsAllowedLastTwoInnings
    if (pitcher.inningsPitched > 1) {
        pitcher.runsAllowedLastTwoInnings = runsThisInning;
    }

    checkPitcherPerformance(team);
}

function recordStrikeout(team) {
    const pitcher = gameState.pitcher[team];
    pitcher.strikeoutsThisInning++;
    pitcher.battersThisInning++;
    console.log(`[PITCHER] ${team} strikeout registrado (${pitcher.strikeoutsThisInning}/${pitcher.battersThisInning})`);
}

function recordBatterFaced(team) {
    const pitcher = gameState.pitcher[team];
    pitcher.battersThisInning++;
}

function addRun(team, runs = 1) {
    // Actualizar score
    gameState.score[team][gameState.currentInning - 1] += runs;
    gameState.score['total' + (team === 'visitante' ? 'Visitante' : 'Local')] += runs;

    // Trackear fatiga del lanzador oponente
    const pitchingTeam = team === 'visitante' ? 'local' : 'visitante';
    applyPitcherFatigue(pitchingTeam, runs);

    console.log(`[SCORE] ${runs} carrera(s) para ${team}. Pitcher ${pitchingTeam} afectado por fatiga.`);
    updateScoreboard();
}

function hasRunnersOnBase() {
    return gameState.bases.first !== null ||
        gameState.bases.second !== null ||
        gameState.bases.third !== null;
}

function hideAllIntentionSelectors() {
    const visitanteContainer = document.getElementById('intention-container-visitante');
    const localContainer = document.getElementById('intention-container-local');

    if (visitanteContainer) {
        visitanteContainer.style.display = 'none';
        visitanteContainer.style.opacity = '0';
    }
    if (localContainer) {
        localContainer.style.display = 'none';
        localContainer.style.opacity = '0';
    }
}

function showIntentionSelector() {
    const team = getCurrentBattingTeam();
    const pitchingTeam = getCurrentPitchingTeam();
    const container = document.getElementById('intention-container-' + team);

    console.log('[SELECTOR] Intentando mostrar selector para equipo: ' + team);
    console.log('[SELECTOR] Contenedor encontrado: ' + (container ? 'SI' : 'NO'));

    // Asegurar que el bateador está actualizado
    highlightCurrentBatter();

    // Actualizar Pitch Die del lanzador considerando handedness del bateador
    updatePitchDieWithHandedness(pitchingTeam);

    // Registrar que un bateador ha sido enfrentado
    recordBatterFaced(pitchingTeam);

    // Resetear dados de ambos equipos
    resetDiceValues();

    if (container) {
        container.style.display = 'block';
        container.style.opacity = '1';
        console.log('[SELECTOR] Selector mostrado para ' + team);

        updateIntentionButtons();
    } else {
        console.log('[ERROR] No se encontro el contenedor intention-container-' + team);
    }
}

function resetDiceValues() {
    // Limpiar dados del equipo visitante
    const pitcherValue = document.getElementById('pitcher-dice-value');
    const batterValue = document.getElementById('batter-dice-value');
    const finalResult = document.getElementById('final-result');
    const resultDescription = document.getElementById('result-description');

    if (pitcherValue) pitcherValue.value = '';
    if (batterValue) batterValue.value = '';
    if (finalResult) finalResult.textContent = '-';
    if (resultDescription) resultDescription.textContent = 'Esperando tirada...';

    // Limpiar dados del equipo local
    const pitcherValueLocal = document.getElementById('pitcher-dice-value-local');
    const batterValueLocal = document.getElementById('batter-dice-value-local');
    const finalResultLocal = document.getElementById('final-result-local');
    const resultDescriptionLocal = document.getElementById('result-description-local');

    if (pitcherValueLocal) pitcherValueLocal.value = '';
    if (batterValueLocal) batterValueLocal.value = '';
    if (finalResultLocal) finalResultLocal.textContent = '-';
    if (resultDescriptionLocal) resultDescriptionLocal.textContent = 'Esperando tirada...';

    console.log('[DICE] Dados reseteados');
}

function updateIntentionButtons() {
    const runnersOnBase = hasRunnersOnBase();

    const stealBtn = document.getElementById('intention-steal');
    const hitRunBtn = document.getElementById('intention-hitrun');

    if (stealBtn) {
        stealBtn.disabled = !runnersOnBase;
        stealBtn.style.opacity = runnersOnBase ? '1' : '0.5';
        stealBtn.style.cursor = runnersOnBase ? 'pointer' : 'not-allowed';
    }

    if (hitRunBtn) {
        hitRunBtn.disabled = !runnersOnBase;
        hitRunBtn.style.opacity = runnersOnBase ? '1' : '0.5';
        hitRunBtn.style.cursor = runnersOnBase ? 'pointer' : 'not-allowed';
    }

    console.log('[SELECTOR] Botones actualizados - Corredores en base: ' + runnersOnBase);
}

function selectIntention(intention) {
    console.log('[INTENTION] Seleccionada: ' + intention);

    const team = getCurrentBattingTeam();
    const intentionContainer = document.getElementById('intention-container-' + team);
    const diceContainer = document.getElementById('dice-container-' + team);

    if (!hasRunnersOnBase() && (intention === 'steal' || intention === 'hitrun')) {
        alert('No hay corredores en base para esta accion');
        return;
    }

    gameState.currentIntention = intention;

    if (intentionContainer) {
        intentionContainer.style.display = 'none';
    }

    // Si es bunt, ir directo a la tabla de Bunting (solo D6, no dados normales)
    if (intention === 'bunt') {
        console.log('[BUNT] Ir directo a Bunting Table');
        showBuntingTable();
        return;
    }

    // Si es steal, mostrar selector de tipo de robo
    if (intention === 'steal') {
        console.log('[STEAL] Mostrando selector de tipo de robo');
        showStealTypeSelector();
        return;
    }

    // Si es hit and run, mostrar sistema combinado
    if (intention === 'hitrun') {
        console.log('[HIT&RUN] Mostrando sistema de Hit & Run');
        showHitAndRunSystem();
        return;
    }

    if (diceContainer) {
        diceContainer.style.display = 'block';
    }

    console.log('[INTENTION] Mostrando dados para: ' + intention);
}

function rollPitcherDice(team) {
    const suffix = team === 'local' ? '-local' : '';
    const diceTypeSelect = document.getElementById('pitcher-dice-type' + suffix);
    const diceValueInput = document.getElementById('pitcher-dice-value' + suffix);

    if (!diceTypeSelect || !diceValueInput) {
        console.error('[DICE] No se encontraron elementos para equipo: ' + team);
        return;
    }

    const diceType = parseInt(diceTypeSelect.value);
    let result;

    if (diceType > 0) {
        result = Math.floor(Math.random() * diceType) + 1;
    } else {
        const absDice = Math.abs(diceType);
        result = -(Math.floor(Math.random() * absDice) + 1);
    }

    diceValueInput.value = result;
    gameState.lastPitcherDice = result;
    console.log('[DICE] Lanzador (' + team + ') tiro D' + diceType + ': ' + result);

    checkDiceComplete(team);
}

function rollBatterDice(team) {
    const suffix = team === 'local' ? '-local' : '';
    const diceValueInput = document.getElementById('batter-dice-value' + suffix);

    if (!diceValueInput) {
        console.error('[DICE] No se encontró input del bateador para equipo: ' + team);
        return;
    }

    const result = Math.floor(Math.random() * 100) + 1;
    diceValueInput.value = result;

    console.log('[DICE] Bateador (' + team + ') tiro D100: ' + result);

    checkDiceComplete(team);
}

function checkDiceComplete(team) {
    const suffix = team === 'local' ? '-local' : '';
    const pitcherValue = document.getElementById('pitcher-dice-value' + suffix);
    const batterValue = document.getElementById('batter-dice-value' + suffix);
    const finalResult = document.getElementById('final-result' + suffix);
    const resultDescription = document.getElementById('result-description' + suffix);
    const confirmSection = document.getElementById('result-confirmation' + suffix);

    if (!pitcherValue || !batterValue || !finalResult) {
        console.warn('[DICE] No se encontraron todos los elementos para equipo: ' + team);
        return;
    }

    if (pitcherValue.value !== '' && batterValue.value !== '') {
        const pitcher = parseInt(pitcherValue.value);
        const batter = parseInt(batterValue.value);
        const mss = pitcher + batter;

        const player = getCurrentBatter();
        const bt = calculateBT(player.avg);
        const obt = calculateOBT(player.obp);

        finalResult.textContent = mss;

        const outcome = getSwingResultOutcome(mss, bt, obt);
        resultDescription.textContent = 'SRT: ' + mss + ' (BT:' + bt + ', OBT:' + obt + ') - ' + outcome;

        if (confirmSection) {
            confirmSection.style.display = 'block';
        }

        console.log('[DICE] (' + team + ') SRT: ' + mss + ', BT: ' + bt + ', OBT: ' + obt + ' - ' + outcome);
    }
}

function calculateBT(avg) {
    const numStr = avg.replace('.', '');
    const firstTwo = parseInt(numStr.substring(0, 2));
    return isNaN(firstTwo) ? 25 : firstTwo;
}

function calculateOBT(obp) {
    const numStr = obp.replace('.', '');
    const firstTwo = parseInt(numStr.substring(0, 2));
    return isNaN(firstTwo) ? 30 : firstTwo;
}

function getSwingResultOutcome(mss, bt, obt) {
    if (mss === 1) return 'ODDITY - Tirar 2d10 en Oddities Table';
    if (mss <= 2.5) return 'CRITICAL HIT - Tirar d20 en Hit Table, subir un nivel';
    if (mss < bt) return 'ORDINARY HIT - Tirar d20 en Hit Table';
    if (mss >= bt - 1 && mss < obt) return 'WALK - Bateador avanza a primera';
    if (obt + 1 <= mss && mss <= obt + 5) return 'POSSIBLE ERROR - Tirar d12 en Defense Table';
    if (obt + 6 <= mss && mss <= 49) return 'PRODUCTIVE OUT - Corredores avanzan, bateador out en 1B o 2B';
    if (mss >= 50 && mss <= 69) return 'PRODUCTIVE OUT - Corredores avanzan, bateador out en 1B';
    if (mss >= 70) return 'OUT - Corredores en 1B y 2B out, bateador out';
    if (mss === 99) return 'ODDITY - Tirar 2d10 en Oddities Table';
    if (mss >= 100) return 'OUT - Corredores no avanzan, posible triple play';
    return 'OUT - Resultado por defecto';
}

function confirmResult(team) {
    console.log('[RESULT] Confirmando resultado');

    const finalResult = document.getElementById('final-result');
    const total = parseInt(finalResult.textContent);

    if (isNaN(total)) {
        alert('Error: No hay resultado para confirmar');
        return;
    }

    showSwingResultTable(total);
}

function showSwingResultTable(mss) {
    console.log('[TABLE] Mostrando Swing Result Table para MSS: ' + mss);

    // Mostrar el área de resolución azul
    const playsArea = document.getElementById('plays-resolution-area');
    if (playsArea) {
        playsArea.style.display = 'block';
    }

    updateCascadeStatus('🎲 Consultando Swing Result Table...');

    const tableContainer = document.getElementById('swing-result-table-container');
    if (!tableContainer) {
        console.log('[ERROR] No se encontro el contenedor de la tabla');
        return;
    }

    tableContainer.style.display = 'block';

    const player = getCurrentBatter();
    const bt = calculateBT(player.avg);
    const obt = calculateOBT(player.obp);

    const batterNameDisplay = document.getElementById('batter-name-display');
    const btDisplay = document.getElementById('bt-value');
    const obtDisplay = document.getElementById('obt-value');

    if (batterNameDisplay) batterNameDisplay.textContent = player.name;
    if (btDisplay) btDisplay.textContent = bt;
    if (obtDisplay) obtDisplay.textContent = obt;

    const rows = tableContainer.querySelectorAll('tbody tr');
    rows.forEach(function(row) {
        row.classList.remove('table-warning', 'fw-bold');
        row.style.backgroundColor = '';
    });

    let targetRow = null;

    if (mss === 1) {
        targetRow = rows[0];
    } else if (mss >= 2 && mss <= 5) {
        targetRow = rows[1];
    } else if (mss >= 6 && mss <= bt) {
        targetRow = rows[2];
    } else if (mss >= bt + 1 && mss <= obt) {
        targetRow = rows[3];
    } else if (mss >= obt + 1 && mss <= obt + 5) {
        targetRow = rows[4];
    } else if (mss >= obt + 6 && mss <= 49) {
        targetRow = rows[5];
    } else if (mss >= 50 && mss <= 69) {
        targetRow = rows[6];
    } else if (mss >= 70 && mss <= 98) {
        targetRow = rows[7];
    } else if (mss === 99) {
        targetRow = rows[8];
    } else if (mss >= 100) {
        targetRow = rows[9];
    }

    if (targetRow) {
        targetRow.classList.add('table-warning', 'fw-bold');
        targetRow.style.backgroundColor = '#fbbf24';

        // Ocultar la tabla completa y solo mostrar resultado
        const table = tableContainer.querySelector('table');
        if (table) table.style.display = 'none';

        const resultText = targetRow.textContent.trim();
        updateCascadeStatus('📊 ' + resultText);

        console.log('[TABLE] Resultado SRT ' + mss + ': ' + resultText);
    }
}

function closeSwingResultTable() {
    console.log('[TABLE] Cerrando Swing Result Table');

    const tableContainer = document.getElementById('swing-result-table-container');
    if (tableContainer) {
        tableContainer.style.display = 'none';
    }

    const finalResult = document.getElementById('final-result');
    const mss = parseInt(finalResult ? finalResult.textContent : 0);

    cascadeContext.currentMSS = mss;

    // 1. Si MSS es 1 o 99 → Oddities
    if (mss === 1 || mss === 99) {
        showOdditiesTable();
        return;
    }

    const player = getCurrentBatter();
    const bt = calculateBT(player.avg);
    const obt = calculateOBT(player.obp);

    // 2. Si MSS 2-5 o 6-BT → Hit Table (Critical Hit u Ordinary Hit)
    if ((mss >= 2 && mss <= 5) || (mss >= 6 && mss <= bt)) {
        showHitTable();
        return;
    }

    // 3. Si MSS OBT+1 a OBT+5 → Defense Table (Possible Error)
    if (mss >= (obt + 1) && mss <= (obt + 5)) {
        showDefenseTable('Field');
        return;
    }

    // 4. Si MSS 21+ → Out Table
    if (mss >= 21) {
        const lastDigit = mss % 10;
        let ballLocation = '';
        if (lastDigit >= 0 && lastDigit <= 2) {
            ballLocation = 'Strikeout';
        } else if (lastDigit >= 3 && lastDigit <= 6) {
            ballLocation = 'Infield';
        } else if (lastDigit >= 7 && lastDigit <= 9) {
            ballLocation = 'Outfield';
        }
        updateCascadeStatus('⚾ OUT → Bola al ' + ballLocation + ' (último dígito: ' + lastDigit + ')');
        showOutTable(mss);
        return;
    }

    // Si no entra en ninguna categoría, continuar
    const pitcherValue = document.getElementById('pitcher-dice-value');
    const batterValue = document.getElementById('batter-dice-value');
    const resultDescription = document.getElementById('result-description');
    const confirmSection = document.getElementById('result-confirmation');

    if (pitcherValue) pitcherValue.value = '';
    if (batterValue) batterValue.value = '';
    if (finalResult) finalResult.textContent = '-';
    if (resultDescription) resultDescription.textContent = 'Esperando tirada...';
    if (confirmSection) confirmSection.style.display = 'none';

    nextBatter();
}

function showOdditiesTable() {
    console.log('[ODDITIES] Mostrando Oddities Table');

    const odditiesContainer = document.getElementById('oddities-table-container');
    if (odditiesContainer) {
        odditiesContainer.style.display = 'block';
    }

    const dice1 = document.getElementById('oddity-dice1-value');
    const dice2 = document.getElementById('oddity-dice2-value');
    const result = document.getElementById('oddity-result-value');

    if (dice1) dice1.value = '';
    if (dice2) dice2.value = '';
    if (result) result.textContent = '-';

    const rows = odditiesContainer.querySelectorAll('tbody tr');
    rows.forEach(function(row) {
        row.classList.remove('table-warning', 'fw-bold');
        row.style.backgroundColor = '';
    });
}

function rollOddityDice1() {
    const dice1 = document.getElementById('oddity-dice1-value');
    if (!dice1) return;

    const roll = Math.floor(Math.random() * 10) + 1;
    dice1.value = roll;
    console.log('[ODDITIES] Dado 1: ' + roll);

    checkOdditiesComplete();
}

function rollOddityDice2() {
    const dice2 = document.getElementById('oddity-dice2-value');
    if (!dice2) return;

    const roll = Math.floor(Math.random() * 10) + 1;
    dice2.value = roll;
    console.log('[ODDITIES] Dado 2: ' + roll);

    checkOdditiesComplete();
}

function checkOdditiesComplete() {
    const dice1 = document.getElementById('oddity-dice1-value');
    const dice2 = document.getElementById('oddity-dice2-value');
    const resultDisplay = document.getElementById('oddity-result-value');

    if (!dice1 || !dice2 || !resultDisplay) return;

    if (dice1.value !== '' && dice2.value !== '') {
        const d1 = parseInt(dice1.value);
        const d2 = parseInt(dice2.value);
        const total = d1 + d2;

        resultDisplay.textContent = total;

        const odditiesContainer = document.getElementById('oddities-table-container');
        const rows = odditiesContainer.querySelectorAll('tbody tr');

        rows.forEach(function(row) {
            row.classList.remove('table-warning', 'fw-bold');
            row.style.backgroundColor = '';
        });

        const targetRow = odditiesContainer.querySelector('[data-oddity="' + total + '"]');
        if (targetRow) {
            // Ocultar la tabla completa
            const table = odditiesContainer.querySelector('table');
            if (table) table.style.display = 'none';

            // Mostrar resultado compacto
            const oddityName = targetRow.querySelector('td:nth-child(2)').textContent;
            const oddityEffect = targetRow.querySelector('td:nth-child(3)').textContent;

            const resultDisplayBox = document.getElementById('oddity-result-display');
            const continueBtn = document.getElementById('oddity-continue-btn');

            if (resultDisplayBox) {
                resultDisplayBox.innerHTML = '<strong>🎲 ' + oddityName + '</strong><br><small>' + oddityEffect + '</small>';
                resultDisplayBox.style.display = 'block';
            }

            if (continueBtn) {
                continueBtn.style.display = 'inline-block';
            }

            updateCascadeStatus('🎲 Oddity: ' + oddityName);
            console.log('[ODDITIES] Resultado: ' + total + ' - ' + oddityName);
        }
    }
}

function closeOdditiesTable() {
    console.log('[ODDITIES] Cerrando Oddities Table');

    const odditiesContainer = document.getElementById('oddities-table-container');
    const dice1 = document.getElementById('oddity-dice1-value');
    const dice2 = document.getElementById('oddity-dice2-value');

    let oddityResult = 0;
    if (dice1 && dice2 && dice1.value && dice2.value) {
        oddityResult = parseInt(dice1.value) + parseInt(dice2.value);
        applyOddityEffect(oddityResult);
    }

    if (odditiesContainer) {
        odditiesContainer.style.display = 'none';
    }

    const pitcherValue = document.getElementById('pitcher-dice-value');
    const batterValue = document.getElementById('batter-dice-value');
    const finalResult = document.getElementById('final-result');
    const resultDescription = document.getElementById('result-description');
    const confirmSection = document.getElementById('result-confirmation');

    if (pitcherValue) pitcherValue.value = '';
    if (batterValue) batterValue.value = '';
    if (finalResult) finalResult.textContent = '-';
    if (resultDescription) resultDescription.textContent = 'Esperando tirada...';
    if (confirmSection) confirmSection.style.display = 'none';

    nextBatter();
}

function applyOddityEffect(oddityResult) {
    console.log('[ODDITIES] Aplicando efecto de Oddity ' + oddityResult);

    const team = getCurrentBattingTeam();
    const pd = gameState.lastPitcherDice;

    switch (oddityResult) {
        case 2: // Fan Interference - depends on PD even/odd
            if (pd % 2 === 0) {
                alert('🎯 Fan Interference (PD par) - Home Run anulado. Bateador eliminado');
                gameState.outs++;
                updateScoreboard();
            } else {
                alert('🎯 Fan Interference (PD impar) - Fan atrapa out. Turno continúa');
            }
            break;

        case 3: // Animal On Field - roll d4
            showD4Roller();
            return; // No avanzar aún, esperar resultado d4

        case 4: // Rain Delay - roll d100
            showD100Roller();
            return; // No avanzar aún, esperar resultado d100

        case 5: // Fielder Appears Injured
            showInjuryTable('fielder', 'last-out-fielder');
            return; // No avanzar aún, esperar cascada injury

        case 6: // Pitcher Appears Injured
            showInjuryTable('pitcher', getCurrentBattingTeam());
            return; // No avanzar aún, esperar cascada injury

        case 7: // TOOTBLAN - Lead runner out
            alert('🤦 TOOTBLAN - Corredor líder eliminado en las bases');
            removeLeadRunner();
            gameState.outs++;
            updateScoreboard();
            break;

        case 8: // Pick-Off at first
            if (gameState.bases.first) {
                alert('👀 Pick-Off - Corredor en primera eliminado');
                gameState.bases.first = null;
                gameState.outs++;
                updateScoreboard();
                clearTokensAtBase('first', true);
            } else {
                alert('👀 Pick-Off - No hay corredor en primera. Catcher gana D+ para este turno');
            }
            break;

        case 9: // Call Blown at First - depends on PD even/odd
            if (pd % 2 === 0) {
                alert('👨‍⚖️ Call Blown at First (PD par) - Bateador llamado safe incorrectamente');
                moveRunnerToBase(getCurrentBatter(), 'first');
            } else {
                alert('👨‍⚖️ Call Blown at First (PD impar) - Bateador llamado out incorrectamente');
                gameState.outs++;
                updateScoreboard();
            }
            break;

        case 10: // Call Blown at Home Plate - depends on PD even/odd
            if (pd % 2 === 0) {
                alert('👨‍⚖️ Call Blown at Home (PD par) - Bateador recibe walk en strike');
                moveRunnerToBase(getCurrentBatter(), 'first');
            } else {
                alert('👨‍⚖️ Call Blown at Home (PD impar) - Bateador eliminado en bola');
                gameState.outs++;
                updateScoreboard();
            }
            break;

        case 11: // Hit by Pitch - Batter goes to first
            alert('⚾ Hit by Pitch - El bateador va a primera base');
            moveRunnerToBase(getCurrentBatter(), 'first');
            break;

        case 12: // Wild Pitch - All runners advance one base
            alert('💨 Wild Pitch - Todos los corredores avanzan una base');
            advanceAllRunners();
            break;

        case 13: // Batter Distracted - +1 to defensive value
            alert('😵 Batter Distracted - +1 al valor defensivo para este turno');
            gameState.baseStealModifier = 1; // Aplicar modificador para robo de bases
            break;

        case 14: // Dropped Third Strike - roll d8 for stolen base
            showBaseStealTable('dropped-third-strike');
            return; // No avanzar aún, esperar resultado d8

        case 15: // Passed Ball - All runners advance one base
            alert('🧤 Passed Ball - Todos los corredores avanzan una base');
            advanceAllRunners();
            break;

        case 16: // Current Batter Appears Injured
            showInjuryTable('batter', 'current');
            return; // No avanzar aún, esperar cascada injury

        case 17: // Previous Batter Appears Injured
            showInjuryTable('batter', 'previous');
            return; // No avanzar aún, esperar cascada injury
            break;

        case 18: // Pitcher Error - Batter reaches first, all runners advance
            alert('⚠️ Error del Lanzador - Bateador a primera, corredores avanzan');
            advanceAllRunners();
            moveRunnerToBase(getCurrentBatter(), 'first');
            break;

        case 19: // Balk - All runners advance one base
            alert('🚫 Balk - Todos los corredores avanzan una base');
            advanceAllRunners();
            break;

        case 20: // Catcher Interference - Batter goes to first
            alert('🧤 Interferencia del Catcher - El bateador va a primera base');
            moveRunnerToBase(getCurrentBatter(), 'first');
            break;

        default:
            alert('⚡ Oddity ' + oddityResult + ' - Efecto especial (implementación pendiente)');
            break;
    }
}

// ========================================
// UTILIDADES DE CASCADA Y ANIMACIONES
// ========================================

function updateCascadeStatus(message) {
    // Actualizar el nuevo elemento play-status en el área azul
    const playStatus = document.getElementById('play-status');
    if (playStatus) {
        playStatus.innerHTML = message;
    }

    // Mantener compatibilidad con cascade-status si existe
    const cascadeStatus = document.getElementById('cascade-status');
    if (cascadeStatus) {
        cascadeStatus.innerHTML = message;
    }
}

function animateTokenPop(tokenElement) {
    if (tokenElement) {
        tokenElement.classList.add('token-popping');
        setTimeout(function() {
            if (tokenElement.parentNode) {
                tokenElement.parentNode.removeChild(tokenElement);
            }
        }, 600);
    }
}

function animateTokenScore(tokenElement) {
    if (tokenElement) {
        tokenElement.classList.add('token-scoring');
        setTimeout(function() {
            if (tokenElement.parentNode) {
                tokenElement.parentNode.removeChild(tokenElement);
            }
        }, 800);
    }
}

function advanceAllRunners() {
    const newBases = { first: null, second: null, third: null };

    if (gameState.bases.third) {
        addRun(getCurrentBattingTeam(), 1);
        console.log('[ODDITIES] Corredor anota desde tercera');

        // Animar corredor anotando (volando hacia arriba)
        const container = document.getElementById('runners-container');
        if (container) {
            const tokens = container.querySelectorAll('[data-base="third"]');
            tokens.forEach(function(token) {
                animateTokenScore(token);
            });
        }
    }

    if (gameState.bases.second) {
        newBases.third = gameState.bases.second;
        moveRunnerToBase(gameState.bases.second, 'third');
    }

    if (gameState.bases.first) {
        newBases.second = gameState.bases.first;
        moveRunnerToBase(gameState.bases.first, 'second');
    }

    gameState.bases = newBases;
    updateScoreboard();
}

function removeLeadRunner() {
    if (gameState.bases.third) {
        clearTokensAtBase('third', true);
        gameState.bases.third = null;
    } else if (gameState.bases.second) {
        clearTokensAtBase('second', true);
        gameState.bases.second = null;
    } else if (gameState.bases.first) {
        clearTokensAtBase('first', true);
        gameState.bases.first = null;
    }
}

function moveRunnerToBase(player, base) {
    if (!player) return;

    // Primero limpiar la base destino
    clearTokensAtBase(base);

    // Actualizar gameState
    gameState.bases[base] = player;

    // Crear token con animación
    const token = createRunnerToken(player, base);
    if (token) {
        token.classList.add('token-moving');
        setTimeout(function() {
            token.classList.remove('token-moving');
        }, 500);
    }

    console.log('[RUNNER] Jugador movido a ' + base + ': ' + player.name);
}

function toggleGameControls() {
    const startBtn = document.getElementById('start-game-btn');
    const resetBtn = document.getElementById('reset-game-btn');

    if (gameState.isGameActive) {
        if (startBtn) startBtn.style.display = 'none';
        if (resetBtn) resetBtn.style.display = 'block';
    } else {
        if (startBtn) startBtn.style.display = 'block';
        if (resetBtn) resetBtn.style.display = 'none';
    }
}

// ========================================
// MINI-TIRADORES PARA ODDITIES
// ========================================

// D4 ROLLER - Animal On Field (Oddity 3)
function showD4Roller() {
    const container = document.getElementById('d4-mini-roller-container');
    if (container) {
        container.style.display = 'block';
        // Reset
        document.getElementById('d4-value').value = '';
        document.getElementById('d4-result-text').style.display = 'none';
        document.getElementById('d4-continue-btn').style.display = 'none';
    }
}

function rollD4() {
    const result = Math.floor(Math.random() * 4) + 1;
    document.getElementById('d4-value').value = result;

    const animalName = document.getElementById('d4-animal-name');
    const animalEffect = document.getElementById('d4-animal-effect');
    const resultDiv = document.getElementById('d4-result-text');
    const continueBtn = document.getElementById('d4-continue-btn');

    let name = '';
    let effect = '';

    switch (result) {
        case 1:
            name = '🐦 Gaviota roba la gorra del lanzador';
            effect = 'Reducir PD en 1 para este inning';
            // TODO: Implementar reducción temporal de PD
            break;
        case 2:
            name = '🦝 Mapache muerde al fielder';
            effect = 'Fielder se convierte en D- por el resto del juego';
            // TODO: Modificar stats del fielder
            break;
        case 3:
            name = '🐈‍⬛ Gato negro asusta al equipo local';
            effect = 'Reducir BT/OBT en 5 por un inning';
            // TODO: Modificar stats temporalmente
            break;
        case 4:
            name = '🏃 Streaker inspira a la multitud';
            effect = 'Aumentar PD del pitcher local en 1';
            // TODO: Aumentar PD temporalmente
            break;
    }

    animalName.textContent = name;
    animalEffect.textContent = effect;
    resultDiv.style.display = 'block';
    continueBtn.style.display = 'block';

    console.log('[D4] Animal On Field: ' + result + ' - ' + name);
}

function closeD4Roller() {
    const container = document.getElementById('d4-mini-roller-container');
    if (container) {
        container.style.display = 'none';
    }
    // Continuar con el juego
    if (gameState.outs >= 3) {
        changeInning();
    } else {
        nextBatter();
    }
}

// D100 ROLLER - Rain Delay (Oddity 4)
function showD100Roller() {
    const container = document.getElementById('d100-mini-roller-container');
    if (container) {
        container.style.display = 'block';
        // Reset
        document.getElementById('d100-value').value = '';
        document.getElementById('d100-result-text').style.display = 'none';
        document.getElementById('d100-continue-btn').style.display = 'none';
    }
}

function rollD100ForRain() {
    const result = Math.floor(Math.random() * 100) + 1;
    const delayMinutes = (result * 2) + 2; // d100*2 + 2 minutos

    document.getElementById('d100-value').value = result;
    document.getElementById('d100-delay-minutes').textContent = delayMinutes;
    document.getElementById('d100-result-text').style.display = 'block';
    document.getElementById('d100-continue-btn').style.display = 'block';

    console.log('[D100] Rain Delay: ' + result + ' x2 = ' + delayMinutes + ' minutos');
}

function closeD100Roller() {
    const container = document.getElementById('d100-mini-roller-container');
    if (container) {
        container.style.display = 'none';
    }
    // Continuar con el juego
    if (gameState.outs >= 3) {
        changeInning();
    } else {
        nextBatter();
    }
}

// D8 BASE STEALING TABLE - (Oddity 14: Dropped Third Strike)
function showBaseStealTable(context) {
    const container = document.getElementById('base-steal-table-container');
    const contextSpan = document.getElementById('base-steal-context');
    const tableBody = document.getElementById('base-steal-table-body');

    if (!container || !tableBody) return;

    container.style.display = 'block';

    // Reset
    document.getElementById('base-steal-d8-value').value = '';
    document.getElementById('base-steal-result').style.display = 'none';
    document.getElementById('base-steal-continue-btn').style.display = 'none';

    // Set context
    if (context === 'dropped-third-strike') {
        contextSpan.textContent = '⚾ Dropped Third Strike - Intento de robo a primera';

        // Llenar tabla según imagen: D8 to steal second base
        tableBody.innerHTML = `
            <tr data-steal-result="out">
                <td><strong>1-3</strong></td>
                <td>Runner is out</td>
            </tr>
            <tr data-steal-result="safe">
                <td><strong>4-8</strong></td>
                <td>Runner is safe</td>
            </tr>
        `;
    }

    console.log('[BASE-STEAL] Mostrando tabla con contexto: ' + context);
}

function showStealTypeSelector() {
    updateCascadeStatus('🏃‍♂️ Selecciona tipo de robo de base...');

    const areaAzul = document.getElementById('plays-resolution-area');
    const selector = document.getElementById('steal-type-selector');
    const cascadeTables = document.getElementById('cascade-tables-container');

    // Obtener corredores en base
    const first = gameState.bases.first;
    const second = gameState.bases.second;
    const third = gameState.bases.third;

    // Contar corredores
    let runnerCount = 0;
    if (first) runnerCount++;
    if (second) runnerCount++;
    if (third) runnerCount++;

    // Habilitar/deshabilitar botones según corredores
    const singleBtn = document.getElementById('single-steal-btn');
    const doubleBtn = document.getElementById('double-steal-btn');

    if (singleBtn) {
        singleBtn.disabled = (runnerCount < 1);
        singleBtn.style.opacity = (runnerCount >= 1) ? '1' : '0.4';
        singleBtn.style.cursor = (runnerCount >= 1) ? 'pointer' : 'not-allowed';
    }

    if (doubleBtn) {
        doubleBtn.disabled = (runnerCount < 2);
        doubleBtn.style.opacity = (runnerCount >= 2) ? '1' : '0.4';
        doubleBtn.style.cursor = (runnerCount >= 2) ? 'pointer' : 'not-allowed';
    }

    if (areaAzul) areaAzul.style.display = 'block';
    if (cascadeTables) cascadeTables.style.display = 'none';
    if (selector) selector.style.display = 'block';

    console.log(`[STEAL] Selector visible - Corredores: ${runnerCount}, Single: ${runnerCount >= 1}, Double: ${runnerCount >= 2}`);
}

function selectStealType(type) {
    console.log('[STEAL] Tipo seleccionado: ' + type);

    const selector = document.getElementById('steal-type-selector');
    const cascadeTables = document.getElementById('cascade-tables-container');

    if (selector) selector.style.display = 'none';
    if (cascadeTables) cascadeTables.style.display = 'flex';

    showBaseStealTable(type);
}

function showBaseStealTable(stealType) {
    updateCascadeStatus('🏃‍♂️ Intento de robo de base...');

    const container = document.getElementById('base-steal-table-container');
    const contextSpan = document.getElementById('base-steal-context');
    const tableBody = document.getElementById('base-steal-table-body');

    if (!container) return;

    // Determinar qué corredores están en base
    const first = gameState.bases.first;
    const second = gameState.bases.second;
    const third = gameState.bases.third;

    // Verificar si S+ puede robar home
    const canStealHome = third && third.trait === 'S+';

    // Usar stealType proporcionado
    const isDoublesteal = (stealType === 'double');

    // Configurar contexto y tabla
    if (isDoublesteal) {
        contextSpan.textContent = '🏃‍♂️🏃‍♂️ DOUBLE STEAL (D8)';
        tableBody.innerHTML = `
            <tr data-steal="1-3">
                <td><strong>1-3</strong></td>
                <td>Lead runner is out</td>
            </tr>
            <tr data-steal="4-5">
                <td><strong>4-5</strong></td>
                <td>Trailing runner is out</td>
            </tr>
            <tr data-steal="6-8">
                <td><strong>6-8</strong></td>
                <td>Both runners reach safely</td>
            </tr>
        `;
    } else {
        // Single steal
        let targetBase = '';
        if (first && !second) targetBase = '2nd';
        else if (second && !third) targetBase = '3rd';
        else if (third) targetBase = 'home';

        contextSpan.textContent = '🏃‍♂️ SINGLE STEAL to ' + targetBase + ' (D8)';
        tableBody.innerHTML = `
            <tr data-steal="1-3">
                <td><strong>1-3</strong></td>
                <td>Runner is out</td>
            </tr>
            <tr data-steal="4-8">
                <td><strong>4-8</strong></td>
                <td>Runner is safe</td>
            </tr>
        `;
    }

    // Mostrar advertencia si S+ puede robar home
    if (canStealHome) {
        contextSpan.innerHTML += '<br><small style="color: #fbbf24;">⭐ S+ puede robar home - Roll 8 = Steal home!</small>';
    }

    container.style.display = 'block';

    // Reset
    document.getElementById('base-steal-d8-value').value = '';
    document.getElementById('base-steal-result').style.display = 'none';
    document.getElementById('base-steal-continue-btn').style.display = 'none';

    console.log('[BASE-STEAL] Mode:', isDoublesteal ? 'DOUBLE' : 'SINGLE', 'Runners:', totalRunners);
}

function rollBaseStealD8() {
    const first = gameState.bases.first;
    const second = gameState.bases.second;
    const third = gameState.bases.third;

    // Determinar quién intenta robar (el corredor más adelantado o todos)
    let stealingRunner = third || second || first;
    const trait = stealingRunner ? stealingRunner.trait : '';

    let baseRoll = Math.floor(Math.random() * 8) + 1;
    let modifier = 0;

    // Aplicar modificadores por traits
    if (trait === 'S+') modifier = 1;
    else if (trait === 'S-') modifier = -2;

    const result = Math.max(1, Math.min(8, baseRoll + modifier));

    document.getElementById('base-steal-d8-value').value = baseRoll + (modifier !== 0 ? ' (' + (modifier > 0 ? '+' : '') + modifier + ')' : '');

    const resultDiv = document.getElementById('base-steal-result');
    const continueBtn = document.getElementById('base-steal-continue-btn');

    // Determinar tipo de robo desde el estado guardado
    const isDoublesteal = (gameState.currentStealType === 'double');

    let resultText = '';
    let success = false;

    if (isDoublesteal) {
        // DOUBLE STEAL
        if (result >= 1 && result <= 3) {
            resultText = '❌ Lead runner OUT';
            // El corredor líder es out
            if (second && third) {
                // Out en home
                gameState.bases.third = null;
                clearTokensAtBase('third', true);
                gameState.outs++;
            } else if (first && second) {
                // Out en 3B
                gameState.bases.second = null;
                clearTokensAtBase('second', true);
                gameState.outs++;
            }
        } else if (result >= 4 && result <= 5) {
            resultText = '❌ Trailing runner OUT';
            // El corredor siguiente es out
            if (second && third) {
                // 2B out
                gameState.bases.second = null;
                clearTokensAtBase('second', true);
                gameState.outs++;
                // 3B avanza a home
                setTimeout(() => {
                    scoreRunner(third);
                    gameState.bases.third = null;
                }, 500);
            } else if (first && second) {
                // 1B out
                gameState.bases.first = null;
                clearTokensAtBase('first', true);
                gameState.outs++;
                // 2B avanza a 3B
                setTimeout(() => {
                    gameState.bases.third = second;
                    gameState.bases.second = null;
                    moveRunnerToBase(second, 'second', 'third');
                }, 500);
            }
        } else {
            resultText = '✅ Both runners SAFE!';
            success = true;
            // Ambos corredores avanzan
            if (second && third) {
                setTimeout(() => {
                    scoreRunner(third);
                    gameState.bases.third = second;
                    gameState.bases.second = null;
                    moveRunnerToBase(second, 'second', 'third');
                }, 500);
            } else if (first && second) {
                setTimeout(() => {
                    gameState.bases.third = second;
                    gameState.bases.second = first;
                    gameState.bases.first = null;
                    moveRunnerToBase(second, 'second', 'third');
                }, 500);
                setTimeout(() => {
                    moveRunnerToBase(first, 'first', 'second');
                }, 700);
            }
        }
    } else {
        // SINGLE STEAL
        if (result >= 1 && result <= 3) {
            resultText = '❌ Runner OUT';
            // Corredor es out
            if (third) {
                gameState.bases.third = null;
                clearTokensAtBase('third', true);
            } else if (second) {
                gameState.bases.second = null;
                clearTokensAtBase('second', true);
            } else if (first) {
                gameState.bases.first = null;
                clearTokensAtBase('first', true);
            }
            gameState.outs++;
        } else if (result >= 4 && result <= 7) {
            resultText = '✅ Runner SAFE!';
            success = true;
            // Corredor avanza una base
            if (third) {
                setTimeout(() => {
                    scoreRunner(third);
                    gameState.bases.third = null;
                }, 500);
            } else if (second) {
                setTimeout(() => {
                    gameState.bases.third = second;
                    gameState.bases.second = null;
                    moveRunnerToBase(second, 'second', 'third');
                }, 500);
            } else if (first) {
                setTimeout(() => {
                    gameState.bases.second = first;
                    gameState.bases.first = null;
                    moveRunnerToBase(first, 'first', 'second');
                }, 500);
            }
        } else if (result === 8) {
            // Roll 8 especial
            if (third && trait === 'S+') {
                resultText = '🌟 S+ STEALS HOME!';
                success = true;
                setTimeout(() => {
                    scoreRunner(third);
                    gameState.bases.third = null;
                }, 500);
            } else {
                resultText = '✅ Runner SAFE!';
                success = true;
                // Mismo resultado que 4-7
                if (third) {
                    setTimeout(() => {
                        scoreRunner(third);
                        gameState.bases.third = null;
                    }, 500);
                } else if (second) {
                    setTimeout(() => {
                        gameState.bases.third = second;
                        gameState.bases.second = null;
                        moveRunnerToBase(second, 'second', 'third');
                    }, 500);
                } else if (first) {
                    setTimeout(() => {
                        gameState.bases.second = first;
                        gameState.bases.first = null;
                        moveRunnerToBase(first, 'first', 'second');
                    }, 500);
                }
            }
        }
    }

    // Highlight row
    const rows = document.querySelectorAll('#base-steal-table-body tr');
    rows.forEach(row => row.style.backgroundColor = '');

    if (isDoublesteal) {
        if (result >= 1 && result <= 3) rows[0].style.backgroundColor = '#ef4444';
        else if (result >= 4 && result <= 5) rows[1].style.backgroundColor = '#f97316';
        else rows[2].style.backgroundColor = '#10b981';
    } else {
        if (result >= 1 && result <= 3) rows[0].style.backgroundColor = '#ef4444';
        else rows[1].style.backgroundColor = '#10b981';
    }

    // Display result
    let message = '<strong>' + resultText + '</strong>';
    if (modifier !== 0) {
        message += '<br><small>🎲 Roll base: ' + baseRoll + ' + Trait ' + trait + ': ' + (modifier > 0 ? '+' : '') + modifier + ' = ' + result + '</small>';
    }
    resultDiv.innerHTML = message;
    resultDiv.style.display = 'block';
    continueBtn.style.display = 'block';

    updateScoreboard();

    console.log('[BASE-STEAL] Roll:', baseRoll, (modifier !== 0 ? ' (' + modifier + ') = ' + result : ''), '| Result:', resultText);
}

function closeBaseStealTable() {
    const container = document.getElementById('base-steal-table-container');
    if (container) {
        container.style.display = 'none';
    }

    // Reset highlights
    const rows = document.querySelectorAll('#base-steal-table-body tr');
    rows.forEach(row => row.style.backgroundColor = '');

    // Continuar con el juego
    if (gameState.outs >= 3) {
        changeInning();
    } else {
        nextBatter();
    }
}

// ========================================
// HIT & RUN SYSTEM
// ========================================

let hitAndRunContext = {
    mssRoll: null,
    stealRoll: null,
    battingResult: null,
    stealResult: null,
    btModifier: 0
};

function showHitAndRunSystem() {
    console.log('[HIT&RUN] Iniciando sistema de Hit & Run');

    // Verificar que hay corredor en primera
    if (!gameState.bases.first) {
        alert('⚠️ No hay corredor en primera base para Hit & Run');
        return;
    }

    const batter = getCurrentBatter();
    if (!batter) return;

    // Determinar modificador según trait C+
    hitAndRunContext.btModifier = batter.trait === 'C+' ? 10 : 5;

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.id = 'hitrun-overlay';
    overlay.className = 'table-overlay';
    overlay.innerHTML = `
        <div class="table-container">
            <div class="table-header">
                <h3>⚡ HIT & RUN</h3>
                <p class="table-subtitle">
                    ${batter.name} (BT/OBT +${hitAndRunContext.btModifier})
                    <br>Corredor en 1B intenta robar
                </p>
            </div>

            <div class="table-content">
                <div class="dice-section">
                    <div class="dice-row">
                        <div class="dice-column">
                            <h4>MSS (Bateo)</h4>
                            <div class="dice-controls">
                                <label>Lanzador:</label>
                                <input type="number" id="hitrun-pitcher-value" placeholder="-" min="-20" max="20" style="width: 80px;">
                                <button onclick="rollHitRunPitcher()" class="mini-roll-btn">🎲</button>
                            </div>
                            <div class="dice-controls">
                                <label>Bateador:</label>
                                <input type="number" id="hitrun-batter-value" placeholder="-" min="1" max="100" style="width: 80px;">
                                <button onclick="rollHitRunBatter()" class="mini-roll-btn">🎲</button>
                            </div>
                            <div class="dice-result">
                                <strong>MSS:</strong> <span id="hitrun-mss-result">-</span>
                            </div>
                        </div>

                        <div class="dice-column">
                            <h4>D8 (Robo de Base)</h4>
                            <div class="dice-controls">
                                <label>Dado:</label>
                                <input type="number" id="hitrun-steal-value" placeholder="-" min="1" max="8" style="width: 80px;">
                                <button onclick="rollHitRunSteal()" class="mini-roll-btn">🎲</button>
                            </div>
                            <div class="dice-result">
                                <strong>Robo:</strong> <span id="hitrun-steal-result">-</span>
                            </div>
                        </div>
                    </div>

                    <button id="hitrun-calculate-btn" onclick="calculateHitAndRun()" class="confirm-btn" style="display:none; margin-top: 15px;">
                        ✓ Calcular Resultado
                    </button>
                </div>

                <div id="hitrun-result-section" style="display:none; margin-top: 20px; padding: 15px; background: #1e293b; border-radius: 8px;">
                    <h4 style="color: #fbbf24; margin-bottom: 10px;">Resultado:</h4>
                    <p id="hitrun-result-text" style="font-size: 1.1rem; line-height: 1.6;"></p>
                    <button onclick="applyHitAndRunResult()" class="confirm-btn" style="margin-top: 15px;">
                        ✓ Aplicar Resultado
                    </button>
                </div>
            </div>

            <div class="table-footer">
                <button onclick="closeHitAndRunSystem()" class="close-btn">✕ Cerrar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Forzar recalcular el display
    setTimeout(() => {
        overlay.style.display = 'flex';
    }, 10);
}

function rollHitRunPitcher() {
    const pitchingTeam = getCurrentPitchingTeam();
    const pitcher = gameState.pitcher[pitchingTeam];

    // Obtener el tipo de dado actual del pitcher
    const pitchDie = pitcher.currentPitchDie;
    const diceValue = parseInt(pitchDie.replace('d', '').replace('-', ''));
    const isNegative = pitchDie.startsWith('-');

    let result;
    if (isNegative) {
        result = -(Math.floor(Math.random() * diceValue) + 1);
    } else {
        result = Math.floor(Math.random() * diceValue) + 1;
    }

    document.getElementById('hitrun-pitcher-value').value = result;
    checkHitRunDiceComplete();
}

function rollHitRunBatter() {
    const result = Math.floor(Math.random() * 100) + 1;
    document.getElementById('hitrun-batter-value').value = result;
    checkHitRunDiceComplete();
}

function rollHitRunSteal() {
    const result = Math.floor(Math.random() * 8) + 1;
    document.getElementById('hitrun-steal-value').value = result;
    checkHitRunDiceComplete();
}

function checkHitRunDiceComplete() {
    const pitcherValue = document.getElementById('hitrun-pitcher-value').value;
    const batterValue = document.getElementById('hitrun-batter-value').value;
    const stealValue = document.getElementById('hitrun-steal-value').value;
    const calculateBtn = document.getElementById('hitrun-calculate-btn');

    if (pitcherValue !== '' && batterValue !== '' && stealValue !== '') {
        const mss = parseInt(pitcherValue) + parseInt(batterValue);
        document.getElementById('hitrun-mss-result').textContent = mss;

        hitAndRunContext.mssRoll = mss;
        hitAndRunContext.stealRoll = parseInt(stealValue);

        if (calculateBtn) calculateBtn.style.display = 'block';
    }
}

function calculateHitAndRun() {
    const batter = getCurrentBatter();
    const mss = hitAndRunContext.mssRoll;
    const stealRoll = hitAndRunContext.stealRoll;

    // Aplicar modificador de BT/OBT
    const bt = calculateBT(batter.avg) + hitAndRunContext.btModifier;
    const obt = calculateOBT(batter.obp) + hitAndRunContext.btModifier;

    // Determinar resultado del bateo
    let battingResult;
    if (mss >= 70) {
        battingResult = 'hit';
    } else if (mss >= 50) {
        battingResult = 'out'; // Flyout/popup
    } else if (mss >= bt) {
        battingResult = 'groundball';
    } else {
        battingResult = 'strikeout';
    }

    // Determinar resultado del robo (simplificado - single steal)
    // Aplicar modificadores normales de robo
    const runner = gameState.bases.first;
    let stealModifier = 0;

    // Trait S+ del corredor
    if (runner && runner.trait === 'S+') stealModifier += 1;

    // Trait S- del corredor
    if (runner && runner.trait === 'S-') stealModifier -= 1;

    const adjustedStealRoll = stealRoll + stealModifier;
    const stealSuccess = adjustedStealRoll >= 4; // 4-8 = success

    hitAndRunContext.battingResult = battingResult;
    hitAndRunContext.stealResult = stealSuccess;

    // Determinar resultado combinado según tabla
    let resultText = '';

    if (battingResult === 'hit') {
        if (stealSuccess) {
            resultText = '✅ HIT + ROBO EXITOSO\n\n' +
                `MSS: ${mss} (Hit)\n` +
                `D8: ${stealRoll} ${stealModifier !== 0 ? '(' + (stealModifier > 0 ? '+' : '') + stealModifier + ') = ' + adjustedStealRoll : ''} (Éxito)\n\n` +
                '📍 Corredores en 1B y 3B';
        } else {
            resultText = '⚠️ HIT + ROBO FALLIDO\n\n' +
                `MSS: ${mss} (Hit)\n` +
                `D8: ${stealRoll} ${stealModifier !== 0 ? '(' + (stealModifier > 0 ? '+' : '') + stealModifier + ') = ' + adjustedStealRoll : ''} (Fallo)\n\n` +
                '📍 Corredores en 1B y 2B';
        }
    } else if (battingResult === 'strikeout' || (battingResult === 'out' && mss < 70)) {
        if (stealSuccess) {
            resultText = '❌ STRIKEOUT/POP UP + ROBO EXITOSO\n\n' +
                `MSS: ${mss} (Out)\n` +
                `D8: ${stealRoll} ${stealModifier !== 0 ? '(' + (stealModifier > 0 ? '+' : '') + stealModifier + ') = ' + adjustedStealRoll : ''} (Éxito)\n\n` +
                '⚾ Bateador OUT\n' +
                '📍 Corredor se queda en 1B';
        } else {
            resultText = '💥 STRIKEOUT/POP UP + ROBO FALLIDO\n\n' +
                `MSS: ${mss} (Out)\n` +
                `D8: ${stealRoll} ${stealModifier !== 0 ? '(' + (stealModifier > 0 ? '+' : '') + stealModifier + ') = ' + adjustedStealRoll : ''} (Fallo)\n\n` +
                '⚾⚾ DOUBLE PLAY!';
        }
    } else if (battingResult === 'groundball') {
        if (stealSuccess) {
            resultText = '⚠️ GROUNDBALL + ROBO EXITOSO\n\n' +
                `MSS: ${mss} (Groundball)\n` +
                `D8: ${stealRoll} ${stealModifier !== 0 ? '(' + (stealModifier > 0 ? '+' : '') + stealModifier + ') = ' + adjustedStealRoll : ''} (Éxito)\n\n` +
                '⚾ Bateador OUT\n' +
                '📍 Corredor llega a 2B';
        } else {
            resultText = '💥 GROUNDBALL + ROBO FALLIDO\n\n' +
                `MSS: ${mss} (Groundball)\n` +
                `D8: ${stealRoll} ${stealModifier !== 0 ? '(' + (stealModifier > 0 ? '+' : '') + stealModifier + ') = ' + adjustedStealRoll : ''} (Fallo)\n\n` +
                '⚾⚾ DOUBLE PLAY!';
        }
    }

    document.getElementById('hitrun-result-text').textContent = resultText;
    document.getElementById('hitrun-result-section').style.display = 'block';
    document.getElementById('hitrun-calculate-btn').style.display = 'none';
}

function applyHitAndRunResult() {
    const battingResult = hitAndRunContext.battingResult;
    const stealSuccess = hitAndRunContext.stealResult;
    const batter = getCurrentBatter();
    const runner = gameState.bases.first;

    if (battingResult === 'hit') {
        if (stealSuccess) {
            // Hit + Steal Success = Runners at 1st and 3rd
            updateCascadeStatus('⚡ HIT & RUN: Hit + Robo Exitoso - Corredores en 1B y 3B');

            // Mover corredor a tercera
            gameState.bases.third = runner;
            gameState.bases.first = null;
            setTimeout(() => {
                clearTokensAtBase('first');
                moveRunnerToBase(runner, 'third');
            }, 200);

            // Bateador a primera
            gameState.bases.first = batter;
            setTimeout(() => {
                moveRunnerToBase(batter, 'first');
            }, 400);

            gameState.hits[getCurrentBattingTeam()]++;
        } else {
            // Hit + Steal Failure = Runners at 1st and 2nd
            updateCascadeStatus('⚡ HIT & RUN: Hit + Robo Fallido - Corredores en 1B y 2B');

            // Mover corredor a segunda
            gameState.bases.second = runner;
            gameState.bases.first = null;
            setTimeout(() => {
                clearTokensAtBase('first');
                moveRunnerToBase(runner, 'second');
            }, 200);

            // Bateador a primera
            gameState.bases.first = batter;
            setTimeout(() => {
                moveRunnerToBase(batter, 'first');
            }, 400);

            gameState.hits[getCurrentBattingTeam()]++;
        }
    } else if (battingResult === 'strikeout' || (battingResult === 'out' && hitAndRunContext.mssRoll < 70)) {
        if (stealSuccess) {
            // Strikeout/Pop + Steal Success = Batter out, runner stays at 1st
            updateCascadeStatus('⚡ HIT & RUN: Out + Robo Exitoso - Bateador OUT, corredor en 1B');
            gameState.outs++;
            // Corredor se queda en primera
        } else {
            // Strikeout/Pop + Steal Failure = Double Play
            updateCascadeStatus('⚡ HIT & RUN: Out + Robo Fallido - DOUBLE PLAY!');
            setTimeout(() => {
                alert('💥 DOUBLE PLAY en Hit & Run!\n\nEl bateador es eliminado y el corredor es atrapado robando.');
            }, 300);

            gameState.outs += 2;

            // Eliminar corredor
            const token = document.querySelector('[data-current-base="first"]');
            if (token) animateTokenPop(token);
            gameState.bases.first = null;
        }
    } else if (battingResult === 'groundball') {
        if (stealSuccess) {
            // Groundball + Steal Success = Batter out, runner reaches 2nd
            updateCascadeStatus('⚡ HIT & RUN: Groundball + Robo Exitoso - Bateador OUT, corredor a 2B');
            gameState.outs++;

            // Mover corredor a segunda
            gameState.bases.second = runner;
            gameState.bases.first = null;
            setTimeout(() => {
                clearTokensAtBase('first');
                moveRunnerToBase(runner, 'second');
            }, 200);
        } else {
            // Groundball + Steal Failure = Double Play
            updateCascadeStatus('⚡ HIT & RUN: Groundball + Robo Fallido - DOUBLE PLAY!');
            setTimeout(() => {
                alert('💥 DOUBLE PLAY en Hit & Run!\n\nGroundball a segunda base, eliminan al corredor y tiran a primera.');
            }, 300);

            gameState.outs += 2;

            // Eliminar corredor
            const token = document.querySelector('[data-current-base="first"]');
            if (token) animateTokenPop(token);
            gameState.bases.first = null;
        }
    }

    updateScoreboard();

    closeHitAndRunSystem();

    // Continuar con el juego
    if (gameState.outs >= 3) {
        changeInning();
    } else {
        nextBatter();
    }
}

function closeHitAndRunSystem() {
    const overlay = document.getElementById('hitrun-overlay');
    if (overlay) {
        overlay.remove();
    }

    // Reset context
    hitAndRunContext = {
        mssRoll: null,
        stealRoll: null,
        battingResult: null,
        stealResult: null,
        btModifier: 0
    };
}

// ========================================
// INJURY TABLES SYSTEM
// ========================================

let injuryContext = {
    playerType: null, // 'pitcher', 'fielder', 'batter'
    playerTeam: null,
    playerIndex: null,
    severityRoll: null,
    locationRoll: null
};

// Show Injury Severity Table (first step)
function showInjuryTable(playerType, context) {
    const container = document.getElementById('injury-severity-container');
    const playerNameSpan = document.getElementById('injured-player-name');

    if (!container) return;

    // Store context
    injuryContext.playerType = playerType;

    // Determine which player is injured
    let playerName = 'Unknown';
    if (context === 'current') {
        const batter = getCurrentBatter();
        playerName = batter ? batter.name : 'Bateador actual';
        injuryContext.playerTeam = getCurrentBattingTeam();
        injuryContext.playerIndex = getCurrentBatterIndex();
    } else if (context === 'previous') {
        const team = getCurrentBattingTeam();
        const prevIndex = getCurrentBatterIndex() - 1;
        injuryContext.playerTeam = team;
        injuryContext.playerIndex = prevIndex >= 0 ? prevIndex : 8;

        const table = document.getElementById('roster-' + team);
        if (table) {
            const rows = table.querySelectorAll('tbody tr');
            const row = rows[injuryContext.playerIndex];
            if (row) {
                const cells = row.querySelectorAll('td');
                playerName = cells[3] ? cells[3].textContent : 'Jugador anterior';
            }
        }
    }

    playerNameSpan.textContent = playerName;

    // Reset
    document.getElementById('injury-severity-d100-value').value = '';
    document.getElementById('injury-severity-result').style.display = 'none';
    document.getElementById('injury-severity-continue-btn').style.display = 'none';

    // Clear highlights
    const rows = document.querySelectorAll('#injury-severity-container tbody tr');
    rows.forEach(row => row.style.backgroundColor = '');

    container.style.display = 'block';

    console.log('[INJURY] Mostrando tabla de severidad para ' + playerType + ': ' + playerName);
}

function rollInjurySeverity() {
    const result = Math.floor(Math.random() * 100) + 1;
    injuryContext.severityRoll = result;

    document.getElementById('injury-severity-d100-value').value = result;

    const resultDiv = document.getElementById('injury-severity-result');
    const continueBtn = document.getElementById('injury-severity-continue-btn');

    let severity = '';
    let description = '';
    let highlightRow = null;

    if (result === 1) {
        severity = '💀 CATASTROPHIC';
        description = 'Jugador fuera por la temporada. Tirar en tabla catastrófica';
        highlightRow = '[data-severity="1"]';
    } else if (result >= 2 && result <= 5) {
        severity = '🔴 MAJOR';
        description = 'Jugador fuera por 2d20 juegos';
        highlightRow = '[data-severity="2-5"]';
    } else if (result >= 6 && result <= 10) {
        severity = '🟠 MINOR';
        description = 'Jugador fuera por d8 juegos';
        highlightRow = '[data-severity="6-10"]';
    } else if (result >= 11 && result <= 75) {
        severity = '🟡 SUPERFICIAL';
        description = 'Jugador juega con BT -5 o PD -1 por d6 juegos. Bonus traits anulados';
        highlightRow = '[data-severity="11-75"]';
    } else {
        severity = '✅ UNHURT';
        description = 'El jugador no está lesionado';
        highlightRow = '[data-severity="76-100"]';
    }

    if (highlightRow) {
        const row = document.querySelector('#injury-severity-container ' + highlightRow);
        if (row) row.style.backgroundColor = '#fbbf24';
    }

    resultDiv.innerHTML = '<strong style="font-size: 1.3rem;">' + severity + '</strong><p>' + description + '</p>';
    resultDiv.style.display = 'block';
    continueBtn.style.display = 'block';

    console.log('[INJURY] Severity roll: ' + result + ' - ' + severity);
}

function proceedAfterSeverity() {
    const severity = injuryContext.severityRoll;

    // Hide severity table
    document.getElementById('injury-severity-container').style.display = 'none';

    if (severity === 1) {
        // Catastrophic - show catastrophic table first, then location
        showCatastrophicTable();
    } else if (severity >= 76) {
        // Unhurt - close everything
        closeInjurySystem();
    } else {
        // Other severities - show location table
        showLocationTable();
    }
}

function showLocationTable() {
    const container = document.getElementById('injury-location-container');
    if (!container) return;

    // Reset
    document.getElementById('injury-location-d20-value').value = '';
    document.getElementById('injury-location-result').style.display = 'none';
    document.getElementById('injury-location-continue-btn').style.display = 'none';

    // Clear highlights
    const rows = document.querySelectorAll('#injury-location-container tbody tr');
    rows.forEach(row => row.style.backgroundColor = '');

    container.style.display = 'block';
}

function rollInjuryLocation() {
    const result = Math.floor(Math.random() * 20) + 1;
    injuryContext.locationRoll = result;

    document.getElementById('injury-location-d20-value').value = result;

    const resultDiv = document.getElementById('injury-location-result');
    const continueBtn = document.getElementById('injury-location-continue-btn');

    let location = '';
    let highlightRow = null;

    if (result === 1) {
        location = 'Head';
        highlightRow = '[data-location="1"]';
    } else if (result >= 2 && result <= 5) {
        location = 'Shoulder';
        highlightRow = '[data-location="2-5"]';
    } else if (result >= 6 && result <= 9) {
        location = 'Elbow';
        highlightRow = '[data-location="6-9"]';
    } else if (result === 10) {
        location = 'Forearm';
        highlightRow = '[data-location="10"]';
    } else if (result === 11) {
        location = 'Wrist';
        highlightRow = '[data-location="11"]';
    } else if (result === 12) {
        location = 'Hand';
        highlightRow = '[data-location="12"]';
    } else if (result >= 13 && result <= 14) {
        location = 'Back';
        highlightRow = '[data-location="13-14"]';
    } else if (result === 15) {
        location = 'Oblique';
        highlightRow = '[data-location="15"]';
    } else if (result === 16) {
        location = 'Hip';
        highlightRow = '[data-location="16"]';
    } else if (result === 17) {
        location = 'Hamstring';
        highlightRow = '[data-location="17"]';
    } else if (result === 18) {
        location = 'Knee';
        highlightRow = '[data-location="18"]';
    } else if (result === 19) {
        location = 'Ankle';
        highlightRow = '[data-location="19"]';
    } else if (result === 20) {
        location = 'Foot';
        highlightRow = '[data-location="20"]';
    }

    if (highlightRow) {
        const row = document.querySelector('#injury-location-container ' + highlightRow);
        if (row) row.style.backgroundColor = '#fbbf24';
    }

    resultDiv.innerHTML = '<strong>Lesión en: ' + location + '</strong>';
    resultDiv.style.display = 'block';
    continueBtn.style.display = 'block';

    console.log('[INJURY] Location roll: ' + result + ' - ' + location);
}

function showCatastrophicTable() {
    const container = document.getElementById('catastrophic-injury-container');
    if (!container) return;

    // Reset
    document.getElementById('catastrophic-d6-value').value = '';
    document.getElementById('catastrophic-result').style.display = 'none';
    document.getElementById('catastrophic-continue-btn').style.display = 'none';

    // Clear highlights
    const rows = document.querySelectorAll('#catastrophic-injury-container tbody tr');
    rows.forEach(row => row.style.backgroundColor = '');

    container.style.display = 'block';
}

function rollCatastrophicInjury() {
    const result = Math.floor(Math.random() * 6) + 1;

    document.getElementById('catastrophic-d6-value').value = result;

    const resultDiv = document.getElementById('catastrophic-result');
    const continueBtn = document.getElementById('catastrophic-continue-btn');

    let effect = '';
    let highlightRow = null;

    if (result === 1) {
        effect = '💀 PLAYER RETIRES (Modern) / PLAYER DIES (Ancient, head only)';
        highlightRow = '[data-catastrophic="1"]';
    } else {
        effect = '📉 Reduce permanentemente BT en d10+2 o PD en 1';
        highlightRow = '[data-catastrophic="2-6"]';
    }

    if (highlightRow) {
        const row = document.querySelector('#catastrophic-injury-container ' + highlightRow);
        if (row) row.style.backgroundColor = '#ef4444';
    }

    resultDiv.innerHTML = '<strong style="font-size: 1.3rem;">' + effect + '</strong>';
    resultDiv.style.display = 'block';
    continueBtn.style.display = 'block';

    // After catastrophic, still show location
    setTimeout(function() {
        document.getElementById('catastrophic-injury-container').style.display = 'none';
        showLocationTable();
    }, 3000);

    console.log('[INJURY] Catastrophic roll: ' + result);
}

function closeInjurySystem() {
    // Hide all injury containers
    document.getElementById('injury-severity-container').style.display = 'none';
    document.getElementById('injury-location-container').style.display = 'none';
    document.getElementById('catastrophic-injury-container').style.display = 'none';

    // Reset context
    injuryContext = {
        playerType: null,
        playerTeam: null,
        playerIndex: null,
        severityRoll: null,
        locationRoll: null
    };

    // Continue game
    if (gameState.outs >= 3) {
        changeInning();
    } else {
        nextBatter();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('[INIT] Script cargado correctamente');

    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startNewGame);
    }

    const resetBtn = document.getElementById('reset-game-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('Reiniciar el juego?')) {
                location.reload();
            }
        });
    }

    console.log('[INIT] Sistema listo');

    // Validación de posiciones únicas y campos editables tipo Excel
    setupRosterValidation();
});

// Validar que no haya posiciones repetidas (excepto DH que es opcional)
function setupRosterValidation() {
    const rosters = ['visitante', 'local'];

    rosters.forEach(team => {
        const table = document.getElementById(`roster-${team}`);
        if (!table) return;

        const positionSelects = table.querySelectorAll('.position-select');

        positionSelects.forEach(select => {
            select.addEventListener('change', function(e) {
                validatePositions(team, e.target);
            });
        });

        // Hacer campos AVG y OBP editables como inputs
        const avgCells = table.querySelectorAll('.batting-avg');
        const obpCells = table.querySelectorAll('.on-base-pct');

        avgCells.forEach(cell => makeEditable(cell, 'AVG'));
        obpCells.forEach(cell => makeEditable(cell, 'OBP'));
    });
}

function validatePositions(team, changedSelect) {
    const table = document.getElementById(`roster-${team}`);
    if (!table) return;

    const positionSelects = Array.from(table.querySelectorAll('.position-select'));
    const selectedPositions = {};
    let hasDuplicate = false;

    positionSelects.forEach(select => {
        const value = select.value;
        // DH es opcional, puede estar vacío o repetido
        if (value && value !== 'DH') {
            if (selectedPositions[value]) {
                hasDuplicate = true;
                select.style.border = '2px solid #ef4444';
                selectedPositions[value].style.border = '2px solid #ef4444';
            } else {
                selectedPositions[value] = select;
                select.style.border = '';
            }
        } else {
            select.style.border = '';
        }
    });

    if (hasDuplicate) {
        console.log(`[VALIDATION] Posiciones duplicadas en roster ${team}`);
    }
}

function makeEditable(cell, type) {
    cell.style.cursor = 'pointer';
    cell.title = `Click para editar ${type}`;

    cell.addEventListener('click', function() {
        const currentValue = cell.textContent.trim();
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.className = 'editable-input';
        input.style.width = '60px';
        input.style.background = '#1a1a2e';
        input.style.border = '1px solid #fbbf24';
        input.style.color = '#fff';
        input.style.padding = '2px 4px';
        input.style.textAlign = 'center';

        cell.textContent = '';
        cell.appendChild(input);
        input.focus();
        input.select();

        function saveValue() {
            let newValue = input.value.trim();

            // Validar formato .XXX
            if (newValue && !newValue.startsWith('.')) {
                newValue = '.' + newValue;
            }

            const numValue = parseFloat(newValue);
            if (isNaN(numValue) || numValue < 0 || numValue > 1) {
                alert(`${type} debe estar entre .000 y 1.000`);
                cell.textContent = currentValue;
                return;
            }

            cell.textContent = newValue;
            console.log(`[ROSTER] ${type} actualizado a ${newValue}`);
        }

        input.addEventListener('blur', saveValue);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveValue();
            }
        });
    });
}

// Funciones para el sistema de Banquillo
function toggleBench(team) {
    const benchTable = document.getElementById(`bench-table-${team}`);
    if (!benchTable) return;

    benchTable.style.display = benchTable.style.display === 'none' ? '' : 'none';
    console.log(`[BENCH] Banquillo ${team} ${benchTable.style.display === 'none' ? 'oculto' : 'visible'}`);
}

function addBenchPlayer(team) {
    const benchTable = document.getElementById(`bench-table-${team}`);
    if (!benchTable) return;

    const tbody = benchTable.querySelector('tbody');
    const newId = `${team === 'local' ? 'l' : ''}bench${Date.now()}`;
    const newNumber = tbody.querySelectorAll('tr').length + 10;

    const newRow = document.createElement('tr');
    newRow.className = 'player-row';
    newRow.draggable = true;
    newRow.setAttribute('data-player-id', newId);

    newRow.innerHTML = `
        <td class="drag-handle">⋮⋮</td>
        <td class="player-number">${newNumber}</td>
        <td class="player-photo">📷</td>
        <td class="player-name" contenteditable="true">Nuevo Jugador</td>
        <td>
            <select class="position-select" data-player="${newId}">
                <option value="">-</option>
                <option value="P">P</option>
                <option value="C">C</option>
                <option value="1B">1B</option>
                <option value="2B">2B</option>
                <option value="3B">3B</option>
                <option value="SS">SS</option>
                <option value="LF">LF</option>
                <option value="CF">CF</option>
                <option value="RF">RF</option>
                <option value="DH">DH</option>
            </select>
        </td>
        <td>
            <select class="handedness-select" data-player="${newId}">
                <option value="R" selected>R</option>
                <option value="L">L</option>
            </select>
        </td>
        <td class="batting-avg" contenteditable="true">.250</td>
        <td class="on-base-pct" contenteditable="true">.300</td>
        <td>
            <select class="trait-select" data-player="${newId}">
                <option value="" selected>-</option>
                <option value="P+">P+</option>
                <option value="P++">P++</option>
                <option value="C+">C+</option>
                <option value="S+">S+</option>
                <option value="D+">D+</option>
                <option value="T+">T+</option>
                <option value="P-">P-</option>
                <option value="P--">P--</option>
                <option value="C">C</option>
                <option value="S-">S-</option>
                <option value="D-">D-</option>
                <option value="K+">K+</option>
                <option value="GB+">GB+</option>
                <option value="CN+">CN+</option>
                <option value="ST+">ST+</option>
                <option value="CN-">CN-</option>
            </select>
        </td>
        <td class="game-status">🪑</td>
    `;

    tbody.appendChild(newRow);
    setupDragAndDrop(newRow);
    console.log(`[BENCH] Jugador añadido al banquillo ${team}`);
}

// Sistema de Drag and Drop entre roster y banquillo
function setupDragAndDrop(row) {
    row.addEventListener('dragstart', function(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
        e.dataTransfer.setData('playerId', this.getAttribute('data-player-id'));
        this.style.opacity = '0.4';
    });

    row.addEventListener('dragend', function(e) {
        this.style.opacity = '1';
    });

    row.addEventListener('dragover', function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    });

    row.addEventListener('drop', function(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        const draggedId = e.dataTransfer.getData('playerId');
        const draggedRow = document.querySelector(`[data-player-id="${draggedId}"]`);
        const targetRow = this;

        if (draggedRow && targetRow && draggedRow !== targetRow) {
            swapPlayers(draggedRow, targetRow);
        }

        return false;
    });
}

function swapPlayers(row1, row2) {
    const isRow1Bench = row1.closest('.bench-table') !== null;
    const isRow2Bench = row2.closest('.bench-table') !== null;

    // Intercambiar contenido completo
    const tempHTML = row1.innerHTML;
    const tempId = row1.getAttribute('data-player-id');

    row1.innerHTML = row2.innerHTML;
    row1.setAttribute('data-player-id', row2.getAttribute('data-player-id'));

    row2.innerHTML = tempHTML;
    row2.setAttribute('data-player-id', tempId);

    // Aplicar estilo tachado si pasa de roster a banquillo
    if (!isRow1Bench && isRow2Bench) {
        row2.style.textDecoration = 'line-through';
        row2.style.opacity = '0.6';
    } else if (isRow1Bench && !isRow2Bench) {
        row2.style.textDecoration = '';
        row2.style.opacity = '1';
    }

    if (isRow1Bench && !isRow2Bench) {
        row1.style.textDecoration = 'line-through';
        row1.style.opacity = '0.6';
    } else if (!isRow1Bench && isRow2Bench) {
        row1.style.textDecoration = '';
        row1.style.opacity = '1';
    }

    // Reconfigurar drag and drop
    setupDragAndDrop(row1);
    setupDragAndDrop(row2);

    console.log('[SWAP] Jugadores intercambiados');
}

// Inicializar drag and drop en todas las filas existentes
document.addEventListener('DOMContentLoaded', function() {
    const allRows = document.querySelectorAll('.player-row[draggable="true"]');
    allRows.forEach(row => setupDragAndDrop(row));
});

// ========================================
// HIT TABLE, DEFENSE TABLE, OUT TABLE
// ========================================

let cascadeContext = {
    currentMSS: null,
    hitType: null,
    defensePosition: null,
    lastDigit: null
};

// HIT TABLE (D20)
function showHitTable() {
    updateCascadeStatus('⚾ Tirando en Hit Table (D20)...');

    const container = document.getElementById('hit-table-container');
    if (container) {
        container.style.display = 'block';

        // Reset
        document.getElementById('hit-d20-value').value = '';
        document.getElementById('hit-result-display').style.display = 'none';
        document.getElementById('hit-continue-btn').style.display = 'none';

        // Clear highlights
        const rows = container.querySelectorAll('tbody tr');
        rows.forEach(row => row.style.backgroundColor = '');
    }
}

function rollHitD20() {
    const batter = getCurrentBatter();
    const trait = batter ? batter.trait : '';

    let baseRoll = Math.floor(Math.random() * 20) + 1;
    let modifier = 0;

    // Aplicar modificadores por traits
    if (trait === 'P+') modifier = 1;
    else if (trait === 'P++') modifier = 2;
    else if (trait === 'P-') modifier = -1;
    else if (trait === 'P--') modifier = -2;

    const result = Math.max(1, Math.min(20, baseRoll + modifier));

    document.getElementById('hit-d20-value').value = baseRoll + (modifier !== 0 ? ' (' + (modifier > 0 ? '+' : '') + modifier + ')' : '');

    const resultDisplay = document.getElementById('hit-result-display');
    const continueBtn = document.getElementById('hit-continue-btn');

    let hitType = '';
    let needsDefense = false;
    let position = '';
    let highlightRow = null;

    // C+ y S+ convierten rolls 1-2 en doubles (No DEF)
    const isContactHitter = trait === 'C+';
    const isSpeedyRunner = trait === 'S+';

    if (result >= 1 && result <= 2) {
        if (isContactHitter || isSpeedyRunner) {
            hitType = 'Double, runners advance 2';
            highlightRow = '[data-hit="10-14"]'; // Usar fila de advance 2
        } else {
            hitType = 'Single';
            highlightRow = '[data-hit="1-2"]';
        }
    } else if (result === 3) {
        hitType = 'Single';
        needsDefense = true;
        position = '1B';
        highlightRow = '[data-hit="3"]';
    } else if (result === 4) {
        hitType = 'Single';
        needsDefense = true;
        position = '2B';
        highlightRow = '[data-hit="4"]';
    } else if (result === 5) {
        hitType = 'Single';
        needsDefense = true;
        position = '3B';
        highlightRow = '[data-hit="5"]';
    } else if (result === 6) {
        hitType = 'Single';
        needsDefense = true;
        position = 'SS';
        highlightRow = '[data-hit="6"]';
    } else if (result >= 7 && result <= 9) {
        hitType = 'Single';
        highlightRow = '[data-hit="7-9"]';
    } else if (result >= 10 && result <= 14) {
        hitType = 'Single, runners advance 2';
        highlightRow = '[data-hit="10-14"]';
    } else if (result === 15) {
        hitType = 'Double';
        needsDefense = true;
        position = 'LF';
        highlightRow = '[data-hit="15"]';
    } else if (result === 16) {
        hitType = 'Double';
        needsDefense = true;
        position = 'CF';
        highlightRow = '[data-hit="16"]';
    } else if (result === 17) {
        hitType = 'Double';
        needsDefense = true;
        position = 'RF';
        highlightRow = '[data-hit="17"]';
    } else if (result === 18) {
        hitType = 'Double, runners advance 3';
        highlightRow = '[data-hit="18"]';
    } else if (result >= 19 && result <= 20) {
        hitType = 'Home Run';
        highlightRow = '[data-hit="19-20"]';
    }

    // Highlight row
    if (highlightRow) {
        const row = document.querySelector('#hit-table-container ' + highlightRow);
        if (row) row.style.backgroundColor = '#10b981';

        // Ocultar la tabla completa
        const table = document.querySelector('#hit-table-container table');
        if (table) table.style.display = 'none';
    }

    // Store context
    cascadeContext.hitType = hitType;
    cascadeContext.defensePosition = position;

    // Display result
    let message = '<strong>🎯 ' + hitType + '</strong>';
    if (modifier !== 0) {
        message += '<br><small>🎲 Roll base: ' + baseRoll + ' + Trait: ' + (modifier > 0 ? '+' : '') + modifier + ' = ' + result + '</small>';
    }
    if (isContactHitter || isSpeedyRunner) {
        message += '<br><small>⭐ Trait ' + trait + ': Rolls 1-2 = Double!</small>';
    }
    if (needsDefense) {
        message += '<br><small>⚠️ Requiere tirada defensiva en ' + position + '</small>';
    }
    resultDisplay.innerHTML = message;
    resultDisplay.style.display = 'block';
    continueBtn.style.display = 'block';

    console.log('[HIT] D20=' + result + ', Result: ' + hitType + (needsDefense ? ', DEF(' + position + ')' : ''));
}

function closeHitTable() {
    const container = document.getElementById('hit-table-container');
    if (container) container.style.display = 'none';

    // Si requiere defensa, mostrar Defense Table
    if (cascadeContext.defensePosition) {
        showDefenseTable(cascadeContext.defensePosition);
    } else {
        // Aplicar hit directamente
        applyHitResult();
    }
}

// DEFENSE TABLE (D12)
function showDefenseTable(position) {
    updateCascadeStatus('🛡️ Verificando defensa en ' + position + '...');

    const container = document.getElementById('defense-table-container');
    const positionLabel = document.getElementById('defense-position-label');

    if (container) {
        positionLabel.textContent = position;
        container.style.display = 'block';

        // Reset
        document.getElementById('defense-d12-value').value = '';
        document.getElementById('defense-result-display').style.display = 'none';
        document.getElementById('defense-continue-btn').style.display = 'none';

        // Clear highlights
        const rows = container.querySelectorAll('tbody tr');
        rows.forEach(row => row.style.backgroundColor = '');
    }
}

function rollDefenseD12() {
    const batter = getCurrentBatter();
    const trait = batter ? batter.trait : '';

    let baseRoll = Math.floor(Math.random() * 12) + 1;
    let modifier = 0;

    // Aplicar modificadores por traits del bateador
    if (trait === 'D+') modifier = 1;
    else if (trait === 'D-') modifier = -1;

    const result = Math.max(1, Math.min(12, baseRoll + modifier));

    document.getElementById('defense-d12-value').value = baseRoll + (modifier !== 0 ? ' (' + (modifier > 0 ? '+' : '') + modifier + ')' : '');

    const resultDisplay = document.getElementById('defense-result-display');
    const continueBtn = document.getElementById('defense-continue-btn');

    let defenseResult = '';
    let highlightRow = null;

    if (result >= 1 && result <= 2) {
        defenseResult = 'Error - Runners take extra base';
        highlightRow = '[data-defense="1-2"]';
    } else if (result >= 3 && result <= 9) {
        defenseResult = 'No change';
        highlightRow = '[data-defense="3-9"]';
    } else if (result >= 10 && result <= 11) {
        defenseResult = 'Double → Single, runners advance 2';
        highlightRow = '[data-defense="10-11"]';
    } else if (result === 12) {
        defenseResult = 'Hit → Out, runners hold';
        highlightRow = '[data-defense="12"]';
    }

    // Highlight row
    if (highlightRow) {
        const row = document.querySelector('#defense-table-container ' + highlightRow);
        if (row) {
            row.style.backgroundColor = '#f59e0b';

            // Ocultar la tabla completa
            const table = document.querySelector('#defense-table-container table');
            if (table) table.style.display = 'none';
        }
    }

    // Display result
    let message = '<strong>⚖️ ' + defenseResult + '</strong>';
    if (modifier !== 0) {
        message += '<br><small>🎲 Roll base: ' + baseRoll + ' + Trait ' + trait + ': ' + (modifier > 0 ? '+' : '') + modifier + ' = ' + result + '</small>';
    }
    resultDisplay.innerHTML = message;
    resultDisplay.style.display = 'block';
    continueBtn.style.display = 'block';

    console.log('[DEFENSE] D12=' + baseRoll + (modifier !== 0 ? ' (' + modifier + ')' : '') + ' = ' + result + ', Result: ' + defenseResult);
}

function closeDefenseTable() {
    const container = document.getElementById('defense-table-container');
    if (container) container.style.display = 'none';

    // Aplicar resultado del hit con modificación defensiva
    applyHitResult();
}

// OUT TABLE
function showOutTable(mss) {
    const lastDigit = mss % 10;
    cascadeContext.lastDigit = lastDigit;

    updateCascadeStatus('🚫 Consultando Out Table - Posición defensiva...');

    const container = document.getElementById('out-table-container');
    const digitLabel = document.getElementById('out-last-digit');

    if (container) {
        digitLabel.textContent = lastDigit;
        container.style.display = 'block';

        // Clear highlights
        const rows = container.querySelectorAll('tbody tr');
        rows.forEach(row => row.style.backgroundColor = '');

        // Highlight row
        const row = container.querySelector('[data-out="' + lastDigit + '"]');
        if (row) {
            row.style.backgroundColor = '#ef4444';

            // Ocultar la tabla completa
            const table = container.querySelector('table');
            if (table) table.style.display = 'none';
        }

        // Auto-show result
        const resultDisplay = document.getElementById('out-result-display');
        const continueBtn = document.getElementById('out-continue-btn');

        let outType = '';
        if (lastDigit === 0 || lastDigit === 1 || lastDigit === 2) {
            outType = 'Strikeout (K) - Runners hold';
        } else if (lastDigit === 3) {
            outType = 'Groundball to 1B (G-3) - Runners may advance';
        } else if (lastDigit === 4) {
            outType = 'Groundball to 2B (4-3) - Runners may advance';
        } else if (lastDigit === 5) {
            outType = 'Groundball to 3B (5-3) - Runners may advance';
        } else if (lastDigit === 6) {
            outType = 'Groundball to SS (6-3) - Runners may advance';
        } else if (lastDigit === 7) {
            outType = 'Pop-up to LF (F-7) - Runners hold unless tagging';
        } else if (lastDigit === 8) {
            outType = 'Pop-up to CF (F-8) - Runners hold unless tagging';
        } else if (lastDigit === 9) {
            outType = 'Pop-up to RF (F-9) - Runners hold unless tagging';
        }

        resultDisplay.innerHTML = '<strong>📍 ' + outType + '</strong>';
        resultDisplay.style.display = 'block';
        continueBtn.style.display = 'block';

        console.log('[OUT] Last digit: ' + lastDigit + ', Type: ' + outType);
    }
}

function closeOutTable() {
    const container = document.getElementById('out-table-container');
    if (container) container.style.display = 'none';

    // Aplicar resultado del out
    applyOutResult();
}

// BUNTING TABLE
function showBuntingTable() {
    updateCascadeStatus('⚾ Toque de bola - Tirando D6...');

    const container = document.getElementById('bunting-table-container');
    if (container) {
        container.style.display = 'block';

        const areaAzul = document.getElementById('plays-resolution-area');
        if (areaAzul) areaAzul.style.display = 'block';
    }

    console.log('[BUNTING] Tabla de toque mostrada');
}

function rollBuntingD6() {
    const batter = getCurrentBatter();
    const trait = batter ? batter.trait : '';
    const hitterRating = batter ? parseInt(batter.bt) : 50;

    let baseRoll = Math.floor(Math.random() * 6) + 1;
    let modifier = 0;

    // Aplicar modificadores por traits
    if (trait === 'C+') modifier = 1;
    else if (trait === 'C') modifier = -1;

    const roll = Math.max(1, Math.min(6, baseRoll + modifier));

    const input = document.getElementById('bunting-dice-value');
    const result = document.getElementById('bunting-result-value');

    if (input) input.value = baseRoll + (modifier !== 0 ? ' (' + (modifier > 0 ? '+' : '') + modifier + ')' : '');
    if (result) result.textContent = roll;

    cascadeContext.buntingRoll = roll;

    let situation = '';
    let resultText = '';

    if (roll >= 1 && roll <= 2) {
        situation = 'All batters';
        resultText = '📍 Lead runner OUT, batter SAFE';
    } else if (roll === 3) {
        const leadBase = getLeadRunner();
        if (leadBase === 'first' || leadBase === 'second') {
            situation = 'Lead runner at 1st or 2nd';
            resultText = '✅ Lead runner ADVANCES, batter OUT';
        } else if (leadBase === 'third') {
            situation = 'Lead runner at 3rd';
            resultText = '📍 Lead runner OUT, batter SAFE';
        } else {
            situation = 'No runners';
            resultText = '📍 Batter OUT';
        }
    } else if (roll >= 4 && roll <= 5) {
        situation = 'All batters';
        resultText = '✅ Lead runner ADVANCES, batter OUT';
    } else if (roll === 6) {
        if (hitterRating >= 5) {
            situation = '5+ hitter batting';
            resultText = '⚾ SINGLE, DEF (3B)';
        } else {
            situation = 'All other batters';
            resultText = '✅ Lead runner ADVANCES, batter OUT';
        }
    }

    // Highlight row
    const container = document.getElementById('bunting-table-container');
    if (container) {
        const rows = container.querySelectorAll('tbody tr');
        rows.forEach(row => row.style.backgroundColor = '');

        let targetRow = null;
        if (roll >= 1 && roll <= 2) targetRow = container.querySelector('[data-bunt="1-2"]');
        else if (roll === 3) targetRow = container.querySelector('[data-bunt="3"]');
        else if (roll >= 4 && roll <= 5) targetRow = container.querySelector('[data-bunt="4-5"]');
        else if (roll === 6) targetRow = container.querySelector('[data-bunt="6"]');

        if (targetRow) {
            targetRow.style.backgroundColor = '#f59e0b';

            // Ocultar tabla
            const table = container.querySelector('table');
            if (table) table.style.display = 'none';
        }
    }

    // Mostrar resultado
    const resultDisplay = document.getElementById('bunting-result-display');
    const continueBtn = document.getElementById('bunting-continue-btn');

    if (resultDisplay) {
        let message = '<strong>' + resultText + '</strong><br><small style="opacity: 0.8;">(' + situation + ')</small>';
        if (modifier !== 0) {
            message += '<br><small>🎲 Roll base: ' + baseRoll + ' + Trait ' + trait + ': ' + (modifier > 0 ? '+' : '') + modifier + ' = ' + roll + '</small>';
        }
        resultDisplay.innerHTML = message;
        resultDisplay.style.display = 'block';
    }

    if (continueBtn) continueBtn.style.display = 'block';

    updateCascadeStatus('⚾ ' + resultText);

    console.log('[BUNTING] Roll:', baseRoll, (modifier !== 0 ? ' (' + modifier + ') = ' + roll : ''), '| Result:', resultText);
}

function closeBuntingTable() {
    const container = document.getElementById('bunting-table-container');
    if (container) container.style.display = 'none';

    applyBuntingResult();
}

function getLeadRunner() {
    if (gameState.bases.third) return 'third';
    if (gameState.bases.second) return 'second';
    if (gameState.bases.first) return 'first';
    return null;
}

function applyBuntingResult() {
    const roll = cascadeContext.buntingRoll;
    const batter = getCurrentBatter();
    const hitterRating = batter ? parseInt(batter.bt) : 50;

    console.log('[BUNTING] Aplicando resultado de toque, roll:', roll);

    if (roll >= 1 && roll <= 2) {
        // Lead runner out, batter safe
        const leadBase = getLeadRunner();
        if (leadBase) {
            const runner = gameState.bases[leadBase];
            updateCascadeStatus('📍 ' + runner.name + ' OUT en toque, bateador SAFE en 1B');
            gameState.bases[leadBase] = null;
            clearTokensAtBase(leadBase, true);
            gameState.outs++;
            updateOuts();
        }
        // Bateador a primera
        gameState.bases.first = batter;
        createRunnerToken(batter, 'first');

    } else if (roll === 3) {
        const leadBase = getLeadRunner();
        if (leadBase === 'first') {
            // Runner avanza a 2B, batter out
            const runner = gameState.bases.first;
            gameState.bases.first = null;
            gameState.bases.second = runner;
            moveRunnerToBase(runner, 'first', 'second');
            updateCascadeStatus('✅ ' + runner.name + ' avanza a 2B, bateador OUT');
            gameState.outs++;
            updateOuts();

        } else if (leadBase === 'second') {
            // Runner avanza a 3B, batter out
            const runner = gameState.bases.second;
            gameState.bases.second = null;
            gameState.bases.third = runner;
            moveRunnerToBase(runner, 'second', 'third');
            updateCascadeStatus('✅ ' + runner.name + ' avanza a 3B, bateador OUT');
            gameState.outs++;
            updateOuts();

        } else if (leadBase === 'third') {
            // Runner out, batter safe
            const runner = gameState.bases.third;
            updateCascadeStatus('📍 ' + runner.name + ' OUT en 3B, bateador SAFE en 1B');
            gameState.bases.third = null;
            clearTokensAtBase('third', true);
            gameState.outs++;
            updateOuts();
            gameState.bases.first = batter;
            createRunnerToken(batter, 'first');
        } else {
            // No runners, batter out
            updateCascadeStatus('📍 Bateador OUT');
            gameState.outs++;
            updateOuts();
        }

    } else if (roll >= 4 && roll <= 5) {
        // Lead runner advances, batter out
        const leadBase = getLeadRunner();
        if (leadBase) {
            const runner = gameState.bases[leadBase];
            gameState.bases[leadBase] = null;

            if (leadBase === 'first') {
                gameState.bases.second = runner;
                moveRunnerToBase(runner, 'first', 'second');
                updateCascadeStatus('✅ ' + runner.name + ' avanza a 2B, bateador OUT');
            } else if (leadBase === 'second') {
                gameState.bases.third = runner;
                moveRunnerToBase(runner, 'second', 'third');
                updateCascadeStatus('✅ ' + runner.name + ' avanza a 3B, bateador OUT');
            } else if (leadBase === 'third') {
                scoreRunner(runner);
                updateCascadeStatus('✅ ' + runner.name + ' ANOTA, bateador OUT');
            }
        }
        gameState.outs++;
        updateOuts();

    } else if (roll === 6) {
        if (hitterRating >= 5) {
            // Single con posible error del 3B
            updateCascadeStatus('⚾ SINGLE en toque - Verificando defensa de 3B...');
            cascadeContext.hitType = 'Single';
            cascadeContext.hitLocation = 'Third Base';
            showDefenseTable('Third Base');
            return;
        } else {
            // Lead runner advances, batter out
            const leadBase = getLeadRunner();
            if (leadBase) {
                const runner = gameState.bases[leadBase];
                gameState.bases[leadBase] = null;

                if (leadBase === 'first') {
                    gameState.bases.second = runner;
                    moveRunnerToBase(runner, 'first', 'second');
                    updateCascadeStatus('✅ ' + runner.name + ' avanza a 2B, bateador OUT');
                } else if (leadBase === 'second') {
                    gameState.bases.third = runner;
                    moveRunnerToBase(runner, 'second', 'third');
                    updateCascadeStatus('✅ ' + runner.name + ' avanza a 3B, bateador OUT');
                } else if (leadBase === 'third') {
                    scoreRunner(runner);
                    updateCascadeStatus('✅ ' + runner.name + ' ANOTA, bateador OUT');
                }
            }
            gameState.outs++;
            updateOuts();
        }
    }

    // Avanzar al siguiente bateador después de un delay
    setTimeout(() => {
        if (gameState.outs >= 3) {
            endInning();
        } else {
            nextBatter();
        }
    }, 1500);
}

function closeOutTable() {
    const container = document.getElementById('out-table-container');
    if (container) container.style.display = 'none';

    // Aplicar out y avanzar juego
    applyOutResult();
}

// Aplicar resultados
function applyHitResult() {
    updateCascadeStatus('✅ Aplicando resultado del hit...');

    const batter = getCurrentBatter();
    const hitType = cascadeContext.hitType;

    console.log('[HIT] Aplicando: ' + hitType + ' para ' + batter.name);

    // Determinar movimiento según tipo de hit
    if (hitType === 'Home Run') {
        applyHomeRun(batter);
        // Home Run necesita más tiempo para animaciones completas (3s)
        setTimeout(function() {
            document.getElementById('plays-resolution-area').style.display = 'none';
            updateCascadeStatus('⚡ Esperando jugada...');

            if (gameState.outs >= 3) {
                changeInning();
            } else {
                nextBatter();
            }
        }, 4000);
        return;
    } else if (hitType.includes('Single, runners advance 2')) {
        applySingleAdvance2(batter);
    } else if (hitType.includes('Single')) {
        applySingle(batter);
    } else if (hitType.includes('Double, runners advance 3')) {
        applyDoubleAdvance3(batter);
    } else if (hitType.includes('Double')) {
        applyDouble(batter);
    }

    // Reset cascade area después de animaciones (2s para otros hits)
    setTimeout(function() {
        document.getElementById('plays-resolution-area').style.display = 'none';
        updateCascadeStatus('⚡ Esperando jugada...');

        if (gameState.outs >= 3) {
            changeInning();
        } else {
            nextBatter();
        }
    }, 3000);
}

function applySingle(batter) {
    updateCascadeStatus('💫 Single - Moviendo tokens...');

    // Guardar estado actual de bases
    const oldBases = {
        first: gameState.bases.first,
        second: gameState.bases.second,
        third: gameState.bases.third
    };

    // Anotar corredor en 3ra
    if (oldBases.third) {
        const runner = oldBases.third;
        const token = document.querySelector('[data-base="third"]');
        if (token) {
            animateTokenScore(token);
        }
        addRun(getCurrentBattingTeam(), 1);
        console.log('[HIT] Corredor anota desde 3ra: ' + runner.name);
    }

    // Actualizar bases inmediatamente
    gameState.bases = { first: batter, second: oldBases.first, third: oldBases.second };

    // Mover corredores con animación
    if (oldBases.second) {
        setTimeout(function() {
            clearTokensAtBase('second', false);
            moveRunnerToBase(oldBases.second, 'third');
        }, 300);
    }

    if (oldBases.first) {
        setTimeout(function() {
            clearTokensAtBase('first', false);
            moveRunnerToBase(oldBases.first, 'second');
        }, 300);
    }

    // Bateador a 1ra
    setTimeout(function() {
        moveRunnerToBase(batter, 'first');
    }, 600);

    updateScoreboard();
}

function applySingleAdvance2(batter) {
    updateCascadeStatus('💫 Single (runners adv 2) - Moviendo tokens...');

    // Guardar estado actual
    const oldBases = {
        first: gameState.bases.first,
        second: gameState.bases.second,
        third: gameState.bases.third
    };

    // Anotar corredores en 2da y 3ra
    if (oldBases.third) {
        const token = document.querySelector('[data-base="third"]');
        if (token) animateTokenScore(token);
        addRun(getCurrentBattingTeam(), 1);
    }

    if (oldBases.second) {
        setTimeout(function() {
            const token = document.querySelector('[data-base="second"]');
            if (token) animateTokenScore(token);
        }, 200);
        addRun(getCurrentBattingTeam(), 1);
    }

    // Actualizar bases
    gameState.bases = { first: batter, second: null, third: oldBases.first };

    // Avanzar corredor de 1ra a 3ra
    if (oldBases.first) {
        setTimeout(function() {
            clearTokensAtBase('first');
            clearTokensAtBase('second');
            moveRunnerToBase(oldBases.first, 'third');
        }, 400);
    }

    // Bateador a 1ra
    setTimeout(function() {
        moveRunnerToBase(batter, 'first');
    }, 600);

    updateScoreboard();
}

function applyDouble(batter) {
    updateCascadeStatus('💫 Double - Moviendo tokens...');

    // Guardar estado actual
    const oldBases = {
        first: gameState.bases.first,
        second: gameState.bases.second,
        third: gameState.bases.third
    };

    // Anotar corredores en 2da y 3ra
    if (oldBases.third) {
        const token = document.querySelector('[data-base="third"]');
        if (token) animateTokenScore(token);
        addRun(getCurrentBattingTeam(), 1);
    }

    if (oldBases.second) {
        setTimeout(function() {
            const token = document.querySelector('[data-base="second"]');
            if (token) animateTokenScore(token);
        }, 200);
        addRun(getCurrentBattingTeam(), 1);
    }

    // Actualizar bases
    gameState.bases = { first: null, second: batter, third: oldBases.first };

    // Avanzar corredor de 1ra a 3ra
    if (oldBases.first) {
        setTimeout(function() {
            clearTokensAtBase('first');
            clearTokensAtBase('second');
            moveRunnerToBase(oldBases.first, 'third');
        }, 400);
    }

    // Bateador a 2da
    setTimeout(function() {
        clearTokensAtBase('second');
        moveRunnerToBase(batter, 'second');
    }, 600);

    updateScoreboard();
}

function applyDoubleAdvance3(batter) {
    updateCascadeStatus('💫 Double (runners adv 3) - Moviendo tokens...');

    // Guardar estado actual
    const oldBases = {
        first: gameState.bases.first,
        second: gameState.bases.second,
        third: gameState.bases.third
    };

    // Todos los corredores anotan
    if (oldBases.third) {
        const token = document.querySelector('[data-base="third"]');
        if (token) animateTokenScore(token);
        addRun(getCurrentBattingTeam(), 1);
    }

    if (oldBases.second) {
        setTimeout(function() {
            const token = document.querySelector('[data-base="second"]');
            if (token) animateTokenScore(token);
        }, 200);
        addRun(getCurrentBattingTeam(), 1);
    }

    if (oldBases.first) {
        setTimeout(function() {
            const token = document.querySelector('[data-base="first"]');
            if (token) animateTokenScore(token);
        }, 400);
        addRun(getCurrentBattingTeam(), 1);
    }

    // Actualizar bases
    gameState.bases = { first: null, second: batter, third: null };

    // Bateador a 2da
    setTimeout(function() {
        clearTokensAtBase('first');
        clearTokensAtBase('second');
        clearTokensAtBase('third');
        moveRunnerToBase(batter, 'second');
    }, 600);

    updateScoreboard();
}

function applyHomeRun(batter) {
    updateCascadeStatus('🎆 HOME RUN! - Todos anotan...');

    let totalRuns = 1; // El bateador

    // Mostrar overlay de HOME RUN
    const overlay = document.getElementById('home-run-overlay');
    if (overlay) {
        overlay.style.display = 'block';
        overlay.style.opacity = '1';
        overlay.style.animation = 'homeRunPulse 3s ease-in-out';
        setTimeout(function() {
            overlay.style.opacity = '0';
            overlay.style.display = 'none';
            overlay.style.animation = '';
        }, 3000);
    }

    // Crear confeti
    createConfetti();

    // Guardar corredores en bases
    const oldBases = {
        first: gameState.bases.first,
        second: gameState.bases.second,
        third: gameState.bases.third
    };

    // Contar total de carreras
    if (oldBases.third) totalRuns++;
    if (oldBases.second) totalRuns++;
    if (oldBases.first) totalRuns++;

    // Crear token del bateador que hará la carrera completa
    const stadium = document.querySelector('.baseball-field');
    if (stadium) {
        const homeRunToken = document.createElement('div');
        homeRunToken.className = 'runner-token home-run-runner';
        homeRunToken.style.position = 'absolute';
        homeRunToken.style.left = '50%';
        homeRunToken.style.top = '50%';
        homeRunToken.style.width = '40px';
        homeRunToken.style.height = '40px';
        homeRunToken.style.borderRadius = '50%';
        homeRunToken.style.backgroundImage = 'url(' + batter.photo + ')';
        homeRunToken.style.backgroundSize = 'cover';
        homeRunToken.style.border = '3px solid #fbbf24';
        homeRunToken.style.boxShadow = '0 0 20px #fbbf24';
        homeRunToken.style.zIndex = '1000';
        stadium.appendChild(homeRunToken);

        // Eliminar el token después de la animación
        setTimeout(function() {
            if (homeRunToken.parentNode) {
                homeRunToken.parentNode.removeChild(homeRunToken);
            }
        }, 3000);
    }

    // Limpiar tokens existentes en bases
    setTimeout(function() {
        if (oldBases.third) {
            const token = document.querySelector('[data-base="third"]');
            if (token) animateTokenScore(token);
        }
        if (oldBases.second) {
            const token = document.querySelector('[data-base="second"]');
            if (token) animateTokenScore(token);
        }
        if (oldBases.first) {
            const token = document.querySelector('[data-base="first"]');
            if (token) animateTokenScore(token);
        }
    }, 1500);

    // Registrar carreras con tracking de fatiga
    addRun(getCurrentBattingTeam(), totalRuns);

    // Limpiar bases
    gameState.bases = { first: null, second: null, third: null };

    console.log('[HIT] Home Run! ' + totalRuns + ' carreras anotadas');
}

function createConfetti() {
    const colors = ['#fbbf24', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(function() {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = (Math.random() * 0.5) + 's';
            confetti.style.animationDuration = (Math.random() * 1 + 2) + 's';
            document.body.appendChild(confetti);

            setTimeout(function() {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 3000);
        }, i * 20);
    }
}

function applyOutResult() {
    updateCascadeStatus('✅ Aplicando out...');

    const lastDigit = cascadeContext.lastDigit;

    // Guardar estado de bases antes de aplicar el out
    const oldBases = {
        first: gameState.bases.first,
        second: gameState.bases.second,
        third: gameState.bases.third
    };

    // Incrementar outs
    gameState.outs++;

    // Aplicar lógica según tipo de out
    if (lastDigit >= 0 && lastDigit <= 2) {
        // ========== STRIKEOUT (K) - Corredores permanecen ==========
        updateCascadeStatus('⚾ Strikeout! OUT #' + gameState.outs + ' - Corredores permanecen');
        console.log('[OUT] Strikeout - Los corredores no avanzan');

        // Registrar strikeout para el pitcher
        const pitchingTeam = getCurrentPitchingTeam();
        recordStrikeout(pitchingTeam);

    } else if (lastDigit >= 3 && lastDigit <= 6) {
        // ========== GROUNDBALL (Infield) ==========
        const mss = cascadeContext.currentMSS || 0;
        const isRightSide = (lastDigit === 3 || lastDigit === 4); // 1B o 2B

        // TRIPLE PLAY: Corredores en 1B y 2B, nadie out, MSS ≥ 100
        if (oldBases.first && oldBases.second && gameState.outs === 1 && mss >= 100) {
            updateCascadeStatus('⚾⚾⚾ TRIPLE PLAY!!!');

            setTimeout(function() {
                alert('🔥🔥🔥 TRIPLE PLAY! 🔥🔥🔥\n\n' +
                    'MSS: ' + mss + ' (≥100)\n' +
                    'Outs: 0 (nadie out)\n' +
                    'Corredores en 1B y 2B\n' +
                    'Groundball al infield\n\n' +
                    '❌ Corredor de 2B OUT\n' +
                    '❌ Corredor de 1B OUT\n' +
                    '❌ Bateador OUT\n\n' +
                    '🎭 ¡3 OUTS! ¡ENTRADA TERMINADA!\n' +
                    '💢 ¡El bateador estrella su casco contra el suelo!');
            }, 100);

            // Eliminar ambos corredores con animación
            gameState.outs = 3;
            gameState.bases.first = null;
            gameState.bases.second = null;

            setTimeout(function() {
                clearTokensAtBase('first', true);
            }, 300);

            setTimeout(function() {
                clearTokensAtBase('second', true);
            }, 500);

            console.log('[OUT] TRIPLE PLAY - ¡3 outs! Entrada terminada');

            // DOUBLE PLAY o FIELDER'S CHOICE: Corredor en 1B
        } else if (oldBases.first && gameState.outs < 3) {

            if (mss < 50) {
                // MSS < 50: Corredor avanza a 2B, bateador OUT
                updateCascadeStatus('⚾ Groundball - Bateador OUT, corredor avanza a 2B');

                setTimeout(function() {
                    alert('⚡ FIELDER\'S CHOICE (MSS < 50)\n\n' +
                        'MSS: ' + mss + ' (menos de 50)\n' +
                        'Corredor en 1B\n' +
                        'Groundball al infield\n\n' +
                        '❌ Bateador OUT en 1B\n' +
                        '✅ Corredor avanza 1B → 2B\n\n' +
                        '💪 ¡High fives en el dugout!');
                }, 100);

                // Mover corredor a segunda
                setTimeout(function() {
                    clearTokensAtBase('first');
                    moveRunnerToBase(oldBases.first, 'second');
                    gameState.bases.second = oldBases.first;
                    gameState.bases.first = null;
                    updateScoreboard();
                    console.log('[OUT] Fielder\'s Choice - Corredor avanza, bateador out');
                }, 300);

            } else if (mss >= 50 && mss < 70) {
                // MSS 50-69: Corredor OUT en 2B, bateador SAFE en 1B (Fielder's Choice)
                updateCascadeStatus('⚾ FIELDER\'S CHOICE - Corredor OUT, bateador SAFE');

                setTimeout(function() {
                    alert('📝 FIELDER\'S CHOICE (MSS 50-69)\n\n' +
                        'MSS: ' + mss + ' (entre 50 y 69)\n' +
                        'Corredor en 1B\n' +
                        'Groundball al infield\n\n' +
                        '❌ Corredor OUT en 2B\n' +
                        '✅ Bateador SAFE en 1B (FC)\n\n' +
                        '📋 Todos escriben "FC" en su scorecard');
                }, 100);

                // Eliminar corredor de primera con animación
                gameState.bases.first = null;
                setTimeout(function() {
                    clearTokensAtBase('first', true);
                }, 300);

                // Bateador llega a primera
                const batter = getCurrentBatter();
                setTimeout(function() {
                    gameState.bases.first = {
                        id: batter.id,
                        name: batter.name,
                        number: batter.number,
                        team: getCurrentBattingTeam(),
                        mlbId: batter.mlbId
                    };
                    moveRunnerToBase(gameState.bases.first, 'first');
                    updateScoreboard();
                    console.log('[OUT] Fielder\'s Choice - Corredor out, bateador safe en 1B');
                }, 600);

                // El bateador NO es out, así que no incrementamos outs
                gameState.outs--;

            } else {
                // MSS ≥ 70: DOUBLE PLAY - Ambos OUT
                updateCascadeStatus('⚾⚾ DOUBLE PLAY! (MSS ≥70)');

                setTimeout(function() {
                    alert('⚡⚡ DOUBLE PLAY! (MSS ≥70)\n\n' +
                        'MSS: ' + mss + ' (≥70)\n' +
                        'Corredor en 1B\n' +
                        'Groundball rápido al infield\n\n' +
                        '❌ Corredor OUT en 2B\n' +
                        '❌ Bateador OUT en 1B\n\n' +
                        '🙌 ¡Los defensores chocan las manos!');
                }, 100);

                gameState.outs++;
                gameState.bases.first = null;

                // Limpiar token de primera base con animación
                setTimeout(function() {
                    clearTokensAtBase('first', true);
                }, 300);

                console.log('[OUT] Double Play - Bateador y corredor de 1ra out');
            }

        } else {
            // Sin corredor en primera, verificar sacrifice
            const canSacrifice = (gameState.outs < 2) && (mss < 70) && (oldBases.second || oldBases.third) && isRightSide;

            updateCascadeStatus('⚾ Groundball al infield! OUT #' + gameState.outs);
            // Sin corredor en primera, verificar sacrifice

            // Corredor de 3ra puede anotar (sacrifice) si MSS < 70 y lado derecho
            if (gameState.outs < 3 && oldBases.third) {
                if (canSacrifice) {
                    setTimeout(function() {
                        alert('🎯 SACRIFICE GROUNDBALL!\n\n' +
                            'MSS: ' + mss + ' (menos de 70)\n' +
                            'Outs: ' + (gameState.outs - 1) + ' (menos de 2)\n' +
                            'Groundball al lado derecho (1B/2B)\n\n' +
                            '✅ Corredor de 3B puede anotar\n\n' +
                            'Si el MSS hubiera sido ≥70, sería demasiado rápido y el corredor permanecería.');
                    }, 100);

                    setTimeout(function() {
                        const token = document.querySelector('[data-base="third"]');
                        if (token) animateTokenScore(token);
                        addRun(getCurrentBattingTeam(), 1);
                        gameState.bases.third = null;
                        updateScoreboard();
                        console.log('[OUT] Sacrifice groundball - Corredor anota desde 3ra');
                    }, 300);
                } else {
                    console.log('[OUT] Groundball - Corredor de 3ra permanece (MSS ≥70 o no lado derecho)');
                }
            }

            // Corredor de 2da puede avanzar a 3ra si MSS < 70 y lado derecho
            if (gameState.outs < 3 && oldBases.second && canSacrifice && !oldBases.third) {
                setTimeout(function() {
                    clearTokensAtBase('second');
                    moveRunnerToBase(oldBases.second, 'third');
                    gameState.bases.third = oldBases.second;
                    gameState.bases.second = null;
                    updateScoreboard();
                    console.log('[OUT] Sacrifice groundball - Corredor avanza 2da → 3ra');
                }, 300);
            }
        }

    } else if (lastDigit >= 7 && lastDigit <= 9) {
        // ========== FLY BALL / POP-UP (Outfield) ==========
        const mss = cascadeContext.currentMSS || 0;
        const canSacFly = (gameState.outs < 2) && (mss < 70) && (oldBases.second || oldBases.third);

        if (canSacFly) {
            updateCascadeStatus('⚾ SACRIFICE FLY! OUT #' + gameState.outs + ' - MSS < 70, corredores avanzan');
            console.log('[OUT] Sacrifice Fly - MSS: ' + mss + ' < 70, corredores pueden avanzar');

            // Mostrar aviso explicativo
            setTimeout(function() {
                alert('🎯 SACRIFICE FLY!\n\n' +
                    'MSS: ' + mss + ' (menos de 70)\n' +
                    'Outs: ' + (gameState.outs - 1) + ' (menos de 2)\n' +
                    'Fly ball profundo al outfield\n\n' +
                    '✅ Los corredores en 2B/3B pueden avanzar (tag up)\n\n' +
                    'Si el MSS hubiera sido ≥70, la bola sería demasiado corta y los corredores permanecerían.');
            }, 100);
        } else {
            updateCascadeStatus('⚾ Fly out! OUT #' + gameState.outs + ' - Corredores pueden avanzar');
        }

        // Corredores en 2da y 3ra avanzan (tag up) solo si MSS < 70 y menos de 2 outs
        let delay = 300;

        // Corredor de 3ra anota (solo si sacrifice fly o menos de 3 outs)
        if (oldBases.third && gameState.outs < 3 && canSacFly) {
            setTimeout(function() {
                const token = document.querySelector('[data-base="third"]');
                if (token) animateTokenScore(token);
                addRun(getCurrentBattingTeam(), 1);
                gameState.bases.third = null;
                console.log('[OUT] Sacrifice fly - Corredor anota desde 3ra (tag up)');
            }, delay);
            delay += 200;
        } else if (oldBases.third && !canSacFly) {
            console.log('[OUT] Fly ball corto (MSS ≥70) - Corredor de 3ra permanece');
        }

        // Corredor de 2da avanza a 3ra (solo si sacrifice fly)
        if (oldBases.second && gameState.outs < 3 && canSacFly) {
            setTimeout(function() {
                clearTokensAtBase('second');
                moveRunnerToBase(oldBases.second, 'third');
                gameState.bases.third = oldBases.second;
                gameState.bases.second = null;
                console.log('[OUT] Sacrifice fly - Corredor avanza 2da → 3ra (tag up)');
            }, delay);
            delay += 200;
        } else if (oldBases.second && !canSacFly) {
            console.log('[OUT] Fly ball corto (MSS ≥70) - Corredor de 2da permanece');
        }

        // Corredor de 1ra permanece (no puede avanzar en fly ball)
        if (oldBases.first) {
            console.log('[OUT] Fly ball - Corredor de 1ra permanece');
        }

        // Actualizar scoreboard después de todos los movimientos
        setTimeout(function() {
            updateScoreboard();
        }, delay);
    }

    updateScoreboard();

    // Reset cascade area
    setTimeout(function() {
        document.getElementById('plays-resolution-area').style.display = 'none';
        updateCascadeStatus('⚡ Esperando jugada...');

        if (gameState.outs >= 3) {
            changeInning();
        } else {
            nextBatter();
        }
    }, 2000);
}

// ========================================
// PANEL DE TESTING/DESARROLLO
// ========================================

function toggleTestingPanel() {
    console.log('[TEST] Toggle panel llamado');
    const panel = document.getElementById('testing-panel-content');
    console.log('[TEST] Panel encontrado:', panel);
    if (panel) {
        const newDisplay = panel.style.display === 'none' ? 'block' : 'none';
        console.log('[TEST] Cambiando display de', panel.style.display, 'a', newDisplay);
        panel.style.display = newDisplay;
    } else {
        console.error('[TEST] No se encontró el panel testing-panel-content');
    }
}

function testAllOddities() {
    console.log('[TEST] testAllOddities llamado');
    showOdditiesTable();
}

function testOddity(oddityNumber) {
    console.log('[TEST] Probando Oddity #' + oddityNumber);

    // Simular que tenemos un bateador activo
    if (!gameState.isGameActive) {
        alert('⚠️ Inicia el juego primero para tener jugadores activos');
        return;
    }

    // Aplicar el efecto directamente
    applyOddityEffect(oddityNumber);
}

function testHomeRun() {
    console.log('[TEST] Probando Home Run');

    if (!gameState.isGameActive) {
        alert('⚠️ Inicia el juego primero');
        return;
    }

    const batter = getCurrentBatter();

    // Simular algunos corredores en bases para efecto completo
    if (!gameState.bases.first) {
        const lineup = gameState.currentTeam === 'visitante' ? gameState.equipoVisitante.lineup : gameState.equipoLocal.lineup;
        gameState.bases.first = lineup[0];
        createRunnerToken(lineup[0], 'first');
    }
    if (!gameState.bases.second) {
        const lineup = gameState.currentTeam === 'visitante' ? gameState.equipoVisitante.lineup : gameState.equipoLocal.lineup;
        gameState.bases.second = lineup[1];
        createRunnerToken(lineup[1], 'second');
    }
    if (!gameState.bases.third) {
        const lineup = gameState.currentTeam === 'visitante' ? gameState.equipoVisitante.lineup : gameState.equipoLocal.lineup;
        gameState.bases.third = lineup[2];
        createRunnerToken(lineup[2], 'third');
    }

    applyHomeRun(batter);
}

function testSingle() {
    console.log('[TEST] Probando Single');

    if (!gameState.isGameActive) {
        alert('⚠️ Inicia el juego primero');
        return;
    }

    const batter = getCurrentBatter();
    applySingle(batter);
}

function testDouble() {
    console.log('[TEST] Probando Double');

    if (!gameState.isGameActive) {
        alert('⚠️ Inicia el juego primero');
        return;
    }

    const batter = getCurrentBatter();
    applyDouble(batter);
}

function testStrikeout() {
    console.log('[TEST] Probando Strikeout');

    if (!gameState.isGameActive) {
        alert('⚠️ Inicia el juego primero');
        return;
    }

    cascadeContext.lastDigit = 0; // Strikeout
    applyOutResult();
}

function testGroundball() {
    console.log('[TEST] Probando Groundball');

    if (!gameState.isGameActive) {
        alert('⚠️ Inicia el juego primero');
        return;
    }

    cascadeContext.lastDigit = 4; // Groundball
    applyOutResult();
}

function testFlyball() {
    console.log('[TEST] Probando Fly Ball');

    if (!gameState.isGameActive) {
        alert('⚠️ Inicia el juego primero');
        return;
    }

    // Poner corredores en bases para ver el efecto
    const lineup = gameState.currentTeam === 'visitante' ? gameState.equipoVisitante.lineup : gameState.equipoLocal.lineup;
    gameState.bases.second = lineup[0];
    createRunnerToken(lineup[0], 'second');
    gameState.bases.third = lineup[1];
    createRunnerToken(lineup[1], 'third');

    cascadeContext.lastDigit = 8; // Fly ball
    applyOutResult();
}

function testBunting() {
    console.log('[TEST] Probando Bunting');

    if (!gameState.isGameActive) {
        alert('⚠️ Inicia el juego primero');
        return;
    }

    // Poner corredores en bases para ver el efecto
    const lineup = gameState.currentTeam === 'visitante' ? gameState.equipoVisitante.lineup : gameState.equipoLocal.lineup;
    gameState.bases.first = lineup[0];
    createRunnerToken(lineup[0], 'first');
    gameState.bases.third = lineup[1];
    createRunnerToken(lineup[1], 'third');

    showBuntingTable();
}

// Verificar que el panel está disponible al cargar
document.addEventListener('DOMContentLoaded', function() {
    console.log('[INIT] Inicializando sistema de juego...');

    // Mover las tablas de cascada al contenedor azul
    const cascadeContainer = document.getElementById('cascade-tables-container');
    const swingTable = document.getElementById('swing-result-table-container');
    const hitTable = document.getElementById('hit-table-container');
    const defenseTable = document.getElementById('defense-table-container');
    const outTable = document.getElementById('out-table-container');
    const buntingTable = document.getElementById('bunting-table-container');

    if (cascadeContainer && swingTable && hitTable && defenseTable && outTable && buntingTable) {
        // Verificar si las tablas están en el lugar correcto
        if (swingTable.parentElement.id !== 'cascade-tables-container') {
            console.log('[INIT] Moviendo tablas al área de resolución azul...');
            cascadeContainer.appendChild(swingTable);
            cascadeContainer.appendChild(hitTable);
            cascadeContainer.appendChild(defenseTable);
            cascadeContainer.appendChild(outTable);
            cascadeContainer.appendChild(buntingTable);
            console.log('[INIT] ✓ Tablas reorganizadas correctamente');
        }
    }

    // Verificar panel de testing
    console.log('[TEST] Verificando panel de testing...');
    const testPanel = document.getElementById('testing-panel');
    const testContent = document.getElementById('testing-panel-content');
    const testBtn = document.getElementById('testing-panel-btn');
    console.log('[TEST] Panel container:', testPanel ? 'ENCONTRADO ✓' : 'NO ENCONTRADO ✗');
    console.log('[TEST] Panel content:', testContent ? 'ENCONTRADO ✓' : 'NO ENCONTRADO ✗');
    console.log('[TEST] Panel button:', testBtn ? 'ENCONTRADO ✓' : 'NO ENCONTRADO ✗');

    if (testBtn) {
        console.log('[TEST] Botón visible:', testBtn.offsetWidth > 0 && testBtn.offsetHeight > 0 ? 'SÍ ✓' : 'NO ✗');
        console.log('[TEST] Posición botón:', {
            bottom: testBtn.parentElement.style.bottom,
            right: testBtn.parentElement.style.right,
            zIndex: testBtn.parentElement.style.zIndex
        });
    }

    console.log('%c🧪 Panel de Testing listo - Busca el botón morado en la esquina inferior derecha', 'background: #8b5cf6; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
    console.log('%c⚾ Sistema de cascada listo - Todas las tablas en el área azul', 'background: #3b82f6; color: white; padding: 8px; border-radius: 4px; font-weight: bold;');
});

// ========================================
// TEAM SELECTION & CONFIGURATION SYSTEM
// ========================================

let currentEditingTeam = null;

const MLB_TEAMS = {
    yankees: {
        name: 'New York Yankees',
        abbr: 'NYY',
        players: [
            { name: 'Aaron Judge', number: 99, position: 'RF', hand: 'R', avg: '.291', obp: '.404', trait: 'P+' },
            { name: 'Anthony Volpe', number: 11, position: 'SS', hand: 'R', avg: '.209', obp: '.283', trait: '' },
            { name: 'Juan Soto', number: 22, position: 'LF', hand: 'L', avg: '.288', obp: '.410', trait: 'P++' },
            { name: 'Giancarlo Stanton', number: 27, position: 'DH', hand: 'R', avg: '.233', obp: '.301', trait: 'P+' },
            { name: 'Gleyber Torres', number: 25, position: '2B', hand: 'R', avg: '.257', obp: '.330', trait: '' },
            { name: 'Anthony Rizzo', number: 48, position: '1B', hand: 'L', avg: '.243', obp: '.335', trait: 'D+' },
            { name: 'DJ LeMahieu', number: 26, position: '3B', hand: 'R', avg: '.243', obp: '.301', trait: 'C+' },
            { name: 'Alex Verdugo', number: 24, position: 'CF', hand: 'L', avg: '.233', obp: '.291', trait: '' },
            { name: 'Jose Trevino', number: 39, position: 'C', hand: 'R', avg: '.215', obp: '.271', trait: 'D+' }
        ]
    },
    dodgers: {
        name: 'Los Angeles Dodgers',
        abbr: 'LAD',
        players: [
            { name: 'Shohei Ohtani', number: 17, position: 'DH', hand: 'L', avg: '.310', obp: '.390', trait: 'P++' },
            { name: 'Mookie Betts', number: 50, position: 'RF', hand: 'R', avg: '.289', obp: '.372', trait: 'P+' },
            { name: 'Freddie Freeman', number: 5, position: '1B', hand: 'L', avg: '.331', obp: '.410', trait: 'P+' },
            { name: 'Will Smith', number: 16, position: 'C', hand: 'R', avg: '.261', obp: '.354', trait: '' },
            { name: 'Max Muncy', number: 13, position: '3B', hand: 'L', avg: '.212', obp: '.327', trait: '' },
            { name: 'Teoscar Hernández', number: 37, position: 'LF', hand: 'R', avg: '.272', obp: '.339', trait: 'P+' },
            { name: 'Gavin Lux', number: 9, position: '2B', hand: 'L', avg: '.251', obp: '.320', trait: '' },
            { name: 'James Outman', number: 28, position: 'CF', hand: 'L', avg: '.147', obp: '.273', trait: 'S+' },
            { name: 'Miguel Rojas', number: 11, position: 'SS', hand: 'R', avg: '.283', obp: '.331', trait: 'D+' }
        ]
    },
    red_sox: {
        name: 'Boston Red Sox',
        abbr: 'BOS',
        players: [
            { name: 'Rafael Devers', number: 11, position: '3B', hand: 'L', avg: '.272', obp: '.354', trait: 'P+' },
            { name: 'Jarren Duran', number: 16, position: 'CF', hand: 'L', avg: '.285', obp: '.342', trait: 'S+' },
            { name: 'Tyler O\'Neill', number: 17, position: 'RF', hand: 'R', avg: '.241', obp: '.319', trait: 'P+' },
            { name: 'Triston Casas', number: 36, position: '1B', hand: 'L', avg: '.241', obp: '.358', trait: '' },
            { name: 'Ceddanne Rafaela', number: 43, position: 'SS', hand: 'R', avg: '.246', obp: '.284', trait: 'S+' },
            { name: 'Wilyer Abreu', number: 52, position: 'LF', hand: 'L', avg: '.253', obp: '.322', trait: 'D+' },
            { name: 'Connor Wong', number: 74, position: 'C', hand: 'R', avg: '.280', obp: '.333', trait: '' },
            { name: 'Masataka Yoshida', number: 7, position: 'DH', hand: 'L', avg: '.280', obp: '.349', trait: 'C+' },
            { name: 'Vaughn Grissom', number: 10, position: '2B', hand: 'R', avg: '.190', obp: '.259', trait: '' }
        ]
    },
    giants: {
        name: 'San Francisco Giants',
        abbr: 'SF',
        players: [
            { name: 'Jung Hoo Lee', number: 62, position: 'CF', hand: 'L', avg: '.262', obp: '.310', trait: 'C+' },
            { name: 'Matt Chapman', number: 26, position: '3B', hand: 'R', avg: '.247', obp: '.328', trait: 'D+' },
            { name: 'Heliot Ramos', number: 17, position: 'RF', hand: 'R', avg: '.269', obp: '.321', trait: '' },
            { name: 'Wilmer Flores', number: 41, position: '1B', hand: 'R', avg: '.255', obp: '.330', trait: '' },
            { name: 'Patrick Bailey', number: 15, position: 'C', hand: 'S', avg: '.257', obp: '.314', trait: 'D+' },
            { name: 'Tyler Fitzgerald', number: 49, position: 'SS', hand: 'R', avg: '.280', obp: '.333', trait: 'S+' },
            { name: 'Mike Yastrzemski', number: 5, position: 'LF', hand: 'L', avg: '.231', obp: '.302', trait: '' },
            { name: 'Thairo Estrada', number: 39, position: '2B', hand: 'R', avg: '.238', obp: '.285', trait: '' },
            { name: 'Jorge Soler', number: 12, position: 'DH', hand: 'R', avg: '.241', obp: '.330', trait: 'P+' }
        ]
    }
};

// ========================================
// MLB STATS API INTEGRATION
// ========================================

// Mapeo de posiciones MLB a posiciones del juego
const POSITION_MAP = {
    'Pitcher': 'P',
    'Catcher': 'C',
    'First Base': '1B',
    'Second Base': '2B',
    'Third Base': '3B',
    'Shortstop': 'SS',
    'Left Field': 'LF',
    'Center Field': 'CF',
    'Right Field': 'RF',
    'Designated Hitter': 'DH',
    'Outfield': 'CF'
};

// Convertir estadísticas MLB a traits del juego
function calculateTraitFromStats(stats, position) {
    if (!stats) return '';

    const avg = parseFloat(stats.avg) || 0;
    const obp = parseFloat(stats.obp) || 0;
    const slg = parseFloat(stats.slg) || 0;
    const hr = parseInt(stats.homeRuns) || 0;
    const sb = parseInt(stats.stolenBases) || 0;
    const ops = obp + slg;
    const strikeouts = parseInt(stats.strikeOuts) || 0;
    const atBats = parseInt(stats.atBats) || 1;
    const kRate = strikeouts / atBats;

    // Power trait (basado en HR y SLG)
    // P++ para los sluggers élite
    if (hr >= 40 || (hr >= 30 && slg >= 0.550)) return 'P++';
    // P+ para buenos power hitters
    if (hr >= 25 || (hr >= 20 && slg >= 0.500)) return 'P+';
    // P- para poco power
    if (hr <= 5 && slg <= 0.370) return 'P-';
    // P-- para power muy bajo
    if (hr <= 2 && slg <= 0.320) return 'P--';

    // Contact trait (basado en AVG alto y K% bajo)
    // C+ para jugadores con excelente contacto
    if (avg >= 0.300 && kRate <= 0.15) return 'C+';
    if (avg >= 0.290 && kRate <= 0.18 && ops >= 0.800) return 'C+';

    // Speed trait (basado en SB)
    // S+ para velocistas
    if (sb >= 25) return 'S+';
    // S- para jugadores lentos
    if (sb === 0 && position && (position === 'C' || position === '1B')) return 'S-';

    // Defense trait (basado en posición y contexto)
    // D+ para catchers y defensores
    if (position === 'C' || position === 'SS' || position === 'CF') {
        if (avg >= 0.260 || obp >= 0.330) return 'D+';
    }
    // D- para jugadores con muy mala defensa (generalmente DH)
    if (position === 'DH' && avg < 0.240) return 'D-';

    return '';
}

// Importar equipo desde MLB Stats API
async function importMLBTeam() {
    const selector = document.getElementById('mlb-team-selector');
    const teamId = selector.value;
    const statusDiv = document.getElementById('import-status');

    if (!teamId) {
        statusDiv.textContent = '⚠️ Selecciona un equipo primero';
        statusDiv.style.color = '#f59e0b';
        return;
    }

    statusDiv.textContent = '⏳ Importando equipo...';
    statusDiv.style.color = '#60a5fa';

    try {
        // Obtener roster del equipo para la temporada 2024
        const rosterResponse = await fetch(
            `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?rosterType=active&season=2024`
        );

        if (!rosterResponse.ok) {
            throw new Error('Error al obtener roster del equipo');
        }

        const rosterData = await rosterResponse.json();
        const roster = rosterData.roster || [];

        // Filtrar solo jugadores de posición (no pitchers)
        const positionPlayers = roster.filter(p =>
            p.position.abbreviation !== 'P' &&
            p.position.abbreviation !== 'TWP'
        );

        if (positionPlayers.length === 0) {
            throw new Error('No se encontraron jugadores de posición');
        }

        statusDiv.textContent = `⏳ Cargando estadísticas de ${positionPlayers.length} jugadores...`;

        // Obtener estadísticas de cada jugador
        const players = [];
        let processed = 0;

        for (const rosterPlayer of positionPlayers.slice(0, 15)) {
            try {
                const statsResponse = await fetch(
                    `https://statsapi.mlb.com/api/v1/people/${rosterPlayer.person.id}?hydrate=stats(group=[hitting],type=[season],season=2024)`
                );

                if (!statsResponse.ok) continue;

                const playerData = await statsResponse.json();
                const person = playerData.people[0];

                // Obtener estadísticas de bateo
                let batting = {
                    avg: '.000',
                    obp: '.000',
                    slg: '.000',
                    homeRuns: 0,
                    stolenBases: 0,
                    strikeOuts: 0,
                    atBats: 0
                };

                if (person.stats && person.stats.length > 0) {
                    const hittingStats = person.stats.find(s => s.group.displayName === 'hitting');
                    if (hittingStats && hittingStats.splits && hittingStats.splits.length > 0) {
                        const stats = hittingStats.splits[0].stat;
                        batting = {
                            avg: stats.avg || '.000',
                            obp: stats.obp || '.000',
                            slg: stats.slg || '.000',
                            homeRuns: stats.homeRuns || 0,
                            stolenBases: stats.stolenBases || 0,
                            strikeOuts: stats.strikeOuts || 0,
                            atBats: stats.atBats || 0
                        };
                    }
                }

                // Convertir posición
                const position = POSITION_MAP[rosterPlayer.position.name] || rosterPlayer.position.abbreviation;

                // Calcular trait basado en estadísticas y posición
                const trait = calculateTraitFromStats(batting, position);

                players.push({
                    name: person.fullName,
                    number: person.primaryNumber || '0',
                    position: position,
                    hand: (person.batSide && person.batSide.code) || 'R',
                    avg: batting.avg.startsWith('.') ? batting.avg : '.' + batting.avg,
                    obp: batting.obp.startsWith('.') ? batting.obp : '.' + batting.obp,
                    trait: trait
                });

                processed++;
                statusDiv.textContent = `⏳ Procesado ${processed}/${positionPlayers.slice(0, 15).length} jugadores...`;

            } catch (err) {
                console.error('Error al procesar jugador:', err);
                continue;
            }
        }

        if (players.length === 0) {
            throw new Error('No se pudieron obtener estadísticas de jugadores');
        }

        // Ordenar por OBP descendente y tomar los mejores 9
        players.sort((a, b) => parseFloat(b.obp) - parseFloat(a.obp));
        const bestPlayers = players.slice(0, 9);

        // Obtener nombre del equipo
        const teamResponse = await fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}`);
        const teamData = await teamResponse.json();
        const teamName = teamData.teams[0].name;

        // Actualizar UI
        document.getElementById('team-name').value = teamName;
        displayPlayersEditor(bestPlayers);

        statusDiv.textContent = `✅ ${teamName} importado correctamente (${bestPlayers.length} jugadores)`;
        statusDiv.style.color = '#10b981';

        console.log(`[MLB IMPORT] Equipo ${teamName} importado con ${bestPlayers.length} jugadores`);

    } catch (error) {
        console.error('[MLB IMPORT] Error:', error);
        statusDiv.textContent = `❌ Error: ${error.message}`;
        statusDiv.style.color = '#ef4444';
    }
}

function openTeamConfig(team) {
    currentEditingTeam = team;
    const modal = document.getElementById('team-config-modal');
    const modalTitle = document.getElementById('modal-title');
    const teamNameInput = document.getElementById('team-name');

    if (!modal) {
        console.error('[TEAM CONFIG] Modal no encontrado');
        return;
    }

    // Actualizar título
    const teamDisplay = team === 'visitante' ? 'Visitante' : 'Local';
    modalTitle.textContent = `⚙️ Configurar Equipo ${teamDisplay}`;

    // Limpiar nombre del equipo
    teamNameInput.value = '';

    // Resetear selector
    document.getElementById('preset-teams').value = '';

    // Limpiar editor de jugadores
    document.getElementById('players-editor').innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">Selecciona un equipo predefinido o edita manualmente</p>';

    // Mostrar modal
    modal.style.display = 'flex';

    console.log(`[TEAM CONFIG] Modal abierto para equipo: ${team}`);
}

function closeTeamConfig() {
    const modal = document.getElementById('team-config-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentEditingTeam = null;
    console.log('[TEAM CONFIG] Modal cerrado');
}

function loadPresetTeam() {
    const selector = document.getElementById('preset-teams');
    const teamKey = selector.value;

    if (!teamKey || teamKey === 'custom') {
        document.getElementById('players-editor').innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">Modo personalizado - Edita directamente en la tabla del roster</p>';
        return;
    }

    const team = MLB_TEAMS[teamKey];
    if (!team) {
        console.error('[TEAM CONFIG] Equipo no encontrado:', teamKey);
        return;
    }

    // Actualizar nombre del equipo
    document.getElementById('team-name').value = team.name;

    // Mostrar jugadores en el editor
    displayPlayersEditor(team.players);

    console.log(`[TEAM CONFIG] Equipo cargado: ${team.name}`);
}

function displayPlayersEditor(players) {
    const editor = document.getElementById('players-editor');

    let html = '<div class="players-list">';

    players.forEach((player, index) => {
        html += `
            <div class="player-card">
                <div class="player-card-header">
                    <span class="player-number">#${player.number}</span>
                    <input type="text" class="player-name-input" value="${player.name}" data-index="${index}">
                </div>
                <div class="player-card-body">
                    <div class="player-stat">
                        <label>Pos:</label>
                        <select class="player-pos-select" data-index="${index}">
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
                    </div>
                    <div class="player-stat">
                        <label>Mano:</label>
                        <select class="player-hand-select" data-index="${index}">
                            <option value="R" ${player.hand === 'R' ? 'selected' : ''}>R</option>
                            <option value="L" ${player.hand === 'L' ? 'selected' : ''}>L</option>
                            <option value="S" ${player.hand === 'S' ? 'selected' : ''}>S</option>
                        </select>
                    </div>
                    <div class="player-stat">
                        <label>AVG:</label>
                        <input type="text" class="player-avg-input" value="${player.avg}" data-index="${index}">
                    </div>
                    <div class="player-stat">
                        <label>OBP:</label>
                        <input type="text" class="player-obp-input" value="${player.obp}" data-index="${index}">
                    </div>
                    <div class="player-stat">
                        <label>Trait:</label>
                        <select class="player-trait-select" data-index="${index}">
                            <option value="" ${player.trait === '' ? 'selected' : ''}>-</option>
                            <option value="P+" ${player.trait === 'P+' ? 'selected' : ''}>P+</option>
                            <option value="P++" ${player.trait === 'P++' ? 'selected' : ''}>P++</option>
                            <option value="C+" ${player.trait === 'C+' ? 'selected' : ''}>C+</option>
                            <option value="S+" ${player.trait === 'S+' ? 'selected' : ''}>S+</option>
                            <option value="D+" ${player.trait === 'D+' ? 'selected' : ''}>D+</option>
                            <option value="P-" ${player.trait === 'P-' ? 'selected' : ''}>P-</option>
                            <option value="P--" ${player.trait === 'P--' ? 'selected' : ''}>P--</option>
                            <option value="S-" ${player.trait === 'S-' ? 'selected' : ''}>S-</option>
                            <option value="D-" ${player.trait === 'D-' ? 'selected' : ''}>D-</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    editor.innerHTML = html;
}

function saveTeamConfig() {
    if (!currentEditingTeam) {
        alert('⚠️ Error: No hay equipo seleccionado');
        return;
    }

    const teamName = document.getElementById('team-name').value.trim();
    const presetValue = document.getElementById('preset-teams').value;

    if (!teamName && presetValue && presetValue !== 'custom') {
        alert('⚠️ Por favor ingresa un nombre para el equipo');
        return;
    }

    // Obtener datos de jugadores del editor
    const playerCards = document.querySelectorAll('.player-card');
    const players = [];

    playerCards.forEach((card, index) => {
        const name = card.querySelector('.player-name-input').value;
        const number = card.querySelector('.player-number').textContent.replace('#', '');
        const position = card.querySelector('.player-pos-select').value;
        const hand = card.querySelector('.player-hand-select').value;
        const avg = card.querySelector('.player-avg-input').value;
        const obp = card.querySelector('.player-obp-input').value;
        const trait = card.querySelector('.player-trait-select').value;

        players.push({ name, number, position, hand, avg, obp, trait });
    });

    if (players.length === 0) {
        alert('⚠️ No hay jugadores para cargar. Selecciona un equipo predefinido primero.');
        return;
    }

    // Cargar jugadores en la tabla del roster
    loadPlayersToRoster(currentEditingTeam, players, teamName);

    // Cerrar modal
    closeTeamConfig();

    alert(`✅ Equipo "${teamName || currentEditingTeam}" cargado correctamente con ${players.length} jugadores`);
}

function loadPlayersToRoster(team, players, teamName) {
    const table = document.getElementById('roster-' + team);
    if (!table) {
        console.error('[TEAM CONFIG] Tabla no encontrada:', team);
        return;
    }

    const tbody = table.querySelector('tbody');
    if (!tbody) {
        console.error('[TEAM CONFIG] tbody no encontrado');
        return;
    }

    // Actualizar nombre del equipo en el header si se proporcionó
    if (teamName) {
        const teamHeader = table.closest('.col').querySelector('.team-header h2');
        if (teamHeader) {
            const icon = team === 'visitante' ? '🛫' : '🏠';
            teamHeader.textContent = `${icon} ${teamName}`;
        }
    }

    // Limpiar filas existentes (mantener solo las primeras 9)
    const rows = tbody.querySelectorAll('tr');
    const rowsToUpdate = Math.min(rows.length, players.length);

    for (let i = 0; i < rowsToUpdate; i++) {
        const row = rows[i];
        const player = players[i];
        const cells = row.querySelectorAll('td');

        // Actualizar player-id
        row.setAttribute('data-player-id', i + 1);

        // Actualizar número
        if (cells[1]) cells[1].textContent = player.number;

        // Actualizar nombre
        if (cells[3]) cells[3].textContent = player.name;

        // Actualizar posición
        const posSelect = cells[4] && cells[4].querySelector('.position-select');
        if (posSelect) posSelect.value = player.position;

        // Actualizar mano
        const handSelect = cells[5] && cells[5].querySelector('.handedness-select');
        if (handSelect) handSelect.value = player.hand;

        // Actualizar AVG
        if (cells[6]) cells[6].textContent = player.avg;

        // Actualizar OBP
        if (cells[7]) cells[7].textContent = player.obp;

        // Actualizar trait
        const traitSelect = cells[8] && cells[8].querySelector('.trait-select');
        if (traitSelect) traitSelect.value = player.trait;
    }

    console.log(`[TEAM CONFIG] ${players.length} jugadores cargados en el roster de ${team}`);
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(event) {
    const modal = document.getElementById('team-config-modal');
    if (modal && event.target === modal) {
        closeTeamConfig();
    }
});

// ===== SISTEMA DE FOTOS DE JUGADORES =====

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

    // Fallback: intentar buscar por apellido en el diccionario conocido
    const lastName = player.name.split(' ').pop();
    const match = Object.keys(mlbPhotos).find(name => name.includes(lastName));
    if (match) {
        console.log(`✅ Foto encontrada por apellido (${lastName}): ${match}`);
        return mlbPhotos[match];
    }

    // Si tiene mlbId pero no está en el diccionario, intentar construir URL
    // PERO solo para jugadores reales, no genéricos
    if (player.mlbId && !player.name.startsWith('Jugador')) {
        const url = `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${player.mlbId}/headshot/67/current`;
        console.log(`✅ URL construida con mlbId: ${url}`);
        return url;
    }

    console.log(`⚠️ No se encontró foto en diccionario para: ${player.name}, generando avatar`);

    // Generar avatar con canvas directamente
    return generateAvatarUrl(player.name);
}

function generateAvatarUrl(playerName) {
    // Extraer iniciales del nombre
    const nameParts = playerName.trim().split(' ');
    const initials = nameParts.length >= 2 ?
        `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}` :
        nameParts[0].substring(0, 2);

    // Colores aleatorios pero consistentes basados en el nombre
    const colors = [
        { bg: '#3B82F6', fg: '#FFFFFF' }, // Azul
        { bg: '#EF4444', fg: '#FFFFFF' }, // Rojo
        { bg: '#10B981', fg: '#FFFFFF' }, // Verde
        { bg: '#F59E0B', fg: '#FFFFFF' }, // Amarillo/Naranja
        { bg: '#8B5CF6', fg: '#FFFFFF' }, // Púrpura
        { bg: '#EC4899', fg: '#FFFFFF' }, // Rosa
        { bg: '#06B6D4', fg: '#FFFFFF' }, // Cyan
        { bg: '#F97316', fg: '#FFFFFF' } // Naranja
    ];

    // Seleccionar color basado en el primer caracter del nombre
    const colorIndex = playerName.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];

    // Crear canvas para generar avatar localmente
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Fondo con color
    ctx.fillStyle = color.bg;
    ctx.fillRect(0, 0, 128, 128);

    // Texto con iniciales
    ctx.fillStyle = color.fg;
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials.toUpperCase(), 64, 64);

    // Convertir canvas a Data URL
    const dataUrl = canvas.toDataURL('image/png');

    console.log(`🎨 Avatar generado localmente para ${playerName}: ${initials}`);
    return dataUrl;
}

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

            // Crear token con foto o avatar
            const tokenHTML = `
                <div class="roster-player-token">
                    <img src="${photoUrl}" 
                         style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" 
                         alt="${playerName}"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=&quot;font-size:14px;font-weight:bold&quot;>${initials}</span>';" />
                </div>`;

            photoCell.innerHTML = tokenHTML;
            console.log(`✅ Foto/Avatar actualizado para ${playerName}: ${photoUrl}`);
        });
    });

    console.log('✅ Fotos actualizadas');
}

// ===== SISTEMA DE POSICIONAMIENTO DE DADOS =====

function updateDiceSystemPosition() {
    const visitanteContainer = document.getElementById('dice-container-visitante');
    const localContainer = document.getElementById('dice-container-local');

    if (!visitanteContainer || !localContainer) {
        console.warn('⚠️ Contenedores de dados no encontrados');
        return;
    }

    console.log(`🎲 updateDiceSystemPosition - isTopHalf: ${gameState.isTopHalf}`);

    if (gameState.isTopHalf) {
        // Visitante batea - mostrar en columna izquierda
        visitanteContainer.style.display = 'block';
        localContainer.style.display = 'none';
        console.log('✅ Dados en columna VISITANTE (izquierda)');
    } else {
        // Local batea - mostrar en columna derecha
        visitanteContainer.style.display = 'none';
        localContainer.style.display = 'block';
        console.log('✅ Dados en columna LOCAL (derecha)');
    }
}

// Llamar a refreshPlayerPhotos cuando se carga la página
setTimeout(() => {
    refreshPlayerPhotos();
}, 500);