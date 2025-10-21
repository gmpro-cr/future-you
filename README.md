# Future You

**Talk to Your Future Self** - An AI-powered conversational platform for personal growth and self-discovery.

![Future You](https://img.shields.io/badge/version-1.0.0-teal)
![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)

## Overview

Future You helps individuals explore their potential futures through meaningful conversations with AI personas representing different life paths. From entrepreneurship to mindfulness, users can gain perspective on career decisions, life balance, and personal development.

### Key Features

- **7 Unique Personas**: Entrepreneur, Mindful, Visionary, Creative, Wealthy, IAS Officer, Balanced
- **AI-Powered Conversations**: Deep, personalized interactions using GPT-4 Turbo
- **Privacy-First**: No account required, browser-based sessions
- **Mobile Responsive**: Seamless experience across all devices
- **Real-time Chat**: Instant responses with typing indicators
- **Conversation Persistence**: Resume conversations anytime

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4 Turbo
- **Rate Limiting**: Upstash Redis
- **Deployment**: Vercel
- **Animations**: Framer Motion

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- OpenAI API key
- Supabase account
- Upstash Redis account (optional for rate limiting)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/future-you.git
   cd future-you
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

4. **Set up Supabase database**
   - Go to your Supabase project
   - Run the SQL from `src/lib/db/schema.sql` in the SQL Editor
   - Verify tables are created

5. **Run development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
future-you/
├── src/
│   ├── app/              # Next.js pages and API routes
│   │   ├── api/          # Backend API endpoints
│   │   ├── page.tsx      # Home page
│   │   ├── persona/      # Persona selection
│   │   └── chat/         # Chat interface
│   ├── components/       # React components
│   │   ├── home/         # Home page components
│   │   ├── persona/      # Persona selection components
│   │   ├── chat/         # Chat interface components
│   │   └── shared/       # Reusable components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and configurations
│   │   ├── api/          # API clients (OpenAI, Supabase, Redis)
│   │   ├── prompts/      # Persona prompt templates
│   │   ├── utils/        # Helper functions
│   │   └── middleware/   # Error handling, validation
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── [config files]        # Various configuration files
```

## API Endpoints

### `POST /api/chat`
Send a message and receive AI response

**Request:**
```json
{
  "sessionId": "string",
  "personaType": "entrepreneur",
  "message": "I'm scared to take risks"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "uuid",
    "response": "I remember that fear...",
    "tokenUsage": { "total": 450 }
  }
}
```

### `GET /api/personas`
Get all available personas

### `GET /api/conversations?sessionId={id}`
Get user's conversation history

### `GET /api/health`
Health check endpoint

## Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking
```

### Code Style

- ESLint + Prettier configured
- Strict TypeScript mode enabled
- Tailwind CSS for styling
- Component-first architecture

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Configure domain** (optional)
   - Add custom domain in Vercel settings
   - Configure DNS records

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | No* |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | No* |

*Rate limiting will be disabled if Redis credentials are not provided

## Cost Estimation

### OpenAI API Costs
- GPT-4 Turbo: ~$0.065 per conversation (10 messages)
- 1,000 users × 12 conversations/month = ~₹6,500/month
- 10,000 users = ~₹65,000/month

### Infrastructure
- Vercel: Free tier (up to 100GB bandwidth)
- Supabase: Free tier (500MB database)
- Upstash Redis: Free tier (10K requests/day)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- GitHub Issues: [Report a bug](https://github.com/yourusername/future-you/issues)
- Email: support@futureyou.in

## Acknowledgments

- OpenAI for GPT-4 API
- Supabase for database and authentication
- Vercel for hosting platform
- The open-source community

---

Built with ❤️ for personal growth and self-discovery
