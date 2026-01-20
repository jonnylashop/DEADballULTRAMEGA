/*
 * ===============================================
 * SISTEMA COMPLETO DE CASCADA PARA DEADBALL
 * ===============================================
 * 
 * Este archivo contiene la implementación completa del sistema de cascada
 * con todas las sub-tablas interconectadas y movimiento de tokens.
 * 
 * INSTRUCCIONES:
 * 1. Buscar cada función en script.js
 * 2. Reemplazar con la versión de este archivo
 * 3. Agregar las funciones nuevas donde se indica
 * 
 * ===============================================
 */

// ===============================================
// 1. MODIFICAR confirmSecondaryResult()
// ===============================================
// Ubicación: buscar "function confirmSecondaryResult()"
// Reemplazar con:

function confirmSecondaryResult() {
    console.log(`🔍 Intentando confirmar resultado...`);
    console.log(`📋 Estado cascada:`, cascadeState);

    if (!cascadeState.finalResult) {
        console.warn('❌ No hay finalResult definido');
        alert('⚠️ Por favor ingresa un valor de dado válido y espera a que se resalte una fila');
        return;
    }

    console.log(`✅ Resultado secundario confirmado: ${cascadeState.finalResult}`);

    // DETECTAR SI EL RESULTADO TIENE DEF (Defense Position)
    const resultText = cascadeState.finalResult.toLowerCase();
    const defMatch = cascadeState.finalResult.match(/\((1B|2B|3B|SS|LF|CF|RF)\)/);

    if (defMatch && cascadeState.currentTable === 'Hit Table') {
        const defPosition = defMatch[1];
        console.log(`🛡️ Detectado DEF: ${defPosition} - Mostrando Defense Table`);
        cascadeState.defensePosition = defPosition;
        showDefenseTable(defPosition);
        return; // No procesar aún, esperar resultado de Defense Table
    }

    // Si viene de Defense Table, combinar con resultado de Hit
    if (cascadeState.currentTable === 'Defense Table' && cascadeState.hitResult) {
        const finalResult = applyDefenseResult(cascadeState.hitResult, cascadeState.finalResult);
        processFinalResult(finalResult);
    } else {
        // Procesar el resultado final directamente
        processFinalResult(cascadeState.finalResult);
    }

    // Limpiar cascada (después de procesar)
    setTimeout(() => {
        closeCascade();
    }, 500);
}

// ===============================================
// 2. AGREGAR FUNCIONES DE DEFENSE TABLE
// ===============================================
// Ubicación: Después de confirmSecondaryResult()
// Agregar estas funciones:

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

// ===============================================
// 3. REEMPLAZAR processFinalResult()
// ===============================================
// Ubicación: buscar "function processFinalResult(result)"
// Reemplazar toda la función con:

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
        AudioSystem.play('hit');
    } else if (resultLower.includes('home run')) {
        hitType = 'homerun';
        runnerAdvancement = 4;
    } else if (resultLower.includes('walk') || resultLower.includes('hit by pitch') || resultLower.includes('interference')) {
        hitType = 'walk';
        runnerAdvancement = 1;
        isWalk = true;
        AudioSystem.play('walk');
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
        advanceRunners(runnerAdvancement, true);

        // Actualizar display
        updateGameDisplay();
        updateBasesDisplay();

        console.log('⏸️ Esperando confirmación del usuario para avanzar...');
    }

    // Mostrar animación en el campo
    animateFieldResult(hitType, runnerAdvancement, isOut);
}

// ===============================================
// 4. AGREGAR advanceRunnersOnOut()
// ===============================================
// Ubicación: Antes de la función advanceRunners()
// Agregar esta función:

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

// ===============================================
// RESUMEN DE IMPLEMENTACIÓN
// ===============================================
/*
 * SISTEMA COMPLETO:
 * 
 * 1. Swing Result Table (ya existe)
 *    ↓
 * 2. Hit Table (si Ordinary/Critical Hit)
 *    ↓ (si tiene DEF)
 * 3. Defense Table (d12)
 *    ↓
 * 4. Resultado Final → Mover Tokens
 * 
 * FLUJO:
 * - Usuario tira dados → Swing Result
 * - Si es Hit → Mostrar Hit Table (d20)
 * - Si Hit tiene (1B), (2B), etc. → Defense Table (d12)
 * - Defense Table modifica resultado
 * - processFinalResult() mueve los tokens
 * 
 * TOKENS:
 * - advanceRunners() para hits/walks
 * - advanceRunnersOnOut() para outs productivos
 * - animateRunnerMoving() para animaciones
 * - animateRunnerScoring() para carreras
 * 
 * ESTADÍSTICAS:
 * - Hits, errors, outs se registran automáticamente
 * - RBIs se calculan en advanceRunners()
 */