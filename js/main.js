/* js/main.js - Interacciones mejoradas para The Jungle
   - Menu responsive (toggle)
   - Sticky header shrink
   - Scroll reveal (animaciones suaves)
   - Validaciones de formularios (contacto + suscripción) con regex
   - Mejora de accesibilidad (focus / mensajes)
*/

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Helpers ---------- */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const addClass = (el, c) => el && el.classList.add(c);
  const remClass = (el, c) => el && el.classList.remove(c);

  /* ---------- NAV: mobile toggle (crea un botón en tiempo de ejecución si no existe) ---------- */
  const header = $('.site-header');
  const nav = $('.nav');

  // Crear botón toggle para mobile si no está en HTML
  if (header && !$('#nav-toggle')) {
    const toggle = document.createElement('button');
    toggle.id = 'nav-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    toggle.innerHTML = '☰';
    toggle.style.cssText = 'background:transparent;border:0;color:inherit;font-size:20px;cursor:pointer;margin-left:12px';
    header.appendChild(toggle);

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        addClass(nav, 'open');
        toggle.setAttribute('aria-label', 'Cerrar menú');
      } else {
        remClass(nav, 'open');
        toggle.setAttribute('aria-label', 'Abrir menú');
      }
    });

    // Close nav on link click (mobile)
    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && nav.classList.contains('open')) {
        remClass(nav, 'open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
      }
    });
  }

  /* ---------- Sticky header shrink on scroll ---------- */
  let lastScroll = 0;
  const shrinkClass = 'header-shrink';
  window.addEventListener('scroll', () => {
    const sc = window.scrollY || document.documentElement.scrollTop;
    if (sc > 80) addClass(header, shrinkClass);
    else remClass(header, shrinkClass);

    lastScroll = sc;
    revealOnScroll(); // call reveal during scroll
  }, { passive: true });

  /* ---------- Simple Scroll Reveal: elements with .reveal (fade+up) ---------- */
  const revealElems = $$('.reveal');
  function revealOnScroll() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    revealElems.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh - 60) addClass(el, 'revealed');
    });
  }
  // initial call
  revealOnScroll();

  /* ---------- Highlight active nav link (by pathname) ---------- */
  (function setActiveLink() {
    const links = $$('.nav a');
    const current = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      // normalize href last segment
      const href = a.getAttribute('href');
      if (!href) return;
      const last = href.split('/').pop();
      if (last === current) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  })();

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- Subscribe form (email validation) ---------- */
  const subscribeForm = $('#subscribe-form');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = subscribeForm.querySelector('#email');
      const email = (emailInput?.value || '').trim();
      const emailRe = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
      if (!emailRe.test(email)) {
        alert('Introduce un correo válido para suscribirte.');
        emailInput.focus();
        return;
      }
      // Simulación de suscripción
      alert('¡Gracias! Te hemos suscrito: ' + email);
      subscribeForm.reset();
    });
  }

  /* ---------- Contact form validation (regex + UI feedback) ---------- */
  const contactForm = $('#contact-form');
  if (contactForm) {
    const inpName = contactForm.querySelector('#nombre') || contactForm.querySelector('#name');
    const inpEmail = contactForm.querySelector('#email');
    const inpAsunto = contactForm.querySelector('#asunto') || contactForm.querySelector('#subject');
    const inpMensaje = contactForm.querySelector('#mensaje') || contactForm.querySelector('#message');
    const statusEl = document.getElementById('form-status');

    // Regex definitions (explainable, used both here and in "pattern" HTML)
    const reName = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,40}$/;
    const reEmail = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    const reAsunto = /^.{3,60}$/;
    const reMensaje = /^.{10,300}$/;

    function showStatus(msg, ok = true) {
      if (!statusEl) {
        alert(msg);
        return;
      }
      statusEl.textContent = msg;
      statusEl.style.color = ok ? 'lightgreen' : '#f4bbbb';
      statusEl.setAttribute('role', 'status');
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (inpName?.value || '').trim();
      const email = (inpEmail?.value || '').trim();
      const asunto = (inpAsunto?.value || '').trim();
      const mensaje = (inpMensaje?.value || '').trim();

      const errors = [];
      if (!reName.test(name)) errors.push('Nombre inválido (mínimo 3 letras).');
      if (!reEmail.test(email)) errors.push('Email inválido.');
      if (!reAsunto.test(asunto)) errors.push('Asunto demasiado corto.');
      if (!reMensaje.test(mensaje)) errors.push('Mensaje demasiado corto (mínimo 10 caracteres).');

      if (errors.length) {
        showStatus(errors.join(' '), false);
        // focus first invalid
        if (!reName.test(name)) inpName.focus();
        else if (!reEmail.test(email)) inpEmail.focus();
        else if (!reAsunto.test(asunto)) inpAsunto.focus();
        else if (!reMensaje.test(mensaje)) inpMensaje.focus();
        return;
      }

      // Simular envío: aquí pondrías la llamada fetch() a un endpoint si tuvieras backend.
      showStatus('Formulario enviado correctamente. ¡Gracias!', true);
      contactForm.reset();
    });
  }

  /* ---------- Accessibility: focus outlines only for keyboard users ---------- */
  (function keyboardOutlineManager() {
    let usingKeyboard = false;
    window.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        usingKeyboard = true;
        document.body.classList.add('show-focus');
      }
    });
    window.addEventListener('mousedown', () => {
      if (usingKeyboard) {
        usingKeyboard = false;
        document.body.classList.remove('show-focus');
      }
    });
  })();

  /* ---------- Optionally replace hero placeholder with your uploaded image path ---------- */
  // If you want to auto-insert the uploaded image into the hero, uncomment and edit this:
  const heroArt = document.querySelector('.hero-art');
  if (heroArt) {
    // Replace the string below with your local image path if desired:
    const uploadedImagePath = '/mnt/data/24239c87-900c-4779-b58c-23b2d26b7c1f.png';
    // Create responsive img element
    const img = document.createElement('img');
    img.src = uploadedImagePath; // local path provided above
    img.alt = 'The Jungle - Hero';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '10px';
    // Clear placeholder content and add the image
    heroArt.textContent = '';
    heroArt.appendChild(img);
  }

  /* ---------- small utilities: close open nav on resize desktop ---------- */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      remClass(nav, 'open');
      const t = $('#nav-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    }
  });

}); // DOMContentLoaded end
