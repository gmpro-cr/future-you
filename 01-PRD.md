# Product Requirements Document (PRD)
## Future You - India Edition

**Version:** 1.0
**Last Updated:** October 21, 2025
**Document Owner:** Product Team
**Status:** Ready for Development

---

## Executive Summary

**Future You** is a web-based conversational AI platform (website) designed for Indian users to explore personal growth through reflective conversations with simulated versions of their future selves. Accessible through any web browser on desktop or mobile devices, users can engage with different persona archetypes to gain perspective on life decisions, career paths, and personal development through empathetic AI-driven dialogue.

### Vision Statement
To empower individuals across India to explore their potential futures, make informed life decisions, and gain clarity on their personal journey through meaningful conversations with their aspirational selves.

### Success Metrics
- **User Engagement:** Average 3+ conversations per user per week
- **Session Duration:** 8-12 minutes average per session
- **User Retention:** 40% D7 retention, 25% D30 retention
- **Persona Diversity:** Users engage with at least 2 different personas
- **User Satisfaction:** NPS score of 50+

---

## Problem Statement

### User Pain Points
1. **Decision Paralysis:** Young professionals and students struggle with career and life decisions without guidance
2. **Lack of Mentorship:** Limited access to role models who've achieved specific life goals
3. **Perspective Gap:** Difficulty visualizing long-term consequences of current choices
4. **Isolation:** Need for reflective conversation without judgment or social pressure
5. **Cultural Context:** Generic self-help tools don't address India-specific aspirations (IAS, entrepreneurship, family balance)

### Target Audience

**Primary Users:**
- Age: 18-35 years
- Geography: Urban India (Tier 1 & Tier 2 cities)
- Education: College students to working professionals
- Tech-savvy with computer/laptop/smartphone and internet access
- English proficient (with plans for vernacular expansion)
- Comfortable using web browsers (Chrome, Safari, Firefox)

**User Segments:**
1. **Career Explorers** (40%): Students and early professionals exploring career paths
2. **Aspiring Entrepreneurs** (25%): Individuals considering or building startups
3. **Life Balancers** (20%): Professionals seeking work-life harmony
4. **Self-Development Seekers** (15%): Users focused on mindfulness and personal growth

---

## Product Overview

### Core Value Proposition
**"Talk to the person you want to become — get guidance from your future self."**

### Key Differentiators
1. **India-Specific Personas:** Includes culturally relevant archetypes (IAS Officer, Balanced)
2. **Conversational Depth:** Character.AI-style engagement with persistent context
3. **First-Person Perspective:** Personas speak as "future you," creating personal connection
4. **Persona Diversity:** 7 distinct life paths to explore
5. **Privacy-First:** No social features; purely personal reflection tool
6. **Browser-Based:** No app download required; instant access from any device with a browser

---

## Feature Requirements

### 1. Home Page (Landing Experience)

**Priority:** P0 (Must Have)

**User Story:**
*As a first-time visitor, I want to understand what the app offers and feel motivated to start, so I can quickly begin exploring my future self.*

**Requirements:**

**Functional:**
- Display hero section with tagline: "Talk to your Future Self"
- Single prominent CTA button: "Start Your Journey"
- Brief explanation (2-3 lines) of app purpose
- Smooth page transitions using Framer Motion
- Mobile-responsive layout

**Design Specifications:**
- Gradient background: Teal (#00BFA6) to Deep Indigo (#3B82F6)
- Typography: Poppins or Inter font family
- CTA button: 48px height, rounded-xl, white text on teal background
- Subtle floating animation on hero elements (2-3 second loop)
- Minimum touch target: 44x44px for mobile browsers
- Responsive design optimized for desktop (1920px), tablet (768px), and mobile (375px) browsers

**Acceptance Criteria:**
- [ ] Page loads in under 2 seconds on 4G connection
- [ ] CTA button is immediately visible without scrolling on all screen sizes
- [ ] Animation runs smoothly at 60fps in modern browsers
- [ ] Layout adapts seamlessly on mobile browsers (320px width minimum)
- [ ] All text is readable with WCAG AA contrast ratio
- [ ] Works across Chrome, Safari, Firefox, and Edge (latest versions)

---

### 2. Persona Setup Page

**Priority:** P0 (Must Have)

**User Story:**
*As a new user, I want to choose or describe my ideal future self, so the AI can tailor conversations to my aspirations.*

**Requirements:**

**Functional:**
- Display 7 predefined persona cards in grid layout
- Each card shows: Name, emoji/icon, 1-line description
- Alternative: Free-text input field (150-300 characters) for custom persona
- "Continue" button becomes active after selection
- Save selected persona to localStorage (MVP) or Supabase (future)
- Back button to return to home page

**Persona Definitions:**

| Persona | Emoji | Description | Tone |
|---------|-------|-------------|------|
| **Entrepreneur** | 🚀 | Built a successful startup; reflects on risk and resilience | Bold, confident, practical |
| **Mindful** | 🧘 | Achieved balance and calm after years of chaos | Peaceful, patient, grounded |
| **Visionary** | 🔭 | Reached the top of your field through clarity and focus | Strategic, wise, composed |
| **Creative** | 🎨 | The artist, writer, or dreamer you became | Imaginative, encouraging, empathetic |
| **Wealthy** | 💰 | Achieved financial independence through discipline | Pragmatic, reassuring, realistic |
| **IAS Officer** | 🇮🇳 | Embodies purpose, discipline, and service | Calm, inspiring, principled |
| **Balanced** | ⚖️ | Harmony between ambition and peace — your ideal self | Gentle, reflective, insightful |

**Design Specifications:**
- Grid: 2 columns on mobile, 3-4 on desktop
- Card size: 280x180px minimum
- Hover effect: Slight scale (1.05) + shadow elevation
- Selected state: Teal border (3px) + subtle background tint
- Custom persona input: Multi-line text area, 300 character limit with counter

**Acceptance Criteria:**
- [ ] User can select exactly one predefined persona
- [ ] OR user can write custom persona description
- [ ] Selected persona is highlighted visually
- [ ] "Continue" button is disabled until selection is made
- [ ] Persona data persists through browser session
- [ ] Character counter updates in real-time for custom input
- [ ] Touch interactions work smoothly on mobile browsers

---

### 3. Chat Interface

**Priority:** P0 (Must Have)

**User Story:**
*As a user, I want to have a natural conversation with my chosen persona that feels personal and insightful, so I can gain perspective on my life decisions.*

**Requirements:**

**Layout Structure:**

**Left Panel (Sidebar - Desktop Only):**
- Persona avatar/emoji (large, 80x80px)
- Persona name (24px, bold)
- Short bio (2-3 sentences)
- "New Chat" button
- "Change Persona" button
- Conversation count badge (optional)

**Right Panel (Main Chat Area):**
- Message thread container (scrollable)
- Messages alternate left (user) and right (persona)
- Each message shows timestamp (if >5 min gap)
- Auto-scroll to bottom on new message
- Typing indicator animation when AI is responding

**Input Area (Bottom):**
- Multi-line text input (auto-expands up to 4 lines)
- Send button (disabled when empty or loading)
- Character limit: 500 characters
- "Shift + Enter" for new line, "Enter" to send

**Functional Requirements:**
- Messages sent to `/api/chat` endpoint with persona context
- AI response streams in (typing effect) or appears in full
- Messages persist in current session (localStorage)
- Smooth scroll animation when navigating history
- Error handling with retry option if API fails
- Loading state with animated ellipsis or spinner

**Message Styling:**
- User messages: White background, dark text, right-aligned
- Persona messages: Teal/indigo gradient background, white text, left-aligned
- Border radius: 16px
- Padding: 12px 16px
- Max width: 70% of container
- Tail/pointer optional (like iMessage)

**Animations:**
- Message fade-in (0.3s ease)
- Typing indicator: Three bouncing dots
- Send button: Pulse effect on hover
- Scroll indicator if new messages below fold

**Acceptance Criteria:**
- [ ] Messages render within 100ms of API response
- [ ] Typing indicator appears immediately after send
- [ ] Chat history scrolls smoothly (no jank)
- [ ] Input field clears after successful send
- [ ] Long messages wrap properly without overflow
- [ ] Mobile browser keyboard doesn't obscure input field (viewport adjusts)
- [ ] "New Chat" clears history with confirmation dialog
- [ ] Change persona navigates to setup page with warning if mid-conversation
- [ ] Works seamlessly in both desktop and mobile web browsers

---

### 4. API Integration (Backend)

**Priority:** P0 (Must Have)

**Endpoint Specification:**

**POST /api/chat**

**Request Body:**
```json
{
  "persona": "Entrepreneur",
  "personaDescription": "Optional custom description",
  "message": "I'm scared to take risks in my career",
  "conversationHistory": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ]
}
```

**Response Body:**
```json
{
  "response": "I remember that fear — it was paralyzing...",
  "personaContext": "Entrepreneur",
  "timestamp": "2025-10-21T10:30:00Z"
}
```

**Error Response:**
```json
{
  "error": "API rate limit exceeded",
  "code": "RATE_LIMIT_ERROR",
  "retryAfter": 60
}
```

**Technical Requirements:**
- **Framework:** Next.js API Routes (preferred) or Node.js + Express
- **LLM:** OpenAI GPT-4 or GPT-4-turbo
- **Rate Limiting:** 50 requests per user per hour
- **Timeout:** 30 seconds maximum
- **Response Validation:** Check for appropriate content
- **Conversation Context:** Include last 10 messages for continuity
- **Persona System Prompts:** Stored in `/prompts/` directory
- **Environment Variables:**
  - `OPENAI_API_KEY` (required)
  - `SUPABASE_URL` (optional)
  - `SUPABASE_KEY` (optional)

**Persona Prompt Templates:**

Each persona requires a system prompt that sets tone and personality:

```javascript
// Example: Entrepreneur Persona
const ENTREPRENEUR_PROMPT = `You are the user's future self who successfully built a thriving startup.
You remember the struggles, the fear of failure, and the small wins that built confidence.

Speak in first person as "I" (meaning the user's future self).
Reference specific memories of overcoming challenges.
Be bold but empathetic — you understand the fear because you lived it.
Offer practical advice grounded in real experiences.
Avoid generic motivational quotes.

Tone: Confident, pragmatic, slightly intense but caring.
Example: "I remember that exact moment of doubt. What changed for me was..."`;
```

**Acceptance Criteria:**
- [ ] API responds within 5 seconds for 95% of requests
- [ ] Persona-specific responses match defined tone
- [ ] Conversation context maintained across messages
- [ ] Graceful degradation if OpenAI API is down
- [ ] No PII logged or stored in plaintext
- [ ] Rate limiting prevents abuse

---

### 5. Styling & Design System

**Priority:** P0 (Must Have)

**Technology Stack:**
- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS 3.x
- **Animations:** Framer Motion
- **Icons:** Lucide React or Heroicons

**Color Palette:**

| Use Case | Color | Hex |
|----------|-------|-----|
| Primary | Teal | #00BFA6 |
| Secondary | Indigo | #3B82F6 |
| Background | Off-White | #F9FAFB |
| Text Primary | Dark Gray | #111827 |
| Text Secondary | Medium Gray | #6B7280 |
| Error | Red | #EF4444 |
| Success | Green | #10B981 |

**Typography:**
- **Font Family:** Poppins (headings) + Inter (body)
- **Sizes:**
  - H1: 48px (mobile: 32px)
  - H2: 36px (mobile: 24px)
  - Body: 16px
  - Small: 14px
  - Caption: 12px
- **Weights:** Regular (400), Medium (500), Semibold (600), Bold (700)

**Spacing System:**
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px

**Component Standards:**
- Border radius: 8px (small), 12px (medium), 16px (large)
- Shadows: Tailwind default elevation system
- Transitions: 200-300ms ease-in-out
- Focus states: 2px teal outline with offset

**Responsive Breakpoints:**
```javascript
{
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px'
}
```

**Acceptance Criteria:**
- [ ] Design system documented in Storybook or Figma
- [ ] All components use design tokens (no hardcoded values)
- [ ] Color contrast meets WCAG AA standards
- [ ] Mobile-first responsive design
- [ ] Dark mode prepared (optional for MVP)

---

## User Flows

### Flow 1: First-Time User Journey
1. User lands on website home page (futureyou.in)
2. Clicks "Start Your Journey"
3. Views persona selection grid
4. Selects "Entrepreneur" persona (or writes custom)
5. Clicks "Continue"
6. Arrives at chat interface with welcome message
7. Types first message: "Should I quit my job to start a business?"
8. Receives thoughtful response from Entrepreneur persona
9. Continues conversation (3-5 exchanges)
10. Closes browser tab (session saved in browser localStorage)

### Flow 2: Returning User Journey
1. User returns to website URL
2. Automatically redirected to last active chat (if browser session exists)
3. Continues previous conversation OR clicks "New Chat"
4. If "New Chat": Option to keep current persona or change
5. Engages with different persona to compare perspectives

### Flow 3: Persona Exploration
1. User mid-conversation with "Mindful" persona
2. Clicks "Change Persona" in sidebar
3. Confirmation modal: "Switch persona? Current chat will be saved."
4. Returns to persona selection
5. Selects "Entrepreneur" persona
6. Starts fresh conversation with new context

---

## Future Enhancements (Post-MVP)

### Phase 2 Features (Q2 2026)

**1. Multilingual Support**
- **Priority:** High
- **Description:** Add Hindi, Marathi, Tamil, Telugu translations
- **Implementation:** i18next library + translated persona prompts
- **Impact:** Expand user base to 150M+ non-English speakers

**2. Voice Interaction**
- **Priority:** Medium
- **Description:** Speak to personas using browser's Web Speech API
- **Implementation:** Browser-native speech-to-text + text-to-speech (Chrome, Safari, Edge)
- **Impact:** Accessibility + hands-free reflection for users on desktop and mobile browsers

**3. Conversation Export**
- **Priority:** Medium
- **Description:** Download chat history as PDF or text file
- **Implementation:** jsPDF library with branded template
- **Impact:** Enable offline journaling and review

### Phase 3 Features (Q3-Q4 2026)

**4. Compare Futures**
- **Priority:** Medium
- **Description:** Split-screen chat with two personas simultaneously
- **UI:** Left panel = Persona A, Right panel = Persona B
- **Use Case:** "Ask both Entrepreneur and Balanced about work-life trade-offs"

**5. Reflection Prompts**
- **Priority:** High
- **Description:** Daily/weekly AI-generated reflection questions
- **Delivery:** Push notifications or email
- **Examples:**
  - "What would Mindful You say about today's stress?"
  - "How would Entrepreneur You approach this week's challenge?"

**6. Goal Tracking**
- **Priority:** Medium
- **Description:** Set goals aligned with chosen persona
- **Features:**
  - Goal creation wizard
  - Progress check-ins with persona feedback
  - Milestone celebrations
- **Impact:** Convert conversations into actionable outcomes

**7. Community Features (With Privacy)**
- **Priority:** Low
- **Description:** Anonymous leaderboard of "most reflective users"
- **Metrics:** Total conversations, streak days, personas explored
- **Privacy:** No user-identifiable information shared
- **Gamification:** Badges for milestones (10 chats, 30-day streak)

**8. Premium Tier**
- **Priority:** High (Revenue)
- **Features:**
  - Unlimited messages (free tier: 50/month)
  - Priority API access (faster responses)
  - Advanced personas (Celebrity mentors, Historical figures)
  - Deeper conversation history (12 months vs 1 month)
  - Export with custom branding
  - Ad-free experience
  - Access to beta features
- **Pricing:** ₹299/month or ₹2,499/year
- **Payment:** Razorpay integration (India-focused payment gateway)

### Research & Exploration

**Long-Term Vision:**
- **Persona Customization:** Train custom personas on user's own journal entries
- **Emotion Detection:** Adapt tone based on user sentiment analysis
- **Integration:** Connect with productivity apps (Notion, Todoist) via web APIs
- **Progressive Web App (PWA):** Install website as app-like experience on mobile/desktop
- **Browser Extensions:** Quick access to personas from Chrome/Firefox toolbar

---

## Success Metrics & KPIs

### North Star Metric
**Meaningful Conversations Per User Per Week**
- Target: 3+ conversations averaging 10+ message exchanges each

### Acquisition Metrics
- Weekly Active Users (WAU)
- Sign-up conversion rate: 25% of visitors
- Viral coefficient (K-factor): Aim for 0.5+ (organic sharing)

### Engagement Metrics
- **D1 Retention:** 50%
- **D7 Retention:** 40%
- **D30 Retention:** 25%
- Average messages per session: 12+
- Average session duration: 8-12 minutes
- Personas explored per user: 2.5 average

### Quality Metrics
- **User Satisfaction:** Post-chat survey (1-5 stars) > 4.2
- **NPS Score:** > 50
- **Response Relevance:** Thumbs up/down > 85% positive
- **Repeat Usage:** 40% of users return within 7 days

### Technical Metrics
- API uptime: 99.9%
- Average API latency: < 2 seconds
- Error rate: < 0.5%
- Page load time: < 2 seconds (p95)

### Business Metrics (Future)
- Cost per conversation: < ₹2
- Monthly Active Users (MAU): 10K by end of Year 1
- Conversion to premium: 5% of free users
- Monthly Recurring Revenue (MRR): ₹150K by Month 12

---

## Risks & Mitigation

### Technical Risks

**Risk 1: OpenAI API Downtime**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Implement fallback to cached responses for common queries
  - Display graceful error message with retry option
  - Consider secondary AI provider (Anthropic Claude) as backup

**Risk 2: High API Costs**
- **Likelihood:** High
- **Impact:** High
- **Mitigation:**
  - Aggressive rate limiting (50 messages/hour)
  - Token optimization (limit conversation context)
  - Implement caching for similar queries
  - Monitor cost per user daily

**Risk 3: Performance Degradation at Scale**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Load testing before launch (Apache JMeter)
  - CDN caching for static assets
  - Database query optimization
  - Horizontal scaling on Vercel

### Product Risks

**Risk 4: Low User Engagement**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Onboarding tutorial for first-time users
  - Seed conversations with compelling example exchanges
  - Push notification reminders (opt-in)
  - Gamification elements (badges, streaks)

**Risk 5: Generic/Unhelpful AI Responses**
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:**
  - Extensive prompt engineering and testing
  - A/B test different prompt templates
  - User feedback loop (thumbs up/down)
  - Manual review of random conversations weekly

**Risk 6: Privacy Concerns**
- **Likelihood:** Low
- **Impact:** Critical
- **Mitigation:**
  - Clear privacy policy on landing page
  - No data sold to third parties (stated explicitly)
  - Optional anonymous mode (no account required)
  - Regular security audits

### Market Risks

**Risk 7: Low Product-Market Fit**
- **Likelihood:** Medium
- **Impact:** Critical
- **Mitigation:**
  - Soft launch to 100 beta users
  - Weekly user interviews (qualitative feedback)
  - Iterate rapidly based on feedback
  - Pivot personas based on usage data

**Risk 8: Competitive Entry**
- **Likelihood:** High
- **Impact:** Medium
- **Mitigation:**
  - Build strong brand identity early
  - Focus on India-specific personas (defensible niche)
  - Build community and network effects
  - Patent unique features (Compare Futures)

---

## Launch Plan

### Pre-Launch Phase (Weeks 1-2)

**Week 1: Development**
- [ ] Set up project repository and CI/CD
- [ ] Implement home page and persona selection
- [ ] Build chat interface (frontend only)
- [ ] Create design system and component library

**Week 2: Backend + Integration**
- [ ] Set up OpenAI API integration
- [ ] Write and test persona prompt templates
- [ ] Implement rate limiting and error handling
- [ ] End-to-end testing (Cypress or Playwright)

### Beta Testing Phase (Week 3)

**Objectives:**
- Validate core functionality with real users
- Identify critical bugs and UX issues
- Gather qualitative feedback on persona quality

**Recruitment:**
- 50 beta users from target demographic
- Mix of students, young professionals, entrepreneurs
- Recruited via LinkedIn, Twitter, college communities

**Feedback Collection:**
- Post-chat survey after every 3rd conversation
- Daily check-in email with feedback form
- 1-on-1 user interviews (10 users, 30 min each)

**Success Criteria:**
- < 5 critical bugs reported
- Average satisfaction score > 4.0/5.0
- 70% of users have 3+ conversations

### Soft Launch Phase (Week 4)

**Marketing Channels:**
- Product Hunt launch (tech/web app category)
- LinkedIn posts in startup/tech groups with website link
- Twitter thread explaining concept with website demo
- Reddit posts in r/india, r/Indian_Academia, r/startups with direct link
- WhatsApp shares to personal network with website URL (100+ contacts)
- Instagram stories with swipe-up link to website
- IndieHackers community showcase

**Launch Goals:**
- 500 total website visitors in first week
- 200 users complete onboarding (40% conversion)
- 30% D1 retention
- < 1% error rate
- Viral coefficient > 0.3 (organic sharing via social/WhatsApp)

**Monitoring:**
- Real-time dashboard (Vercel Analytics + Mixpanel)
- Daily Slack alerts for critical errors
- Manual review of 20 random conversations daily

### Post-Launch (Weeks 5-8)

**Week 5-6: Iterate Based on Feedback**
- Fix top 3 UX pain points
- Improve persona prompt quality
- Add most-requested features (conversation export, persona switching)
- Optimize website loading speed (target < 1s LCP)

**Week 7-8: Growth & SEO**
- **SEO Optimization:**
  - Meta tags and Open Graph for social sharing
  - Google Search Console setup
  - Blog content (e.g., "How to talk to your future self")
  - Schema markup for rich snippets
- **A/B Testing:** Landing page variations
- **Referral Program:** "Invite a friend, both get 10 bonus messages"
- **Paid Acquisition:** ₹10K budget on Instagram/Facebook ads targeting Indian millennials
- **Content Marketing:** Medium articles, Twitter threads about future selves

---

## Website-Specific Considerations

### Progressive Web App (PWA) - Phase 2
- **Installability:** Allow users to "install" website on mobile home screen
- **Offline Support:** Cache key assets for limited offline functionality
- **Service Worker:** Background sync for message queue when offline
- **App-like Experience:** Full-screen mode, splash screen
- **Benefits:** Increase engagement without native app development

### SEO Strategy
**On-Page SEO:**
- Title: "Future You - Talk to Your Future Self | AI Life Coach for India"
- Meta Description: "Explore your potential through conversations with AI personas. Career advice, life balance, entrepreneurship guidance tailored for India."
- H1: "Talk to Your Future Self"
- Semantic HTML structure
- Alt text for all images/icons

**Technical SEO:**
- Next.js automatic sitemap generation
- robots.txt configuration
- Fast page loading (Core Web Vitals)
- Mobile-first indexing
- Structured data markup (Organization, WebApplication)

**Content Strategy:**
- Blog section: "/blog/how-to-make-career-decisions"
- FAQ page: "/faq"
- About page: "/about"
- Privacy Policy & Terms: "/privacy", "/terms"

### Analytics & Tracking
**Website Analytics:**
- Google Analytics 4 (GA4)
- Vercel Analytics (real-time)
- Hotjar (heatmaps, session recordings)
- Microsoft Clarity (free alternative to Hotjar)

**Conversion Tracking:**
- Funnel: Landing → Persona Selection → First Message → 3rd Message
- Goal completions: Sign-up, first chat, 5 chats milestone
- Bounce rate by page
- Average session duration by persona

### Web Performance Optimization
**Image Optimization:**
- Next.js Image component with automatic WebP conversion
- Lazy loading for below-fold images
- Responsive images (srcset) for different viewports

**Code Splitting:**
- Route-based code splitting (automatic in Next.js)
- Dynamic imports for heavy components (Framer Motion)
- Tree shaking for unused Tailwind classes

**Caching Strategy:**
- Static assets: 1 year cache
- API responses: 5-minute cache for repeated queries
- CDN edge caching via Vercel

---

## Dependencies & Constraints

### External Dependencies
- **OpenAI API:** Must remain stable and affordable
- **Vercel Platform:** For hosting and deployment
- **NPM Packages:** React, Next.js, Tailwind, Framer Motion (all stable)

### Resource Constraints
- **Budget:** ₹50K for initial 3 months (API costs + hosting)
- **Team:** 1 full-stack developer + 1 designer (part-time)
- **Timeline:** MVP in 4 weeks from kickoff

### Technical Constraints
- **Browser Support:** Chrome 90+, Safari 14+, Firefox 88+, Edge 90+ (no IE11 support)
- **Mobile Browsers:** iOS Safari 14+, Chrome Mobile 90+, Samsung Internet 14+
- **Screen Sizes:** Optimized for 320px (mobile) to 1920px (desktop) viewports
- **API Rate Limits:** OpenAI free tier (60 requests/min) → upgrade to paid tier for production
- **Web Standards:** Fully responsive design, no Flash or deprecated technologies

---

## Glossary

| Term | Definition |
|------|------------|
| **Persona** | A simulated future version of the user representing a specific life outcome or archetype |
| **System Prompt** | Instructions given to GPT-4 to define persona personality and tone |
| **Conversation Context** | Previous messages passed to AI to maintain coherent dialogue |
| **Session Persistence** | Storing chat history in localStorage so users can continue later |
| **Token** | Unit of text processed by OpenAI API (1 token ≈ 4 characters) |
| **Rate Limiting** | Restricting number of API calls per user to control costs |
| **MVP** | Minimum Viable Product — simplest version with core features only |
| **D1/D7/D30 Retention** | % of users who return 1/7/30 days after first use |
| **WAU/MAU** | Weekly/Monthly Active Users |

---

## Appendices

### Appendix A: Persona Prompt Templates

**Full prompt examples for each persona to be implemented in backend:**

#### 1. Entrepreneur Persona
```
You are the user's future self, 10 years from now, who successfully built and scaled a thriving startup in India. You've experienced the highs of funding rounds, the lows of near-bankruptcy, and the satisfaction of building a team and product that matters.

**Your Background:**
- You started with fear and self-doubt, just like the user feels now
- You made bold decisions despite uncertainty (quit your job, took on debt, pivoted multiple times)
- You learned hard lessons about cash flow, hiring, and customer focus
- You now run a company with 50+ employees and sustainable revenue

**Your Personality:**
- Bold and confident, but never arrogant
- Practical and action-oriented — you give specific advice, not platitudes
- Empathetic to fear because you lived it
- You use stories from your own journey to illustrate points

**Tone:**
- First-person ("I remember when...", "What changed for me was...")
- Conversational but intense — you care deeply about the user's growth
- No generic motivational quotes — always ground advice in real experience

**Example Messages:**
- "I remember that exact feeling of paralysis. What helped me was..."
- "The fear never fully goes away, but here's what I learned to do with it..."
- "Let me tell you about the time I almost gave up — and what changed my mind."

Respond to the user's message as this future self.
```

#### 2. Mindful Persona
```
You are the user's future self who, after years of burnout and chaos, found lasting peace through mindfulness, meditation, and intentional living. You're 10 years in the future, living a calm, centered life.

**Your Background:**
- You used to be anxious, overworked, and constantly reactive
- You hit rock bottom (health scare, burnout, or breakdown) before changing
- You rebuilt your life around presence, boundaries, and self-compassion
- You now wake up calm, handle stress gracefully, and feel deeply content

**Your Personality:**
- Peaceful and grounded — you speak slowly and thoughtfully
- Patient with the user's struggles because you've been there
- Gentle but not passive — you still take action, just from a place of clarity
- You use metaphors and gentle questions to guide reflection

**Tone:**
- First-person ("I used to...", "What I discovered was...")
- Soft, soothing, and unhurried — like talking to a wise friend
- Reflective — you often ask the user questions to help them find their own answers

**Example Messages:**
- "I understand that urgency. I used to live there too. What helped me was learning to pause..."
- "There's a difference between ambition and anxiety. Let me share what I learned..."
- "What if this challenge is actually an invitation to slow down?"

Respond to the user's message as this future self.
```

### Appendix B: Sample Conversation Flows

**Example 1: User asking about career change**

**User:** "I'm 26 and stuck in a boring corporate job. Should I quit to start my own thing?"

**Entrepreneur Persona:** "I was 27 when I quit. Same fears you have right now — the salary felt safe, my parents were worried, and I had no idea if I'd succeed. Here's what I wish I'd known: don't quit tomorrow, but don't wait for perfect confidence either. Start building on the side. Give yourself 6 months to test one idea, even for an hour a day. The version of me that succeeded? I didn't have all the answers when I quit. I just had one small thing that was working. What's one thing you're curious enough about to test this month?"

**Example 2: User feeling overwhelmed**

**User:** "I have so many things to do and I'm paralyzed. How do I even start?"

**Mindful Persona:** "I remember that feeling — the mental noise was so loud I couldn't hear my own thoughts. What helped me wasn't doing more, it was doing less. I started by closing my eyes for 60 seconds and asking: 'What's the one thing that actually matters right now?' Not urgent, not loud — what matters. Try it with me now. Close your eyes, take three breaths, and ask yourself that question. What comes up?"

---

## Approval & Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | [Name] | [Date] | ___________ |
| Engineering Lead | [Name] | [Date] | ___________ |
| Design Lead | [Name] | [Date] | ___________ |
| Stakeholder | [Name] | [Date] | ___________ |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 21, 2025 | Product Team | Initial PRD creation |

---

**END OF DOCUMENT**
