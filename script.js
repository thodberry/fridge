(function () {
  'use strict';

  /* ============ Confetti engine ============ */
  var layer = document.getElementById('confetti-layer');
  var ctx = layer.getContext('2d');
  var particles = [];
  var running = false;

  function sizeLayer() {
    layer.width = window.innerWidth;
    layer.height = window.innerHeight;
  }

  window.addEventListener('resize', sizeLayer);
  sizeLayer();

  function burst(opts) {
    var angle = ((opts.angle != null ? opts.angle : 90) * Math.PI) / 180;
    var spread = ((opts.spread != null ? opts.spread : 45) * Math.PI) / 180;
    var vel = opts.velocity != null ? opts.velocity : 45;
    var gravity = opts.gravity != null ? opts.gravity : 0.1;
    var drift = opts.drift != null ? opts.drift : 0;
    var ticks = opts.ticks != null ? opts.ticks : 200;
    var scalar = opts.scalar != null ? opts.scalar : 1;
    var colors = opts.colors || DEFAULT_COLORS;
    var shapes = opts.shapes || null;
    var ox = (opts.origin && opts.origin.x != null ? opts.origin.x : 0.5) * layer.width;
    var oy = (opts.origin && opts.origin.y != null ? opts.origin.y : 0.5) * layer.height;

    for (var i = 0; i < opts.count; i++) {
      var a = angle + (Math.random() - 0.5) * spread;
      var v = (vel * (0.6 + Math.random() * 0.7)) * scalar;
      var shape = shapes
        ? shapes[(Math.random() * shapes.length) | 0]
        : pickShape();
      particles.push({
        x: ox,
        y: oy,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        gravity: gravity * scalar,
        drift: drift,
        size: (3 + Math.random() * 5) * scalar,
        color: colors[(Math.random() * colors.length) | 0],
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        wobble: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: ticks * (0.6 + Math.random() * 0.8),
        shape: shape
      });
    }

    if (!running) {
      running = true;
      requestAnimationFrame(step);
    }
  }

  function pickShape() {
    var r = Math.random();
    if (r < 0.38) return 'rect';
    if (r < 0.62) return 'circle';
    if (r < 0.78) return 'heart';
    if (r < 0.9) return 'star';
    return 'sparkle';
  }

  function step() {
    ctx.clearRect(0, 0, layer.width, layer.height);

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.life++;
      p.vy += p.gravity;
      p.x += p.vx + p.drift + Math.sin(p.life * 0.05 * p.wobble + p.phase) * 0.6;
      p.y += p.vy;
      p.vx *= 0.995;
      p.rotation += p.rotSpeed;

      if (p.life >= p.maxLife || p.y > layer.height + 40) {
        particles.splice(i, 1);
        continue;
      }

      var alpha = p.life < 40 ? p.life / 40 : Math.max(0, 1 - (p.life - 40) / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      drawShape(p);
      ctx.restore();
    }

    if (particles.length > 0) {
      requestAnimationFrame(step);
    } else {
      running = false;
    }
  }

  function drawShape(p) {
    var s = p.size;
    ctx.beginPath();
    switch (p.shape) {
      case 'rect':
        ctx.fillRect(-s, -s * 0.6, s * 2, s * 1.2);
        break;
      case 'heart':
        ctx.moveTo(0, s * 0.4);
        ctx.bezierCurveTo(-s * 1.2, -s * 0.5, -s * 0.5, -s * 1.1, 0, -s * 0.3);
        ctx.bezierCurveTo(s * 0.5, -s * 1.1, s * 1.2, -s * 0.5, 0, s * 0.4);
        ctx.fill();
        break;
      case 'star':
        drawStar(0, 0, 5, s * 0.9, s * 0.4);
        ctx.fill();
        break;
      case 'sparkle':
        drawStar(0, 0, 4, s, s * 0.15);
        ctx.fill();
        break;
      default:
        ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.closePath();
  }

  function drawStar(cx, cy, points, outer, inner) {
    var i;
    ctx.moveTo(cx + outer, cy);
    for (i = 0; i < points * 2; i++) {
      var r = i % 2 === 0 ? outer : inner;
      var ang = (i * Math.PI) / points - Math.PI / 2;
      ctx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    }
    ctx.closePath();
  }

  var DEFAULT_COLORS = ['#ff4d8d', '#ff9a3d', '#ffd36e', '#8fd6ff', '#c9a6ff', '#ffd700', '#ff69b4', '#ffffff'];

  /* ============ Sound control ============ */
  var soundOn = true;

  var musicBtn = document.getElementById('music-btn');
  var iconOn = document.getElementById('icon-on');
  var iconOff = document.getElementById('icon-off');

  function updateMusicIcon() {
    iconOn.hidden = !soundOn;
    iconOff.hidden = soundOn;
    musicBtn.setAttribute('aria-pressed', String(soundOn));
    musicBtn.setAttribute('aria-label', soundOn ? 'Mute sound' : 'Unmute sound');
  }

  var danceVideo = document.getElementById('dance-video');

  function playDance() {
    if (!danceVideo) return;
    danceVideo.muted = !soundOn;
    var p = danceVideo.play();
    if (p && p.catch) p.catch(function () {});
  }

  musicBtn.addEventListener('click', function () {
    soundOn = !soundOn;
    if (video) video.muted = !soundOn;
    if (danceVideo) danceVideo.muted = !soundOn;
    updateMusicIcon();
  });

  /* ============ Intro frame + play ============ */
  var intro = document.getElementById('intro');
  var video = document.getElementById('video');
  var hint = document.getElementById('hint');
  var gallery = document.getElementById('gallery');
  var played = false;

  function enterFullscreen() {
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) return;
    var docFn = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
    if (docFn) {
      var r = docFn.call(document.documentElement);
      if (r && r.catch) r.catch(function () {});
    }
  }

  function start() {
    if (played) return;
    played = true;
    hint.style.display = 'none';
    video.currentTime = 0;
    video.muted = !soundOn;
    video.volume = 1;
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
    enterFullscreen();
  }

  intro.addEventListener('click', start);

  video.addEventListener('playing', function () {
    hint.style.display = 'none';
    video.muted = !soundOn;
  });

  video.addEventListener('ended', function () {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    }
    intro.classList.add('hidden');
    document.body.classList.add('unlocked');
    gallery.classList.add('show');
    celebrate();
    window.scrollTo(0, 0);
    playDance();
  });

  function celebrate() {
    burst({
      count: 250,
      spread: 360,
      velocity: 24,
      scalar: 0.6,
      gravity: 0.45,
      drift: 0.2,
      ticks: 320,
      origin: { y: 0.35 },
      colors: DEFAULT_COLORS
    });
    burst({
      count: 160,
      spread: 360,
      velocity: 26,
      scalar: 0.55,
      gravity: 0.4,
      drift: -0.2,
      ticks: 360,
      origin: { y: 0.35 },
      colors: DEFAULT_COLORS
    });
    setTimeout(function () {
      burst({
        count: 180,
        spread: 360,
        velocity: 24,
        scalar: 0.55,
        gravity: 0.45,
        drift: 0.15,
        ticks: 320,
        origin: { y: 0.5 },
        colors: DEFAULT_COLORS
      });
    }, 1600);
  }

  /* ============ Cakes + confetti on tap/scroll ============ */
  function spawnCake(x, y) {
    var el = document.createElement('span');
    el.className = 'cake-emoji';
    el.textContent = '🎂';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.fontSize = (22 + Math.random() * 44) + 'px';
    document.body.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, 1400);
  }

  gallery.addEventListener('pointerdown', function (e) {
    spawnCake(e.clientX, e.clientY);
    if (soundOn && danceVideo && danceVideo.paused) playDance();
    burst({
      count: 35,
      spread: 360,
      velocity: 16,
      scalar: 0.4,
      gravity: 0.4,
      drift: 0.1,
      ticks: 220,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: DEFAULT_COLORS
    });
  });

  var lastCakeScroll = 0;
  window.addEventListener('scroll', function () {
    var now = Date.now();
    if (now - lastCakeScroll < 250) return;
    lastCakeScroll = now;

    var i, n = 2 + (Math.random() * 3 | 0);
    for (i = 0; i < n; i++) {
      spawnCake(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
    }
    burst({
      count: 40,
      spread: 360,
      velocity: 18,
      scalar: 0.45,
      gravity: 0.35,
      drift: 0.15,
      ticks: 240,
      origin: { x: 0.5, y: 0.5 },
      colors: DEFAULT_COLORS
    });
  });

  updateMusicIcon();
})();
