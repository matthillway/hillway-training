/**
 * Hillway Training — Branching Scenario Engine
 *
 * Interactive decision-tree simulator for property industry training.
 * Scans the page for <div class="scenario-sim" data-scenario="scenario-id"></div>
 * elements and builds card-based, branching scenario UIs.
 *
 * Self-initialises on DOMContentLoaded. Pure vanilla JS, no dependencies.
 * Multiple scenarios can coexist on one page.
 */
(function () {
  'use strict';

  // ============================================================
  // CSS STYLES (injected once)
  // ============================================================

  var STYLES = [
    '.scenario-sim {',
    '  --sc-primary: #0f172a;',
    '  --sc-secondary: #1e40af;',
    '  --sc-accent: #0ea5e9;',
    '  --sc-green: #16a34a;',
    '  --sc-amber: #d97706;',
    '  --sc-red: #dc2626;',
    '  --sc-gray-50: #f8fafc;',
    '  --sc-gray-100: #f1f5f9;',
    '  --sc-gray-200: #e2e8f0;',
    '  --sc-gray-300: #cbd5e1;',
    '  --sc-gray-400: #94a3b8;',
    '  --sc-gray-500: #64748b;',
    '  --sc-gray-600: #475569;',
    '  --sc-gray-700: #334155;',
    '  --sc-gray-800: #1e293b;',
    '  --sc-white: #ffffff;',
    '  --sc-radius: 12px;',
    '  --sc-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06);',
    '  --sc-shadow-lg: 0 4px 12px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08);',
    '  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;',
    '  margin: 32px 0;',
    '}',
    '',
    '.scenario-sim * { box-sizing: border-box; }',
    '',
    '/* Outer card */  ',
    '.sc-container {',
    '  background: linear-gradient(135deg, var(--sc-gray-50) 0%, var(--sc-white) 50%, var(--sc-gray-50) 100%);',
    '  border: 1px solid var(--sc-gray-200);',
    '  border-radius: var(--sc-radius);',
    '  box-shadow: var(--sc-shadow);',
    '  overflow: hidden;',
    '}',
    '',
    '/* Header bar */  ',
    '.sc-header {',
    '  background: linear-gradient(135deg, var(--sc-primary) 0%, var(--sc-secondary) 100%);',
    '  color: var(--sc-white);',
    '  padding: 20px 28px;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 14px;',
    '}',
    '',
    '.sc-header-icon {',
    '  font-size: 28px;',
    '  line-height: 1;',
    '  flex-shrink: 0;',
    '}',
    '',
    '.sc-header-text { flex: 1; }',
    '',
    '.sc-header-title {',
    '  font-size: 18px;',
    '  font-weight: 700;',
    '  line-height: 1.3;',
    '  margin: 0;',
    '}',
    '',
    '.sc-header-meta {',
    '  font-size: 13px;',
    '  opacity: 0.75;',
    '  margin-top: 4px;',
    '}',
    '',
    '.sc-badge {',
    '  display: inline-block;',
    '  font-size: 11px;',
    '  font-weight: 600;',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.05em;',
    '  padding: 3px 10px;',
    '  border-radius: 100px;',
    '  background: rgba(255,255,255,0.15);',
    '  margin-left: 8px;',
    '}',
    '',
    '/* Progress bar */  ',
    '.sc-progress-bar {',
    '  height: 4px;',
    '  background: var(--sc-gray-200);',
    '  position: relative;',
    '}',
    '',
    '.sc-progress-fill {',
    '  height: 100%;',
    '  background: linear-gradient(90deg, var(--sc-secondary), var(--sc-accent));',
    '  transition: width 0.5s ease;',
    '  border-radius: 0 2px 2px 0;',
    '}',
    '',
    '/* Body area */  ',
    '.sc-body {',
    '  padding: 28px;',
    '}',
    '',
    '/* Step indicator */  ',
    '.sc-step-indicator {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  font-size: 13px;',
    '  font-weight: 600;',
    '  color: var(--sc-secondary);',
    '  margin-bottom: 16px;',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.04em;',
    '}',
    '',
    '.sc-step-dot {',
    '  width: 8px;',
    '  height: 8px;',
    '  border-radius: 50%;',
    '  background: var(--sc-gray-300);',
    '  transition: background 0.3s ease;',
    '}',
    '',
    '.sc-step-dot--active {',
    '  background: var(--sc-secondary);',
    '}',
    '',
    '.sc-step-dot--done {',
    '  background: var(--sc-green);',
    '}',
    '',
    '/* Situation card */  ',
    '.sc-situation {',
    '  background: var(--sc-white);',
    '  border: 1px solid var(--sc-gray-200);',
    '  border-left: 4px solid var(--sc-secondary);',
    '  border-radius: 8px;',
    '  padding: 20px 24px;',
    '  margin-bottom: 24px;',
    '  font-size: 15px;',
    '  line-height: 1.7;',
    '  color: var(--sc-gray-700);',
    '}',
    '',
    '.sc-situation-label {',
    '  font-size: 11px;',
    '  font-weight: 700;',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.06em;',
    '  color: var(--sc-secondary);',
    '  margin-bottom: 8px;',
    '}',
    '',
    '/* Choice cards */  ',
    '.sc-choices {',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 12px;',
    '}',
    '',
    '.sc-choice {',
    '  background: var(--sc-white);',
    '  border: 1px solid var(--sc-gray-200);',
    '  border-left: 4px solid var(--sc-gray-300);',
    '  border-radius: 8px;',
    '  padding: 16px 20px;',
    '  cursor: pointer;',
    '  transition: all 0.25s ease;',
    '  display: flex;',
    '  align-items: flex-start;',
    '  gap: 14px;',
    '  user-select: none;',
    '  position: relative;',
    '  opacity: 1;',
    '}',
    '',
    '.sc-choice:hover {',
    '  border-left-color: var(--sc-accent);',
    '  box-shadow: var(--sc-shadow);',
    '  transform: translateX(4px);',
    '}',
    '',
    '.sc-choice--disabled {',
    '  pointer-events: none;',
    '}',
    '',
    '.sc-choice--selected {',
    '  border-left-color: var(--sc-secondary);',
    '  background: #eef2ff;',
    '  box-shadow: var(--sc-shadow);',
    '}',
    '',
    '.sc-choice--faded {',
    '  opacity: 0.35;',
    '  transform: scale(0.98);',
    '}',
    '',
    '.sc-choice-letter {',
    '  width: 32px;',
    '  height: 32px;',
    '  border-radius: 50%;',
    '  background: var(--sc-gray-100);',
    '  color: var(--sc-gray-600);',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-size: 14px;',
    '  font-weight: 700;',
    '  flex-shrink: 0;',
    '  transition: all 0.25s ease;',
    '}',
    '',
    '.sc-choice--selected .sc-choice-letter {',
    '  background: var(--sc-secondary);',
    '  color: var(--sc-white);',
    '}',
    '',
    '.sc-choice-text {',
    '  font-size: 14px;',
    '  line-height: 1.6;',
    '  color: var(--sc-gray-700);',
    '  padding-top: 4px;',
    '}',
    '',
    '/* Consequence card */  ',
    '.sc-consequence {',
    '  margin-top: 20px;',
    '  background: var(--sc-white);',
    '  border: 1px solid var(--sc-gray-200);',
    '  border-radius: 8px;',
    '  overflow: hidden;',
    '  animation: sc-slideIn 0.4s ease;',
    '}',
    '',
    '.sc-consequence-header {',
    '  padding: 12px 20px;',
    '  font-size: 12px;',
    '  font-weight: 700;',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.06em;',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '}',
    '',
    '.sc-consequence-header--excellent {',
    '  background: #f0fdf4;',
    '  color: var(--sc-green);',
    '  border-bottom: 1px solid #bbf7d0;',
    '}',
    '',
    '.sc-consequence-header--good {',
    '  background: #eff6ff;',
    '  color: var(--sc-secondary);',
    '  border-bottom: 1px solid #bfdbfe;',
    '}',
    '',
    '.sc-consequence-header--fair {',
    '  background: #fffbeb;',
    '  color: var(--sc-amber);',
    '  border-bottom: 1px solid #fde68a;',
    '}',
    '',
    '.sc-consequence-header--poor {',
    '  background: #fef2f2;',
    '  color: var(--sc-red);',
    '  border-bottom: 1px solid #fecaca;',
    '}',
    '',
    '.sc-consequence-body {',
    '  padding: 16px 20px;',
    '  font-size: 14px;',
    '  line-height: 1.7;',
    '  color: var(--sc-gray-600);',
    '}',
    '',
    '.sc-consequence-score {',
    '  font-size: 13px;',
    '  font-weight: 600;',
    '  margin-top: 10px;',
    '  padding-top: 10px;',
    '  border-top: 1px solid var(--sc-gray-100);',
    '  color: var(--sc-gray-500);',
    '}',
    '',
    '/* Next button */  ',
    '.sc-next-btn {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  margin-top: 20px;',
    '  padding: 10px 24px;',
    '  background: var(--sc-secondary);',
    '  color: var(--sc-white);',
    '  border: none;',
    '  border-radius: 8px;',
    '  font-size: 14px;',
    '  font-weight: 600;',
    '  cursor: pointer;',
    '  transition: all 0.2s ease;',
    '  font-family: inherit;',
    '}',
    '',
    '.sc-next-btn:hover {',
    '  background: var(--sc-primary);',
    '  transform: translateY(-1px);',
    '  box-shadow: var(--sc-shadow);',
    '}',
    '',
    '/* Summary card */  ',
    '.sc-summary {',
    '  animation: sc-slideIn 0.5s ease;',
    '}',
    '',
    '.sc-summary-grade {',
    '  text-align: center;',
    '  padding: 32px 24px;',
    '  background: var(--sc-white);',
    '  border: 1px solid var(--sc-gray-200);',
    '  border-radius: var(--sc-radius);',
    '  margin-bottom: 24px;',
    '}',
    '',
    '.sc-summary-score-ring {',
    '  width: 120px;',
    '  height: 120px;',
    '  margin: 0 auto 20px;',
    '  position: relative;',
    '}',
    '',
    '.sc-summary-score-ring svg {',
    '  width: 120px;',
    '  height: 120px;',
    '  transform: rotate(-90deg);',
    '}',
    '',
    '.sc-summary-score-ring circle {',
    '  fill: none;',
    '  stroke-width: 8;',
    '  stroke-linecap: round;',
    '}',
    '',
    '.sc-ring-bg { stroke: var(--sc-gray-200); }',
    '',
    '.sc-ring-fill {',
    '  transition: stroke-dashoffset 1s ease;',
    '}',
    '',
    '.sc-summary-score-text {',
    '  position: absolute;',
    '  top: 50%;',
    '  left: 50%;',
    '  transform: translate(-50%, -50%);',
    '  font-size: 28px;',
    '  font-weight: 800;',
    '  color: var(--sc-primary);',
    '}',
    '',
    '.sc-summary-grade-label {',
    '  font-size: 20px;',
    '  font-weight: 700;',
    '  color: var(--sc-primary);',
    '  margin-bottom: 4px;',
    '}',
    '',
    '.sc-summary-grade-desc {',
    '  font-size: 14px;',
    '  line-height: 1.7;',
    '  color: var(--sc-gray-500);',
    '  max-width: 520px;',
    '  margin: 0 auto;',
    '}',
    '',
    '/* Path visualisation */  ',
    '.sc-path {',
    '  background: var(--sc-white);',
    '  border: 1px solid var(--sc-gray-200);',
    '  border-radius: var(--sc-radius);',
    '  padding: 24px;',
    '  margin-bottom: 24px;',
    '}',
    '',
    '.sc-path-title {',
    '  font-size: 14px;',
    '  font-weight: 700;',
    '  color: var(--sc-primary);',
    '  margin-bottom: 16px;',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.04em;',
    '}',
    '',
    '.sc-path-step {',
    '  display: flex;',
    '  align-items: flex-start;',
    '  gap: 14px;',
    '  padding: 12px 0;',
    '  border-bottom: 1px solid var(--sc-gray-100);',
    '}',
    '',
    '.sc-path-step:last-child { border-bottom: none; }',
    '',
    '.sc-path-marker {',
    '  width: 28px;',
    '  height: 28px;',
    '  border-radius: 50%;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  font-size: 12px;',
    '  font-weight: 700;',
    '  color: var(--sc-white);',
    '  flex-shrink: 0;',
    '}',
    '',
    '.sc-path-marker--3 { background: var(--sc-green); }',
    '.sc-path-marker--2 { background: var(--sc-secondary); }',
    '.sc-path-marker--1 { background: var(--sc-amber); }',
    '.sc-path-marker--0 { background: var(--sc-red); }',
    '',
    '.sc-path-detail { flex: 1; }',
    '',
    '.sc-path-choice-text {',
    '  font-size: 14px;',
    '  font-weight: 600;',
    '  color: var(--sc-gray-700);',
    '  line-height: 1.5;',
    '}',
    '',
    '.sc-path-score-text {',
    '  font-size: 12px;',
    '  color: var(--sc-gray-400);',
    '  margin-top: 2px;',
    '}',
    '',
    '/* Learning points */  ',
    '.sc-learning {',
    '  background: var(--sc-white);',
    '  border: 1px solid var(--sc-gray-200);',
    '  border-left: 4px solid var(--sc-accent);',
    '  border-radius: 8px;',
    '  padding: 24px;',
    '  margin-bottom: 24px;',
    '}',
    '',
    '.sc-learning-title {',
    '  font-size: 14px;',
    '  font-weight: 700;',
    '  color: var(--sc-primary);',
    '  margin-bottom: 12px;',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.04em;',
    '}',
    '',
    '.sc-learning-list {',
    '  list-style: none;',
    '  padding: 0;',
    '  margin: 0;',
    '}',
    '',
    '.sc-learning-item {',
    '  display: flex;',
    '  align-items: flex-start;',
    '  gap: 10px;',
    '  padding: 8px 0;',
    '  font-size: 14px;',
    '  line-height: 1.6;',
    '  color: var(--sc-gray-600);',
    '}',
    '',
    '.sc-learning-bullet {',
    '  color: var(--sc-accent);',
    '  font-weight: 700;',
    '  flex-shrink: 0;',
    '  margin-top: 1px;',
    '}',
    '',
    '/* Replay button */  ',
    '.sc-replay-btn {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  padding: 12px 28px;',
    '  background: var(--sc-white);',
    '  color: var(--sc-secondary);',
    '  border: 2px solid var(--sc-secondary);',
    '  border-radius: 8px;',
    '  font-size: 14px;',
    '  font-weight: 600;',
    '  cursor: pointer;',
    '  transition: all 0.2s ease;',
    '  font-family: inherit;',
    '  margin-top: 8px;',
    '}',
    '',
    '.sc-replay-btn:hover {',
    '  background: var(--sc-secondary);',
    '  color: var(--sc-white);',
    '  transform: translateY(-1px);',
    '  box-shadow: var(--sc-shadow);',
    '}',
    '',
    '/* Start screen */  ',
    '.sc-start {',
    '  text-align: center;',
    '  padding: 40px 24px;',
    '}',
    '',
    '.sc-start-icon {',
    '  font-size: 48px;',
    '  margin-bottom: 16px;',
    '}',
    '',
    '.sc-start-title {',
    '  font-size: 20px;',
    '  font-weight: 700;',
    '  color: var(--sc-primary);',
    '  margin-bottom: 8px;',
    '}',
    '',
    '.sc-start-desc {',
    '  font-size: 14px;',
    '  color: var(--sc-gray-500);',
    '  line-height: 1.7;',
    '  max-width: 500px;',
    '  margin: 0 auto 24px;',
    '}',
    '',
    '.sc-start-meta {',
    '  display: flex;',
    '  justify-content: center;',
    '  gap: 24px;',
    '  margin-bottom: 28px;',
    '  flex-wrap: wrap;',
    '}',
    '',
    '.sc-start-meta-item {',
    '  font-size: 12px;',
    '  font-weight: 600;',
    '  color: var(--sc-gray-400);',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.05em;',
    '}',
    '',
    '.sc-start-btn {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  padding: 12px 32px;',
    '  background: linear-gradient(135deg, var(--sc-secondary) 0%, var(--sc-accent) 100%);',
    '  color: var(--sc-white);',
    '  border: none;',
    '  border-radius: 8px;',
    '  font-size: 15px;',
    '  font-weight: 600;',
    '  cursor: pointer;',
    '  transition: all 0.2s ease;',
    '  font-family: inherit;',
    '}',
    '',
    '.sc-start-btn:hover {',
    '  transform: translateY(-2px);',
    '  box-shadow: var(--sc-shadow-lg);',
    '}',
    '',
    '/* Animations */  ',
    '@keyframes sc-slideIn {',
    '  from { opacity: 0; transform: translateY(12px); }',
    '  to { opacity: 1; transform: translateY(0); }',
    '}',
    '',
    '.sc-fade-in {',
    '  animation: sc-slideIn 0.35s ease;',
    '}',
    '',
    '/* Responsive */  ',
    '@media (max-width: 640px) {',
    '  .sc-header { padding: 16px 20px; }',
    '  .sc-header-title { font-size: 16px; }',
    '  .sc-body { padding: 20px; }',
    '  .sc-choice { padding: 14px 16px; }',
    '  .sc-start-meta { gap: 16px; }',
    '  .sc-path { padding: 16px; }',
    '  .sc-learning { padding: 16px; }',
    '}'
  ].join('\n');

  // ============================================================
  // SCENARIO DATA
  // ============================================================

  var SCENARIOS = {};

  // --------------------------------------------------
  // 1. AI Adoption Scenario (AI Digital Transformation, Day 5)
  // --------------------------------------------------
  SCENARIOS['scenario-ai-adoption'] = {
    id: 'scenario-ai-adoption',
    title: 'Adopting AI at Your Firm',
    icon: '\uD83E\uDD16',
    difficulty: 'Intermediate',
    course: 'AI & Digital Transformation',
    context: 'Your managing partner has asked you to lead the adoption of AI tools across your surveying practice. The firm has 30 staff, a mix of experienced partners and early-career surveyors. There is enthusiasm from some quarters but scepticism from others. Your brief: recommend and implement AI tools that improve efficiency without compromising professional standards.',
    steps: {
      step1: {
        id: 'step1',
        situation: 'You need to decide on your initial approach to AI adoption. The managing partner wants results within six months. Some senior partners are concerned about data security, whilst graduate surveyors are eager to experiment. How do you begin?',
        choices: [
          {
            id: 'a',
            text: 'Start with a focused pilot programme in one department (e.g. valuations or building surveying), selecting 5\u20136 willing participants and two specific use cases to test over 8 weeks.',
            consequence: 'Excellent approach. A controlled pilot lets you gather evidence, refine workflows, and build internal champions before scaling. The 8-week timeframe gives enough data to assess real impact whilst keeping momentum.',
            score: 3,
            next: 'step2a'
          },
          {
            id: 'b',
            text: 'Roll out AI tools to all staff immediately with a firm-wide mandate, requiring everyone to use them within their daily workflows from next Monday.',
            consequence: 'This is high-risk. Without training, clear guidelines, or change management, you will face resistance from experienced staff, inconsistent adoption, and potential errors. Several partners raise formal concerns at the next board meeting about professional liability.',
            score: 0,
            next: 'step2b'
          },
          {
            id: 'c',
            text: 'Commission an external consultancy to produce a comprehensive AI strategy document before taking any practical steps. Budget: \u00a340,000.',
            consequence: 'A strategy has value, but spending months and significant budget before any hands-on experience means you are making decisions without practical evidence. By the time the report lands, your competitors have already implemented tools and won efficiency gains.',
            score: 1,
            next: 'step2c'
          },
          {
            id: 'd',
            text: 'Let individual teams self-organise and adopt whatever tools they find useful, with no central coordination.',
            consequence: 'This creates fragmentation. Different teams adopt incompatible tools, data is stored across multiple platforms with no governance, and there is no way to measure ROI. The IT team flags serious security concerns when they discover client data on three unvetted cloud platforms.',
            score: 0,
            next: 'step2b'
          }
        ]
      },
      step2a: {
        id: 'step2a',
        situation: 'Your pilot programme is running in the valuations team. Early results are promising \u2014 comparable evidence research is 40% faster. Now you need to decide how to handle staff training for the wider rollout. What is your approach?',
        choices: [
          {
            id: 'a',
            text: 'Develop a structured training programme with tiered levels: foundation (all staff), practitioner (regular users), and champion (departmental leads who support others).',
            consequence: 'This is the gold standard. Tiered training ensures everyone gets baseline AI literacy whilst empowering champions to provide ongoing peer support. The champion model is particularly effective because surveyors learn best from colleagues who understand their specific workflows.',
            score: 3,
            next: 'step3'
          },
          {
            id: 'b',
            text: 'Send a detailed email with links to tutorial videos and a quick-start guide. Make it self-service to respect people\'s time.',
            consequence: 'Passive training has poor completion rates. Only 30% of staff watch the videos. Those who do often struggle to apply generic tutorials to surveying-specific tasks. Without hands-on practice and feedback, adoption stalls.',
            score: 1,
            next: 'step3'
          },
          {
            id: 'c',
            text: 'Bring in the AI vendor to run a full-day training session for all staff.',
            consequence: 'A reasonable starting point, but a single session is insufficient for lasting behaviour change. The vendor\'s training is generic and does not address profession-specific workflows. After two weeks, most staff have reverted to old methods. You would need ongoing support alongside this.',
            score: 2,
            next: 'step3'
          }
        ]
      },
      step2b: {
        id: 'step2b',
        situation: 'Your initial approach has created some difficulties. Staff are confused about which tools to use and several have raised concerns. You need to regain control of the process. What is your recovery plan?',
        choices: [
          {
            id: 'a',
            text: 'Pause everything, acknowledge the issues openly, and relaunch with a structured pilot programme and clear guidelines.',
            consequence: 'Good recovery. Admitting the misstep builds trust. Staff appreciate the honest reset, and the structured approach gives everyone confidence. You have lost some time, but the foundation is now solid.',
            score: 2,
            next: 'step3'
          },
          {
            id: 'b',
            text: 'Push through the resistance \u2014 mandate AI use and address complaints individually.',
            consequence: 'This deepens the divide. Two experienced partners threaten to leave, and the firm\'s culture suffers. Forcing adoption without addressing legitimate concerns creates a toxic atmosphere and actually slows progress.',
            score: 0,
            next: 'step3'
          },
          {
            id: 'c',
            text: 'Quietly scale back and focus only on the teams who are willing, ignoring resistant staff.',
            consequence: 'This avoids confrontation but creates a two-tier firm. Resistant staff feel validated in their opposition, and the willing teams feel unsupported. The firm misses the opportunity for unified transformation.',
            score: 1,
            next: 'step3'
          }
        ]
      },
      step2c: {
        id: 'step2c',
        situation: 'The consultancy report is thorough but has taken three months. Meanwhile, a competitor firm has publicly adopted AI-assisted valuations and is winning instructions. The managing partner is frustrated by the lack of tangible progress. What do you do?',
        choices: [
          {
            id: 'a',
            text: 'Use the report\'s recommendations to fast-track a pilot, starting this week with two ready-to-deploy tools the report identified. Compress the learning phase to four weeks.',
            consequence: 'Good pragmatic move. The report provides a solid foundation, and by acting quickly on its most actionable recommendations, you combine strategic thinking with practical urgency. The compressed timeline is tight but achievable.',
            score: 2,
            next: 'step3'
          },
          {
            id: 'b',
            text: 'Present the report to the board and request another three months to develop a detailed implementation plan.',
            consequence: 'The board is exasperated. Six months of planning with no live tools in use is unacceptable. The managing partner questions the value of the \u00a340,000 investment and assigns a co-lead to accelerate matters.',
            score: 0,
            next: 'step3'
          },
          {
            id: 'c',
            text: 'Abandon the report\'s phased approach and immediately deploy the top-recommended tool to all staff.',
            consequence: 'The report specifically warned against rushing deployment. Ignoring its advice after commissioning it undermines your credibility. However, at least tools are now in use. Results are mixed, with some teams thriving and others struggling without adequate support.',
            score: 1,
            next: 'step3'
          }
        ]
      },
      step3: {
        id: 'step3',
        situation: 'AI tools are now being used across parts of the firm. A client asks directly: "Are you using AI to produce our valuation report?" This is the first time a client has raised the question. How do you respond?',
        choices: [
          {
            id: 'a',
            text: 'Be transparent. Explain that AI assists with research and data analysis but all professional judgements, opinions of value, and final reports are produced and verified by qualified RICS surveyors. Highlight the benefits: faster turnaround, more comprehensive comparable analysis.',
            consequence: 'Excellent. Transparency builds trust, and framing AI as a tool that enhances (not replaces) professional judgement is precisely the right message. The client appreciates the honesty and asks you to present your AI-enhanced approach to their board. This aligns with RICS guidance on technology use.',
            score: 3,
            next: 'step4'
          },
          {
            id: 'b',
            text: 'Downplay AI involvement. Say you use "advanced research tools" without specifically mentioning artificial intelligence, to avoid alarming the client.',
            consequence: 'Evasion is risky. If the client later discovers AI was used, your credibility suffers. In an era of increasing transparency expectations, vague language can look like concealment. You have missed an opportunity to differentiate your firm.',
            score: 1,
            next: 'step4'
          },
          {
            id: 'c',
            text: 'Deny using AI altogether to avoid any potential concerns.',
            consequence: 'This is dishonest and potentially a professional conduct issue. If AI contributed to the analysis and you deny it, you have misrepresented your process. RICS ethical standards require transparency in methodology. This could have serious consequences if discovered.',
            score: 0,
            next: 'step4'
          }
        ]
      },
      step4: {
        id: 'step4',
        situation: 'Six months have passed. The managing partner wants to know the return on investment. You need to present measurable outcomes to the board. How do you approach measuring success?',
        choices: [
          {
            id: 'a',
            text: 'Present a balanced scorecard: time savings per task type, revenue impact from faster turnaround, staff satisfaction scores, client feedback, error rates compared to pre-AI baseline, and qualitative case studies of specific wins.',
            consequence: 'Outstanding. A multi-dimensional assessment demonstrates rigorous evaluation. The board is impressed by both the quantitative data (average 35% time saving on comparable research) and the qualitative evidence. This becomes the benchmark for future technology investments.',
            score: 3,
            next: null
          },
          {
            id: 'b',
            text: 'Focus on headline time savings and cost reduction numbers to make the strongest financial case.',
            consequence: 'Financial metrics are important but incomplete. The board asks about quality impact and client satisfaction, which you cannot answer with confidence. A purely financial lens misses important dimensions like staff development, competitive positioning, and risk management.',
            score: 2,
            next: null
          },
          {
            id: 'c',
            text: 'Rely on anecdotal feedback from enthusiastic team members about how much they enjoy using the tools.',
            consequence: 'Anecdotes from advocates are not evidence. The sceptical partners on the board dismiss the feedback as biased. Without hard data, it is impossible to justify the investment or plan the next phase. The programme\'s future is uncertain.',
            score: 0,
            next: null
          },
          {
            id: 'd',
            text: 'Admit you did not set up proper measurement from the start and propose a retrospective analysis plus a robust framework for the next phase.',
            consequence: 'Honest, but this is a significant oversight. The board appreciates the candour but questions your project management. You can still recover by implementing strong metrics going forward, but you have lost the opportunity to demonstrate clear ROI from phase one.',
            score: 1,
            next: null
          }
        ]
      }
    },
    summary: {
      excellent: { min: 12, text: 'Outstanding strategic leadership. You demonstrated a structured, evidence-based approach to AI adoption with strong change management, transparent communication, and rigorous measurement. This is exactly the kind of digital transformation leadership that positions a firm for long-term competitive advantage.' },
      good: { min: 9, text: 'Solid approach with good instincts. You made some strong decisions, particularly around transparency and structured implementation. There are areas where a more systematic approach would strengthen outcomes, but overall this would deliver meaningful results.' },
      fair: { min: 5, text: 'Mixed results. You showed awareness of key issues but some decisions created unnecessary friction or missed important dimensions. Review the learning points below to strengthen your approach to technology-driven change management.' },
      poor: { min: 0, text: 'This approach would face significant challenges in practice. Successful AI adoption requires structured change management, transparent communication, and evidence-based decision-making. Review each decision point to understand where a different approach would yield better outcomes.' }
    },
    learningPoints: [
      'Always start with a controlled pilot before firm-wide rollout \u2014 evidence beats assumptions.',
      'Tiered training with internal champions is more effective than passive or one-off sessions.',
      'Be transparent with clients about AI use \u2014 RICS ethical standards require honesty about methodology.',
      'Change management is as important as the technology itself \u2014 address concerns, do not override them.',
      'Measure success with a balanced scorecard: time, cost, quality, satisfaction, and risk metrics.',
      'Set up measurement frameworks before you begin, not after.'
    ]
  };

  // --------------------------------------------------
  // 2. PropTech Evaluation Scenario (AI Digital Transformation, Day 9)
  // --------------------------------------------------
  SCENARIOS['scenario-proptech-evaluation'] = {
    id: 'scenario-proptech-evaluation',
    title: 'Evaluating an AI Valuation Tool',
    icon: '\uD83D\uDD0D',
    difficulty: 'Advanced',
    course: 'AI & Digital Transformation',
    context: 'A PropTech vendor has approached your firm with an AI-powered automated valuation model (AVM). They claim it can produce residential valuation reports in minutes rather than hours, with accuracy "comparable to a qualified surveyor." The tool costs \u00a32,500 per month for a firm licence. Your head of residential has asked you to evaluate whether the firm should adopt it.',
    steps: {
      step1: {
        id: 'step1',
        situation: 'The vendor has arranged a slick demonstration. The AI tool ingests property data, comparable evidence, and market trends, then produces a draft valuation report. The demo is impressive, but you need to determine your evaluation criteria. What do you prioritise first?',
        choices: [
          {
            id: 'a',
            text: 'Request the tool\'s methodology documentation: what data sources it uses, how the algorithm weights comparables, how it handles atypical properties, and what its stated margin of error is. Ask for independent validation studies.',
            consequence: 'Excellent due diligence. Understanding the methodology is fundamental. The vendor provides a technical paper, but you notice it lacks independent peer review and the training data is predominantly from London and the South East. This is a critical finding for a firm operating in the Midlands and North.',
            score: 3,
            next: 'step2'
          },
          {
            id: 'b',
            text: 'Focus on the financial case: calculate time savings, potential fee increases, and payback period based on the vendor\'s claimed efficiency gains.',
            consequence: 'Financial analysis matters, but starting here means you are building a business case on unverified claims. The vendor\'s efficiency projections assume 90% accuracy, which you have not yet validated. Building financial models on marketing claims is a common due diligence error.',
            score: 1,
            next: 'step2'
          },
          {
            id: 'c',
            text: 'Check whether any RICS-regulated firms are already using the tool, and contact them for references.',
            consequence: 'Good instinct to seek peer validation. You find two firms using it: one is very positive, but only for desktop valuations on standard housing stock. The other reports accuracy issues with non-standard construction and heritage properties. Useful intelligence, but you still need to test it yourself.',
            score: 2,
            next: 'step2'
          },
          {
            id: 'd',
            text: 'Sign up immediately for the free trial and start using it on live instructions to see how it performs in practice.',
            consequence: 'Using an unvalidated tool on live client instructions is professionally reckless. If the tool produces an inaccurate valuation that a client relies upon, your firm bears the professional liability. Your PI insurer would take a very dim view. Always test with historic data first.',
            score: 0,
            next: 'step2'
          }
        ]
      },
      step2: {
        id: 'step2',
        situation: 'You have gathered initial information. Before committing to a pilot, you want to conduct proper due diligence on the vendor and product. What is your priority?',
        choices: [
          {
            id: 'a',
            text: 'Run the tool against 50 completed valuations from the past 12 months, comparing its outputs to the figures your surveyors actually reported. Test across property types, locations, and value bands.',
            consequence: 'Rigorous back-testing is the gold standard. The results reveal the tool is within 5% on standard two- and three-bedroom houses but deviates by 15\u201325% on converted flats, listed buildings, and properties above \u00a3750,000. This is critical intelligence for designing any pilot.',
            score: 3,
            next: 'step3'
          },
          {
            id: 'b',
            text: 'Review the vendor\'s data security and GDPR compliance. Check where data is stored, who has access, and whether the tool retains client information.',
            consequence: 'Data governance is essential and must be addressed, but doing this before testing accuracy puts the cart before the horse. If the tool does not produce reliable valuations, data security is irrelevant. That said, your findings are concerning: data is processed via US-based servers, which raises GDPR transfer questions.',
            score: 2,
            next: 'step3'
          },
          {
            id: 'c',
            text: 'Check the vendor\'s financial stability and corporate structure. How long have they been trading? What is their funding situation? Are they likely to still exist in two years?',
            consequence: 'Vendor viability matters for long-term decisions, but it should not be your first priority at this stage. You discover the vendor is a Series A startup with 18 months of runway. Useful context, but you still do not know whether the tool actually works for your market.',
            score: 1,
            next: 'step3'
          }
        ]
      },
      step3: {
        id: 'step3',
        situation: 'Your evaluation has identified both strengths and limitations. The head of residential is keen to proceed but you need to check RICS compliance. How do you approach this?',
        choices: [
          {
            id: 'a',
            text: 'Map the tool\'s outputs against RICS Valuation \u2013 Global Standards (Red Book) requirements. Check whether AI-generated reports meet disclosure obligations, that a named qualified surveyor takes responsibility for each valuation, and that the methodology is transparent and auditable.',
            consequence: 'Thorough and correct. Your analysis confirms the tool can assist with data gathering and initial analysis, but the output cannot be issued as a Red Book valuation without significant surveyor review and sign-off. The key insight: AI is a tool within the valuation process, not a replacement for professional judgement.',
            score: 3,
            next: 'step4'
          },
          {
            id: 'b',
            text: 'Email the RICS helpline to ask whether AI valuations are permitted under the Red Book.',
            consequence: 'Reasonable, but overly passive. The RICS helpline provides general guidance but cannot give specific approval for a particular product. You receive a generic response about technology use in valuations that does not address your specific questions. You still need to do your own compliance analysis.',
            score: 1,
            next: 'step4'
          },
          {
            id: 'c',
            text: 'Ask the vendor for their RICS compliance statement and rely on their assurance that the tool meets Red Book standards.',
            consequence: 'Never outsource compliance assessment to a vendor. Their compliance statement is marketing material, not a professional opinion. It glosses over key issues around surveyor responsibility and disclosure. If you rely on this and a valuation is challenged, "the vendor told us it was compliant" is not a defence.',
            score: 0,
            next: 'step4'
          }
        ]
      },
      step4: {
        id: 'step4',
        situation: 'Based on your evaluation, the tool has genuine value for standard residential desktop valuations but significant limitations for complex properties. The vendor is pressing for a decision and offering a 30% discount if you sign a 24-month contract this week. What is your recommendation to the board?',
        choices: [
          {
            id: 'a',
            text: 'Recommend a 6-month pilot on a monthly contract, limited to standard residential desktop valuations under \u00a3500,000. All AI-assisted valuations to be reviewed by a qualified surveyor. Establish clear KPIs and a formal review at month three and month six.',
            consequence: 'Exactly right. A controlled pilot with clear boundaries, professional oversight, and defined review points protects the firm whilst capturing the genuine efficiency gains. The monthly contract preserves flexibility. You present a credible, evidence-based recommendation that the board approves unanimously.',
            score: 3,
            next: null
          },
          {
            id: 'b',
            text: 'Recommend full adoption with the 24-month discounted contract. The financial savings are substantial and you are confident the tool will improve over time.',
            consequence: 'Overcommitting before a pilot is complete exposes the firm to significant risk. A 24-month contract locks you in if the tool underperforms, the vendor folds, or better alternatives emerge. The 30% discount is a sales tactic, not a reason to bypass due diligence.',
            score: 0,
            next: null
          },
          {
            id: 'c',
            text: 'Recommend against adoption entirely. The limitations you identified are too significant and the risk to the firm\'s reputation is not worth the efficiency gain.',
            consequence: 'Overly cautious. The tool has demonstrated genuine value for a specific use case. Rejecting it entirely means your competitors capture that efficiency advantage. The professional approach is to adopt within defined boundaries, not to reject useful technology because it is not perfect.',
            score: 1,
            next: null
          },
          {
            id: 'd',
            text: 'Recommend a 6-month pilot but allow use across all property types and value bands to "really test" the tool\'s capabilities.',
            consequence: 'Using the tool on property types where your testing showed 15\u201325% deviation is irresponsible. A pilot should operate within the boundaries where accuracy has been demonstrated. Testing on complex properties risks actual client harm. Expand the scope only after proven performance.',
            score: 1,
            next: null
          }
        ]
      }
    },
    summary: {
      excellent: { min: 10, text: 'Exceptional critical evaluation. You demonstrated rigorous due diligence, evidence-based decision-making, and a nuanced understanding of both the opportunities and risks of PropTech adoption. Your structured approach to pilot design and compliance checking reflects the highest professional standards.' },
      good: { min: 7, text: 'Good evaluation approach with solid professional instincts. You identified key risks and made sensible decisions at most stages. Strengthening your due diligence methodology and compliance analysis would further improve your PropTech evaluation capability.' },
      fair: { min: 4, text: 'Some sound decisions but gaps in your evaluation process. Technology evaluation requires systematic due diligence across accuracy, compliance, data security, and vendor viability. Review the learning points to build a more robust evaluation framework.' },
      poor: { min: 0, text: 'Significant gaps in your PropTech evaluation approach. Adopting technology in a regulated profession requires rigorous testing, compliance mapping, and controlled implementation. Review each decision point carefully \u2014 the consequences of poor evaluation can include professional liability claims and regulatory action.' }
    },
    learningPoints: [
      'Always start with methodology and accuracy assessment before financial modelling.',
      'Back-test AI tools against your own historic data across varied property types and geographies.',
      'Never outsource compliance assessment to a vendor \u2014 map tool outputs against Red Book requirements yourself.',
      'AI valuations require a named qualified surveyor to take professional responsibility.',
      'Resist vendor pressure tactics \u2014 a monthly pilot is better than a locked-in discount contract.',
      'Design pilots with clear boundaries based on where testing has demonstrated acceptable accuracy.',
      'PropTech is a tool within professional practice, not a replacement for professional judgement.'
    ]
  };

  // --------------------------------------------------
  // 3. Client Meeting Scenario (Claude Code Training, Day 4)
  // --------------------------------------------------
  SCENARIOS['scenario-client-meeting'] = {
    id: 'scenario-client-meeting',
    title: 'AI-Assisted Rent Review Preparation',
    icon: '\uD83D\uDCBC',
    difficulty: 'Beginner / Intermediate',
    course: 'Claude Code for Property',
    context: 'You are a commercial surveyor preparing for a rent review meeting with a key client. The property is a 5,000 sq ft retail unit on a high street in a regional city. The current passing rent is \u00a3120,000 per annum and the review is to open market value. The meeting is tomorrow morning and you need to be thoroughly prepared. You have access to Claude Code as your AI assistant.',
    steps: {
      step1: {
        id: 'step1',
        situation: 'You have the lease, last review determination, and access to comparable evidence databases. You need to begin your preparation. How do you start using Claude Code?',
        choices: [
          {
            id: 'a',
            text: 'Ask Claude Code to help you create a structured preparation checklist: key lease terms to review, comparable evidence to gather, market trends to analyse, and questions to anticipate from the client. Use it as a thinking partner to ensure nothing is missed.',
            consequence: 'Excellent starting point. Using Claude as a structured thinking tool helps you work methodically. The checklist it produces includes items you might have overlooked: checking for cap-and-collar provisions, identifying any unusual review assumptions, and preparing for the client\'s likely questions about market direction.',
            score: 3,
            next: 'step2'
          },
          {
            id: 'b',
            text: 'Paste the entire lease into Claude Code and ask it to "tell you everything important for the rent review."',
            consequence: 'Unfocused prompting yields unfocused results. Claude produces a general lease summary that mixes relevant and irrelevant information. You spend time sifting through output rather than directing the analysis. A targeted approach would be more efficient.',
            score: 1,
            next: 'step2'
          },
          {
            id: 'c',
            text: 'Ask Claude Code to generate a rent review report you can present to the client tomorrow.',
            consequence: 'Jumping straight to output without proper analysis is dangerous. Claude cannot access live comparable databases and will produce generic content. A rent review requires professional judgement applied to specific evidence \u2014 you cannot shortcut the analytical process.',
            score: 0,
            next: 'step2'
          },
          {
            id: 'd',
            text: 'Start by asking Claude to analyse the rent review clause in the lease, focusing specifically on: the review mechanism, assumptions and disregards, dispute resolution procedure, and any time-of-the-essence provisions.',
            consequence: 'Very targeted and effective. Focusing Claude on the specific lease clause gives you precise, useful analysis. It flags that the review is upward-only, identifies the specific assumptions, and notes an arbitration clause you had not focused on. Strong professional use of AI.',
            score: 3,
            next: 'step2'
          }
        ]
      },
      step2: {
        id: 'step2',
        situation: 'You have gathered five comparable transactions from your databases. You want to use Claude Code to help analyse them. How do you approach this?',
        choices: [
          {
            id: 'a',
            text: 'Input each comparable with its key details and ask Claude to help you build an adjustment grid: identifying differences between each comparable and the subject property (size, location, condition, lease terms) and suggesting appropriate adjustments with reasoning.',
            consequence: 'This is how a skilled surveyor uses AI effectively. By providing Claude with structured data and asking it to assist with the analytical framework, you maintain professional control whilst benefiting from AI\'s ability to organise and reason through complex comparisons. You still apply your own market knowledge to validate the suggested adjustments.',
            score: 3,
            next: 'step3'
          },
          {
            id: 'b',
            text: 'Give Claude the comparables and ask it to calculate the market rent for your property.',
            consequence: 'Claude does not have market knowledge and cannot determine appropriate adjustment rates. It produces a figure, but the methodology is opaque and the adjustments are generic. You cannot defend this analysis in negotiation or at arbitration because you did not apply professional judgement to the key variables.',
            score: 0,
            next: 'step3'
          },
          {
            id: 'c',
            text: 'Use Claude to organise the comparables into a clear summary table, then do the adjustment analysis yourself manually.',
            consequence: 'A safe approach that uses Claude for what it does well (data organisation) whilst keeping the professional analysis with you. This is perfectly valid, though you could extract more value by also asking Claude to help identify factors you should consider in your adjustments.',
            score: 2,
            next: 'step3'
          }
        ]
      },
      step3: {
        id: 'step3',
        situation: 'Your analysis suggests a market rent of \u00a3135,000\u2013\u00a3145,000 per annum. Before the meeting, you want to verify your work. What is your quality assurance approach?',
        choices: [
          {
            id: 'a',
            text: 'Manually verify every comparable against the original source data. Cross-check Claude\'s analysis of the lease clause against the actual lease wording. Sense-check the rental range against your own market knowledge and recent transactions you are aware of from personal experience.',
            consequence: 'This is the professional standard. AI output must always be verified against primary sources. Your cross-check reveals one comparable where Claude slightly misinterpreted the lease terms (it missed a turnover rent element). Catching this before the meeting is essential.',
            score: 3,
            next: 'step4'
          },
          {
            id: 'b',
            text: 'Ask Claude to double-check its own work by running through the analysis again.',
            consequence: 'AI cannot meaningfully verify its own output. This is like proofreading your own essay \u2014 you tend to see what you expect. Claude confirms its original analysis, including the error in one comparable. Self-verification is not quality assurance.',
            score: 0,
            next: 'step4'
          },
          {
            id: 'c',
            text: 'Ask a colleague to review the analysis, mentioning that AI assisted with the preparation.',
            consequence: 'Peer review is valuable and transparent. Your colleague spots a market trend you underweighted. However, relying solely on peer review without your own verification of AI outputs means errors could pass through if your colleague is busy and does a cursory check. Combine this with your own verification.',
            score: 2,
            next: 'step4'
          }
        ]
      },
      step4: {
        id: 'step4',
        situation: 'During the client meeting, the client notices your analysis is more comprehensive than usual and asks: "Have you used AI to prepare this? How do I know the analysis is reliable?" How do you respond?',
        choices: [
          {
            id: 'a',
            text: 'Be straightforward: "Yes, I used AI to assist with organising comparable evidence and structuring the analysis. Every data point has been verified against primary sources, and the professional judgement on adjustments and rental value is mine. AI helped me be more thorough, not less rigorous."',
            consequence: 'Perfect response. Honest, confident, and reassuring. You frame AI as enhancing your professional service without undermining your expertise. The client is impressed by both the transparency and the quality of the analysis. They ask if you can use the same approach for their portfolio review.',
            score: 3,
            next: 'step5'
          },
          {
            id: 'b',
            text: 'Deflect the question: "We use various research tools and databases as part of our analysis. The important thing is the quality of the output."',
            consequence: 'Evasive without technically lying. But the client senses deflection and presses further. When they discover AI was involved, your initial evasion undermines trust. Being straightforward from the outset would have avoided this awkward exchange.',
            score: 1,
            next: 'step5'
          },
          {
            id: 'c',
            text: 'Enthusiastically explain all the AI tools you used and how they work, spending ten minutes on the technology.',
            consequence: 'The client is paying for your professional opinion, not a technology demonstration. Over-explaining the AI tools shifts focus from the property advice to the process. The client becomes more concerned about AI reliance, not less. Keep the focus on the quality of your professional advice.',
            score: 1,
            next: 'step5'
          }
        ]
      },
      step5: {
        id: 'step5',
        situation: 'The meeting concludes successfully. The client asks you to prepare a formal rent review submission using Claude Code to help draft it. What is your approach to using AI for the formal document?',
        choices: [
          {
            id: 'a',
            text: 'Use Claude to draft the structure and non-contentious sections (property description, lease summary, comparable schedule). Write the critical analysis, opinion of value, and professional recommendation yourself. Then use Claude to proofread and check consistency.',
            consequence: 'This is the optimal workflow. AI handles the administrative drafting efficiently whilst you retain control of the professional content. The final document is produced in half the time of a fully manual approach, with the analytical quality entirely your own. This is sustainable, defensible, and efficient.',
            score: 3,
            next: null
          },
          {
            id: 'b',
            text: 'Have Claude draft the entire submission and then review and edit it before sending.',
            consequence: 'Risk of "automation bias" \u2014 the tendency to accept AI-generated content with insufficient scrutiny. When Claude drafts analytical sections, its reasoning may not reflect your professional judgement. Editing AI analysis is harder than writing it yourself because you are looking for errors in someone else\'s logic rather than building your own argument.',
            score: 1,
            next: null
          },
          {
            id: 'c',
            text: 'Write the entire submission manually to ensure every word reflects your professional opinion. Time is less important than quality.',
            consequence: 'Admirable commitment to quality, but inefficient. The property description, lease summary, and comparable schedule are factual content that AI can draft accurately and quickly. Spending professional time on administrative drafting when AI can handle it means you have less time for the analytical work that adds real value.',
            score: 2,
            next: null
          }
        ]
      }
    },
    summary: {
      excellent: { min: 13, text: 'Outstanding AI-assisted workflow. You demonstrated the ideal approach: using AI as a structured thinking partner and efficient drafting tool whilst maintaining full professional control over analysis, judgement, and quality assurance. This is exactly how AI should enhance surveying practice.' },
      good: { min: 9, text: 'Good practical approach to AI-assisted preparation. You showed strong professional instincts in several areas. Focus on targeted prompting, independent verification of AI outputs, and transparent client communication to further strengthen your workflow.' },
      fair: { min: 5, text: 'Some effective use of AI but with gaps in quality assurance or workflow design. The key principle is: AI assists, you decide. Every AI output must be verified against primary sources, and your professional judgement must drive the analysis.' },
      poor: { min: 0, text: 'This approach risks professional errors and undermines client trust. AI is a powerful tool but it cannot replace professional judgement, market knowledge, or the duty of care you owe your client. Review each decision point to understand the correct workflow.' }
    },
    learningPoints: [
      'Use targeted, specific prompts \u2014 not vague requests. Direct Claude to analyse particular clauses or build specific frameworks.',
      'AI assists with research, organisation, and drafting. Professional judgement on value and analysis remains yours.',
      'Always verify AI outputs against primary source data \u2014 never rely on AI self-verification.',
      'Be transparent with clients about AI use. Frame it as enhancing thoroughness, not replacing expertise.',
      'Optimal workflow: AI drafts factual/administrative content, you write analytical/professional content.',
      'Quality assurance must include human verification of every data point AI has processed.'
    ]
  };

  // --------------------------------------------------
  // 4. Document Crisis Scenario (Claude Code Training, Day 7)
  // --------------------------------------------------
  SCENARIOS['scenario-document-crisis'] = {
    id: 'scenario-document-crisis',
    title: 'Urgent Portfolio Lease Review',
    icon: '\uD83D\uDCC4',
    difficulty: 'Intermediate / Advanced',
    course: 'Claude Code for Property',
    context: 'A client is acquiring a portfolio of 50 commercial properties and needs a lease review report within 72 hours for their board meeting. The portfolio includes retail, office, and industrial units across England and Wales. You have been sent 50 lease documents (PDF, varying quality) plus a rent roll spreadsheet. Your team has three surveyors available including yourself. This is a \u00a345,000 instruction with a tight deadline.',
    steps: {
      step1: {
        id: 'step1',
        situation: 'It is Monday morning and the documents have just arrived. You need to triage the 50 leases and establish a workflow. How do you approach this using Claude Code?',
        choices: [
          {
            id: 'a',
            text: 'First, use Claude Code to create a triage framework: categorise leases by type (FRI, IRI, internal repairing), value band, unexpired term, and complexity indicators (break clauses, turnover rents, development provisions). Then use Claude to rapidly scan each lease for these key fields, building a prioritisation matrix.',
            consequence: 'Excellent systematic approach. Within two hours, you have a complete triage matrix. Claude identifies 12 high-complexity leases (long unexpired terms, break clauses, unusual provisions), 28 standard leases, and 10 simple short-term leases. This allows you to allocate the right level of attention to each document and plan your team\'s workload intelligently.',
            score: 3,
            next: 'step2'
          },
          {
            id: 'b',
            text: 'Divide the 50 leases equally among the three surveyors (roughly 17 each) and have everyone start reading from the first page of their allocation.',
            consequence: 'Equal division is fair but not efficient. Without triage, a surveyor might spend an hour on a simple short-term lease whilst a complex FRI lease with break clauses is rushed. By the time the team realises some leases are much more complex than others, valuable time has been lost.',
            score: 1,
            next: 'step2'
          },
          {
            id: 'c',
            text: 'Use Claude Code to extract a complete summary of every clause in all 50 leases before any human review, aiming to have full AI-generated reports by lunchtime.',
            consequence: 'Ambitious but risky. Attempting to fully process 50 leases through AI without human oversight creates a quality control bottleneck later. Some PDFs have poor scan quality that Claude misinterprets. You end up with a large volume of AI output that needs extensive manual verification, which takes longer than a structured approach.',
            score: 1,
            next: 'step2'
          },
          {
            id: 'd',
            text: 'Call the client and negotiate a deadline extension before starting work.',
            consequence: 'This may be necessary eventually, but calling before you have assessed the workload signals a lack of capability. Assess the documents first, build a realistic plan, and then discuss timeline only if genuinely needed. The client chose your firm because they believed you could deliver.',
            score: 0,
            next: 'step2'
          }
        ]
      },
      step2: {
        id: 'step2',
        situation: 'Your triage is underway. You need to decide on the extraction workflow \u2014 how Claude Code will process each lease. What template and process do you design?',
        choices: [
          {
            id: 'a',
            text: 'Create a standardised extraction template with defined fields (parties, property, term, rent, reviews, breaks, repairs, insurance, alienation, user clause, key risks). Use Claude to extract these fields from each lease, with the prompt including specific instructions on what to flag as unusual. Each surveyor then reviews Claude\'s extraction against the original document for their allocated leases.',
            consequence: 'This is the professional workflow. A structured template ensures consistency across all 50 leases. The extraction prompt\'s specificity means Claude flags genuinely unusual provisions rather than producing generic summaries. Human review of each extraction against the source document maintains quality. Your team processes 50 leases in 18 hours rather than the 40+ hours a fully manual approach would require.',
            score: 3,
            next: 'step3'
          },
          {
            id: 'b',
            text: 'Use Claude to produce a free-form summary of each lease with no template, allowing it to focus on whatever it considers most important.',
            consequence: 'Without a template, Claude produces inconsistent summaries. Some focus on the repair obligations, others on rent review mechanisms. Comparing across 50 leases becomes difficult, and you miss important provisions in some documents because Claude was not specifically asked about them. The client will expect a consistent format.',
            score: 1,
            next: 'step3'
          },
          {
            id: 'c',
            text: 'Use Claude to extract data into the template but skip human review of the extraction step to save time. Surveyors will review everything at the report-writing stage.',
            consequence: 'Deferring verification is a false economy. Errors in extraction propagate into the analysis. When your team discovers incorrect rent figures and missed break clauses at the report stage, they have to go back to the original leases anyway. Catching errors early is always faster than fixing them late.',
            score: 1,
            next: 'step3'
          }
        ]
      },
      step3: {
        id: 'step3',
        situation: 'During extraction, Claude flags potential risks in 15 leases. Some are genuinely significant (a break clause exercisable by the tenant in 6 months), others may be false positives. How do you manage quality control?',
        choices: [
          {
            id: 'a',
            text: 'Create a risk register with three tiers: critical (break clauses, expiring leases, unusual provisions \u2014 full manual review required), moderate (non-standard repair obligations, restrictive user clauses \u2014 spot-check a sample), and low (minor variations from standard terms \u2014 review by exception only). Allocate your most experienced surveyor to the critical tier.',
            consequence: 'Outstanding risk management. The tiered approach ensures proportionate attention. Your experienced surveyor confirms 5 critical risks and dismisses 2 as false positives. The moderate tier spot-check catches one additional issue Claude misinterpreted. This approach delivers thoroughness within the time constraint.',
            score: 3,
            next: 'step4'
          },
          {
            id: 'b',
            text: 'Manually review all 15 flagged leases in full to be completely certain of every risk.',
            consequence: 'Thorough but impractical within 72 hours. Fully reviewing 15 complex leases takes one surveyor roughly 20 hours. This leaves insufficient time for the remaining 35 leases and the final report. Proportionate quality control means allocating effort based on risk, not treating everything equally.',
            score: 1,
            next: 'step4'
          },
          {
            id: 'c',
            text: 'Trust Claude\'s risk assessment and include all 15 flags in your report without further manual verification.',
            consequence: 'Dangerous. Two of Claude\'s flags are false positives \u2014 misinterpretations of standard lease provisions. Including false risks in an acquisition report could cause the client to renegotiate terms unnecessarily or withdraw from viable properties. Every AI-flagged risk must be verified by a qualified surveyor.',
            score: 0,
            next: 'step4'
          }
        ]
      },
      step4: {
        id: 'step4',
        situation: 'It is Wednesday morning. You have 24 hours until the board meeting. Your analysis is substantially complete but you need to present the findings clearly under time pressure. How do you compile the final report?',
        choices: [
          {
            id: 'a',
            text: 'Use Claude to compile the standardised extractions into a portfolio summary report with an executive summary, risk heat map, property-by-property schedules, and specific recommendations. You write the executive summary and risk commentary yourself, ensuring the professional opinion and key judgements are in your own words. Final QA: each surveyor reviews the properties they verified.',
            consequence: 'This is how you deliver under pressure without compromising quality. Claude handles the compilation and formatting efficiently whilst you control the narrative, risk assessment, and professional recommendations. The team-based QA ensures nothing slips through. The client receives a clear, comprehensive report on time and is impressed by both the depth and presentation.',
            score: 3,
            next: 'step5'
          },
          {
            id: 'b',
            text: 'Have Claude generate the entire report including the executive summary and risk commentary, then do a final read-through yourself.',
            consequence: 'Under time pressure, a "final read-through" of a 100+ page report risks becoming cursory. Claude\'s executive summary is generic and misses the nuances a senior surveyor would emphasise. The risk commentary lacks the professional weight the client\u2019s board expects. When a board member asks a probing question, you struggle to defend a point you did not write.',
            score: 1,
            next: 'step5'
          },
          {
            id: 'c',
            text: 'Deliver the individual lease extractions as a raw data package rather than a compiled report. It is more honest about the time constraint.',
            consequence: 'The client is paying \u00a345,000 for professional advice, not raw data. Delivering unstructured extractions puts the analytical burden on the client and fails to meet the brief. The board cannot make an acquisition decision from 50 separate lease summaries without a synthesised assessment.',
            score: 0,
            next: 'step5'
          }
        ]
      },
      step5: {
        id: 'step5',
        situation: 'The report is delivered on time. The client\'s solicitor calls with a question about one specific lease where your report flags a risk. She asks how confident you are in the analysis and whether AI was used. How do you handle this?',
        choices: [
          {
            id: 'a',
            text: 'Confirm that AI assisted with initial extraction and that a qualified surveyor verified the flagged risk against the original lease. Offer to walk through the specific clause with her, referencing the exact lease provisions. Be transparent about your process whilst demonstrating mastery of the content.',
            consequence: 'Exemplary professionalism. The solicitor is satisfied by your transparency, your command of the detail, and the verifiable audit trail. She comments that she wishes more firms were as clear about their methodology. The client instructs further work on the acquisition.',
            score: 3,
            next: null
          },
          {
            id: 'b',
            text: 'Focus only on the substance of the risk without mentioning AI. Walk through the lease provisions and your analysis.',
            consequence: 'The substance is correct and the solicitor is satisfied with the analysis. But if she later discovers AI was used and you did not mention it, trust could be affected. In a professional relationship, proactive transparency is always better than reactive disclosure.',
            score: 2,
            next: null
          },
          {
            id: 'c',
            text: 'Admit you cannot remember the specific detail and promise to come back to her after re-checking.',
            consequence: 'On a \u00a345,000 instruction delivered yesterday, not knowing the detail of a flagged risk suggests you may not have properly reviewed the AI output. The solicitor is polite but concerned. She recommends to the client that they get a second opinion on that particular property.',
            score: 0,
            next: null
          }
        ]
      }
    },
    summary: {
      excellent: { min: 13, text: 'Exceptional performance under pressure. You demonstrated the full range of AI-assisted skills: systematic triage, structured extraction, proportionate quality control, professional report compilation, and transparent communication. This is the standard for high-value, time-critical instructions.' },
      good: { min: 9, text: 'Strong delivery with effective use of AI tools. You managed the time pressure well and produced a credible output. Focus on structured quality control processes and maintaining personal command of all flagged issues to reach the highest professional standard.' },
      fair: { min: 5, text: 'The instruction was completed but with gaps in process that could have led to errors. Under time pressure, structured workflows and proportionate quality control become more important, not less. Review the learning points to strengthen your approach to volume instructions.' },
      poor: { min: 0, text: 'Significant risks in this approach. Volume instructions under time pressure demand discipline, not shortcuts. Every AI extraction must be verified, risks must be triaged proportionately, and professional opinion must always be yours. This approach could expose the firm to professional liability.' }
    },
    learningPoints: [
      'Triage first \u2014 not all documents need the same level of attention. Categorise by complexity and risk.',
      'Structured extraction templates ensure consistency across large document sets.',
      'Never skip human verification of AI-extracted data \u2014 catch errors at extraction, not at report stage.',
      'Use a tiered quality control approach: critical risks get full review, moderate risks get spot-checks.',
      'Write the executive summary and professional opinion yourself \u2014 AI drafts supporting content.',
      'Maintain personal command of every risk you flag \u2014 you must be able to defend it in detail.',
      'Transparency about AI use builds, not undermines, professional credibility.'
    ]
  };

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  var LETTERS = ['A', 'B', 'C', 'D', 'E'];

  /**
   * Create an element with optional class, attributes, and text.
   */
  function el(tag, className, textContent) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (textContent) { node.textContent = textContent; }
    return node;
  }

  /**
   * Count total steps in a scenario by traversing the optimal path
   * and any branches to find the maximum depth.
   */
  function countTotalSteps(scenario) {
    var visited = {};
    var maxDepth = 0;

    function walk(stepId, depth) {
      if (!stepId || visited[stepId]) { return; }
      visited[stepId] = true;
      if (depth > maxDepth) { maxDepth = depth; }
      var step = scenario.steps[stepId];
      if (!step) { return; }
      for (var i = 0; i < step.choices.length; i++) {
        walk(step.choices[i].next, depth + 1);
      }
    }

    walk('step1', 1);
    return maxDepth;
  }

  /**
   * Get score label and CSS modifier from a score value (0-3).
   */
  function scoreGrade(score) {
    if (score === 3) { return { label: 'Optimal Decision', mod: 'excellent' }; }
    if (score === 2) { return { label: 'Acceptable Decision', mod: 'good' }; }
    if (score === 1) { return { label: 'Suboptimal Decision', mod: 'fair' }; }
    return { label: 'Poor Decision', mod: 'poor' };
  }

  /**
   * Get the grade colour for the score ring.
   */
  function gradeColour(percentage) {
    if (percentage >= 80) { return '#16a34a'; }
    if (percentage >= 60) { return '#1e40af'; }
    if (percentage >= 40) { return '#d97706'; }
    return '#dc2626';
  }

  /**
   * Create the SVG score ring element.
   */
  function createScoreRing(percentage) {
    var container = el('div', 'sc-summary-score-ring');
    var radius = 50;
    var circumference = 2 * Math.PI * radius;
    var offset = circumference - (percentage / 100) * circumference;

    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 120 120');

    var bgCircle = document.createElementNS(svgNS, 'circle');
    bgCircle.setAttribute('cx', '60');
    bgCircle.setAttribute('cy', '60');
    bgCircle.setAttribute('r', String(radius));
    bgCircle.setAttribute('class', 'sc-ring-bg');

    var fillCircle = document.createElementNS(svgNS, 'circle');
    fillCircle.setAttribute('cx', '60');
    fillCircle.setAttribute('cy', '60');
    fillCircle.setAttribute('r', String(radius));
    fillCircle.setAttribute('class', 'sc-ring-fill');
    fillCircle.setAttribute('stroke', gradeColour(percentage));
    fillCircle.setAttribute('stroke-dasharray', String(circumference));
    fillCircle.setAttribute('stroke-dashoffset', String(circumference));

    svg.appendChild(bgCircle);
    svg.appendChild(fillCircle);
    container.appendChild(svg);

    var textNode = el('div', 'sc-summary-score-text', Math.round(percentage) + '%');
    container.appendChild(textNode);

    // Animate after a short delay
    setTimeout(function () {
      fillCircle.setAttribute('stroke-dashoffset', String(offset));
    }, 100);

    return container;
  }

  // ============================================================
  // SCENARIO RENDERER
  // ============================================================

  function ScenarioEngine(containerEl, scenarioData) {
    this.container = containerEl;
    this.data = scenarioData;
    this.totalSteps = countTotalSteps(scenarioData);
    this.reset();
  }

  ScenarioEngine.prototype.reset = function () {
    this.currentStepId = null;
    this.currentStepNumber = 0;
    this.totalScore = 0;
    this.maxPossibleScore = 0;
    this.choiceHistory = [];
    this.state = 'start'; // start | playing | summary
  };

  ScenarioEngine.prototype.init = function () {
    this.wrapper = el('div', 'sc-container');
    this.container.appendChild(this.wrapper);
    this.renderStart();
  };

  ScenarioEngine.prototype.clear = function () {
    while (this.wrapper.firstChild) {
      this.wrapper.removeChild(this.wrapper.firstChild);
    }
  };

  // ---------- Start Screen ----------

  ScenarioEngine.prototype.renderStart = function () {
    var self = this;
    this.clear();

    // Header
    this.wrapper.appendChild(this.buildHeader());

    // Body
    var body = el('div', 'sc-body');
    var start = el('div', 'sc-start');

    var icon = el('div', 'sc-start-icon', this.data.icon);
    start.appendChild(icon);

    var title = el('div', 'sc-start-title', this.data.title);
    start.appendChild(title);

    var desc = el('div', 'sc-start-desc', this.data.context);
    start.appendChild(desc);

    // Meta
    var meta = el('div', 'sc-start-meta');
    var metaDiff = el('span', 'sc-start-meta-item', this.data.difficulty);
    var metaSteps = el('span', 'sc-start-meta-item', this.totalSteps + ' decisions');
    var metaCourse = el('span', 'sc-start-meta-item', this.data.course);
    meta.appendChild(metaDiff);
    meta.appendChild(metaSteps);
    meta.appendChild(metaCourse);
    start.appendChild(meta);

    // Start button
    var btn = el('button', 'sc-start-btn', 'Begin Scenario');
    var arrow = el('span', null, ' \u2192');
    btn.appendChild(arrow);
    btn.addEventListener('click', function () {
      self.state = 'playing';
      self.currentStepId = 'step1';
      self.currentStepNumber = 1;
      self.renderStep();
    });
    start.appendChild(btn);

    body.appendChild(start);
    this.wrapper.appendChild(body);
  };

  // ---------- Header ----------

  ScenarioEngine.prototype.buildHeader = function () {
    var header = el('div', 'sc-header');

    var iconEl = el('div', 'sc-header-icon', this.data.icon);
    header.appendChild(iconEl);

    var textEl = el('div', 'sc-header-text');
    var titleEl = el('h3', 'sc-header-title', this.data.title);
    textEl.appendChild(titleEl);

    var metaEl = el('div', 'sc-header-meta');
    metaEl.textContent = 'Branching Scenario';
    var badge = el('span', 'sc-badge', this.data.difficulty);
    metaEl.appendChild(badge);
    textEl.appendChild(metaEl);

    header.appendChild(textEl);
    return header;
  };

  // ---------- Progress Bar ----------

  ScenarioEngine.prototype.buildProgressBar = function () {
    var bar = el('div', 'sc-progress-bar');
    var fill = el('div', 'sc-progress-fill');
    var pct = Math.round((this.currentStepNumber / this.totalSteps) * 100);
    fill.style.width = pct + '%';
    bar.appendChild(fill);
    return bar;
  };

  // ---------- Step Dots ----------

  ScenarioEngine.prototype.buildStepDots = function () {
    var indicator = el('div', 'sc-step-indicator');
    var label = el('span', null, 'Decision ' + this.currentStepNumber + ' of ' + this.totalSteps);
    indicator.appendChild(label);

    for (var i = 1; i <= this.totalSteps; i++) {
      var dot = el('span', 'sc-step-dot');
      if (i < this.currentStepNumber) {
        dot.className += ' sc-step-dot--done';
      } else if (i === this.currentStepNumber) {
        dot.className += ' sc-step-dot--active';
      }
      indicator.appendChild(dot);
    }

    return indicator;
  };

  // ---------- Step Rendering ----------

  ScenarioEngine.prototype.renderStep = function () {
    var self = this;
    var step = this.data.steps[this.currentStepId];
    if (!step) { return; }

    this.clear();

    // Header
    this.wrapper.appendChild(this.buildHeader());

    // Progress
    this.wrapper.appendChild(this.buildProgressBar());

    // Body
    var body = el('div', 'sc-body sc-fade-in');

    // Step dots
    body.appendChild(this.buildStepDots());

    // Situation card
    var situation = el('div', 'sc-situation');
    var sitLabel = el('div', 'sc-situation-label', 'Situation');
    situation.appendChild(sitLabel);
    var sitText = el('div', null, step.situation);
    situation.appendChild(sitText);
    body.appendChild(situation);

    // Choices
    var choicesContainer = el('div', 'sc-choices');

    step.choices.forEach(function (choice, index) {
      var card = el('div', 'sc-choice');
      card.setAttribute('data-choice-id', choice.id);

      var letter = el('div', 'sc-choice-letter', LETTERS[index]);
      card.appendChild(letter);

      var text = el('div', 'sc-choice-text', choice.text);
      card.appendChild(text);

      card.addEventListener('click', function () {
        self.handleChoice(step, choice, choicesContainer, body);
      });

      choicesContainer.appendChild(card);
    });

    body.appendChild(choicesContainer);
    this.wrapper.appendChild(body);

    // Scroll into view
    this.container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // ---------- Handle Choice ----------

  ScenarioEngine.prototype.handleChoice = function (step, choice, choicesContainer, body) {
    var self = this;

    // Disable all choices
    var cards = choicesContainer.querySelectorAll('.sc-choice');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      card.classList.add('sc-choice--disabled');
      if (card.getAttribute('data-choice-id') === choice.id) {
        card.classList.add('sc-choice--selected');
      } else {
        card.classList.add('sc-choice--faded');
      }
    }

    // Record
    this.totalScore += choice.score;
    this.maxPossibleScore += 3;
    this.choiceHistory.push({
      stepId: step.id,
      choiceId: choice.id,
      choiceText: choice.text,
      consequence: choice.consequence,
      score: choice.score
    });

    // Consequence card
    var grade = scoreGrade(choice.score);
    var consequence = el('div', 'sc-consequence');

    var cHeader = el('div', 'sc-consequence-header sc-consequence-header--' + grade.mod);
    var cIcon = el('span', null);
    if (choice.score === 3) { cIcon.textContent = '\u2713 '; }
    else if (choice.score === 2) { cIcon.textContent = '\u25CB '; }
    else if (choice.score === 1) { cIcon.textContent = '\u25B3 '; }
    else { cIcon.textContent = '\u2717 '; }
    cHeader.appendChild(cIcon);
    var cLabel = el('span', null, grade.label);
    cHeader.appendChild(cLabel);
    consequence.appendChild(cHeader);

    var cBody = el('div', 'sc-consequence-body');
    var cText = el('div', null, choice.consequence);
    cBody.appendChild(cText);

    var cScore = el('div', 'sc-consequence-score', 'Score: ' + choice.score + ' / 3');
    cBody.appendChild(cScore);

    consequence.appendChild(cBody);
    body.appendChild(consequence);

    // Next or Summary button
    if (choice.next) {
      var nextBtn = el('button', 'sc-next-btn');
      nextBtn.textContent = 'Continue ';
      var arrow = el('span', null, '\u2192');
      nextBtn.appendChild(arrow);
      nextBtn.addEventListener('click', function () {
        self.currentStepId = choice.next;
        self.currentStepNumber += 1;
        self.renderStep();
      });
      body.appendChild(nextBtn);
    } else {
      var summaryBtn = el('button', 'sc-next-btn');
      summaryBtn.textContent = 'View Results ';
      var arrow2 = el('span', null, '\u2192');
      summaryBtn.appendChild(arrow2);
      summaryBtn.addEventListener('click', function () {
        self.state = 'summary';
        self.renderSummary();
      });
      body.appendChild(summaryBtn);
    }

    // Scroll consequence into view
    consequence.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // ---------- Summary Rendering ----------

  ScenarioEngine.prototype.renderSummary = function () {
    var self = this;
    this.clear();

    // Header
    this.wrapper.appendChild(this.buildHeader());

    // Full progress
    var bar = el('div', 'sc-progress-bar');
    var fill = el('div', 'sc-progress-fill');
    fill.style.width = '100%';
    bar.appendChild(fill);
    this.wrapper.appendChild(bar);

    // Body
    var body = el('div', 'sc-body sc-summary');

    // Calculate grade
    var percentage = this.maxPossibleScore > 0
      ? Math.round((this.totalScore / this.maxPossibleScore) * 100)
      : 0;

    var gradeText = '';
    var gradeLabel = '';
    var summaryData = this.data.summary;

    if (this.totalScore >= summaryData.excellent.min) {
      gradeText = summaryData.excellent.text;
      gradeLabel = 'Excellent';
    } else if (this.totalScore >= summaryData.good.min) {
      gradeText = summaryData.good.text;
      gradeLabel = 'Good';
    } else if (this.totalScore >= summaryData.fair.min) {
      gradeText = summaryData.fair.text;
      gradeLabel = 'Fair';
    } else {
      gradeText = summaryData.poor.text;
      gradeLabel = 'Needs Review';
    }

    // Grade card
    var gradeCard = el('div', 'sc-summary-grade');
    gradeCard.appendChild(createScoreRing(percentage));

    var gradeLabelEl = el('div', 'sc-summary-grade-label', gradeLabel);
    gradeCard.appendChild(gradeLabelEl);

    var scoreDetail = el('div', 'sc-summary-grade-desc');
    scoreDetail.textContent = this.totalScore + ' / ' + this.maxPossibleScore + ' points';
    gradeCard.appendChild(scoreDetail);

    var gradeDesc = el('div', 'sc-summary-grade-desc');
    gradeDesc.style.marginTop = '12px';
    gradeDesc.textContent = gradeText;
    gradeCard.appendChild(gradeDesc);

    body.appendChild(gradeCard);

    // Path visualisation
    var pathCard = el('div', 'sc-path');
    var pathTitle = el('div', 'sc-path-title', 'Your Decision Path');
    pathCard.appendChild(pathTitle);

    this.choiceHistory.forEach(function (entry, idx) {
      var pathStep = el('div', 'sc-path-step');

      var marker = el('div', 'sc-path-marker sc-path-marker--' + entry.score);
      marker.textContent = idx + 1;
      pathStep.appendChild(marker);

      var detail = el('div', 'sc-path-detail');
      var choiceText = el('div', 'sc-path-choice-text', entry.choiceText);
      detail.appendChild(choiceText);

      var scoreText = el('div', 'sc-path-score-text', scoreGrade(entry.score).label + ' \u2014 ' + entry.score + '/3 points');
      detail.appendChild(scoreText);

      pathStep.appendChild(detail);
      pathCard.appendChild(pathStep);
    });

    body.appendChild(pathCard);

    // Learning points
    var learningCard = el('div', 'sc-learning');
    var learningTitle = el('div', 'sc-learning-title', 'Key Learning Points');
    learningCard.appendChild(learningTitle);

    var list = el('ul', 'sc-learning-list');
    this.data.learningPoints.forEach(function (point) {
      var item = el('li', 'sc-learning-item');
      var bullet = el('span', 'sc-learning-bullet', '\u25C6');
      item.appendChild(bullet);
      var text = el('span', null, point);
      item.appendChild(text);
      list.appendChild(item);
    });
    learningCard.appendChild(list);
    body.appendChild(learningCard);

    // Replay button
    var replayBtn = el('button', 'sc-replay-btn');
    var replayIcon = el('span', null, '\u21BB ');
    replayBtn.appendChild(replayIcon);
    var replayText = document.createTextNode('Replay Scenario');
    replayBtn.appendChild(replayText);
    replayBtn.addEventListener('click', function () {
      self.reset();
      self.renderStart();
    });
    body.appendChild(replayBtn);

    this.wrapper.appendChild(body);

    // Scroll to top of container
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ============================================================
  // INITIALISATION
  // ============================================================

  function injectStyles() {
    var style = document.createElement('style');
    style.setAttribute('data-scenario-engine', 'true');
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function initScenarios() {
    // Only inject styles once
    if (!document.querySelector('style[data-scenario-engine]')) {
      injectStyles();
    }

    var placeholders = document.querySelectorAll('.scenario-sim[data-scenario]');

    for (var i = 0; i < placeholders.length; i++) {
      var placeholder = placeholders[i];
      var scenarioId = placeholder.getAttribute('data-scenario');

      // Skip if already initialised
      if (placeholder.getAttribute('data-initialised') === 'true') {
        continue;
      }

      var scenarioData = SCENARIOS[scenarioId];
      if (!scenarioData) {
        console.warn('[ScenarioEngine] Unknown scenario: ' + scenarioId);
        continue;
      }

      placeholder.setAttribute('data-initialised', 'true');

      var engine = new ScenarioEngine(placeholder, scenarioData);
      engine.init();
    }
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScenarios);
  } else {
    initScenarios();
  }

  // Expose for manual re-initialisation (e.g. after dynamic content load)
  window.HillwayScenarioEngine = {
    init: initScenarios,
    scenarios: SCENARIOS
  };

})();
