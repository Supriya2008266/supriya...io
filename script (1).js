/* ResolveAI — frontend MVP demo.
 * All AI output is SIMULATED by the mock AIService below. No network calls are made.
 * To connect a real backend later, replace AIService.analyze() with an API call that
 * returns the same shape (see classify()). State lives in memory and resets on refresh.
 */
(function () {
  'use strict';

  /* ======================================================================
   * Helpers
   * ==================================================================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const MIN = 60000;
  const NOW = Date.now();
  const initials = (name) => name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const firstName = (name) => name.split(/\s+/)[0];
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function relTime(ts) {
    const m = Math.max(0, Math.round((Date.now() - ts) / MIN));
    if (m < 1) return 'just now';
    if (m < 60) return m + 'm ago';
    const h = Math.round(m / 60);
    if (h < 24) return h + 'h ago';
    return Math.round(h / 24) + 'd ago';
  }

  /* Lucide-style inline icons (no external dependency) */
  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    ticket: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4"/><path d="M21 5h-4"/>',
    chart: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
    settings: '<line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    menu: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    chevL: '<polyline points="15 18 9 12 15 6"/>',
    chevR: '<polyline points="9 18 15 12 9 6"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>',
    plus2: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>'
  };
  const icon = (name, size = 18, cls = '') =>
    `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /* ======================================================================
   * Constants & knowledge base used by the MOCK AI service
   * ==================================================================== */
  const STAGES = ['New', 'Assigned', 'In Progress', 'Resolved', 'Customer Confirmed', 'Closed'];
  const STATUS_STAGE = { 'New': 0, 'Assigned': 1, 'In Progress': 2, 'Awaiting Customer': 2, 'Resolved': 3, 'Customer Confirmed': 4, 'Closed': 5 };
  const RESOLVED_STATUSES = ['Resolved', 'Customer Confirmed', 'Closed'];
  const FILTERS = ['All', 'New', 'High Priority', 'Assigned', 'In Progress', 'Awaiting Customer', 'Resolved', 'Customer Confirmed', 'Closed'];
  const LANGS = { en: 'English', ta: 'Tamil', tg: 'Tanglish' };
  const PAGE_SIZE = 6;
  const ANALYSIS_STEPS = ['Classifying priority', 'Assigning responsible team', 'Checking seller / customer fault', 'Recommending resolution steps', 'Drafting first reply'];

  const KB = {
    wrong: {
      priority: 'High', priorityReason: 'Wrong product received. Customer expects replacement.', team: 'Returns & Refunds',
      fault: 'seller', confidence: 94,
      faultReason: "Order records indicate that the seller shipped a different SKU from the customer's purchased item.",
      interpretation: 'Customer received the wrong product and is requesting a replacement.',
      rewardReason: 'Seller shipped wrong product.', rewardAmount: 150,
      steps: ["Verify the customer's order SKU.", 'Compare shipped SKU with ordered SKU.', 'Approve replacement.', 'Arrange reverse pickup.', 'Ask customer to confirm after receiving the replacement.'],
      reply: (n) => ({
        en: `Hi ${n}, we're sorry the wrong product reached you. We are initiating a replacement and will arrange a free pickup of the item you received. Please confirm once the replacement arrives.`,
        ta: `வணக்கம் ${n}, தவறான பொருள் வந்ததற்கு வருந்துகிறோம். மாற்றுப் பொருளை அனுப்ப ஏற்பாடு செய்கிறோம். புதிய பொருள் கிடைத்ததும் தயவுசெய்து உறுதிப்படுத்துங்கள்.`,
        tg: `Hi ${n}, unga order-la wrong product receive aagirukku. Sorry for the inconvenience. Nanga replacement process-a initiate panrom. Replacement receive pannadhum please confirm pannunga.`
      })
    },
    damaged: {
      priority: 'High', priorityReason: 'Damaged item delivered. Customer expects a replacement or refund.', team: 'Returns & Refunds',
      fault: 'seller', confidence: 90,
      faultReason: 'Photos and the courier report show packaging damage consistent with poor packing at dispatch.',
      interpretation: 'Customer received a damaged product and wants a replacement or refund.',
      rewardReason: 'Seller shipped a damaged product.', rewardAmount: 200,
      steps: ['Review the damage photos shared by the customer.', 'Check the courier damage report.', 'Approve replacement or refund.', 'Arrange reverse pickup.', 'Ask customer to confirm once resolved.'],
      reply: (n) => ({
        en: `Hi ${n}, we're sorry your product arrived damaged. Please share a photo of the item and packaging and we'll arrange a replacement or refund right away.`,
        ta: `வணக்கம் ${n}, பொருள் சேதமடைந்து வந்ததற்கு வருந்துகிறோம். பொருள் மற்றும் பேக்கிங் புகைப்படத்தை பகிருங்கள்; உடனடியாக மாற்றுப் பொருள் அல்லது பணத்தைத் திருப்பி அளிக்க ஏற்பாடு செய்கிறோம்.`,
        tg: `Hi ${n}, product damage-a vandhadhuku sorry. Product-um packing-um photo share pannunga. Udane replacement illa refund arrange panrom.`
      })
    },
    late: {
      priority: 'Medium', priorityReason: 'Order delayed beyond the promised date; customer is waiting.', team: 'Delivery Team',
      fault: 'seller', confidence: 86,
      faultReason: 'Courier tracking shows the parcel was handed over 3 days after the promised dispatch date.',
      interpretation: 'Customer has not received the order and wants an update.',
      rewardReason: 'Seller delayed dispatch beyond the promised date.', rewardAmount: 100,
      steps: ['Check courier tracking and last scan.', 'Contact the courier partner.', 'Share an updated delivery date with the customer.', 'Expedite or re-ship if the parcel is lost.', 'Ask customer to confirm receipt.'],
      reply: (n) => ({
        en: `Hi ${n}, sorry for the delay with your order. We've checked with the courier and will share an updated delivery date shortly.`,
        ta: `வணக்கம் ${n}, ஆர்டர் தாமதமானதற்கு வருந்துகிறோம். கூரியரிடம் விசாரித்து புதிய டெலிவரி தேதியை விரைவில் தெரிவிக்கிறோம்.`,
        tg: `Hi ${n}, order late aagirukku, sorry. Courier-kitta check panni updated delivery date seekiram sollrom.`
      })
    },
    payment: {
      priority: 'High', priorityReason: 'Payment problem: money may be debited without an order confirmation.', team: 'Billing Team',
      fault: 'unclear', confidence: 63,
      faultReason: 'Gateway status is pending, so it is unclear whether the failure is on the bank side or the seller checkout. Needs manual review.',
      interpretation: 'Customer says the payment was deducted but the order was not confirmed.',
      rewardReason: 'Payment issue caused by seller checkout.', rewardAmount: 100,
      steps: ['Check payment gateway logs for the transaction.', 'Verify the debit with the bank reference.', 'If debited without an order, start the refund.', 'Tell the customer the 5–7 working day reversal window.', 'Ask customer to confirm once refunded.'],
      reply: (n) => ({
        en: `Hi ${n}, we're looking into your payment. If the amount was debited, it will be reversed to your account within 5-7 working days. Please share the transaction ID.`,
        ta: `வணக்கம் ${n}, உங்கள் பணம் செலுத்துதலை சரிபார்க்கிறோம். தொகை பிடித்தம் செய்யப்பட்டிருந்தால் 5-7 வேலை நாட்களில் திரும்ப வரும். பரிவர்த்தனை எண்ணை பகிருங்கள்.`,
        tg: `Hi ${n}, unga payment-a check panrom. Amount debit aagirundha 5-7 working days-la refund aagidum. Transaction ID share pannunga.`
      })
    },
    refund: {
      priority: 'Medium', priorityReason: 'Refund request. Return eligibility needs to be verified.', team: 'Returns & Refunds',
      fault: 'unclear', confidence: 58,
      faultReason: 'Return window and product condition are not verified yet. Needs manual review.',
      interpretation: 'Customer is asking for a refund.',
      rewardReason: 'Seller was responsible for the refund request.', rewardAmount: 100,
      steps: ['Check the return window for the order.', 'Verify the product condition.', 'Approve or decline per the return policy.', 'Process the refund to the original payment method.', 'Ask customer to confirm once refunded.'],
      reply: (n) => ({
        en: `Hi ${n}, we've received your refund request. We'll check the return eligibility and update you within 24 hours.`,
        ta: `வணக்கம் ${n}, உங்கள் பணத்தைத் திரும்பப் பெறும் கோரிக்கை கிடைத்தது. தகுதியை சரிபார்த்து 24 மணி நேரத்தில் தெரிவிக்கிறோம்.`,
        tg: `Hi ${n}, unga refund request vandhuduchu. Eligibility check panni 24 hours-la update panrom.`
      })
    },
    address: {
      priority: 'Low', priorityReason: 'Simple how-to request with no delivery impact.', team: 'Support Team',
      fault: 'customer', confidence: 87,
      faultReason: 'The address change was requested after the dispatch cut-off; customers can edit it from the order page before shipping.',
      interpretation: 'Customer wants to change the delivery address.',
      rewardReason: 'Not applicable.', rewardAmount: 0,
      steps: ['Check whether the order has shipped.', 'If not shipped, guide the customer to the order page.', 'If shipped, request a courier redirect.', 'Confirm the new address with the customer.'],
      reply: (n) => ({
        en: `Hi ${n}, you can update the delivery address from the order page until the order is shipped. If it has already shipped, reply here and we'll try to redirect it.`,
        ta: `வணக்கம் ${n}, ஆர்டர் அனுப்பப்படும் வரை ஆர்டர் பக்கத்தில் முகவரியை மாற்றலாம். ஏற்கெனவே அனுப்பியிருந்தால் பதிலளியுங்கள், மாற்ற முயற்சிக்கிறோம்.`,
        tg: `Hi ${n}, order ship aagura varaikum order page-la address change pannalam. Already ship aagirundha reply pannunga, redirect panna try panrom.`
      })
    },
    security: {
      priority: 'Critical', priorityReason: 'Possible account takeover. Needs immediate security action.', team: 'Technical Support',
      fault: 'unclear', confidence: 55,
      faultReason: 'Login activity must be reviewed before fault can be assigned. Needs manual review.',
      interpretation: 'Customer reports unauthorized access to their account.',
      rewardReason: 'Not applicable.', rewardAmount: 0,
      steps: ['Lock the account and revoke active sessions.', 'Review recent login and order activity.', 'Send a secure password reset link.', 'Verify the customer identity.', 'Restore access and ask the customer to confirm.'],
      reply: (n) => ({
        en: `Hi ${n}, we're treating this as urgent. We've temporarily locked your account. Please reset your password using the link we sent and tell us about any suspicious activity.`,
        ta: `வணக்கம் ${n}, இதை அவசரமாக கருதுகிறோம். உங்கள் கணக்கை தற்காலிகமாக பூட்டியுள்ளோம்; அனுப்பிய இணைப்பில் கடவுச்சொல்லை மாற்றி சந்தேகத்திற்குரிய செயல்பாடுகளை தெரிவியுங்கள்.`,
        tg: `Hi ${n}, idha urgent-a eduthukrom. Unga account temporary-a lock panniruken. Anuppuna link-la password reset pannitu suspicious activity irundha sollunga.`
      })
    },
    misunderstanding: {
      priority: 'Low', priorityReason: 'Question caused by a pricing misunderstanding; no delivery issue.', team: 'Support Team',
      fault: 'customer', confidence: 90,
      faultReason: 'The product page states shipping is free above ₹499. This order was ₹399, so the shipping charge was correct.',
      interpretation: 'Customer expected free shipping on an order below the free-shipping threshold.',
      rewardReason: 'Not applicable.', rewardAmount: 0,
      steps: ['Check the order value against the free-shipping rule.', 'Explain the shipping policy politely.', 'Offer a tip to reach the free-shipping threshold next time.', 'Close the ticket once the customer acknowledges.'],
      reply: (n) => ({
        en: `Hi ${n}, thanks for reaching out. Shipping is free on orders above ₹499. This order was ₹399, so a ₹50 shipping charge applied. Happy to help with anything else.`,
        ta: `வணக்கம் ${n}, ₹499-க்கு மேல் ஆர்டர்களுக்கு இலவச ஷிப்பிங் உண்டு; உங்கள் ஆர்டர் ₹399 என்பதால் ₹50 ஷிப்பிங் கட்டணம் பொருந்தியது. வேறு உதவி தேவையெனில் சொல்லுங்கள்.`,
        tg: `Hi ${n}, ₹499-ku mela order-ku free shipping. Unga order ₹399 nala ₹50 shipping charge apply aagirukku. Vera help venumna sollunga.`
      })
    },
    general: {
      priority: 'Medium', priorityReason: 'General query; no urgency signals detected.', team: 'Support Team',
      fault: 'unclear', confidence: 40,
      faultReason: 'Not enough information to decide who is responsible. Needs manual review.',
      interpretation: 'Customer has a general question that needs a human look.',
      rewardReason: 'Not applicable.', rewardAmount: 0,
      steps: ['Read the full conversation history.', 'Ask the customer for order details.', 'Route to the right team if needed.', 'Reply and confirm resolution.'],
      reply: (n) => ({
        en: `Hi ${n}, thanks for contacting us. Could you share your order number so we can look into this right away?`,
        ta: `வணக்கம் ${n}, எங்களைத் தொடர்பு கொண்டதற்கு நன்றி. உங்கள் ஆர்டர் எண்ணை பகிர்ந்தால் உடனே பார்க்கிறோம்.`,
        tg: `Hi ${n}, contact pannadhuku thanks. Unga order number share pannunga, udane check panrom.`
      })
    }
  };

  /** Keyword-based stand-in for an AI classifier. Returns a KB key. */
  function pickCategory(message) {
    const m = message.toLowerCase();
    const has = (...w) => w.some((x) => m.includes(x));
    if (has('hack', 'account takeover', 'unauthorized', 'unauthorised', 'not me', 'password changed')) return 'security';
    if (has('wrong product', 'wrong item', 'wrong ah', 'badhila', 'different product', 'instead of')) return 'wrong';
    if (has('damage', 'broken', 'cracked', 'udanju', 'torn')) return 'damaged';
    if (has('payment', 'deduct', 'debited', 'cut aagi', 'transaction', 'upi', 'money')) return 'payment';
    if (has('refund')) return 'refund';
    if (has('not delivered', 'late', 'delay', 'varala', 'vandhu sera', 'not received', 'still waiting')) return 'late';
    if (has('address')) return 'address';
    if (has('free shipping', 'shipping charge', 'thought it was free')) return 'misunderstanding';
    return 'general';
  }

  function detectLanguage(message) {
    if (/[஀-௿]/.test(message)) return 'Tamil';
    const tokens = message.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    const cues = ['bro', 'pannunga', 'pannu', 'panna', 'vandhurukku', 'vandhuduchu', 'irukku', 'aagiduchu', 'aagala', 'aagirukku', 'illa', 'naan', 'unga', 'venum', 'seekiram', 'sollunga', 'badhila', 'kitta', 'enakku', 'ennoda', 'varala', 'vandhu'];
    const hits = tokens.filter((t) => cues.includes(t)).length;
    return hits >= 2 ? 'Tanglish' : 'English';
  }
  const langKey = (language) => (language === 'Tamil' ? 'ta' : language === 'Tanglish' ? 'tg' : 'en');

  /** Pure function: builds the simulated analysis for a ticket. */
  function classify(ticket) {
    const kb = KB[pickCategory(ticket.message)];
    return {
      priority: kb.priority, priorityReason: kb.priorityReason, team: kb.team,
      fault: kb.fault, confidence: kb.confidence, faultReason: kb.faultReason,
      interpretation: kb.interpretation, steps: kb.steps.slice(),
      replies: kb.reply(firstName(ticket.customer)),
      rewardReason: kb.rewardReason, rewardAmount: kb.rewardAmount
    };
  }

  /** MOCK AI SERVICE — swap this for a real API client later. */
  const AIService = {
    analyze(ticket, onStep) {
      return new Promise((resolve) => {
        let step = 0;
        onStep(step);
        const tick = () => {
          step += 1;
          onStep(step);
          if (step >= ANALYSIS_STEPS.length) resolve(classify(ticket));
          else setTimeout(tick, 450);
        };
        setTimeout(tick, 450);
      });
    }
  };

  /* ======================================================================
   * Mock data
   * ==================================================================== */
  function applyAnalysis(t, a) {
    t.priority = a.priority; t.priorityReason = a.priorityReason;
    if (!t.team) t.team = a.team;
    t.fault = a.fault; t.confidence = a.confidence; t.faultReason = a.faultReason;
    t.interpretation = a.interpretation; t.steps = a.steps.slice();
    t.replies = Object.assign({}, a.replies);
    t.rewardReason = a.rewardReason; t.rewardAmount = a.rewardAmount;
    t.analyzed = true;
  }

  function seedTicket(o) {
    const t = Object.assign({
      id: '', customer: '', message: '', subject: '', language: 'English', status: 'New', team: '',
      repeat: 0, monthlyRewards: 0, createdMins: 60, updatedMins: 30,
      analyzed: false, priority: null, fault: 'pending', confidence: 0, steps: [], replies: {},
      stepsApplied: false, replySent: false, reward: { status: 'none' }, rewardAmount: 0, rewardReason: ''
    }, o.base);
    if (o.analyzed !== false) {
      const kbKey = o.kb;
      const a = Object.assign({}, KB[kbKey], { replies: KB[kbKey].reply(firstName(t.customer)), steps: KB[kbKey].steps });
      applyAnalysis(t, a);
      if (o.after) Object.assign(t, o.after);
      if (o.replies) Object.assign(t.replies, o.replies);
    }
    t.createdAt = NOW - t.createdMins * MIN;
    t.updatedAt = NOW - t.updatedMins * MIN;
    return t;
  }

  function buildTickets() {
    return [
      seedTicket({ analyzed: false, base: { id: 'TKT-1043', customer: 'Gowtham R', language: 'Tanglish', subject: 'Payment deducted but order not confirmed', message: 'Bro payment cut aagiduchu but order confirm aagala. Please check pannunga.', createdMins: 8, updatedMins: 8 } }),
      seedTicket({ kb: 'wrong', base: { id: 'TKT-1042', customer: 'Arun Kumar', language: 'Tanglish', subject: 'Order #7821 was delivered with the wrong product', message: 'Bro, naan order panna black shoes-ku badhila blue shoes vandhurukku. Please replace pannunga.', status: 'Customer Confirmed', stepsApplied: true, replySent: true, repeat: 1, monthlyRewards: 3, reward: { status: 'waiting' }, createdMins: 95, updatedMins: 14 } }),
      seedTicket({ kb: 'wrong', replies: { tg: 'Hi, unga issue understand pannitom. Wrong product receive aagirukku. Replacement process-a initiate panrom.' }, base: { id: 'TKT-1041', customer: 'Priya Raman', language: 'Tanglish', subject: 'Wrong product received', message: 'Bro product wrong ah vandhurukku. Replace pannunga.', status: 'Customer Confirmed', stepsApplied: true, replySent: true, repeat: 0, monthlyRewards: 1, reward: { status: 'waiting' }, createdMins: 190, updatedMins: 40 } }),
      seedTicket({ kb: 'address', base: { id: 'TKT-1040', customer: 'Rahul Menon', language: 'English', subject: 'How to change address', message: 'Hi, I entered an old address while ordering. How do I change the delivery address?', status: 'Resolved', stepsApplied: true, replySent: true, createdMins: 300, updatedMins: 120 } }),
      seedTicket({ kb: 'late', base: { id: 'TKT-1039', customer: 'Meena Sundar', language: 'English', subject: 'Order not delivered after 6 days', message: 'My order was promised in 3 days but it is not delivered even after 6 days. Please update.', status: 'In Progress', stepsApplied: true, replySent: true, monthlyRewards: 0, createdMins: 420, updatedMins: 90 } }),
      seedTicket({ kb: 'payment', base: { id: 'TKT-1038', customer: 'Vikram S', language: 'English', subject: 'Payment failed but money deducted', message: 'The payment failed on checkout but the money was debited from my account. No order confirmation received.', status: 'Awaiting Customer', replySent: true, createdMins: 560, updatedMins: 200 } }),
      seedTicket({ kb: 'security', base: { id: 'TKT-1037', customer: 'Divya Prakash', language: 'English', subject: 'Account hacked - unknown logins', message: 'I think my account was hacked. There are orders I did not place and I got a password changed email.', status: 'Assigned', createdMins: 640, updatedMins: 35 } }),
      seedTicket({ kb: 'refund', after: { fault: 'customer', confidence: 82, faultReason: 'Customer used the product for 10 days and the item is outside the no-questions-asked return window.' }, base: { id: 'TKT-1036', customer: 'Karthik Rajan', language: 'Tanglish', subject: 'Refund request after using the product', message: 'Bro refund venum, product use pannitten but enakku pudikala. Refund pannunga.', status: 'Awaiting Customer', replySent: true, createdMins: 900, updatedMins: 300 } }),
      seedTicket({ kb: 'damaged', base: { id: 'TKT-1035', customer: 'Sneha Iyer', language: 'English', subject: 'Product damaged in transit', message: 'The mug set arrived with two broken pieces. Photos attached. Please send a replacement.', status: 'Resolved', stepsApplied: true, replySent: true, monthlyRewards: 0, createdMins: 1300, updatedMins: 180 } }),
      seedTicket({ kb: 'misunderstanding', base: { id: 'TKT-1034', customer: 'Suresh Babu', language: 'English', subject: 'Thought shipping was free', message: 'Why was a shipping charge added? I thought it was free shipping on all orders.', status: 'Closed', stepsApplied: true, replySent: true, createdMins: 2100, updatedMins: 1500 } }),
      seedTicket({ kb: 'wrong', after: { confidence: 68, faultReason: 'SKU matches the order in 3 of the last 4 claims from this customer. Seller error is possible but a pattern of repeat claims was detected.' }, base: { id: 'TKT-1033', customer: 'Lakshmi Devi', language: 'English', subject: 'Fourth wrong-item claim this month', message: 'I received a different item instead of what I ordered. This is wrong product again, please replace.', status: 'Customer Confirmed', stepsApplied: true, replySent: true, repeat: 4, monthlyRewards: 4, createdMins: 2600, updatedMins: 600 } })
    ];
  }

  function buildTeams() {
    return [
      { name: 'Support Team', members: 4, baseResolved: 112, avg: '3.2 h' },
      { name: 'Returns & Refunds', members: 3, baseResolved: 76, avg: '8.6 h' },
      { name: 'Delivery Team', members: 3, baseResolved: 64, avg: '11.4 h' },
      { name: 'Technical Support', members: 2, baseResolved: 38, avg: '5.1 h' },
      { name: 'Billing Team', members: 2, baseResolved: 47, avg: '6.8 h' }
    ];
  }

  function buildRules() {
    return [
      { id: 1, text: 'If the customer mentions hacking or account takeover, mark the ticket as High Priority.', enabled: true, applied: 14 },
      { id: 2, text: 'If the customer reports a wrong product, assign it to Returns & Refunds.', enabled: true, applied: 41 },
      { id: 3, text: 'If the seller is responsible and the customer confirms resolution, make the ticket eligible for reward review.', enabled: true, applied: 23 },
      { id: 4, text: 'If the same customer submits 4 or more similar complaints in a month, flag for abuse review.', enabled: true, applied: 4 }
    ];
  }

  const state = {
    tickets: buildTickets(),
    teams: buildTeams(),
    rules: buildRules(),
    nextRuleId: 5,
    stats: { used: 3450, issued: 23, blocked: 4, issuedToday: 5 },
    rewardLog: [
      { ticket: 'TKT-1031', customer: 'Deepa K', amount: 150, status: 'Issued', ts: NOW - 26 * 60 * MIN },
      { ticket: 'TKT-1027', customer: 'Naveen P', amount: 200, status: 'Issued', ts: NOW - 52 * 60 * MIN },
      { ticket: 'TKT-1022', customer: 'Harini M', amount: 100, status: 'Rejected', ts: NOW - 70 * 60 * MIN },
      { ticket: 'TKT-1019', customer: 'Lakshmi Devi', amount: 150, status: 'Blocked', ts: NOW - 96 * 60 * MIN }
    ],
    activity: [
      { text: 'TKT-1042 customer confirmed the resolution', ts: NOW - 14 * MIN },
      { text: 'TKT-1041 is waiting for reward review', ts: NOW - 40 * MIN },
      { text: 'TKT-1037 flagged Critical and assigned to Technical Support', ts: NOW - 35 * MIN }
    ],
    settings: {
      business: { name: 'Kovai Footwear Co.', email: 'support@kovaifootwear.example', phone: '+91 98765 43210', owner: 'Anitha Rajan' },
      maxReward: 500, budget: 10000, repeatThreshold: 4, perCustomerMonthly: 5, ownerApproval: true,
      ai: { autoTriage: true, minConfidence: 80, showReasons: true },
      lang: { en: true, ta: true, tg: true, defaultReply: 'tg' },
      notify: { newTicket: true, highPriority: true, rewardPending: true, daily: false }
    }
  };

  /* ======================================================================
   * Domain logic
   * ==================================================================== */
  const findTicket = (id) => state.tickets.find((t) => t.id === id);
  const stageIndex = (t) => STATUS_STAGE[t.status];
  const isOpen = (t) => !RESOLVED_STATUSES.includes(t.status);

  function log(text) {
    state.activity.unshift({ text, ts: Date.now() });
    if (state.activity.length > 12) state.activity.pop();
  }

  /** Evaluates every condition of the Fault Check -> Reward Gate. */
  function gate(t) {
    const s = state.settings;
    const g = {
      seller: t.fault === 'seller',
      resolved: RESOLVED_STATUSES.includes(t.status),
      confirmed: t.status === 'Customer Confirmed' || t.status === 'Closed',
      abuseOk: t.repeat < s.repeatThreshold,
      monthlyOk: t.monthlyRewards < s.perCustomerMonthly,
      capOk: t.rewardAmount > 0 && t.rewardAmount <= s.maxReward,
      budgetOk: state.stats.used + t.rewardAmount <= s.budget,
      owner: t.reward.status === 'approved' || t.reward.status === 'issued' ? 'approved' : t.reward.status === 'rejected' ? 'rejected' : 'pending'
    };
    g.eligible = g.seller && g.resolved && g.confirmed && g.abuseOk && g.monthlyOk && g.capOk && g.budgetOk;
    return g;
  }

  function rewardState(t) {
    if (!t.analyzed) return { key: 'idle', label: 'AWAITING AI ANALYSIS', tone: 'muted', note: 'Run Analyze Ticket to check fault first.' };
    const r = t.reward.status;
    if (r === 'issued') return { key: 'issued', label: 'REWARD ISSUED', tone: 'success', note: `${inr(t.rewardAmount)} coupon sent to the customer.` };
    if (r === 'approved') return { key: 'approved', label: 'APPROVED', tone: 'success', note: 'Approved by the owner. Issue the coupon to finish.' };
    if (r === 'rejected') return { key: 'rejected', label: 'REJECTED BY OWNER', tone: 'danger', note: 'No reward will be issued for this ticket.' };
    const g = gate(t);
    if (!g.abuseOk) return { key: 'blocked', label: 'BLOCKED: ABUSE REVIEW', tone: 'danger', note: 'Repeat complaint threshold reached. Review manually.' };
    if (!g.seller) return { key: 'na', label: 'NOT ELIGIBLE', tone: 'muted', note: 'Rewards need a seller-fault result.' };
    if (!g.resolved) return { key: 'locked', label: 'LOCKED: NOT RESOLVED', tone: 'muted', note: 'Resolve the issue first.' };
    if (!g.confirmed) return { key: 'locked', label: 'LOCKED: AWAITING CUSTOMER', tone: 'muted', note: 'The customer must confirm the resolution.' };
    if (!g.monthlyOk) return { key: 'blocked', label: 'BLOCKED: MONTHLY LIMIT', tone: 'danger', note: 'Customer reached the monthly reward limit.' };
    if (!g.capOk || !g.budgetOk) return { key: 'blocked', label: 'BLOCKED: BUDGET / CAP', tone: 'danger', note: 'Reward exceeds the per-ticket cap or monthly budget.' };
    return { key: 'waiting', label: 'WAITING FOR OWNER APPROVAL', tone: 'warning', note: 'Rewards are never released automatically.' };
  }

  /** Which steps of the end-to-end workflow are complete for this ticket. */
  function workflowSteps(t) {
    const rs = rewardState(t).key;
    const g = gate(t);
    const steps = [
      { label: 'Customer Ticket', done: true },
      { label: 'AI Analysis', done: t.analyzed },
      { label: 'Fault Detection', done: t.analyzed },
      { label: 'Team Assignment', done: t.analyzed && !!t.team && stageIndex(t) >= 1 },
      { label: 'Suggested Resolution', done: t.analyzed && (t.stepsApplied || stageIndex(t) >= 3) },
      { label: 'Customer Confirmation', done: stageIndex(t) >= 4 },
      { label: 'Reward Eligibility', done: t.analyzed && g.eligible || ['approved', 'issued', 'rejected'].includes(t.reward.status), gate: true },
      { label: 'Owner Approval', done: ['approved', 'issued', 'rejected'].includes(t.reward.status), gate: true },
      { label: 'Reward Issued', done: rs === 'issued', gate: true },
      { label: 'Ticket Closed', done: t.status === 'Closed' }
    ];
    let currentSet = false;
    steps.forEach((s) => {
      if (!s.done && !currentSet) { s.current = true; currentSet = true; }
    });
    return steps;
  }

  function nextStatus(t) {
    const next = STAGES[stageIndex(t) + 1];
    return next || null;
  }
  const ADVANCE_LABEL = { 'Assigned': 'Mark as Assigned', 'In Progress': 'Start Progress', 'Resolved': 'Mark Resolved', 'Customer Confirmed': 'Simulate Customer Confirmation', 'Closed': 'Close Ticket' };

  /* ======================================================================
   * UI state
   * ==================================================================== */
  const ui = {
    filter: 'All', search: '', page: 1, sidebarOpen: false, replyLang: {}, editingReply: null,
    analyzing: {}, settingsTab: 'business', ruleDraft: '', ruleEditId: null, analyticsRange: '7d', sending: false
  };
  let modalState = null;
  let lastRouteKey = '';

  /* ======================================================================
   * Small UI building blocks
   * ==================================================================== */
  const priorityBadge = (p) => (p ? `<span class="badge pr-${esc(p.toLowerCase())}">${esc(p)}</span>` : '<span class="badge b-muted">Not classified</span>');
  const statusBadge = (s) => `<span class="badge st-${slug(s)}">${esc(s)}</span>`;
  const FAULT_MAP = { seller: ['Seller Fault', 'fault-seller'], customer: ['Customer Fault', 'fault-customer'], unclear: ['Needs Review', 'fault-unclear'], pending: ['Not analyzed', 'b-muted'] };
  const faultBadge = (f) => `<span class="badge ${FAULT_MAP[f][1]}">${FAULT_MAP[f][0]}</span>`;
  const langBadge = (lang) => (lang === 'English' ? '<span class="badge b-muted">English</span>' : `<span class="badge b-lang">${esc(lang)} detected</span>`);
  const pill = (text, tone) => `<span class="pill ${tone}">${esc(text)}</span>`;

  function emptyState(iconName, title, text, actionHtml) {
    return `<div class="empty"><div class="ico">${icon(iconName, 22)}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>${actionHtml ? `<div style="margin-top:14px">${actionHtml}</div>` : ''}</div>`;
  }

  /* ---- Charts (inline SVG, no libraries) ---- */
  function niceMax(v) {
    const pow = Math.pow(10, Math.floor(Math.log10(v || 1)));
    const n = v / pow;
    const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return step * pow;
  }
  function chartFrame(values, W, H, pad) {
    const max = niceMax(Math.max.apply(null, values) * 1.05);
    const innerH = H - pad.t - pad.b;
    let grid = '';
    for (let k = 0; k <= 4; k++) {
      const v = (max * k) / 4;
      const y = pad.t + innerH * (1 - k / 4);
      grid += `<line class="grid-line" x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}"/><text x="${pad.l - 8}" y="${y + 4}" text-anchor="end">${Number.isInteger(v) ? v.toLocaleString('en-IN') : v.toFixed(1)}</text>`;
    }
    return { max, innerH, grid };
  }
  function barChart(values, labels, label, fmt) {
    const W = 640, H = 240, pad = { l: 44, r: 10, t: 14, b: 30 };
    const f = chartFrame(values, W, H, pad);
    const bw = (W - pad.l - pad.r) / values.length;
    let bars = '';
    values.forEach((v, i) => {
      const h = (v / f.max) * f.innerH;
      const x = pad.l + i * bw + bw * 0.2;
      const y = pad.t + f.innerH - h;
      bars += `<rect class="bar" x="${x}" y="${y}" width="${bw * 0.6}" height="${h}" rx="4"><title>${esc(labels[i])}: ${esc(fmt ? fmt(v) : v)}</title></rect><text class="val" x="${x + bw * 0.3}" y="${y - 5}" text-anchor="middle">${esc(fmt ? fmt(v) : v)}</text><text x="${x + bw * 0.3}" y="${H - 10}" text-anchor="middle">${esc(labels[i])}</text>`;
    });
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${f.grid}${bars}</svg>`;
  }
  function lineChart(values, labels, label, fmt) {
    const W = 640, H = 240, pad = { l: 44, r: 16, t: 14, b: 30 };
    const f = chartFrame(values, W, H, pad);
    const stepX = values.length > 1 ? (W - pad.l - pad.r) / (values.length - 1) : 0;
    const pts = values.map((v, i) => [pad.l + i * stepX, pad.t + f.innerH * (1 - v / f.max)]);
    const line = pts.map((p) => p.join(',')).join(' ');
    const area = `M${pts[0][0]},${pad.t + f.innerH} L${pts.map((p) => p.join(',')).join(' L')} L${pts[pts.length - 1][0]},${pad.t + f.innerH} Z`;
    let marks = '';
    pts.forEach((p, i) => {
      marks += `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="4"><title>${esc(labels[i])}: ${esc(fmt ? fmt(values[i]) : values[i])}</title></circle><text x="${p[0]}" y="${H - 10}" text-anchor="middle">${esc(labels[i])}</text>`;
    });
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${f.grid}<path class="area" d="${area}"/><polyline class="line" points="${line}"/>${marks}</svg>`;
  }
  function donutChart(segments, label) {
    const total = segments.reduce((a, s) => a + s.value, 0) || 1;
    const r = 56, c = 2 * Math.PI * r;
    let offset = 0, arcs = '';
    segments.forEach((s) => {
      const len = (s.value / total) * c;
      arcs += `<circle cx="80" cy="80" r="${r}" fill="none" stroke="${s.color}" stroke-width="24" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 80 80)"><title>${esc(s.label)}: ${s.value}%</title></circle>`;
      offset += len;
    });
    const legend = segments.map((s) => `<li><i style="background:${s.color}"></i>${esc(s.label)} <b class="mono">${s.value}%</b></li>`).join('');
    return `<div class="donut-wrap"><svg class="donut" viewBox="0 0 160 160" role="img" aria-label="${esc(label)}">${arcs}</svg><ul class="legend">${legend}</ul></div>`;
  }
  function lastDays(n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) out.push(new Date(Date.now() - i * 86400000).toLocaleDateString('en-US', { weekday: 'short' }));
    return out;
  }
  function lastMonths(n) {
    const out = [];
    const d = new Date();
    for (let i = n - 1; i >= 0; i--) out.push(new Date(d.getFullYear(), d.getMonth() - i, 1).toLocaleDateString('en-US', { month: 'short' }));
    return out;
  }

  /* ======================================================================
   * Toasts & modals
   * ==================================================================== */
  function toast(message, type) {
    type = type || 'success';
    const root = $('#toast-root');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = `<span class="ti">${icon(type === 'error' ? 'alert' : type === 'info' ? 'info' : 'checkCircle', 18)}</span><span>${esc(message)}</span><button type="button" aria-label="Dismiss notification">${icon('x', 16)}</button>`;
    root.appendChild(el);
    const remove = () => { if (el.parentNode) el.parentNode.removeChild(el); };
    $('button', el).addEventListener('click', remove);
    setTimeout(remove, 4000);
  }

  let lastFocus = null;
  function openModal(opts) {
    closeModal(true);
    lastFocus = document.activeElement;
    modalState = { onConfirm: opts.onConfirm || null, delay: opts.delay || 0 };
    const actions = (opts.actions || []).map((a) => `<button type="button" class="btn ${a.cls || ''}" data-action="${a.action}" ${a.attrs || ''}>${a.label}</button>`).join('');
    $('#modal-root').innerHTML = `
      <div class="overlay" data-action="overlayClick" role="presentation">
        <div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="modal-head"><h2 id="modal-title">${esc(opts.title)}</h2><button type="button" class="icon-btn" data-action="closeModal" aria-label="Close dialog">${icon('x', 18)}</button></div>
          <div class="modal-body">${opts.body}</div>
          <div class="modal-foot">${actions}</div>
        </div>
      </div>`;
    const first = $('#modal-root input, #modal-root textarea, #modal-root select') || $('#modal-root .modal-foot .btn:last-child');
    if (first) first.focus();
  }
  function closeModal(silent) {
    $('#modal-root').innerHTML = '';
    modalState = null;
    if (!silent && lastFocus && document.contains(lastFocus) && lastFocus.focus) lastFocus.focus();
  }
  function confirmModal(o) {
    openModal({
      title: o.title,
      body: `<p>${o.message}</p>`,
      onConfirm: o.onConfirm, delay: o.delay,
      actions: [
        { label: 'Cancel', action: 'closeModal' },
        { label: o.confirmLabel || 'Confirm', action: 'modalConfirm', cls: o.danger ? 'btn-danger' : 'btn-primary' }
      ]
    });
  }

  /* ======================================================================
   * Pages
   * ==================================================================== */
  const NAV = [
    ['dashboard', 'Dashboard', 'dashboard'], ['tickets', 'Tickets', 'ticket'], ['teams', 'Teams', 'users'],
    ['rewards', 'Rewards', 'gift'], ['rules', 'AI Rules', 'sparkles'], ['analytics', 'Analytics', 'chart'], ['settings', 'Settings', 'settings']
  ];
  const pendingApprovals = () => state.tickets.filter((t) => rewardState(t).key === 'waiting');

  function shell(active, content) {
    const pending = pendingApprovals().length;
    const nav = NAV.map(([key, label, ic]) =>
      `<a href="#/${key}" class="${active === key ? 'active' : ''}" ${active === key ? 'aria-current="page"' : ''}>${icon(ic, 18)}${label}${key === 'rewards' && pending ? `<span class="count" data-tip="Rewards waiting for owner approval">${pending}</span>` : ''}</a>`).join('');
    const title = (NAV.find((n) => n[0] === active) || [0, ''])[1];
    const notices = state.activity.slice(0, 5).map((a) => `<div class="menu-notice">${esc(a.text)}<small>${relTime(a.ts)}</small></div>`).join('');
    const owner = state.settings.business.owner;
    return `
      <div class="shell">
        <aside class="sidebar ${ui.sidebarOpen ? 'open' : ''}" id="sidebar" aria-label="Main navigation">
          <div class="brand"><span class="brand-mark">${icon('check', 18)}</span><span>Resolve<em>AI</em></span></div>
          <nav class="nav">${nav}</nav>
          <div class="sidebar-note"><strong>Demo mode</strong>AI results are simulated with mock data. No real AI or backend is connected.</div>
        </aside>
        <div class="scrim ${ui.sidebarOpen ? 'open' : ''}" data-action="closeSidebar"></div>
        <div class="main-col">
          <header class="topbar">
            <button type="button" class="icon-btn menu-btn" data-action="openSidebar" aria-label="Open navigation menu" aria-controls="sidebar">${icon('menu', 20)}</button>
            <div class="brand"><span class="brand-mark">${icon('check', 18)}</span><span>Resolve<em>AI</em></span></div>
            <span class="topbar-title">${esc(title)}</span>
            <span class="topbar-spacer"></span>
            <span class="demo-pill">Demo · simulated AI</span>
            <div class="menu-wrap">
              <button type="button" class="icon-btn" data-action="toggleMenu" data-menu="bell" aria-label="Notifications" aria-haspopup="true">${icon('bell', 19)}${pending ? '<span class="dot"></span>' : ''}</button>
              <div class="menu" id="menu-bell" hidden>
                <div class="menu-head"><strong>Notifications</strong><span>${pending} reward${pending === 1 ? '' : 's'} awaiting your approval</span></div>
                ${notices || '<div class="menu-notice">Nothing new.</div>'}
              </div>
            </div>
            <div class="menu-wrap">
              <button type="button" class="profile-btn" data-action="toggleMenu" data-menu="profile" aria-label="User menu" aria-haspopup="true"><span class="avatar">${esc(initials(owner))}</span><span class="pname">${esc(owner)}</span></button>
              <div class="menu" id="menu-profile" hidden>
                <div class="menu-head"><strong>${esc(owner)}</strong><span>Owner · ${esc(state.settings.business.name)}</span></div>
                <a href="#/settings">${icon('settings', 16)} Settings</a>
                <button type="button" class="menu-item" data-action="logout">${icon('logout', 16)} Log out</button>
              </div>
            </div>
          </header>
          <main id="main" class="page" tabindex="-1">${content}</main>
        </div>
      </div>`;
  }

  /* ---- Login ---- */
  function loginPage() {
    return `
      <div class="login" id="main">
        <section class="login-side" aria-hidden="true">
          <div class="brand"><span class="brand-mark">${icon('check', 18)}</span><span>Resolve<em>AI</em></span></div>
          <div>
            <h2>Resolve tickets faster. Reward only when it is fair.</h2>
            <p>AI-assisted triage, fault detection and a controlled reward workflow built for small sellers.</p>
            <ul class="login-points">
              <li>${icon('shield', 18)} Fault Check → Reward Gate</li>
              <li>${icon('globe', 18)} Tanglish tickets and replies</li>
              <li>${icon('sparkles', 18)} Business rules in plain English</li>
            </ul>
          </div>
          <small style="opacity:.7">Frontend demo · all AI results are simulated</small>
        </section>
        <section class="login-main">
          <div class="login-card">
            <h1>Welcome back</h1>
            <p class="sub">Sign in to your ResolveAI workspace.</p>
            <form id="login-form" novalidate>
              <div class="field"><label for="login-email">Email</label><input class="input" id="login-email" type="email" autocomplete="email" placeholder="you@company.com" /></div>
              <div class="field"><label for="login-password">Password</label><input class="input" id="login-password" type="password" autocomplete="current-password" placeholder="Enter your password" /></div>
              <div class="row between" style="margin-bottom:14px">
                <label class="checkbox"><input type="checkbox" id="login-remember" /> Remember me</label>
                <a href="#/login" data-action="forgotPassword">Forgot password?</a>
              </div>
              <div class="error-text" id="login-error" role="alert"></div>
              <button type="submit" class="btn btn-primary btn-lg btn-block" id="login-btn">Log in</button>
            </form>
            <div class="divider">or</div>
            <button type="button" class="btn btn-lg btn-block" data-action="demoLogin">${icon('zap', 16)} Use demo login</button>
          </div>
        </section>
      </div>`;
  }

  /* ---- Dashboard ---- */
  function dashboardPage() {
    const pending = pendingApprovals();
    const kpis = [
      ['Open Tickets', 24, 'ticket', '', '+3 since yesterday'],
      ['High Priority', 6, 'alert', 'warn', '2 critical'],
      ['Awaiting Customer', 8, 'clock', 'amber', 'Replies pending'],
      ['Resolved Today', 17, 'checkCircle', 'ok', 'Avg 6.4 h'],
      ['Rewards Issued', state.stats.issuedToday, 'gift', 'ok', 'Owner approved only']
    ].map(([label, value, ic, tone, foot]) => `
      <div class="card kpi ${tone}"><div class="kpi-top">${label}<span class="kpi-ico">${icon(ic, 16)}</span></div><div class="kpi-value mono">${value}</div><div class="kpi-foot">${foot}</div></div>`).join('');
    const prio = [['Critical', 2], ['High', 6], ['Medium', 9], ['Low', 7]];
    const prioTotal = prio.reduce((a, p) => a + p[1], 0);
    const prioBars = prio.map(([name, n]) => `<div class="hbar"><span>${name}</span><div class="track"><div class="fill c-${name.toLowerCase()}" style="width:${Math.round((n / prioTotal) * 100)}%"></div></div><b class="mono">${n}</b></div>`).join('');
    const recent = state.tickets.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
    return `
      <div class="page-head"><div><h1>Dashboard</h1><p>Support overview for ${esc(state.settings.business.name)}</p></div>
        <div class="head-actions"><button type="button" class="btn btn-primary" data-action="newTicket">${icon('plus', 16)} New ticket</button></div></div>
      <div class="grid g-5">${kpis}</div>
      <div class="callout mt">${icon('shield', 20)}<div><b>Fault Check → Reward Gate.</b>
        <p>A complaint alone never earns a reward. A reward is released only after seller fault is detected, the issue is resolved, the customer confirms, abuse limits pass and the owner approves.
        ${pending.length ? `<a href="#/rewards">${pending.length} reward${pending.length === 1 ? '' : 's'} waiting for your approval →</a>` : ''}</p></div></div>
      <div class="grid g-main mt">
        <section class="card"><div class="card-head"><div><h2>Ticket volume</h2><p class="card-sub">Last 7 days</p></div></div><div class="card-body">${barChart([18, 24, 21, 29, 26, 15, 22], lastDays(7), 'Ticket volume over the last 7 days')}</div></section>
        <section class="card"><div class="card-head"><div><h2>Priority distribution</h2><p class="card-sub">${prioTotal} open tickets</p></div></div><div class="card-body" style="padding-top:20px">${prioBars}</div></section>
      </div>
      <section class="card mt"><div class="card-head" style="padding-bottom:12px"><h2>Recent tickets</h2><a href="#/tickets">View all →</a></div>
        <div class="table-wrap">${ticketTable(recent, true)}</div></section>`;
  }

  /* ---- Ticket table ---- */
  function ticketTable(rows, withCreated) {
    if (!rows.length) return emptyState('inbox', 'No tickets found', 'Try a different filter or search term.');
    const body = rows.map((t) => `
      <tr data-href="#/tickets/${esc(t.id)}">
        <td><a class="t-id" href="#/tickets/${esc(t.id)}">#${esc(t.id)}</a></td>
        <td>${esc(t.customer)}</td>
        <td class="t-issue">${esc(t.subject)}${t.language !== 'English' ? `<span class="lang">${langBadge(t.language)}</span>` : ''}</td>
        <td>${priorityBadge(t.priority)}</td>
        <td class="nowrap">${t.team ? esc(t.team) : '<span class="muted">Unassigned</span>'}</td>
        <td>${faultBadge(t.fault)}</td>
        <td>${statusBadge(t.status)}</td>
        <td class="muted nowrap">${relTime(withCreated ? t.createdAt : t.updatedAt)}</td>
      </tr>`).join('');
    return `<table><thead><tr><th>Ticket ID</th><th>Customer</th><th>Issue</th><th>Priority</th><th>${withCreated ? 'Team' : 'Assigned Team'}</th><th>${withCreated ? 'Fault Detection' : 'Fault'}</th><th>Status</th><th>${withCreated ? 'Created' : 'Last Updated'}</th></tr></thead><tbody>${body}</tbody></table>`;
  }

  function matchesFilter(t, f) {
    if (f === 'All') return true;
    if (f === 'High Priority') return t.priority === 'High' || t.priority === 'Critical';
    return t.status === f;
  }
  function filteredTickets() {
    const q = ui.search.trim().toLowerCase();
    return state.tickets
      .filter((t) => matchesFilter(t, ui.filter) && (!q || [t.id, t.customer, t.subject, t.team, t.status, t.priority || ''].join(' ').toLowerCase().includes(q)))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  function pagerHtml(total) {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (ui.page > pages) ui.page = pages;
    const from = total ? (ui.page - 1) * PAGE_SIZE + 1 : 0;
    const to = Math.min(total, ui.page * PAGE_SIZE);
    let nums = '';
    for (let p = 1; p <= pages; p++) nums += `<button type="button" class="${p === ui.page ? 'on' : ''}" data-action="goPage" data-page="${p}" aria-label="Page ${p}" ${p === ui.page ? 'aria-current="page"' : ''}>${p}</button>`;
    return `<div class="pager"><span class="muted small">Showing ${from}–${to} of ${total}</span><div class="pages">
      <button type="button" data-action="goPage" data-page="${ui.page - 1}" ${ui.page <= 1 ? 'disabled' : ''} aria-label="Previous page">${icon('chevL', 14)}</button>${nums}
      <button type="button" data-action="goPage" data-page="${ui.page + 1}" ${ui.page >= pages ? 'disabled' : ''} aria-label="Next page">${icon('chevR', 14)}</button></div></div>`;
  }
  function ticketListInner() {
    const all = filteredTickets();
    const rows = all.slice((ui.page - 1) * PAGE_SIZE, ui.page * PAGE_SIZE);
    return `<div class="table-wrap">${ticketTable(rows, false)}</div>${all.length ? pagerHtml(all.length) : ''}`;
  }

  function ticketsPage() {
    const filters = FILTERS.map((f) => {
      const n = state.tickets.filter((t) => matchesFilter(t, f)).length;
      return `<button type="button" class="filter-btn ${ui.filter === f ? 'on' : ''}" data-action="setFilter" data-filter="${esc(f)}" aria-pressed="${ui.filter === f}">${esc(f)}<span class="n">${n}</span></button>`;
    }).join('');
    return `
      <div class="page-head"><div><h1>Tickets</h1><p>Triage, route and resolve customer support tickets.</p></div>
        <div class="head-actions"><button type="button" class="btn btn-primary" data-action="newTicket">${icon('plus', 16)} New ticket</button></div></div>
      <div class="tickets-layout">
        <aside class="card filters" aria-label="Ticket filters"><h3>Filters</h3>${filters}</aside>
        <section class="card">
          <div class="toolbar"><div class="search">${icon('search', 16)}<input class="input" id="ticket-search" type="search" placeholder="Search tickets..." aria-label="Search tickets" value="${esc(ui.search)}" /></div></div>
          <div id="ticket-list">${ticketListInner()}</div>
        </section>
      </div>`;
  }

  /* ---- Ticket detail ---- */
  function lifecycleHtml(t) {
    const cur = stageIndex(t);
    const items = STAGES.map((s, i) => {
      const cls = i < cur ? 'done' : i === cur ? 'current' : '';
      return `<li class="${cls}" ${i === cur ? 'aria-current="step"' : ''}><div class="dot">${i < cur ? icon('check', 14) : `<b>${i === cur ? '●' : ''}</b>`}</div>${s}</li>`;
    }).join('');
    return `<ol class="lifecycle" aria-label="Ticket lifecycle">${items}</ol>`;
  }

  function workflowHtml(t) {
    const items = workflowSteps(t).map((s, i) => `<li class="${s.done ? 'done' : s.current ? 'current' : ''} ${s.gate ? 'gate-node' : ''}"><span class="node"><span class="n">${s.done ? icon('check', 11) : i + 1}</span>${s.label}</span></li>`).join('');
    return `<ol class="flow" aria-label="Resolution workflow">${items}</ol>`;
  }

  function analysisCard(t) {
    if (ui.analyzing[t.id] !== undefined) {
      const cur = ui.analyzing[t.id];
      const items = ANALYSIS_STEPS.map((s, i) => `<li class="${i < cur ? 'done' : i === cur ? 'active' : ''}">${i < cur ? icon('checkCircle', 16) : i === cur ? '<span class="spinner"></span>' : icon('clock', 16)}${s}</li>`).join('');
      return `<section class="card ai-card"><div class="ai-head"><h2>${icon('sparkles', 18)} AI Analysis</h2><span class="sim-tag">Simulated · demo</span></div>
        <div class="analyze-empty"><h3>Analyzing ticket...</h3><p class="muted">Running the mock AI pipeline.</p><ul class="analyze-steps" aria-live="polite">${items}</ul></div></section>`;
    }
    if (!t.analyzed) {
      return `<section class="card ai-card"><div class="ai-head"><h2>${icon('sparkles', 18)} AI Analysis</h2><span class="sim-tag">Simulated · demo</span></div>
        <div class="analyze-empty"><h3>This ticket has not been analyzed</h3><p class="muted">Priority, team, fault, resolution steps and a reply draft will be generated.</p>
        <div style="margin-top:14px"><button type="button" class="btn btn-primary btn-lg" data-action="analyze" data-id="${esc(t.id)}">${icon('sparkles', 16)} Analyze Ticket</button></div>
        <p class="hint" style="margin-top:10px">Demo only: results come from a local mock service, not a real AI model.</p></div></section>`;
    }
    const faultTitle = { seller: 'SELLER FAULT', customer: 'CUSTOMER FAULT', unclear: 'NEEDS REVIEW' }[t.fault];
    const teamOptions = state.teams.map((x) => `<option value="${esc(x.name)}" ${x.name === t.team ? 'selected' : ''}>${esc(x.name)}</option>`).join('');
    return `<section class="card ai-card">
      <div class="ai-head"><h2>${icon('sparkles', 18)} AI Analysis</h2><span class="sim-tag">Simulated · demo</span></div>
      <div class="ai-grid">
        <div class="ai-tile"><div class="t-label">Priority</div><div class="t-big">${priorityBadge(t.priority)}</div><p class="small muted">${esc(t.priorityReason)}</p></div>
        <div class="ai-tile"><div class="t-label">Responsible team</div><div class="t-big">${esc(t.team || 'Unassigned')}</div>
          <label class="sr-only" for="assign-team">Assign team</label>
          <select class="select select-sm" id="assign-team" data-change="assignTeam" data-id="${esc(t.id)}"><option value="">Unassigned</option>${teamOptions}</select></div>
      </div>
      <div class="fault-panel ${t.fault}">
        <div class="fault-top"><div><div class="row"><span class="core-tag">Core: Fault Check</span></div><div class="fault-title" style="margin-top:6px">${faultTitle}</div></div>
          <div class="conf" style="color:${t.fault === 'seller' ? 'var(--red)' : t.fault === 'customer' ? 'var(--blue)' : 'var(--amber)'}"><span class="small bold">Confidence</span><div class="progress" role="img" aria-label="Confidence ${t.confidence}%"><div style="width:${t.confidence}%"></div></div><b class="mono">${t.confidence}%</b></div></div>
        <p><b>Reason:</b> ${esc(t.faultReason)}</p>
        <p class="small muted">${t.fault === 'seller' ? 'Seller fault is the first condition of the Reward Gate.' : 'Only a seller-fault result can lead to a reward.'}</p>
      </div></section>`;
  }

  function resolutionCard(t) {
    if (!t.analyzed) return '';
    const steps = t.steps.map((s, i) => `<li class="${t.stepsApplied ? 'applied' : ''}"><span class="num">${t.stepsApplied ? icon('check', 13) : i + 1}</span><span>${esc(s)}</span></li>`).join('');
    const closed = t.status === 'Closed';
    return `<section class="card"><div class="card-head"><h2>AI Suggested Resolution</h2><span class="sim-tag">Simulated</span></div>
      <div class="card-body"><ol class="steps-list">${steps}</ol>
      <div style="margin-top:12px"><button type="button" class="btn btn-primary" data-action="applySteps" data-id="${esc(t.id)}" ${t.stepsApplied || closed ? 'disabled' : ''}>${icon('checkCircle', 16)} ${t.stepsApplied ? 'Steps applied' : 'Apply Resolution Steps'}</button></div></div></section>`;
  }

  function replyCard(t) {
    if (!t.analyzed) {
      return `<section class="card"><div class="card-head"><h2>AI Reply Draft</h2></div><div class="card-body">${emptyState('send', 'No draft yet', 'Analyze the ticket to generate a first-reply draft in English, Tamil or Tanglish.')}</div></section>`;
    }
    const lang = ui.replyLang[t.id] || langKey(t.language);
    const editing = ui.editingReply === t.id + ':' + lang;
    const seg = Object.keys(LANGS).map((k) => `<button type="button" class="${k === lang ? 'on' : ''}" data-action="setReplyLang" data-id="${esc(t.id)}" data-lang="${k}" aria-pressed="${k === lang}">${LANGS[k]}</button>`).join('');
    const text = t.replies[lang] || '';
    const sent = t.replySent ? `<span class="badge b-ok">${icon('check', 12)} Reply sent</span>` : '';
    return `<section class="card"><div class="card-head"><div><h2>AI Reply Draft</h2><p class="card-sub">Suggested reply · ${LANGS[lang]}</p></div><div class="row row-wrap">${sent}<div class="segmented" role="group" aria-label="Reply language">${seg}</div></div></div>
      <div class="card-body">
        ${editing ? `<label class="sr-only" for="reply-edit">Edit reply</label><textarea class="textarea" id="reply-edit" rows="5">${esc(text)}</textarea>` : `<div class="reply-box" lang="${lang === 'ta' ? 'ta' : 'en'}">${esc(text)}</div>`}
        <div class="row row-wrap" style="margin-top:12px">
          ${editing
            ? `<button type="button" class="btn btn-primary" data-action="saveReply" data-id="${esc(t.id)}">Save changes</button><button type="button" class="btn" data-action="cancelReply">Cancel</button>`
            : `<button type="button" class="btn" data-action="copyReply" data-id="${esc(t.id)}">${icon('copy', 15)} Copy Reply</button>
               <button type="button" class="btn" data-action="editReply" data-id="${esc(t.id)}">${icon('pencil', 15)} Edit</button>
               <button type="button" class="btn btn-primary" data-action="sendReply" data-id="${esc(t.id)}" ${t.status === 'Closed' ? 'disabled' : ''}>${icon('send', 15)} Send</button>`}
        </div></div></section>`;
  }

  function gateCard(t) {
    const rs = rewardState(t);
    if (!t.analyzed) {
      return `<aside class="card gate"><div class="gate-head"><h2>${icon('shield', 18)} Reward Eligibility</h2><p>Fault Check → Reward Gate</p></div><div class="card-body">${emptyState('lock', 'Gate locked', 'Run Analyze Ticket to check who is at fault before any reward can be considered.')}</div></aside>`;
    }
    const g = gate(t);
    const s = state.settings;
    const yn = (ok) => pill(ok ? 'YES' : 'NO', ok ? 'ok' : 'no');
    const ownerPill = g.owner === 'approved' ? pill('APPROVED', 'ok') : g.owner === 'rejected' ? pill('REJECTED', 'no') : pill('PENDING', 'wait');
    const rows = [
      ['Seller Fault', yn(g.seller), 'Rewards only apply when the AI finds the seller responsible.'],
      ['Issue Resolved', yn(g.resolved), 'The ticket must reach Resolved or later.'],
      ['Customer Confirmed', yn(g.confirmed), 'The customer must confirm the resolution.'],
      ['Owner Approval', ownerPill, 'The business owner must approve. This cannot be automated.'],
      ['Monthly Reward Limit', pill(`${t.monthlyRewards} / ${s.perCustomerMonthly}`, g.monthlyOk ? 'ok' : 'no'), 'Rewards already given to this customer this month.'],
      ['Repeat Complaint Count', pill(`${t.repeat} / ${s.repeatThreshold}`, g.abuseOk ? 'ok' : 'no'), `${s.repeatThreshold}+ repeat complaints trigger abuse review.`]
    ].map(([label, val, tip]) => `<li data-tip="${esc(tip)}" tabindex="0"><span>${label}</span>${val}</li>`).join('');
    let actions = '';
    if (rs.key === 'waiting') actions = `<button type="button" class="btn btn-primary btn-lg" data-action="reviewReward" data-id="${esc(t.id)}">${icon('gift', 16)} Review Reward</button>`;
    else if (rs.key === 'approved') actions = `<button type="button" class="btn btn-success btn-lg" data-action="issueReward" data-id="${esc(t.id)}">${icon('gift', 16)} Issue ${inr(t.rewardAmount)} coupon</button>`;
    else if (rs.key === 'issued') actions = `<div class="callout" style="justify-content:center">${icon('checkCircle', 18)}<b>${inr(t.rewardAmount)} coupon issued</b></div>`;
    else actions = `<button type="button" class="btn btn-lg" disabled data-tip="${esc(rs.note)}">${icon('lock', 16)} Review Reward</button>`;
    return `<aside class="card gate" aria-label="Reward eligibility">
      <div class="gate-head"><h2>${icon('shield', 18)} Reward Eligibility</h2><p>Fault Check → Reward Gate</p></div>
      <ul class="gate-list">${rows}</ul>
      <div class="gate-status tone-${rs.tone}">REWARD STATUS<br>${rs.label}<small>${esc(rs.note)}</small></div>
      <div class="gate-actions">${actions}</div>
      <p class="gate-note">${icon('lock', 14)}<span>Rewards are never released automatically. Owner approval is mandatory.</span></p></aside>`;
  }

  function ticketDetailPage(id) {
    const t = findTicket(id);
    if (!t) return `<a class="crumb" href="#/tickets">${icon('arrowLeft', 15)} Back to tickets</a><div class="card">${emptyState('inbox', 'Ticket not found', `There is no ticket with ID ${id}.`, '<a class="btn" href="#/tickets">Go to tickets</a>')}</div>`;
    const next = nextStatus(t);
    const advance = next ? `<button type="button" class="btn btn-primary" data-action="advance" data-id="${esc(t.id)}">${icon('arrowRight', 16)} ${ADVANCE_LABEL[next]}</button>` : '';
    const orderMatch = /#(\d{3,})/.exec(t.subject);
    return `
      <a class="crumb" href="#/tickets">${icon('arrowLeft', 15)} Back to tickets</a>
      <div class="page-head" style="margin-bottom:14px">
        <div><div class="ticket-title"><span class="ticket-id">${esc(t.id)}</span>${priorityBadge(t.priority)}${statusBadge(t.status)}${faultBadge(t.fault)}</div>
          <h1>${esc(t.subject)}</h1><p>${esc(t.customer)} · opened ${relTime(t.createdAt)}${orderMatch ? ` · Order #${orderMatch[1]}` : ''}</p></div>
        <div class="head-actions">${advance}</div></div>
      <section class="card card-pad" style="margin-bottom:16px"><div class="label muted" style="margin-bottom:6px">End-to-end workflow</div>${workflowHtml(t)}</section>
      <section class="card card-pad" style="margin-bottom:16px"><div class="label muted" style="margin-bottom:12px">Ticket lifecycle</div>${lifecycleHtml(t)}</section>
      <div class="grid g-detail">
        <div class="stack">
          <section class="card"><div class="card-head"><h2>Customer message</h2></div><div class="card-body">
            <div class="cust-row"><span class="avatar">${esc(initials(t.customer))}</span><div><b>${esc(t.customer)}</b><div class="small muted">Language: ${esc(t.language)}</div></div>${langBadge(t.language)}</div>
            <div class="msg-box" lang="${t.language === 'Tamil' ? 'ta' : 'en'}">“${esc(t.message)}”</div>
            ${t.analyzed && t.language !== 'English' ? `<div class="interp">${icon('globe', 16)}<div><b>AI interpretation:</b> ${esc(t.interpretation)}</div></div>` : ''}
          </div></section>
          ${analysisCard(t)}
          ${resolutionCard(t)}
          ${replyCard(t)}
        </div>
        <div class="stack">${gateCard(t)}</div>
      </div>`;
  }

  /* ---- Teams ---- */
  function teamsPage() {
    const cards = state.teams.map((team) => {
      const mine = state.tickets.filter((t) => t.team === team.name);
      const open = mine.filter(isOpen).length;
      const resolved = team.baseResolved + mine.filter((t) => !isOpen(t)).length;
      const pct = Math.round((resolved / (resolved + open)) * 100);
      return `<section class="card team-card"><div class="row between"><h3>${esc(team.name)}</h3><span class="muted small">${team.members} members</span></div>
        <div class="team-stats"><div><b class="mono">${open}</b><span>Open</span></div><div><b class="mono">${resolved}</b><span>Resolved</span></div><div><b>${esc(team.avg)}</b><span>Avg. resolution</span></div></div>
        <div class="progress" style="margin-top:12px" role="img" aria-label="${pct}% resolved"><div style="width:${pct}%"></div></div></section>`;
    }).join('');
    const assignable = state.tickets.filter((t) => t.status !== 'Closed').sort((a, b) => b.createdAt - a.createdAt);
    const tOpts = assignable.map((t) => `<option value="${esc(t.id)}">${esc(t.id)} · ${esc(t.customer)} · ${esc(t.subject.slice(0, 40))}</option>`).join('');
    const teamOpts = state.teams.map((x) => `<option value="${esc(x.name)}">${esc(x.name)}</option>`).join('');
    return `
      <div class="page-head"><div><h1>Teams</h1><p>Workload and performance by support team.</p></div></div>
      <div class="grid g-3">${cards}</div>
      <section class="card mt"><div class="card-head"><div><h2>Assign a ticket</h2><p class="card-sub">Move a ticket to the right team. New tickets become Assigned.</p></div></div>
        <div class="card-body"><div class="form-grid" style="grid-template-columns:2fr 1fr auto;align-items:end">
          <div class="field" style="margin:0"><label for="assign-ticket">Ticket</label><select class="select" id="assign-ticket">${tOpts}</select></div>
          <div class="field" style="margin:0"><label for="assign-team-select">Team</label><select class="select" id="assign-team-select">${teamOpts}</select></div>
          <button type="button" class="btn btn-primary" data-action="quickAssign" style="margin-bottom:0">Assign</button></div></div></section>`;
  }

  /* ---- Rewards ---- */
  function rewardsPage() {
    const s = state.settings;
    const remaining = s.budget - state.stats.used;
    const usedPct = Math.min(100, Math.round((state.stats.used / s.budget) * 100));
    const stat = (label, value, foot, tone) => `<div class="card kpi ${tone || ''}"><div class="kpi-top">${label}</div><div class="kpi-value mono">${value}</div><div class="kpi-foot">${foot}</div></div>`;
    const rules = [
      'Reward only when seller fault is detected.',
      `Reward is capped at ${inr(s.maxReward)} per ticket.`,
      `A monthly reward budget of ${inr(s.budget)} applies.`,
      `${s.repeatThreshold}+ repeat complaints trigger abuse review.`,
      'Customer must confirm the resolution.',
      'Owner approval is mandatory.',
      'Reward cannot be issued automatically.'
    ].map((r, i) => `<li><span class="num">${i + 1}</span><span>${esc(r)}</span></li>`).join('');
    const diagram = [
      ['search', 'Fault Check', 'AI finds the seller responsible'],
      ['checkCircle', 'Resolved', 'Issue is actually fixed'],
      ['user', 'Customer confirms', 'Customer agrees it is solved'],
      ['shield', 'Abuse & limits', 'Caps, budget and repeat checks pass'],
      ['gift', 'Owner approves', 'Only then a coupon is issued']
    ].map(([ic, title, text], i) => `<div class="gate-step ${i === 4 ? 'last' : ''}"><div class="ico">${icon(ic, 16)}</div><b>${i + 1}. ${title}</b><span>${text}</span></div>`).join('');
    const pend = pendingApprovals();
    const pendHtml = pend.length
      ? `<div class="table-wrap"><table><thead><tr><th>Ticket</th><th>Customer</th><th>Reward</th><th></th></tr></thead><tbody>${pend.map((t) => `<tr><td><a class="t-id" href="#/tickets/${esc(t.id)}">#${esc(t.id)}</a></td><td>${esc(t.customer)}</td><td>${inr(t.rewardAmount)}</td><td style="text-align:right"><button type="button" class="btn btn-primary btn-sm" data-action="reviewReward" data-id="${esc(t.id)}">Review Reward</button></td></tr>`).join('')}</tbody></table></div>`
      : emptyState('checkCircle', 'Nothing waiting', 'No rewards need your approval right now.');
    const logTone = { Issued: 'b-ok', Approved: 'b-ok', Rejected: 'b-bad', Blocked: 'b-bad' };
    const logRows = state.rewardLog.slice(0, 8).map((r) => `<tr><td class="t-id">#${esc(r.ticket)}</td><td>${esc(r.customer)}</td><td>${inr(r.amount)}</td><td><span class="badge ${logTone[r.status]}">${esc(r.status)}</span></td><td class="muted nowrap">${relTime(r.ts)}</td></tr>`).join('');
    return `
      <div class="page-head"><div><h1>Rewards</h1><p>Controlled, owner-approved rewards after fair fault detection.</p></div></div>
      <section class="card card-pad"><div class="label" style="margin-bottom:10px">How the Fault Check → Reward Gate works</div><div class="gate-diagram">${diagram}</div></section>
      <div class="grid g-4 mt">
        ${stat('Monthly Reward Budget', inr(s.budget), 'Set in Settings')}
        ${stat('Used', inr(state.stats.used), `<div class="progress" style="margin-top:6px"><div style="width:${usedPct}%"></div></div>`, 'amber')}
        ${stat('Remaining', inr(remaining), `${100 - usedPct}% of budget left`, 'ok')}
        ${stat('Rewards Issued', state.stats.issued, `${state.stats.blocked} blocked or rejected`)}
      </div>
      <div class="grid g-2 mt">
        <section class="card"><div class="card-head"><h2>Reward safety rules</h2></div><div class="card-body"><ol class="rule-list">${rules}</ol></div></section>
        <div class="stack">
          <section class="card"><div class="card-head"><div><h2>Waiting for owner approval</h2><p class="card-sub">${pend.length} pending</p></div></div><div class="card-body" style="padding-top:8px">${pendHtml}</div></section>
          <section class="card"><div class="card-head"><h2>Recent reward activity</h2></div><div class="table-wrap" style="margin-top:8px"><table><thead><tr><th>Ticket</th><th>Customer</th><th>Amount</th><th>Result</th><th>When</th></tr></thead><tbody>${logRows}</tbody></table></div></section>
        </div>
      </div>`;
  }

  /* ---- AI Rules ---- */
  function rulesPage() {
    const editing = ui.ruleEditId !== null;
    const examples = ['If customer mentions refund twice, then flag for abuse review.', 'If the message is in Tanglish, then reply in Tanglish.', 'If the order is delayed more than 5 days, then mark as High Priority.'];
    const cards = state.rules.length ? state.rules.map((r) => `
      <article class="card rule-card ${r.enabled ? '' : 'off'}">
        <div class="rule-text"><p>${esc(r.text)}</p><div class="rule-meta">${r.enabled ? '<span class="badge b-ok">Active</span>' : '<span class="badge b-muted">Disabled</span>'}<span class="small muted">Applied ${r.applied} times (demo)</span></div></div>
        <div class="row row-wrap">
          <button type="button" class="btn btn-sm" data-action="editRule" data-id="${r.id}">${icon('pencil', 14)} Edit</button>
          <button type="button" class="btn btn-sm" data-action="toggleRule" data-id="${r.id}">${icon('power', 14)} ${r.enabled ? 'Disable' : 'Enable'}</button>
          <button type="button" class="btn btn-sm btn-danger" data-action="deleteRule" data-id="${r.id}" aria-label="Delete rule">${icon('trash', 14)}</button>
        </div></article>`).join('') : `<div class="card">${emptyState('sparkles', 'No rules yet', 'Write your first rule in plain English above.')}</div>`;
    return `
      <div class="page-head"><div><h1>AI Rules</h1><p>Plain-English business rules the AI should follow.</p></div></div>
      <section class="card"><div class="card-body" style="padding-top:18px">
        <h2 style="font-size:18px;margin-bottom:4px">Teach ResolveAI Your Business Rules</h2>
        <p class="muted" style="margin-bottom:14px">Describe a rule the way you would explain it to a new team member. In this demo, rules are saved locally and are not evaluated by a real model.</p>
        <div class="field"><label for="rule-input">${editing ? 'Edit rule' : 'New rule'}</label>
          <textarea class="textarea" id="rule-input" rows="3" placeholder="Example: If customer mentions ______, then ______.">${esc(ui.ruleDraft)}</textarea>
          <div class="error-text" id="rule-error" role="alert"></div></div>
        <div class="row row-wrap"><button type="button" class="btn btn-primary" data-action="saveRule">${editing ? 'Update Rule' : 'Save Rule'}</button>${editing ? '<button type="button" class="btn" data-action="cancelRuleEdit">Cancel</button>' : ''}</div>
        <div class="chips" aria-label="Example rules">${examples.map((x) => `<button type="button" class="chip" data-action="useExample" data-text="${esc(x)}">${esc(x)}</button>`).join('')}</div>
      </div></section>
      <h2 style="font-size:15px;margin:22px 0 10px">Your rules (${state.rules.length})</h2>
      <div class="stack">${cards}</div>`;
  }

  /* ---- Analytics ---- */
  function analyticsPage() {
    const r = ui.analyticsRange;
    const vol = r === '7d' ? { v: [18, 24, 21, 29, 26, 15, 22], l: lastDays(7) } : { v: [126, 138, 119, 154], l: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'] };
    const res = r === '7d' ? { v: [7.2, 6.8, 6.5, 6.9, 6.1, 5.8, 6.4], l: lastDays(7) } : { v: [7.4, 6.9, 6.6, 6.4], l: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'] };
    const totals = r === '7d' ? 155 : 537;
    const metrics = [
      ['Total Tickets', String(totals), 'ticket'], ['Resolution Rate', '87%', 'checkCircle'], ['Avg Resolution Time', '6.4 h', 'clock'],
      ['Seller Fault Rate', '46%', 'alert'], ['Customer Fault Rate', '38%', 'user'], ['Reward Approval Rate', '71%', 'gift'], ['Abuse Detection Rate', '4.2%', 'shield']
    ].map(([label, value, ic]) => `<div class="card kpi"><div class="kpi-top">${label}<span class="kpi-ico">${icon(ic, 16)}</span></div><div class="kpi-value mono">${value}</div></div>`).join('');
    return `
      <div class="page-head"><div><h1>Analytics</h1><p>Sample figures for the demo workspace.</p></div>
        <div class="segmented" role="group" aria-label="Date range"><button type="button" class="${r === '7d' ? 'on' : ''}" data-action="setRange" data-range="7d" aria-pressed="${r === '7d'}">Last 7 days</button><button type="button" class="${r === '30d' ? 'on' : ''}" data-action="setRange" data-range="30d" aria-pressed="${r === '30d'}">Last 30 days</button></div></div>
      <div class="grid g-4">${metrics}</div>
      <div class="grid g-2 mt">
        <section class="card"><div class="card-head"><h2>Ticket volume</h2></div><div class="card-body">${barChart(vol.v, vol.l, 'Ticket volume')}</div></section>
        <section class="card"><div class="card-head"><h2>Average resolution time (hours)</h2></div><div class="card-body">${lineChart(res.v, res.l, 'Resolution time in hours', (v) => v.toFixed(1) + ' h')}</div></section>
        <section class="card"><div class="card-head"><h2>Fault distribution</h2></div><div class="card-body" style="padding-top:20px">${donutChart([{ label: 'Seller fault', value: 46, color: '#1b2f6b' }, { label: 'Customer fault', value: 38, color: '#60a5fa' }, { label: 'Needs review', value: 16, color: '#cbd5e1' }], 'Fault distribution')}</div></section>
        <section class="card"><div class="card-head"><h2>Rewards issued (₹ per month)</h2></div><div class="card-body">${barChart([2100, 2800, 3200, 2950, 3300, state.stats.used], lastMonths(6), 'Rewards per month', (v) => '₹' + v.toLocaleString('en-IN'))}</div></section>
      </div>`;
  }

  /* ---- Settings ---- */
  const SETTINGS_TABS = [['business', 'Business Profile'], ['teams', 'Teams'], ['rewards', 'Reward Settings'], ['ai', 'AI Settings'], ['language', 'Language Preferences'], ['notifications', 'Notification Settings']];
  function toggleRow(id, title, desc, checked, disabled, tip) {
    return `<div class="setting-row"><div><b>${title}</b><p>${desc}</p></div><label class="switch" ${tip ? `data-tip="${esc(tip)}"` : ''}><span class="sr-only">${title}</span><input type="checkbox" id="${id}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} /><i></i></label></div>`;
  }
  function settingsPage() {
    const s = state.settings;
    const nav = SETTINGS_TABS.map(([k, label]) => `<button type="button" class="filter-btn ${ui.settingsTab === k ? 'on' : ''}" data-action="settingsTab" data-tab="${k}">${label}</button>`).join('');
    const save = (kind) => `<div style="margin-top:14px"><button type="button" class="btn btn-primary" data-action="saveSettings" data-kind="${kind}">Save changes</button></div>`;
    let body = '';
    if (ui.settingsTab === 'business') {
      body = `<div class="form-grid"><div class="field"><label for="biz-name">Business name</label><input class="input" id="biz-name" value="${esc(s.business.name)}" /></div>
        <div class="field"><label for="biz-owner">Owner name</label><input class="input" id="biz-owner" value="${esc(s.business.owner)}" /></div>
        <div class="field"><label for="biz-email">Support email</label><input class="input" id="biz-email" type="email" value="${esc(s.business.email)}" /></div>
        <div class="field"><label for="biz-phone">Phone</label><input class="input" id="biz-phone" value="${esc(s.business.phone)}" /></div></div><div class="error-text" id="settings-error" role="alert"></div>${save('business')}`;
    } else if (ui.settingsTab === 'teams') {
      const lines = state.teams.map((t) => {
        const hasOpen = state.tickets.some((x) => x.team === t.name && isOpen(x));
        return `<div class="team-line"><div><b>${esc(t.name)}</b><div class="small muted">${t.members} members</div></div><button type="button" class="btn btn-sm btn-danger" data-action="removeTeam" data-name="${esc(t.name)}" ${hasOpen ? 'disabled data-tip="Reassign open tickets first"' : ''}>${icon('trash', 14)} Remove</button></div>`;
      }).join('');
      body = `${lines}<div class="row" style="margin-top:14px"><label class="sr-only" for="new-team">New team name</label><input class="input" id="new-team" placeholder="New team name" /><button type="button" class="btn btn-primary" data-action="addTeam">${icon('plus', 15)} Add team</button></div><div class="error-text" id="settings-error" role="alert"></div>`;
    } else if (ui.settingsTab === 'rewards') {
      body = `<div class="form-grid">
        <div class="field"><label for="set-max">Maximum reward per ticket</label><div class="input-prefix"><span>₹</span><input class="input" id="set-max" type="number" min="1" value="${s.maxReward}" /></div></div>
        <div class="field"><label for="set-budget">Monthly reward budget</label><div class="input-prefix"><span>₹</span><input class="input" id="set-budget" type="number" min="1" value="${s.budget}" /></div></div>
        <div class="field"><label for="set-threshold">Repeat complaint threshold</label><input class="input" id="set-threshold" type="number" min="1" value="${s.repeatThreshold}" /><span class="hint">Complaints per month before abuse review.</span></div>
        <div class="field"><label for="set-percust">Max rewards per customer / month</label><input class="input" id="set-percust" type="number" min="1" value="${s.perCustomerMonthly}" /></div></div>
        ${toggleRow('set-owner', 'Owner approval requirement', 'Every reward must be approved by the owner.', true, true, 'Always on: rewards can never be issued automatically.')}
        <div class="error-text" id="settings-error" role="alert"></div>${save('rewards')}`;
    } else if (ui.settingsTab === 'ai') {
      body = `${toggleRow('ai-auto', 'Auto-triage new tickets', 'Show Analyze Ticket results as soon as a ticket opens (demo toggle).', s.ai.autoTriage)}
        ${toggleRow('ai-reasons', 'Show AI reasons', 'Display the reason behind each AI decision.', s.ai.showReasons)}
        <div class="field" style="margin-top:14px"><label for="ai-conf">Minimum confidence for auto-routing: <b id="ai-conf-val">${s.ai.minConfidence}%</b></label><input type="range" id="ai-conf" min="50" max="99" value="${s.ai.minConfidence}" data-input="confLabel" /></div>
        <p class="hint">This workspace runs in demo mode: AI output is simulated locally.</p>${save('ai')}`;
    } else if (ui.settingsTab === 'language') {
      body = `${toggleRow('lang-en', 'English', 'Generate replies in English.', s.lang.en)}${toggleRow('lang-ta', 'Tamil', 'Generate replies in Tamil script.', s.lang.ta)}${toggleRow('lang-tg', 'Tanglish', 'Understand Tanglish tickets and reply in Tanglish.', s.lang.tg)}
        <div class="field" style="margin-top:14px;max-width:260px"><label for="lang-default">Default reply language</label><select class="select" id="lang-default">${Object.keys(LANGS).map((k) => `<option value="${k}" ${s.lang.defaultReply === k ? 'selected' : ''}>${LANGS[k]}</option>`).join('')}</select></div>${save('language')}`;
    } else {
      body = `${toggleRow('n-new', 'New ticket', 'Notify me when a new ticket arrives.', s.notify.newTicket)}${toggleRow('n-high', 'High priority tickets', 'Alert me for High and Critical tickets.', s.notify.highPriority)}${toggleRow('n-reward', 'Reward approvals', 'Alert me when a reward is waiting for approval.', s.notify.rewardPending)}${toggleRow('n-daily', 'Daily summary email', 'A morning digest of open tickets.', s.notify.daily)}${save('notifications')}`;
    }
    const title = (SETTINGS_TABS.find((x) => x[0] === ui.settingsTab) || [0, ''])[1];
    return `
      <div class="page-head"><div><h1>Settings</h1><p>Manage your workspace, rewards and AI preferences.</p></div></div>
      <div class="settings-layout"><nav class="card settings-nav" aria-label="Settings sections">${nav}</nav>
        <section class="card"><div class="card-head"><h2>${title}</h2></div><div class="card-body">${body}</div></section></div>`;
  }

  /* ======================================================================
   * Router & render
   * ==================================================================== */
  function getRoute() {
    const parts = (location.hash.slice(1) || '/').split('/').filter(Boolean);
    return { name: parts[0] || '', id: parts[1] ? decodeURIComponent(parts[1]) : '' };
  }
  const PAGES = { dashboard: dashboardPage, tickets: ticketsPage, teams: teamsPage, rewards: rewardsPage, rules: rulesPage, analytics: analyticsPage, settings: settingsPage };

  function isAuthed() {
    try { return !!(sessionStorage.getItem('resolveai_auth') || localStorage.getItem('resolveai_auth')); } catch (e) { return window.__resolveaiAuth === true; }
  }
  function setAuth(on, remember) {
    window.__resolveaiAuth = on;
    try {
      sessionStorage.removeItem('resolveai_auth'); localStorage.removeItem('resolveai_auth');
      if (on) (remember ? localStorage : sessionStorage).setItem('resolveai_auth', '1');
    } catch (e) { /* storage unavailable: in-memory flag is used */ }
  }

  function render() {
    const r = getRoute();
    const root = $('#root');
    if (!isAuthed() && r.name !== 'login') { location.hash = '#/login'; return; }
    if (isAuthed() && (r.name === 'login' || r.name === '')) { location.hash = '#/dashboard'; return; }
    if (r.name === 'login') { root.innerHTML = loginPage(); document.title = 'Log in · ResolveAI'; return; }
    let content;
    if (r.name === 'tickets' && r.id) content = ticketDetailPage(r.id);
    else if (PAGES[r.name]) content = PAGES[r.name]();
    else content = `<div class="card">${emptyState('info', 'Page not found', 'The page you are looking for does not exist.', '<a class="btn" href="#/dashboard">Back to dashboard</a>')}</div>`;
    root.innerHTML = shell(PAGES[r.name] || r.name === 'tickets' ? r.name : '', content);
    const label = (NAV.find((n) => n[0] === r.name) || [0, 'ResolveAI'])[1];
    document.title = (r.id ? r.id + ' · ' : '') + label + ' · ResolveAI';
  }

  function onRouteChange() {
    const key = location.hash;
    ui.sidebarOpen = false;
    ui.editingReply = null;
    closeModal(true);
    render();
    if (key !== lastRouteKey) { window.scrollTo(0, 0); lastRouteKey = key; }
  }

  /* ======================================================================
   * Actions
   * ==================================================================== */
  function closeMenus() { $$('.menu').forEach((m) => { m.hidden = true; }); }

  function updateTicket(t, patch) { Object.assign(t, patch, { updatedAt: Date.now() }); }

  function doAdvance(t) {
    const next = nextStatus(t);
    if (!next) return;
    const rs = rewardState(t).key;
    if (next === 'Closed' && (rs === 'waiting' || rs === 'approved')) {
      toast(rs === 'waiting' ? 'Review the reward before closing this ticket.' : 'Issue the approved coupon before closing.', 'error');
      return;
    }
    if (next === 'Assigned' && !t.team) { toast('Assign a team first.', 'error'); return; }
    updateTicket(t, { status: next });
    log(`${t.id} moved to ${next}`);
    toast(`Ticket moved to ${next}.`);
    if (next === 'Customer Confirmed' && gate(t).eligible && t.reward.status === 'none') {
      t.reward.status = 'waiting';
      toast('Reward gate unlocked. Owner review required.', 'info');
    }
  }

  function rewardModal(t) {
    const g = gate(t);
    const s = state.settings;
    const passed = (ok) => pill(ok ? 'PASSED' : 'FAILED', ok ? 'ok' : 'no');
    openModal({
      title: 'Reward Review', wide: true,
      body: `<dl class="kv">
        <div><dt>Customer</dt><dd>${esc(t.customer)}</dd></div>
        <div><dt>Reason</dt><dd>${esc(t.rewardReason)}</dd></div>
        <div><dt>Suggested Reward</dt><dd>${inr(t.rewardAmount)} coupon</dd></div>
        <div><dt>Reward limit</dt><dd>${inr(s.maxReward)} maximum per ticket ${passed(g.capOk)}</dd></div>
        <div><dt>Monthly usage</dt><dd>${inr(state.stats.used)} / ${inr(s.budget)} ${passed(g.budgetOk)}</dd></div>
        <div><dt>Abuse check</dt><dd>${passed(g.abuseOk && g.monthlyOk)}</dd></div>
        <div><dt>Customer confirmation</dt><dd>${passed(g.confirmed)}</dd></div>
        <div><dt>Owner approval</dt><dd>${pill('REQUIRED', 'wait')}</dd></div></dl>
        <p class="hint" style="margin-top:12px">Approving does not send anything yet; you issue the coupon in the next step.</p>`,
      actions: [
        { label: 'Reject Reward', action: 'rejectReward', cls: 'btn-danger', attrs: `data-id="${esc(t.id)}"` },
        { label: 'Approve Reward', action: 'approveReward', cls: 'btn-primary', attrs: `data-id="${esc(t.id)}" ${g.eligible ? '' : 'disabled'}` }
      ]
    });
  }

  function newTicketModal() {
    openModal({
      title: 'New ticket',
      body: `<p class="muted small" style="margin-bottom:12px">Simulates a customer submitting a ticket. Language is detected automatically (demo).</p>
        <div class="field"><label for="nt-name">Customer name</label><input class="input" id="nt-name" placeholder="e.g. Kavitha M" /></div>
        <div class="field"><label for="nt-msg">Customer message</label><textarea class="textarea" id="nt-msg" rows="4" placeholder="e.g. Bro order late aagudhu, please update pannunga."></textarea></div>
        <div class="error-text" id="nt-error" role="alert"></div>`,
      actions: [{ label: 'Cancel', action: 'closeModal' }, { label: 'Create ticket', action: 'createTicket', cls: 'btn-primary' }]
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy failed'));
      } catch (e) { reject(e); }
    });
  }

  const A = {
    openSidebar() { ui.sidebarOpen = true; $('#sidebar').classList.add('open'); $('.scrim').classList.add('open'); },
    closeSidebar() { ui.sidebarOpen = false; $('#sidebar').classList.remove('open'); $('.scrim').classList.remove('open'); },
    toggleMenu(el) {
      const menu = $('#menu-' + el.dataset.menu);
      const willOpen = menu.hidden;
      closeMenus();
      menu.hidden = !willOpen;
    },
    logout() { setAuth(false); toast('You have been logged out.', 'info'); location.hash = '#/login'; },
    forgotPassword(el, ev) { ev.preventDefault(); toast('Demo only: a reset link would be emailed here.', 'info'); },
    demoLogin() {
      $('#login-email').value = 'demo@resolveai.app'; $('#login-password').value = 'demo1234';
      submitLogin();
    },
    overlayClick(el, ev) { if (ev.target === el) closeModal(); },
    closeModal() { closeModal(); },
    modalConfirm(el) {
      const fn = modalState && modalState.onConfirm;
      const delay = modalState ? modalState.delay : 0;
      if (!fn) { closeModal(); return; }
      if (delay) {
        el.disabled = true; el.innerHTML = '<span class="spinner"></span> Working...';
        setTimeout(() => { closeModal(true); fn(); }, delay);
      } else { closeModal(); fn(); }
    },

    /* tickets */
    setFilter(el) { ui.filter = el.dataset.filter; ui.page = 1; render(); },
    goPage(el) { const p = parseInt(el.dataset.page, 10); if (p >= 1) { ui.page = p; $('#ticket-list').innerHTML = ticketListInner(); } },
    newTicket() { newTicketModal(); },
    createTicket() {
      const name = $('#nt-name').value.trim(); const msg = $('#nt-msg').value.trim(); const err = $('#nt-error');
      if (name.length < 2) { err.textContent = 'Enter the customer name.'; return; }
      if (msg.length < 10) { err.textContent = 'Enter a message of at least 10 characters.'; return; }
      const nextNum = Math.max.apply(null, state.tickets.map((t) => parseInt(t.id.split('-')[1], 10))) + 1;
      const t = seedTicket({ analyzed: false, base: { id: 'TKT-' + nextNum, customer: name, message: msg, language: detectLanguage(msg), subject: msg.length > 60 ? msg.slice(0, 57) + '...' : msg, createdMins: 0, updatedMins: 0 } });
      t.createdAt = Date.now(); t.updatedAt = t.createdAt;
      state.tickets.unshift(t);
      log(`${t.id} opened by ${name}`);
      closeModal(true);
      toast(`Ticket ${t.id} created.`);
      location.hash = '#/tickets/' + t.id;
    },
    analyze(el) {
      const t = findTicket(el.dataset.id);
      if (!t || ui.analyzing[t.id] !== undefined) return;
      AIService.analyze(t, (step) => { ui.analyzing[t.id] = step; if (getRoute().id === t.id) render(); }).then((result) => {
        delete ui.analyzing[t.id];
        applyAnalysis(t, result);
        updateTicket(t, {});
        log(`${t.id} analyzed: ${t.priority} priority, ${t.team}`);
        toast('Analysis complete (simulated).');
        render();
      });
    },
    applySteps(el) {
      const t = findTicket(el.dataset.id);
      if (!t || t.stepsApplied) return;
      if (!t.team) { toast('Assign a team before applying steps.', 'error'); return; }
      const patch = { stepsApplied: true };
      if (stageIndex(t) < 2) patch.status = 'In Progress';
      updateTicket(t, patch);
      log(`${t.id} resolution steps applied`);
      toast('Resolution steps applied.');
      render();
    },
    advance(el) {
      const t = findTicket(el.dataset.id);
      if (!t) return;
      const next = nextStatus(t);
      if (!next) return;
      const rs = rewardState(t).key;
      if (next === 'Closed' && (rs === 'waiting' || rs === 'approved')) { doAdvance(t); return; }
      if (next === 'Assigned' && !t.team) { toast('Assign a team first.', 'error'); return; }
      if (next === 'Closed') {
        confirmModal({ title: 'Close this ticket?', message: `Ticket <b>${esc(t.id)}</b> will be marked Closed. Replies are disabled after closing.`, confirmLabel: 'Close ticket', onConfirm: () => { doAdvance(t); render(); } });
      } else { doAdvance(t); render(); }
    },
    setReplyLang(el) { ui.replyLang[el.dataset.id] = el.dataset.lang; ui.editingReply = null; render(); },
    copyReply(el) {
      const t = findTicket(el.dataset.id); const lang = ui.replyLang[t.id] || langKey(t.language);
      copyText(t.replies[lang] || '').then(() => toast('Reply copied to clipboard.')).catch(() => toast('Could not copy. Select the text and copy manually.', 'error'));
    },
    editReply(el) { const t = findTicket(el.dataset.id); ui.editingReply = t.id + ':' + (ui.replyLang[t.id] || langKey(t.language)); render(); const ta = $('#reply-edit'); if (ta) ta.focus(); },
    cancelReply() { ui.editingReply = null; render(); },
    saveReply(el) {
      const t = findTicket(el.dataset.id); const lang = ui.replyLang[t.id] || langKey(t.language);
      const val = $('#reply-edit').value.trim();
      if (!val) { toast('The reply cannot be empty.', 'error'); return; }
      t.replies[lang] = val; ui.editingReply = null; toast('Reply updated.'); render();
    },
    sendReply(el) {
      const t = findTicket(el.dataset.id); const lang = ui.replyLang[t.id] || langKey(t.language);
      confirmModal({
        title: 'Send reply?', message: `Send the ${LANGS[lang]} reply to <b>${esc(t.customer)}</b>?`, confirmLabel: 'Send reply', delay: 700,
        onConfirm: () => { updateTicket(t, { replySent: true }); log(`Reply sent on ${t.id}`); toast(`Reply sent to ${t.customer} (simulated).`); render(); }
      });
    },
    reviewReward(el) {
      const t = findTicket(el.dataset.id);
      if (!t) return;
      if (rewardState(t).key !== 'waiting') { toast('This ticket is not ready for reward review.', 'error'); return; }
      rewardModal(t);
    },
    approveReward(el) {
      const t = findTicket(el.dataset.id);
      if (!t || !gate(t).eligible || t.reward.status === 'approved') return;
      t.reward.status = 'approved'; t.monthlyRewards += 1; state.stats.used += t.rewardAmount; updateTicket(t, {});
      state.rewardLog.unshift({ ticket: t.id, customer: t.customer, amount: t.rewardAmount, status: 'Approved', ts: Date.now() });
      log(`Reward approved for ${t.id}`);
      closeModal(true);
      toast(`Reward approved: ${inr(t.rewardAmount)} coupon.`);
      render();
    },
    rejectReward(el) {
      const t = findTicket(el.dataset.id);
      if (!t) return;
      t.reward.status = 'rejected'; state.stats.blocked += 1; updateTicket(t, {});
      state.rewardLog.unshift({ ticket: t.id, customer: t.customer, amount: t.rewardAmount, status: 'Rejected', ts: Date.now() });
      log(`Reward rejected for ${t.id}`);
      closeModal(true);
      toast('Reward rejected.', 'info');
      render();
    },
    issueReward(el) {
      const t = findTicket(el.dataset.id);
      if (!t || t.reward.status !== 'approved') return;
      t.reward.status = 'issued'; state.stats.issued += 1; state.stats.issuedToday += 1; updateTicket(t, {});
      const entry = state.rewardLog.find((r) => r.ticket === t.id && r.status === 'Approved');
      if (entry) entry.status = 'Issued';
      log(`Coupon issued for ${t.id}`);
      toast(`${inr(t.rewardAmount)} coupon issued to ${t.customer}.`);
      render();
    },

    /* teams */
    quickAssign() {
      const t = findTicket($('#assign-ticket').value); const team = $('#assign-team-select').value;
      if (!t || !team) return;
      assignTeam(t, team); render();
    },

    /* rules */
    saveRule() {
      const text = $('#rule-input').value.trim(); const err = $('#rule-error');
      if (text.length < 15) { err.textContent = 'Describe the rule in a full sentence (at least 15 characters).'; return; }
      if (!/\bif\b/i.test(text)) { err.textContent = 'Start with "If ... then ..." so the rule is clear.'; return; }
      if (ui.ruleEditId !== null) {
        const r = state.rules.find((x) => x.id === ui.ruleEditId); if (r) r.text = text;
        toast('Rule updated.');
      } else {
        state.rules.unshift({ id: state.nextRuleId++, text, enabled: true, applied: 0 });
        toast('Rule saved.');
      }
      ui.ruleDraft = ''; ui.ruleEditId = null; render();
    },
    editRule(el) { const r = state.rules.find((x) => x.id === parseInt(el.dataset.id, 10)); if (!r) return; ui.ruleEditId = r.id; ui.ruleDraft = r.text; render(); const ta = $('#rule-input'); if (ta) { ta.focus(); ta.scrollIntoView({ block: 'center' }); } },
    cancelRuleEdit() { ui.ruleEditId = null; ui.ruleDraft = ''; render(); },
    useExample(el) { ui.ruleDraft = el.dataset.text; render(); const ta = $('#rule-input'); if (ta) ta.focus(); },
    toggleRule(el) { const r = state.rules.find((x) => x.id === parseInt(el.dataset.id, 10)); if (!r) return; r.enabled = !r.enabled; toast(r.enabled ? 'Rule enabled.' : 'Rule disabled.', 'info'); render(); },
    deleteRule(el) {
      const id = parseInt(el.dataset.id, 10);
      confirmModal({ title: 'Delete this rule?', message: 'This rule will be removed permanently.', confirmLabel: 'Delete', danger: true, onConfirm: () => { state.rules = state.rules.filter((x) => x.id !== id); if (ui.ruleEditId === id) { ui.ruleEditId = null; ui.ruleDraft = ''; } toast('Rule deleted.', 'info'); render(); } });
    },

    /* analytics & settings */
    setRange(el) { ui.analyticsRange = el.dataset.range; render(); },
    settingsTab(el) { ui.settingsTab = el.dataset.tab; render(); },
    addTeam() {
      const input = $('#new-team'); const name = input.value.trim(); const err = $('#settings-error');
      if (name.length < 3) { err.textContent = 'Team name must be at least 3 characters.'; return; }
      if (state.teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) { err.textContent = 'A team with this name already exists.'; return; }
      state.teams.push({ name, members: 1, baseResolved: 0, avg: '—' });
      toast(`Team "${name}" added.`); render();
    },
    removeTeam(el) {
      const name = el.dataset.name;
      confirmModal({ title: 'Remove team?', message: `Remove <b>${esc(name)}</b>? Resolved tickets will keep their team name.`, confirmLabel: 'Remove', danger: true, onConfirm: () => { state.teams = state.teams.filter((t) => t.name !== name); toast('Team removed.', 'info'); render(); } });
    },
    saveSettings(el) {
      const s = state.settings; const kind = el.dataset.kind; const err = $('#settings-error');
      const num = (id) => Number($('#' + id).value);
      if (kind === 'business') {
        const name = $('#biz-name').value.trim(); const email = $('#biz-email').value.trim();
        if (!name) { err.textContent = 'Business name is required.'; return; }
        if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = 'Enter a valid support email.'; return; }
        s.business = { name, email, owner: $('#biz-owner').value.trim() || s.business.owner, phone: $('#biz-phone').value.trim() };
      } else if (kind === 'rewards') {
        const max = num('set-max'), budget = num('set-budget'), th = num('set-threshold'), per = num('set-percust');
        if (![max, budget, th, per].every((n) => Number.isFinite(n) && n >= 1)) { err.textContent = 'All values must be numbers of 1 or more.'; return; }
        if (!Number.isInteger(th) || !Number.isInteger(per)) { err.textContent = 'Threshold and monthly limit must be whole numbers.'; return; }
        if (max > budget) { err.textContent = 'Maximum reward cannot be higher than the monthly budget.'; return; }
        Object.assign(s, { maxReward: max, budget, repeatThreshold: th, perCustomerMonthly: per, ownerApproval: true });
      } else if (kind === 'ai') {
        s.ai = { autoTriage: $('#ai-auto').checked, showReasons: $('#ai-reasons').checked, minConfidence: num('ai-conf') };
      } else if (kind === 'language') {
        s.lang = { en: $('#lang-en').checked, ta: $('#lang-ta').checked, tg: $('#lang-tg').checked, defaultReply: $('#lang-default').value };
      } else if (kind === 'notifications') {
        s.notify = { newTicket: $('#n-new').checked, highPriority: $('#n-high').checked, rewardPending: $('#n-reward').checked, daily: $('#n-daily').checked };
      }
      toast('Settings saved.'); render();
    }
  };

  function assignTeam(t, team) {
    const patch = { team };
    if (t.status === 'New' && team) patch.status = 'Assigned';
    updateTicket(t, patch);
    log(team ? `${t.id} assigned to ${team}` : `${t.id} unassigned`);
    toast(team ? `${t.id} assigned to ${team}.` : `${t.id} is now unassigned.`);
  }

  const CHANGE = {
    assignTeam(el) { const t = findTicket(el.dataset.id); if (t) { assignTeam(t, el.value); render(); } }
  };

  function submitLogin() {
    const email = $('#login-email').value.trim(); const pw = $('#login-password').value; const err = $('#login-error');
    if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = 'Enter a valid email address.'; return; }
    if (!pw) { err.textContent = 'Enter your password.'; return; }
    err.textContent = '';
    const btn = $('#login-btn'); btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Signing in...';
    const remember = $('#login-remember').checked;
    setTimeout(() => { setAuth(true, remember); location.hash = '#/dashboard'; if (location.hash === '#/dashboard') render(); }, 600);
  }

  /* ======================================================================
   * Global event wiring
   * ==================================================================== */
  document.addEventListener('click', (e) => {
    const actEl = e.target.closest('[data-action]');
    if (actEl) {
      if (actEl.disabled || actEl.getAttribute('aria-disabled') === 'true') return;
      const name = actEl.dataset.action;
      if (name !== 'toggleMenu') closeMenus();
      if (A[name]) A[name](actEl, e);
      return;
    }
    const row = e.target.closest('[data-href]');
    if (row && !e.target.closest('a, button, input, select, textarea')) { location.hash = row.dataset.href; return; }
    if (!e.target.closest('.menu-wrap')) closeMenus();
  });

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'login-form') { e.preventDefault(); submitLogin(); }
  });

  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.id === 'ticket-search') { ui.search = el.value; ui.page = 1; $('#ticket-list').innerHTML = ticketListInner(); }
    else if (el.id === 'rule-input') { ui.ruleDraft = el.value; }
    else if (el.id === 'ai-conf') { $('#ai-conf-val').textContent = el.value + '%'; }
  });

  document.addEventListener('change', (e) => {
    const fn = e.target.dataset && e.target.dataset.change;
    if (fn && CHANGE[fn]) CHANGE[fn](e.target);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalState) closeModal();
      closeMenus();
      if (ui.sidebarOpen && $('#sidebar')) A.closeSidebar();
    }
    if (e.key === 'Tab' && modalState) {
      const focusables = $$('#modal-root button:not([disabled]), #modal-root input, #modal-root textarea, #modal-root select');
      if (!focusables.length) return;
      const first = focusables[0]; const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.addEventListener('hashchange', onRouteChange);
  onRouteChange();
})();
