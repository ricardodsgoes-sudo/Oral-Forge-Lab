document.addEventListener('DOMContentLoaded', () => {
  // ═══ LENIS SMOOTH SCROLL ═══
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;
  if (window.Lenis && !reducedMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.2,
      wheelMultiplier: 1,
    });
    const lenisRaf = (time) => { lenis.raf(time); requestAnimationFrame(lenisRaf); };
    requestAnimationFrame(lenisRaf);
    window.lenis = lenis;
  }

  // ═══ SCROLL REVEAL ═══
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  // ═══ COUNTER ANIMATION ═══
  const counters = document.querySelectorAll('[data-count]');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.counted) {
        e.target.dataset.counted = 'true';
        const target = +e.target.dataset.count;
        const suffix = e.target.dataset.suffix || '';
        let current = 0;
        const step = Math.max(1, Math.floor(target / 60));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          e.target.textContent = current.toLocaleString('pt-BR') + suffix;
        }, 25);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObs.observe(c));

  // ═══ NAVBAR SCROLL ═══
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ═══ HAMBURGER MENU ═══
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    const closeMenu = () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    };
    const openMenu = () => {
      hamburger.classList.add('active');
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    };

    // Injeta botão de fechar (X) dentro do menu mobile
    if (!mobileMenu.querySelector('.mobile-close')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'mobile-close';
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', 'Fechar menu');
      closeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      closeBtn.addEventListener('click', closeMenu);
      mobileMenu.prepend(closeBtn);
    }

    hamburger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('active')) closeMenu(); else openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) closeMenu();
    });
  }

  // ═══ DROPDOWN ═══
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dd => {
    const toggle = dd.querySelector('.dropdown-toggle');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        dd.classList.toggle('active');
      });
    }
  });
  document.addEventListener('click', (e) => {
    dropdowns.forEach(dd => {
      if (!dd.contains(e.target)) dd.classList.remove('active');
    });
  });

  // ═══ ACCORDION (FAQ) ═══
  const accHeaders = document.querySelectorAll('.acc-header');
  accHeaders.forEach(h => {
    h.addEventListener('click', () => {
      const content = h.nextElementSibling;
      const isActive = h.classList.contains('active');
      document.querySelectorAll('.acc-header').forEach(ah => {
        ah.classList.remove('active');
        ah.nextElementSibling.style.maxHeight = null;
      });
      if (!isActive) {
        h.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // ═══ SMOOTH SCROLL FOR ANCHORS (Lenis-aware) ═══
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
        else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ═══ HERO TEXT TYPING EFFECT ═══
  const heroH1 = document.querySelector('.hero-content h1');
  if (heroH1) {
    heroH1.style.opacity = '1';
    heroH1.style.transform = 'translateY(0)';
  }

  // ═══ PARALLAX UNIFICADO ═══
  const parallaxItems = [];
  const pxRegister = (el, speed, scale = 1) => {
    parallaxItems.push({ el, speed, scale, baseTransform: scale !== 1 ? ` scale(${scale})` : '' });
    el.style.willChange = 'transform';
    if (scale !== 1) el.style.transform = `translate3d(0,0,0) scale(${scale})`;
  };

  if (!reducedMotion) {
    // Imagens de hero (home + páginas internas) — exclui o comparador antes/depois
    document.querySelectorAll('.hero-img-main img').forEach(img => {
      if (img.closest('.case-imgs')) return;
      pxRegister(img, 0.08, 1.1);
    });
    // Imagem do bloco PPR
    document.querySelectorAll('.ppr-img img').forEach(img => pxRegister(img, 0.08, 1.08));
    // Float cards do hero
    document.querySelectorAll('.float-card').forEach((card, i) => {
      pxRegister(card, 0.06 + i * 0.025);
    });
    // Conteúdo opcional via data-parallax="0.12"
    document.querySelectorAll('[data-parallax]').forEach(el => {
      pxRegister(el, parseFloat(el.dataset.parallax) || 0.1);
    });
  }

  const applyParallax = () => {
    const vh = window.innerHeight;
    for (const item of parallaxItems) {
      const rect = item.el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) continue;
      const center = rect.top + rect.height / 2 - vh / 2;
      const offset = -center * item.speed;
      item.el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)${item.baseTransform}`;
    }
  };
  let pxRaf = 0;
  const pxRequest = () => {
    if (pxRaf) return;
    pxRaf = requestAnimationFrame(() => { pxRaf = 0; applyParallax(); });
  };
  if (lenis) lenis.on('scroll', pxRequest);
  else window.addEventListener('scroll', pxRequest, { passive: true });
  window.addEventListener('resize', pxRequest);
  applyParallax();

  // ═══ ICON MICRO-INTERACTIONS ═══
  document.querySelectorAll('.p-icon, .fb-item, .sol-card, .social-links a').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'all 0.3s cubic-bezier(0.4,0,0.2,1)';
    });
  });

  // ═══ HERO MESH GRADIENT ═══
  initBeforeAfterComparers();
  initMeshGradient();
});

function initBeforeAfterComparers() {
  const comparers = document.querySelectorAll('.case-imgs');
  comparers.forEach((comparer, index) => {
    if (comparer.querySelectorAll('img').length < 2) return;

    let dragging = false;
    let value = 50;

    comparer.setAttribute('role', 'slider');
    comparer.setAttribute('tabindex', '0');
    comparer.setAttribute('aria-label', 'Comparador de antes e depois');
    comparer.setAttribute('aria-valuemin', '0');
    comparer.setAttribute('aria-valuemax', '100');
    comparer.setAttribute('aria-valuenow', String(value));
    comparer.style.setProperty('--compare-pos', `${value}%`);

    const setValue = (nextValue) => {
      value = Math.max(0, Math.min(100, nextValue));
      comparer.style.setProperty('--compare-pos', `${value}%`);
      comparer.setAttribute('aria-valuenow', String(Math.round(value)));
    };

    const updateFromPointer = (event) => {
      const rect = comparer.getBoundingClientRect();
      const x = event.clientX - rect.left;
      setValue((x / rect.width) * 100);
    };

    comparer.addEventListener('pointerdown', (event) => {
      dragging = true;
      comparer.classList.add('is-dragging');
      comparer.setPointerCapture(event.pointerId);
      updateFromPointer(event);
    });

    comparer.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      event.preventDefault();
      updateFromPointer(event);
    });

    const stopDragging = (event) => {
      if (!dragging) return;
      dragging = false;
      comparer.classList.remove('is-dragging');
      if (comparer.hasPointerCapture(event.pointerId)) {
        comparer.releasePointerCapture(event.pointerId);
      }
    };

    comparer.addEventListener('pointerup', stopDragging);
    comparer.addEventListener('pointercancel', stopDragging);
    comparer.addEventListener('keydown', (event) => {
      const keys = {
        ArrowLeft: -5,
        ArrowDown: -5,
        ArrowRight: 5,
        ArrowUp: 5
      };

      if (event.key === 'Home') {
        event.preventDefault();
        setValue(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        setValue(100);
      } else if (event.key in keys) {
        event.preventDefault();
        setValue(value + keys[event.key]);
      }
    });

    if (index === 0) setValue(54);
  });
}

function initMeshGradient() {
  const layer1 = document.getElementById('shaderLayer1');
  const layer2 = document.getElementById('shaderLayer2');
  if (!layer1 || !layer2) return;

  const primaryColors  = ['#061316', '#0b1f24', '#14343a', '#b9794b', '#061316'];
  const secondaryColors = ['#061316', '#0f2a30', '#9f6238', '#1c4a50'];

  const slow = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hexToRGBA(hex) {
    return [
      parseInt(hex.slice(1,3), 16) / 255,
      parseInt(hex.slice(3,5), 16) / 255,
      parseInt(hex.slice(5,7), 16) / 255,
      1.0
    ];
  }

  function createLayer(container, colors, speed, distortion) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    container.prepend(canvas);

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      container.style.background = 'radial-gradient(ellipse at 40% 60%, #1c4a50, #0b1f24 50%, #061316)';
      return;
    }

    // GLSL ES 3.00 — supports dynamic loop indexing
    const VERT = `#version 300 es
in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

    const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  u_res;
uniform float u_time;
uniform vec4  u_colors[10];
uniform int   u_count;
uniform float u_distortion;

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = u_time;

  // Warp senoidal suave — sem ruído, sem artefatos
  vec2 dUV = uv;
  dUV.x += sin(uv.y  * 2.8 + t * 0.18) * u_distortion * 0.13;
  dUV.y += cos(uv.x  * 2.8 + t * 0.14) * u_distortion * 0.13;
  dUV.x += sin(dUV.y * 1.6 + t * 0.10 + 1.2) * u_distortion * 0.07;
  dUV.y += cos(dUV.x * 1.6 + t * 0.08 + 0.8) * u_distortion * 0.07;

  float totalW = 0.0;
  vec3  col    = vec3(0.0);
  for (int i = 0; i < 10; i++) {
    if (i >= u_count) break;
    float fi    = float(i);
    float freq  = 0.20 + fi * 0.09;
    float phase = fi * 1.618;
    vec2 pos = vec2(
      0.5 + 0.44 * sin(t * freq + phase),
      0.5 + 0.44 * cos(t * freq * 0.71 + phase + 1.047)
    );
    float d = distance(dUV, pos);
    float w = 1.0 / pow(max(d, 0.001), 1.6);
    totalW += w;
    col    += u_colors[i].rgb * w;
  }
  col /= totalW;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('Shader compile error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(prog)); return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(prog, 'u_res');
    const uTime  = gl.getUniformLocation(prog, 'u_time');
    const uCount = gl.getUniformLocation(prog, 'u_count');
    const uDist  = gl.getUniformLocation(prog, 'u_distortion');
    const uCols  = gl.getUniformLocation(prog, 'u_colors[0]');

    const flat = new Float32Array(10 * 4);
    colors.forEach((hex, i) => {
      const c = hexToRGBA(hex);
      flat.set(c, i * 4);
    });
    gl.uniform4fv(uCols, flat);
    gl.uniform1i(uCount, colors.length);
    gl.uniform1f(uDist,  distortion);

    let frame = 0, last = 0, rafId = 0, active = true;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(canvas.offsetWidth  * dpr);
      const h = Math.round(canvas.offsetHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function tick(ts) {
      if (!active) return;
      if (last) frame += (ts - last) / 1000 * speed;
      last = ts;
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, frame);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(tick);
    }

    resize();
    if (slow) {
      // Single static frame for prefers-reduced-motion
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);

    // Pause when hero scrolls out of view
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !active) { active = true; last = 0; rafId = requestAnimationFrame(tick); }
      else if (!e.isIntersecting && active) { active = false; cancelAnimationFrame(rafId); }
    }, { threshold: 0 }).observe(canvas);
  }

  createLayer(layer1, primaryColors,   0.5,  0.9);
  createLayer(layer2, secondaryColors, 0.35, 0.65);
}
