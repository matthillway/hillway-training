/**
 * Hillway Training Certificate Generator
 * Generates a branded PDF certificate on course completion.
 * Requires jsPDF loaded via CDN before this script.
 */
(function () {
  'use strict';

  // ── Brand colours ──────────────────────────────────────────
  var NAVY    = [15, 23, 42];
  var BLUE    = [30, 64, 175];
  var SKY     = [14, 165, 233];
  var GOLD    = [180, 143, 50];
  var WHITE   = [255, 255, 255];
  var GRAY    = [100, 116, 139];
  var LIGHT   = [241, 245, 249];

  // ── Course display names ───────────────────────────────────
  var COURSE_NAMES = {
    'property-fundamentals':      'Property Fundamentals',
    'property-management':        'Property Management',
    'ai-digital-transformation':  'AI & Digital Transformation in Property',
    'claude-code-training':       'Claude Code for Property Professionals'
  };

  var COURSE_DESCRIPTIONS = {
    'property-fundamentals':      'Covering UK property law, commercial leases, valuation principles, landlord & tenant legislation, and RICS professional standards.',
    'property-management':        'Covering property management operations, service charges, maintenance planning, health & safety compliance, and tenant relations.',
    'ai-digital-transformation':  'Covering artificial intelligence fundamentals, machine learning applications in property, data strategy, PropTech innovation, and digital transformation leadership.',
    'claude-code-training':       'Covering AI-assisted workflows, advanced prompting techniques, document processing, research automation, and professional AI ethics in surveying practice.'
  };

  function loadLogoAsBase64() {
    return new Promise(function (resolve) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = function () { resolve(null); };
      img.src = 'https://www.hillwayco.uk/images/logo.png';
    });
  }

  function drawBorder(doc, w, h) {
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(2.5);
    doc.rect(12, 12, w - 24, h - 24);

    doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.setLineWidth(0.5);
    doc.rect(16, 16, w - 32, h - 32);

    var cornerLen = 18;
    var offset = 12;
    doc.setDrawColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.setLineWidth(2);

    doc.line(offset, offset, offset + cornerLen, offset);
    doc.line(offset, offset, offset, offset + cornerLen);
    doc.line(w - offset, offset, w - offset - cornerLen, offset);
    doc.line(w - offset, offset, w - offset, offset + cornerLen);
    doc.line(offset, h - offset, offset + cornerLen, h - offset);
    doc.line(offset, h - offset, offset, h - offset - cornerLen);
    doc.line(w - offset, h - offset, w - offset - cornerLen, h - offset);
    doc.line(w - offset, h - offset, w - offset, h - offset - cornerLen);
  }

  function drawDivider(doc, y, w) {
    var cx = w / 2;
    var halfWidth = 60;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.5);
    doc.line(cx - halfWidth, y, cx + halfWidth, y);
    var d = 2.5;
    doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.triangle(cx, y - d, cx - d, y, cx, y + d, 'F');
    doc.triangle(cx, y - d, cx + d, y, cx, y + d, 'F');
  }

  async function generateCertificate(opts) {
    var JsPDF = (typeof jspdf !== 'undefined') ? jspdf.jsPDF : (typeof jsPDF !== 'undefined' ? jsPDF : null);
    if (!JsPDF) {
      alert('PDF library not loaded. Please try again.');
      return;
    }

    var doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    var w = doc.internal.pageSize.getWidth();
    var h = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.rect(0, 0, w, h, 'F');

    // Subtle watermark pattern
    doc.setDrawColor(245, 247, 250);
    doc.setLineWidth(0.3);
    for (var i = -h; i < w + h; i += 8) {
      doc.line(i, 0, i + h, h);
    }

    drawBorder(doc, w, h);

    // Logo
    var logoData = await loadLogoAsBase64();
    var yPos = 28;
    if (logoData) {
      doc.addImage(logoData, 'PNG', (w - 40) / 2, yPos, 40, 14);
      yPos += 20;
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('HILLWAY', w / 2, yPos + 8, { align: 'center' });
      doc.setFontSize(7);
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      doc.text('PROPERTY CONSULTANTS', w / 2, yPos + 13, { align: 'center' });
      yPos += 20;
    }

    // Title
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.text('CERTIFICATE OF COMPLETION', w / 2, yPos, { align: 'center', charSpace: 3 });

    yPos += 8;
    drawDivider(doc, yPos, w);

    // "This is to certify that"
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text('This is to certify that', w / 2, yPos, { align: 'center' });

    // Learner name
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    var name = opts.learnerName || 'Learner Name';
    doc.text(name, w / 2, yPos, { align: 'center' });

    var nameWidth = doc.getTextWidth(name);
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.3);
    doc.line((w - nameWidth) / 2 - 5, yPos + 2, (w + nameWidth) / 2 + 5, yPos + 2);

    // "has successfully completed"
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text('has successfully completed the Hillway professional training course', w / 2, yPos, { align: 'center' });

    // Course name
    yPos += 10;
    var displayName = COURSE_NAMES[opts.courseName] || opts.courseName || 'Training Course';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.text(displayName, w / 2, yPos, { align: 'center' });

    // Course description
    var desc = COURSE_DESCRIPTIONS[opts.courseName] || '';
    if (desc) {
      yPos += 7;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      var descLines = doc.splitTextToSize(desc, 180);
      doc.text(descLines, w / 2, yPos, { align: 'center' });
      yPos += descLines.length * 4;
    }

    // Score section
    yPos += 6;
    drawDivider(doc, yPos, w);
    yPos += 8;

    var score = opts.score || 0;
    var grade = score >= 90 ? 'Distinction' : score >= 75 ? 'Merit' : score >= 60 ? 'Pass' : 'Completed';
    var gradeColour = score >= 90 ? [22, 163, 74] : score >= 75 ? BLUE : score >= 60 ? SKY : GRAY;

    var boxW = 160;
    var boxH = 16;
    var boxX = (w - boxW) / 2;
    doc.setFillColor(LIGHT[0], LIGHT[1], LIGHT[2]);
    doc.roundedRect(boxX, yPos - 4, boxW, boxH, 3, 3, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text('Score:', boxX + 10, yPos + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(score + '%', boxX + 28, yPos + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text('(' + (opts.correctAnswers || 0) + '/' + (opts.totalQuestions || 0) + ' questions correct)', boxX + 44, yPos + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(gradeColour[0], gradeColour[1], gradeColour[2]);
    doc.text(grade, boxX + boxW - 10, yPos + 4.5, { align: 'right' });

    // Date, Certificate ID, Issued by
    yPos += boxH + 10;
    var dateStr = opts.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text('Date of Completion', 55, yPos, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(dateStr, 55, yPos + 6, { align: 'center' });
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.3);
    doc.line(25, yPos + 8, 85, yPos + 8);

    var certId = 'HW-' + (opts.courseName || 'CERT').substring(0, 3).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text('Certificate ID', w / 2, yPos, { align: 'center' });
    doc.setFontSize(8);
    doc.text(certId, w / 2, yPos + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text('Issued by', w - 55, yPos, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text('Hillway', w - 55, yPos + 6, { align: 'center' });
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.3);
    doc.line(w - 85, yPos + 8, w - 25, yPos + 8);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text('Hillway Holdings Ltd  |  Regulated by RICS (Firm Reg. No. 900798)  |  www.hillwayco.uk', w / 2, h - 18, { align: 'center' });
    doc.setFontSize(5.5);
    doc.text('This certificate confirms completion of the above training course delivered by Hillway. It does not constitute a professional qualification.', w / 2, h - 14, { align: 'center' });

    var filename = 'Hillway-Certificate-' + displayName.replace(/[^a-zA-Z0-9]/g, '-') + '-' + name.replace(/[^a-zA-Z0-9]/g, '-') + '.pdf';
    doc.save(filename);

    return { certId: certId, filename: filename, grade: grade };
  }

  function buildCertificateUI(courseName) {
    var container = document.getElementById('certificate-section');
    if (!container) {
      container = document.createElement('div');
      container.id = 'certificate-section';
      container.className = 'section';
      var main = document.querySelector('.main-content') || document.querySelector('main') || document.body;
      main.appendChild(container);
    }

    // Build UI using safe DOM methods
    container.style.cssText = 'padding:20px;';

    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'max-width:700px;margin:40px auto;text-align:center;padding:40px 30px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:16px;color:white;';

    var trophy = document.createElement('div');
    trophy.style.fontSize = '2.5rem';
    trophy.style.marginBottom = '16px';
    trophy.textContent = '\uD83C\uDFC5';

    var heading = document.createElement('h2');
    heading.style.cssText = 'font-size:1.8rem;font-weight:800;margin-bottom:8px;color:white;';
    heading.textContent = 'Course Complete!';

    var subtitle = document.createElement('p');
    subtitle.style.cssText = 'color:#94a3b8;font-size:1rem;margin-bottom:24px;';
    subtitle.textContent = 'Congratulations on completing this training course. Download your certificate below.';

    var scoreBox = document.createElement('div');
    scoreBox.style.cssText = 'background:rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:24px;';

    var scoreRow = document.createElement('div');
    scoreRow.style.cssText = 'display:flex;justify-content:center;gap:40px;flex-wrap:wrap;';

    function makeStatBlock(id, label) {
      var block = document.createElement('div');
      var val = document.createElement('span');
      val.id = id;
      val.style.cssText = 'font-size:2rem;font-weight:800;display:block;';
      val.textContent = '\u2014';
      var lbl = document.createElement('span');
      lbl.style.cssText = 'font-size:0.8rem;color:#94a3b8;';
      lbl.textContent = label;
      block.appendChild(val);
      block.appendChild(document.createElement('br'));
      block.appendChild(lbl);
      return block;
    }

    var scoreBlock = makeStatBlock('cert-score', 'Score');
    scoreBlock.querySelector('#cert-score').style.color = '#0ea5e9';
    var correctBlock = makeStatBlock('cert-correct', 'Correct');
    correctBlock.querySelector('#cert-correct').style.color = '#16a34a';
    var gradeBlock = makeStatBlock('cert-grade', 'Grade');
    gradeBlock.querySelector('#cert-grade').style.color = '#b48f32';

    scoreRow.appendChild(scoreBlock);
    scoreRow.appendChild(correctBlock);
    scoreRow.appendChild(gradeBlock);
    scoreBox.appendChild(scoreRow);

    var downloadBtn = document.createElement('button');
    downloadBtn.id = 'cert-download-btn';
    downloadBtn.disabled = true;
    downloadBtn.style.cssText = 'padding:14px 32px;font-size:1rem;font-weight:700;color:white;background:linear-gradient(135deg,#1e40af,#0ea5e9);border:none;border-radius:10px;cursor:pointer;opacity:0.4;transition:all 0.3s;';
    downloadBtn.textContent = 'Download Certificate (PDF)';

    var lockedMsg = document.createElement('p');
    lockedMsg.id = 'cert-locked-msg';
    lockedMsg.style.cssText = 'color:#f59e0b;font-size:0.85rem;margin-top:12px;';
    lockedMsg.textContent = 'Complete all sections and quizzes to unlock your certificate.';

    var readyMsg = document.createElement('p');
    readyMsg.id = 'cert-ready-msg';
    readyMsg.style.cssText = 'color:#16a34a;font-size:0.85rem;margin-top:12px;display:none;';
    readyMsg.textContent = 'Your certificate is ready!';

    wrapper.appendChild(trophy);
    wrapper.appendChild(heading);
    wrapper.appendChild(subtitle);
    wrapper.appendChild(scoreBox);
    wrapper.appendChild(downloadBtn);
    wrapper.appendChild(lockedMsg);
    wrapper.appendChild(readyMsg);

    // Clear any existing children safely
    while (container.firstChild) { container.removeChild(container.firstChild); }
    container.appendChild(wrapper);

    return { downloadBtn: downloadBtn, lockedMsg: lockedMsg, readyMsg: readyMsg };
  }

  function initCertificateUI() {
    var path = window.location.pathname;
    var match = path.match(/courses\/([^.]+)\.html/);
    var courseName = match ? match[1] : 'unknown';

    var ui = buildCertificateUI(courseName);

    function checkCompletion() {
      var allQuestions = document.querySelectorAll('.quiz-question');
      if (allQuestions.length === 0) return null;

      var totalQ = allQuestions.length;
      var answeredQ = 0;
      var correctQ = 0;

      allQuestions.forEach(function (q) {
        if (q.classList.contains('answered-correct')) {
          answeredQ++;
          correctQ++;
        } else if (q.classList.contains('answered-exhausted') || q.classList.contains('answered-wrong')) {
          answeredQ++;
        }
      });

      var allDone = answeredQ === totalQ;
      var pct = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
      var grade = pct >= 90 ? 'Distinction' : pct >= 75 ? 'Merit' : pct >= 60 ? 'Pass' : 'Completed';

      var scoreEl = document.getElementById('cert-score');
      var correctEl = document.getElementById('cert-correct');
      var gradeEl = document.getElementById('cert-grade');

      if (scoreEl) scoreEl.textContent = pct + '%';
      if (correctEl) correctEl.textContent = correctQ + '/' + totalQ;
      if (gradeEl) gradeEl.textContent = grade;

      if (allDone) {
        ui.downloadBtn.disabled = false;
        ui.downloadBtn.style.opacity = '1';
        ui.lockedMsg.style.display = 'none';
        ui.readyMsg.style.display = 'block';
      } else {
        ui.downloadBtn.disabled = true;
        ui.downloadBtn.style.opacity = '0.4';
        ui.lockedMsg.style.display = 'block';
        ui.lockedMsg.textContent = 'Complete all quizzes to unlock (' + answeredQ + '/' + totalQ + ' answered)';
        ui.readyMsg.style.display = 'none';
      }

      return { allDone: allDone, score: pct, correct: correctQ, total: totalQ, grade: grade };
    }

    checkCompletion();
    setInterval(checkCompletion, 2000);

    var observer = new MutationObserver(function () { checkCompletion(); });
    document.querySelectorAll('.quiz-question').forEach(function (q) {
      observer.observe(q, { attributes: true, attributeFilter: ['class'] });
    });

    ui.downloadBtn.addEventListener('click', async function () {
      var state = checkCompletion();
      if (!state || !state.allDone) return;

      var learnerName = localStorage.getItem('hillway-learner-name') || '';
      if (!learnerName) {
        learnerName = prompt('Enter your full name for the certificate:');
        if (!learnerName) return;
      }

      ui.downloadBtn.disabled = true;
      ui.downloadBtn.textContent = 'Generating...';

      try {
        var result = await generateCertificate({
          learnerName: learnerName,
          courseName: courseName,
          score: state.score,
          totalQuestions: state.total,
          correctAnswers: state.correct
        });

        var learnerId = localStorage.getItem('hillway-learner-id');
        if (learnerId && !learnerId.startsWith('local-') && typeof SUPABASE_URL !== 'undefined') {
          try {
            await fetch(SUPABASE_URL + '/rest/v1/training_course_progress', {
              method: 'POST',
              headers: Object.assign({}, supabaseHeaders, { 'Prefer': 'return=representation,resolution=merge-duplicates' }),
              body: JSON.stringify({
                learner_id: learnerId,
                course: courseName,
                section_id: 'certificate-issued'
              })
            });
          } catch (e) {
            console.error('Failed to record certificate:', e);
          }
        }

        ui.downloadBtn.textContent = 'Downloaded! Click to download again';
        ui.downloadBtn.disabled = false;
      } catch (err) {
        console.error('Certificate generation failed:', err);
        ui.downloadBtn.textContent = 'Download Certificate (PDF)';
        ui.downloadBtn.disabled = false;
        alert('Failed to generate certificate. Please try again.');
      }
    });
  }

  window.hillwayCertificate = {
    generate: generateCertificate,
    init: initCertificateUI
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelectorAll('.quiz-question').length > 0) {
      initCertificateUI();
    }
  });
})();
