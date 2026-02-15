// Supabase client for Hillway Training LMS
const SUPABASE_URL = 'https://wlkxzlyxizkajlkureka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsa3h6bHl4aXprYWpsa3VyZWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjAyOTUsImV4cCI6MjA4MjkzNjI5NX0.INIobuEI1GxHDyKGa-hFU8gUMZ0U6Ete3LK7CaBO5Us';

const supabaseHeaders = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// Get or create learner - called on page load
// Shows a registration form if no learner ID exists
async function getOrCreateLearner() {
  let learnerId = localStorage.getItem('hillway-learner-id');
  let learnerName = localStorage.getItem('hillway-learner-name');

  if (learnerId && learnerName) return { id: learnerId, name: learnerName };

  return new Promise(function(resolve) {
    var modal = document.createElement('div');
    modal.id = 'learner-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';

    var card = document.createElement('div');
    card.style.cssText = 'background:white;border-radius:16px;padding:40px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);';

    var h2 = document.createElement('h2');
    h2.textContent = 'Welcome to Hillway Training';
    h2.style.cssText = 'margin:0 0 8px;color:#0f172a;font-size:1.4rem;';

    var p = document.createElement('p');
    p.textContent = 'Enter your details to track your progress.';
    p.style.cssText = 'color:#64748b;margin:0 0 24px;font-size:0.95rem;';

    var nameLabel = document.createElement('label');
    nameLabel.textContent = 'Full Name';
    nameLabel.style.cssText = 'display:block;margin-bottom:6px;font-weight:600;color:#0f172a;font-size:0.85rem;';

    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'e.g. Alex Brazier';
    nameInput.style.cssText = 'width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:1rem;margin-bottom:16px;box-sizing:border-box;';

    var emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email';
    emailLabel.style.cssText = 'display:block;margin-bottom:6px;font-weight:600;color:#0f172a;font-size:0.85rem;';

    var emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'e.g. alex@hillwayco.uk';
    emailInput.style.cssText = 'width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:1rem;margin-bottom:24px;box-sizing:border-box;';

    var btn = document.createElement('button');
    btn.textContent = 'Start Learning';
    btn.style.cssText = 'width:100%;padding:12px;background:#1e40af;color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;';

    card.appendChild(h2);
    card.appendChild(p);
    card.appendChild(nameLabel);
    card.appendChild(nameInput);
    card.appendChild(emailLabel);
    card.appendChild(emailInput);
    card.appendChild(btn);
    modal.appendChild(card);
    document.body.appendChild(modal);

    btn.addEventListener('click', async function() {
      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      if (!name || !email) return;

      try {
        var checkRes = await fetch(SUPABASE_URL + '/rest/v1/training_learners?email=eq.' + encodeURIComponent(email) + '&select=id,name', {
          headers: supabaseHeaders
        });
        var existing = await checkRes.json();

        var learner;
        if (existing.length > 0) {
          learner = existing[0];
        } else {
          var createRes = await fetch(SUPABASE_URL + '/rest/v1/training_learners', {
            method: 'POST',
            headers: supabaseHeaders,
            body: JSON.stringify({ name: name, email: email })
          });
          var created = await createRes.json();
          learner = created[0];
        }

        localStorage.setItem('hillway-learner-id', learner.id);
        localStorage.setItem('hillway-learner-name', learner.name);
        modal.remove();
        resolve(learner);
      } catch (err) {
        console.error('Failed to register learner:', err);
        var fallbackId = 'local-' + Date.now();
        localStorage.setItem('hillway-learner-id', fallbackId);
        localStorage.setItem('hillway-learner-name', name);
        modal.remove();
        resolve({ id: fallbackId, name: name });
      }
    });
  });
}

// Submit quiz answer to Supabase
async function submitQuizAnswer(course, questionId, questionText, answerGiven, correctAnswer, isCorrect, attemptNumber) {
  var learnerId = localStorage.getItem('hillway-learner-id');
  if (!learnerId || learnerId.startsWith('local-')) return;

  try {
    await fetch(SUPABASE_URL + '/rest/v1/training_quiz_submissions', {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify({
        learner_id: learnerId,
        course: course,
        question_id: questionId,
        question_text: questionText,
        answer_given: answerGiven,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        attempt_number: attemptNumber
      })
    });
  } catch (err) {
    console.error('Failed to submit quiz answer:', err);
  }
}

// Track section completion
async function trackSectionComplete(course, sectionId) {
  var learnerId = localStorage.getItem('hillway-learner-id');
  if (!learnerId || learnerId.startsWith('local-')) return;

  try {
    await fetch(SUPABASE_URL + '/rest/v1/training_course_progress', {
      method: 'POST',
      headers: Object.assign({}, supabaseHeaders, { 'Prefer': 'return=representation,resolution=merge-duplicates' }),
      body: JSON.stringify({
        learner_id: learnerId,
        course: course,
        section_id: sectionId
      })
    });
  } catch (err) {
    console.error('Failed to track progress:', err);
  }
}
