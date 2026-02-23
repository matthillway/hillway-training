// Hillway Training - Audio Player (Internal Site)
// Adapted from training-audio.js for GitHub Pages (no JWT auth)
// Progress: localStorage | URLs: get-audio-url-internal edge function

var AUDIO_INTERNAL_SUPABASE_URL = 'https://wlkxzlyxizkajlkureka.supabase.co';
var AUDIO_INTERNAL_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsa3h6bHl4aXprYWpsa3VyZWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjAyOTUsImV4cCI6MjA4MjkzNjI5NX0.INIobuEI1GxHDyKGa-hFU8gUMZ0U6Ete3LK7CaBO5Us';
var AUDIO_INTERNAL_KEY = 'D14064B7-1D95-4CF6-AE5C-B9F3D1A73C10';
var AUDIO_EDGE_URL = AUDIO_INTERNAL_SUPABASE_URL + '/functions/v1/get-audio-url-internal';

var AUDIO_SAVE_INTERVAL = 15000;
var AUDIO_COMPLETE_THRESHOLD = 0.9;
var AUDIO_URL_CACHE = {};
var AUDIO_FILES_MAP = {};
var AUDIO_SECTION_ORDER = [];
var AUDIO_COURSE_ID = null;
var AUDIO_CURRENT_SECTION = null;
var AUDIO_SAVE_TIMER = null;
var AUDIO_COMPLETED_SECTIONS = {};
var AUDIO_ELEMENT = null;
var AUDIO_PLAYER_VISIBLE = false;
var AUDIO_SEEKING = false;
var AUDIO_SPEED = 1;
var AUDIO_SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// ── Highlight Engine State ───────────────────────────────────────────
var AUDIO_ALIGNMENT = null;
var AUDIO_ACTIVE_BLOCK_IDX = -1;
var AUDIO_ACTIVE_WORD_IDX = -1;
var AUDIO_WRAPPED_BLOCK_EL = null;
var AUDIO_ALIGNMENT_CACHE = {};

// ── Initialization ──────────────────────────────────────────────────

async function trainingAudioInternalInit(courseId) {
  AUDIO_COURSE_ID = courseId;

  // Load audio file metadata via Supabase REST API (anon key)
  try {
    var res = await fetch(
      AUDIO_INTERNAL_SUPABASE_URL + '/rest/v1/audio_files?course_id=eq.' + encodeURIComponent(courseId) + '&select=section_id,duration_seconds,title,sort_order&order=sort_order.asc',
      {
        headers: {
          'apikey': AUDIO_INTERNAL_ANON_KEY,
          'Authorization': 'Bearer ' + AUDIO_INTERNAL_ANON_KEY
        }
      }
    );
    if (!res.ok) return;
    var data = await res.json();
    if (!data || data.length === 0) return;
  } catch (err) {
    return;
  }

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    AUDIO_FILES_MAP[row.section_id] = row;
    AUDIO_SECTION_ORDER.push(row.section_id);
  }

  // Load completed sections from localStorage
  var saved = _audioLoadLocalProgress();
  if (saved && saved.completed) {
    AUDIO_COMPLETED_SECTIONS = saved.completed;
  }

  // Create audio element
  AUDIO_ELEMENT = document.createElement('audio');
  AUDIO_ELEMENT.preload = 'metadata';
  document.body.appendChild(AUDIO_ELEMENT);

  _audioInjectButtons();
  _audioCreatePlayerBar();
  _audioBindEvents();
  _audioCheckResume();
}

// ── Listen Buttons ──────────────────────────────────────────────────

function _audioInjectButtons() {
  var sections = document.querySelectorAll('.section[id], section[id]');

  for (var i = 0; i < sections.length; i++) {
    var section = sections[i];
    var sectionId = section.id;

    if (/quiz|exercise/i.test(sectionId)) continue;

    var meta = AUDIO_FILES_MAP[sectionId];
    if (!meta) continue;

    var header = section.querySelector('.section-header');
    if (!header) continue;

    if (header.querySelector('.audio-listen-btn')) continue;

    var mins = Math.ceil(meta.duration_seconds / 60);
    var btn = document.createElement('button');
    btn.className = 'audio-listen-btn';
    btn.setAttribute('data-section', sectionId);
    btn.textContent = '\uD83C\uDFA7 ' + mins + ' min';
    btn.addEventListener('click', _audioOnListenClick);

    header.appendChild(btn);
  }
}

function _audioOnListenClick(e) {
  e.preventDefault();
  e.stopPropagation();
  var sectionId = this.getAttribute('data-section');
  _audioPlaySection(sectionId);
}

// ── Player Bar ──────────────────────────────────────────────────────
// SVG icons in _audioCreateCtrlBtn use innerHTML with static/hardcoded
// content only — no user input is involved. This is safe.

function _audioCreatePlayerBar() {
  var bar = document.createElement('div');
  bar.id = 'audio-player-bar';
  bar.className = 'audio-player-bar';

  var inner = document.createElement('div');
  inner.className = 'audio-player-inner';

  var trackDiv = document.createElement('div');
  trackDiv.className = 'audio-player-track';
  var trackTitle = document.createElement('div');
  trackTitle.className = 'audio-track-title';
  trackTitle.id = 'audio-track-title';
  trackTitle.textContent = 'No track loaded';
  trackDiv.appendChild(trackTitle);
  inner.appendChild(trackDiv);

  var controls = document.createElement('div');
  controls.className = 'audio-player-controls';

  var btnPrev = _audioCreateCtrlBtn('audio-btn-prev', 'Previous section', _audioSvgPrev());
  controls.appendChild(btnPrev);

  var btnBack = _audioCreateCtrlBtn('audio-btn-back', 'Back 15s', _audioSvgBack15());
  controls.appendChild(btnBack);

  var btnPlay = _audioCreateCtrlBtn('audio-btn-play', 'Play', _audioSvgPlayPause());
  btnPlay.classList.add('audio-ctrl-play');
  controls.appendChild(btnPlay);

  var btnFwd = _audioCreateCtrlBtn('audio-btn-fwd', 'Forward 30s', _audioSvgFwd30());
  controls.appendChild(btnFwd);

  var btnNext = _audioCreateCtrlBtn('audio-btn-next', 'Next section', _audioSvgNext());
  controls.appendChild(btnNext);

  inner.appendChild(controls);

  var progressDiv = document.createElement('div');
  progressDiv.className = 'audio-player-progress';

  var timeCurrent = document.createElement('span');
  timeCurrent.className = 'audio-time';
  timeCurrent.id = 'audio-time-current';
  timeCurrent.textContent = '0:00';
  progressDiv.appendChild(timeCurrent);

  var slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'audio-slider';
  slider.id = 'audio-slider';
  slider.min = '0';
  slider.max = '100';
  slider.value = '0';
  slider.step = '0.1';
  progressDiv.appendChild(slider);

  var timeTotal = document.createElement('span');
  timeTotal.className = 'audio-time';
  timeTotal.id = 'audio-time-total';
  timeTotal.textContent = '0:00';
  progressDiv.appendChild(timeTotal);

  inner.appendChild(progressDiv);

  var rightDiv = document.createElement('div');
  rightDiv.className = 'audio-player-right';

  var speedPicker = document.createElement('div');
  speedPicker.className = 'audio-speed-picker';
  speedPicker.id = 'audio-speed-picker';

  var speedBtn = document.createElement('button');
  speedBtn.className = 'audio-speed-btn';
  speedBtn.id = 'audio-speed-btn';
  speedBtn.textContent = '1x';
  speedPicker.appendChild(speedBtn);

  var speedMenu = document.createElement('div');
  speedMenu.className = 'audio-speed-menu';
  speedMenu.id = 'audio-speed-menu';
  speedPicker.appendChild(speedMenu);

  rightDiv.appendChild(speedPicker);

  var btnClose = _audioCreateCtrlBtn('audio-btn-close', 'Close player', _audioSvgClose());
  btnClose.classList.add('audio-ctrl-close');
  rightDiv.appendChild(btnClose);

  inner.appendChild(rightDiv);
  bar.appendChild(inner);
  document.body.appendChild(bar);

  for (var i = 0; i < AUDIO_SPEED_OPTIONS.length; i++) {
    var s = AUDIO_SPEED_OPTIONS[i];
    var opt = document.createElement('button');
    opt.className = 'audio-speed-option' + (s === 1 ? ' active' : '');
    opt.setAttribute('data-speed', s);
    opt.textContent = s + 'x';
    opt.addEventListener('click', _audioOnSpeedSelect);
    speedMenu.appendChild(opt);
  }

  btnPlay.addEventListener('click', _audioTogglePlay);
  btnBack.addEventListener('click', function() { _audioSkip(-15); });
  btnFwd.addEventListener('click', function() { _audioSkip(30); });
  btnPrev.addEventListener('click', _audioPrevSection);
  btnNext.addEventListener('click', _audioNextSection);
  btnClose.addEventListener('click', _audioClosePlayer);
  speedBtn.addEventListener('click', _audioToggleSpeedMenu);

  slider.addEventListener('input', _audioOnSliderInput);
  slider.addEventListener('change', _audioOnSliderChange);
  slider.addEventListener('mousedown', function() { AUDIO_SEEKING = true; });
  slider.addEventListener('touchstart', function() { AUDIO_SEEKING = true; });

  document.addEventListener('click', function(e) {
    if (!speedPicker.contains(e.target)) {
      speedMenu.classList.remove('open');
    }
  });
}

// Creates a control button with an SVG icon built from safe DOM elements
function _audioCreateCtrlBtn(id, title, iconFragment) {
  var btn = document.createElement('button');
  btn.className = 'audio-ctrl-btn';
  btn.id = id;
  btn.title = title;
  btn.appendChild(iconFragment);
  return btn;
}

// ── SVG Icon Builders (safe DOM, no innerHTML) ──────────────────────

function _svgEl(tag, attrs) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (attrs) {
    for (var k in attrs) {
      if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
    }
  }
  return el;
}

function _audioSvgPrev() {
  var frag = document.createDocumentFragment();
  var svg = _svgEl('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' });
  svg.appendChild(_svgEl('polygon', { points: '19 20 9 12 19 4' }));
  svg.appendChild(_svgEl('line', { x1: '5', y1: '19', x2: '5', y2: '5' }));
  frag.appendChild(svg);
  return frag;
}

function _audioSvgBack15() {
  var frag = document.createDocumentFragment();
  var label = document.createElement('span');
  label.className = 'audio-skip-label';
  label.textContent = '15';
  frag.appendChild(label);
  var svg = _svgEl('svg', { width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' });
  svg.appendChild(_svgEl('path', { d: 'M1 4v6h6' }));
  svg.appendChild(_svgEl('path', { d: 'M3.51 15a9 9 0 1 0 2.13-9.36L1 10' }));
  frag.appendChild(svg);
  return frag;
}

function _audioSvgPlayPause() {
  var frag = document.createDocumentFragment();
  var playSvg = _svgEl('svg', { class: 'audio-icon-play', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'currentColor' });
  playSvg.appendChild(_svgEl('polygon', { points: '5 3 19 12 5 21' }));
  frag.appendChild(playSvg);
  var pauseSvg = _svgEl('svg', { class: 'audio-icon-pause', width: '24', height: '24', viewBox: '0 0 24 24', fill: 'currentColor', style: 'display:none' });
  pauseSvg.appendChild(_svgEl('rect', { x: '6', y: '4', width: '4', height: '16' }));
  pauseSvg.appendChild(_svgEl('rect', { x: '14', y: '4', width: '4', height: '16' }));
  frag.appendChild(pauseSvg);
  return frag;
}

function _audioSvgFwd30() {
  var frag = document.createDocumentFragment();
  var label = document.createElement('span');
  label.className = 'audio-skip-label';
  label.textContent = '30';
  frag.appendChild(label);
  var svg = _svgEl('svg', { width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' });
  svg.appendChild(_svgEl('path', { d: 'M23 4v6h-6' }));
  svg.appendChild(_svgEl('path', { d: 'M20.49 15a9 9 0 1 1-2.12-9.36L23 10' }));
  frag.appendChild(svg);
  return frag;
}

function _audioSvgNext() {
  var frag = document.createDocumentFragment();
  var svg = _svgEl('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' });
  svg.appendChild(_svgEl('polygon', { points: '5 4 15 12 5 20' }));
  svg.appendChild(_svgEl('line', { x1: '19', y1: '5', x2: '19', y2: '19' }));
  frag.appendChild(svg);
  return frag;
}

function _audioSvgClose() {
  var frag = document.createDocumentFragment();
  var svg = _svgEl('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' });
  svg.appendChild(_svgEl('line', { x1: '18', y1: '6', x2: '6', y2: '18' }));
  svg.appendChild(_svgEl('line', { x1: '6', y1: '6', x2: '18', y2: '18' }));
  frag.appendChild(svg);
  return frag;
}

// ── Audio Events ────────────────────────────────────────────────────

function _audioBindEvents() {
  AUDIO_ELEMENT.addEventListener('timeupdate', function() {
    if (AUDIO_SEEKING) return;
    var slider = document.getElementById('audio-slider');
    var current = document.getElementById('audio-time-current');
    if (!slider || !AUDIO_ELEMENT.duration) return;

    var pct = (AUDIO_ELEMENT.currentTime / AUDIO_ELEMENT.duration) * 100;
    slider.value = pct;
    _audioUpdateSliderFill(slider, pct);
    current.textContent = _audioFormatTime(AUDIO_ELEMENT.currentTime);

    _highlightUpdate(AUDIO_ELEMENT.currentTime);

    if (AUDIO_CURRENT_SECTION && !AUDIO_COMPLETED_SECTIONS[AUDIO_CURRENT_SECTION]) {
      if (AUDIO_ELEMENT.currentTime / AUDIO_ELEMENT.duration >= AUDIO_COMPLETE_THRESHOLD) {
        AUDIO_COMPLETED_SECTIONS[AUDIO_CURRENT_SECTION] = true;
        _audioSaveLocalProgress();
        if (typeof trackSectionComplete === 'function') {
          trackSectionComplete(AUDIO_COURSE_ID, AUDIO_CURRENT_SECTION);
        }
      }
    }
  });

  AUDIO_ELEMENT.addEventListener('loadedmetadata', function() {
    var total = document.getElementById('audio-time-total');
    if (total) total.textContent = _audioFormatTime(AUDIO_ELEMENT.duration);
  });

  AUDIO_ELEMENT.addEventListener('ended', function() {
    _audioSetPlayIcon(false);
    _audioStopSaveTimer();
    _highlightCleanup();
    _audioSaveLocalProgress();
    _audioNextSection();
  });

  AUDIO_ELEMENT.addEventListener('play', function() {
    _audioSetPlayIcon(true);
    _audioStartSaveTimer();
  });

  AUDIO_ELEMENT.addEventListener('pause', function() {
    _audioSetPlayIcon(false);
    _audioStopSaveTimer();
    _audioSaveLocalProgress();
  });

  AUDIO_ELEMENT.addEventListener('error', function() {
    _audioSetPlayIcon(false);
    _audioStopSaveTimer();
    var title = document.getElementById('audio-track-title');
    if (title) title.textContent = 'Error loading audio';
  });
}

// ── Playback Controls ───────────────────────────────────────────────

async function _audioPlaySection(sectionId) {
  var meta = AUDIO_FILES_MAP[sectionId];
  if (!meta) return;

  _highlightCleanup();
  AUDIO_CURRENT_SECTION = sectionId;

  var title = document.getElementById('audio-track-title');
  if (title) title.textContent = meta.title || sectionId;

  _audioShowPlayer();

  var allBtns = document.querySelectorAll('.audio-listen-btn');
  for (var i = 0; i < allBtns.length; i++) {
    allBtns[i].classList.remove('active');
  }
  var activeBtn = document.querySelector('.audio-listen-btn[data-section="' + sectionId + '"]');
  if (activeBtn) activeBtn.classList.add('active');

  var url = await _audioGetUrl(sectionId, true);
  if (!url) {
    if (title) title.textContent = 'Failed to load audio';
    return;
  }

  AUDIO_ALIGNMENT = AUDIO_ALIGNMENT_CACHE[sectionId] || null;
  AUDIO_ACTIVE_BLOCK_IDX = -1;
  AUDIO_ACTIVE_WORD_IDX = -1;

  AUDIO_ELEMENT.src = url;
  AUDIO_ELEMENT.playbackRate = AUDIO_SPEED;

  var savedPos = _audioGetSavedPosition(sectionId);
  if (savedPos && savedPos > 0) {
    AUDIO_ELEMENT.currentTime = savedPos;
  }

  AUDIO_ELEMENT.play().catch(function() {});
}

function _audioTogglePlay() {
  if (!AUDIO_ELEMENT || !AUDIO_ELEMENT.src) return;
  if (AUDIO_ELEMENT.paused) {
    AUDIO_ELEMENT.play().catch(function() {});
  } else {
    AUDIO_ELEMENT.pause();
  }
}

function _audioSkip(seconds) {
  if (!AUDIO_ELEMENT || !AUDIO_ELEMENT.duration) return;
  AUDIO_ELEMENT.currentTime = Math.max(0, Math.min(AUDIO_ELEMENT.duration, AUDIO_ELEMENT.currentTime + seconds));
}

function _audioPrevSection() {
  if (!AUDIO_CURRENT_SECTION) return;
  var idx = AUDIO_SECTION_ORDER.indexOf(AUDIO_CURRENT_SECTION);
  if (idx > 0) {
    _audioPlaySection(AUDIO_SECTION_ORDER[idx - 1]);
  }
}

function _audioNextSection() {
  if (!AUDIO_CURRENT_SECTION) return;
  var idx = AUDIO_SECTION_ORDER.indexOf(AUDIO_CURRENT_SECTION);
  if (idx < AUDIO_SECTION_ORDER.length - 1) {
    _audioPlaySection(AUDIO_SECTION_ORDER[idx + 1]);
  }
}

function _audioClosePlayer() {
  if (AUDIO_ELEMENT && !AUDIO_ELEMENT.paused) {
    AUDIO_ELEMENT.pause();
  }
  _audioSaveLocalProgress();
  _highlightCleanup();
  _audioHidePlayer();
  AUDIO_CURRENT_SECTION = null;

  var allBtns = document.querySelectorAll('.audio-listen-btn');
  for (var i = 0; i < allBtns.length; i++) {
    allBtns[i].classList.remove('active');
  }
}

// ── Speed Control ───────────────────────────────────────────────────

function _audioToggleSpeedMenu() {
  var menu = document.getElementById('audio-speed-menu');
  if (menu) menu.classList.toggle('open');
}

function _audioOnSpeedSelect() {
  var speed = parseFloat(this.getAttribute('data-speed'));
  AUDIO_SPEED = speed;
  if (AUDIO_ELEMENT) AUDIO_ELEMENT.playbackRate = speed;

  var btn = document.getElementById('audio-speed-btn');
  if (btn) btn.textContent = speed + 'x';

  var opts = document.querySelectorAll('.audio-speed-option');
  for (var i = 0; i < opts.length; i++) {
    opts[i].classList.toggle('active', parseFloat(opts[i].getAttribute('data-speed')) === speed);
  }

  var menu = document.getElementById('audio-speed-menu');
  if (menu) menu.classList.remove('open');
}

// ── Slider ──────────────────────────────────────────────────────────

function _audioOnSliderInput() {
  AUDIO_SEEKING = true;
  var pct = parseFloat(this.value);
  _audioUpdateSliderFill(this, pct);
  var current = document.getElementById('audio-time-current');
  if (current && AUDIO_ELEMENT.duration) {
    current.textContent = _audioFormatTime((pct / 100) * AUDIO_ELEMENT.duration);
  }
}

function _audioOnSliderChange() {
  var pct = parseFloat(this.value);
  if (AUDIO_ELEMENT && AUDIO_ELEMENT.duration) {
    AUDIO_ELEMENT.currentTime = (pct / 100) * AUDIO_ELEMENT.duration;
  }
  AUDIO_SEEKING = false;
}

function _audioUpdateSliderFill(slider, pct) {
  slider.style.setProperty('--audio-progress', pct + '%');
}

// ── Player Visibility ───────────────────────────────────────────────

function _audioShowPlayer() {
  var bar = document.getElementById('audio-player-bar');
  if (!bar) return;
  AUDIO_PLAYER_VISIBLE = true;
  bar.classList.add('visible');
}

function _audioHidePlayer() {
  var bar = document.getElementById('audio-player-bar');
  if (!bar) return;
  AUDIO_PLAYER_VISIBLE = false;
  bar.classList.remove('visible');
}

function _audioSetPlayIcon(playing) {
  var playIcon = document.querySelector('.audio-icon-play');
  var pauseIcon = document.querySelector('.audio-icon-pause');
  if (playIcon) playIcon.style.display = playing ? 'none' : 'block';
  if (pauseIcon) pauseIcon.style.display = playing ? 'block' : 'none';
}

// ── Audio URL Fetching (via internal edge function) ─────────────────

async function _audioGetUrl(sectionId, includeAlignment) {
  var cached = AUDIO_URL_CACHE[sectionId];
  if (cached && cached.expires > Date.now()) {
    if (includeAlignment && !AUDIO_ALIGNMENT_CACHE[sectionId]) {
      // fall through to fetch
    } else {
      return cached.url;
    }
  }

  try {
    var response = await fetch(AUDIO_EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': AUDIO_INTERNAL_KEY
      },
      body: JSON.stringify({
        course_id: AUDIO_COURSE_ID,
        section_id: sectionId,
        include_alignment: !!includeAlignment
      })
    });

    if (!response.ok) return null;

    var data = await response.json();
    if (!data.url) return null;

    AUDIO_URL_CACHE[sectionId] = {
      url: data.url,
      expires: Date.now() + (50 * 60 * 1000)
    };

    if (data.alignment) {
      AUDIO_ALIGNMENT_CACHE[sectionId] = data.alignment;
    }

    return data.url;
  } catch (err) {
    return null;
  }
}

// ── Progress Persistence (localStorage) ─────────────────────────────

function _audioGetStorageKey() {
  return 'hillway-audio-progress-' + AUDIO_COURSE_ID;
}

function _audioLoadLocalProgress() {
  try {
    var raw = localStorage.getItem(_audioGetStorageKey());
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function _audioSaveLocalProgress() {
  if (!AUDIO_COURSE_ID) return;

  var existing = _audioLoadLocalProgress() || { positions: {}, completed: {}, lastPlayed: null };

  if (AUDIO_CURRENT_SECTION && AUDIO_ELEMENT && AUDIO_ELEMENT.duration) {
    existing.positions[AUDIO_CURRENT_SECTION] = {
      position: Math.floor(AUDIO_ELEMENT.currentTime),
      duration: Math.floor(AUDIO_ELEMENT.duration),
      updated: new Date().toISOString()
    };
    existing.lastPlayed = {
      section_id: AUDIO_CURRENT_SECTION,
      position: Math.floor(AUDIO_ELEMENT.currentTime),
      duration: Math.floor(AUDIO_ELEMENT.duration)
    };
  }

  existing.completed = AUDIO_COMPLETED_SECTIONS;

  try {
    localStorage.setItem(_audioGetStorageKey(), JSON.stringify(existing));
  } catch (e) {}
}

function _audioGetSavedPosition(sectionId) {
  var saved = _audioLoadLocalProgress();
  if (saved && saved.positions && saved.positions[sectionId]) {
    return saved.positions[sectionId].position;
  }
  return 0;
}

function _audioStartSaveTimer() {
  _audioStopSaveTimer();
  AUDIO_SAVE_TIMER = setInterval(function() {
    _audioSaveLocalProgress();
  }, AUDIO_SAVE_INTERVAL);
}

function _audioStopSaveTimer() {
  if (AUDIO_SAVE_TIMER) {
    clearInterval(AUDIO_SAVE_TIMER);
    AUDIO_SAVE_TIMER = null;
  }
}

// ── Resume Prompt ───────────────────────────────────────────────────

function _audioCheckResume() {
  var saved = _audioLoadLocalProgress();
  if (!saved || !saved.lastPlayed) return;

  var last = saved.lastPlayed;
  var meta = AUDIO_FILES_MAP[last.section_id];
  if (!meta) return;

  var pctDone = last.position / last.duration;
  if (pctDone >= 0.95) return;

  var remaining = Math.ceil((last.duration - last.position) / 60);
  var banner = document.createElement('div');
  banner.id = 'audio-resume-banner';
  banner.className = 'audio-resume-banner';

  var bannerInner = document.createElement('div');
  bannerInner.className = 'audio-resume-inner';

  var icon = document.createElement('span');
  icon.className = 'audio-resume-icon';
  icon.textContent = '\uD83C\uDFA7';
  bannerInner.appendChild(icon);

  var text = document.createElement('span');
  text.className = 'audio-resume-text';
  text.textContent = 'Continue listening to ';
  var strong = document.createElement('strong');
  strong.textContent = meta.title || last.section_id;
  text.appendChild(strong);
  text.appendChild(document.createTextNode(' (' + remaining + ' min left)'));
  bannerInner.appendChild(text);

  var resumeBtn = document.createElement('button');
  resumeBtn.className = 'audio-resume-btn';
  resumeBtn.id = 'audio-resume-play';
  resumeBtn.textContent = 'Resume';
  bannerInner.appendChild(resumeBtn);

  var dismissBtn = document.createElement('button');
  dismissBtn.className = 'audio-resume-dismiss';
  dismissBtn.id = 'audio-resume-dismiss';
  dismissBtn.textContent = '\u00D7';
  bannerInner.appendChild(dismissBtn);

  banner.appendChild(bannerInner);
  document.body.appendChild(banner);

  requestAnimationFrame(function() {
    banner.classList.add('visible');
  });

  resumeBtn.addEventListener('click', function() {
    banner.classList.remove('visible');
    setTimeout(function() { banner.remove(); }, 300);
    _audioPlaySection(last.section_id);
  });

  dismissBtn.addEventListener('click', function() {
    banner.classList.remove('visible');
    setTimeout(function() { banner.remove(); }, 300);
  });
}

// ── Utility ─────────────────────────────────────────────────────────

function _audioFormatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  var mins = Math.floor(seconds / 60);
  var secs = Math.floor(seconds % 60);
  return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// ── Highlight Engine ─────────────────────────────────────────────────

function _highlightFindBlock(time) {
  if (!AUDIO_ALIGNMENT || !AUDIO_ALIGNMENT.blocks) return -1;
  var blocks = AUDIO_ALIGNMENT.blocks;
  var lo = 0;
  var hi = blocks.length - 1;

  while (lo <= hi) {
    var mid = (lo + hi) >> 1;
    if (time < blocks[mid].startTime) {
      hi = mid - 1;
    } else if (time > blocks[mid].endTime) {
      lo = mid + 1;
    } else {
      return mid;
    }
  }
  return -1;
}

function _highlightFindWord(words, time) {
  var lo = 0;
  var hi = words.length - 1;

  while (lo <= hi) {
    var mid = (lo + hi) >> 1;
    if (time < words[mid].start) {
      hi = mid - 1;
    } else if (time > words[mid].end) {
      lo = mid + 1;
    } else {
      return mid;
    }
  }
  return -1;
}

function _highlightWrapWords(el, words) {
  if (!el || !words || !words.length) return;

  if (!el.hasAttribute('data-audio-wrapped')) {
    el.setAttribute('data-audio-wrapped', '1');
    var backup = el.cloneNode(true);
    backup.style.display = 'none';
    backup.className += ' audio-backup-node';
    backup.removeAttribute('data-audio-wrapped');
    el.parentNode.insertBefore(backup, el.nextSibling);
  }

  var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  var textNodes = [];
  var node;
  while ((node = walker.nextNode())) {
    if (node.textContent.trim()) textNodes.push(node);
  }

  var flatText = '';
  var nodeRanges = [];
  for (var i = 0; i < textNodes.length; i++) {
    nodeRanges.push({ node: textNodes[i], start: flatText.length, end: flatText.length + textNodes[i].textContent.length });
    flatText += textNodes[i].textContent;
  }

  var wordPositions = [];
  var searchFrom = 0;
  for (var w = 0; w < words.length; w++) {
    var wordStr = words[w].word;
    var pos = flatText.indexOf(wordStr, searchFrom);
    if (pos === -1) {
      pos = flatText.toLowerCase().indexOf(wordStr.toLowerCase(), searchFrom);
    }
    if (pos !== -1) {
      wordPositions.push({ wordIdx: w, start: pos, end: pos + wordStr.length });
      searchFrom = pos + wordStr.length;
    }
  }

  for (var n = textNodes.length - 1; n >= 0; n--) {
    var range = nodeRanges[n];
    var tn = range.node;
    var text = tn.textContent;
    var parts = [];
    var lastIdx = 0;

    for (var wp = 0; wp < wordPositions.length; wp++) {
      var wpos = wordPositions[wp];
      if (wpos.end <= range.start || wpos.start >= range.end) continue;

      var localStart = Math.max(0, wpos.start - range.start);
      var localEnd = Math.min(text.length, wpos.end - range.start);

      if (localStart > lastIdx) {
        parts.push({ text: text.slice(lastIdx, localStart), wordIdx: -1 });
      }
      parts.push({ text: text.slice(localStart, localEnd), wordIdx: wpos.wordIdx });
      lastIdx = localEnd;
    }

    if (lastIdx < text.length) {
      parts.push({ text: text.slice(lastIdx), wordIdx: -1 });
    }

    if (parts.length <= 1 && (parts.length === 0 || parts[0].wordIdx === -1)) continue;

    var frag = document.createDocumentFragment();
    for (var p = 0; p < parts.length; p++) {
      if (parts[p].wordIdx >= 0) {
        var span = document.createElement('span');
        span.className = 'audio-word';
        span.setAttribute('data-word-idx', String(parts[p].wordIdx));
        span.textContent = parts[p].text;
        span.addEventListener('click', _highlightOnWordClick);
        frag.appendChild(span);
      } else {
        frag.appendChild(document.createTextNode(parts[p].text));
      }
    }

    tn.parentNode.replaceChild(frag, tn);
  }
}

function _highlightUnwrapWords(el) {
  if (!el || !el.hasAttribute('data-audio-wrapped')) return;

  var backup = el.nextElementSibling;
  if (backup && backup.classList.contains('audio-backup-node')) {
    while (el.firstChild) el.removeChild(el.firstChild);
    while (backup.firstChild) el.appendChild(backup.firstChild);
    backup.parentNode.removeChild(backup);
  }
  el.removeAttribute('data-audio-wrapped');
}

function _highlightUpdate(currentTime) {
  if (!AUDIO_ALIGNMENT || !AUDIO_ALIGNMENT.blocks) return;

  var blockIdx = _highlightFindBlock(currentTime);

  if (blockIdx !== AUDIO_ACTIVE_BLOCK_IDX) {
    if (AUDIO_ACTIVE_BLOCK_IDX >= 0 && AUDIO_WRAPPED_BLOCK_EL) {
      AUDIO_WRAPPED_BLOCK_EL.classList.remove('audio-block-active');
      _highlightUnwrapWords(AUDIO_WRAPPED_BLOCK_EL);
      AUDIO_WRAPPED_BLOCK_EL = null;
    }

    AUDIO_ACTIVE_BLOCK_IDX = blockIdx;
    AUDIO_ACTIVE_WORD_IDX = -1;

    if (blockIdx >= 0) {
      var block = AUDIO_ALIGNMENT.blocks[blockIdx];
      var el = document.querySelector(block.selector);
      if (el) {
        el.classList.add('audio-block-active');
        _highlightWrapWords(el, block.words);
        AUDIO_WRAPPED_BLOCK_EL = el;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  if (blockIdx >= 0 && AUDIO_ALIGNMENT.blocks[blockIdx]) {
    var words = AUDIO_ALIGNMENT.blocks[blockIdx].words;
    var wordIdx = _highlightFindWord(words, currentTime);

    if (wordIdx !== AUDIO_ACTIVE_WORD_IDX) {
      if (AUDIO_ACTIVE_WORD_IDX >= 0 && AUDIO_WRAPPED_BLOCK_EL) {
        var prevSpan = AUDIO_WRAPPED_BLOCK_EL.querySelector('[data-word-idx="' + AUDIO_ACTIVE_WORD_IDX + '"]');
        if (prevSpan) prevSpan.classList.remove('audio-word-active');
      }

      AUDIO_ACTIVE_WORD_IDX = wordIdx;

      if (wordIdx >= 0 && AUDIO_WRAPPED_BLOCK_EL) {
        var activeSpan = AUDIO_WRAPPED_BLOCK_EL.querySelector('[data-word-idx="' + wordIdx + '"]');
        if (activeSpan) activeSpan.classList.add('audio-word-active');
      }
    }
  }
}

function _highlightCleanup() {
  if (AUDIO_WRAPPED_BLOCK_EL) {
    AUDIO_WRAPPED_BLOCK_EL.classList.remove('audio-block-active');
    _highlightUnwrapWords(AUDIO_WRAPPED_BLOCK_EL);
    AUDIO_WRAPPED_BLOCK_EL = null;
  }

  var activeBlocks = document.querySelectorAll('.audio-block-active');
  for (var i = 0; i < activeBlocks.length; i++) {
    activeBlocks[i].classList.remove('audio-block-active');
    _highlightUnwrapWords(activeBlocks[i]);
  }

  var backups = document.querySelectorAll('.audio-backup-node');
  for (var j = 0; j < backups.length; j++) {
    backups[j].parentNode.removeChild(backups[j]);
  }

  AUDIO_ALIGNMENT = null;
  AUDIO_ACTIVE_BLOCK_IDX = -1;
  AUDIO_ACTIVE_WORD_IDX = -1;
}

function _highlightOnWordClick(e) {
  e.preventDefault();
  e.stopPropagation();
  if (!AUDIO_ELEMENT || !AUDIO_ALIGNMENT) return;

  var wordIdx = parseInt(this.getAttribute('data-word-idx'), 10);
  if (isNaN(wordIdx) || AUDIO_ACTIVE_BLOCK_IDX < 0) return;

  var block = AUDIO_ALIGNMENT.blocks[AUDIO_ACTIVE_BLOCK_IDX];
  if (!block || !block.words[wordIdx]) return;

  AUDIO_ELEMENT.currentTime = block.words[wordIdx].start;
  if (AUDIO_ELEMENT.paused) {
    AUDIO_ELEMENT.play().catch(function() {});
  }
}
