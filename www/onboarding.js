/* First-run onboarding carousel for the desktop app.
   Injected by scripts/sync-web.sh after every website sync, so this
   survives re-syncing www/ from the site repo — customize the SLIDES
   array below to change the copy, it's the only thing you should need
   to touch. (Splash-screen hand-off is handled separately, in main.js —
   this script only owns the onboarding overlay.) */
(function () {
  var STORAGE_KEY = 'sidita_panel_onboarded_v1';

  var SLIDES = [
    {
      icon: 'S',
      title: 'Welcome to Sidita Panel',
      desc: 'Manage fleet operations, orders, and customers from one dashboard.'
    },
    {
      icon: '\u2713',
      title: 'Real-time insights',
      desc: 'Charts and activity update live as things happen out in the field.'
    },
    {
      icon: '\u2192',
      title: "You're all set",
      desc: 'Press Esc anytime to exit fullscreen. Ready to get started?'
    }
  ];

  function alreadyOnboarded() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function markOnboarded() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) { /* ignore */ }
  }

  function buildOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'sidita-onboarding';

    var skip = document.createElement('button');
    skip.className = 'sidita-onb-skip';
    skip.type = 'button';
    skip.textContent = 'Skip';
    overlay.appendChild(skip);

    var body = document.createElement('div');
    body.className = 'sidita-onb-body';

    var icon = document.createElement('div');
    icon.className = 'sidita-onb-icon';
    body.appendChild(icon);

    var title = document.createElement('h1');
    title.className = 'sidita-onb-title';
    body.appendChild(title);

    var desc = document.createElement('p');
    desc.className = 'sidita-onb-desc';
    body.appendChild(desc);

    overlay.appendChild(body);

    var dots = document.createElement('div');
    dots.className = 'sidita-onb-dots';
    SLIDES.forEach(function () {
      var d = document.createElement('div');
      d.className = 'sidita-onb-dot';
      dots.appendChild(d);
    });
    overlay.appendChild(dots);

    var next = document.createElement('button');
    next.className = 'sidita-onb-next';
    next.type = 'button';
    overlay.appendChild(next);

    document.body.appendChild(overlay);

    var index = 0;

    function render() {
      var s = SLIDES[index];
      icon.textContent = s.icon;
      title.textContent = s.title;
      desc.textContent = s.desc;
      Array.prototype.forEach.call(dots.children, function (d, i) {
        d.classList.toggle('active', i === index);
      });
      next.textContent = index === SLIDES.length - 1 ? 'Open Dashboard' : 'Next';
      skip.style.visibility = index === SLIDES.length - 1 ? 'hidden' : 'visible';
    }

    function advance() {
      if (index < SLIDES.length - 1) {
        index += 1;
        render();
      } else {
        finish();
      }
    }

    function back() {
      if (index > 0) {
        index -= 1;
        render();
      }
    }

    function finish() {
      markOnboarded();
      overlay.classList.add('sidita-onboarding-hidden');
      setTimeout(function () {
        overlay.remove();
      }, 400);
    }

    next.addEventListener('click', advance);
    skip.addEventListener('click', finish);

    document.addEventListener('keydown', function onKey(e) {
      if (!document.body.contains(overlay)) {
        document.removeEventListener('keydown', onKey);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') advance();
      if (e.key === 'ArrowLeft') back();
      if (e.key === 'Escape') finish();
    });

    render();
  }

  function init() {
    if (alreadyOnboarded()) return;
    buildOverlay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
