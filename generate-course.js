#!/usr/bin/env node
/**
 * Generates the complete 10-day Claude Code training course HTML.
 * Reads the shell (CSS/sidebar/hero) from the current file,
 * reads all course-parts/*.html files for content,
 * and injects the JavaScript quiz engine.
 */

const fs = require('fs');
const path = require('path');

const PARTS_DIR = path.join(__dirname, 'course-parts');
const OUTPUT = path.join(__dirname, 'courses', 'claude-code-training.html');

// Read the current shell file
const shell = fs.readFileSync(OUTPUT, 'utf8');

// Read all part files in order
const partFiles = fs.readdirSync(PARTS_DIR)
  .filter(f => f.endsWith('.html'))
  .sort();

console.log(`Found ${partFiles.length} content parts`);

const contentParts = partFiles.map(f => {
  const content = fs.readFileSync(path.join(PARTS_DIR, f), 'utf8');
  console.log(`  - ${f} (${content.length} chars)`);
  return content;
});

const allContent = contentParts.join('\n\n');

// Build the quiz JavaScript
const quizScript = buildQuizScript();

// Strategy: Replace content between <div class="content"> and </div><!-- /content -->
// Also replace the script block
const contentStartMarker = '  <div class="content">';
const contentEndMarker = '  </div><!-- /content -->';

const startIdx = shell.indexOf(contentStartMarker);
const endIdx = shell.indexOf(contentEndMarker);

let output;
if (startIdx !== -1 && endIdx !== -1) {
  // Found markers - replace content between them
  const beforeContent = shell.substring(0, startIdx + contentStartMarker.length);
  const afterContent = shell.substring(endIdx);
  output = beforeContent + '\n\n' + allContent + '\n\n' + afterContent;
  console.log('\nReplaced content between markers');
} else {
  // Fallback: try placeholder
  output = shell.replace('    <!-- PLACEHOLDER: Course content goes here -->', allContent);
  console.log('\nUsed placeholder replacement');
}

// Replace any existing quiz script block with the new one
// Match from the last <script> before </body> that contains our quiz code
const scriptStartPattern = '<script>\n  // ==========================================\n  // Initialise learner';
const scriptEndPattern = '  }\n</script>';
const scriptStart = output.indexOf(scriptStartPattern);
const scriptEnd = output.indexOf(scriptEndPattern, scriptStart);

if (scriptStart !== -1 && scriptEnd !== -1) {
  const beforeScript = output.substring(0, scriptStart);
  const afterScript = output.substring(scriptEnd + scriptEndPattern.length);
  output = beforeScript + `<script>\n${quizScript}\n</script>` + afterScript;
  console.log('Replaced existing quiz script');
} else {
  // Try placeholder script replacement
  output = output.replace(
    `<script>\n  // Placeholder - full script will be added\n  if (typeof getOrCreateLearner === 'function') getOrCreateLearner();\n</script>`,
    `<script>\n${quizScript}\n</script>`
  );
  console.log('Used placeholder script replacement');
}

fs.writeFileSync(OUTPUT, output, 'utf8');

const lines = output.split('\n').length;
const words = output.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;
console.log(`\nOutput: ${OUTPUT}`);
console.log(`Lines: ${lines}`);
console.log(`Approx words (excluding HTML): ${words}`);

function buildQuizScript() {
  return `  // ==========================================
  // Initialise learner on page load
  // ==========================================
  if (typeof getOrCreateLearner === 'function') getOrCreateLearner();

  // ==========================================
  // Progress bar
  // ==========================================
  var progressBar = document.getElementById('progress-bar');

  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  // ==========================================
  // Active sidebar link
  // ==========================================
  var sections = document.querySelectorAll('.section');
  var navLinks = document.querySelectorAll('.sidebar-nav a');

  function updateActiveLink() {
    var current = '';
    var offset = 100;
    sections.forEach(function(section) {
      var sectionTop = section.offsetTop - offset;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(function(link) {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === current) {
        link.classList.add('active');
      }
    });
  }

  // ==========================================
  // Fade-in on scroll
  // ==========================================
  var fadeElements = document.querySelectorAll('.fade-in');

  function checkFadeIn() {
    fadeElements.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.classList.add('visible');
      }
    });
  }

  // ==========================================
  // Scroll event handler (throttled)
  // ==========================================
  var ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function() {
        updateProgress();
        updateActiveLink();
        checkFadeIn();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ==========================================
  // Smooth scroll for sidebar links
  // ==========================================
  navLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var targetId = this.getAttribute('href').substring(1);
      var target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ==========================================
  // Quiz Logic with Tutoring Mode
  // ==========================================
  var STORAGE_KEY = 'hillway-claude-training-quiz-v3';
  var totalQuestions = 120;
  var quizAnswered = 0;
  var quizCorrect = 0;
  var answeredQuestions = {};

  // Module quiz tracking - 12 questions per day, 12 final
  var moduleQuizzes = {
    1: { questions: 12, answered: 0, correct: 0 },
    2: { questions: 12, answered: 0, correct: 0 },
    3: { questions: 12, answered: 0, correct: 0 },
    4: { questions: 12, answered: 0, correct: 0 },
    5: { questions: 12, answered: 0, correct: 0 },
    6: { questions: 12, answered: 0, correct: 0 },
    7: { questions: 12, answered: 0, correct: 0 },
    8: { questions: 12, answered: 0, correct: 0 },
    9: { questions: 12, answered: 0, correct: 0 },
    10: { questions: 12, answered: 0, correct: 0 }
  };

  function getModuleForQuestion(qNum) {
    var n = parseInt(qNum);
    if (n <= 12) return 1;
    if (n <= 24) return 2;
    if (n <= 36) return 3;
    if (n <= 48) return 4;
    if (n <= 60) return 5;
    if (n <= 72) return 6;
    if (n <= 84) return 7;
    if (n <= 96) return 8;
    if (n <= 108) return 9;
    return 10;
  }

  function loadQuizState() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      var state = JSON.parse(saved);
      quizAnswered = state.answered || 0;
      quizCorrect = state.correct || 0;
      if (state.answeredQuestions) answeredQuestions = state.answeredQuestions;
      if (state.moduleQuizzes) {
        Object.keys(state.moduleQuizzes).forEach(function(key) {
          if (moduleQuizzes[key]) {
            moduleQuizzes[key].answered = state.moduleQuizzes[key].answered || 0;
            moduleQuizzes[key].correct = state.moduleQuizzes[key].correct || 0;
          }
        });
      }
      if (state.questionStates) {
        Object.keys(state.questionStates).forEach(function(qNum) {
          var qState = state.questionStates[qNum];
          var qEl = document.querySelector('[data-question="' + qNum + '"]');
          if (!qEl) return;
          if (qState.locked) {
            if (qState.correct) {
              qEl.classList.add('answered-correct');
            } else {
              qEl.classList.add('answered-locked');
            }
            qEl.querySelector('.quiz-explanation').classList.add('visible');
            qEl.querySelectorAll('.quiz-option').forEach(function(opt) { opt.disabled = true; });
            if (qState.selectedCorrect) {
              qEl.querySelectorAll('.quiz-option').forEach(function(opt) {
                if (opt.dataset.value === qState.selectedCorrect) opt.classList.add('selected-correct');
              });
            }
            if (qState.selectedWrong && qState.selectedWrong.length > 0) {
              qState.selectedWrong.forEach(function(val) {
                qEl.querySelectorAll('.quiz-option').forEach(function(opt) {
                  if (opt.dataset.value === val) opt.classList.add('selected-incorrect');
                });
              });
            }
            if (!qState.correct) {
              var correctVal = qEl.dataset.answer;
              qEl.querySelectorAll('.quiz-option').forEach(function(opt) {
                if (opt.dataset.value === correctVal) opt.classList.add('show-correct');
              });
            }
          } else if (qState.attempts > 0) {
            var hintEl = qEl.querySelector('.quiz-hint');
            if (hintEl && qState.currentHint) {
              hintEl.textContent = qState.currentHint;
              hintEl.classList.add('visible');
            }
            if (qState.selectedWrong && qState.selectedWrong.length > 0) {
              qState.selectedWrong.forEach(function(val) {
                qEl.querySelectorAll('.quiz-option').forEach(function(opt) {
                  if (opt.dataset.value === val) {
                    opt.classList.add('selected-incorrect');
                    opt.disabled = true;
                  }
                });
              });
            }
          }
        });
      }
      updateAllScoreCards();
      updateCourseProgress();
    } catch (e) { console.error('Error loading quiz state:', e); }
  }

  function saveQuizState(qNum, qState) {
    try {
      var existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      existing.answered = quizAnswered;
      existing.correct = quizCorrect;
      existing.answeredQuestions = answeredQuestions;
      existing.moduleQuizzes = {};
      Object.keys(moduleQuizzes).forEach(function(key) {
        existing.moduleQuizzes[key] = { answered: moduleQuizzes[key].answered, correct: moduleQuizzes[key].correct };
      });
      if (!existing.questionStates) existing.questionStates = {};
      existing.questionStates[qNum] = qState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (e) { console.error('Error saving quiz state:', e); }
  }

  function getQuestionState(qNum) {
    try {
      var existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (existing.questionStates && existing.questionStates[qNum]) return existing.questionStates[qNum];
    } catch (e) {}
    return { attempts: 0, locked: false, correct: false, selectedWrong: [], selectedCorrect: null, currentHint: null };
  }

  // ==========================================
  // Tutoring mode quiz handler
  // ==========================================
  document.querySelectorAll('.quiz-question[data-type="mc"] .quiz-option').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var questionEl = this.closest('.quiz-question');
      var qNum = questionEl.dataset.question;
      var correctAnswer = questionEl.dataset.answer;
      var selectedValue = this.dataset.value;
      var isCorrect = selectedValue === correctAnswer;
      var questionText = questionEl.querySelector('.quiz-q-text').textContent;
      var qState = getQuestionState(qNum);
      if (qState.locked) return;
      qState.attempts++;
      var attemptNumber = qState.attempts;

      var answerGiven = this.textContent;
      var correctAnswerText = '';
      questionEl.querySelectorAll('.quiz-option').forEach(function(opt) {
        if (opt.dataset.value === correctAnswer) correctAnswerText = opt.textContent;
      });

      if (typeof submitQuizAnswer === 'function') {
        submitQuizAnswer('claude-code-training', 'q' + qNum, questionText, answerGiven, correctAnswerText, isCorrect, attemptNumber);
      }

      if (isCorrect) {
        qState.locked = true;
        qState.correct = true;
        qState.selectedCorrect = selectedValue;
        this.classList.add('selected-correct');
        questionEl.classList.add('answered-correct');
        questionEl.querySelectorAll('.quiz-option').forEach(function(opt) { opt.disabled = true; });
        var hintEl = questionEl.querySelector('.quiz-hint');
        if (hintEl) hintEl.classList.remove('visible');
        questionEl.querySelector('.quiz-explanation').classList.add('visible');
        var mod = getModuleForQuestion(qNum);
        moduleQuizzes[mod].answered++;
        moduleQuizzes[mod].correct++;
        quizAnswered++;
        quizCorrect++;
        saveQuizState(qNum, qState);
        updateAllScoreCards();
        updateCourseProgress();
      } else if (attemptNumber < 3) {
        this.classList.add('selected-incorrect');
        this.disabled = true;
        if (!qState.selectedWrong) qState.selectedWrong = [];
        qState.selectedWrong.push(selectedValue);
        var hintEl = questionEl.querySelector('.quiz-hint');
        var hintText = '';
        if (attemptNumber === 1) {
          hintText = 'Not quite. ' + (questionEl.dataset.hint1 || 'Think carefully about the options.');
        } else if (attemptNumber === 2) {
          hintText = "Here's a clue: " + (questionEl.dataset.hint2 || 'Review the section above for the answer.');
        }
        qState.currentHint = hintText;
        if (hintEl) { hintEl.textContent = hintText; hintEl.classList.add('visible'); }
        saveQuizState(qNum, qState);
      } else {
        qState.locked = true;
        qState.correct = false;
        if (!qState.selectedWrong) qState.selectedWrong = [];
        qState.selectedWrong.push(selectedValue);
        this.classList.add('selected-incorrect');
        questionEl.classList.add('answered-locked');
        questionEl.querySelectorAll('.quiz-option').forEach(function(opt) {
          opt.disabled = true;
          if (opt.dataset.value === correctAnswer) opt.classList.add('show-correct');
        });
        var hintEl = questionEl.querySelector('.quiz-hint');
        if (hintEl) hintEl.classList.remove('visible');
        questionEl.querySelector('.quiz-explanation').classList.add('visible');
        var mod = getModuleForQuestion(qNum);
        moduleQuizzes[mod].answered++;
        quizAnswered++;
        saveQuizState(qNum, qState);
        updateAllScoreCards();
        updateCourseProgress();
      }
    });
  });

  // ==========================================
  // Score card updates
  // ==========================================
  function updateAllScoreCards() {
    for (var day = 1; day <= 10; day++) {
      if (moduleQuizzes[day].answered >= moduleQuizzes[day].questions) {
        var sc = document.getElementById('quiz-' + day + '-score');
        if (sc) {
          sc.style.display = 'block';
          document.getElementById('quiz-' + day + '-score-display').textContent = moduleQuizzes[day].correct + '/' + moduleQuizzes[day].questions;
          document.getElementById('quiz-' + day + '-score-message').textContent = getModuleMessage(moduleQuizzes[day].correct, moduleQuizzes[day].questions);
        }
      }
    }
  }

  function getModuleMessage(correct, total) {
    var pct = Math.round((correct / total) * 100);
    if (pct === 100) return 'Perfect score. Excellent understanding.';
    if (pct >= 80) return 'Strong result. You have a good grasp of this material.';
    if (pct >= 60) return 'Good effort. Review the sections you missed before continuing.';
    return 'Take another look through the material and try again.';
  }

  function updateCourseProgress() {
    var pct = totalQuestions > 0 ? Math.round((quizAnswered / totalQuestions) * 100) : 0;
    var fill = document.getElementById('course-progress-fill');
    var text = document.getElementById('course-progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = quizAnswered + ' of ' + totalQuestions + ' questions';
  }

  // ==========================================
  // Reset All Quizzes
  // ==========================================
  function resetAllQuizzes() {
    if (!confirm('Are you sure you want to reset all quiz progress? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY);
    quizAnswered = 0;
    quizCorrect = 0;
    answeredQuestions = {};
    Object.keys(moduleQuizzes).forEach(function(key) {
      moduleQuizzes[key].answered = 0;
      moduleQuizzes[key].correct = 0;
    });
    document.querySelectorAll('.quiz-question').forEach(function(qEl) {
      qEl.classList.remove('answered-correct', 'answered-incorrect', 'answered-locked');
      var explanation = qEl.querySelector('.quiz-explanation');
      if (explanation) explanation.classList.remove('visible');
      var hint = qEl.querySelector('.quiz-hint');
      if (hint) { hint.classList.remove('visible'); hint.textContent = ''; }
      qEl.querySelectorAll('.quiz-option').forEach(function(opt) {
        opt.disabled = false;
        opt.classList.remove('selected-correct', 'selected-incorrect', 'show-correct');
      });
    });
    document.querySelectorAll('.quiz-score-card').forEach(function(sc) { sc.style.display = 'none'; });
    updateCourseProgress();
  }

  // ==========================================
  // Initial state
  // ==========================================
  updateProgress();
  updateActiveLink();
  checkFadeIn();
  loadQuizState();
  updateCourseProgress();
  if (navLinks.length > 0 && !document.querySelector('.sidebar-nav a.active')) {
    navLinks[0].classList.add('active');
  }`;
}
