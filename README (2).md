# ResolveAI

AI-assisted customer support ticket management for small and medium sellers. **Frontend demo: all AI results are simulated with mock data.**

## Problem
Small sellers often struggle to manually classify, route and resolve customer support tickets.

## Solution
ResolveAI combines ticket triage, fault detection, resolution guidance, multilingual/Tanglish support and a controlled reward workflow.

## Core Innovation
**Fault Check → Reward Gate.** A complaint alone never earns a reward. A reward is released only when:
1. AI identifies the seller as responsible
2. The ticket is actually resolved
3. The customer confirms the resolution
4. The customer is within the abuse and monthly limits
5. The business owner approves

## Features
- AI ticket prioritization and automatic team routing (simulated)
- AI resolution suggestions and reply drafting in English, Tamil and Tanglish
- Seller / customer fault detection with confidence
- Ticket lifecycle tracking and end-to-end workflow strip
- Capped, abuse-safe, owner-approved rewards
- Plain-English AI rules
- Analytics dashboard, teams, settings

## Run locally
No build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

Demo login: click **Use demo login**. Data lives in memory and resets on refresh.

## Files
- `index.html` – page shell
- `style.css` – design system and responsive layout
- `script.js` – router, mock data, mock `AIService`, pages and actions

## Connecting a real backend later
Replace `AIService.analyze()` in `script.js` with an API call returning the same shape as `classify()`.

## Future scope
Real LLM integration, backend API and database, authentication, WhatsApp and email integration, real-time notifications, seller platform integrations.
