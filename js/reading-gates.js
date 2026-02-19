/**
 * Hillway Training — Reading Gates
 *
 * Enforces reading verification across all Hillway training courses.
 * Requires users to spend minimum time reading and scroll through content
 * before quizzes unlock. Enforces sequential day progression.
 *
 * Include AFTER supabase-client.js in course HTML files.
 * Self-initialises on DOMContentLoaded.
 */
(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================

  var WORDS_PER_MINUTE = 150;
  var MIN_SECONDS_PER_SECTION = 180; // 3 minutes minimum
  var SCROLL_THRESHOLD = 0.8; // 80% scroll required
  var TICK_INTERVAL = 1000; // Update every second
  var STORAGE_PREFIX = 'hillway-reading-gates-';

  // Hillway brand colours
  var COLORS = {
    navy: '#0f172a',
    blue: '#1e40af',
    lightBlue: '#0ea5e9',
    green: '#16a34a',
    gray400: '#94a3b8',
    gray500: '#64748b',
    gray600: '#475569',
    gray200: '#e2e8f0',
    gray100: '#f1f5f9',
    white: '#ffffff',
    amber: '#d97706',
    red: '#dc2626'
  };

  // ============================================================
  // ADMIN OVERRIDE
  // ============================================================

  var urlParams = new URLSearchParams(window.location.search);
  var isAdmin = urlParams.get('admin') === 'true';

  if (isAdmin) {
    console.log('[ReadingGates] Admin mode active — all gates bypassed.');
  }

  // ============================================================
  // DOM HELPER — safe element construction (no innerHTML)
  // ============================================================

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function(key) {
        if (key === 'className') {
          node.className = attrs[key];
        } else if (key === 'textContent') {
          node.textContent = attrs[key];
        } else {
          node.setAttribute(key, attrs[key]);
        }
      });
    }
    if (children) {
      children.forEach(function(child) {
        if (typeof child === 'string') {
          node.appendChild(document.createTextNode(child));
        } else if (child) {
          node.appendChild(child);
        }
      });
    }
    return node;
  }

  // ============================================================
  // COURSE DETECTION
  // ============================================================

  function detectCourseName() {
    var path = window.location.pathname;
    var filename = path.split('/').pop().replace('.html', '');

    var courseMap = {
      'property-management': 'property-management',
      'claude-code-training': 'claude-code-training',
      'ai-digital-transformation': 'ai-digital-transformation',
      'property-fundamentals': 'property-fundamentals'
    };

    return courseMap[filename] || filename;
  }

  var COURSE_NAME = detectCourseName();
  var STORAGE_KEY = STORAGE_PREFIX + COURSE_NAME;

  // ============================================================
  // LOCALSTORAGE PERSISTENCE
  // ============================================================

  function loadGateState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveGateState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getSectionState(sectionId) {
    var state = loadGateState();
    if (!state.sections) state.sections = {};
    if (!state.sections[sectionId]) {
      state.sections[sectionId] = {
        timeSpent: 0,
        maxScrollPct: 0,
        readingComplete: false
      };
    }
    return state.sections[sectionId];
  }

  function saveSectionState(sectionId, sectionState) {
    var state = loadGateState();
    if (!state.sections) state.sections = {};
    state.sections[sectionId] = sectionState;
    saveGateState(state);
  }

  // ============================================================
  // STRUCTURE DETECTION — Identify days, content sections, quizzes
  // ============================================================

  function parseDayStructure() {
    var allSections = Array.from(document.querySelectorAll('.section, .fade-in'));

    // Deduplicate (elements with both .section and .fade-in)
    var seen = new Set();
    var unique = [];
    allSections.forEach(function(s) {
      if (!seen.has(s)) {
        seen.add(s);
        unique.push(s);
      }
    });
    allSections = unique;

    var days = [];
    var dayMap = {};

    allSections.forEach(function(section) {
      var id = section.id || '';
      if (!id) return;

      var dayNum = null;
      var isQuiz = false;

      // Quiz section patterns across all 4 courses
      var quizPatterns = [
        /^quiz[_-]?(\d+)$/,           // quiz1, quiz-1
        /^quiz[_-]day[_-]?(\d+)$/,    // quiz-day1
        /^day[_-]?(\d+)[_-]quiz$/     // day1-quiz
      ];

      for (var i = 0; i < quizPatterns.length; i++) {
        var match = id.match(quizPatterns[i]);
        if (match && match[1]) {
          dayNum = parseInt(match[1], 10);
          isQuiz = true;
          break;
        }
      }

      // Skip final quiz / assessment / takeaway sections
      if (id.startsWith('final-') || id === 'final-quiz' ||
          id === 'final-assessment' || id === 'takeaways') return;

      // Content section patterns
      if (!isQuiz) {
        var contentPatterns = [
          /^d(\d+)[_-]/,               // d1-intro, d2-clauses
          /^day(\d+)[_-]/              // day1-what-is-ai, day1-s1-content
        ];

        for (var j = 0; j < contentPatterns.length; j++) {
          var cmatch = id.match(contentPatterns[j]);
          if (cmatch) {
            dayNum = parseInt(cmatch[1], 10);
            break;
          }
        }
      }

      if (dayNum === null) return;

      if (!dayMap[dayNum]) {
        dayMap[dayNum] = {
          dayNum: dayNum,
          dayHeaderEl: null,
          contentSections: [],
          quizSection: null,
          quizContainer: null
        };
      }

      if (isQuiz) {
        dayMap[dayNum].quizSection = section;
        dayMap[dayNum].quizContainer = section.querySelector('.quiz-container');
      } else {
        dayMap[dayNum].contentSections.push(section);
      }
    });

    // Find day-header elements
    document.querySelectorAll('.day-header').forEach(function(header) {
      var id = header.id || '';
      var match = id.match(/^day(\d+)$/);
      if (match) {
        var dayNum = parseInt(match[1], 10);
        if (dayMap[dayNum]) {
          dayMap[dayNum].dayHeaderEl = header;
        }
      }
    });

    // Convert to sorted array
    var dayNums = Object.keys(dayMap).map(Number).sort(function(a, b) { return a - b; });
    dayNums.forEach(function(num) {
      days.push(dayMap[num]);
    });

    return days;
  }

  // ============================================================
  // WORD COUNTING
  // ============================================================

  function countSectionWords(section) {
    var clone = section.cloneNode(true);

    // Remove non-content elements
    clone.querySelectorAll('.quiz-container, .quiz-question, button, .rg-section-progress, .rg-quiz-lock-overlay').forEach(function(e) {
      e.remove();
    });

    var text = (clone.textContent || clone.innerText || '').trim();
    var words = text.split(/\s+/).filter(function(w) { return w.length > 0; });
    return words.length;
  }

  function calculateReadingTime(wordCount) {
    var minutes = wordCount / WORDS_PER_MINUTE;
    var seconds = Math.ceil(minutes * 60);
    return Math.max(seconds, MIN_SECONDS_PER_SECTION);
  }

  // ============================================================
  // SCROLL TRACKING
  // ============================================================

  function getSectionScrollProgress(section) {
    var rect = section.getBoundingClientRect();
    var sectionTop = rect.top + window.scrollY;
    var sectionHeight = section.offsetHeight;
    var viewportHeight = window.innerHeight;
    var scrollY = window.scrollY;

    if (sectionHeight <= viewportHeight) {
      if (scrollY + viewportHeight >= sectionTop + sectionHeight * 0.5) {
        return 1;
      }
      return 0;
    }

    var sectionBottom = sectionTop + sectionHeight;
    var viewportBottom = scrollY + viewportHeight;

    if (viewportBottom <= sectionTop) return 0;
    if (viewportBottom >= sectionBottom) return 1;

    var scrolledThrough = viewportBottom - sectionTop;
    return Math.min(scrolledThrough / sectionHeight, 1);
  }

  // ============================================================
  // FORMATTING HELPERS
  // ============================================================

  function formatTime(totalSeconds) {
    var mins = Math.floor(totalSeconds / 60);
    var secs = totalSeconds % 60;
    if (mins > 0) {
      return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
    return '0:' + (secs < 10 ? '0' : '') + secs;
  }

  // ============================================================
  // CSS INJECTION
  // ============================================================

  function injectStyles() {
    var style = document.createElement('style');
    style.id = 'reading-gates-styles';
    style.textContent = [
      '.rg-section-progress {',
      '  display: flex; align-items: center; gap: 12px;',
      '  padding: 12px 16px; margin-bottom: 16px;',
      '  background: ' + COLORS.gray100 + ';',
      '  border-radius: 10px; border: 1px solid ' + COLORS.gray200 + ';',
      '  font-size: 13px; color: ' + COLORS.gray600 + ';',
      '  transition: all 0.4s ease;',
      '}',
      '.rg-section-progress.complete {',
      '  background: #f0fdf4; border-color: #bbf7d0; color: ' + COLORS.green + ';',
      '}',
      '.rg-progress-track {',
      '  flex: 1; height: 6px; background: ' + COLORS.gray200 + ';',
      '  border-radius: 3px; overflow: hidden; position: relative;',
      '}',
      '.rg-progress-fill {',
      '  height: 100%; background: linear-gradient(90deg, ' + COLORS.blue + ', ' + COLORS.lightBlue + ');',
      '  border-radius: 3px; transition: width 0.3s ease; width: 0%;',
      '}',
      '.rg-section-progress.complete .rg-progress-fill {',
      '  background: ' + COLORS.green + '; width: 100% !important;',
      '}',
      '.rg-timer {',
      '  font-variant-numeric: tabular-nums; font-weight: 600;',
      '  min-width: 48px; text-align: right; font-size: 12px;',
      '}',
      '.rg-checkmark { display: none; font-size: 16px; line-height: 1; }',
      '.rg-section-progress.complete .rg-checkmark { display: inline; }',
      '.rg-section-progress.complete .rg-timer { display: none; }',
      '.rg-label { font-size: 12px; font-weight: 500; white-space: nowrap; }',

      '.rg-quiz-lock-overlay {',
      '  position: relative; padding: 32px 24px; margin: 0 0 24px;',
      '  background: ' + COLORS.gray100 + ';',
      '  border: 2px dashed ' + COLORS.gray200 + ';',
      '  border-radius: 12px; text-align: center;',
      '  transition: all 0.5s ease;',
      '}',
      '.rg-lock-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.6; display: block; }',
      '.rg-lock-title {',
      '  font-size: 16px; font-weight: 700; color: ' + COLORS.navy + '; margin-bottom: 6px;',
      '}',
      '.rg-lock-subtitle {',
      '  font-size: 13px; color: ' + COLORS.gray500 + ';',
      '  max-width: 400px; margin: 0 auto; line-height: 1.5;',
      '}',
      '.rg-lock-countdown {',
      '  margin-top: 12px; font-size: 13px; font-weight: 600;',
      '  color: ' + COLORS.blue + '; font-variant-numeric: tabular-nums;',
      '}',
      '.rg-quiz-lock-overlay.unlocking {',
      '  border-color: ' + COLORS.green + '; background: #f0fdf4;',
      '  animation: rg-unlock-pulse 0.6s ease;',
      '}',
      '@keyframes rg-unlock-pulse {',
      '  0% { transform: scale(1); }',
      '  50% { transform: scale(1.02); border-color: ' + COLORS.green + '; }',
      '  100% { transform: scale(1); }',
      '}',

      '.rg-quiz-locked .quiz-question {',
      '  opacity: 0.35; pointer-events: none;',
      '  user-select: none; filter: blur(1px);',
      '  transition: all 0.4s ease;',
      '}',
      '.rg-quiz-locked .quiz-score-card {',
      '  opacity: 0.35; pointer-events: none;',
      '}',

      '.rg-day-lock-overlay {',
      '  position: relative; margin: 16px 0; padding: 40px 24px;',
      '  background: linear-gradient(135deg, ' + COLORS.gray100 + ', ' + COLORS.white + ');',
      '  border: 2px solid ' + COLORS.gray200 + ';',
      '  border-radius: 16px; text-align: center;',
      '}',
      '.rg-day-lock-overlay .rg-lock-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }',
      '.rg-day-lock-overlay .rg-lock-title {',
      '  font-size: 18px; font-weight: 700; color: ' + COLORS.navy + '; margin-bottom: 8px;',
      '}',
      '.rg-day-lock-overlay .rg-lock-subtitle {',
      '  font-size: 14px; color: ' + COLORS.gray500 + '; line-height: 1.5;',
      '}',

      '.rg-day-hidden { display: none !important; }',

      '.rg-unlock-animate { animation: rg-fadeIn 0.5s ease forwards; }',
      '@keyframes rg-fadeIn {',
      '  from { opacity: 0; transform: translateY(10px); }',
      '  to { opacity: 1; transform: translateY(0); }',
      '}',

      '.rg-admin-badge {',
      '  position: fixed; bottom: 16px; right: 16px;',
      '  background: ' + COLORS.amber + '; color: ' + COLORS.white + ';',
      '  padding: 6px 14px; border-radius: 20px;',
      '  font-size: 11px; font-weight: 700;',
      '  text-transform: uppercase; letter-spacing: 0.5px;',
      '  z-index: 9999; box-shadow: 0 2px 8px rgba(0,0,0,0.2);',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ============================================================
  // UI ELEMENT CREATION (all safe DOM methods, no innerHTML)
  // ============================================================

  function createSectionProgressBar(sectionId, requiredSeconds) {
    var checkmark = el('span', { className: 'rg-checkmark', 'aria-label': 'Complete', textContent: '\u2713' });
    var label = el('span', { className: 'rg-label', textContent: 'Reading progress' });
    var fill = el('div', { className: 'rg-progress-fill', id: 'rg-fill-' + sectionId });
    var track = el('div', { className: 'rg-progress-track' }, [fill]);
    var timer = el('span', { className: 'rg-timer', id: 'rg-timer-' + sectionId, textContent: formatTime(requiredSeconds) });

    return el('div', { className: 'rg-section-progress', id: 'rg-progress-' + sectionId }, [
      checkmark, label, track, timer
    ]);
  }

  function createQuizLockOverlay(dayNum) {
    var icon = el('span', { className: 'rg-lock-icon', 'aria-hidden': 'true', textContent: '\uD83D\uDD12' });
    var title = el('div', { className: 'rg-lock-title', textContent: 'Complete the reading above to unlock this quiz' });
    var subtitle = el('div', { className: 'rg-lock-subtitle', textContent: 'Read through all Day ' + dayNum + ' content and spend enough time on each section. The quiz will unlock automatically.' });
    var countdown = el('div', { className: 'rg-lock-countdown', id: 'rg-quiz-countdown-day' + dayNum });

    return el('div', { className: 'rg-quiz-lock-overlay', id: 'rg-quiz-lock-day' + dayNum }, [
      icon, title, subtitle, countdown
    ]);
  }

  function createDayLockOverlay(dayNum, prevDayNum) {
    var icon = el('span', { className: 'rg-lock-icon', 'aria-hidden': 'true', textContent: '\uD83D\uDD12' });
    var title = el('div', { className: 'rg-lock-title', textContent: 'Day ' + dayNum + ' is locked' });
    var subtitle = el('div', { className: 'rg-lock-subtitle', textContent: 'Complete the Day ' + prevDayNum + ' quiz to unlock this content.' });

    return el('div', { className: 'rg-day-lock-overlay', id: 'rg-day-lock-' + dayNum }, [
      icon, title, subtitle
    ]);
  }

  function showAdminBadge() {
    var badge = el('div', { className: 'rg-admin-badge', textContent: 'Admin Mode \u2014 Gates Bypassed' });
    document.body.appendChild(badge);
  }

  // ============================================================
  // QUIZ COMPLETION DETECTION
  // ============================================================

  function isQuizComplete(day) {
    if (!day.quizContainer && !day.quizSection) return false;

    var quizEl = day.quizContainer || day.quizSection;
    var questions = quizEl.querySelectorAll('.quiz-question');

    if (questions.length === 0) return false;

    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      if (!q.classList.contains('answered-correct') && !q.classList.contains('answered-exhausted') && !q.classList.contains('answered-locked')) {
        return false;
      }
    }

    return true;
  }

  // ============================================================
  // CORE GATE CONTROLLER
  // ============================================================

  function initReadingGates() {
    if (isAdmin) {
      showAdminBadge();
      return;
    }

    var days = parseDayStructure();

    if (days.length === 0) {
      console.log('[ReadingGates] No day structure detected. Skipping.');
      return;
    }

    console.log('[ReadingGates] Detected ' + days.length + ' days for course: ' + COURSE_NAME);

    var sectionTrackers = {};
    var dayLocked = {};
    var quizLocked = {};

    // ---- STEP 1: Compute word counts and required times ----
    days.forEach(function(day) {
      day.totalReadingSeconds = 0;

      day.contentSections.forEach(function(section) {
        var sectionId = section.id;
        var wordCount = countSectionWords(section);
        var requiredSeconds = calculateReadingTime(wordCount);

        var tracker = {
          sectionId: sectionId,
          element: section,
          wordCount: wordCount,
          requiredSeconds: requiredSeconds,
          timeSpent: 0,
          maxScrollPct: 0,
          readingComplete: false,
          isVisible: false
        };

        // Restore from localStorage
        var saved = getSectionState(sectionId);
        if (saved) {
          tracker.timeSpent = saved.timeSpent || 0;
          tracker.maxScrollPct = saved.maxScrollPct || 0;
          tracker.readingComplete = saved.readingComplete || false;
        }

        sectionTrackers[sectionId] = tracker;
        day.totalReadingSeconds += requiredSeconds;
      });
    });

    // ---- STEP 2: Insert progress bars into content sections ----
    days.forEach(function(day) {
      day.contentSections.forEach(function(section) {
        var tracker = sectionTrackers[section.id];
        if (!tracker) return;

        var progressBar = createSectionProgressBar(section.id, tracker.requiredSeconds);

        var header = section.querySelector('.section-header');
        if (header && header.nextSibling) {
          header.parentNode.insertBefore(progressBar, header.nextSibling);
        } else if (header) {
          section.appendChild(progressBar);
        } else {
          section.insertBefore(progressBar, section.firstChild);
        }

        if (tracker.readingComplete) {
          progressBar.classList.add('complete');
        }
      });
    });

    // ---- STEP 3: Insert quiz lock overlays ----
    days.forEach(function(day) {
      if (!day.quizSection) return;

      var allContentComplete = day.contentSections.every(function(section) {
        var t = sectionTrackers[section.id];
        return t && t.readingComplete;
      });

      if (allContentComplete) {
        quizLocked[day.dayNum] = false;
        return;
      }

      quizLocked[day.dayNum] = true;

      var overlay = createQuizLockOverlay(day.dayNum);
      var quizContainer = day.quizContainer || day.quizSection.querySelector('.quiz-container');

      if (quizContainer) {
        quizContainer.parentNode.insertBefore(overlay, quizContainer);
        quizContainer.classList.add('rg-quiz-locked');
      } else {
        var qHeader = day.quizSection.querySelector('.section-header');
        if (qHeader && qHeader.nextSibling) {
          qHeader.parentNode.insertBefore(overlay, qHeader.nextSibling);
        } else {
          day.quizSection.appendChild(overlay);
        }
      }
    });

    // ---- STEP 4: Sequential day locking ----
    function lockDay(day, prevDayNum) {
      var overlay = createDayLockOverlay(day.dayNum, prevDayNum);

      day.contentSections.forEach(function(section) {
        section.classList.add('rg-day-hidden');
      });

      if (day.quizSection) {
        day.quizSection.classList.add('rg-day-hidden');
      }

      if (day.dayHeaderEl) {
        if (day.dayHeaderEl.nextSibling) {
          day.dayHeaderEl.parentNode.insertBefore(overlay, day.dayHeaderEl.nextSibling);
        } else {
          day.dayHeaderEl.parentNode.appendChild(overlay);
        }
      } else if (day.contentSections.length > 0) {
        var firstSection = day.contentSections[0];
        firstSection.parentNode.insertBefore(overlay, firstSection);
      }
    }

    function unlockDay(day) {
      var overlay = document.getElementById('rg-day-lock-' + day.dayNum);
      if (overlay) {
        overlay.remove();
      }

      day.contentSections.forEach(function(section) {
        section.classList.remove('rg-day-hidden');
        section.classList.add('rg-unlock-animate');
      });

      if (day.quizSection) {
        day.quizSection.classList.remove('rg-day-hidden');
        day.quizSection.classList.add('rg-unlock-animate');
      }
    }

    function updateDayLocks() {
      for (var i = 1; i < days.length; i++) {
        var day = days[i];
        var prevDay = days[i - 1];
        var prevQuizComplete = isQuizComplete(prevDay);

        if (prevQuizComplete && dayLocked[day.dayNum]) {
          unlockDay(day);
          dayLocked[day.dayNum] = false;
        }
      }
    }

    // Initial day lock state
    dayLocked[days[0].dayNum] = false;
    for (var i = 1; i < days.length; i++) {
      var prevDay = days[i - 1];
      if (isQuizComplete(prevDay)) {
        dayLocked[days[i].dayNum] = false;
      } else {
        lockDay(days[i], prevDay.dayNum);
        dayLocked[days[i].dayNum] = true;
      }
    }

    // ---- STEP 5: Visibility tracking ----
    function checkVisibility() {
      Object.keys(sectionTrackers).forEach(function(sectionId) {
        var tracker = sectionTrackers[sectionId];
        var rect = tracker.element.getBoundingClientRect();
        var viewportHeight = window.innerHeight;

        tracker.isVisible = (
          rect.top < viewportHeight &&
          rect.bottom > 0 &&
          !tracker.element.classList.contains('rg-day-hidden')
        );
      });
    }

    // ---- STEP 6: Scroll tracking ----
    function updateScrollProgress() {
      Object.keys(sectionTrackers).forEach(function(sectionId) {
        var tracker = sectionTrackers[sectionId];
        if (tracker.readingComplete) return;
        if (tracker.element.classList.contains('rg-day-hidden')) return;

        var scrollPct = getSectionScrollProgress(tracker.element);
        if (scrollPct > tracker.maxScrollPct) {
          tracker.maxScrollPct = scrollPct;
        }
      });
    }

    // ---- STEP 7: Timer tick ----
    var saveCounter = 0;

    function tick() {
      checkVisibility();

      Object.keys(sectionTrackers).forEach(function(sectionId) {
        var tracker = sectionTrackers[sectionId];
        if (tracker.readingComplete) return;

        if (tracker.isVisible) {
          tracker.timeSpent += 1;
        }

        var timePct = Math.min(tracker.timeSpent / tracker.requiredSeconds, 1);
        var scrollPct = Math.min(tracker.maxScrollPct / SCROLL_THRESHOLD, 1);
        var overallPct = Math.min((timePct + scrollPct) / 2, 1) * 100;

        var fillEl = document.getElementById('rg-fill-' + sectionId);
        if (fillEl) {
          fillEl.style.width = overallPct + '%';
        }

        var timerEl = document.getElementById('rg-timer-' + sectionId);
        if (timerEl) {
          var remaining = Math.max(tracker.requiredSeconds - tracker.timeSpent, 0);
          if (remaining > 0) {
            timerEl.textContent = formatTime(remaining);
          } else {
            timerEl.textContent = scrollPct >= 1 ? 'Ready' : 'Keep scrolling';
          }
        }

        if (timePct >= 1 && tracker.maxScrollPct >= SCROLL_THRESHOLD) {
          tracker.readingComplete = true;

          var progressEl = document.getElementById('rg-progress-' + sectionId);
          if (progressEl) {
            progressEl.classList.add('complete');
          }

          saveSectionState(sectionId, {
            timeSpent: tracker.timeSpent,
            maxScrollPct: tracker.maxScrollPct,
            readingComplete: true
          });

          if (typeof trackSectionComplete === 'function') {
            trackSectionComplete(COURSE_NAME, sectionId);
          }

          checkQuizUnlocks();
        }
      });

      // Save progress every 5 seconds
      saveCounter++;
      if (saveCounter % 5 === 0) {
        Object.keys(sectionTrackers).forEach(function(sectionId) {
          var t = sectionTrackers[sectionId];
          if (!t.readingComplete) {
            saveSectionState(sectionId, {
              timeSpent: t.timeSpent,
              maxScrollPct: t.maxScrollPct,
              readingComplete: false
            });
          }
        });
      }
    }

    // ---- STEP 8: Quiz unlock logic ----
    function checkQuizUnlocks() {
      days.forEach(function(day) {
        if (!quizLocked[day.dayNum]) return;

        var allComplete = day.contentSections.every(function(section) {
          var t = sectionTrackers[section.id];
          return t && t.readingComplete;
        });

        if (allComplete) {
          unlockQuiz(day);
          quizLocked[day.dayNum] = false;
        } else {
          updateQuizLockCountdown(day);
        }
      });
    }

    function unlockQuiz(day) {
      var overlay = document.getElementById('rg-quiz-lock-day' + day.dayNum);
      if (overlay) {
        overlay.classList.add('unlocking');
        setTimeout(function() {
          overlay.remove();
        }, 600);
      }

      var quizContainer = day.quizContainer || (day.quizSection ? day.quizSection.querySelector('.quiz-container') : null);
      if (quizContainer) {
        quizContainer.classList.remove('rg-quiz-locked');
        quizContainer.classList.add('rg-unlock-animate');
      }
    }

    function updateQuizLockCountdown(day) {
      var countdownEl = document.getElementById('rg-quiz-countdown-day' + day.dayNum);
      if (!countdownEl) return;

      var totalRemaining = 0;
      var sectionsRemaining = 0;
      var needsScroll = false;

      day.contentSections.forEach(function(section) {
        var t = sectionTrackers[section.id];
        if (!t || t.readingComplete) return;

        sectionsRemaining++;
        var timeRemaining = Math.max(t.requiredSeconds - t.timeSpent, 0);
        totalRemaining += timeRemaining;

        if (t.maxScrollPct < SCROLL_THRESHOLD) {
          needsScroll = true;
        }
      });

      if (sectionsRemaining === 0) {
        countdownEl.textContent = '';
        return;
      }

      var parts = [];
      if (totalRemaining > 0) {
        parts.push(formatTime(totalRemaining) + ' reading time remaining');
      }
      if (needsScroll) {
        parts.push('scroll through content');
      }
      if (sectionsRemaining > 0) {
        parts.push(sectionsRemaining + ' section' + (sectionsRemaining > 1 ? 's' : '') + ' to complete');
      }

      countdownEl.textContent = parts.join(' \u2022 ');
    }

    // ---- STEP 9: Observe quiz completion for sequential day unlock ----
    var quizObserver = new MutationObserver(function(mutations) {
      var shouldCheck = false;
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          var target = mutation.target;
          if (target.classList.contains('answered-correct') || target.classList.contains('answered-exhausted') || target.classList.contains('answered-locked')) {
            shouldCheck = true;
          }
        }
      });

      if (shouldCheck) {
        setTimeout(function() {
          updateDayLocks();
        }, 300);
      }
    });

    document.querySelectorAll('.quiz-question').forEach(function(q) {
      quizObserver.observe(q, { attributes: true, attributeFilter: ['class'] });
    });

    // ---- STEP 10: Event listeners ----
    var scrollTimeout = null;
    window.addEventListener('scroll', function() {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(function() {
        scrollTimeout = null;
        updateScrollProgress();
        checkQuizUnlocks();
      }, 100);
    }, { passive: true });

    // Start the timer
    setInterval(tick, TICK_INTERVAL);

    // Initial calculations
    checkVisibility();
    updateScrollProgress();
    checkQuizUnlocks();

    days.forEach(function(day) {
      if (quizLocked[day.dayNum]) {
        updateQuizLockCountdown(day);
      }
    });

    // ---- STEP 11: Save on page unload ----
    window.addEventListener('beforeunload', function() {
      Object.keys(sectionTrackers).forEach(function(sectionId) {
        var t = sectionTrackers[sectionId];
        saveSectionState(sectionId, {
          timeSpent: t.timeSpent,
          maxScrollPct: t.maxScrollPct,
          readingComplete: t.readingComplete
        });
      });
    });

    // ---- STEP 12: Expose global API ----
    window.readingGates = {
      isAdmin: isAdmin,
      courseName: COURSE_NAME,
      days: days,
      sectionTrackers: sectionTrackers,
      quizLocked: quizLocked,
      dayLocked: dayLocked,

      isSectionComplete: function(sectionId) {
        var t = sectionTrackers[sectionId];
        return t ? t.readingComplete : false;
      },

      isDayReadingComplete: function(dayNum) {
        var day = days.find(function(d) { return d.dayNum === dayNum; });
        if (!day) return false;
        return day.contentSections.every(function(section) {
          var t = sectionTrackers[section.id];
          return t && t.readingComplete;
        });
      },

      isDayQuizComplete: function(dayNum) {
        var day = days.find(function(d) { return d.dayNum === dayNum; });
        if (!day) return false;
        return isQuizComplete(day);
      },

      isDayUnlocked: function(dayNum) {
        return !dayLocked[dayNum];
      },

      resetProgress: function() {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }
    };

    console.log('[ReadingGates] Initialised. ' + Object.keys(sectionTrackers).length + ' sections tracked across ' + days.length + ' days.');
  }

  // ============================================================
  // INITIALISE ON DOM READY
  // ============================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      injectStyles();
      // Delay slightly to ensure course JavaScript has restored quiz state
      setTimeout(initReadingGates, 100);
    });
  } else {
    injectStyles();
    setTimeout(initReadingGates, 100);
  }

})();
