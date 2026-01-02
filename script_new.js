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
    currentIntention: null
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

    return {
        id: row.getAttribute('data-player-id') || String(index + 1),
        number: cells[1] ? cells[1].textContent.trim() : String(index + 1),
        name: cells[3] ? cells[3].textContent.trim() : 'Jugador ' + (index + 1),
        position: cells[4] ? cells[4].textContent.trim() : 'P',
        mlbId: row.getAttribute('data-mlb-id') || null,
        avg: avgText,
        obp: obpText
    };
}

function createRunnerToken(player, base) {
    console.log('[TOKEN] Creando token para ' + player.name + ' en ' + base);

    const token = document.createElement('div');
    token.className = 'runner-token team-' + player.team;
    token.dataset.playerId = player.id;
    token.dataset.currentBase = base;

    if (base === 'home') {
        token.classList.add('current-batter');
    }

    const visual = document.createElement('div');
    visual.className = 'runner-photo';

    const photoUrl = player.mlbId ?
        'https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/' + player.mlbId + '/headshot/67/current' :
        null;

    if (photoUrl) {
        visual.style.backgroundImage = 'url(' + photoUrl + ')';
        visual.style.backgroundSize = 'cover';
        visual.style.backgroundPosition = 'center';

        const testImg = new Image();
        testImg.onerror = function() {
            visual.style.backgroundImage = 'none';
            visual.innerHTML = '<span class="player-name">' + player.name + '</span>';
        };
        testImg.src = photoUrl;
    } else {
        visual.innerHTML = '<span class="player-name">' + player.name + '</span>';
    }

    token.appendChild(visual);

    const label = document.createElement('div');
    label.className = 'runner-label';
    label.textContent = '#' + player.number;
    token.appendChild(label);

    const pos = basePositions[base];
    token.style.left = pos.x;
    token.style.top = pos.y;

    const container = document.getElementById('runners-container');
    if (container) {
        container.appendChild(token);
        console.log('[TOKEN] Token anadido al DOM');
    }

    return token;
}

function clearTokensAtBase(base) {
    const container = document.getElementById('runners-container');
    if (!container) return;

    const tokens = container.querySelectorAll('[data-current-base="' + base + '"]');
    tokens.forEach(function(t) { t.remove(); });
}

function startNewGame() {
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

    const container = document.getElementById('runners-container');
    if (container) container.innerHTML = '';

    hideAllIntentionSelectors();

    updateGameDisplay();
    toggleGameControls();
    initializeFirstBatter();

    console.log('[GAME] Juego iniciado correctamente');
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
    showIntentionSelector();
}

function confirmAndNextBatter() {
    console.log('[GAME] Confirmando jugada y avanzando');
    gameState.outs++;

    if (gameState.outs >= 3) {
        changeInning();
    } else {
        nextBatter();
    }
}

function changeInning() {
    console.log('[INNING] Cambiando de inning');

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
            console.log('[HIGHLIGHT] Resaltado jugador ' + (index + 1) + ' de ' + team);
        }
    }
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
    const container = document.getElementById('intention-container-' + team);

    console.log('[SELECTOR] Intentando mostrar selector para equipo: ' + team);
    console.log('[SELECTOR] Contenedor encontrado: ' + (container ? 'SI' : 'NO'));

    if (container) {
        container.style.display = 'block';
        container.style.opacity = '1';
        console.log('[SELECTOR] Selector mostrado para ' + team);

        updateIntentionButtons();
    } else {
        console.log('[ERROR] No se encontro el contenedor intention-container-' + team);
    }
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

    if (diceContainer) {
        diceContainer.style.display = 'block';
    }

    console.log('[INTENTION] Mostrando dados para: ' + intention);
}

function rollPitcherDice(team) {
    const diceTypeSelect = document.getElementById('pitcher-dice-type');
    const diceValueInput = document.getElementById('pitcher-dice-value');

    if (!diceTypeSelect || !diceValueInput) return;

    const diceType = parseInt(diceTypeSelect.value);
    let result;

    if (diceType > 0) {
        result = Math.floor(Math.random() * diceType) + 1;
    } else {
        const absDice = Math.abs(diceType);
        result = -(Math.floor(Math.random() * absDice) + 1);
    }

    diceValueInput.value = result;
    console.log('[DICE] Lanzador tiro D' + diceType + ': ' + result);

    checkDiceComplete(team);
}

function rollBatterDice(team) {
    const diceValueInput = document.getElementById('batter-dice-value');

    if (!diceValueInput) return;

    const result = Math.floor(Math.random() * 100) + 1;
    diceValueInput.value = result;

    console.log('[DICE] Bateador tiro D100: ' + result);

    checkDiceComplete(team);
}

function checkDiceComplete(team) {
    const pitcherValue = document.getElementById('pitcher-dice-value');
    const batterValue = document.getElementById('batter-dice-value');
    const finalResult = document.getElementById('final-result');
    const resultDescription = document.getElementById('result-description');
    const confirmSection = document.getElementById('result-confirmation');

    if (!pitcherValue || !batterValue || !finalResult) return;

    if (pitcherValue.value !== '' && batterValue.value !== '') {
        const pitcher = parseInt(pitcherValue.value);
        const batter = parseInt(batterValue.value);
        const mss = pitcher + batter;

        const player = getCurrentBatter();
        const bt = calculateBT(player.avg);
        const obt = calculateOBT(player.obp);

        finalResult.textContent = mss;

        const outcome = getSwingResultOutcome(mss, bt, obt);
        resultDescription.textContent = 'MSS: ' + mss + ' (BT:' + bt + ', OBT:' + obt + ') - ' + outcome;

        if (confirmSection) {
            confirmSection.style.display = 'block';
        }

        console.log('[DICE] MSS: ' + mss + ', BT: ' + bt + ', OBT: ' + obt + ' - ' + outcome);
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
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        console.log('[TABLE] Fila resaltada para MSS: ' + mss + ' (BT:' + bt + ', OBT:' + obt + ')');
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

    if (mss === 1 || mss === 99) {
        showOdditiesTable();
        return;
    }

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
            targetRow.classList.add('table-warning', 'fw-bold');
            targetRow.style.backgroundColor = '#fbbf24';
            targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log('[ODDITIES] Resultado: ' + total);
        }
    }
}

function closeOdditiesTable() {
    console.log('[ODDITIES] Cerrando Oddities Table');

    const odditiesContainer = document.getElementById('oddities-table-container');
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