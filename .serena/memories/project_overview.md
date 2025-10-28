# Esperit - Project Overview

## Purpose
Esperit is an AI-powered conversational platform for personal growth and self-discovery. Users explore their potential futures through meaningful conversations with AI personas representing different life paths (entrepreneur, mindful, visionary, creative, wealthy, IAS officer, balanced).

## Target Audience
- Age: 18-35 years
- Geography: Urban India (Tier 1 & Tier 2 cities)
- Tech-savvy professionals and students
- English proficient (with plans for vernacular expansion)

## Key Features
- **7 Unique Personas**: Entrepreneur, Mindful, Visionary, Creative, Wealthy, IAS Officer, Balanced
- **AI-Powered Conversations**: Deep, personalized interactions using GPT-4 Turbo or Google Gemini
- **Privacy-First**: No account required, browser-based sessions with fingerprinting
- **Mobile Responsive**: Seamless experience across all devices
- **Real-time Chat**: Instant responses with typing indicators
- **Conversation Persistence**: Resume conversations anytime via Supabase storage

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5.4+, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4 Turbo / Google Gemini API
- **Rate Limiting**: Upstash Redis
- **Deployment**: Vercel
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Auth**: NextAuth.js
- **Testing**: Vitest (unit), Playwright (E2E)

## Environment Requirements
- Node.js 18+
- pnpm 8+ (preferred package manager)