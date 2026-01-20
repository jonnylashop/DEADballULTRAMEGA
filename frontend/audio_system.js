// ===== SISTEMA DE AUDIO DEL JUEGO =====

const AudioSystem = {
    // Configuración
    enabled: true,
    musicVolume: 0.3,
    sfxVolume: 0.5,

    // Objetos de audio
    backgroundMusic: null,

    // URLs de efectos de sonido (usando recursos gratuitos de freesound.org o generados)
    sounds: {
        // Eventos principales
        strike: null,
        ball: null,
        hit: null,
        homerun: null,
        out: null,

        // Eventos especiales
        foul: null,
        walk: null,
        strikeout: null,
        catch: null,
        crowd_cheer: null,
        crowd_aww: null,

        // UI
        click: null,
        dice_roll: null
    },

    /**
     * Inicializar el sistema de audio
     */
    init() {
        console.log('🔊 Inicializando sistema de audio...');

        // Cargar configuración guardada
        const savedEnabled = localStorage.getItem('audioEnabled');
        const savedMusicVolume = localStorage.getItem('musicVolume');
        const savedSfxVolume = localStorage.getItem('sfxVolume');

        if (savedEnabled !== null) this.enabled = savedEnabled === 'true';
        if (savedMusicVolume !== null) this.musicVolume = parseFloat(savedMusicVolume);
        if (savedSfxVolume !== null) this.sfxVolume = parseFloat(savedSfxVolume);

        // Crear botón de pause dinámicamente
        this.createPauseButton();

        // Crear música de fondo (usando sonido sintético si no hay archivo)
        this.createBackgroundMusic();

        // Crear efectos de sonido sintéticos
        this.createSyntheticSounds();

        // Actualizar controles UI
        this.updateUI();

        console.log('✅ Sistema de audio inicializado');
    },

    /**
     * Crear botón flotante de pause
     */
    createPauseButton() {
        // Si ya existe, no crear otro
        if (document.getElementById('music-pause-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'music-pause-btn';
        btn.innerHTML = '⏸️';
        btn.style.cssText = `
            display: none;
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border: none;
            color: white;
            font-size: 28px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 9999;
            transition: all 0.3s ease;
        `;
        btn.onclick = () => this.toggleAudio();
        btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
        btn.onmouseout = () => btn.style.transform = 'scale(1)';

        document.body.appendChild(btn);
        console.log('✅ Botón de pause creado dinámicamente');
    },

    /**
     * Crear música de fondo
     */
    createBackgroundMusic() {
        // Intentar cargar archivo de audio, si no existe usar silencio
        this.backgroundMusic = new Audio();
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = this.musicVolume;

        // Intentar cargar música real
        this.backgroundMusic.src = 'audio/background.mp3';
        this.backgroundMusic.onerror = () => {
            console.log('⚠️ No se encontró música de fondo, continuando sin ella');
        };
    },

    /**
     * Crear efectos de sonido sintéticos usando Web Audio API
     */
    createSyntheticSounds() {
        // Strike - tono agudo corto
        this.sounds.strike = this.createBeep(800, 0.1, 'sine');

        // Ball - tono grave
        this.sounds.ball = this.createBeep(300, 0.15, 'sine');

        // Hit - sonido de impacto
        this.sounds.hit = this.createNoise(0.1, 'highpass');

        // Home Run - tono triunfal ascendente
        this.sounds.homerun = this.createSweep(400, 800, 0.5);

        // Out - tono descendente
        this.sounds.out = this.createSweep(600, 200, 0.3);

        // Foul - tono medio
        this.sounds.foul = this.createBeep(500, 0.12, 'square');

        // Walk - secuencia de tonos
        this.sounds.walk = this.createBeep(400, 0.2, 'sine');

        // Strikeout - sonido de swoosh
        this.sounds.strikeout = this.createNoise(0.15, 'lowpass');

        // Catch - pop corto
        this.sounds.catch = this.createBeep(600, 0.08, 'sine');

        // Crowd cheer - ruido blanco modulado
        this.sounds.crowd_cheer = this.createNoise(1.0, 'bandpass');

        // Crowd aww - tono descendente largo
        this.sounds.crowd_aww = this.createSweep(500, 200, 0.8);

        // Click UI
        this.sounds.click = this.createBeep(1000, 0.05, 'sine');

        // Dice roll
        this.sounds.dice_roll = this.createNoise(0.2, 'highpass');
    },

    /**
     * Crear un beep sintético
     */
    createBeep(frequency, duration, type = 'sine') {
        return () => {
            if (!this.enabled) return;

            const audioContext = new(window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    },

    /**
     * Crear un sweep (barrido de frecuencia)
     */
    createSweep(startFreq, endFreq, duration) {
        return () => {
            if (!this.enabled) return;

            const audioContext = new(window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);

            gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    },

    /**
     * Crear ruido blanco filtrado
     */
    createNoise(duration, filterType = 'lowpass') {
        return () => {
            if (!this.enabled) return;

            const audioContext = new(window.AudioContext || window.webkitAudioContext)();
            const bufferSize = audioContext.sampleRate * duration;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const output = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const noise = audioContext.createBufferSource();
            noise.buffer = buffer;

            const filter = audioContext.createBiquadFilter();
            filter.type = filterType;
            filter.frequency.value = filterType === 'highpass' ? 2000 : 1000;

            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);

            noise.start(audioContext.currentTime);
        };
    },

    /**
     * Reproducir efecto de sonido
     */
    play(soundName) {
        if (!this.enabled) return;

        const sound = this.sounds[soundName];
        if (sound && typeof sound === 'function') {
            try {
                sound();
                console.log(`🔊 Reproduciendo: ${soundName}`);
            } catch (error) {
                console.warn(`⚠️ Error reproduciendo ${soundName}:`, error);
            }
        }
    },

    /**
     * Iniciar música de fondo
     */
    playMusic() {
        console.log('🎵 playMusic() llamado. Enabled:', this.enabled, 'BackgroundMusic:', !!this.backgroundMusic);
        
        if (!this.enabled) {
            console.log('⚠️ Audio deshabilitado, no se reproduce música');
            return;
        }
        
        if (!this.backgroundMusic) {
            console.log('⚠️ No hay objeto backgroundMusic');
            return;
        }

        // Si ya está sonando, no volver a reproducir
        if (!this.backgroundMusic.paused) {
            console.log('🎵 Música ya está sonando');
            // Asegurar que el botón esté visible
            const pauseBtn = document.getElementById('music-pause-btn');
            if (pauseBtn) pauseBtn.style.display = 'block';
            return;
        }

        this.backgroundMusic.volume = this.musicVolume;
        
        console.log('🎵 Intentando reproducir música...');
        this.backgroundMusic.play().then(() => {
            // Mostrar botón flotante de pause cuando la música comience
            console.log('✅ ¡Música reproduciendo exitosamente!');
            const pauseBtn = document.getElementById('music-pause-btn');
            if (pauseBtn) {
                pauseBtn.style.display = 'block';
                console.log('✅ Botón de pause mostrado');
            } else {
                console.log('⚠️ No se encontró el botón de pause');
            }
        }).catch(error => {
            console.log('⚠️ Autoplay bloqueado:', error.message);
            console.log('👆 Haz clic en cualquier parte para activar la música.');

            // Intentar reproducir después de la primera interacción del usuario
            const playOnInteraction = () => {
                console.log('👆 Usuario interactuó, intentando reproducir música...');
                if (this.enabled && this.backgroundMusic && this.backgroundMusic.paused) {
                    this.backgroundMusic.play().then(() => {
                        console.log('✅ ¡Música activada tras interacción!');
                        const pauseBtn = document.getElementById('music-pause-btn');
                        if (pauseBtn) {
                            pauseBtn.style.display = 'block';
                            console.log('✅ Botón de pause mostrado');
                        }
                    }).catch(err => {
                        console.log('⚠️ No se pudo reproducir música:', err.message);
                    });
                }
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('keydown', playOnInteraction);
            };

            document.addEventListener('click', playOnInteraction, { once: true });
            document.addEventListener('keydown', playOnInteraction, { once: true });
        });
    },

    /**
     * Pausar música de fondo
     */
    pauseMusic() {
        console.log('⏸️ Intentando pausar música...');
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            console.log('✅ Música pausada. Estado paused:', this.backgroundMusic.paused);

            // Ocultar botón flotante de pause
            const pauseBtn = document.getElementById('music-pause-btn');
            if (pauseBtn) {
                pauseBtn.style.display = 'none';
                console.log('✅ Botón de pause ocultado');
            }
        } else {
            console.log('⚠️ No hay objeto backgroundMusic');
        }
    },

    /**
     * Alternar activación del audio
     */
    toggleAudio() {
        console.log('🎚️ toggleAudio() llamado. Estado actual enabled:', this.enabled);
        console.log('🎵 Estado actual música paused:', this.backgroundMusic ? this.backgroundMusic.paused : 'no existe');

        this.enabled = !this.enabled;
        localStorage.setItem('audioEnabled', this.enabled);

        if (!this.enabled) {
            console.log('❌ Desactivando audio...');
            this.pauseMusic();
            console.log('🔇 Audio desactivado');
        } else {
            console.log('✅ Activando audio...');
            // Intentar reproducir inmediatamente (ya hay interacción del usuario con el toggle)
            if (this.backgroundMusic) {
                this.backgroundMusic.volume = this.musicVolume;
                this.backgroundMusic.play().then(() => {
                    // Mostrar botón de pause
                    const pauseBtn = document.getElementById('music-pause-btn');
                    if (pauseBtn) pauseBtn.style.display = 'block';
                }).catch(error => {
                    console.log('⚠️ No se pudo reanudar música:', error.message);
                });
            }
            console.log('🔊 Audio activado');
        }

        this.updateUI();
    },

    /**
     * Ajustar volumen de música
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('musicVolume', this.musicVolume);

        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }

        this.updateUI();
    },

    /**
     * Ajustar volumen de efectos
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('sfxVolume', this.sfxVolume);
        this.updateUI();
    },

    /**
     * Actualizar controles de UI
     */
    updateUI() {
        const audioToggle = document.getElementById('audio-toggle');
        const musicSlider = document.getElementById('music-volume');
        const sfxSlider = document.getElementById('sfx-volume');
        const audioIcon = document.getElementById('audio-icon');
        const audioSlider = document.querySelector('.audio-slider');

        if (audioToggle) {
            audioToggle.checked = this.enabled;
        }

        // Actualizar el slider visual
        if (audioSlider) {
            if (this.enabled) {
                audioSlider.style.backgroundColor = '#4CAF50';
            } else {
                audioSlider.style.backgroundColor = '#ccc';
            }
        }

        if (musicSlider) {
            musicSlider.value = this.musicVolume * 100;
        }

        if (sfxSlider) {
            sfxSlider.value = this.sfxVolume * 100;
        }

        if (audioIcon) {
            audioIcon.textContent = this.enabled ? '🔊' : '🔇';
        }
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AudioSystem.init());
} else {
    AudioSystem.init();
}