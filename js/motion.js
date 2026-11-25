/* ==========================================================
   ANIMAÇÕES: decide quando cada elemento anima (o visual fica no motion.css).
   Se a pessoa preferir menos movimento, nada é animado.
   ========================================================== */

// função que se executa sozinha: o código fica isolado e não interfere no resto do site
(function () {
  // matchMedia: lê se a pessoa pediu "reduzir movimento" no sistema
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // se pediu, ou se o navegador for antigo, não liga nenhuma animação
  if (reduce || !('IntersectionObserver' in window)) return;
  var root = document.documentElement;
  // adiciona a classe "mo" no <html>: é ela que libera as animações no CSS
  root.classList.add('mo');

  // lista de elementos que aparecem sozinhos ao rolar a página
  var SINGLES = [
    '.ph-text > *', '.ph-visual', '.hf-eyebrow', '.hf-title', '.hf-desc', '.hf-actions', '.hf-note', '.mock',
    '.sh', '.gd-hero .container > *', '.gd-sec .container > *:not(.sh)', '.gd-cta-wrap .container > *',
    '.sc-eyebrow', '.sc-title', '.sc-intro', '.sc-actions', '.sc-note',
    '.sim-text', '.sim-points', '.faq-intro', '.faq-help',
    '.blog-head', '.blog-tabs', '.blog-body', '.blog-note',
    '.pt-nav', '.pt-panels', '.np-cols', '.np-foot', '.fonte', '.qz', '.letters', '.ph-search',
    '.ev-eyebrow', '.ev-sub', '.type-buttons', '.panels', '.ft-top', '.ft-cols', '.ct-form'
  ];
  // grupos de cards: aparecem um depois do outro (efeito cascata)
  var GRIDS = [
    '.gl-grid > *', '.canais > *', '.pt-grid > *', '.np-list > *', '.terms > *', '.gd-steps > *', '.gd-tips > *',
    '.gd-stats > *', '.sc-cards > *', '.faq-list > *', '.hf-benefits > *', '.ev-grid > *', '.pills > *', '.ct-side > *'
  ];
  var SKIP = '.site-header, .pa, .blog-track, .mock *, .gl-sum';
  var small = matchMedia('(max-width:760px)').matches;
  var dist = small ? 18 : 28;

  function ready(fn) { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn(); }

  ready(function () {
    var seen = new Set(), items = [];
    function tag(el, i, card) {
      if (seen.has(el) || el.closest(SKIP) && !el.matches('.pa')) return;
      if (el.parentElement && el.parentElement.closest('[data-rv]')) return;
      seen.add(el);
      // marca o elemento para o CSS escondê-lo até ele entrar na tela
      el.setAttribute('data-rv', '');
      // atraso de cada card (0ms, 80ms, 160ms...)
      el.style.setProperty('--rd', Math.min(i, 5) * (small ? 55 : 80) + 'ms');
      el.style.setProperty('--ry', dist + 'px');
      if (card) el.style.setProperty('--rs', '.965');
      items.push(el);
    }
    SINGLES.forEach(function (s) {
      document.querySelectorAll(s).forEach(function (el) {
        var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        tag(el, sib, false);
      });
    });
    GRIDS.forEach(function (s) {
      document.querySelectorAll(s).forEach(function (el, i) { tag(el, i % 3, true); });
    });

    // IntersectionObserver = "vigia" que avisa quando um elemento entra na área visível da tela
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io.unobserve(el);
        // entrou na tela: o CSS anima o elemento até a posição final
        el.setAttribute('data-rv', 'in');
        var wait = 1400 + parseInt(el.style.getPropertyValue('--rd') || 0, 10);
        // devolve o elemento ao estado original (hover/transições próprios voltam a valer)
        setTimeout(function () {
          el.removeAttribute('data-rv');
          el.style.removeProperty('--rd'); el.style.removeProperty('--ry'); el.style.removeProperty('--rs');
        }, wait);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });

    // luzes de fundo: cria uma camada com 3 círculos azuis, animados pelo CSS
    var amb = document.createElement('div');
    amb.className = 'amb'; amb.setAttribute('aria-hidden', 'true');
    amb.innerHTML = '<i class="o1"></i><i class="o2"></i><i class="o3"></i>';
    document.body.insertBefore(amb, document.body.firstChild);


    // "Proteja suas contas": sequência de entrada a partir do ponto central
    var tl = document.querySelector('.pa-tl');
    if (tl) {
      tl.classList.add('pa-seq');
      var pio = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        pio.disconnect();
        // .go dispara a sequência dos cards "Proteja suas contas" no CSS
        tl.classList.add('go');
        setTimeout(function () { tl.classList.add('done'); }, 4400);
      }, { threshold: 0.3 });
      pio.observe(tl);
    }


    // parallax em camadas do escudo da página Proteja-se
    var shield = document.querySelector('.pv-shield img[src$="escudo-3d.png"]');
    if (shield && !small) {
      var box = shield.parentElement;
      var aura = document.createElement('img');
      aura.src = shield.src; aura.alt = ''; aura.className = 'pv-aura'; aura.setAttribute('aria-hidden', 'true');
      var glow = document.createElement('span'); glow.className = 'pv-glow';
      box.insertBefore(glow, shield); box.insertBefore(aura, shield);
      shield.classList.add('pv-main');
      var layers = [
        { el: glow, d: -0.10 }, { el: aura, d: -0.05 }, { el: shield, d: 0.04 },
        { el: box.querySelector('.c1'), d: 0.16 }, { el: box.querySelector('.c2'), d: -0.13 }, { el: box.querySelector('.c3'), d: 0.2 }
      ].filter(function (l) { return l.el; });
      var ticking = false, vis = true;
      new IntersectionObserver(function (en) { vis = en[0].isIntersecting; if (vis) upd(); }).observe(box);
      // parallax: cada camada do escudo se move numa velocidade diferente conforme a rolagem
      function upd() {
        ticking = false; if (!vis) return;
        var r = box.getBoundingClientRect(), vh = innerHeight;
        var p = Math.max(-1.2, Math.min(1.2, (r.top + r.height / 2 - vh / 2) / vh));
        layers.forEach(function (l) { l.el.style.transform = 'translate3d(0,' + (p * l.d * -260).toFixed(1) + 'px,0)'; });
      }
      // requestAnimationFrame = atualiza junto com a tela, sem travar a rolagem
      addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
      upd();
    }
  });

  // cards iniciais: dispara a entrada com LEDs quando entram na tela
  function ledCards() {
    var c = document.querySelector('.sc-cards');
    if (!c || !('IntersectionObserver' in window)) { if (c) c.classList.add('led'); return; }
    var io = new IntersectionObserver(function (es) {
      // entrou na tela: adiciona .led (LEDs da borda) e para de vigiar
      es.forEach(function (e) { if (e.isIntersecting) { c.classList.add('led'); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(c);
  }
  function iniciarEntradas() { ledCards(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarEntradas); else iniciarEntradas();
})();
