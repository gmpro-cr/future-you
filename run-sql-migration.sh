#!/bin/bash

# Load environment variables
source .env.local

PROJECT_ID="exdjsvknudvfkabnifrg"
SQL_QUERY="ALTER TABLE personas ADD COLUMN IF NOT EXISTS session_identifier TEXT; CREATE INDEX IF NOT EXISTS idx_personas_session_identifier ON personas(session_identifier);"

echo "🔧 Running SQL Migration via Supabase API"
echo "=" | tr "=" "=" | head -c 60; echo

# Use Supabase SQL endpoint (requires access token, not service key)
echo "⚠️  Note: Direct SQL execution requires Supabase CLI or Dashboard access"
echo ""
echo "📋 SQL to execute:"
echo "─────────────────────────────────────────────────────────────"
echo "${SQL_QUERY}"
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "🌐 Please run this SQL manually at:"
echo "   https://supabase.com/dashboard/project/${PROJECT_ID}/editor"
echo ""
echo "OR use Supabase CLI:"
echo "   echo \"${SQL_QUERY}\" | supabase db execute"
