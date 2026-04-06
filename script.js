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

// #KURZOR — custom cursor pont + lerp gyűrű
function egyeniKurzor() {
  const kursorPont = document.getElementById('cursor');
  const kursorGyuru = document.getElementById('cursorRing');

  if (!kursorPont || !kursorGyuru) return;

  // Aktuális egér pozíció
  let egerX = -100, egerY = -100;
  // Gyűrű pillanatnyi pozíciója (lerp miatt késik)
  let gyuruX = -100, gyuruY = -100;

  // Egér mozgáskor frissítjük az egerX/Y értéket
  document.addEventListener('mousemove', (e) => {
    egerX = e.clientX;
    egerY = e.clientY;

    // Azonnali pont — transform, nem left/top (GPU composited, no layout)
    kursorPont.style.transform = `translate(${egerX - 5}px, ${egerY - 5}px)`;
  });

  // rAF loop: gyűrű lassabban követi (lerp faktor: 0.12)
  rafKor.add(() => {
    const dx = egerX - gyuruX;
    const dy = egerY - gyuruY;
    // Ha elég közel van, ne számolj feleslegesen
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      gyuruX += dx * 0.12;
      gyuruY += dy * 0.12;
      kursorGyuru.style.transform = `translate(${gyuruX - 19}px, ${gyuruY - 19}px)`;
    }
  });

  // Hover állapot: linkek/gombok felett nagyobb kurzor
  const interaktivElemek = document.querySelectorAll(
    'a, button, [data-magnetic], input, .menu-card, .gallery-item'
  );

  interaktivElemek.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Ha az egér kilép az ablakból — elrejtjük
  document.addEventListener('mouseleave', () => {
    kursorPont.style.opacity  = '0';
    kursorGyuru.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    kursorPont.style.opacity  = '1';
    kursorGyuru.style.opacity = '1';
  });
}

// #SCROLL — oldal tetején progress csík
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
  frissit(); // Kezdeti állapot
}

// #HEADER — scroll után frosted glass
function headerScroll() {
  const fejlec = document.getElementById('header');
  if (!fejlec) return;

  window.addEventListener('scroll', () => {
    fejlec.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// #PARALLAX — hero fotó lassabb scroll
function parallaxHero() {
  const fotó = document.getElementById('heroPhoto');
  if (!fotó) return;

  window.addEventListener('scroll', () => {
    const eltolas = window.scrollY * 0.28;
    fotó.style.transform = `scale(1.1) translateY(${eltolas}px)`;
  }, { passive: true });
}

// #METEOR — inspira-ui Meteors: div-ek generálása
function meteorok() {
  const tároló = document.getElementById('meteorsContainer');
  if (!tároló) return;

  const METEOR_DARAB = 14;

  for (let i = 0; i < METEOR_DARAB; i++) {
    const meteor = document.createElement('div');
    meteor.className = 'meteor';

    // Véletlenszerű vízszintes pozíció
    const balra = Math.random() * 100;

    // Véletlenszerű időtartam (2.5s és 5s között)
    const időtartam = 2.5 + Math.random() * 2.5;

    // Véletlenszerű késleltetés (0-8s)
    const késleltetés = Math.random() * 8;

    // Véletlenszerű magasság (50px-120px)
    const magasság = 50 + Math.random() * 70;

    // Véletlenszerű átlátszóság (0.4-0.9)
    const atlatszosag = 0.4 + Math.random() * 0.5;

    meteor.style.cssText = `
      left: ${balra}%;
      --duration: ${időtartam}s;
      --delay: ${késleltetés}s;
      height: ${magasság}px;
      opacity: ${atlatszosag};
    `;

    tároló.appendChild(meteor);
  }
}

// #SCRAMBLE — reactbits Encrypted Text: cím véletlenszerű karakterekből dekódol
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

    // Megvárjuk a hero animáció kezdetét
    setTimeout(() => {
      const intervallum = setInterval(() => {
        // Minden frame-ben: egy kicsit több "megfejtett" betű
        const megfejtettHossz = Math.floor((frame / 30) * vegsoSzoveg.length);

        elem.textContent = vegsoSzoveg
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';  // szóközök maradnak
            if (i < megfejtettHossz) return char;  // megfejtett betűk maradnak
            return veletlenKar();  // a többi véletlenszerű
          })
          .join('');

        frame++;

        // Ha minden megfejtve, leállítjuk
        if (frame > 30) {
          clearInterval(intervallum);
          elem.textContent = vegsoSzoveg;
        }
      }, 40); // ~25fps
    }, kesleltetesMs);
  }

  // Az "Retro" és "Bár" span-eket eltérő késleltetéssel indítjuk
  elemek.forEach((el, i) => {
    scrambleElem(el, 400 + i * 200);
  });
}

// #TYPEWRITER — alcím gépelős effekt
function typewriter() {
  const elem = document.getElementById('heroSubtitle');
  if (!elem) return;

  const SZOVEG    = 'Klasszikus hangulat · Kézműves italok';
  const KARAKTER_IDOS = 55;  // ms karakterenként

  let i = 0;

  // Megvárjuk a hero animáció kezdetét (~1.2s)
  setTimeout(() => {
    const intervallum = setInterval(() => {
      elem.textContent += SZOVEG[i];
      i++;

      if (i >= SZOVEG.length) {
        clearInterval(intervallum);
        // Kurzor eltüntetése pár másodperccel a gépelés után
        setTimeout(() => elem.classList.add('typed-done'), 2000);
      }
    }, KARAKTER_IDOS);
  }, 1200);
}

// #PULLUP — inspira-ui Letter Pullup: betűnként translateY reveal
function letterPullup() {
  const elemek = document.querySelectorAll('[data-pullup]');
  if (!elemek.length) return;

  elemek.forEach(elem => {
    // Eredeti HTML mentése (az <em> tagek miatt)
    const eredetiHTML = elem.innerHTML;

    // Temp div segítségével szedjük szét a szöveget
    const temp = document.createElement('div');
    temp.innerHTML = eredetiHTML;

    // Szavakat white-space:nowrap wrap-be rakjuk, hogy ne törjön félbe egy szó
    function szovegetDarabol(node, delay = { current: 0 }) {
      if (node.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        // Szavanként dolgozzuk fel, hogy a sortörés szóhatáron legyen
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

          // Egy szót white-space:nowrap span-be zárunk
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

    // Üresítjük és újraépítjük
    elem.innerHTML = '';
    const kesleltetesObj = { current: 0 };

    temp.childNodes.forEach(node => {
      elem.appendChild(szovegetDarabol(node, kesleltetesObj));
    });
  });

  // IntersectionObserver: látható-e az elem?
  const megfigyelo = new IntersectionObserver((bejegyzesek) => {
    bejegyzesek.forEach(b => {
      if (b.isIntersecting) {
        b.target.classList.add('pulled');
        megfigyelo.unobserve(b.target); // Egyszer elég
      }
    });
  }, { threshold: 0.2 });

  elemek.forEach(el => megfigyelo.observe(el));
}

// #REVEAL — IntersectionObserver .visible class
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

// #COUNTUP — stat számok 0-tól animálódnak
function countUp() {
  const elemek = document.querySelectorAll('.stat-number[data-target]');
  if (!elemek.length) return;

  const megfigyelo = new IntersectionObserver((bejegyzesek) => {
    bejegyzesek.forEach(b => {
      if (!b.isIntersecting || b.target.dataset.szamolva) return;

      b.target.dataset.szamolva = 'igen'; // Ne fusson kétszer
      const celErtek = parseInt(b.target.dataset.target);
      const ido      = 1600; // ms
      const kezdes   = performance.now();

      function ticker(most) {
        const eltelt   = most - kezdes;
        const haladás  = Math.min(eltelt / ido, 1);
        // easeOutCubic: gyorsan indul, lassan ér célba
        const simítva  = 1 - Math.pow(1 - haladás, 3);

        b.target.textContent = Math.round(simítva * celErtek);

        if (haladás < 1) requestAnimationFrame(ticker);
      }

      requestAnimationFrame(ticker);
    });
  }, { threshold: 0.5 });

  elemek.forEach(el => megfigyelo.observe(el));
}

// #SPOTLIGHT — inspira-ui Card Spotlight: egérkövető radial-gradient
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

        // Pozíció a kártya belsejéhez képest (%-ban)
        const x = ((e.clientX - kozpont.left) / kozpont.width)  * 100;
        const y = ((e.clientY - kozpont.top)  / kozpont.height) * 100;

        // CSS custom property frissítése — CSS olvasni fogja
        kartya.style.setProperty('--x', `${x}%`);
        kartya.style.setProperty('--y', `${y}%`);
        pending = false;
      });
    });
  });
}

// #TILT — reactbits Tilt Card: 3D perspective rotateX/Y
function tiltKartyak() {
  const kartyak = document.querySelectorAll('[data-tilt]');
  if (!kartyak.length) return;

  const TILT_MAX  = 8;   // Maximális fokszám (kisebb = finomabb)
  const TILT_ALAP = 600; // perspective px

  kartyak.forEach(kartya => {
    let pending = false;
    kartya.addEventListener('mousemove', (e) => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        const kozpont = kartya.getBoundingClientRect();

        // -0.5 és 0.5 közötti értékek
        const relX = (e.clientX - kozpont.left) / kozpont.width  - 0.5;
        const relY = (e.clientY - kozpont.top)  / kozpont.height - 0.5;

        // rotateY: vízszintes tengely körül (bal-jobb dőlés)
        // rotateX: függőleges tengely körül (fel-le dőlés)
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

    // Visszaáll alapállapotba amikor az egér elhagyja
    kartya.addEventListener('mouseleave', () => {
      kartya.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
      kartya.style.transform  = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';

      // Transition visszaállítása (hogy a mozgás gyorsabb legyen)
      setTimeout(() => {
        kartya.style.transition = '';
      }, 500);
    });
  });
}

// #MAGNETIC — reactbits Magnetic Button: gomb vonzódik az egérhez
function magnetikusGombok() {
  const gombok = document.querySelectorAll('[data-magnetic]');
  if (!gombok.length) return;

  const EROTETERO = 0.4; // 0-1 között — mennyire erős a vonzás

  gombok.forEach(gomb => {
    let pending = false;
    gomb.addEventListener('mousemove', (e) => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        const kozpont = gomb.getBoundingClientRect();

        // Kártya közepéhez képest
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
      // Visszapattan az eredeti helyére (CSS transition kezeli)
      gomb.style.transform = 'translate(0, 0)';
    });
  });
}

// #TABVAITAS — tab navigáció + panel fade
function menuTabok() {
  const tabGombok = document.querySelectorAll('.menu-tab');
  const panelek   = document.querySelectorAll('.menu-panel');

  if (!tabGombok.length) return;

  tabGombok.forEach(tab => {
    tab.addEventListener('click', () => {
      const celPanel = tab.dataset.tab;

      // Tab állapot frissítése
      tabGombok.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Panelek állapota
      panelek.forEach(panel => {
        panel.classList.remove('active');
        panel.style.opacity = '0';
      });

      const celpanel = document.getElementById(`tab-${celPanel}`);
      if (!celpanel) return;

      celpanel.classList.add('active');

      // Fade in animáció
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          celpanel.style.transition = 'opacity 0.4s ease';
          celpanel.style.opacity    = '1';
        });
      });

      // Az újonnan megjelent kártyákon re-reveal animáció
      const ujKartyak = celpanel.querySelectorAll('.reveal');
      ujKartyak.forEach((kartya, i) => {
        kartya.classList.remove('visible');
        setTimeout(() => kartya.classList.add('visible'), i * 80 + 60);
      });
    });
  });

  // Az első panel kártyái is revelálnak oldalbetöltéskor
  const elsoPanel = document.querySelector('.menu-panel.active');
  if (elsoPanel) {
    const elsőKartyak = elsoPanel.querySelectorAll('.reveal');
    elsőKartyak.forEach((k, i) => {
      setTimeout(() => k.classList.add('visible'), i * 100 + 300);
    });
  }
}

// #GLOW — inspira-ui Glowing Effect: event kártya glow overlay
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

// #FORM — submit gomb visszajelzés
function foglalasForm() {
  const gomb = document.getElementById('submitBtn');
  if (!gomb) return;

  const szovegElem = gomb.querySelector('.btn-glow__text');
  if (!szovegElem) return;

  const EREDETI_SZOVEG = szovegElem.textContent;

  gomb.addEventListener('click', () => {
    // Megakadályozzuk a kettős kattintást
    if (gomb.classList.contains('submitted')) return;

    gomb.classList.add('submitted');
    szovegElem.textContent = 'Elküldve — Hamarosan jelentkezünk!';

    // 3.5 másodperc múlva visszaáll
    setTimeout(() => {
      gomb.classList.remove('submitted');
      szovegElem.textContent = EREDETI_SZOVEG;
    }, 3500);
  });
}

function galeriaSzekció() {
  // A CSS önmagában kezeli az expandable effektet (flex: 1 → flex: 3)
  // Ha kellene JS logika, itt lenne — egyelőre CSS-re bízzuk :)
  console.log('%c🍸 Retro Bár betöltve!', 'color: #c9a84c; font-size: 14px; font-weight: bold;');
}

function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const celId = link.getAttribute('href');
      const celElem = document.querySelector(celId);

      if (!celElem) return;

      e.preventDefault();

      const yOffset    = -80; // header magasság miatt
      const y          = celElem.getBoundingClientRect().top + window.scrollY + yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {

  // Alap infrastruktúra
  egyeniKurzor();      // Először a kurzor — ne "ugorjon be"
  scrollProgress();    // Progress bar
  headerScroll();      // Header glass morph
  smoothScroll();      // Nav linkek

  // Hero effektek
  parallaxHero();      // Háttérkép parallax
  meteorok();          // Meteor részecskék generálása
  scrambleText();      // Cím scramble
  typewriter();        // Alcím typewriter

  // Szekció animációk
  letterPullup();      // Betűnkénti cím reveal (ezelőtt kell futni, mielőtt a reveal triggerelnének)
  scrollReveal();      // IntersectionObserver reveal
  countUp();           // Számok animációja

  // Interakciók
  spotlightKartyak();  // Menu kártya spotlight
  tiltKartyak();       // 3D tilt
  magnetikusGombok();  // Magnetic button
  menuTabok();         // Tab navigáció
  glowKartyak();       // Event kártya glow

  // Egyéb
  foglalasForm();      // Form feedback
  galeriaSzekció();    // Galéria (CSS-alapú, de debug log itt van)

});
