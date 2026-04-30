'use strict';

const rafKor = (() => {
  const feladatok = new Set();

  function kor() {
    feladatok.forEach(fn => fn());
    requestAnimationFrame(kor);
  }

  requestAnimationFrame(kor);

  return {
    add: (fn) => feladatok.add(fn),
    remove: (fn) => feladatok.delete(fn),
  };
})();

function egyeniKurzor() {
  const kursorPont = document.getElementById('cursor');
  const kursorGyuru = document.getElementById('cursorRing');

  if (!kursorPont || !kursorGyuru) return;

  let egerX = -100, egerY = -100;
  let gyuruX = -100, gyuruY = -100;

  document.addEventListener('mousemove', (e) => {
    egerX = e.clientX;
    egerY = e.clientY;
    kursorPont.style.transform = `translate(${egerX - 5}px, ${egerY - 5}px)`;
  });

  // lerp faktor: 0.12
  rafKor.add(() => {
    const dx = egerX - gyuruX;
    const dy = egerY - gyuruY;
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      gyuruX += dx * 0.12;
      gyuruY += dy * 0.12;
      kursorGyuru.style.transform = `translate(${gyuruX - 19}px, ${gyuruY - 19}px)`;
    }
  });

  const interaktivElemek = document.querySelectorAll(
    'a, button, [data-magnetic], input, .menu-card, .gallery-item'
  );

  interaktivElemek.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => {
    kursorPont.style.opacity  = '0';
    kursorGyuru.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    kursorPont.style.opacity  = '1';
    kursorGyuru.style.opacity = '1';
  });
}

function scrollProgress() {
  const csik = document.getElementById('scrollProgress');
  if (!csik) return;

  function frissit() {
    const scrollolt   = window.scrollY;
    const teljesHossz = document.documentElement.scrollHeight - window.innerHeight;
    const szazalek    = teljesHossz > 0 ? (scrollolt / teljesHossz) * 100 : 0;
    csik.style.width  = `${szazalek}%`;
  }

  window.addEventListener('scroll', frissit, { passive: true });
  frissit();
}

function headerScroll() {
  const fejlec = document.getElementById('header');
  if (!fejlec) return;

  window.addEventListener('scroll', () => {
    fejlec.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

function parallaxHero() {
  const fotó = document.getElementById('heroPhoto');
  if (!fotó) return;

  window.addEventListener('scroll', () => {
    const eltolas = window.scrollY * 0.28;
    fotó.style.transform = `scale(1.1) translateY(${eltolas}px)`;
  }, { passive: true });
}

function meteorok() {
  const tároló = document.getElementById('meteorsContainer');
  if (!tároló) return;

  const METEOR_DARAB = 14;

  for (let i = 0; i < METEOR_DARAB; i++) {
    const meteor = document.createElement('div');
    meteor.className = 'meteor';

    meteor.style.cssText = `
      left: ${Math.random() * 100}%;
      --duration: ${2.5 + Math.random() * 2.5}s;
      --delay: ${Math.random() * 8}s;
      height: ${50 + Math.random() * 70}px;
      opacity: ${0.4 + Math.random() * 0.5};
    `;

    tároló.appendChild(meteor);
  }
}

function scrambleText() {
  const KARAKTEREK = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?';

  const elemek = document.querySelectorAll('[data-scramble]');
  if (!elemek.length) return;

  function veletlenKar() {
    return KARAKTEREK[Math.floor(Math.random() * KARAKTEREK.length)];
  }

  function scrambleElem(elem, kesleltetesMs) {
    const vegsoSzoveg = elem.textContent;
    let frame = 0;

    setTimeout(() => {
      const intervallum = setInterval(() => {
        const megfejtettHossz = Math.floor((frame / 30) * vegsoSzoveg.length);

        elem.textContent = vegsoSzoveg
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < megfejtettHossz) return char;
            return veletlenKar();
          })
          .join('');

        frame++;

        if (frame > 30) {
          clearInterval(intervallum);
          elem.textContent = vegsoSzoveg;
        }
      }, 40);
    }, kesleltetesMs);
  }

  elemek.forEach((el, i) => {
    scrambleElem(el, 400 + i * 200);
  });
}

function typewriter() {
  const elem = document.getElementById('heroSubtitle');
  if (!elem) return;

  const SZOVEG    = 'Klasszikus hangulat · Kézműves italok';
  const KARAKTER_IDOS = 55;

  let i = 0;

  setTimeout(() => {
    const intervallum = setInterval(() => {
      elem.textContent += SZOVEG[i];
      i++;

      if (i >= SZOVEG.length) {
        clearInterval(intervallum);
        setTimeout(() => elem.classList.add('typed-done'), 2000);
      }
    }, KARAKTER_IDOS);
  }, 1200);
}

function letterPullup() {
  const elemek = document.querySelectorAll('[data-pullup]');
  if (!elemek.length) return;

  elemek.forEach(elem => {
    const eredetiHTML = elem.innerHTML;
    const temp = document.createElement('div');
    temp.innerHTML = eredetiHTML;

    function szovegetDarabol(node, delay = { current: 0 }) {
      if (node.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        const szavak = node.textContent.split(/(\s+)/);

        szavak.forEach(resz => {
          if (/^\s+$/.test(resz)) {
            const szokoz = document.createElement('span');
            szokoz.className = 'letter-space';
            szokoz.textContent = ' ';
            fragment.appendChild(szokoz);
            return;
          }
          if (!resz) return;

          const szoWrap = document.createElement('span');
          szoWrap.style.cssText = 'display:inline-block; white-space:nowrap;';

          resz.split('').forEach(char => {
            const betű = document.createElement('span');
            betű.className = 'letter-char';
            betű.textContent = char;
            betű.style.transitionDelay = `${delay.current}ms`;
            delay.current += 28;
            szoWrap.appendChild(betű);
          });

          fragment.appendChild(szoWrap);
        });

        return fragment;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const klon = node.cloneNode(false);
        node.childNodes.forEach(gyerek => {
          klon.appendChild(szovegetDarabol(gyerek, delay));
        });
        return klon;
      }
      return node.cloneNode(true);
    }

    elem.innerHTML = '';
    const kesleltetesObj = { current: 0 };

    temp.childNodes.forEach(node => {
      elem.appendChild(szovegetDarabol(node, kesleltetesObj));
    });
  });

  const megfigyelo = new IntersectionObserver((bejegyzesek) => {
    bejegyzesek.forEach(b => {
      if (b.isIntersecting) {
        b.target.classList.add('pulled');
        megfigyelo.unobserve(b.target);
      }
    });
  }, { threshold: 0.2 });

  elemek.forEach(el => megfigyelo.observe(el));
}

function scrollReveal() {
  const elemek = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!elemek.length) return;

  const megfigyelo = new IntersectionObserver((bejegyzesek) => {
    bejegyzesek.forEach(b => {
      if (b.isIntersecting) {
        b.target.classList.add('visible');
        megfigyelo.unobserve(b.target);
      }
    });
  }, { threshold: 0.12 });

  elemek.forEach(el => megfigyelo.observe(el));
}

function countUp() {
  const elemek = document.querySelectorAll('.stat-number[data-target]');
  if (!elemek.length) return;

  const megfigyelo = new IntersectionObserver((bejegyzesek) => {
    bejegyzesek.forEach(b => {
      if (!b.isIntersecting || b.target.dataset.szamolva) return;

      b.target.dataset.szamolva = 'igen';
      const celErtek = parseInt(b.target.dataset.target);
      const ido      = 1600;
      const kezdes   = performance.now();

      function ticker(most) {
        const eltelt   = most - kezdes;
        const haladás  = Math.min(eltelt / ido, 1);
        const simítva  = 1 - Math.pow(1 - haladás, 3); // easeOutCubic
        b.target.textContent = Math.round(simítva * celErtek);
        if (haladás < 1) requestAnimationFrame(ticker);
      }

      requestAnimationFrame(ticker);
    });
  }, { threshold: 0.5 });

  elemek.forEach(el => megfigyelo.observe(el));
}

function spotlightKartyak() {
  const kartyak = document.querySelectorAll('.spotlight-card');
  if (!kartyak.length) return;

  kartyak.forEach(kartya => {
    let pending = false;
    kartya.addEventListener('mousemove', (e) => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        const kozpont = kartya.getBoundingClientRect();
        const x = ((e.clientX - kozpont.left) / kozpont.width)  * 100;
        const y = ((e.clientY - kozpont.top)  / kozpont.height) * 100;
        kartya.style.setProperty('--x', `${x}%`);
        kartya.style.setProperty('--y', `${y}%`);
        pending = false;
      });
    });
  });
}

function tiltKartyak() {
  const kartyak = document.querySelectorAll('[data-tilt]');
  if (!kartyak.length) return;

  const TILT_MAX  = 8;
  const TILT_ALAP = 600;

  kartyak.forEach(kartya => {
    let pending = false;
    kartya.addEventListener('mousemove', (e) => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        const kozpont = kartya.getBoundingClientRect();
        const relX = (e.clientX - kozpont.left) / kozpont.width  - 0.5;
        const relY = (e.clientY - kozpont.top)  / kozpont.height - 0.5;
        const forgásY =  relX * TILT_MAX;
        const forgásX = -relY * TILT_MAX;

        kartya.style.transform = `
          perspective(${TILT_ALAP}px)
          rotateX(${forgásX}deg)
          rotateY(${forgásY}deg)
          scale3d(1.02, 1.02, 1.02)
        `;
        pending = false;
      });
    });

    kartya.addEventListener('mouseleave', () => {
      kartya.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
      kartya.style.transform  = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      setTimeout(() => { kartya.style.transition = ''; }, 500);
    });
  });
}

function magnetikusGombok() {
  const gombok = document.querySelectorAll('[data-magnetic]');
  if (!gombok.length) return;

  const EROTETERO = 0.4;

  gombok.forEach(gomb => {
    let pending = false;
    gomb.addEventListener('mousemove', (e) => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        const kozpont = gomb.getBoundingClientRect();
        const kp = {
          x: kozpont.left + kozpont.width  / 2,
          y: kozpont.top  + kozpont.height / 2,
        };
        const eltX = (e.clientX - kp.x) * EROTETERO;
        const eltY = (e.clientY - kp.y) * EROTETERO;
        gomb.style.transform = `translate(${eltX}px, ${eltY}px)`;
        pending = false;
      });
    });

    gomb.addEventListener('mouseleave', () => {
      gomb.style.transform = 'translate(0, 0)';
    });
  });
}

function menuTabok() {
  const tabGombok = document.querySelectorAll('.menu-tab');
  const panelek   = document.querySelectorAll('.menu-panel');

  if (!tabGombok.length) return;

  tabGombok.forEach(tab => {
    tab.addEventListener('click', () => {
      const celPanel = tab.dataset.tab;

      tabGombok.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      panelek.forEach(panel => {
        panel.classList.remove('active');
        panel.style.opacity = '0';
      });

      const celpanel = document.getElementById(`tab-${celPanel}`);
      if (!celpanel) return;

      celpanel.classList.add('active');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          celpanel.style.transition = 'opacity 0.4s ease';
          celpanel.style.opacity    = '1';
        });
      });

      const ujKartyak = celpanel.querySelectorAll('.reveal');
      ujKartyak.forEach((kartya, i) => {
        kartya.classList.remove('visible');
        setTimeout(() => kartya.classList.add('visible'), i * 80 + 60);
      });
    });
  });

  const elsoPanel = document.querySelector('.menu-panel.active');
  if (elsoPanel) {
    const elsőKartyak = elsoPanel.querySelectorAll('.reveal');
    elsőKartyak.forEach((k, i) => {
      setTimeout(() => k.classList.add('visible'), i * 100 + 300);
    });
  }
}

function glowKartyak() {
  const kartyak = document.querySelectorAll('.event-card');
  if (!kartyak.length) return;

  kartyak.forEach(kartya => {
    let pending = false;
    kartya.addEventListener('mousemove', (e) => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        const kozpont = kartya.getBoundingClientRect();
        const x = ((e.clientX - kozpont.left) / kozpont.width)  * 100;
        const y = ((e.clientY - kozpont.top)  / kozpont.height) * 100;
        kartya.style.setProperty('--gx', `${x}%`);
        kartya.style.setProperty('--gy', `${y}%`);
        pending = false;
      });
    });
  });
}

function foglalasForm() {
  const gomb = document.getElementById('submitBtn');
  if (!gomb) return;

  const szovegElem = gomb.querySelector('.btn-glow__text');
  if (!szovegElem) return;

  const EREDETI_SZOVEG = szovegElem.textContent;

  gomb.addEventListener('click', () => {
    if (gomb.classList.contains('submitted')) return;
    gomb.classList.add('submitted');
    szovegElem.textContent = 'Elküldve — Hamarosan jelentkezünk!';
    setTimeout(() => {
      gomb.classList.remove('submitted');
      szovegElem.textContent = EREDETI_SZOVEG;
    }, 3500);
  });
}

function galeriaSzekció() {
  console.log('%cRetro Bár betöltve!', 'color: #c9a84c; font-size: 14px; font-weight: bold;');
}

function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const celId = link.getAttribute('href');
      const celElem = document.querySelector(celId);
      if (!celElem) return;
      e.preventDefault();
      const y = celElem.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  egyeniKurzor();
  scrollProgress();
  headerScroll();
  smoothScroll();

  parallaxHero();
  meteorok();
  scrambleText();
  typewriter();

  letterPullup();
  scrollReveal();
  countUp();

  spotlightKartyak();
  tiltKartyak();
  magnetikusGombok();
  menuTabok();
  glowKartyak();

  foglalasForm();
  galeriaSzekció();
});
