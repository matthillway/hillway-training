/**
 * Hillway Training — Prompt Playground
 *
 * Interactive mock Claude terminal where learners practise writing prompts
 * and receive feedback on prompt quality. Scans for placeholder elements:
 *   <div class="prompt-playground" data-scenario="scenario-id"></div>
 *
 * Include in course HTML files. Self-initialises on DOMContentLoaded.
 * Pure vanilla JS, no dependencies.
 */
(function () {
  'use strict';

  // ============================================================
  // SCENARIOS
  // ============================================================

  var SCENARIOS = {

    // ---- AI Digital Transformation Course ----

    'ai-market-report': {
      title: 'Market Commentary Report',
      course: 'AI Digital Transformation',
      day: 3,
      difficulty: 'beginner',
      context: 'You are a surveyor at a commercial property consultancy in Sheffield. Your manager has asked you to produce a market commentary on the Sheffield office property market for the firm\'s quarterly newsletter. You want to use AI to draft this.',
      task: 'Write a prompt that asks an AI assistant to create a market commentary for Sheffield office property. Think about what information the AI needs to produce a useful, accurate piece.',
      keywords: [
        { keyword: 'sheffield', weight: 2, feedback: 'Specified the location (Sheffield)' },
        { keyword: 'office', weight: 2, feedback: 'Specified the property type (office)' },
        { keyword: 'quarter|Q[1-4]|2025|2026|period|recent|current', weight: 2, feedback: 'Included a time period or date reference' },
        { keyword: 'newsletter|client|investor|audience|reader', weight: 2, feedback: 'Defined the target audience' },
        { keyword: 'word count|length|paragraph|brief|concise|500|1000', weight: 1, feedback: 'Set a length or format constraint' },
        { keyword: 'tone|professional|formal|accessible|engaging', weight: 1, feedback: 'Specified the desired tone' },
        { keyword: 'rent|yield|vacancy|take-up|supply|demand|trend', weight: 2, feedback: 'Mentioned specific market metrics to cover' },
        { keyword: 'headline|structure|section|bullet|subheading', weight: 1, feedback: 'Requested a specific structure or format' },
        { keyword: 'source|caveat|disclaimer|verify|assumption', weight: 1, feedback: 'Asked for caveats or sourcing notes' }
      ],
      expertPrompt: 'You are a senior commercial property surveyor in Sheffield. Write a market commentary on the Sheffield office property market for Q4 2025, to be published in our firm\'s quarterly client newsletter.\n\nPlease cover:\n- Headline rental trends for Grade A and Grade B offices\n- Take-up volumes compared to the previous quarter\n- Notable lettings or pre-lets in the city centre and out-of-town\n- Vacancy rates and how they compare to the five-year average\n- Development pipeline and any speculative schemes\n- Outlook for the next 6-12 months\n\nFormat: approximately 600 words, with subheadings for each topic. Professional but accessible tone suitable for institutional investors and occupiers. Include a note at the end that all figures should be verified against the latest EGi/CoStar data before publication.',
      goodResponse: '## Sheffield Office Market Commentary — Q4 2025\n\n### Headline Rents\nPrime headline rents for Grade A office space in Sheffield city centre remained firm at approximately \u00a328.50 per sq ft, reflecting sustained demand from the professional services and technology sectors. Grade B stock continued to trade at \u00a318-22 per sq ft, with incentive packages remaining competitive.\n\n### Take-Up and Demand\nTotal take-up in Q4 reached approximately 185,000 sq ft, a 12% increase on Q3 and broadly in line with the five-year quarterly average. The legal and financial services sectors accounted for the largest share of transactions.\n\n### Notable Transactions\nThe most significant letting was the pre-let of 45,000 sq ft at Smithfield in the Heart of the City II scheme to a technology firm. Out-of-town, Sheffield Business Park recorded lettings totalling 28,000 sq ft across three transactions.\n\n### Vacancy and Supply\nCity centre vacancy currently stands at approximately 8.2%, marginally below the five-year average of 8.7%. Grade A availability remains constrained, which is supporting rental levels.\n\n### Development Pipeline\nTwo speculative schemes are under construction, providing approximately 120,000 sq ft of Grade A space due for completion in 2026. This pipeline should ease the current supply constraints for occupiers seeking quality space.\n\n### Outlook\nThe outlook for the Sheffield office market is cautiously optimistic. Continued growth in the digital and professional services sectors, combined with limited Grade A availability, is expected to support further rental growth in 2026.\n\n*Note: All figures are indicative and should be verified against the latest EGi/CoStar data before publication.*',
      poorResponse: 'Here\'s a market commentary:\n\nThe Sheffield office market is doing well. There is demand for offices and rents are going up. Some new buildings are being built. The vacancy rate is normal. Overall the market looks positive for the future.\n\nLet me know if you need anything else!',
      tips: [
        'Always specify the exact location and property type',
        'Include a time period so the AI knows what era to reference',
        'Define your audience — a report for investors reads differently from one for occupiers',
        'Request specific metrics (rents, yields, vacancy) rather than leaving it vague',
        'Set format constraints: word count, structure, tone',
        'Ask for caveats or sourcing notes to remind you to verify the output'
      ]
    },

    'ai-comparable-analysis': {
      title: 'Comparable Evidence Analysis',
      course: 'AI Digital Transformation',
      day: 5,
      difficulty: 'intermediate',
      context: 'You are acting for a landlord on a rent review of a 5,000 sq ft office suite in Sheffield city centre. The lease provides for upward-only reviews to open market rent. You have gathered five comparable lettings and need to analyse them to support your rental assessment.',
      task: 'Write a prompt that asks AI to help you analyse comparable evidence for this rent review. Consider what data the AI needs, how it should process the comparables, and what output format would be most useful.',
      keywords: [
        { keyword: 'rent review|review', weight: 2, feedback: 'Stated the purpose (rent review)' },
        { keyword: '5.?000|five thousand|subject property|office suite', weight: 2, feedback: 'Described the subject property' },
        { keyword: 'comparable|comp|evidence|letting|transaction', weight: 2, feedback: 'Referenced comparable evidence' },
        { keyword: 'address|location|floor|size|area|sq ft', weight: 2, feedback: 'Specified comparable data fields' },
        { keyword: 'rent free|incentive|headline|net effective|adjusted', weight: 3, feedback: 'Addressed incentive adjustments (critical for comparables)' },
        { keyword: 'per sq ft|rate|psf|per square', weight: 1, feedback: 'Asked for per-unit analysis' },
        { keyword: 'table|grid|spreadsheet|column|format', weight: 1, feedback: 'Requested structured output format' },
        { keyword: 'adjust|weight|hierarchy|relevance|rank', weight: 2, feedback: 'Asked for weighting or ranking of comparables' },
        { keyword: 'RICS|Red Book|professional|standard|methodology', weight: 1, feedback: 'Referenced professional standards or methodology' },
        { keyword: 'chain of thought|step by step|reasoning|explain|work through', weight: 2, feedback: 'Requested step-by-step reasoning' },
        { keyword: 'conclusion|recommendation|opinion|assessment|range', weight: 1, feedback: 'Asked for a concluded opinion or rental range' }
      ],
      expertPrompt: 'You are a RICS-qualified commercial surveyor acting for a landlord on a rent review.\n\n**Subject property:** 4th floor, Acme House, Sheffield S1 — 5,000 sq ft Grade B office suite. Review date: 25 March 2026. Upward-only to open market rent. Current passing rent: \u00a320.00 psf.\n\n**Comparable lettings:**\n1. 3rd Floor, Beta Tower, S1 — 4,200 sq ft, let Jan 2026, \u00a324.50 psf headline, 6-month rent free on 10-year term\n2. Suite 5, Gamma House, S1 — 5,800 sq ft, let Nov 2025, \u00a322.00 psf headline, 3-month rent free on 5-year term\n3. 2nd Floor, Delta Point, S1 — 3,500 sq ft, let Sep 2025, \u00a325.00 psf headline, 9-month rent free on 10-year term\n4. 7th Floor, Epsilon Place, S1 — 6,200 sq ft, let Mar 2025, \u00a321.00 psf headline, nil incentive, 5-year term\n5. Suite 12, Zeta Court, S3 — 4,800 sq ft, let Dec 2025, \u00a319.50 psf headline, 4-month rent free on 7-year term\n\nPlease:\n1. Present the comparables in a summary table with: address, size, date, headline rent, incentive, term, and location quality note\n2. Adjust each comparable to a net effective rent, showing your calculations\n3. Rank the comparables by relevance to the subject (considering size, location, date, specification)\n4. Work through your reasoning step by step to arrive at a recommended open market rental value or range for the subject property\n5. Note any caveats about the analysis\n\nOutput in a professional format suitable for a rent review submission.',
      goodResponse: '## Comparable Evidence Analysis — Rent Review\n### Acme House, 4th Floor, Sheffield S1 (5,000 sq ft)\n\n#### 1. Comparable Summary\n\n| # | Address | Size (sq ft) | Date | Headline (psf) | Incentive | Term | Location |\n|---|---------|-------------|------|----------------|-----------|------|----------|\n| 1 | Beta Tower, 3rd Fl, S1 | 4,200 | Jan 2026 | \u00a324.50 | 6m RF / 10yr | 10yr | Prime city centre |\n| 2 | Gamma House, Ste 5, S1 | 5,800 | Nov 2025 | \u00a322.00 | 3m RF / 5yr | 5yr | City centre |\n| 3 | Delta Point, 2nd Fl, S1 | 3,500 | Sep 2025 | \u00a325.00 | 9m RF / 10yr | 10yr | Prime city centre |\n| 4 | Epsilon Place, 7th Fl, S1 | 6,200 | Mar 2025 | \u00a321.00 | Nil | 5yr | City centre |\n| 5 | Zeta Court, Ste 12, S3 | 4,800 | Dec 2025 | \u00a319.50 | 4m RF / 7yr | 7yr | Edge of centre |\n\n#### 2. Net Effective Rent Adjustments\n\nUsing straight-line amortisation of rent-free periods over the lease term:\n\n- **Comp 1:** \u00a324.50 - (\u00a324.50 x 6/120) = \u00a324.50 - \u00a31.23 = **\u00a323.27 psf net effective**\n- **Comp 2:** \u00a322.00 - (\u00a322.00 x 3/60) = \u00a322.00 - \u00a31.10 = **\u00a320.90 psf net effective**\n- **Comp 3:** \u00a325.00 - (\u00a325.00 x 9/120) = \u00a325.00 - \u00a31.88 = **\u00a323.12 psf net effective**\n- **Comp 4:** \u00a321.00 (nil incentive) = **\u00a321.00 psf net effective**\n- **Comp 5:** \u00a319.50 - (\u00a319.50 x 4/84) = \u00a319.50 - \u00a30.93 = **\u00a318.57 psf net effective**\n\n#### 3. Relevance Ranking\n\n| Rank | Comp | Rationale |\n|------|------|-----------|\n| 1 | Gamma House (#2) | Closest in size (5,800 sq ft), same postcode, recent |\n| 2 | Beta Tower (#1) | Similar size, most recent, prime S1 location |\n| 3 | Zeta Court (#5) | Very close in size but S3 location — requires adjustment |\n| 4 | Epsilon Place (#4) | Larger unit, older date, but nil incentive provides clean evidence |\n| 5 | Delta Point (#3) | Smaller unit, heavy incentive package, less comparable |\n\n#### 4. Rental Assessment\n\nThe best evidence is Comps 1 and 2, both in S1 and recent. The net effective range from the most relevant comparables is \u00a320.90 - \u00a323.27 psf. Giving greatest weight to Gamma House (closest in size) and Beta Tower (most recent), and allowing for the subject being Grade B specification on a mid-floor, I would recommend an open market rent in the range of **\u00a321.50 - \u00a322.50 psf**, with a point assessment of **\u00a322.00 psf**.\n\n#### Caveats\n- Net effective calculations assume straight-line amortisation; a DCF approach may differ\n- Comparable specifications and fit-out condition should be verified via inspection\n- All transactions should be confirmed with agents involved',
      poorResponse: 'Based on the comparable evidence, the office should be valued at around \u00a322 per square foot. The comparables range from \u00a319.50 to \u00a325.00 so the middle seems about right. The rent review should therefore be set at \u00a322 psf which is a fair market rent.',
      tips: [
        'Always provide the full details of each comparable: address, size, rent, incentives, term, date',
        'Ask the AI to adjust headline rents to net effective rents — this is critical for accurate analysis',
        'Request a relevance ranking so you can see which comparables carry the most weight',
        'Ask for step-by-step reasoning, not just a conclusion',
        'Specify the output format (tables are excellent for comparable analysis)',
        'Remember to ask for caveats — AI analysis should supplement, not replace, professional judgement'
      ]
    },

    'ai-investment-memo': {
      title: 'Investment Analysis Memo',
      course: 'AI Digital Transformation',
      day: 8,
      difficulty: 'advanced',
      context: 'You have been instructed by a private investor client to appraise a multi-let office investment in Sheffield for potential acquisition. The property comprises 25,000 sq ft across four floors, with three tenants and one vacant suite. Your client needs a thorough investment memo covering financial analysis, risk assessment, and a recommendation.',
      task: 'Write a comprehensive prompt that would produce a professional investment analysis memo. This is an advanced exercise — think about persona, chain-of-thought reasoning, structured data, risk frameworks, and output constraints.',
      keywords: [
        { keyword: 'persona|act as|you are|role|surveyor|analyst|advisor', weight: 2, feedback: 'Set a professional persona or role' },
        { keyword: '25.?000|multi.?let|four floor|sheffield|subject', weight: 2, feedback: 'Described the subject property in detail' },
        { keyword: 'tenant|income|rent|passing|ERV|lease|covenant', weight: 2, feedback: 'Included tenancy schedule or income data' },
        { keyword: 'vacant|void|empty|unlet', weight: 1, feedback: 'Addressed the vacancy element' },
        { keyword: 'yield|capitalisation|NIY|EY|equivalent|all risks', weight: 3, feedback: 'Referenced investment yield methodology' },
        { keyword: 'WAULT|expiry|break|lease length|term certain', weight: 2, feedback: 'Mentioned lease term analysis (WAULT/expiry profile)' },
        { keyword: 'risk|SWOT|threat|weakness|sensitivity|downside', weight: 2, feedback: 'Requested risk assessment or SWOT analysis' },
        { keyword: 'step by step|chain of thought|reasoning|methodology|first.*then|work through', weight: 2, feedback: 'Requested chain-of-thought or methodical approach' },
        { keyword: 'capex|capital expenditure|repair|dilapidation|refurbish', weight: 1, feedback: 'Mentioned capital expenditure considerations' },
        { keyword: 'recommend|conclusion|decision|bid|price|proceed', weight: 2, feedback: 'Asked for a clear recommendation' },
        { keyword: 'table|section|heading|executive summary|appendix|structure', weight: 1, feedback: 'Specified document structure' },
        { keyword: 'caveat|limitation|assumption|verify|due diligence', weight: 1, feedback: 'Included assumptions or due diligence caveats' },
        { keyword: 'market|benchmark|comparable|evidence|similar', weight: 1, feedback: 'Asked for market context or benchmarking' }
      ],
      expertPrompt: 'You are a senior investment surveyor at a RICS-regulated firm preparing an investment acquisition memo for a private investor client.\n\n**Subject Property:**\n- Address: Victoria House, Sheffield S1 2AB\n- Description: Multi-let office building, 25,000 sq ft NIA across four floors\n- Freehold\n- Asking price: \u00a34,250,000\n\n**Tenancy Schedule:**\n| Floor | Tenant | Area (sq ft) | Rent (psf) | Total Rent | Lease Start | Lease End | Break | Next Review |\n|-------|--------|-------------|-----------|------------|-------------|-----------|-------|-------------|\n| Ground | ABC Solicitors | 6,000 | \u00a320.00 | \u00a3120,000 | Mar 2020 | Mar 2030 | None | Mar 2025 |\n| 1st | TechCo Ltd | 7,500 | \u00a322.50 | \u00a3168,750 | Jun 2023 | Jun 2033 | Jun 2028 | Jun 2028 |\n| 2nd | Smith & Co Accountants | 5,500 | \u00a318.00 | \u00a399,000 | Sep 2019 | Sep 2025 | None | N/A |\n| 3rd | VACANT | 6,000 | — | — | — | — | — | — |\n\n**Additional Information:**\n- Current total passing rent: \u00a3387,750 pa\n- Estimated ERV for vacant suite: \u00a321.00 psf (\u00a3126,000 pa)\n- Building is in good condition; estimated capex \u00a3150,000 for refurbishment of vacant floor\n- EPC rating: C (68)\n\n**Please produce the investment memo as follows:**\n\n1. **Executive Summary** — One paragraph with the key numbers and recommendation\n2. **Property Description** — Location, specification, tenure\n3. **Tenancy Analysis** — Summarise the income profile. Calculate WAULT to expiry and WAULT to break. Comment on covenant strength.\n4. **Financial Analysis** — Step by step:\n   a. Calculate the net initial yield on current income\n   b. Calculate the reversionary yield assuming the vacant floor is let at ERV\n   c. Estimate the equivalent yield\n   d. Compare yields to market benchmarks for Sheffield multi-let offices\n5. **Risk Assessment** — Present a SWOT analysis covering: lease expiry risk (Smith & Co in Sep 2025), TechCo break clause, void costs, market risk, and EPC/sustainability risk\n6. **Recommendation** — Clear recommendation to proceed, negotiate, or decline, with a suggested bid price and reasoning\n7. **Caveats** — Standard investment caveats and due diligence requirements\n\nFormat: Professional memo with clear headings, tables where appropriate, and bullet points for key findings. Approximately 1,500-2,000 words. All financial calculations must show workings.',
      goodResponse: '# Investment Acquisition Memo\n## Victoria House, Sheffield S1 2AB\n\n### 1. Executive Summary\n\nVictoria House is a 25,000 sq ft multi-let freehold office investment offered at \u00a34,250,000, reflecting a net initial yield of approximately 8.6% on current income of \u00a3387,750 pa. The property offers reversionary potential through letting the vacant 3rd floor (ERV \u00a3126,000 pa), which would increase total income to \u00a3513,750 pa and deliver a reversionary yield of approximately 11.4%. Key risks include a near-term lease expiry (Smith & Co, Sep 2025) and a break clause (TechCo, Jun 2028). Subject to satisfactory due diligence, **we recommend proceeding with a bid of \u00a34,000,000**, which reflects the void risk and required capex.\n\n### 2. Property Description\n\nThe property comprises a four-storey office building located in Sheffield city centre (S1 postcode). Total NIA is 25,000 sq ft. The building is held freehold and is in good overall condition with an EPC rating of C (68). Capital expenditure of approximately \u00a3150,000 is estimated for refurbishment of the vacant 3rd floor to attract a new letting.\n\n### 3. Tenancy Analysis\n\n**Income Profile:**\n| Floor | Tenant | Rent pa | % of Total | Lease Expiry | Status |\n|-------|--------|---------|-----------|--------------|--------|\n| Ground | ABC Solicitors | \u00a3120,000 | 31% | Mar 2030 | Secure |\n| 1st | TechCo Ltd | \u00a3168,750 | 44% | Jun 2033 (brk 2028) | Break risk |\n| 2nd | Smith & Co | \u00a399,000 | 25% | Sep 2025 | Expiry imminent |\n| 3rd | Vacant | — | — | — | Void |\n\n**WAULT to expiry (occupied floors):** Weighted by rent = 5.8 years\n**WAULT to break:** Weighted by rent = 3.2 years\n\n**Covenant commentary:** ABC Solicitors (established local firm, low risk). TechCo Ltd (growing tech company, moderate risk — recommend D&B check). Smith & Co Accountants (small practice, lease expiring — high near-term risk).\n\n### 4. Financial Analysis\n\n**Net Initial Yield:**\nAssuming purchaser\'s costs at 6.8%:\n- Gross purchase price: \u00a34,250,000\n- Purchaser\'s costs: \u00a3289,000\n- Total investment: \u00a34,539,000\n- Current passing rent: \u00a3387,750\n- **NIY = \u00a3387,750 / \u00a34,539,000 = 8.54%**\n\n**Reversionary Yield (fully let):**\n- Total ERV (all floors): \u00a3513,750 pa\n- **Reversionary yield = \u00a3513,750 / \u00a34,539,000 = 11.32%**\n\n**Market Context:** Prime Sheffield office yields are currently 7.0-7.5% for single-let investments. Multi-let secondary stock typically trades at 8.0-9.5%. The NIY of 8.54% is within the expected range for this asset profile.\n\n### 5. SWOT Analysis\n\n**Strengths:**\n- Freehold tenure\n- Diversified income across three tenants\n- Significant reversionary potential from vacant floor letting\n- Strong city centre location\n\n**Weaknesses:**\n- 25% of income expires within 6 months (Smith & Co)\n- Capex required for 3rd floor refurbishment (\u00a3150,000)\n- WAULT to break of only 3.2 years\n\n**Opportunities:**\n- Letting vacant floor would increase income by 32%\n- Rent review on ABC Solicitors may produce uplift\n- Potential for EPC improvement to attract ESG-focused tenants\n\n**Threats:**\n- TechCo break clause in Jun 2028 could create additional void\n- Deteriorating market conditions could extend void periods\n- Tightening EPC regulations (minimum B by 2030) may require further investment\n\n### 6. Recommendation\n\n**Recommend: Proceed with a bid of \u00a34,000,000** (NIY 9.1% on current income). This reflects a \u00a3250,000 discount to the asking price to account for:\n- Imminent Smith & Co lease expiry and associated void risk\n- \u00a3150,000 capex requirement for 3rd floor\n- TechCo break clause uncertainty\n\nIf the vacant floor is successfully let at ERV and Smith & Co vacate, the net income position improves to approximately \u00a3414,750 pa (excluding Smith & Co, including new 3rd floor letting), supporting the investment at a yield of approximately 9.7%.\n\n### 7. Caveats\n- This appraisal is for guidance only and does not constitute a formal valuation under RICS Valuation Standards\n- All figures are subject to verification through due diligence\n- A full building survey, title review, and environmental assessment are recommended prior to exchange\n- Covenant strength checks should be conducted on all tenants',
      poorResponse: 'Victoria House looks like a decent investment. It\'s a multi-let office building in Sheffield with some tenants and a vacant floor. The asking price is \u00a34.25m and the rent is about \u00a3388k so the yield is around 9%. There\'s some risk with tenants leaving but overall it seems like a reasonable deal. I\'d recommend buying it at the asking price. Let me know if you need more details.',
      tips: [
        'Set a clear persona (e.g. "You are a senior investment surveyor") to get professional-grade output',
        'Provide complete tenancy data in a structured format — the AI can only analyse what you give it',
        'Explicitly request chain-of-thought: "Step by step, calculate..." forces the AI to show its workings',
        'Ask for specific frameworks: SWOT analysis, yield calculations, WAULT analysis',
        'Define the document structure upfront (executive summary, sections, caveats)',
        'Always request caveats — AI output must not be mistaken for formal valuation advice',
        'Include capex and void cost considerations for a complete investment picture'
      ]
    },

    // ---- Claude Code Training Course ----

    'cc-email-draft': {
      title: 'Professional Email Draft',
      course: 'Claude Code Training',
      day: 3,
      difficulty: 'beginner',
      context: 'You manage a commercial office building in Sheffield. One of your tenants, DataFlow Solutions Ltd, occupies Suite 4 on a lease with a rent review due on 25 March 2026. You need to write them a professional letter initiating the rent review process and proposing a meeting to discuss terms.',
      task: 'Write a prompt asking Claude to draft this email. Think about what context Claude needs: who is writing, who is the recipient, what is the purpose, what tone is appropriate, and what key points must be covered.',
      keywords: [
        { keyword: 'tenant|DataFlow|occupier|lessee', weight: 2, feedback: 'Identified the recipient (tenant/DataFlow)' },
        { keyword: 'rent review|review date|25 March', weight: 2, feedback: 'Stated the purpose (rent review)' },
        { keyword: 'professional|formal|courteous|polite|business', weight: 1, feedback: 'Specified the tone' },
        { keyword: 'meeting|discuss|appointment|call|arrange', weight: 2, feedback: 'Mentioned proposing a meeting' },
        { keyword: 'lease|clause|terms|provision', weight: 1, feedback: 'Referenced lease terms or provisions' },
        { keyword: 'property manager|surveyor|managing agent|landlord|on behalf', weight: 1, feedback: 'Established who is writing the email' },
        { keyword: 'suite 4|office|building|address', weight: 1, feedback: 'Referenced the specific property' },
        { keyword: 'date|deadline|timeframe|response|within', weight: 1, feedback: 'Included a timeframe or response deadline' },
        { keyword: 'sign off|regards|signature|name', weight: 1, feedback: 'Mentioned how to sign off or close the letter' }
      ],
      expertPrompt: 'Draft a professional email from me (Sarah Mitchell, Property Manager at Hillway Property Consultants) to Mr James Chen, Managing Director of DataFlow Solutions Ltd, the tenant of Suite 4, Apex Building, Sheffield S1 4AB.\n\nPurpose: To formally notify DataFlow Solutions that their rent review falls due on 25 March 2026, in accordance with clause 4.2 of their lease. I wish to:\n1. Confirm the rent review date\n2. Note that we will be assessing the open market rent in line with the lease provisions\n3. Propose a meeting in the next 2-3 weeks to discuss the review and our proposed terms\n4. Request that they confirm their preferred availability\n\nTone: Professional and courteous — we have a good relationship with this tenant and want to maintain it. This is not adversarial.\n\nFormat: Standard business email. Keep it concise (under 250 words). Sign off as "Kind regards, Sarah Mitchell MRICS, Property Manager, Hillway Property Consultants" with phone number 0114 xxx xxxx.',
      goodResponse: 'Subject: Rent Review — Suite 4, Apex Building, Sheffield S1 4AB — 25 March 2026\n\nDear Mr Chen,\n\nI hope this email finds you well.\n\nI am writing to advise that the rent review under your lease of Suite 4, Apex Building, Sheffield S1 4AB falls due on 25 March 2026, in accordance with clause 4.2 of the lease dated 25 March 2021.\n\nAs you will be aware, the lease provides for the rent to be reviewed to the open market rental value at this date. We are currently undertaking our assessment of the open market rent, taking into account recent market evidence and comparable transactions in the Sheffield office market.\n\nI would welcome the opportunity to meet with you to discuss the forthcoming review and our proposed terms. I am hopeful that we can reach an agreement in a straightforward and collaborative manner, as has been the case throughout our landlord and tenant relationship.\n\nWould you be available for a meeting at a mutually convenient time over the next two to three weeks? I am happy to come to your offices or to arrange a meeting at ours. Please let me know your preferred dates and I will confirm arrangements.\n\nIf you have any questions in the meantime, please do not hesitate to contact me.\n\nKind regards,\n\nSarah Mitchell MRICS\nProperty Manager\nHillway Property Consultants\nTel: 0114 xxx xxxx',
      poorResponse: 'Hi,\n\nJust a quick note to say your rent review is coming up. We\'ll be in touch about a new rent figure. Let us know if you want to chat about it.\n\nThanks,\nSarah',
      tips: [
        'Tell Claude who is writing and who is receiving the email — names and roles matter',
        'Be specific about the purpose: rent review, the date, the lease clause',
        'Set the tone explicitly — "professional and courteous" gives very different results from no guidance',
        'List the key points that must be covered in the email',
        'Specify format constraints: word count, sign-off format, subject line'
      ]
    },

    'cc-lease-summary': {
      title: 'Commercial Lease Summary',
      course: 'Claude Code Training',
      day: 5,
      difficulty: 'intermediate',
      context: 'A colleague has sent you a 45-page commercial lease and asked you to prepare a summary of the key terms for a client who is considering taking the space. The client is a small business owner who is not familiar with legal terminology. You want to use Claude to help extract and summarise the critical information.',
      task: 'Write a prompt asking Claude to summarise key terms from a commercial lease. Think about what sections to extract, how to structure the output, who will read it, and what caveats are important.',
      keywords: [
        { keyword: 'lease|commercial lease|document', weight: 1, feedback: 'Referenced the lease document' },
        { keyword: 'summary|summarise|extract|key terms|heads of terms', weight: 2, feedback: 'Asked for a summary or extraction of key terms' },
        { keyword: 'rent|premium|service charge|insurance|outgoings', weight: 2, feedback: 'Specified financial terms to extract' },
        { keyword: 'break|notice|termination|expiry|term|duration|length', weight: 2, feedback: 'Mentioned break clauses or lease term details' },
        { keyword: 'repair|dilapidation|FRI|internal|obligation|reinstate', weight: 2, feedback: 'Addressed repairing obligations' },
        { keyword: 'assignment|subletting|alienation|transfer', weight: 1, feedback: 'Mentioned alienation provisions' },
        { keyword: 'use|permitted use|planning|restriction', weight: 1, feedback: 'Referenced permitted use restrictions' },
        { keyword: 'plain English|simple|non.?technical|jargon.?free|layperson|client', weight: 2, feedback: 'Asked for plain English or specified the audience' },
        { keyword: 'table|section|heading|structure|format|bullet', weight: 1, feedback: 'Requested a structured output format' },
        { keyword: 'flag|risk|concern|unfavourable|unusual|onerous', weight: 2, feedback: 'Asked Claude to flag risks or unusual clauses' },
        { keyword: 'caveat|disclaimer|legal advice|solicitor|not legal', weight: 2, feedback: 'Included a legal disclaimer or caveat requirement' },
        { keyword: 'review date|rent review|frequency|mechanism', weight: 1, feedback: 'Mentioned rent review provisions' }
      ],
      expertPrompt: 'I am going to paste a 45-page commercial lease below. Please extract and summarise the key terms in a format suitable for a small business owner who is not familiar with legal terminology.\n\n**Structure your summary under these headings:**\n\n1. **The Basics** — Parties (landlord/tenant), property address and description, lease term (start/end dates), any break clauses with exact dates and notice requirements\n2. **Costs** — Annual rent, rent review dates and mechanism (open market/RPI/fixed), service charge details and cap (if any), insurance rent, business rates responsibility, any other outgoings\n3. **What You Can and Cannot Do** — Permitted use, any restrictions on alterations, signage, subletting or assignment provisions\n4. **Your Obligations** — Repairing obligations (FRI/internal only), decoration schedule, reinstatement obligations at lease end, compliance requirements\n5. **Important Dates and Deadlines** — Rent review dates, break clause dates with notice periods, lease expiry, any conditions precedent\n6. **Red Flags** — Identify any clauses that are unusual, particularly onerous, or that the tenant should take legal advice on before signing\n\n**For each section:**\n- Summarise in plain English — avoid legal jargon\n- Where you use a technical term, briefly explain what it means\n- Note the relevant clause number for reference\n\n**At the end, include:**\n- A one-paragraph overall assessment: is this a typical lease or are there notable concerns?\n- A clear disclaimer: "This summary is for guidance only and does not constitute legal advice. You should instruct a solicitor to review the lease in full before entering into any commitment."\n\nPlease be thorough but concise. Target approximately 800-1,000 words for the summary.',
      goodResponse: '## Lease Summary — [Property Address]\n*Prepared for: [Client Name] | Date: [Today]*\n\n### 1. The Basics\n- **Landlord:** Sheffield Property Holdings Ltd\n- **Tenant:** [Your company name — to be inserted]\n- **Property:** Ground floor retail unit, 1,200 sq ft, 42 High Street, Sheffield S1 2GE\n- **Term:** 10 years from 1 June 2026 to 31 May 2036\n- **Break clause:** Tenant-only break at Year 5 (31 May 2031). You must give 6 months\' written notice (by 30 November 2030) and have paid all rent up to date. *(Clause 8.1)*\n\n### 2. Costs\n- **Rent:** \u00a335,000 per annum (\u00a32,916.67 per month), payable quarterly in advance *(Clause 3.1)*\n- **Rent reviews:** Every 5 years (1 June 2031), upward only to open market rent — meaning your rent cannot decrease at review *(Clause 4)*\n- **Service charge:** Estimated \u00a33,500 pa for maintenance of common areas, subject to annual reconciliation. No cap specified *(Clause 5.2)* \u26a0\ufe0f\n- **Insurance:** Landlord insures the building; you reimburse a proportion via the insurance rent *(Clause 5.4)*\n- **Business rates:** Tenant\'s responsibility in full *(Clause 5.5)*\n\n### 3. What You Can and Cannot Do\n- **Permitted use:** Use as offices within Class E of the Use Classes Order. No other use without landlord consent *(Clause 6.1)*\n- **Alterations:** Internal non-structural alterations permitted with landlord\'s prior written consent (not to be unreasonably withheld). No external or structural alterations *(Clause 7.3)*\n- **Assignment/subletting:** You may assign the whole with landlord consent (subject to conditions including guarantor). No subletting of part *(Clause 9)*\n\n### 4. Your Obligations\n- **Repairs:** Full repairing and insuring (FRI) lease — this means you are responsible for keeping the property in good repair throughout the term, including structural elements *(Clause 10)* \u26a0\ufe0f *This is significant for a small business — consider negotiating to internal repair only*\n- **Decoration:** Internal redecoration every 3 years and in the last year of the term *(Clause 10.4)*\n- **Reinstatement:** You must remove all alterations and reinstate the property to its original condition at lease end *(Clause 10.6)*\n\n### 5. Important Dates\n| Date | Event | Action Required |\n|------|-------|-----------------|\n| 30 Nov 2030 | Break notice deadline | Serve notice if you wish to leave at Year 5 |\n| 31 May 2031 | Break date / rent review | Lease ends if notice served; rent review if continuing |\n| 31 May 2036 | Lease expiry | Vacate or negotiate new terms |\n\n### 6. Red Flags\n- \u26a0\ufe0f **FRI repairing obligation** (Clause 10) — As a ground floor tenant in an older building, full structural repair could be costly. Recommend negotiating to internal repair only, or requesting a schedule of condition to limit your liability.\n- \u26a0\ufe0f **No service charge cap** (Clause 5.2) — The service charge could increase without limit. Consider requesting a cap or reviewing 3 years of service charge accounts.\n- \u26a0\ufe0f **Upward-only rent review** (Clause 4) — Your rent can only go up at review, never down, regardless of market conditions.\n\n### Overall Assessment\nThis is a broadly standard commercial lease, but the FRI repairing obligation and uncapped service charge are notable concerns for a small business tenant. These are negotiable points and I would recommend your solicitor seeks amendments before you commit.\n\n---\n*This summary is for guidance only and does not constitute legal advice. You should instruct a solicitor to review the lease in full before entering into any commitment.*',
      poorResponse: 'The lease is for 10 years at \u00a335,000 per year. There\'s a break clause at year 5. The tenant is responsible for repairs. You can use it as offices. The landlord handles insurance. Let me know if you need more details about any specific clause.',
      tips: [
        'Specify exactly which sections of the lease to extract — do not leave it to chance',
        'Ask for plain English explanations of legal terms — essential for non-specialist clients',
        'Request that Claude flags unusual or onerous clauses as red flags',
        'Always include a legal disclaimer requirement — AI-generated lease summaries must not be mistaken for legal advice',
        'Ask for clause references so the reader can find the original wording',
        'Specify the structure and approximate length to keep the output focused'
      ]
    },

    'cc-portfolio-report': {
      title: 'Quarterly Portfolio Report',
      course: 'Claude Code Training',
      day: 8,
      difficulty: 'advanced',
      context: 'You manage a portfolio of 12 commercial properties across Sheffield and Leeds for a pension fund client. Quarterly reporting is due and you need to produce a comprehensive portfolio management report covering occupancy, income, arrears, lease events, capital expenditure, and market outlook. The report goes to the fund\'s investment committee.',
      task: 'Write an advanced prompt that would produce a thorough quarterly portfolio management report. Think about data structure, KPIs, comparison periods, visualisation requests, audience, and distribution considerations.',
      keywords: [
        { keyword: 'persona|act as|you are|role|portfolio manager|fund manager|asset manager', weight: 1, feedback: 'Set a professional persona' },
        { keyword: 'portfolio|12 properties|sheffield|leeds|commercial', weight: 2, feedback: 'Described the portfolio scope' },
        { keyword: 'quarter|Q[1-4]|period|reporting period|2025|2026', weight: 2, feedback: 'Specified the reporting period' },
        { keyword: 'occupancy|vacancy|void|let|occupied', weight: 2, feedback: 'Included occupancy as a KPI' },
        { keyword: 'income|rent|passing rent|ERV|gross income|net income', weight: 2, feedback: 'Included income metrics' },
        { keyword: 'arrears|debt|outstanding|collection|aged', weight: 2, feedback: 'Addressed arrears or rent collection' },
        { keyword: 'lease event|expiry|break|review|WAULT', weight: 2, feedback: 'Mentioned upcoming lease events' },
        { keyword: 'capex|capital expenditure|maintenance|works|spend', weight: 1, feedback: 'Included capital expenditure reporting' },
        { keyword: 'comparison|previous quarter|year.?on.?year|trend|vs|benchmark', weight: 2, feedback: 'Requested comparisons to prior periods or benchmarks' },
        { keyword: 'table|chart|graph|dashboard|visual|summary', weight: 2, feedback: 'Requested tables, charts, or visual elements' },
        { keyword: 'investment committee|board|client|audience|fund|pension', weight: 1, feedback: 'Identified the audience (investment committee)' },
        { keyword: 'executive summary|overview|highlight|key finding', weight: 1, feedback: 'Requested an executive summary' },
        { keyword: 'risk|concern|action|recommend|next step', weight: 1, feedback: 'Asked for risk commentary or action items' },
        { keyword: 'market|outlook|forecast|trend|economic', weight: 1, feedback: 'Included market outlook section' },
        { keyword: 'ESG|sustainability|EPC|carbon|environmental', weight: 1, feedback: 'Included ESG or sustainability reporting' },
        { keyword: 'structure|section|format|appendix|page|heading', weight: 1, feedback: 'Defined the report structure' },
        { keyword: 'confidential|distribution|internal|sensitive', weight: 1, feedback: 'Addressed confidentiality or distribution' }
      ],
      expertPrompt: 'You are a senior portfolio manager at a RICS-regulated property consultancy. Prepare a quarterly portfolio management report for a pension fund client\'s investment committee.\n\n**Portfolio:** 12 commercial properties (7 in Sheffield, 5 in Leeds) comprising offices, retail, and industrial. Total portfolio value: \u00a345.2m. Reporting period: Q4 2025 (October-December 2025).\n\n**I will provide the following data after this prompt:**\n- Property-by-property tenancy schedule (address, tenant, rent, lease dates, break/review dates)\n- Rent collection figures for Q4 vs Q3\n- Arrears aged debtor report\n- Capex spend log\n- Void schedule with marketing status\n\n**Report structure:**\n\n1. **Executive Summary** (1 page)\n   - Portfolio headline KPIs in a dashboard-style summary table\n   - Top 3 achievements this quarter\n   - Top 3 concerns or action items\n\n2. **Portfolio Performance Dashboard**\n   - KPI comparison table: Q4 2025 vs Q3 2025 vs Q4 2024\n   - KPIs: occupancy rate (by area and by income), total passing rent, total ERV, WAULT to expiry, WAULT to break, rent collection rate, arrears as % of rent roll, capex spend vs budget\n   - Use arrows or indicators to show direction of travel for each KPI\n\n3. **Income Analysis**\n   - Total gross income, net income after void costs\n   - Rent collection performance: % collected within 7 days, 14 days, 30 days, 60 days+\n   - Aged arrears breakdown with commentary on problem debtors\n   - Comparison to prior quarter and same quarter last year\n\n4. **Occupancy and Void Report**\n   - Current voids by property with area, ERV, void period, marketing status\n   - Void cost analysis (rates, service charge, insurance on empty units)\n   - Lettings completed this quarter and terms achieved\n   - Pipeline: current enquiries and viewings\n\n5. **Lease Event Schedule**\n   - Table of all lease events in the next 12 months: expiries, breaks, reviews\n   - RAG status (Red/Amber/Green) for each event with commentary\n   - Strategy recommendations for each material event\n\n6. **Capital Expenditure**\n   - Spend this quarter vs budget\n   - Completed projects and their impact on rental value\n   - Planned works for next quarter\n\n7. **ESG and Compliance**\n   - EPC ratings summary across the portfolio\n   - Progress on any EPC improvement works\n   - Sustainability initiatives\n\n8. **Market Commentary**\n   - Sheffield and Leeds office, retail, and industrial market overview\n   - How portfolio performance compares to market benchmarks\n   - Outlook for next quarter\n\n9. **Recommendations and Next Steps**\n   - Numbered action items with owner, deadline, and priority\n\n**Format requirements:**\n- Professional report suitable for an investment committee pack\n- Executive summary must stand alone (some committee members only read this page)\n- Use tables extensively — the committee prefers data over prose\n- Include a "traffic light" RAG summary on the first page\n- Mark as "Private and Confidential — [Fund Name] Investment Committee"\n- Target 15-20 pages including tables\n\n**Important notes:**\n- All financial figures in GBP\n- Where data is not provided, insert [DATA REQUIRED] placeholders\n- Flag any KPIs that have deteriorated quarter-on-quarter\n- All commentary should be factual and evidence-based — avoid speculation',
      goodResponse: '# Quarterly Portfolio Management Report\n## Q4 2025 (October — December 2025)\n\n**Private and Confidential — [Fund Name] Investment Committee**\n\n---\n\n### 1. Executive Summary\n\n#### Portfolio Dashboard — Q4 2025\n\n| KPI | Q4 2025 | Q3 2025 | Q4 2024 | Trend |\n|-----|---------|---------|---------|-------|\n| Portfolio value | \u00a345.2m | \u00a344.8m | \u00a343.5m | \u2191 |\n| Occupancy (by area) | 91.3% | 89.7% | 92.1% | \u2191 |\n| Occupancy (by income) | 93.8% | 91.2% | 94.5% | \u2191 |\n| Passing rent | \u00a33,412,500 pa | \u00a33,298,000 pa | \u00a33,380,000 pa | \u2191 |\n| ERV (portfolio) | \u00a33,890,000 pa | \u00a33,850,000 pa | \u00a33,720,000 pa | \u2191 |\n| WAULT to expiry | 5.2 years | 5.4 years | 5.8 years | \u2193 |\n| WAULT to break | 3.1 years | 3.3 years | 3.7 years | \u2193 |\n| Rent collection (30 days) | 96.2% | 94.8% | 95.5% | \u2191 |\n| Arrears (% of rent roll) | 2.1% | 3.4% | 2.8% | \u2191 |\n| Capex spend vs budget | 87% | [DATA REQUIRED] | [DATA REQUIRED] | — |\n\n**RAG Summary:** \ud83d\udfe2 Income and collection improving | \ud83d\udfe1 WAULT declining — lease events require attention | \ud83d\udfe2 Occupancy recovered\n\n**Top 3 Achievements:**\n1. Completed two new lettings generating \u00a3114,500 pa additional income\n2. Rent collection rate improved to 96.2% (up from 94.8% in Q3)\n3. Arrears reduced from 3.4% to 2.1% of rent roll following active debt management\n\n**Top 3 Concerns:**\n1. Three lease expiries in Q1 2026 representing \u00a3285,000 pa (8.4% of rent roll)\n2. WAULT to break continues to shorten — proactive tenant engagement recommended\n3. Two properties require EPC improvement works to meet 2028 minimum B rating\n\n---\n\n*[Sections 2-9 would follow with full data tables, detailed analysis, lease event schedules with RAG ratings, capex tracking, ESG compliance summary, market commentary for Sheffield and Leeds, and numbered action items with owners and deadlines.]*\n\n*[Report continues for approximately 18 pages with supporting schedules and appendices.]*',
      poorResponse: 'Here\'s a summary of the portfolio for Q4:\n\n- 12 properties in Sheffield and Leeds\n- Most are let, a few are vacant\n- Rents are being collected ok\n- Some leases are expiring soon\n- The market is generally stable\n- We recommend continuing to manage the portfolio actively\n\nPlease let me know if you need the full report.',
      tips: [
        'For complex reports, define the exact structure with numbered sections and sub-sections',
        'Specify KPIs explicitly and request comparison to prior periods',
        'Ask for tables and visual elements — investment committees prefer data-dense formats',
        'Include a requirement for an executive summary that stands alone',
        'Request RAG (Red/Amber/Green) ratings for lease events and risk items',
        'Address ESG/sustainability — this is increasingly required in institutional reporting',
        'Include confidentiality marking and distribution notes',
        'Ask for [DATA REQUIRED] placeholders where real data needs to be inserted — better than AI fabricating numbers',
        'Set a persona to ensure the tone matches investment committee expectations'
      ]
    }
  };

  // ============================================================
  // DOM HELPER — safe element construction (no innerHTML)
  // ============================================================

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'className') {
          node.className = attrs[key];
        } else if (key === 'textContent') {
          node.textContent = attrs[key];
        } else if (key === 'htmlFor') {
          node.htmlFor = attrs[key];
        } else if (key.indexOf('on') === 0) {
          // Event handlers: onClick, onInput, etc.
          var event = key.substring(2).toLowerCase();
          node.addEventListener(event, attrs[key]);
        } else {
          node.setAttribute(key, attrs[key]);
        }
      });
    }
    if (children) {
      children.forEach(function (child) {
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
  // CSS INJECTION
  // ============================================================

  function injectStyles() {
    if (document.getElementById('prompt-playground-styles')) return;

    var style = document.createElement('style');
    style.id = 'prompt-playground-styles';
    style.textContent = [
      /* Container */
      '.pp-container {',
      '  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;',
      '  border-radius: 12px;',
      '  overflow: hidden;',
      '  margin: 32px 0;',
      '  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08);',
      '  border: 1px solid rgba(255, 255, 255, 0.06);',
      '}',

      /* Header bar */
      '.pp-header {',
      '  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);',
      '  padding: 16px 24px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 12px;',
      '}',
      '.pp-header-left {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 12px;',
      '  min-width: 0;',
      '}',
      '.pp-dots {',
      '  display: flex;',
      '  gap: 6px;',
      '  flex-shrink: 0;',
      '}',
      '.pp-dot {',
      '  width: 10px; height: 10px;',
      '  border-radius: 50%;',
      '}',
      '.pp-dot-red { background: #ef4444; }',
      '.pp-dot-yellow { background: #eab308; }',
      '.pp-dot-green { background: #22c55e; }',
      '.pp-title {',
      '  color: #e2e8f0;',
      '  font-size: 14px;',
      '  font-weight: 600;',
      '  letter-spacing: 0.3px;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '}',
      '.pp-badge {',
      '  font-size: 11px;',
      '  font-weight: 600;',
      '  padding: 3px 10px;',
      '  border-radius: 12px;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.5px;',
      '  flex-shrink: 0;',
      '}',
      '.pp-badge-beginner { background: #166534; color: #bbf7d0; }',
      '.pp-badge-intermediate { background: #854d0e; color: #fef08a; }',
      '.pp-badge-advanced { background: #991b1b; color: #fecaca; }',

      /* Context area */
      '.pp-context {',
      '  background: #f8fafc;',
      '  padding: 20px 24px;',
      '  border-bottom: 1px solid #e2e8f0;',
      '}',
      '.pp-context-label {',
      '  font-size: 11px;',
      '  font-weight: 700;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.8px;',
      '  color: #64748b;',
      '  margin-bottom: 6px;',
      '}',
      '.pp-context-text {',
      '  font-size: 14px;',
      '  line-height: 1.6;',
      '  color: #334155;',
      '}',
      '.pp-task {',
      '  background: #eff6ff;',
      '  padding: 20px 24px;',
      '  border-bottom: 1px solid #e2e8f0;',
      '}',
      '.pp-task-label {',
      '  font-size: 11px;',
      '  font-weight: 700;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.8px;',
      '  color: #1e40af;',
      '  margin-bottom: 6px;',
      '}',
      '.pp-task-text {',
      '  font-size: 14px;',
      '  line-height: 1.6;',
      '  color: #1e293b;',
      '  font-weight: 500;',
      '}',

      /* Input area */
      '.pp-input-area {',
      '  background: #0f172a;',
      '  padding: 20px 24px;',
      '}',
      '.pp-input-label {',
      '  font-size: 12px;',
      '  font-weight: 600;',
      '  color: #94a3b8;',
      '  margin-bottom: 8px;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '}',
      '.pp-input-caret {',
      '  color: #0ea5e9;',
      '  font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;',
      '  font-weight: 700;',
      '}',
      '.pp-textarea {',
      '  width: 100%;',
      '  min-height: 120px;',
      '  background: #1e293b;',
      '  border: 1px solid #334155;',
      '  border-radius: 8px;',
      '  color: #e2e8f0;',
      '  font-family: "SF Mono", "Fira Code", "Cascadia Code", "Courier New", monospace;',
      '  font-size: 13px;',
      '  line-height: 1.6;',
      '  padding: 14px 16px;',
      '  resize: vertical;',
      '  outline: none;',
      '  transition: border-color 0.2s;',
      '}',
      '.pp-textarea:focus {',
      '  border-color: #0ea5e9;',
      '  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);',
      '}',
      '.pp-textarea::placeholder {',
      '  color: #475569;',
      '}',
      '.pp-textarea:disabled {',
      '  opacity: 0.5;',
      '  cursor: not-allowed;',
      '}',
      '.pp-btn-row {',
      '  display: flex;',
      '  gap: 10px;',
      '  margin-top: 12px;',
      '  flex-wrap: wrap;',
      '}',
      '.pp-btn {',
      '  padding: 10px 20px;',
      '  border-radius: 8px;',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;',
      '  border: none;',
      '  cursor: pointer;',
      '  transition: all 0.2s;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '}',
      '.pp-btn:disabled {',
      '  opacity: 0.4;',
      '  cursor: not-allowed;',
      '}',
      '.pp-btn-primary {',
      '  background: linear-gradient(135deg, #0ea5e9, #3b82f6);',
      '  color: #ffffff;',
      '}',
      '.pp-btn-primary:hover:not(:disabled) {',
      '  background: linear-gradient(135deg, #0284c7, #2563eb);',
      '  transform: translateY(-1px);',
      '  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);',
      '}',
      '.pp-btn-secondary {',
      '  background: #334155;',
      '  color: #cbd5e1;',
      '}',
      '.pp-btn-secondary:hover:not(:disabled) {',
      '  background: #475569;',
      '}',
      '.pp-btn-ghost {',
      '  background: transparent;',
      '  color: #94a3b8;',
      '  border: 1px solid #334155;',
      '}',
      '.pp-btn-ghost:hover:not(:disabled) {',
      '  background: #1e293b;',
      '  color: #e2e8f0;',
      '}',

      /* Response area */
      '.pp-response-area {',
      '  background: #0f172a;',
      '  border-top: 1px solid #1e293b;',
      '  padding: 20px 24px;',
      '  display: none;',
      '}',
      '.pp-response-area.visible { display: block; }',
      '.pp-response-label {',
      '  font-size: 12px;',
      '  font-weight: 600;',
      '  color: #22c55e;',
      '  margin-bottom: 12px;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '}',
      '.pp-response-content {',
      '  font-family: "SF Mono", "Fira Code", "Cascadia Code", "Courier New", monospace;',
      '  font-size: 13px;',
      '  line-height: 1.7;',
      '  color: #cbd5e1;',
      '  white-space: pre-wrap;',
      '  word-wrap: break-word;',
      '  max-height: 500px;',
      '  overflow-y: auto;',
      '  padding-right: 8px;',
      '}',
      '.pp-response-content::-webkit-scrollbar { width: 4px; }',
      '.pp-response-content::-webkit-scrollbar-track { background: transparent; }',
      '.pp-response-content::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }',
      '.pp-cursor {',
      '  display: inline-block;',
      '  width: 8px;',
      '  height: 16px;',
      '  background: #0ea5e9;',
      '  animation: pp-blink 0.8s step-end infinite;',
      '  vertical-align: text-bottom;',
      '  margin-left: 1px;',
      '}',
      '@keyframes pp-blink {',
      '  50% { opacity: 0; }',
      '}',

      /* Feedback panel */
      '.pp-feedback {',
      '  background: #f8fafc;',
      '  padding: 24px;',
      '  display: none;',
      '}',
      '.pp-feedback.visible { display: block; }',

      /* Star rating */
      '.pp-stars-row {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 12px;',
      '  margin-bottom: 20px;',
      '}',
      '.pp-stars {',
      '  display: flex;',
      '  gap: 3px;',
      '}',
      '.pp-star {',
      '  font-size: 22px;',
      '  line-height: 1;',
      '  color: #e2e8f0;',
      '  transition: color 0.3s;',
      '}',
      '.pp-star.filled { color: #eab308; }',
      '.pp-star-label {',
      '  font-size: 14px;',
      '  font-weight: 700;',
      '  color: #0f172a;',
      '}',

      /* Keyword matches */
      '.pp-keywords-section {',
      '  margin-bottom: 20px;',
      '}',
      '.pp-keywords-title {',
      '  font-size: 12px;',
      '  font-weight: 700;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.5px;',
      '  color: #64748b;',
      '  margin-bottom: 10px;',
      '}',
      '.pp-keyword-list {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  gap: 6px;',
      '}',
      '.pp-keyword-tag {',
      '  font-size: 12px;',
      '  font-weight: 500;',
      '  padding: 4px 10px;',
      '  border-radius: 6px;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 4px;',
      '}',
      '.pp-keyword-hit {',
      '  background: #dcfce7;',
      '  color: #166534;',
      '  border: 1px solid #bbf7d0;',
      '}',
      '.pp-keyword-miss {',
      '  background: #fef3c7;',
      '  color: #92400e;',
      '  border: 1px solid #fde68a;',
      '}',

      /* Tips section */
      '.pp-tips-section {',
      '  margin-bottom: 20px;',
      '}',
      '.pp-tips-title {',
      '  font-size: 12px;',
      '  font-weight: 700;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.5px;',
      '  color: #64748b;',
      '  margin-bottom: 10px;',
      '}',
      '.pp-tip-item {',
      '  font-size: 13px;',
      '  line-height: 1.6;',
      '  color: #334155;',
      '  padding: 6px 0;',
      '  padding-left: 20px;',
      '  position: relative;',
      '}',
      '.pp-tip-bullet {',
      '  position: absolute;',
      '  left: 0;',
      '  color: #0ea5e9;',
      '  font-weight: 700;',
      '}',

      /* Expert prompt panel */
      '.pp-expert {',
      '  background: #f0fdf4;',
      '  border: 1px solid #bbf7d0;',
      '  border-radius: 8px;',
      '  padding: 16px;',
      '  margin-top: 16px;',
      '  display: none;',
      '}',
      '.pp-expert.visible { display: block; }',
      '.pp-expert-title {',
      '  font-size: 12px;',
      '  font-weight: 700;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.5px;',
      '  color: #166534;',
      '  margin-bottom: 10px;',
      '}',
      '.pp-expert-text {',
      '  font-family: "SF Mono", "Fira Code", "Cascadia Code", "Courier New", monospace;',
      '  font-size: 12px;',
      '  line-height: 1.7;',
      '  color: #1e293b;',
      '  white-space: pre-wrap;',
      '  word-wrap: break-word;',
      '  background: #ffffff;',
      '  padding: 14px;',
      '  border-radius: 6px;',
      '  border: 1px solid #dcfce7;',
      '  max-height: 400px;',
      '  overflow-y: auto;',
      '}',

      /* Feedback action buttons */
      '.pp-feedback-actions {',
      '  display: flex;',
      '  gap: 10px;',
      '  margin-top: 20px;',
      '  padding-top: 16px;',
      '  border-top: 1px solid #e2e8f0;',
      '  flex-wrap: wrap;',
      '}',
      '.pp-btn-feedback {',
      '  padding: 10px 20px;',
      '  border-radius: 8px;',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;',
      '  border: none;',
      '  cursor: pointer;',
      '  transition: all 0.2s;',
      '}',
      '.pp-btn-try-again {',
      '  background: #1e40af;',
      '  color: #ffffff;',
      '}',
      '.pp-btn-try-again:hover {',
      '  background: #1d4ed8;',
      '  transform: translateY(-1px);',
      '}',
      '.pp-btn-show-expert {',
      '  background: #f1f5f9;',
      '  color: #334155;',
      '  border: 1px solid #e2e8f0;',
      '}',
      '.pp-btn-show-expert:hover {',
      '  background: #e2e8f0;',
      '}',

      /* Loading spinner */
      '.pp-loading {',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 10px;',
      '  color: #94a3b8;',
      '  font-size: 13px;',
      '  font-weight: 500;',
      '  padding: 8px 0;',
      '}',
      '.pp-spinner {',
      '  width: 16px; height: 16px;',
      '  border: 2px solid #334155;',
      '  border-top-color: #0ea5e9;',
      '  border-radius: 50%;',
      '  animation: pp-spin 0.8s linear infinite;',
      '}',
      '@keyframes pp-spin {',
      '  to { transform: rotate(360deg); }',
      '}',

      /* Mobile responsive */
      '@media (max-width: 640px) {',
      '  .pp-header { padding: 12px 16px; flex-direction: column; align-items: flex-start; gap: 8px; }',
      '  .pp-context, .pp-task, .pp-input-area, .pp-response-area, .pp-feedback { padding: 16px; }',
      '  .pp-textarea { min-height: 100px; font-size: 12px; }',
      '  .pp-btn-row, .pp-feedback-actions { flex-direction: column; }',
      '  .pp-btn, .pp-btn-feedback { width: 100%; justify-content: center; }',
      '  .pp-response-content { max-height: 350px; font-size: 12px; }',
      '  .pp-expert-text { font-size: 11px; max-height: 300px; }',
      '  .pp-keyword-list { gap: 4px; }',
      '  .pp-keyword-tag { font-size: 11px; padding: 3px 8px; }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }

  // ============================================================
  // SCORING ENGINE
  // ============================================================

  function evaluatePrompt(userPrompt, scenario) {
    var lowerPrompt = userPrompt.toLowerCase();
    var totalWeight = 0;
    var earnedWeight = 0;
    var hits = [];
    var misses = [];

    scenario.keywords.forEach(function (kw) {
      totalWeight += kw.weight;
      var regex = new RegExp(kw.keyword, 'i');
      if (regex.test(lowerPrompt)) {
        earnedWeight += kw.weight;
        hits.push(kw);
      } else {
        misses.push(kw);
      }
    });

    var pct = totalWeight > 0 ? (earnedWeight / totalWeight) : 0;
    var stars;
    if (pct < 0.2) stars = 1;
    else if (pct < 0.4) stars = 2;
    else if (pct < 0.6) stars = 3;
    else if (pct < 0.8) stars = 4;
    else stars = 5;

    return {
      percentage: pct,
      stars: stars,
      hits: hits,
      misses: misses
    };
  }

  function getStarLabel(stars) {
    var labels = {
      1: 'Needs Work',
      2: 'Getting There',
      3: 'Good Effort',
      4: 'Strong Prompt',
      5: 'Excellent!'
    };
    return labels[stars] || '';
  }

  // ============================================================
  // TYPEWRITER EFFECT
  // ============================================================

  function typeResponse(container, text, callback) {
    var index = 0;
    var cursor = el('span', { className: 'pp-cursor' });
    container.textContent = '';
    container.appendChild(cursor);

    // Variable speed: faster base, slight pauses on newlines and punctuation
    var baseDelay = 8;

    function type() {
      if (index >= text.length) {
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
        if (callback) callback();
        return;
      }

      var char = text[index];
      cursor.parentNode.insertBefore(document.createTextNode(char), cursor);
      index++;

      // Scroll to bottom of response area
      var parent = container.parentNode;
      if (parent) parent.scrollTop = parent.scrollHeight;

      var delay = baseDelay;
      if (char === '\n') delay = 40;
      else if (char === '.' || char === ':' || char === ';') delay = 30;
      else if (char === ',') delay = 15;
      // Type faster in bursts for long texts
      else if (text.length > 500 && index > 100) delay = 4;

      setTimeout(type, delay);
    }

    type();
  }

  // ============================================================
  // PLAYGROUND BUILDER
  // ============================================================

  function buildPlayground(placeholder, scenarioId) {
    var scenario = SCENARIOS[scenarioId];
    if (!scenario) {
      console.warn('[PromptPlayground] Unknown scenario: ' + scenarioId);
      return;
    }

    // State
    var state = {
      submitted: false,
      typing: false,
      expertVisible: false
    };

    // === Header ===
    var dots = el('div', { className: 'pp-dots' }, [
      el('span', { className: 'pp-dot pp-dot-red' }),
      el('span', { className: 'pp-dot pp-dot-yellow' }),
      el('span', { className: 'pp-dot pp-dot-green' })
    ]);

    var titleText = el('span', { className: 'pp-title', textContent: scenario.title });
    var headerLeft = el('div', { className: 'pp-header-left' }, [dots, titleText]);

    var badgeClass = 'pp-badge pp-badge-' + scenario.difficulty;
    var badge = el('span', { className: badgeClass, textContent: scenario.difficulty });

    var header = el('div', { className: 'pp-header' }, [headerLeft, badge]);

    // === Context ===
    var contextLabel = el('div', { className: 'pp-context-label', textContent: 'Scenario' });
    var contextText = el('div', { className: 'pp-context-text', textContent: scenario.context });
    var contextArea = el('div', { className: 'pp-context' }, [contextLabel, contextText]);

    // === Task ===
    var taskLabel = el('div', { className: 'pp-task-label', textContent: 'Your Task' });
    var taskText = el('div', { className: 'pp-task-text', textContent: scenario.task });
    var taskArea = el('div', { className: 'pp-task' }, [taskLabel, taskText]);

    // === Input area ===
    var inputCaret = el('span', { className: 'pp-input-caret', textContent: '>' });
    var inputLabel = el('div', { className: 'pp-input-label' }, [inputCaret, 'Write your prompt below']);

    var textarea = el('textarea', {
      className: 'pp-textarea',
      'placeholder': 'Type your prompt here...',
      'aria-label': 'Prompt input for ' + scenario.title,
      'rows': '6'
    });

    var sendBtn = el('button', {
      className: 'pp-btn pp-btn-primary',
      textContent: 'Send to Claude',
      'aria-label': 'Submit prompt for evaluation'
    });

    var clearBtn = el('button', {
      className: 'pp-btn pp-btn-ghost',
      textContent: 'Clear',
      'aria-label': 'Clear prompt text'
    });

    var charCount = el('span', {
      className: 'pp-input-label',
      textContent: '0 characters'
    });
    charCount.style.marginLeft = 'auto';
    charCount.style.marginBottom = '0';

    var btnRow = el('div', { className: 'pp-btn-row' }, [sendBtn, clearBtn, charCount]);
    var inputArea = el('div', { className: 'pp-input-area' }, [inputLabel, textarea, btnRow]);

    // === Response area ===
    var responseLabel = el('div', { className: 'pp-response-label' }, [
      el('span', { textContent: 'Claude' }),
      el('span', { textContent: ' — ', className: '' }),
      el('span', { textContent: 'response' })
    ]);
    responseLabel.style.fontFamily = '"SF Mono", "Fira Code", "Cascadia Code", monospace';

    var responseContent = el('div', { className: 'pp-response-content' });
    var responseArea = el('div', { className: 'pp-response-area' }, [responseLabel, responseContent]);

    // === Feedback panel ===
    var starsContainer = el('div', { className: 'pp-stars' });
    var starLabel = el('span', { className: 'pp-star-label' });
    var starsRow = el('div', { className: 'pp-stars-row' }, [starsContainer, starLabel]);

    var keywordsTitle = el('div', { className: 'pp-keywords-title', textContent: 'Prompt Elements Detected' });
    var keywordList = el('div', { className: 'pp-keyword-list' });
    var keywordsSection = el('div', { className: 'pp-keywords-section' }, [keywordsTitle, keywordList]);

    var tipsTitle = el('div', { className: 'pp-tips-title', textContent: 'Tips for Improvement' });
    var tipsList = el('div');
    var tipsSection = el('div', { className: 'pp-tips-section' }, [tipsTitle, tipsList]);

    var expertTitle = el('div', { className: 'pp-expert-title', textContent: 'Expert Prompt Example' });
    var expertText = el('div', { className: 'pp-expert-text', textContent: scenario.expertPrompt });
    var expertPanel = el('div', { className: 'pp-expert' }, [expertTitle, expertText]);

    var tryAgainBtn = el('button', {
      className: 'pp-btn-feedback pp-btn-try-again',
      textContent: 'Try Again'
    });
    var showExpertBtn = el('button', {
      className: 'pp-btn-feedback pp-btn-show-expert',
      textContent: 'Show Expert Prompt'
    });
    var feedbackActions = el('div', { className: 'pp-feedback-actions' }, [tryAgainBtn, showExpertBtn, expertPanel]);

    var feedbackPanel = el('div', { className: 'pp-feedback' }, [
      starsRow, keywordsSection, tipsSection, feedbackActions
    ]);

    // === Assemble container ===
    var container = el('div', { className: 'pp-container' }, [
      header, contextArea, taskArea, inputArea, responseArea, feedbackPanel
    ]);

    // === Character count ===
    textarea.addEventListener('input', function () {
      var len = textarea.value.length;
      charCount.textContent = len + ' character' + (len !== 1 ? 's' : '');
    });

    // === Clear button ===
    clearBtn.addEventListener('click', function () {
      if (state.typing) return;
      textarea.value = '';
      charCount.textContent = '0 characters';
      textarea.focus();
    });

    // === Send button ===
    sendBtn.addEventListener('click', function () {
      var prompt = textarea.value.trim();
      if (!prompt) {
        textarea.focus();
        return;
      }
      if (state.typing) return;

      state.submitted = true;
      state.typing = true;

      // Disable controls
      textarea.disabled = true;
      sendBtn.disabled = true;
      clearBtn.disabled = true;

      // Show response area with loading state
      responseArea.classList.add('visible');
      feedbackPanel.classList.remove('visible');
      responseContent.textContent = '';

      var loadingSpinner = el('div', { className: 'pp-loading' }, [
        el('div', { className: 'pp-spinner' }),
        el('span', { textContent: 'Evaluating prompt and generating response...' })
      ]);
      responseContent.appendChild(loadingSpinner);

      // Evaluate
      var result = evaluatePrompt(prompt, scenario);
      var responseText = result.stars >= 3 ? scenario.goodResponse : scenario.poorResponse;

      // Simulate thinking delay (700ms - 1500ms based on response length)
      var thinkDelay = Math.min(700 + responseText.length * 0.5, 1500);

      setTimeout(function () {
        responseContent.textContent = '';

        typeResponse(responseContent, responseText, function () {
          state.typing = false;

          // Build feedback
          buildFeedback(result);
          feedbackPanel.classList.add('visible');

          // Scroll feedback into view
          feedbackPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }, thinkDelay);
    });

    // === Build feedback UI ===
    function buildFeedback(result) {
      // Stars
      starsContainer.textContent = '';
      for (var i = 1; i <= 5; i++) {
        var star = el('span', {
          className: 'pp-star' + (i <= result.stars ? ' filled' : ''),
          textContent: '\u2605'
        });
        starsContainer.appendChild(star);
      }
      starLabel.textContent = result.stars + '/5 — ' + getStarLabel(result.stars);

      // Keywords
      keywordList.textContent = '';
      result.hits.forEach(function (kw) {
        var tag = el('span', { className: 'pp-keyword-tag pp-keyword-hit' }, [
          el('span', { textContent: '\u2713' }),
          el('span', { textContent: ' ' + kw.feedback })
        ]);
        keywordList.appendChild(tag);
      });
      result.misses.forEach(function (kw) {
        var tag = el('span', { className: 'pp-keyword-tag pp-keyword-miss' }, [
          el('span', { textContent: '\u25cb' }),
          el('span', { textContent: ' ' + kw.feedback })
        ]);
        keywordList.appendChild(tag);
      });

      // Tips
      tipsList.textContent = '';
      scenario.tips.forEach(function (tip) {
        var bullet = el('span', { className: 'pp-tip-bullet', textContent: '\u2022' });
        var item = el('div', { className: 'pp-tip-item' }, [bullet, tip]);
        tipsList.appendChild(item);
      });
    }

    // === Try Again ===
    tryAgainBtn.addEventListener('click', function () {
      state.submitted = false;
      state.expertVisible = false;

      textarea.value = '';
      textarea.disabled = false;
      sendBtn.disabled = false;
      clearBtn.disabled = false;
      charCount.textContent = '0 characters';

      responseArea.classList.remove('visible');
      feedbackPanel.classList.remove('visible');
      expertPanel.classList.remove('visible');
      showExpertBtn.textContent = 'Show Expert Prompt';

      textarea.focus();
      // Scroll input into view
      inputArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // === Show Expert Prompt ===
    showExpertBtn.addEventListener('click', function () {
      state.expertVisible = !state.expertVisible;
      if (state.expertVisible) {
        expertPanel.classList.add('visible');
        showExpertBtn.textContent = 'Hide Expert Prompt';
      } else {
        expertPanel.classList.remove('visible');
        showExpertBtn.textContent = 'Show Expert Prompt';
      }
    });

    // === Keyboard shortcut: Ctrl/Cmd + Enter to submit ===
    textarea.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        sendBtn.click();
      }
    });

    // === Replace placeholder ===
    placeholder.textContent = '';
    placeholder.appendChild(container);
  }

  // ============================================================
  // INITIALISE
  // ============================================================

  function init() {
    injectStyles();

    var placeholders = document.querySelectorAll('.prompt-playground[data-scenario]');
    if (placeholders.length === 0) return;

    placeholders.forEach(function (placeholder) {
      var scenarioId = placeholder.getAttribute('data-scenario');
      buildPlayground(placeholder, scenarioId);
    });

    console.log('[PromptPlayground] Initialised ' + placeholders.length + ' playground(s).');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  window.promptPlayground = {
    scenarios: SCENARIOS,
    reinit: init
  };

})();
