// ============================================
// SISTEMA DE GENERACIÓN DE SCORESHEET PDF
// ============================================
// Genera PDFs estilo formulario DEADBALL oficial

console.log('📄 Scoresheet PDF System cargado');

/**
 * Genera un PDF con la scoresheet del partido
 * @param {Object} gameData - Datos del partido
 * @param {string} type - Tipo: 'final', 'partial', 'history'
 */
async function generarScoresheetPDF(gameData, type = 'final') {
    try {
        // Acceder a jsPDF desde window
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter'
        });

        const fecha = gameData.game_date ? new Date(gameData.game_date).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES');
        const hora = gameData.game_date ? new Date(gameData.game_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';

        // ====================================
        // ENCABEZADO PRINCIPAL
        // ====================================
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('DEADBALL', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${fecha} ${hora}`, 20, 30);
        doc.text(`Estado: ${gameData.completed ? 'FINALIZADO' : 'EN CURSO'}`, 150, 30);

        // ====================================
        // MARCADOR PRINCIPAL
        // ====================================
        const startY = 40;

        // Rectángulo del marcador
        doc.setFillColor(240, 240, 240);
        doc.rect(20, startY, 170, 15, 'F');

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('AWAY:', 25, startY + 6);
        doc.text(gameData.awayTeam || gameData.away_team || 'Visitante', 45, startY + 6);

        // Marcador visitante
        doc.setFontSize(18);
        const awayScore = gameData.awayScore || gameData.away_score || 0;
        doc.text(String(awayScore), 160, startY + 6);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('HOME:', 25, startY + 12);
        doc.text(gameData.homeTeam || gameData.home_team || 'Local', 45, startY + 12);

        // Marcador local
        doc.setFontSize(18);
        const homeScore = gameData.homeScore || gameData.home_score || 0;
        doc.text(String(homeScore), 160, startY + 12);

        // ====================================
        // TABLA DE INNINGS
        // ====================================
        let tableY = startY + 20;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');

        // Headers
        const colWidth = 15;
        const startX = 20;

        doc.text('TEAM', startX + 2, tableY + 5);
        for (let i = 1; i <= 9; i++) {
            doc.text(String(i), startX + 25 + (i - 1) * colWidth, tableY + 5);
        }
        doc.text('R', startX + 25 + 9 * colWidth, tableY + 5);
        doc.text('H', startX + 35 + 9 * colWidth, tableY + 5);
        doc.text('E', startX + 45 + 9 * colWidth, tableY + 5);

        // Líneas horizontales
        doc.line(startX, tableY + 7, startX + 165, tableY + 7);

        // Fila Visitante
        tableY += 12;
        doc.setFont('helvetica', 'normal');
        doc.text(gameData.awayTeam || gameData.away_team || 'AWAY', startX + 2, tableY);

        const awayInningScores = gameData.gameState ?.score ?.visitante || [0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < 9; i++) {
            doc.text(String(awayInningScores[i] || 0), startX + 25 + i * colWidth, tableY);
        }

        const awayTotalRuns = awayInningScores.reduce((a, b) => a + b, 0);
        const awayHits = gameData.gameState ?.hits ?.visitante || 0;
        const awayErrors = gameData.gameState ?.errors ?.visitante || 0;

        doc.text(String(awayTotalRuns), startX + 25 + 9 * colWidth, tableY);
        doc.text(String(awayHits), startX + 35 + 9 * colWidth, tableY);
        doc.text(String(awayErrors), startX + 45 + 9 * colWidth, tableY);

        // Línea
        doc.line(startX, tableY + 2, startX + 165, tableY + 2);

        // Fila Local
        tableY += 7;
        doc.text(gameData.homeTeam || gameData.home_team || 'HOME', startX + 2, tableY);

        const homeInningScores = gameData.gameState ?.score ?.local || [0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < 9; i++) {
            doc.text(String(homeInningScores[i] || 0), startX + 25 + i * colWidth, tableY);
        }

        const homeTotalRuns = homeInningScores.reduce((a, b) => a + b, 0);
        const homeHits = gameData.gameState ?.hits ?.local || 0;
        const homeErrors = gameData.gameState ?.errors ?.local || 0;

        doc.text(String(homeTotalRuns), startX + 25 + 9 * colWidth, tableY);
        doc.text(String(homeHits), startX + 35 + 9 * colWidth, tableY);
        doc.text(String(homeErrors), startX + 45 + 9 * colWidth, tableY);

        // Línea final
        doc.line(startX, tableY + 2, startX + 165, tableY + 2);

        // ====================================
        // INFORMACIÓN DEL JUEGO
        // ====================================
        tableY += 12;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('INFORMACIÓN DEL PARTIDO', startX, tableY);

        tableY += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const inning = gameData.inning || 1;
        const outs = gameData.outs || 0;
        const estado = gameData.completed ? 'Finalizado' : `En curso - Inning ${inning}, ${outs} outs`;

        doc.text(`Estado: ${estado}`, startX, tableY);
        tableY += 6;

        if (gameData.winner) {
            doc.setFont('helvetica', 'bold');
            const ganador = gameData.winner === 'home' ? (gameData.homeTeam || 'Local') : (gameData.awayTeam || 'Visitante');
            doc.text(`🏆 GANADOR: ${ganador}`, startX, tableY);
            tableY += 6;
            doc.setFont('helvetica', 'normal');
        }

        // ====================================
        // ESTADÍSTICAS DE PITCHERS
        // ====================================
        if (gameData.gameState ?.pitcher) {
            tableY += 5;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('PITCHERS', startX, tableY);

            tableY += 7;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);

            // Pitcher Visitante
            const awayPitcher = gameData.gameState.pitcher.visitante;
            if (awayPitcher) {
                doc.text(`Away Pitcher:`, startX, tableY);
                doc.text(`Dado: ${awayPitcher.currentPitchDie || awayPitcher.basePitchDie}`, startX + 35, tableY);
                doc.text(`Mano: ${awayPitcher.handedness}`, startX + 60, tableY);
                doc.text(`Innings: ${awayPitcher.inningsPitched || 0}`, startX + 80, tableY);
                doc.text(`CL: ${awayPitcher.totalRunsAllowed || 0}`, startX + 110, tableY);
                tableY += 5;
            }

            // Pitcher Local
            const homePitcher = gameData.gameState.pitcher.local;
            if (homePitcher) {
                doc.text(`Home Pitcher:`, startX, tableY);
                doc.text(`Dado: ${homePitcher.currentPitchDie || homePitcher.basePitchDie}`, startX + 35, tableY);
                doc.text(`Mano: ${homePitcher.handedness}`, startX + 60, tableY);
                doc.text(`Innings: ${homePitcher.inningsPitched || 0}`, startX + 80, tableY);
                doc.text(`CL: ${homePitcher.totalRunsAllowed || 0}`, startX + 110, tableY);
                tableY += 5;
            }
        }

        // ====================================
        // ANOTACIONES ADICIONALES
        // ====================================
        tableY += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('NOTAS DEL PARTIDO', startX, tableY);

        tableY += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        // Cuadro para notas
        doc.rect(startX, tableY, 170, 40);

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Espacio para anotaciones manuales...', startX + 5, tableY + 5);

        // ====================================
        // PIE DE PÁGINA
        // ====================================
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text('Generado por DEADBALL ULTRAMEGA', 105, 270, { align: 'center' });
        doc.text(`${new Date().toLocaleString('es-ES')}`, 105, 275, { align: 'center' });

        // ====================================
        // GUARDAR PDF
        // ====================================
        const nombreArchivo = `DEADBALL_${gameData.awayTeam || 'Away'}_vs_${gameData.homeTeam || 'Home'}_${fecha.replace(/\//g, '-')}.pdf`;
        doc.save(nombreArchivo);

        console.log('✅ PDF generado:', nombreArchivo);
        return true;

    } catch (error) {
        console.error('❌ Error al generar PDF:', error);
        alert('Error al generar el PDF. Revisa la consola.');
        return false;
    }
}

/**
 * Genera PDF del partido actual en curso
 */
function descargarScoresheetActual() {
    if (!window.gameStateData || !window.gameStateData.isGameActive) {
        alert('⚠️ No hay ninguna partida en curso');
        return;
    }

    const gameData = {
        awayTeam: window.awayTeam || 'Visitante',
        homeTeam: window.homeTeam || 'Local',
        away_score: window.awayScore || 0,
        home_score: window.homeScore || 0,
        inning: window.inning || 1,
        outs: window.outs || 0,
        completed: false,
        game_date: new Date().toISOString(),
        gameState: window.gameStateData
    };

    generarScoresheetPDF(gameData, 'partial');
}

/**
 * Genera PDF de una partida guardada
 */
async function descargarScoresheetGuardada(gameId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Debes iniciar sesión');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/games/${gameId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`❌ Error: ${data.error}`);
            return;
        }

        const game = data.game;

        // Adaptar formato
        const gameData = {
            awayTeam: game.away_team,
            homeTeam: game.home_team,
            away_score: game.away_score,
            home_score: game.home_score,
            inning: game.inning,
            outs: game.outs,
            completed: game.completed === 1,
            winner: game.winner,
            game_date: game.game_date,
            gameState: game.game_state || {}
        };

        await generarScoresheetPDF(gameData, game.completed === 1 ? 'final' : 'partial');

    } catch (error) {
        console.error('Error al descargar scoresheet:', error);
        alert('❌ Error al generar el PDF');
    }
}

// Exponer funciones globalmente
window.generarScoresheetPDF = generarScoresheetPDF;
window.descargarScoresheetActual = descargarScoresheetActual;
window.descargarScoresheetGuardada = descargarScoresheetGuardada;
