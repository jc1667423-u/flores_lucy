/**
 * FLORES AMARILLAS PARA LUCY
 * Sistema interactivo: Canvas de pétalos dorados, sintetizador Web Audio,
 * sobre 3D con carta romántica y flores interactivas.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------
  // 1. ESTADO GLOBAL & ELEMENTOS DEL DOM
  // ----------------------------------------------------
  let flowerCount = 0;
  let isMusicPlaying = false;
  let audioCtx = null;
  let musicInterval = null;
  let noteIndex = 0;

  const canvas = document.getElementById('petal-canvas');
  const ctx = canvas.getContext('2d');

  const flowerCountEl = document.getElementById('flowerCount');
  const musicBtn = document.getElementById('musicBtn');
  const musicIcon = document.getElementById('musicIcon');
  const btnShower = document.getElementById('btnShower');
  const btnOpenLetter = document.getElementById('btnOpenLetter');
  const letterPaper = document.getElementById('letterPaper');
  const letterSection = document.getElementById('letterSection');
  const btnShineImage = document.getElementById('btnShineImage');
  const artworkCard = document.getElementById('artworkCard');
  const btnGlowBouquet = document.getElementById('btnGlowBouquet');

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');

  // ----------------------------------------------------
  // 2. CONFIGURACIÓN DEL CANVAS (Pétalos y Flores en Pantalla)
  // ----------------------------------------------------
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const sparkles = [];
  const bloomedFlowers = [];

  const PETAL_COLORS = [
    { start: '#fff3b0', mid: '#ffd60a', end: '#ffb703' },
    { start: '#ffe66d', mid: '#ffbe0b', end: '#fb8500' },
    { start: '#fff9a6', mid: '#ffea00', end: '#fdc500' },
    { start: '#ffdd00', mid: '#f39c12', end: '#e67e22' }
  ];

  // Clase Pétalo Flotante
  class Petal {
    constructor(x, y, isBurst = false) {
      this.x = x !== undefined ? x : Math.random() * width;
      this.y = y !== undefined ? y : Math.random() * -100;
      this.size = Math.random() * 12 + 10;
      this.color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];

      this.speedY = isBurst ? (Math.random() * -6 - 2) : (Math.random() * 1.5 + 1.2);
      this.speedX = isBurst ? (Math.random() * 8 - 4) : (Math.random() * 1.2 - 0.6);
      this.gravity = isBurst ? 0.15 : 0;

      this.angle = Math.random() * Math.PI * 2;
      this.angleSpeed = Math.random() * 0.03 + 0.01;
      this.sway = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.02 + 0.01;
      this.swayWidth = Math.random() * 1.8 + 0.8;

      this.opacity = Math.random() * 0.3 + 0.7;
      this.life = isBurst ? 240 : Infinity;
      this.age = 0;
    }

    update() {
      if (this.gravity > 0) {
        this.speedY += this.gravity;
      }
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.sway) * this.swayWidth;
      this.sway += this.swaySpeed;
      this.angle += this.angleSpeed;
      this.age++;

      // Si sobrepasa la parte inferior, reaparecer arriba si es pétalo ambiente
      if (this.y > height + 50) {
        if (this.life === Infinity) {
          this.y = -30;
          this.x = Math.random() * width;
        }
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.scale(Math.sin(this.sway), 1); // Efecto 3D de balanceo

      const grad = ctx.createLinearGradient(0, -this.size, 0, this.size);
      grad.addColorStop(0, this.color.start);
      grad.addColorStop(0.5, this.color.mid);
      grad.addColorStop(1, this.color.end);

      ctx.fillStyle = grad;
      ctx.globalAlpha = this.opacity;
      ctx.shadowColor = 'rgba(255, 214, 10, 0.4)';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      // Curva orgánica de pétalo
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(this.size * 0.6, -this.size * 0.4, this.size * 0.6, this.size * 0.4, 0, this.size);
      ctx.bezierCurveTo(-this.size * 0.6, this.size * 0.4, -this.size * 0.6, -this.size * 0.4, 0, -this.size);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  // Clase Destello / Polvo Dorado
  class Sparkle {
    constructor(x, y) {
      this.x = x !== undefined ? x : Math.random() * width;
      this.y = y !== undefined ? y : Math.random() * height;
      this.size = Math.random() * 3 + 1;
      this.maxSize = this.size + Math.random() * 2;
      this.speedY = Math.random() * -0.8 - 0.2;
      this.speedX = Math.random() * 0.6 - 0.3;
      this.alpha = Math.random() * 0.8 + 0.2;
      this.alphaSpeed = Math.random() * 0.02 + 0.01;
      this.growing = true;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;

      if (this.growing) {
        this.alpha += this.alphaSpeed;
        if (this.alpha >= 1) this.growing = false;
      } else {
        this.alpha -= this.alphaSpeed;
        if (this.alpha <= 0.1) this.growing = true;
      }

      if (this.y < 0) {
        this.y = height + 10;
        this.x = Math.random() * width;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = '#fff3b0';
      ctx.shadowColor = '#ffd60a';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Clase Flor Plantada al hacer clic
  class BloomedFlower {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.scale = 0;
      this.targetScale = Math.random() * 0.4 + 0.7; // tamaño variado
      this.rotation = Math.random() * Math.PI * 2;
      this.petalCount = 12;
      this.alpha = 1;
      this.life = 0;
      this.maxLife = 400; // duración en frames
    }

    update() {
      if (this.scale < this.targetScale) {
        this.scale += (this.targetScale - this.scale) * 0.12;
      }
      this.rotation += 0.005;
      this.life++;
      if (this.life > this.maxLife - 60) {
        this.alpha -= 0.016;
      }
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale, this.scale);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = Math.max(0, this.alpha);

      // Resplandor dorado de fondo
      const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 60);
      glowGrad.addColorStop(0, 'rgba(255, 214, 10, 0.7)');
      glowGrad.addColorStop(1, 'rgba(255, 183, 3, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.fill();

      // Pétalos dorados
      for (let i = 0; i < this.petalCount; i++) {
        ctx.save();
        ctx.rotate((i * (Math.PI * 2)) / this.petalCount);

        const petalGrad = ctx.createLinearGradient(0, 0, 0, -45);
        petalGrad.addColorStop(0, '#ffd60a');
        petalGrad.addColorStop(0.6, '#ffb703');
        petalGrad.addColorStop(1, '#fff3b0');

        ctx.fillStyle = petalGrad;
        ctx.shadowColor = 'rgba(255, 214, 10, 0.6)';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.ellipse(0, -25, 9, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Centro del girasol
      const centerGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 15);
      centerGrad.addColorStop(0, '#582f0e');
      centerGrad.addColorStop(0.8, '#331800');
      centerGrad.addColorStop(1, '#a66838');
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();

      // Anillo decorativo de polen
      ctx.strokeStyle = '#ffd60a';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Inicializar conjunto de partículas
  const INITIAL_PETALS_COUNT = 32;
  const INITIAL_SPARKLES_COUNT = 45;

  for (let i = 0; i < INITIAL_PETALS_COUNT; i++) {
    petals.push(new Petal());
  }

  for (let i = 0; i < INITIAL_SPARKLES_COUNT; i++) {
    sparkles.push(new Sparkle());
  }

  // Bucle de Animación
  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);

    // Dibujar y actualizar destellos
    for (let i = 0; i < sparkles.length; i++) {
      sparkles[i].update();
      sparkles[i].draw();
    }

    // Dibujar y actualizar flores plantadas
    for (let i = bloomedFlowers.length - 1; i >= 0; i--) {
      bloomedFlowers[i].update();
      bloomedFlowers[i].draw();
      if (bloomedFlowers[i].alpha <= 0) {
        bloomedFlowers.splice(i, 1);
      }
    }

    // Dibujar y actualizar pétalos
    for (let i = petals.length - 1; i >= 0; i--) {
      petals[i].update();
      petals[i].draw();

      if (petals[i].life !== Infinity && petals[i].age > petals[i].life) {
        petals.splice(i, 1);
      }
    }

    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  // ----------------------------------------------------
  // 3. SINTETIZADOR DE MÚSICA & CHIMES (Web Audio API Puro)
  // ----------------------------------------------------
  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Reproducir un tono tipo campana / caja de música
  function playBellTone(freq, time = 0, duration = 1.5, volume = 0.15) {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Timbre tipo campana con seno y armónico sutil
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + time);

    gain.gain.setValueAtTime(0.001, audioCtx.currentTime + time);
    gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + time + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime + time);
    osc.stop(audioCtx.currentTime + time + duration);
  }

  // Acordes arpegiados de la melodía de Flores Amarillas
  // Notas melódicas dulces (escala de Sol Mayor / Mi Menor)
  const MELODY_NOTES = [
    { freq: 392.00, dur: 0.8 }, // G4
    { freq: 440.00, dur: 0.6 }, // A4
    { freq: 493.88, dur: 0.8 }, // B4
    { freq: 587.33, dur: 1.2 }, // D5
    { freq: 523.25, dur: 0.8 }, // C5
    { freq: 493.88, dur: 0.8 }, // B4
    { freq: 440.00, dur: 1.0 }, // A4
    { freq: 392.00, dur: 1.4 }, // G4
    { freq: 659.25, dur: 1.0 }, // E5
    { freq: 587.33, dur: 1.2 }, // D5
    { freq: 493.88, dur: 0.8 }, // B4
    { freq: 523.25, dur: 0.8 }, // C5
    { freq: 587.33, dur: 1.4 }, // D5
    { freq: 440.00, dur: 1.6 }  // A4
  ];

  function startMusicLoop() {
    initAudio();
    isMusicPlaying = true;
    musicBtn.classList.add('playing');
    musicIcon.textContent = '⏸️';

    noteIndex = 0;
    function playNextNote() {
      if (!isMusicPlaying) return;
      const note = MELODY_NOTES[noteIndex];
      playBellTone(note.freq, 0, note.dur, 0.12);
      // Armónico sutil de acompañamiento (octava baja)
      playBellTone(note.freq / 2, 0, note.dur * 1.5, 0.05);

      noteIndex = (noteIndex + 1) % MELODY_NOTES.length;
      musicInterval = setTimeout(playNextNote, (note.dur * 0.75) * 1000);
    }
    playNextNote();
  }

  function stopMusicLoop() {
    isMusicPlaying = false;
    musicBtn.classList.remove('playing');
    musicIcon.textContent = '🎵';
    if (musicInterval) {
      clearTimeout(musicInterval);
      musicInterval = null;
    }
  }

  musicBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
      stopMusicLoop();
      showToast('Melodía en pausa');
    } else {
      startMusicLoop();
      showToast('🎶 Reproduciendo melodía mágica para Lucy');
    }
  });

  // Tocar acorde brillante de celebración (para lluvia o clics)
  function playChimeChord() {
    initAudio();
    const chords = [
      [523.25, 659.25, 783.99, 1046.50], // C Maj
      [587.33, 739.99, 880.00, 1174.66], // D Maj
      [392.00, 493.88, 587.33, 783.99]   // G Maj
    ];
    const chosenChord = chords[Math.floor(Math.random() * chords.length)];
    chosenChord.forEach((freq, idx) => {
      playBellTone(freq, idx * 0.08, 1.4, 0.08);
    });
  }

  // ----------------------------------------------------
  // 4. INTERACTIVIDAD: PLANTAR FLORES AL HACER CLIC
  // ----------------------------------------------------
  function plantFlowerAt(x, y) {
    flowerCount++;
    flowerCountEl.textContent = flowerCount;

    // Crear flor floreciente en el canvas
    bloomedFlowers.push(new BloomedFlower(x, y));

    // Ráfaga de destellos y pétalos alrededor del clic
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      const p = new Petal(x, y, true);
      p.speedX = Math.cos(angle) * speed;
      p.speedY = Math.sin(angle) * speed;
      petals.push(p);
    }

    playChimeChord();

    // Vibración háptica en teléfonos móviles compatibles
    if (navigator.vibrate) {
      try { navigator.vibrate(28); } catch (err) { }
    }

    // Mensaje de felicitación progresivo
    if (flowerCount === 1) {
      showToast('🌻 flor para Lucy!');
    } else if (flowerCount % 10 === 0) {
      showToast(`✨ ¡Increíble! ${flowerCount} flores amarillas iluminan a Lucy`);
      triggerPetalShower(30);
    }
  }

  // Detección táctil inteligente en teléfonos móviles:
  // Si el usuario se desplaza (scroll), no plantar flor. Solo plantar al tocar (tap).
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoved = false;

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchMoved = false;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const dx = Math.abs(e.touches[0].clientX - touchStartX);
      const dy = Math.abs(e.touches[0].clientY - touchStartY);
      if (dx > 12 || dy > 12) {
        touchMoved = true;
      }
    }
  }, { passive: true });

  // Evento de clic / toque global para plantar flores (excluyendo controles interactivos)
  window.addEventListener('click', (e) => {
    // Si fue un deslizamiento de scroll en teléfono, ignorar
    if (touchMoved) return;

    // Si hizo clic en un botón, enlace, modal o input, no plantar flor para no entorpecer
    const interactiveTags = ['BUTTON', 'INPUT', 'TEXTAREA', 'A'];
    if (interactiveTags.includes(e.target.tagName) || e.target.closest('button') || e.target.closest('.modal-box') || e.target.closest('.wax-seal')) {
      return;
    }

    plantFlowerAt(e.clientX, e.clientY);
  });

  // ----------------------------------------------------
  // 5. LLUVIA DE FLORES (FLOWER SHOWER)
  // ----------------------------------------------------
  function triggerPetalShower(count = 70) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = Math.random() * width;
        const p = new Petal(x, -20, true);
        p.speedY = Math.random() * 3 + 2.5;
        p.speedX = Math.random() * 6 - 3;
        petals.push(p);
      }, i * 35);
    }
  }

  btnShower.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    triggerPetalShower(90);
    playChimeChord();
    showToast('💐 ¡Lluvia dorada de flores amarillas para Lucy!');
  });

  // ----------------------------------------------------
  // 6. DEDICATORIA Y CARTA PARA LUCY (DIRECTA Y VISIBLE)
  // ----------------------------------------------------
  btnOpenLetter.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    playChimeChord();
    letterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('💌 Dedicatoria especial para Lucy');
  });

  // ----------------------------------------------------
  // 7. EFECTOS ESPECIALES EN LAS TARJETAS DE FLORES
  // ----------------------------------------------------
  btnShineImage.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    playChimeChord();
    artworkCard.style.boxShadow = '0 0 60px rgba(255, 214, 10, 0.9), 0 0 100px rgba(251, 133, 0, 0.6)';
    artworkCard.style.borderColor = '#ffd60a';

    const rect = artworkCard.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 25; i++) {
      const p = new Petal(centerX, centerY, true);
      petals.push(p);
    }

    setTimeout(() => {
      artworkCard.style.boxShadow = '';
      artworkCard.style.borderColor = '';
    }, 1200);

    showToast('✨ El ramo de Lucy brilla con luz dorada');
  });

  btnGlowBouquet.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    playChimeChord();
    triggerPetalShower(40);
    showToast('🌻 Girasoles bailando al viento para Lucy');
  });

  // Clic en flores individuales del SVG
  const interactiveFlowers = document.querySelectorAll('.flower-interactive');
  interactiveFlowers.forEach((flower) => {
    flower.addEventListener('click', (e) => {
      e.stopPropagation();
      playChimeChord();
      flowerCount++;
      flowerCountEl.textContent = flowerCount;
      showToast('💛 ¡Has despertado un girasol del ramo!');
    });
  });

  // Limpiar cualquier dedicatoria personalizada previa para mantener el mensaje original fijo
  try {
    localStorage.removeItem('lucy_recipient');
    localStorage.removeItem('lucy_sender');
    localStorage.removeItem('lucy_message');
  } catch (e) { }

  // ----------------------------------------------------
  // 9. TOAST NOTIFICACIONES
  // ----------------------------------------------------
  let toastTimeout = null;
  function showToast(msg) {
    toastText.textContent = msg;
    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // Mensaje de bienvenida inicial
  setTimeout(() => {
    showToast('🌻 ¡Bienvenida Lucy! Toca la pantalla o la carta');
  }, 1200);
});
