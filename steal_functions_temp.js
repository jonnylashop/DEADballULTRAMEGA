/**
 * Maneja la tirada del dado para el intento de robo
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

    if (!diceValue || diceValue < 1 || diceValue > 100) {
        alert('⚠️ Por favor ingresa un valor de dado válido (1-100)');
        return;
    }

    console.log(`🎲 Valor del dado: ${diceValue}`);

    // Por ahora, sistema básico: 1-50 = OUT, 51-100 = SAFE
    const isSuccessful = diceValue > 50;
    const stealInfo = gameState.currentStealAttempt;

    // Mostrar resultado
    resultArea.style.display = 'block';

    if (isSuccessful) {
        resultText.innerHTML = `
            <div class="alert alert-success">
                <strong>✅ ROBO EXITOSO!</strong><br>
                El corredor logra llegar a ${stealInfo.toBase === 'home' ? 'Home' : stealInfo.toBase + ' base'} sin problemas.
                <br><small>Dado: ${diceValue} (51-100 = Exitoso)</small>
            </div>
        `;

        console.log('✅ Robo exitoso - actualizar bases');

    } else {
        resultText.innerHTML = `
            <div class="alert alert-danger">
                <strong>❌ ROBO FALLIDO!</strong><br>
                El corredor es eliminado intentando robar.
                <br><small>Dado: ${diceValue} (1-50 = Fallido)</small>
            </div>
        `;

        console.log('❌ Robo fallido - eliminar corredor y agregar out');
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
 * Finaliza el intento de robo y actualiza el estado del juego
 */
function finishStealAttempt(wasSuccessful) {
    console.log(`🏁 Finalizando robo. Exitoso: ${wasSuccessful}`);

    const stealInfo = gameState.currentStealAttempt;

    if (wasSuccessful) {
        // ROBO EXITOSO: Mover corredor a nueva base
        console.log(`📍 Moviendo corredor de ${stealInfo.fromBase} a ${stealInfo.toBase}`);

        // Limpiar base original
        gameState.bases[stealInfo.fromBase] = null;

        // Colocar en nueva base (o anotar carrera si es home)
        if (stealInfo.toBase === 'home') {
            // TODO: Anotar carrera
            console.log('🏠 Carrera anotada por robo de home');
        } else {
            gameState.bases[stealInfo.toBase] = stealInfo.runner;
        }

    } else {
        // ROBO FALLIDO: Eliminar corredor y agregar out
        console.log(`❌ Eliminando corredor de ${stealInfo.fromBase}`);

        // Limpiar base
        gameState.bases[stealInfo.fromBase] = null;

        // Agregar out
        gameState.outs++;
        console.log(`📊 Out agregado. Total: ${gameState.outs}`);
    }

    // Limpiar información del robo
    gameState.currentStealAttempt = null;

    // Volver al selector de intenciones para el siguiente bateador
    showIntentionSelector();
}