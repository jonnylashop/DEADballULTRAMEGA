//     

/* 
   bjeto que contiene todo el estado actual del partido de béisbol
  ste objeto centraliza toda la información del juego para mantener sincronizados
  todos los elementos visuales (marcador, alineaciones, etc.)
*/
const gametate  {
    //   
    currentnning , // nning actual del juego (-, puede extenderse en extras)
    isopalf true, // true  arriba del inning (visitante batea)
    // false  abajo del inning (local batea)

    //   
    visitanteatterndex , // Índice (-) del bateador actual del equipo visitante
    localatterndex , // Índice (-) del bateador actual del equipo local

    //       
    outs , // úmero de outs en el inning actual (-)
    strikes , // trikes del bateador actual (-)
    balls , // olas del bateador actual (-)

    //    
    bases {
        first null, // ugador en primera base (null si está vacía)
        second null, // ugador en segunda base (null si está vacía)  
        third null // ugador en tercera base (null si está vacía)
    },

    //   
    score {
        visitante , , , , , , , , ], // rray con las carreras por inning del visitante
        local , , , , , , , , ], // rray con las carreras por inning del local
        totalisitante , // otal de carreras del visitante
        totalocal  // otal de carreras del local
    },

    // Í  
    hits {
        visitante , // otal de hits del equipo visitante
        local  // otal de hits del equipo local
    },

    errors {
        visitante , // otal de errores del equipo visitante  
        local  // otal de errores del equipo local
    },

    //   
    isamective false, // true cuando el juego está en progreso

    //     
    currentntention null, // 'normal', 'steal', 'bunt', 'hitrun' o null
    gameomplete false, // true cuando el juego ha terminado (+ innings)
    winner null, // 'visitante', 'local' o null si está empatado/en progreso

    //     
    currenticeoll null, // lmacena el resultado total de la tirada actual ( + vent)

    //   Á  -   
    // batteristory ] // rray que contendrá el registro de cada bateador
    // {
    //     batter {name, position, stats...},
    //     diceoll number,
    //     result string,
    //     inning number,
    //     isopalf boolean,
    //     timestamp ate,
    //     outcome string (hit, out, walk, etc.)
    // }
}

//    Ó   

/*
  Ó geturrentattingeam()
  Ó btiene qué equipo está bateando actualmente
   tring ('visitante' o 'local')
  Ó etermina el equipo según isopalf del gametate
*/
function geturrentattingeam() {
    return gametate.isopalf  'visitante'  'local'
}

/*
  Ó geturrentatterndex()
  Ó btiene el índice del bateador actual del equipo que está bateando
   umber (-, índice en el array de jugadores)
  Ó onsulta el índice apropiado según qué equipo esté bateando
*/
function geturrentatterndex() {
    return gametate.isopalf  gametate.visitanteatterndex  gametate.localatterndex
}

/*
  Ó geturrentatter()
  Ó btiene el objeto del jugador que está bateando actualmente
   bject con datos del jugador o null si no hay equipos configurados
  Ó ombina geturrentattingeam() y geturrentatterndex() para obtener el jugador
*/
function geturrentatter() {
    const battingeam  geturrentattingeam()
    const batterndex  geturrentatterndex()

    // btener la tabla del equipo que está bateando
    const teamable  document.getlementyd(`roster-${battingeam}`)
    if (!teamable) return null

    // btener todas las filas de jugadores (tbody  tr)
    const playerows  teamable.queryelectorll('tbody tr')

    // olo considerar los primeros  jugadores (lineup de bateo)
    if (batterndex  ath.min(playerows.length, )) return null

    // xtraer datos del jugador desde la fila de la tabla
    const playerow  playerowsbatterndex]
    const cells  playerow.queryelectorll('td')

    if (cells.length  ) return null

    // rear objeto jugador con los datos de la tabla
    return {
        name cells].textontent.trim(), // olumna 'ombre'
        position cells].textontent.trim(), // olumna 'osición'
        battingvg parseloat(cells].textontent.trim()) || , // olumna ''
        onasect parseloat(cells].textontent.trim()) || , // olumna ''
        traits cells].textontent.trim() // olumna 'raits'
    }
}

/*
  Ó nextatter()
  Ó vanza al siguiente bateador en el orden de bateo
  Ó ncrementa el índice del bateador y maneja el cambio de inning
*/
function nextatter() {
    const battingeam  geturrentattingeam()

    if (battingeam  'visitante') {
        gametate.visitanteatterndex  (gametate.visitanteatterndex + ) % 
    } else {
        gametate.localatterndex  (gametate.localatterndex + ) % 
    }

    console.log(`🏃 iguiente bateador ${geturrentatter().name || 'esconocido'}`)
    console.log(`📊 Índice de bateador ${geturrentatterndex() + }/`)

    //   Ó - uede interferir con dados visibles
    // updateameisplay() //  - antener dados visibles

    //   Ó - uede interferir con dados visibles  
    // if (gametate.isamective) {
    //     updateiceystemosition()
    // }

    console.log(`✅ ateador avanzado sin resetear dados`)
}

//    Ó    

/*
  Ó updateameisplay()
  Ó ctualiza todos los elementos visuales para reflejar el estado actual del juego
  Á inguno (usa el gametate global)
  Ó unción principal que sincroniza la . 
               ebe llamarse cada vez que cambie el estado del juego
*/
function updateameisplay() {
    updatecoreboard() // ctualiza el marcador con carreras por inning
    highlighturrentnning() // esalta el inning actual en el marcador
    highlighturrentatter() // esalta al bateador actual en las alineaciones
    updateamenfo() // ctualiza información del juego (outs, strikes/balls)
    updateasesisplay() // ctualiza visualización de corredores en bases
    
    //  ctualizar validación de opciones de intención cuando hay cambios en el estado
    if (gametate.isamective) {
        const intentionontainer  document.getlementyd('intention-container-visitante')
        const isntentionelectorisible  intentionontainer && 
            intentionontainer.style.display ! 'none' &&
            intentionontainer.style.visibility ! 'hidden'
        
        if (isntentionelectorisible) {
            updatententionelector()
        }
    }
}

/*
  Ó updatecoreboard()
  Ó ctualiza el marcador visual con las carreras por inning
  Ó incroniza la tabla del marcador con el gametate.score
*/
function updatecoreboard() {
    // ctualizar carreras por inning para visitante
    const visitanteow  document.queryelector('tbody trfirst-child')
    if (visitanteow) {
        const inningells  visitanteow.queryelectorll('.inning-score')
        gametate.score.visitante.forach((runs, index)  {
            if (inningellsindex]) {
                inningellsindex].textontent  runs
            }
        })

        // ctualizar totales
        const totalunsell  visitanteow.queryelector('.total-runs')
        const totalitsell  visitanteow.queryelector('.total-hits')
        const totalrrorsell  visitanteow.queryelector('.total-errors')

        if (totalunsell) totalunsell.textontent  gametate.score.totalisitante
        if (totalitsell) totalitsell.textontent  gametate.hits.visitante
        if (totalrrorsell) totalrrorsell.textontent  gametate.errors.visitante
    }

    // ctualizar carreras por inning para local
    const localow  document.queryelector('tbody trlast-child')
    if (localow) {
        const inningells  localow.queryelectorll('.inning-score')
        gametate.score.local.forach((runs, index)  {
            if (inningellsindex]) {
                inningellsindex].textontent  runs
            }
        })

        // ctualizar totales
        const totalunsell  localow.queryelector('.total-runs')
        const totalitsell  localow.queryelector('.total-hits')
        const totalrrorsell  localow.queryelector('.total-errors')

        if (totalunsell) totalunsell.textontent  gametate.score.totalocal
        if (totalitsell) totalitsell.textontent  gametate.hits.local
        if (totalrrorsell) totalrrorsell.textontent  gametate.errors.local
    }
}

/*
  Ó highlighturrentnning()
  Ó esalta visualmente el inning actual en el marcador
  Ó plica clases  para destacar el inning y equipo que batea
*/
function highlighturrentnning() {
    // emover highlighting previo
    document.queryelectorll('.current-inning, .batting-team').forach(cell  {
        cell.classist.remove('current-inning', 'batting-team')
    })

    // btener columnas del inning actual (índice +  porque la primera columna es "quipo")
    const inningolumnndex  gametate.currentnning
    const inningells  document.queryelectorll(`thnth-child(${inningolumnndex + }), tdnth-child(${inningolumnndex + })`)

    // plicar highlighting al inning actual
    inningells.forach(cell  {
        cell.classist.add('current-inning')
    })

    // estacar el equipo que está bateando
    const battingeamow  gametate.isopalf 
        document.queryelector('tbody trfirst-child') 
        document.queryelector('tbody trlast-child')

    if (battingeamow) {
        const teamnningell  battingeamow.queryelector(`tdnth-child(${inningolumnndex + })`)
        if (teamnningell) {
            teamnningell.classist.add('batting-team')
        }
    }
}

/*
  Ó highlighturrentatter()
  Ó esalta visualmente al bateador actual en las alineaciones
  Ó plica clase  para destacar la fila del jugador que está al bate
*/
function highlighturrentatter() {
    // emover highlighting previo
    document.queryelectorll('.current-batter').forach(row  {
        row.classist.remove('current-batter')
    })

    const battingeam  geturrentattingeam()
    const batterndex  geturrentatterndex()

    // btener la tabla del equipo que batea (usar los s correctos)
    const teamable  document.getlementyd(`roster-${battingeam}`)
    if (!teamable) {
        console.error(`o se encontró la tabla roster-${battingeam}`)
        return
    }

    // btener la fila del bateador actual (solo lineup de bateo - primeros )
    const playerows  teamable.queryelectorll('tbody tr')
    const maxineupize  ath.min(playerows.length, )

    if (batterndex  maxineupize) {
        playerowsbatterndex].classist.add('current-batter')
        console.log(`esaltando bateador ${batterndex + }/ del equipo ${battingeam} ${geturrentatter().name || 'esconocido'}`)
    } else {
        console.error(`Índice de bateador fuera del lineup ${batterndex}  ${maxineupize}`)
    }
}

/*
  Ó updateamenfo()
  Ó ctualiza información del estado actual (outs, strikes, balls)
  Ó usca elementos en el  para mostrar el count actual
*/
function updateamenfo() {
    // uscar o crear área de información del juego
    let gamenfolement  document.getlementyd('game-info')

    if (!gamenfolement) {
        // i no existe, crear el elemento de información
        gamenfolement  document.createlement('div')
        gamenfolement.id  'game-info'
        gamenfolement.classame  'game-info-compact'

        // nsertarlo en la columna central, después de la imagen del terreno pero antes de los controles
        const centralolumn  document.queryelector('.col-central')
        const terrenomg  document.queryelector('.terreno-img')
        const gameontrols  document.queryelector('.game-controls')

        if (centralolumn && terrenomg && gameontrols) {
            centralolumn.insertefore(gamenfolement, gameontrols)
        }
    }

    // btener información del bateador actual
    const currentatter  geturrentatter()
    const batterame  currentatter  currentatter.name  'o configurado'
    const battingeam  geturrentattingeam()

    // ctualizar contenido del elemento con formato compacto de una línea
    gamenfolement.inner  `
        div class"game-status-compact"
            nning ${gametate.currentnning}${gametate.isopalf  '↑'  '↓'} | 
            l bate ${batterame} (${battingeam}) | 
            uts ${gametate.outs}
        /div
    `
}

/*
  Ó updateasesisplay()
  Ó ctualiza la visualización de los corredores en las bases
  Ó uestra qué jugadores están en cada base (para futuras implementaciones)
*/
function updateasesisplay() {
    // sta función se puede expandir más adelante para mostrar 
    // gráficamente los corredores en las bases
    console.log('ases actuales', gametate.bases)
}

//         

/*
  Ó startewame()
  Ó nicializa un nuevo juego con valores por defecto
  Ó esetea todo el estado del juego y actualiza la visualización
*/
function startewame() {
    console.log('🎮 niciando nuevo juego...')

    try {
        //   - olo elementos específicos de dados,  todo el 
        console.log('🧹 eseteo selectivo de elementos de dados...')

        // .   cascada y confirmaciones (no dados históricos)
        console.log('⏳ lamando resetascadeystemomplete()...')
        resetascadeystemomplete()
        console.log('✅ resetascadeystemomplete() completado')

        // .  solo elementos específicos de dados recientes
        const knowniceds  
            'dice-results-display',
            'dice-results-display-local'
        ]

        knowniceds.forach(id  {
            const element  document.getlementyd(id)
            if (element) {
                element.style.display  'none'
                console.log(`✅ lemento de dados específico ocultado ${id}`)
            }
        })

        // .  campos de dados del lanzador y bateador
        const dicenputds  
            'pitcher-dice-value',
            'batter-dice-value',
            'pitcher-dice-value-local',
            'batter-dice-value-local'
        ]

        dicenputds.forach(id  {
            const input  document.getlementyd(id)
            if (input) {
                input.value  ''
                console.log(`✅ ampo de dados reseteado ${id}`)
            }
        })

        // .  selectores de tipo de dados
        const diceypeds  
            'pitcher-dice-type',
            'pitcher-dice-type-local'
        ]

        diceypeds.forach(id  {
            const select  document.getlementyd(id)
            if (select) {
                select.selectedndex   // olver al primer valor
                console.log(`✅ elector de dados reseteado ${id}`)
            }
        })

        // .  descripciones de resultados de dados
        const resultescriptionds  
            'dice-result-description',
            'dice-result-description-local'
        ]

        resultescriptionds.forach(id  {
            const description  document.getlementyd(id)
            if (description) {
                description.textontent  'sperando tirada...'
                console.log(`✅ escripción de resultado reseteada ${id}`)
            }
        })

        // esetear el estado del juego a valores iniciales
        console.log('⏳ eseteando gametate...')
        gametate.currentnning  
        gametate.isopalf  true // iempre empieza bateando el visitante
        gametate.visitanteatterndex   // rimer bateador del visitante
        gametate.localatterndex   // rimer bateador del local (para cuando les toque)

        // esetear count
        gametate.outs  
        gametate.strikes  
        gametate.balls  

        // impiar bases
        gametate.bases  { first null, second null, third null }

        // esetear marcador
        gametate.score  {
            visitante , , , , , , , , ],
            local , , , , , , , , ],
            totalisitante ,
            totalocal 
        }

        // esetear estadísticas
        gametate.hits  { visitante , local  }
        gametate.errors  { visitante , local  }

        //    
        gametate.currenticeoll  null
        gametate.lastolletails  null

        // ctivar el juego
        console.log('⏳ ctivando el juego...')
        gametate.isamective  true
        gametate.gameomplete  false
        gametate.winner  null
        console.log('✅ gametate.isamective  ' + gametate.isamective)

        // ctualizar visualización
        console.log('⏳ lamando updateameisplay()...')
        updateameisplay()
        console.log('✅ updateameisplay() completado')

        // nicializar sistema de tokens visuales en el diamante
        console.log('⏳ nicializando sistema de tokens del diamante...')
        updateiamondisplay()
        console.log('✅ istema de tokens del diamante inicializado')

        // estionar botones
        console.log('⏳ lamando toggleameontrols()...')
        toggleameontrols()
        console.log('✅ toggleameontrols() completado')

        // ostrar el sistema de dados en la posición correcta
        console.log('⏳ lamando updateiceystemosition()...')
        updateiceystemosition()
        console.log('✅ updateiceystemosition() completado')

        console.log('🎮 ¡uevo juego iniciado correctamente!')

        // btener bateador actual
        console.log('⏳ bteniendo primer bateador...')
        const currentatter  geturrentatter()
        console.log(`🏃 rimer bateador ${currentatter.name || 'esconocido'}`)

        //  llamar a resetntentionelector aquí - el selector ya está visible por defecto
        console.log('🎯 elector de intenciones ya visible por defecto')

    } catch (error) {
        console.error('❌  en startewame()', error)
        console.error('rror stack', error.stack)
        alert('rror al iniciar el juego ' + error.message)
    }
}

/*
  Ó resetame()
  Ó einicia completamente el juego actual
  Ó uelve al estado inicial (juego inactivo) para que el usuario pueda hacer clic en "niciar uevo uego"
*/
function resetame() {
    if (!confirm('¿stás seguro de que quieres reiniciar el juego e perderán todos los datos del partido actual.')) {
        return
    }

    console.log('🔄 einiciando juego a estado inicial...')

    //   esetear estado del juego a valores iniciales ()
    gametate.isamective  false // ¡! olver a estado inactivo
    gametate.currentnning  
    gametate.isopalf  true
    gametate.visitanteatterndex  
    gametate.localatterndex  
    gametate.outs  
    gametate.currenticeoll  null
    gametate.lastolletails  null
    gametate.currentntention  null

    //   esetear marcador
    gametate.score  {
        visitanteuns , , , , , , , , ],
        localuns , , , , , , , , ],
        totalisitante ,
        totalocal 
    }

    //   impiar interfaz de dados
    resetascadeystemomplete()

    //   cultar todos los contenedores de dados y selector de intenciones
    const visitanteontainer  document.getlementyd('dice-container-visitante')
    const localontainer  document.getlementyd('dice-container-local')
    const intentionontainer  document.getlementyd('intention-container-visitante')

    if (visitanteontainer) visitanteontainer.style.display  'none'
    if (localontainer) localontainer.style.display  'none'
    if (intentionontainer) intentionontainer.style.display  'none'

    //   impiar campos de entrada
    const dicenputds  
        'pitcher-dice-value', 'batter-dice-value',
        'pitcher-dice-value-local', 'batter-dice-value-local'
    ]

    dicenputds.forach(id  {
        const input  document.getlementyd(id)
        if (input) input.value  ''
    })

    //   ctualizar display y mostrar botón "niciar uevo uego"
    updateameisplay()

    console.log('🔍 stado antes de toggleameontrols', {
        isamective gametate.isamective,
        starttnxists !!document.getlementyd('start-game-btn'),
        resettnxists !!document.getlementyd('reset-game-btn')
    })

    toggleameontrols() // sto mostrará el botón "niciar uevo uego" porque isamective  false

    // erificar que el botón esté visible después de toggleameontrols
    const starttn  document.getlementyd('start-game-btn')
    console.log('🔍 stado después de toggleameontrols', {
        starttnisplay starttn  starttn.style.display  'o encontrado',
        starttnisible starttn  window.getomputedtyle(starttn).display  'o encontrado'
    })

    //  visibilidad del botón niciar uego de manera agresiva
    if (starttn) {
        starttn.style.cssext  'display inline-block !important visibility visible !important opacity  !important'

        // ambién forzar el contenedor padre
        const startontainer  starttn.parentlement
        if (startontainer) {
            startontainer.style.cssext  `
                position absolute !important 
                top % !important 
                left % !important 
                transform translate(-%, -%) !important 
                z-index  !important 
                display flex !important 
                justify-content center !important 
                align-items center !important 
                width auto !important 
                height auto !important 
                margin  !important 
                padding  !important
            `
            console.log('🔨 ontenedor padre del botón  visible')
        }

        console.log('🔨 otón niciar uego  visible')
    } else {
        console.error('❌ Í o se encontró el botón start-game-btn')
    }

    console.log('🔄 uego reiniciado a estado inicial. resiona "niciar uevo uego" para empezar.')
}

/*
  Ó toggleameontrols()
  Ó lterna la visibilidad de los botones de control del juego
  Ó uestra/oculta botones según el estado del juego
*/
function toggleameontrols() {
    const starttn  document.getlementyd('start-game-btn')
    const resettn  document.getlementyd('reset-game-btn')
    const marcadoruttonontainer  document.queryelector('.marcador-button-container')
    const gameontrols  document.queryelector('.game-controls')
    const startontainer  document.queryelector('.start-game-container')

    console.log('🎮 toggleameontrols ejecutado', {
        isamective gametate.isamective,
        starttn !!starttn,
        resettn !!resettn,
        marcadorontainer !!marcadoruttonontainer,
        gameontrols !!gameontrols,
        startontainer !!startontainer
    })

    if (gametate.isamective) {
        // uego activo ocultar iniciar, mover reiniciar al marcador
        if (starttn) {
            starttn.style.display  'none'
            console.log('✅ otón niciar ocultado (juego activo)')
        }
        if (startontainer) {
            startontainer.classist.remove('game-inactive')
            console.log('✅ ontenedor de inicio clase game-inactive removida')
        }
        if (resettn && marcadoruttonontainer) {
            // over el botón al marcador si no está ya allí
            if (!marcadoruttonontainer.contains(resettn)) {
                marcadoruttonontainer.appendhild(resettn)
            }
            resettn.style.display  'inline-block'
            console.log('✅ otón einiciar movido al marcador y mostrado')
        }
    } else {
        // uego inactivo mostrar iniciar, mover reiniciar de vuelta a controles
        if (starttn) {
            starttn.style.display  'inline-block'
            console.log('✅ otón niciar mostrado (juego inactivo)')
        } else {
            console.error('❌ o se encontró el botón niciar')
        }
        if (startontainer) {
            startontainer.classist.add('game-inactive')
            console.log('✅ ontenedor de inicio clase game-inactive agregada')
        }
        if (resettn && gameontrols) {
            // over el botón de vuelta a los controles si no está ya allí
            if (!gameontrols.contains(resettn)) {
                gameontrols.appendhild(resettn)
            }
            resettn.style.display  'none'
            console.log('✅ otón einiciar ocultado (juego inactivo)')
        }

        // cultar sistema de dados cuando el juego está inactivo
        const visitanteontainer  document.getlementyd('dice-container-visitante')
        const localontainer  document.getlementyd('dice-container-local')
        if (visitanteontainer) visitanteontainer.style.display  'none'
        if (localontainer) localontainer.style.display  'none'
        console.log('✅ ontenedores de dados ocultados (juego inactivo)')
    }
}

//  Ó   

/*
  Ó initializeame()
  Ó onfiguración inicial cuando se carga la página
  Ó repara el estado inicial sin comenzar el juego
*/
function initializeame() {
    // onfigurar estado inicial (juego sin empezar)
    gametate.isamective  false

    // onfigurar controles iniciales
    updateameisplay()
    toggleameontrols()

    // l juego empieza inactivo hasta que el usuario presione "niciar uego"
    console.log('🏟️ istema de béisbol inicializado.')
    console.log('📋 ara comenzar ) onfigura los equipos, ) resiona "niciar uevo uego"')
}

//         
/*
  Ó ostrar corredores como tokens animados sobre la imagen del diamante
   
    - rear/eliminar tokens dinámicamente según gametate.bases
    - nimar movimientos entre bases con  transitions
    - incronizar estado visual con estado del juego
    - anejar anotación de carreras con animaciones especiales
  
  
    - baseositions oordenadas  de cada base en porcentajes
    - createunneroken() rear nuevo token para corredor
    - moveunner() nimar movimiento entre bases
    - updateiamondisplay() incronizar tokens con gametate.bases
    - scoreun() nimación especial para carreras anotadas
*/

// oordenadas de las bases en el diamante (porcentajes para responsive)
const baseositions  {
    home { x '%', y '%' },    // ome plate - ajustado por usuario
    first { x '%', y '%' },   // rimera base - ajustado por usuario
    second { x '%', y '%' },  // egunda base - ajustado por usuario
    third { x '%', y '%' }    // ercera base - ajustado por usuario
}

/**
 * rea un token visual para un corredor en el diamante
 * param {bject} player - bjeto jugador con propiedades name, id, team
 * param {string} base - ase donde colocar el token ('first', 'second', 'third', 'home')
 * returns {lement} - lemento  del token creado
 */
function createunneroken(player, base) {
    console.log(`🏃 reando token para ${player.name} en ${base}`)
    
    const token  document.createlement('div')
    token.classame  `runner-token team-${player.team} entering`
    token.dataset.playerd  player.id
    token.dataset.currentase  base
    
    // rear contenido del token (nombre abreviado o número)
    const namepan  document.createlement('span')
    namepan.classame  'runner-name'
    namepan.textontent  player.name.split(' ').map(n  n]).join('') || player.number || ''
    token.appendhild(namepan)
    
    // osicionar en la base especificada
    const position  baseositionsbase]
    token.style.left  position.x
    token.style.top  position.y
    
    // ñadir tooltip con información completa
    token.title  `${player.name} (${player.team}) - ${base} base`
    
    // ñadir al contenedor de tokens
    const container  document.getlementyd('runners-container')
    if (container) {
        container.appendhild(token)
    } else {
        console.error('❌ o se encontró el contenedor de runners')
    }
    
    // emover clase de entrada después de la animación
    setimeout(()  {
        token.classist.remove('entering')
    }, )
    
    return token
}

/**
 * ueve un token de corredor de una base a otra con animación
 * param {string} playerd -  del jugador a mover
 * param {string} fromase - ase de origen
 * param {string} toase - ase de destino  
 * param {unction} callback - unción a ejecutar cuando termine la animación
 */
function moveunner(playerd, fromase, toase, callback  null) {
    console.log(`🏃‍♂️ oviendo jugador ${playerd} de ${fromase} a ${toase}`)
    
    const token  document.queryelector(`data-player-id"${playerd}"]`)
    if (!token) {
        console.error(`❌ o se encontró token para jugador ${playerd}`)
        return
    }
    
    // ctualizar posición de destino
    const toosition  baseositionstoase]
    token.style.left  toosition.x
    token.style.top  toosition.y
    token.dataset.currentase  toase
    
    // ctualizar tooltip
    const playerame  token.queryelector('.runner-name').textontent
    token.title  `${playerame} - ${toase} base`
    
    // jecutar callback después de la animación (.s según )
    if (callback) {
        setimeout(callback, )
    }
}

/**
 * aneja la anotación de una carrera con animación especial
 * param {string} playerd -  del jugador que anota
 * param {unction} callback - unción a ejecutar cuando termine la animación
 */
function scoreun(playerd, callback  null) {
    console.log(`⚾ ¡arrera anotada! ugador ${playerd}`)
    
    const token  document.queryelector(`data-player-id"${playerd}"]`)
    if (!token) {
        console.error(`❌ o se encontró token para jugador ${playerd}`)
        return
    }
    
    // over a home plate y añadir animación de carrera
    const homeosition  baseositions.home
    token.style.left  homeosition.x
    token.style.top  homeosition.y
    token.classist.add('scoring')
    
    // emover token después de la animación (s)
    setimeout(()  {
        if (token.parentode) {
            token.parentode.removehild(token)
        }
        console.log(`✅ oken de ${playerd} removido después de anotar`)
        
        if (callback) {
            callback()
        }
    }, )
}

/**
 * limina un token de corredor del diamante
 * param {string} playerd -  del jugador cuyo token eliminar
 */
function removeunneroken(playerd) {
    console.log(`🗑️ liminando token de jugador ${playerd}`)
    
    const token  document.queryelector(`data-player-id"${playerd}"]`)
    if (token && token.parentode) {
        token.parentode.removehild(token)
        console.log(`✅ oken de ${playerd} eliminado`)
    }
}

/**
 * ctualiza la visualización del diamante para reflejar gametate.bases
 * incroniza los tokens visibles con el estado actual del juego
 */
function updateiamondisplay() {
    console.log('💎 ctualizando visualización del diamante...')
    
    const container  document.getlementyd('runners-container')
    if (!container) {
        console.warn('⚠️ o se encontró contenedor de runners - sistema de tokens deshabilitado')
        return
    }
    
    // impiar tokens existentes
    container.inner  ''
    console.log('🧹 okens existentes limpiados')
    
    // rear tokens para corredores actuales
    'first', 'second', 'third'].forach(base  {
        const runner  gametate.basesbase]
        if (runner) {
            console.log(`👤 reando token para ${runner.name} en ${base}`)
            createunneroken(runner, base)
        }
    })
    
    console.log('✅ isualización del diamante actualizada')
}

/**
 * ñade un corredor a una base específica (tanto en gametate como visualmente)
 * param {bject} player - bjeto jugador
 * param {string} base - ase de destino ('first', 'second', 'third')
 */
function addunneroase(player, base) {
    console.log(`➕ ñadiendo ${player.name} a ${base} base`)
    
    // ctualizar gametate
    gametate.basesbase]  player
    
    // rear token visual
    createunneroken(player, base)
    
    console.log(`✅ ${player.name} añadido a ${base} base`)
}

/**
 * ueve un corredor entre bases (actualiza gametate y anima visualmente)
 * param {string} fromase - ase de origen
 * param {string} toase - ase de destino
 * param {unction} callback - unción a ejecutar cuando termine
 */
function moveunneretweenases(fromase, toase, callback  null) {
    const runner  gametate.basesfromase]
    if (!runner) {
        console.warn(`⚠️ o hay corredor en ${fromase} para mover`)
        return
    }
    
    console.log(`🔄 oviendo ${runner.name} de ${fromase} a ${toase}`)
    
    // i es carrera anotada (toase  'home')
    if (toase  'home') {
        // ctualizar gametate primero
        gametate.basesfromase]  null
        
        // nimar carrera anotada
        scoreun(runner.id, ()  {
            // umar carrera al marcador
            const currenteam  geturrentattingeam()
            const currentnning  gametate.currentnning -  // rray indexing
            gametate.scorecurrenteam]currentnning]++
            gametate.score`total${currenteam.chart().topperase() + currenteam.slice()}`]++
            
            // ctualizar marcador visual
            updateameisplay()
            
            console.log(`⚾ ¡arrera anotada por ${runner.name}!`)
            
            if (callback) callback()
        })
    } else {
        // ovimiento normal entre bases
        gametate.basestoase]  runner
        gametate.basesfromase]  null
        
        moveunner(runner.id, fromase, toase, callback)
    }
}

/**
 * unción de prueba para demostrar el sistema de tokens
 *  - ara testing y demostración
 */
function testokenystem() {
    console.log('🧪 jecutando prueba del sistema de tokens...')
    
    // ugador de prueba
    const testlayer  {
        id 'test-player-',
        name 'uan érez',
        team 'visitante',
        number ''
    }
    
    // impiar y reiniciar
    updateiamondisplay()
    
    // ecuencia de prueba
    setimeout(()  {
        console.log('📍 aso  ñadir corredor a primera base')
        addunneroase(testlayer, 'first')
    }, )
    
    setimeout(()  {
        console.log('📍 aso  over a segunda base')
        moveunneretweenases('first', 'second')
    }, )
    
    setimeout(()  {
        console.log('📍 aso  over a tercera base')
        moveunneretweenases('second', 'third')
    }, )
    
    setimeout(()  {
        console.log('📍 aso  notar carrera')
        moveunneretweenases('third', 'home')
    }, )
}

/**
 * ctiva/desactiva el modo debug para posicionar bases
 * ace visibles los marcadores de base para ajustar coordenadas
 */
function toggleaseositionebug() {
    const tokensayer  document.queryelector('.diamond-tokens-layer')
    
    if (!tokensayer) {
        console.error('❌ o se encontró la capa de tokens')
        return
    }
    
    const isebugctive  tokensayer.classist.contains('debug-mode')
    
    if (isebugctive) {
        // esactivar debug
        tokensayer.classist.remove('debug-mode')
        console.log('🔍 odo debug de bases ')
        alert('🔍 odo debug nos marcadores de base ahora están ocultos.')
    } else {
        // ctivar debug
        tokensayer.classist.add('debug-mode')
        console.log('🔍 odo debug de bases ')
        alert('🔍 odo debug nnhora puedes ver los marcadores rojos de las bases.nsa la consola del navegador () para ajustar las coordenadas.nnjemplonadjustaseosition("first", "%", "%")')
    }
}

/**
 * justa la posición de una base específica
 * param {string} baseame - 'home', 'first', 'second', 'third'
 * param {string} x - oordenada  en porcentaje (ej "%")
 * param {string} y - oordenada  en porcentaje (ej "%")
 */
function adjustaseosition(baseame, x, y) {
    console.log(`🎯 justando ${baseame} base a posición ${x}, ${y}`)
    
    // ctualizar el objeto de coordenadas
    if (baseositionsbaseame]) {
        baseositionsbaseame].x  x
        baseositionsbaseame].y  y
        
        // ctualizar marcador visual inmediatamente
        const marker  document.queryelector(`data-base"${baseame}"]`)
        if (marker) {
            marker.style.left  x
            marker.style.top  y
        }
        
        // ctualizar tokens existentes en esa base
        const tokens  document.queryelectorll(`data-current-base"${baseame}"]`)
        tokens.forach(token  {
            token.style.left  x
            token.style.top  y
        })
        
        console.log(`✅ ${baseame} base reposicionada a ${x}, ${y}`)
        
        // ostrar coordenadas actuales de todas las bases
        console.log('📍 oordenadas actuales de las bases')
        console.log('baseositions ', .stringify(baseositions, null, ))
        
    } else {
        console.error(`❌ ase "${baseame}" no encontrada`)
        console.log('ases válidas home, first, second, third')
    }
}

//    Ó   Ú Ó   
/*
  Ó alidar qué opciones de intención están disponibles según la situación actual
  
    - alidar si hay corredores para robo de bases
    - alidar si hay corredores para hit & run  
    - eshabilitar botones de opciones no disponibles
    - ostrar indicadores visuales de disponibilidad
  
  Ó lamado cada vez que cambia el estado de las bases
*/

/**
 * alida qué opciones de intención están disponibles según gametate.bases
 * returns {bject} - bjeto con disponibilidad de cada opción
 */
function validatententionptions() {
    console.log('🔍 alidando opciones de intención disponibles...')
    console.log('🔍 gametate.bases actual', gametate.bases)
    
    const hasunnersnase  gametate.bases.first ! null || 
                           gametate.bases.second ! null || 
                           gametate.bases.third ! null
    
    console.log('🔍 ¿ay corredores en base', hasunnersnase)
    
    // etectar opciones específicas de robo disponibles
    const availabletealptions  detectvailableunners()
    const canteal  availabletealptions.length  
    
    console.log('🔍 pciones de robo detectadas', availabletealptions)
    console.log('🔍 ¿uede robar', canteal)
    
    // it & un requiere al menos un corredor en base
    const canitndun  hasunnersnase
    
    // unt siempre está disponible
    const canunt  true
    
    // atear normal siempre está disponible  
    const canatormal  true
    
    const validation  {
        normal { available canatormal, reason '' },
        steal { 
            available canteal, 
            reason canteal  ''  'o hay corredores en bases para robar',
            availableptions availabletealptions.length,
            details availabletealptions.map(opt  opt.displayame)
        },
        bunt { available canunt, reason '' },
        hitrun { 
            available canitndun, 
            reason canitndun  ''  'ecesitas corredores en bases para it & un'
        }
    }
    
    console.log('📋 esultado de validación', validation)
    return validation
}

/**
 * ctualiza la interfaz del selector de intenciones según la validación
 * param {bject} validation - esultado de validatententionptions()
 */
function updatententionelector(validation  null) {
    console.log('🎯 ctualizando selector de intenciones...')
    
    if (!validation) {
        validation  validatententionptions()
    }
    
    // ctualizar cada botón según su disponibilidad
    bject.keys(validation).forach(intention  {
        const button  document.getlementyd(`intention-${intention}`)
        const isvailable  validationintention].available
        
        if (button) {
            if (isvailable) {
                // pción disponible
                button.disabled  false
                button.classist.remove('disabled', 'option-unavailable')
                button.classist.add('option-available')
                button.title  ''
                console.log(`✅ ${intention} isponible`)
            } else {
                // pción no disponible
                button.disabled  true
                button.classist.add('disabled', 'option-unavailable')
                button.classist.remove('option-available')
                button.title  validationintention].reason
                console.log(`❌ ${intention} ${validationintention].reason}`)
            }
        }
    })
    
    // ctualizar indicadores visuales especiales
    updatententionndicators(validation)
    
    console.log('✅ elector de intenciones actualizado')
}

/**
 * ñade indicadores visuales adicionales a las opciones
 * param {bject} validation - esultado de validación
 */
function updatententionndicators(validation) {
    // ñadir contador de opciones de robo disponibles
    const stealutton  document.getlementyd('intention-steal')
    if (stealutton && validation.steal.available) {
        const optionsount  validation.steal.availableptions
        const existingadge  stealutton.queryelector('.options-badge')
        
        if (existingadge) {
            existingadge.textontent  optionsount
        } else {
            const badge  document.createlement('span')
            badge.classame  'options-badge badge bg-warning text-dark position-absolute top- end-'
            badge.style.cssext  'font-size .rem transform translate(%, -%)'
            badge.textontent  optionsount
            badge.title  `${optionsount} opciones disponibles ${validation.steal.details.join(', ')}`
            
            stealutton.style.position  'relative'
            stealutton.appendhild(badge)
        }
    } else if (stealutton) {
        // emover badge si no hay opciones
        const existingadge  stealutton.queryelector('.options-badge')
        if (existingadge) {
            existingadge.remove()
        }
    }
}

/**
 * unción mejorada para mostrar el selector de intenciones con validación
 */
function showntentionelectorithalidation() {
    console.log('🎯 ostrando selector de intenciones con validación...')
    
    // rimero mostrar el selector normal
    showntentionelector()
    
    // uego validar y actualizar opciones
    setimeout(()  {
        updatententionelector()
    }, ) // equeño delay para asegurar que el  está listo
}

/**
 * unción de prueba para el sistema de validación
 *  - ara testing y demostración
 */
function testalidationystem() {
    console.log('🧪 jecutando prueba del sistema de validación...')
    
    // impiar bases para empezar
    gametate.bases  { first null, second null, third null }
    updatententionelector()
    console.log('📍 aso  in corredores - robo y hit&run deshabilitados')
    
    setimeout(()  {
        // ñadir corredor en primera
        gametate.bases.first  { id 'test', name 'uan érez', team 'visitante' }
        updatententionelector()
        console.log('📍 aso  orredor en ª - robo ( opción) y hit&run habilitados')
    }, )
    
    setimeout(()  {
        // ñadir corredor en segunda también
        gametate.bases.second  { id 'test', name 'aría arcía', team 'visitante' }
        updatententionelector()
        console.log('📍 aso  orredores en ª y ª - robo ( opciones) incluyendo doble robo')
    }, )
    
    setimeout(()  {
        // impiar para volver al estado inicial
        gametate.bases  { first null, second null, third null }
        updatententionelector()
        console.log('📍 aso  uelta al estado inicial')
    }, )
}

//     Á 

/*
            
  l jugador solo hace clic en "irar ados" y todo se maneja automáticamente
*/

function updateiceystemosition() {
    const visitanteontainer  document.getlementyd('dice-container-visitante')
    const localontainer  document.getlementyd('dice-container-local')
    const intentionontainer  document.getlementyd('intention-container-visitante')

    if (!visitanteontainer || !localontainer) return

    //  i el selector de intenciones está visible,  tocar el contenedor de dados del visitante
    const intentionisible  intentionontainer &&
        intentionontainer.style.display ! 'none' &&
        intentionontainer.style.visibility ! 'hidden'

    console.log('🎯 updateiceystemosition - elector visible', intentionisible)

    if (gametate.isopalf) {
        // isitante batea - mostrar en columna izquierda
        //  solo si el selector de intenciones  está visible
        if (!intentionisible) {
            visitanteontainer.style.display  'block'
            console.log('✅ ontenedor visitante mostrado (sin selector activo)')
        } else {
            console.log('🎯 elector activo -  modificando contenedor visitante')
        }
        localontainer.style.display  'none'
        updateatternfo('visitante')
    } else {
        // ocal batea - mostrar en columna derecha  
        visitanteontainer.style.display  'none'
        localontainer.style.display  'block'
        updateatternfo('local')
    }

    // segurarse de resaltar al bateador actual
    highlighturrentatter()
}

function updateatternfo(team) {
    const batter  geturrentatter()
    if (!batter) return

    const infolement  team  'visitante' 
        document.getlementyd('current-batter-info') 
        document.getlementyd('current-batter-info-local')

    if (infolement) {
        const namepan  infolement.queryelector('.batter-name')
        const statspan  infolement.queryelector('.batter-stats')

        if (namepan) namepan.textontent  batter.name || 'ugador'
        if (statspan) statspan.textontent  ` ${batter.battingvg || '.'} |  ${batter.onasect || '.'}`
    }
}

function rollice() {
    // eterminar qué team está bateando y elementos correspondientes
    const team  gametate.isopalf  'visitante'  'local'
    const resultsisplay  document.getlementyd(`dice-results-display${team  'local'  '-local'  ''}`)
    const finalesult  document.getlementyd(`final-result${team  'local'  '-local'  ''}`)
    const description  document.getlementyd(`result-description${team  'local'  '-local'  ''}`)

    if (!resultsisplay || !finalesult || !description) {
        console.error('lementos de resultado no encontrados')
        return
    }

    // imular tirada de dados ( + )
    const d  ath.floor(ath.random() * ) + 
    const d  ath.floor(ath.random() * ) + 
    const total  d + d

    // lmacenar resultado en gametate para usarlo en resaltado de dropdowns
    gametate.currenticeoll  total

    // ostrar resultados inmediatamente
    resultsisplay.style.display  'block'
    finalesult.textontent  total

    // eterminar resultado de la jugada
    let resultext  ''
    let advanceuts  false

    if (total  ) {
        resultext  'ut (flyout, strikeout, groundout)'
        advanceuts  true
    } else if (total  ) {
        resultext  'it sencillo'
    } else if (total  ) {
        resultext  'it doble'
    } else if (total  ) {
        resultext  'it triple'
    } else {
        resultext  'ome un! 🏠'
    }

    description.textontent  ` ${d} +  ${d}  ${total} → ${resultext}`

    // nicializar sistema de cascada con la tirada actual
    let resultype  ''
    if (total  ) {
        resultype  'oddity'
    } else if (total   && total  ) {
        resultype  'critical-hit'
    } else if (total   && total  ) {
        resultype  'ordinary-hit'
    } else if (total   && total  ) {
        resultype  'walk'
    } else if (total   && total  ) {
        resultype  'possible-error'
    } else if (total   && total  ) {
        resultype  'productive-out-'
    } else if (total   && total  ) {
        resultype  'productive-out-'
    } else if (total   && total  ) {
        resultype  'out'
    } else if (total  ) {
        resultype  'oddity'
    } else if (total  ) {
        resultype  'out'
    }

    // ctivar sistema de cascada inmediatamente
    initializeascade(total, resultype)

    //  procesar automáticamente - esperar confirmación manual
    console.log(`🎲 irada completada ${total} → ${resultype}`)
    console.log(`📋 sperando confirmación manual...`)
}

function changenning() {
    if (gametate.isopalf) {
        // ambiar a la parte baja del mismo inning
        gametate.isopalf  false
        gametate.outs   // esetear outs
        console.log(`ambio a parte baja del inning ${gametate.currentnning}`)
    } else {
        // vanzar al siguiente inning completo
        gametate.currentnning++
        gametate.isopalf  true
        gametate.outs   // esetear outs
        console.log(`vanzar al inning ${gametate.currentnning}`)

        // erificar si el juego ha terminado ( innings)
        if (gametate.currentnning  ) {
            endame()
            return
        }
    }

    //   Ó - uede interferir con dados visibles
    // updateameisplay() //  - antener dados visibles  
    // updateiceystemosition() //  - antener dados visibles

    console.log(`✅ nning cambiado sin resetear dados`)
}

function endame() {
    gametate.isamective  false
    const winner  gametate.score.totalisitante  gametate.score.totalocal  'isitante' 
        gametate.score.totalocal  gametate.score.totalisitante  'ocal'  'mpate'

    alert(`¡uego terminado! anador ${winner}`)
    console.log('uego terminado')

    // cultar sistema de dados
    document.getlementyd('dice-container-visitante').style.display  'none'
    document.getlementyd('dice-container-local').style.display  'none'
}

// unción para actualizar rango del dado del pitcher
function updateitchericeange(team) {
    const suffix  team  'local'  '-local'  ''
    const diceypeelect  document.getlementyd(`pitcher-dice-type${suffix}`)
    const dicealuenput  document.getlementyd(`pitcher-dice-value${suffix}`)

    console.log(`🎲 uscando elementos para ${team}`, {
        select `pitcher-dice-type${suffix}`,
        input `pitcher-dice-value${suffix}`,
        selectound !!diceypeelect,
        inputound !!dicealuenput
    })

    if (!diceypeelect || !dicealuenput) {
        console.error(`❌ lementos no encontrados para ${team}`)
        return
    }

    const dicealue  parsent(diceypeelect.value)
    const isegative  dicealue  
    const diceize  ath.abs(dicealue)

    console.log(`🎲 ctualizando rango ${team} ${dicealue} (${isegative  'negativo'  'positivo'})`)

    // stablecer rangos
    let minal, maxal
    if (isegative) {
        minal  -diceize
        maxal  -
    } else {
        minal  
        maxal  diceize
    }

    // plicar rangos de múltiples formas para asegurar compatibilidad
    dicealuenput.min  minal
    dicealuenput.max  maxal
    dicealuenput.setttribute('min', minal)
    dicealuenput.setttribute('max', maxal)

    // ctualizar placeholder para mostrar el rango
    dicealuenput.placeholder  `${minal} a ${maxal}`

    // impiar el valor actual si está fuera del rango
    const currentalue  parsent(dicealuenput.value)
    if (currentalue && (currentalue  minal || currentalue  maxal)) {
        dicealuenput.value  ''
        console.log(`⚠️ alor ${currentalue} fuera de rango, limpiando...`)
        if (typeof calculateotal  'function') {
            calculateotal(team)
        }
    }

    console.log(`✅ ango establecido para ${team} ${minal} a ${maxal}`)
}

// unciones para tirar dados individuales
function rollitcherice(team) {
    const diceypeelect  document.getlementyd(`pitcher-dice-type${team  'local'  '-local'  ''}`)
    const dicealuenput  document.getlementyd(`pitcher-dice-value${team  'local'  '-local'  ''}`)

    const dicealue  parsent(diceypeelect.value)
    const isegative  dicealue  
    const diceize  ath.abs(dicealue)

    const roll  ath.floor(ath.random() * diceize) + 
    const finalalue  isegative  -roll  roll

    dicealuenput.value  finalalue
    calculateotal(team)
}

function rollatterice(team) {
    const dicealuenput  document.getlementyd(`batter-dice-value${team  'local'  '-local'  ''}`)
    const roll  ath.floor(ath.random() * ) + 

    dicealuenput.value  roll
    calculateotal(team)
}

function calculateotal(team) {
    const pitcheralue  parsent(document.getlementyd(`pitcher-dice-value${team  'local'  '-local'  ''}`).value) || 
    const batteralue  parsent(document.getlementyd(`batter-dice-value${team  'local'  '-local'  ''}`).value) || 

    if (pitcheralue   || batteralue  ) {
        // i no hay valores, ocultar confirmación
        hideesultonfirmation(team)
        return
    }

    const total  pitcheralue + batteralue

    // ¡! uardar el total en gametate para que funcione la cascada
    gametate.currenticeoll  total
    console.log(`🎲 otal calculado y guardado en gametate ${total}`)

    const resultlement  document.getlementyd(`final-result${team  'local'  '-local'  ''}`)
    resultlement.textontent  total

    // ctualizar descripción del resultado
    updateesultescription(team, total, pitcheralue, batteralue)

    // ostrar botón de confirmación
    showesultonfirmation(team)
}

function updateesultescription(team, total, pitcheralue, batteralue) {
    const description  document.getlementyd(`result-description${team  'local'  '-local'  ''}`)

    let resultext  ''
    if (total  ) {
        resultext  'ut (flyout, strikeout, groundout)'
    } else if (total  ) {
        resultext  'it sencillo'
    } else if (total  ) {
        resultext  'it doble'
    } else if (total  ) {
        resultext  'it triple'
    } else {
        resultext  'ome un! 🏠'
    }

    description.textontent  `${pitcheralue} + ${batteralue}  ${total} → ${resultext}`
}

function showesultonfirmation(team) {
    const confirmation  document.getlementyd(`result-confirmation${team  'local'  '-local'  ''}`)

    if (confirmation) {
        confirmation.style.display  'block'
    }
}

function hideesultonfirmation(team) {
    const confirmation  document.getlementyd(`result-confirmation${team  'local'  '-local'  ''}`)

    if (confirmation) {
        confirmation.style.display  'none'
    }
}

function confirmesult(team) {
    const total  parsent(document.getlementyd(`final-result${team  'local'  '-local'  ''}`).textontent)

    console.log(`🎯 esultado confirmado para ${team}`)
    console.log(`   otal ${total}`)

    // quí comenzará la lógica en cascada
    processameesult(team, total, true) // or defecto siempre avanzar corredor

    // cultar confirmación después de procesar
    hideesultonfirmation(team)

    //    - antener visibles para referencia
    // clearicealues(team) //  - os dados permanecen visibles

    console.log(`✅ esultado confirmado sin limpiar dados`)
}

function processameesult(team, total, advanceunner) {
    //  quí iremos agregando la lógica en cascada
    console.log('🔄 rocesando resultado del juego...')

    let resultype  ''
    let isut  false

    // eterminar resultado basado en la tabla real de wing esult
    if (total  ) {
        resultype  'oddity'
    } else if (total   && total  ) {
        resultype  'critical-hit'
    } else if (total  ) {
        // quí necesitaríamos saber  (atting rait) del jugador
        // or ahora usaremos valores aproximados    para jugador promedio
        const estimated  
        const estimated   //  típicamente  + 

        if (total  estimated) {
            resultype  'ordinary-hit'
        } else if (total  estimated) {
            resultype  'walk'
        } else if (total  estimated + ) {
            resultype  'possible-error'
        } else if (total  estimated +  && total  ) {
            resultype  'productive-out-'
            isut  true
        } else if (total   && total  ) {
            resultype  'productive-out-'
            isut  true
        } else if (total  ) {
            if (total  ) {
                resultype  'oddity'
            } else if (total  ) {
                resultype  'out' // osible triple play
                isut  true
            } else {
                resultype  'out'
                isut  true
            }
        }
    }

    console.log(`   ipo de resultado ${resultype}`)

    // nicializar sistema de cascada para resolución
    initializeascade(total, resultype)

    if (isut) {
        gametate.outs++
        console.log(`   uts ${gametate.outs}`)

        if (gametate.outs  ) {
            console.log('   🔄 ambio de inning')
            changenning()
        } else {
            console.log('   ➡️ iguiente bateador')
            nextatter()
        }
    } else {
        console.log('   ⚾ it registrado - cascada activada')
        // a cascada manejará el resto de la resolución
        // nextatter() // e llamará después de resolver la cascada
    }

    // ctualizar visualización
    updateameisplay()
    updateiceystemosition()
}

function clearicealues(team) {
    const pitchernput  document.getlementyd(`pitcher-dice-value${team  'local'  '-local'  ''}`)
    const batternput  document.getlementyd(`batter-dice-value${team  'local'  '-local'  ''}`)
    const resultlement  document.getlementyd(`final-result${team  'local'  '-local'  ''}`)
    const description  document.getlementyd(`result-description${team  'local'  '-local'  ''}`)

    if (pitchernput) pitchernput.value  ''
    if (batternput) batternput.value  ''
    if (resultlement) resultlement.textontent  '-'
    if (description) description.textontent  'sperando tirada...'
}

// vent listeners para inputs y inicialización
document.addventistener('ontentoaded', function() {
    // vent listeners para cálculo automático cuando se editan manualmente
    const inputs  'pitcher-dice-value', 'batter-dice-value', 'pitcher-dice-value-local', 'batter-dice-value-local']

    inputs.forach(inputd  {
        const input  document.getlementyd(inputd)
        if (input) {
            input.addventistener('input', function() {
                const team  inputd.includes('local')  'local'  'visitante'

                // alidar rango solo para pitcher dice
                if (inputd.includes('pitcher-dice-value')) {
                    const value  parsent(this.value)
                    const min  parsent(this.min)
                    const max  parsent(this.max)

                    if (value && (value  min || value  max)) {
                        console.log(`⚠️ alor ${value} fuera de rango ${min}, ${max}]`)
                        this.style.borderolor  '#ef' // orde rojo
                        this.title  `alor debe estar entre ${min} y ${max}`
                        return // o calcular total si está fuera de rango
                    } else {
                        this.style.borderolor  '' // uitar borde rojo
                        this.title  ''
                    }
                }

                calculateotal(team)
            })
        }
    })

    // nicializar rangos de dados al cargar la página
    setimeout(()  {
        updateitchericeange('visitante')
        updateitchericeange('local')
        console.log('🎲 angos de dados inicializados con timeout')
    }, )

    console.log('🎲 ntentando inicializar rangos de dados...')

    // nicializar el juego
    initializeame()
})

//     Á 

/*
         Ó
  l sistema se mueve entre columnas según el turno al bate
*/

function updateiceystemosition() {
    const visitanteontainer  document.getlementyd('dice-container-visitante')
    const localontainer  document.getlementyd('dice-container-local')
    const intentionontainer  document.getlementyd('intention-container-visitante')

    //  resultados de dados antes de cambiar visibilidad
    const visitanteesults  document.getlementyd('dice-results-display')
    const localesults  document.getlementyd('dice-results-display-local')

    const visitanteasisible  visitanteesults && visitanteesults.style.display  'block'
    const localasisible  localesults && localesults.style.display  'block'

    //  i el selector de intenciones está visible,  tocar el contenedor de dados del visitante
    const intentionisible  intentionontainer &&
        intentionontainer.style.display ! 'none' &&
        intentionontainer.style.visibility ! 'hidden'

    console.log('🎯 updateiceystemosition ] - elector visible', intentionisible)

    if (gametate.isopalf) {
        // isitante batea - mostrar en columna izquierda
        //  solo si el selector de intenciones  está visible
        if (!intentionisible) {
            visitanteontainer.style.display  'block'
            console.log('✅ ontenedor visitante mostrado ] (sin selector activo)')
        } else {
            console.log('🎯 elector activo ] -  modificando contenedor visitante')
        }
        localontainer.style.display  'none'
        updateatternfo('visitante')
    } else {
        // ocal batea - mostrar en columna derecha  
        visitanteontainer.style.display  'none'
        localontainer.style.display  'block'
        updateatternfo('local')
    }

    //  resultados que estaban visibles
    if (visitanteasisible && visitanteesults) {
        visitanteesults.style.display  'block'
        console.log(`🔄 anteniendo dados visitante visibles`)
    }
    if (localasisible && localesults) {
        localesults.style.display  'block'
        console.log(`🔄 anteniendo dados local visibles`)
    }
}

function updateatternfo(team) {
    const batter  geturrentatter()
    const infolement  team  'visitante' 
        document.getlementyd('current-batter-info') 
        document.getlementyd('current-batter-info-local')

    if (batter && infolement) {
        const namepan  infolement.queryelector('.batter-name')
        const statspan  infolement.queryelector('.batter-stats')

        namepan.textontent  batter.name || 'ugador'
        statspan.textontent  ` ${batter.battingvg || '.'} |  ${batter.onasect || '.'}`
    }
}

function rollice() {
    const team  gametate.isopalf  'visitante'  'local'
    const resultsisplay  team  'visitante' 
        document.getlementyd('dice-results-display') 
        document.getlementyd('dice-results-display-local')
    const finalesult  team  'visitante' 
        document.getlementyd('final-result') 
        document.getlementyd('final-result-local')
    const description  team  'visitante' 
        document.getlementyd('result-description') 
        document.getlementyd('result-description-local')

    // imular tirada de dados ( + )
    const d  ath.floor(ath.random() * ) + 
    const d  ath.floor(ath.random() * ) + 
    const total  d + d

    // ostrar resultados
    resultsisplay.style.display  'block'
    finalesult.textontent  total

    // eterminar resultado de la jugada
    let resultext  ''
    if (total  ) {
        resultext  'ut (foul, strikeout, groundout)'
    } else if (total  ) {
        resultext  'it sencillo'
    } else if (total  ) {
        resultext  'it doble'
    } else if (total  ) {
        resultext  'it triple'
    } else {
        resultext  'ome run!'
    }

    description.textontent  ` ${d} +  ${d}  ${total} → ${resultext}`

    //    Ó " "
    const confirmation  document.getlementyd('cascade-confirmation')
    const confirmationext  document.getlementyd('confirmation-text')
    if (confirmation && confirmationext) {
        confirmationext.textontent  'ados tirados. ¿ontinuar al siguiente bateador'
        confirmation.style.display  'block'
        console.log(`🎯 otón "iguiente ateador" mostrado inmediatamente`)
    }

    //    Á - olo mostrar el botón y esperar
    // l usuario debe presionar "iguiente ateador" para continuar
    console.log(`✅ ados mostrados. sperando confirmación del usuario...`)
}

// vent listeners para los botones de dados
document.addventistener('ontentoaded', function() {
    const rolluttonisitante  document.getlementyd('roll-main-dice')
    const rolluttonocal  document.getlementyd('roll-main-dice-local')

    if (rolluttonisitante) {
        rolluttonisitante.addventistener('click', rollice)
    }

    if (rolluttonocal) {
        rolluttonocal.addventistener('click', rollice)
    }
})

//    Ó   
let currenteamype  null // 'visitante' o 'local'
let currenteamata  null

// quipos predefinidos
const _  {
    "yankees" {
        name "ew ork ankees",
        players 
            { id , name "aron udge", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "leyber orres", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "nthony izzo", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "iancarlo tanton", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name " eahieu", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "ose revino", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "ndrew enintendi", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "arrison ader", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "siah iner-alefa", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  }
        ]
    },
    "dodgers" {
        name "os ngeles odgers",
        players 
            { id , name "ookie etts", position "", handedness "", battingvg ".", onasect ".", traits "", ""], malus  },
            { id , name "reddie reeman", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "rea urner", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "ill mith", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "ax uncy", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "ustin urner", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "hris aylor", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "ody ellinger", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "avin ux", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  }
        ]
    },
    "red_sox" {
        name "oston ed ox",
        players 
            { id , name "afael evers", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "ander ogaerts", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "revor tory", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name ".. artinez", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "lex erdugo", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "hristian azquez", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "ike ernandez", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "ranchy ordero", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  },
            { id , name "obby albec", position "", handedness "", battingvg ".", onasect ".", traits ""], malus  }
        ]
    }
}

// unciones del modal
function openeamonfig(teamype) {
    currenteamype  teamype
    console.log(`🔧 briendo configuración para equipo ${teamype}`)

    // ctualizar título del modal
    const modalitle  document.getlementyd('modal-title')
    if (modalitle) {
        modalitle.textontent  `⚙️ onfigurar ${teamype  'visitante'  'quipo isitante'  'quipo ocal'}`
    }

    // impiar selección anterior
    const presetelect  document.getlementyd('preset-teams')
    const teamamenput  document.getlementyd('team-name')

    if (presetelect) presetelect.value  ''
    if (teamamenput) teamamenput.value  ''

    // argar datos actuales del equipo
    loadurrenteamata()

    // ostrar modal
    const modal  document.getlementyd('team-config-modal')
    if (modal) {
        modal.classist.add('active')
        console.log('✅ odal de configuración mostrado')
    } else {
        console.error('❌ o se encontró el modal team-config-modal')
    }
}

function closeeamonfig() {
    const modal  document.getlementyd('team-config-modal')
    if (modal) {
        modal.classist.remove('active')
    }
    console.log('📴 odal de configuración cerrado')
}

function loadurrenteamata() {
    console.log('📋 argando datos actuales del equipo...')
    //  quí se cargarían los datos actuales del equipo desde la tabla
}

function loadreseteam() {
    const presetelect  document.getlementyd('preset-teams')
    if (!presetelect) return

    const selectedeam  presetelect.value
    if (!selectedeam) return

    console.log(`📦 argando equipo predefinido ${selectedeam}`)

    const teamata  _selectedeam]
    if (teamata) {
        currenteamata  teamata

        // ctualizar campo nombre del equipo
        const teamamenput  document.getlementyd('team-name')
        if (teamamenput) {
            teamamenput.value  teamata.name
        }

        console.log(`✅ atos del equipo ${teamata.name} cargados`)
    }
}

function createustomeam() {
    console.log('🎨 reando equipo personalizado...')
    //  quí se abriría el editor de equipo personalizado
    alert('unción de equipo personalizado en desarrollo')
}

function saveeamonfig() {
    console.log(`💾 uardando configuración del equipo ${currenteamype}...`)

    // btener datos del equipo a guardar
    const presetelect  document.getlementyd('preset-teams')
    const teamamenput  document.getlementyd('team-name')

    let teamoave  null

    if (presetelect && presetelect.value) {
        // sar equipo predefinido
        teamoave  _presetelect.value]
        console.log(`📋 plicando equipo predefinido ${presetelect.value}`)
    } else if (currenteamata) {
        // sar datos cargados previamente
        teamoave  currenteamata
        console.log(`📋 plicando datos del equipo cargado`)
    }

    if (teamoave) {
        applyeamoable(currenteamype, teamoave)
        console.log(`✅ quipo ${teamoave.name} aplicado a ${currenteamype}`)
    } else {
        console.warn('⚠️ o hay datos de equipo para guardar')
        alert('or favor selecciona un equipo antes de guardar')
        return
    }

    closeeamonfig()
}

function applyeamoable(teamype, teamata) {
    console.log(`🏟️ plicando ${teamata.name} a tabla ${teamype}`)

    const tabled  `roster-${teamype}`
    const table  document.getlementyd(tabled)

    if (!table) {
        console.error(`❌ o se encontró la tabla ${tabled}`)
        return
    }

    const tbody  table.queryelector('tbody')
    if (!tbody) {
        console.error(`❌ o se encontró tbody en tabla ${tabled}`)
        return
    }

    // impiar filas existentes
    tbody.inner  ''

    // gregar cada jugador con la estructura completa de la tabla original
    teamata.players.forach((player, index)  {
        const row  document.createlement('tr')
        row.classame  'player-row'
        row.draggable  true
        row.setttribute('data-player-id', player.id || (index + ))

        // rear la estructura  completa con todas las clases 
        row.inner  `
            td class"drag-handle"⋮⋮/td
            td class"player-number"${index + }/td
            td class"player-photo"📷/td
            td class"player-name"${player.name}/td
            td
                select class"position-select" data-player"${player.id || (index + )}"
                    option value"" ${player.position  ''  'selected'  ''}/option
                    option value"" ${player.position  ''  'selected'  ''}/option
                    option value"" ${player.position  ''  'selected'  ''}/option
                    option value"" ${player.position  ''  'selected'  ''}/option
                    option value"" ${player.position  ''  'selected'  ''}/option
                    option value"" ${player.position  ''  'selected'  ''}/option
                    option value"" ${player.position  ''  'selected'  ''}/option
                    option value"" ${player.position  ''  'selected'  ''}/option
                    option value"" ${player.position  ''  'selected'  ''}/option
                    option value"" ${player.position  ''  'selected'  ''}/option
                /select
            /td
            td class"handedness"${player.handedness || ''}/td
            td class"batting-avg"${player.battingvg}/td
            td class"on-base-pct"${player.onasect}/td
            td${generateraitags(player.traits)}/td
            td class"game-status"⚾/td
        `

        tbody.appendhild(row)
    })

    // ctualizar nombre del equipo en el encabezado
    const teameader  document.queryelector(`#roster-${teamype}`).closest('.col').queryelector('.team-header h')
    if (teameader) {
        const icon  teamype  'visitante'  '🛫'  '🏠'
        teameader.textontent  `${icon} ${teamata.name}`
    }

    console.log(`✅ ${teamata.players.length} jugadores agregados a la tabla con formato completo`)
}

function generateraitags(traits) {
    if (!traits || traits.length  ) return '-'

    return traits.map(trait  {
        const traitlass  `trait-${trait.toowerase()}`
        return `span class"trait-tag ${traitlass}"${trait}/span`
    }).join(' ')
}

//      Ó 

/*
       
  aneja la resolución paso a paso de jugadas complejas
*/

// ostrar el sistema de cascada (contenedor siempre visible)
function showascadeystem() {
    // l contenedor ya está siempre visible por 
    // olo activamos la visualización de contenido
    console.log('📋 istema de cascada activado (contenedor siempre visible)')
}

// cultar solo los dropdowns (contenedor siempre visible)
function hideascadeystem() {
    const cascadeystem  document.getlementyd('cascade-system')
    if (cascadeystem) {
        //  ocultar el contenedor - solo los dropdowns
        // cascadeystem.style.display  'none' // 

        // cultar y resetear todos los dropdowns con position fixed
        const dropdowns  cascadeystem.queryelectorll('.cascade-dropdown')
        dropdowns.forach(dropdown  {
            dropdown.style.display  'none'
            dropdown.classist.remove('show')
            // esetear posicionamiento fixed
            dropdown.style.left  ''
            dropdown.style.top  ''
            dropdown.style.transform  ''
        })

        // ctualizar estado a esperando
        const cascadetatus  document.getlementyd('cascade-current-action')
        if (cascadetatus) {
            cascadetatus.textontent  'istema activo - sperando tirada...'
        }

        console.log('📋 ropdowns ocultos y reseteados (contenedor permanece visible)')
    }
}

// nicializar cascada con resultado inicial
function initializeascade(result, resultype) {
    showascadeystem()

    // ctualizar estado de la cascada con nombres más legibles
    const cascadetatus  document.getlementyd('cascade-current-action')
    if (cascadetatus) {
        const typeames  {
            'oddity' 'ddity - vento especial',
            'critical-hit' 'ritical it - olpe crítico',
            'ordinary-hit' 'rdinary it - olpe ordinario',
            'walk' 'alk - ase por bolas',
            'possible-error' 'ossible rror - osible error',
            'productive-out-' 'roductive ut - ut productivo',
            'productive-out-' 'roductive ut - lección del fildeador',
            'out' 'ut - liminación'
        }
        const displayame  typeamesresultype] || resultype
        cascadetatus.textontent  `esolviendo ${displayame}`
    }

    // ostrar resultado inicial
    const initialesult  document.getlementyd('initial-result')
    if (initialesult) {
        initialesult.textontent  result
    }

    console.log(`🎲 ascada inicializada ${result} → ${resultype}`)

    // quí se determinará si necesita más resolución
    checkordditionalesolution(resultype)
}

// erificar si el resultado necesita resolución adicional
function checkordditionalesolution(resultype) {
    // odos los tipos de la tabla de wing esult necesitan mostrar el dropdown
    const allesultypes  
        'oddity', 'critical-hit', 'ordinary-hit', 'walk', 'possible-error',
        'productive-out-', 'productive-out-', 'out'
    ]

    if (allesultypes.includes(resultype) || resultype) {
        console.log(`⚡ ${resultype} - ostrando tabla de wing esult`)
        showascaderopdown(, resultype)
    } else {
        console.log(`✅ ${resultype} - ipo no reconocido, manteniendo visible`)
        //  ocultar automáticamente - esperar confirmación manual
    }
}

// ostrar dropdown de opciones de cascada
function showascaderopdown(stepumber, resultype) {
    console.log(`🔍 ntentando mostrar dropdown ${stepumber} con tipo ${resultype}`)

    const dropdown  document.getlementyd(`cascade-dropdown-${stepumber}`)
    console.log(`🔍 ropdown encontrado`, dropdown)

    if (dropdown) {
        // enerar opciones según el tipo de resultado usando la nueva cascada simplificada
        const options  generateimpleascade(gametate.currenticeoll)
        console.log(`🔍 pciones generadas`, options.substring(, ) + '...')

        dropdown.inner  options

        // osicionamiento fixed para que aparezca por encima de 
        positionixedropdown(dropdown, stepumber)

        dropdown.style.display  'block'
        dropdown.classist.add('show')

        console.log(`🔽 ropdown mostrado para paso ${stepumber} ${resultype}`)
        console.log(`🔍 stilos del dropdown`, dropdown.style.cssext)
    } else {
        console.error(`❌ o se encontró dropdown con  cascade-dropdown-${stepumber}`)
    }
}

// osicionar dropdown con position fixed por encima de todas las capas
function positionixedropdown(dropdown, stepumber) {
    const step  document.getlementyd(`cascade-step-${stepumber}`)
    if (step) {
        const rect  step.getoundinglientect()

        // osicionar encima del resultado inicial con más espacio para la tabla
        let targetop  rect.top -  // ás arriba para mostrar toda la tabla

        // segurar que no salga de la pantalla por arriba
        const minop  
        if (targetop  minop) {
            targetop  minop
        }

        // alcular posición fija en la pantalla
        dropdown.style.left  `${rect.left + (rect.width / )}px`
        dropdown.style.top  `${targetop}px`
        dropdown.style.transform  'translate(-%)'

        console.log(`📍 ropdown posicionado sin tapar el número left${dropdown.style.left}, top${dropdown.style.top}`)
    }
} // eterminar qué fila de la tabla debe resaltarse basado en la tirada y datos del bateador
function getighlightedowndex(diceoll) {
    if (!diceoll) return - // o resaltar si no hay tirada

    console.log(`🎯 alculando resaltado para tirada ${diceoll}`)

    // btener datos del bateador actual
    const currentatter  geturrentatter()
    if (!currentatter) {
        console.warn('❌ o hay bateador actual, usando valores por defecto')
        return getighlightedowndexefault(diceoll)
    }

    console.log(`🏏 atos del bateador`, currentatter)

    // xtraer  y  del bateador
    const raw  currentatter.battingvg || .
    const raw  currentatter.onasect || .

    console.log(`📊 aw  ${raw}, aw  ${raw}`)

    // Ó  oger los dos primeros números desde la izquierda
    let bt, obt

    // onvertir a string para poder manipular
    const bttring  raw.totring()
    const obttring  raw.totring()

    // xtraer los dos primeros dígitos significativos
    if (raw  ) {
        // i es  , tomar los dos primeros dígitos  → ,  → 
        bt  ath.floor(raw / ath.pow(, ath.floor(ath.log(raw)) - ))
        if (bt  ) bt  ath.floor(bt / ) // i sale  → 
    } else {
        // i es decimal, extraer después del punto . → , . → 
        const afterecimal  bttring.split('.')] || ''
        bt  parsent(afterecimal.substring(, ).padnd(, ''))
    }

    if (raw  ) {
        // i es  , tomar los dos primeros dígitos
        obt  ath.floor(raw / ath.pow(, ath.floor(ath.log(raw)) - ))
        if (obt  ) obt  ath.floor(obt / )
    } else {
        // i es decimal, extraer después del punto . → 
        const afterecimal  obttring.split('.')] || ''
        obt  parsent(afterecimal.substring(, ).padnd(, ''))
    }

    console.log(`🏏 ateador ${currentatter.name}`)
    console.log(`📊  calculado ${bt} (de ${raw}),  calculado ${obt} (de ${raw})`)
    console.log(`🎯 angos variables serán -${bt}, ${bt + }-${obt}, ${obt + }-${obt + }, ${obt + }-`) // Ó Ú  Ó

    //   (no dependen de stats)
    if (diceoll  ) {
        console.log(`✅ irada ${diceoll} → ddity (fijo)`)
        return 
    } else if (diceoll   && diceoll  ) {
        console.log(`✅ irada ${diceoll} → ritical it (fijo)`)
        return 
    } else if (diceoll   && diceoll  ) {
        console.log(`✅ irada ${diceoll} → roductive ut - (fijo)`)
        return 
    } else if (diceoll   && diceoll  ) {
        console.log(`✅ irada ${diceoll} → ut - (fijo)`)
        return 
    } else if (diceoll  ) {
        console.log(`✅ irada ${diceoll} → ddity  (fijo)`)
        return 
    } else if (diceoll  ) {
        console.log(`✅ irada ${diceoll} → ut + (fijo)`)
        return 
    }

    //   (dependen de  y )
    else if (diceoll   && diceoll  bt) {
        console.log(`✅ irada ${diceoll} → it rdinario -${bt}] (variable)`)
        return 
    } else if (diceoll  (bt + ) && diceoll  obt) {
        console.log(`✅ irada ${diceoll} → ase por olas ${bt + }-${obt}] (variable)`)
        return 
    } else if (diceoll  (obt + ) && diceoll  (obt + )) {
        console.log(`✅ irada ${diceoll} → osible rror ${obt + }-${obt + }] (variable)`)
        return 
    } else if (diceoll  (obt + ) && diceoll  ) {
        console.log(`✅ irada ${diceoll} → ut roductivo ${obt + }-] (variable)`)
        return 
    }

    console.log(`❌ irada ${diceoll} no encaja en ningún rango`)
    return -
}

// unción de respaldo con valores por defecto si no hay bateador
function getighlightedowndexefault(diceoll) {
    const default  
    const default  

    if (diceoll  ) return 
    else if (diceoll   && diceoll  ) return 
    else if (diceoll   && diceoll  default) return 
    else if (diceoll  (default + ) && diceoll  default) return 
    else if (diceoll  (default + ) && diceoll  (default + )) return 
    else if (diceoll  (default + ) && diceoll  ) return 
    else if (diceoll   && diceoll  ) return 
    else if (diceoll   && diceoll  ) return 
    else if (diceoll  ) return 
    else if (diceoll  ) return 

    return -
}

//    -  
function generateimpleascade(diceoll) {
    console.log(`🆕    - irada ${diceoll}`)

    if (!diceoll) {
        console.warn('❌ o hay tirada de dados')
        return 'divo hay tirada/div'
    }

    //        Á
    const currentatter  geturrentatter()
    let bt  ,
        obt   // alores por defecto

    if (currentatter) {
        const raw  currentatter.battingvg || .
        const raw  currentatter.onasect || .

        // sar la misma lógica de conversión que en getighlightedowndex
        if (raw  ) {
            bt  ath.floor(raw / ath.pow(, ath.floor(ath.log(raw)) - ))
            if (bt  ) bt  ath.floor(bt / )
        } else {
            const afterecimal  raw.totring().split('.')] || ''
            bt  parsent(afterecimal.substring(, ).padnd(, ''))
        }

        if (raw  ) {
            obt  ath.floor(raw / ath.pow(, ath.floor(ath.log(raw)) - ))
            if (obt  ) obt  ath.floor(obt / )
        } else {
            const afterecimal  raw.totring().split('.')] || ''
            obt  parsent(afterecimal.substring(, ).padnd(, ''))
        }

        console.log(`🎯 ascada usando  ${bt},  ${obt} para ${currentatter.name}`)
    }

    // angos dinámicos basados en el bateador actual
    const swingesults  
        { range "", event "ddity", result "oll d on ddities table", highlighted diceoll   },
        { range "-", event "ritical it", result "oll d on it table. ncrease hit by one level", highlighted diceoll   && diceoll   },
        { range `-${bt}`, event "rdinary it", result "oll d on it able", highlighted diceoll   && diceoll  bt },
        { range `${bt + }-${obt}`, event "alk", result "atter advances to first", highlighted diceoll  (bt + ) && diceoll  obt },
        { range `${obt + }-${obt + }`, event "ossible rror", result "oll d on efense able", highlighted diceoll  (obt + ) && diceoll  (obt + ) },
        { range `${obt + }-`, event "roductive ut", result "unners advance, batter may be safe", highlighted diceoll  (obt + ) && diceoll   },
        { range "-", event "roductive ut", result "imited runner advancement", highlighted diceoll   && diceoll   },
        { range "-", event "ut", result "tandard out, limited advancement", highlighted diceoll   && diceoll   },
        { range "", event "ddity", result "oll d on ddities table", highlighted diceoll   },
        { range "+", event "ut", result "ossible triple play", highlighted diceoll   }
    ]

    let html  'div class"simple-cascade-table"'
    html + `div class"table-header"📊   -  ${diceoll} | ${currentatter  currentatter.name  'ugador'} (${bt}, ${obt})/div`

    swingesults.forach((row, index)  {
        const highlightlass  row.highlighted  'highlighted-row'  ''
        const highlighttyle  row.highlighted 
            'style"background-color #ff !important color #ffffff !important border px solid #ffff !important font-weight bold !important transform scale(.) !important box-shadow   px #ffff !important"' 
            ''

        html + `
            div class"cascade-row ${highlightlass}" ${highlighttyle} onclick"selectesult('${row.event}', '${row.result}')"
                div class"range-col"${row.range}/div
                div class"event-col"${row.event}/div
                div class"result-col"${row.result}/div
            /div
        `

        if (row.highlighted) {
            console.log(`🎯  ila ${index} - ${row.range} - ${row.event}`)
        }
    })

    html + '/div'
    return html
}

// unción para seleccionar resultado
function selectesult(event, result) {
    console.log(`✅ esultado seleccionado ${event} - ${result}`)

    // ostrar confirmación
    const confirmation  document.getlementyd('cascade-confirmation')
    if (confirmation) {
        confirmation.style.display  'block'
        confirmation.inner  `
            div style"background #eb color white padding rem border-radius px border px solid #"
                h🎯 esultado ${event}/h
                p${result}/p
                button onclick"confirmndextatter()" style"background # color white padding .rem rem border none border-radius px margin-right .rem"✅ onfirmar y iguiente ateador/button
                button onclick"cancelelection()" style"background #dc color white padding .rem rem border none border-radius px"❌ ancelar/button
            /div
        `
    }
}

// unción para cancelar selección
function cancelelection() {
    const confirmation  document.getlementyd('cascade-confirmation')
    if (confirmation) {
        confirmation.style.display  'none'
    }
}

// esolver opción seleccionada de cascada
function resolveascadeption(option) {
    console.log(`🎯 pción seleccionada ${option}`)

    // quí es donde aparecería el dado flotante
    //  mplementar dado flotante en el aso 

    // or ahora, solo registrar la selección
    console.log(`✅ pción ${option} registrada`)

    // ostrar botón de confirmación para siguiente bateador
    showextatteronfirmation(option)
}

// ostrar el botón de confirmación para avanzar al siguiente bateador
function showextatteronfirmation(selectedption) {
    const confirmation  document.getlementyd('cascade-confirmation')
    const confirmationext  document.getlementyd('confirmation-text')

    if (confirmation && confirmationext) {
        // ersonalizar el mensaje según la opción seleccionada
        const optionessages  {
            'roll-oddity' 'ddity procesado. ¿ontinuar al siguiente bateador',
            'roll-hit-table-critical' 'ritical it resuelto. ¿ontinuar al siguiente bateador',
            'roll-hit-table' 'it procesado. ¿ontinuar al siguiente bateador',
            'batter-walk' 'ase por bolas completada. ¿ontinuar al siguiente bateador',
            'roll-defense' 'erificación defensiva completada. ¿ontinuar al siguiente bateador',
            'productive-out-' 'ut productivo resuelto. ¿ontinuar al siguiente bateador',
            'productive-out-' 'ut productivo resuelto. ¿ontinuar al siguiente bateador',
            'normal-out' 'ut completado. ¿ontinuar al siguiente bateador',
            'triple-play-out' 'riple play procesado. ¿ontinuar al siguiente bateador'
        }

        const message  optionessagesselectedption] || 'ugada resuelta. ¿ontinuar al siguiente bateador'
        confirmationext.textontent  message

        confirmation.style.display  'block'

        console.log(`🎯 otón de confirmación mostrado ${message}`)
    }
}

// onfirmar jugada y avanzar al siguiente bateador
function confirmndextatter() {
    console.log(`🔄 onfirmando jugada y avanzando al siguiente bateador...`)

    // eterminar si fue out para procesar outs/innings
    const currentoll  gametate.currenticeoll
    let wasut  false

    if (currentoll) {
        // asado en los rangos de la tabla
        if ((currentoll   && currentoll  ) ||
            (currentoll   && currentoll  ) ||
            (currentoll   && currentoll  ) ||
            (currentoll  )) {
            wasut  true
        }
    }

    // rocesar outs si corresponde
    if (wasut) {
        gametate.outs++
        console.log(`📊 ut registrado. otal outs ${gametate.outs}`)

        if (gametate.outs  ) {
            console.log(`🔄 ambio de inning`)
            changenning()
        } else {
            console.log(`➡️ vanzar al siguiente bateador`)
            nextatter()
        }
    } else {
        console.log(`➡️ it/alk - vanzar al siguiente bateador`)
        nextatter()
    }

    //    (  )
    console.log(`🧹  tirada actual -  datos del juego...`)

    //  ás tarde -  la tirada actual en un registro/historial de bateadores
    // const baterecord  {
    //     batter geturrentatter(),
    //     diceoll gametate.currenticeoll,
    //     result selectedption,
    //     inning gametate.currentnning,
    //     timestamp ate.now()
    // }
    // gametate.batteristory.push(baterecord) //  Á 

    // .   los dados (pero mantener datos)
    hideurrenticeesults()

    // .  campos de dados del lanzador y bateador (preparar para siguiente turno)
    console.log(`🧹 impiando campos de dados para siguiente bateador...`)

    const dicenputds  
        'pitcher-dice-value',
        'batter-dice-value',
        'pitcher-dice-value-local',
        'batter-dice-value-local'
    ]

    dicenputds.forach(id  {
        const input  document.getlementyd(id)
        if (input) {
            input.value  ''
            console.log(`✅ ampo de dados limpiado ${id}`)
        }
    })

    // .  totales mostrados (el número grande que se ve)
    const finalesultds  
        'final-result',
        'final-result-local'
    ]

    finalesultds.forach(id  {
        const resultlement  document.getlementyd(id)
        if (resultlement) {
            resultlement.textontent  '-'
            console.log(`✅ otal limpiado ${id}`)
        }
    })

    // .  descripciones de resultados (preparar para nueva tirada)
    const resultescriptionds  
        'dice-result-description',
        'dice-result-description-local'
    ]

    resultescriptionds.forach(id  {
        const description  document.getlementyd(id)
        if (description) {
            description.textontent  'sperando tirada...'
            console.log(`✅ escripción limpiada ${id}`)
        }
    })

    // .  la cascada visual (pero conservar el estado del juego)
    resetascadeystemomplete()

    // .  variables de la tirada actual (preparar para siguiente bateador)
    gametate.currenticeoll  null
    gametate.lastolletails  null

    // .  display (mantiene marcador, innings, etc.)
    updateameisplay()
    updateiceystemosition()

    // .     para el próximo bateador
    console.log('🎯 ostrando selector de intenciones para el próximo bateador...')
    resetntentionelector()
}

// Ó  - olo oculta dados específicos,  elementos del  principal
function hidelliceverywhere() {
    console.log(`🧹 eseteo selectivo de dados ( elementos principales)`)

    // . ista específica de s de dados (solo estos)
    const specificiceds  
        'dice-results-display',
        'dice-results-display-local',
        'dice-container-visitante',
        'dice-container-local'
    ]

    specificiceds.forach(id  {
        const element  document.getlementyd(id)
        if (element) {
            element.style.display  'none'
            console.log(`✅ cultado  específico ${id}`)
        }
    })

    // . olo contenedores dinámicos de dados (con clase específica)
    const dynamiciceontainers  document.queryelectorll('.dynamic-dice-container')
    dynamiciceontainers.forach(container  {
        container.style.display  'none'
        console.log(`✅ ontenedor dinámico ocultado`, container.id)
    })

    // .   elementos principales del  (evitar pantalla en blanco)
    //  buscar por texto - puede ocultar elementos importantes

    console.log(`🎉 eseteo selectivo completado ( principal intacto)`)
}

// esetear completamente el sistema de cascada
function resetascadeystem() {
    // cultar confirmación
    const confirmation  document.getlementyd('cascade-confirmation')
    if (confirmation) {
        confirmation.style.display  'none'
    }

    // cultar dropdown
    hideascadeystem()

    // esetear resultado inicial
    const initialesult  document.getlementyd('initial-result')
    if (initialesult) {
        initialesult.textontent  '-'
    }

    // esetear estado
    const cascadetatus  document.getlementyd('cascade-current-action')
    if (cascadetatus) {
        cascadetatus.textontent  'istema activo - sperando tirada...'
    }

    //  ocultar resultados de dados - deben permanecer visibles hasta el reset
    // as tiradas permanecen visibles para referencia

    // impiar tirada actual
    gametate.currenticeoll  null

    console.log(`🔄 istema de cascada completamente reseteado`)
}

// eseteo  del sistema para "iguiente ateador"
function resetascadeystemomplete() {
    console.log(`🧹 niciando reseteo completo del sistema...`)

    // .    Ó
    const confirmation  document.getlementyd('cascade-confirmation')
    if (confirmation) {
        confirmation.style.display  'none'
        console.log(`✅ onfirmación ocultada`)
    }

    // .    /
    hideascadeystem()
    console.log(`✅ istema de cascada ocultado`)

    // .   
    const initialesult  document.getlementyd('initial-result')
    if (initialesult) {
        initialesult.textontent  '-'
        console.log(`✅ esultado inicial reseteado`)
    }

    // .    
    const cascadetatus  document.getlementyd('cascade-current-action')
    if (cascadetatus) {
        cascadetatus.textontent  'istema activo - sperando tirada...'
        console.log(`✅ stado de cascada reseteado`)
    }

    // .      
    const cascadeptions  document.getlementyd('cascade-options')
    if (cascadeptions) {
        cascadeptions.inner  ''
        console.log(`✅ pciones de cascada limpiadas`)
    }

    // .    
    if (window.currentascadeevel) {
        window.currentascadeevel  
        console.log(`✅ ivel de cascada reseteado`)
    }

    // .      
    const swingables  document.queryelectorll('.swing-result-table')
    swingables.forach(table  {
        if (table.parentlement) {
            table.parentlement.style.display  'none'
        }
    })
    console.log(`✅ ablas de swing result ocultadas`)

    // .    
    const cascaderopdown  document.getlementyd('cascade-dropdown')
    if (cascaderopdown) {
        cascaderopdown.style.display  'none'
        cascaderopdown.inner  ''
        console.log(`✅ ropdown de cascada limpiado`)
    }

    console.log(`🎉 eseteo completo finalizado`)
}

//      (para siguiente bateador) -    
function hideurrenticeesults() {
    console.log(`🧹 cultando tirada actual (conservando datos del juego)...`)

    const team  gametate.isopalf  'visitante'  'local'

    // uscar elementos de dados del equipo actual solamente
    const resultsisplay  document.getlementyd(`dice-results-display${team  'local'  '-local'  ''}`)
    if (resultsisplay) {
        resultsisplay.style.display  'none'
        console.log(`✅ esultados de dados ocultados para ${team}`)
    }

    // uscar contenedores dinámicos de dados Á  solamente (   )
    const dynamicontainers  document.queryelectorll('.dynamic-dice-containernot(.intention-selector)')
    let hiddenount  
    dynamicontainers.forach(container  {
        // olo ocultar los  más recientes (no todo el historial)
        if (hiddenount   && container.style.display ! 'none') {
            container.style.display  'none'
            hiddenount++
            console.log(`✅ ontenedor dinámico reciente ocultado`)
        }
    })

    console.log(`🎯 irada actual limpiada (datos del juego conservados)`)

    // ostrar selector de intenciones para el siguiente bateador
    // (olo si no es un reinicio completo)
    setimeout(()  {
        resetntentionelector()
        console.log('🎯 elector de intenciones mostrado para siguiente bateador')
    }, )
}

//    Ó   

/**
 * aneja la selección de intención del bateador
 * param {string} intention - a intención seleccionada ('normal', 'steal', 'bunt', 'hitrun')
 */
function selectntention(intention) {
    console.log(`🎯 ntención seleccionada ${intention}`)

    // uardar la intención en el gametate para uso futuro
    gametate.currentntention  intention

    switch (intention) {
        case 'normal'
            // atear ormal ostrar sistema de dados
            console.log('⚾ ctivando sistema de bateo normal...')
            showiceystem()
            break

        case 'steal'
            console.log('🏃‍♂️ ntención de robar base seleccionada')
            showtealaseystem()
            break

        case 'bunt'
            console.log('🤏 ntención de toque/bunt seleccionada')
            alert('🤏 istema de toque/bunt - or implementar')
            break

        case 'hitrun'
            console.log('⚡ ntención de hit & run seleccionada')
            alert('⚡ istema de hit & run - or implementar')
            break

        default
            console.error(`❌ ntención desconocida ${intention}`)
    }
}

/**
 * unción simple para mostrar el sistema de dados y ocultar el selector
 */
function showiceystem() {
    console.log('🎲 ] ostrando sistema de dados...')

    const intentionontainer  document.getlementyd('intention-container-visitante')
    const diceontainer  document.getlementyd('dice-container-visitante')

    console.log('   - intentionontainer encontrado', !!intentionontainer)
    console.log('   - diceontainer encontrado', !!diceontainer)

    //   cultar selector de manera agresiva
    if (intentionontainer) {
        intentionontainer.style.cssext  'display none !important opacity  !important visibility hidden !important'
        console.log('✅ elector  ocultado')
    }

    //   ostrar dados de manera súper agresiva
    if (diceontainer) {
        // emover cualquier estilo inline que pueda estar ocultando
        diceontainer.removettribute('style')

        // plicar estilos forzados
        diceontainer.style.cssext  `
            display block !important 
            opacity  !important 
            visibility visible !important 
            position relative !important 
            z-index  !important
            background linear-gradient(deg, #a %, #fa %) !important
            border-radius px !important
            border px solid # !important
            margin-top rem !important
            padding .rem !important
        `

        // orzar visibilidad de contenido interno
        const diceystem  diceontainer.queryelector('.dice-system')
        if (diceystem) {
            diceystem.style.cssext  'display block !important opacity  !important visibility visible !important'
            console.log('✅ istema de dados interno  visible')
        }

        // orzar visibilidad de todos los elementos hijos
        const allhildren  diceontainer.queryelectorll('*')
        allhildren.forach(child  {
            if (child.style.display  'none') {
                child.style.display  ''
            }
        })

        console.log('✅ istema de dados  mostrado')
        console.log('   - isplay final', diceontainer.style.display)
        console.log('   - pacity final', diceontainer.style.opacity)
        console.log('   - isibility final', diceontainer.style.visibility)

        // erificar que realmente esté visible
        setimeout(()  {
            const computedtyle  window.getomputedtyle(diceontainer)
            console.log('🔍 stilo computado final', {
                display computedtyle.display,
                opacity computedtyle.opacity,
                visibility computedtyle.visibility
            })
        }, )

    } else {
        console.error('❌ o se encontró dice-container-visitante')
        // uscar contenedores similares
        const similarontainers  document.queryelectorll('id*"dice"]')
        console.log('🔍 ontenedores con "dice" encontrados', similarontainers.length)
        similarontainers.forach((container, index)  {
            console.log(`   - ${index} ${container.id} (display ${container.style.display})`)
        })
    }
}

/**
 * ctiva el sistema de dados normal (el que ya existía)
 */
function showormaliceystem() {
    console.log('🎲 ctivando sistema de dados normal...')

    const diceontainer  document.getlementyd('dice-container-visitante')

    if (!diceontainer) {
        console.error('❌ o se encontró el contenedor de dados')
        return
    }

    // segurarse de que el contenedor de dados esté visible
    diceontainer.style.display  'block'
    diceontainer.style.opacity  ''
    diceontainer.style.transform  'translate(px)'
    diceontainer.style.transition  'all .s ease-out'

    // nimar la entrada del sistema de dados
    setimeout(()  {
        diceontainer.style.opacity  ''
        diceontainer.style.transform  'translate()'
    }, )

    // argar el sistema de dados normal si no está cargado
    if (!diceontainer.inner.trim()) {
        console.log('🔄 argando sistema de dados normal...')
        // quí podríamos llamar a la función que ya existe para cargar el sistema de dados
        // or ahora, asumamos que ya está cargado en el 
    }

    console.log('✅ istema de dados normal activado')
}

/**
 * esetea el selector de intenciones (para volver a mostrar las opciones)
 */
/**
 * unción simple para mostrar el selector de intenciones y ocultar dados
 */
function showntentionelector() {
    console.log('🎯 ] ostrando selector de intenciones...')

    const intentionontainer  document.getlementyd('intention-container-visitante')
    const diceontainer  document.getlementyd('dice-container-visitante')

    //   cultar dados de manera agresiva
    if (diceontainer) {
        diceontainer.style.cssext  'display none !important opacity  !important visibility hidden !important'
        console.log('✅ istema de dados  ocultado')
    }

    //   ostrar selector de manera súper agresiva
    if (intentionontainer) {
        // emover cualquier estilo inline que pueda estar ocultando
        intentionontainer.removettribute('style')

        // plicar estilos forzados
        intentionontainer.style.cssext  `
            display block !important 
            opacity  !important 
            visibility visible !important 
            position relative !important 
            z-index  !important
        `

        // orzar visibilidad de todos los botones internos
        const buttons  intentionontainer.queryelectorll('button')
        buttons.forach(button  {
            button.style.cssext  'display block !important opacity  !important visibility visible !important'
        })

        console.log('✅ elector de intenciones  mostrado')

        // erificar que realmente esté visible
        setimeout(()  {
            const computedtyle  window.getomputedtyle(intentionontainer)
            console.log('🔍 stilo computado del selector', {
                display computedtyle.display,
                opacity computedtyle.opacity,
                visibility computedtyle.visibility
            })
        }, )

    } else {
        console.error('❌ o se encontró intention-container-visitante')

        // uscar contenedores similares
        const similarontainers  document.queryelectorll('id*"intention"]')
        console.log('🔍 ontenedores con "intention" encontrados', similarontainers.length)
        similarontainers.forach((container, index)  {
            console.log(`   - ${index} ${container.id} (display ${container.style.display})`)
        })
    }

    // impiar la intención del gametate
    gametate.currentntention  null
    console.log('🧹 stado de intención limpiado')
    
    //  alidar y actualizar opciones disponibles
    setimeout(()  {
        updatententionelector()
        console.log('🎯 alidación de opciones aplicada')
    }, ) // elay para asegurar que el  está completamente renderizado
}

/**
 * esetea el selector de intenciones (alias para compatibilidad)
 */
function resetntentionelector() {
    console.log('🔄 eseteando selector de intenciones...')
    showntentionelector()
    console.log('✅ elector de intenciones reseteado')
}

//       

/**
 * istema principal de robo de bases
 * etecta corredores en bases y presenta opciones de robo
 */
function showtealaseystem() {
    console.log('🏃‍♂️ niciando sistema de robo de bases...')

    // cultar selector de intenciones
    const intentionontainer  document.getlementyd('intention-container-visitante')
    if (intentionontainer) {
        intentionontainer.style.display  'none'
        console.log('✅ elector de intenciones ocultado')
    }

    // etectar corredores disponibles para robar
    const availableunners  detectvailableunners()

    if (availableunners.length  ) {
        // o hay corredores en base
        alert('🚫 o hay corredores en base para intentar robo')
        showntentionelector() // olver al selector
        return
    }

    // ostrar interfaz de selección de robo
    showtealelectionnterface(availableunners)
}

/**
 * etecta qué corredores están disponibles para robar bases
 * mplementa las  tablas de robo , ,  (+), oble robo
 */
function detectvailableunners() {
    const runners  ]

    console.log('🔍 etectando corredores en bases', gametate.bases)

    //   orredor en primera base → segunda base
    if (gametate.bases.first ! null) {
        runners.push({
            runner gametate.bases.first,
            fromase 'first',
            toase 'second',
            stealype 'first_to_second',
            displayame 'ª → ª ase',
            icon '🥇➡️🥈',
            table 'abla  obo de ª'
        })
        console.log('✅ orredor en ª base (abla  obo de ª)')
    }

    //   orredor en segunda base → tercera base
    if (gametate.bases.second ! null) {
        runners.push({
            runner gametate.bases.second,
            fromase 'second',
            toase 'third',
            stealype 'second_to_third',
            displayame 'ª → ª ase',
            icon '🥈➡️🥉',
            table 'abla  obo de ª'
        })
        console.log('✅ orredor en ª base (abla  obo de ª)')
    }

    //   orredor en tercera base → home (solo con trait +)
    if (gametate.bases.third ! null) {
        const thirdaseunner  gametate.bases.third
        //  erificar trait + cuando implementemos traits
        const haslusrait  thirdaseunner.traits.includes('+') || false

        if (haslusrait) {
            runners.push({
                runner thirdaseunner,
                fromase 'third',
                toase 'home',
                stealype 'third_to_home',
                displayame 'ª → ome (+)',
                icon '🥉➡️🏠',
                table 'abla  obo de ome',
                requiresrait '+'
            })
            console.log('✅ orredor en ª base con + (abla  obo de ome)')
        } else {
            console.log('⚠️ orredor en ª base  trait + - no puede robar home')
        }
    }

    //   oble robo (corredores en ª y ª simultáneamente)
    if (gametate.bases.first ! null && gametate.bases.second ! null) {
        runners.push({
            runner null, // últiples corredores
            runners gametate.bases.first, gametate.bases.second],
            fromase 'first_and_second',
            toase 'second_and_third',
            stealype 'double_steal',
            displayame 'oble obo (ª→ª, ª→ª)',
            icon '🥇🥈➡️🥈🥉',
            table 'abla  oble obo'
        })
        console.log('✅ oble robo disponible (abla )')
    }

    console.log(`🏃‍♂️ otal opciones de robo ${runners.length}`)
    return runners
}

/**
 * uestra la interfaz de selección de robo con los corredores disponibles
 */
function showtealelectionnterface(availableunners) {
    console.log('🎯 ostrando interfaz de selección de robo...')

    // btener o crear contenedor para el sistema de robo
    const diceontainer  document.getlementyd('dice-container-visitante')

    if (!diceontainer) {
        console.error('❌ o se encontró contenedor de dados')
        return
    }

    // rear  para la interfaz de robo
    const steal  createtealnterface(availableunners)

    // eemplazar contenido del contenedor de dados
    diceontainer.inner  steal

    // ostrar el contenedor
    diceontainer.style.cssext  `
        display block !important 
        opacity  !important 
        visibility visible !important 
        position relative !important 
        z-index  !important
    `

    console.log('✅ nterfaz de robo de bases mostrada')
}

/**
 * rea el  para la interfaz de selección de robo
 */
function createtealnterface(availableunners) {
    let runners  ''

    availableunners.forach((runner, index)  {
        // nformación del corredor/corredores
        let runnernfo  ''
        if (runner.stealype  'double_steal') {
            runnernfo  `
                div class"steal-runners"
                    smallª ase ${runner.runners].name || 'esconocido'}/smallbr
                    smallª ase ${runner.runners].name || 'esconocido'}/small
                /div
            `
        } else {
            runnernfo  `smallorredor ${runner.runner.name || 'esconocido'}/small`
        }

        // ndicador de trait requerido
        const traitndicator  runner.requiresrait 
            `span class"trait-required"⭐ equiere ${runner.requiresrait}/span`  ''

        runners + `
            div class"steal-option" onclick"selecttealttempt('${runner.fromase}', '${runner.toase}', ${index})"
                div class"steal-option-header"
                    div class"steal-icon"${runner.icon}/div
                    div class"steal-table-info"
                        small class"steal-table-name"${runner.table}/small
                    /div
                /div
                div class"steal-description"
                    strong${runner.displayame}/strong
                    ${runnernfo}
                    ${traitndicator}
                /div
            /div
        `
    })

    return `
        div class"steal-base-system"
            div class"steal-header"
                h🏃‍♂️ elecciona el ipo de obo/h
                plige qué corredor(es) intentará(n) robar base/p
                small class"text-muted"ada opción usa una tabla de robo diferente/small
            /div
            
            div class"steal-runners-grid"
                ${runners}
            /div
            
            div class"steal-actions"
                button class"btn btn-secondary" onclick"canceltealttempt()"
                    ↩️ ancelar
                /button
            /div
        /div
    `
}

/**
 * aneja la selección de un intento de robo específico
 */
function selecttealttempt(fromase, toase, runnerndex) {
    console.log(`🎯 ntento de robo seleccionado ${fromase} → ${toase}`)

    const availableunners  detectvailableunners()
    const selectedteal  availableunnersrunnerndex]

    // uardar información del robo en el gametate
    gametate.currenttealttempt  {
        fromase fromase,
        toase toase,
        runnerndex runnerndex,
        stealype selectedteal.stealype,
        table selectedteal.table,
        runner selectedteal.runner,
        runners selectedteal.runners // ara doble robo
    }

    console.log('💾 nformación del robo guardada', gametate.currenttealttempt)

    // ostrar sistema de dados para el robo
    showtealiceystem(selectedteal)
}

/**
 * ancela el intento de robo y vuelve al selector de intenciones
 */
function canceltealttempt() {
    console.log('❌ ntento de robo cancelado')

    // impiar información del robo
    gametate.currenttealttempt  null

    // olver al selector de intenciones
    showntentionelector()
}

/**
 * unción temporal para probar el sistema de robo con corredores ficticios
 */
function testtealystem() {
    console.log('🧪 onfigurando corredores de prueba para el sistema de robo...')

    // gregar corredores ficticios para probar
    gametate.bases.first  { name 'orredor ª', traits ] }
    gametate.bases.second  { name 'orredor ª', traits ] }
    gametate.bases.third  { name 'orredor ª +', traits '+'] }

    console.log('✅ orredores de prueba configurados', gametate.bases)

    // ostrar el sistema de robo
    showtealaseystem()
}

/**
 * btiene la información del dado según el tipo de robo
 *   d,   d-,   d-,   d
 */
function geticenfoortealype(stealype) {
    switch (stealype) {
        case 'first_to_second'
            return {
                description 'd',
                range '-',
                min ,
                max ,
                modifier null
            }

        case 'second_to_third'
            return {
                description 'd-',
                range '- (luego -)',
                min ,
                max ,
                modifier '- al resultado'
            }

        case 'third_to_home'
            return {
                description 'd- (+ requerido)',
                range '- (luego -)',
                min ,
                max ,
                modifier '- al resultado, olo con trait +'
            }

        case 'double_steal'
            return {
                description 'd (oble obo)',
                range '-',
                min ,
                max ,
                modifier 'fecta ambos corredores'
            }

        default
            return {
                description 'd',
                range '-',
                min ,
                max ,
                modifier null
            }
    }
}

/**
 * aneja la tirada del dado para el intento de robo
 * imilar al sistema de dados normal pero con lógica específica de robo
 */
function rolltealttempt() {
    console.log('🎲 jecutando tirada de robo...')

    const dicenput  document.getlementyd('steal-dice-value')
    const resultrea  document.getlementyd('steal-result-area')
    const resultext  document.getlementyd('steal-result-text')

    if (!dicenput || !resultrea || !resultext) {
        console.error('❌ o se encontraron elementos de la interfaz')
        return
    }

    const dicealue  parsent(dicenput.value)
    const stealnfo  gametate.currenttealttempt
    const dicenfo  geticenfoortealype(stealnfo.stealype)

    if (!dicealue || dicealue  dicenfo.min || dicealue  dicenfo.max) {
        alert(`⚠️ or favor ingresa un valor de dado válido (${dicenfo.range})`)
        return
    }

    // plicar modificador para d- en segunda a tercera  tercera a home
    let finalalue  dicealue
    if (stealnfo.stealype  'second_to_third' || stealnfo.stealype  'third_to_home') {
        finalalue  ath.max(, dicealue - ) // d-, mínimo 
        console.log(`🔧 plicando modificador d- ${dicealue} -   ${finalalue}`)
    }

    console.log(`🎲 alor del dado ${dicealue}, alor final ${finalalue}`)

    // valuar resultado del robo (por ahora sistema básico)
    const isuccessful  evaluatetealesult(finalalue, stealnfo.stealype)

    // ostrar resultado
    resultrea.style.display  'block'

    if (isuccessful) {
        resultext.inner  `
            div class"alert alert-success"
                strong✅  !/strongbr
                ${getuccessessage(stealnfo)}
                brsmallado ${dicealue}${(stealnfo.stealype  'second_to_third' || stealnfo.stealype  'third_to_home')  ` -   ${finalalue}`  `  ${finalalue}`}/small
            /div
        `
        
        console.log('✅ obo exitoso')
        
    } else {
        resultext.inner  `
            div class"alert alert-danger"
                strong❌  !/strongbr
                ${getailureessage(stealnfo)}
                brsmallado ${dicealue}${(stealnfo.stealype  'second_to_third' || stealnfo.stealype  'third_to_home')  ` -   ${finalalue}`  `  ${finalalue}`}/small
            /div
        `
        
        console.log('❌ obo fallido')
    }
    
    // gregar botón para continuar
    resultext.inner + `
        div class"steal-continue"
            button class"btn btn-primary" onclick"finishtealttempt(${isuccessful})"
                ⚾ ontinuar uego
            /button
        /div
    `
}

/**
 * valúa si el robo fue exitoso basado en el valor del dado
 * or ahora sistema básico, después implementaremos las tablas reales
 */
function evaluatetealesult(finalalue, stealype) {
    // istema básico temporal valores bajos  exitoso
    switch (stealype) {
        case 'first_to_second'
            return finalalue   // - exitoso en d
        case 'second_to_third'
            return finalalue   // - exitoso en d-
        case 'third_to_home'
            return finalalue   // - exitoso en d- (más difícil que segunda a tercera)
        case 'double_steal'
            return finalalue   // - exitoso en d
        default
            return finalalue  
    }
}

/**
 * enera mensaje de éxito según el tipo de robo
 */
function getuccessessage(stealnfo) {
    switch (stealnfo.stealype) {
        case 'first_to_second'
            return `l corredor ${stealnfo.runner.name} llega seguro a segunda base.`
        case 'second_to_third'
            return `l corredor ${stealnfo.runner.name} llega seguro a tercera base.`
        case 'third_to_home'
            return `¡! ${stealnfo.runner.name} anota desde tercera base.`
        case 'double_steal'
            return `¡oble robo exitoso! mbos corredores avanzan una base.`
        default
            return `obo exitoso.`
    }
}

/**
 * enera mensaje de fallo según el tipo de robo
 */
function getailureessage(stealnfo) {
    switch (stealnfo.stealype) {
        case 'first_to_second'
            return `${stealnfo.runner.name} es eliminado intentando robar segunda base.`
        case 'second_to_third'
            return `${stealnfo.runner.name} es eliminado intentando robar tercera base.`
        case 'third_to_home'
            return `${stealnfo.runner.name} es eliminado intentando robar home.`
        case 'double_steal'
            return `oble robo fallido. mbos corredores son eliminados.`
        default
            return `obo fallido. l corredor es eliminado.`
    }
}

/**
 * inaliza el intento de robo y actualiza el estado del juego
 */
function finishtealttempt(wasuccessful) {
    console.log(`🏁 inalizando robo. xitoso ${wasuccessful}`)
    
    const stealnfo  gametate.currenttealttempt
    
    if (wasuccessful) {
        //   ctualizar bases
        handleuccessfulteal(stealnfo)
    } else {
        //   liminar corredor(es) y agregar out(s)
        handleailedteal(stealnfo)
    }
    
    // impiar información del robo
    gametate.currenttealttempt  null
    
    // ctualizar display del juego
    updateameisplay()
    
    // olver al selector de intenciones para continuar el juego
    console.log('🔄 olviendo al selector de intenciones...')
    showntentionelector()
}

/**
 * aneja un robo exitoso actualizando las posiciones de los corredores
 */
function handleuccessfulteal(stealnfo) {
    console.log('✅ rocesando robo exitoso...')
    
    switch (stealnfo.stealype) {
        case 'first_to_second'
            gametate.bases.first  null
            gametate.bases.second  stealnfo.runner
            console.log(`📍 ${stealnfo.runner.name} movido a segunda base`)
            break
            
        case 'second_to_third'
            gametate.bases.second  null
            gametate.bases.third  stealnfo.runner
            console.log(`📍 ${stealnfo.runner.name} movido a tercera base`)
            break
            
        case 'third_to_home'
            gametate.bases.third  null
            //  notar carrera en el marcador
            console.log(`🏠 ¡! ${stealnfo.runner.name} anota desde tercera base`)
            break
            
        case 'double_steal'
            // over ambos corredores
            const runnerromst  gametate.bases.first
            const runnerromnd  gametate.bases.second
            
            gametate.bases.first  null
            gametate.bases.second  runnerromst
            gametate.bases.third  runnerromnd
            
            console.log(`📍 oble robo ${runnerromst.name} → ª, ${runnerromnd.name} → ª`)
            break
    }
}

/**
 * aneja un robo fallido eliminando corredores y agregando outs
 */
function handleailedteal(stealnfo) {
    console.log('❌ rocesando robo fallido...')
    
    switch (stealnfo.stealype) {
        case 'first_to_second'
        case 'second_to_third'
        case 'third_to_home'
            // liminar corredor de la base
            gametate.basesstealnfo.fromase]  null
            gametate.outs++
            console.log(`❌ ${stealnfo.runner.name} eliminado. uts ${gametate.outs}`)
            break
            
        case 'double_steal'
            // n doble robo fallido, eliminar ambos corredores
            gametate.bases.first  null
            gametate.bases.second  null
            gametate.outs +  // oble eliminación
            console.log(`❌ oble eliminación. uts ${gametate.outs}`)
            break
    }
    
    // erificar si hay  outs para cambiar inning
    if (gametate.outs  ) {
        console.log('🔄  outs alcanzados - cambio de inning necesario')
        //  mplementar cambio de inning
    }
}

/**
 * aneja la selección de un intento de robo específico
 */
function selecttealttempt(fromase, toase, runnerndex) {
    console.log(`🎯 ntento de robo seleccionado ${fromase} → ${toase}`)
    
    // uardar información del robo en el gametate
    gametate.currenttealttempt  {
        fromase fromase,
        toase toase,
        runnerndex runnerndex,
        runner gametate.basesfromase]
    }
    
    console.log('💾 nformación del robo guardada', gametate.currenttealttempt)
    
    // ostrar sistema de dados para el robo
    showtealiceystem(fromase, toase)
}

/**
 * ancela el intento de robo y vuelve al selector de intenciones
 */
function canceltealttempt() {
    console.log('❌ ntento de robo cancelado')
    
    // impiar información del robo
    gametate.currenttealttempt  null
    
    // olver al selector de intenciones
    showntentionelector()
}

/**
 * uestra el sistema de dados específico para robo de bases
 */
function showtealiceystem(fromase, toase) {
    console.log(`🎲 ostrando sistema de dados para robo ${fromase} → ${toase}`)
    
    const diceontainer  document.getlementyd('dice-container-visitante')
    
    if (!diceontainer) {
        console.error('❌ o se encontró contenedor de dados')
        return
    }
    
    // rear  para el sistema de dados de robo
    const stealice  createtealice(fromase, toase)
    
    // eemplazar contenido
    diceontainer.inner  stealice
    
    console.log('✅ istema de dados de robo mostrado')
}

/**
 * rea el  para el sistema de dados de robo
 */
function createtealice(fromase, toase) {
    const stealnfo  gametate.currenttealttempt
    const baseames  {
        'first' 'ª ase',
        'second' 'ª ase', 
        'third' 'ª ase',
        'home' 'ome'
    }
    
    return `
        div class"steal-dice-system"
            div class"steal-dice-header"
                h🏃‍♂️ ntento de obo ${baseamesfromase]} → ${baseamestoase]}/h
                pstrongorredor/strong ${stealnfo.runner.name || 'esconocido'}/p
            /div
            
            div class"steal-dice-controls"
                div class"dice-input-group"
                    label for"steal-dice-value"🎲 esultado del ado/label
                    input type"number" id"steal-dice-value" min"" max"" placeholder"-"
                /div
                
                button class"btn btn-primary steal-roll-btn" onclick"rolltealttempt()"
                    🎲 irar ado de obo
                /button
            /div
            
            div class"steal-result-area" id"steal-result-area" style"display none"
                h📊 esultado del obo/h
                div id"steal-result-text"/div
            /div
            
            div class"steal-actions"
                button class"btn btn-secondary" onclick"canceltealttempt()"
                    ↩️ ancelar obo
                /button
            /div
        /div
    `
}