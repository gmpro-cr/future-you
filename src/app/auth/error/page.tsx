'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/shared/Button';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You cancelled the sign-in process.',
    Verification: 'The verification token has expired or has already been used.',
    OAuthSignin: 'Error constructing an authorization URL.',
    OAuthCallback: 'Error handling the OAuth callback.',
    OAuthCreateAccount: 'Could not create OAuth provider user in the database.',
    EmailCreateAccount: 'Could not create email provider user in the database.',
    Callback: 'Error in the OAuth callback handler route.',
    OAuthAccountNotLinked: 'Email already associated with another account.',
    SessionRequired: 'Please sign in to access this page.',
    Default: 'Unable to sign in. Please try again.',
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{ backgroundSize: '200% 200%' }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-black/60 rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">Authentication Error</h1>

            <p className="text-white/70 mb-2">{errorMessage}</p>

            {error && (
              <p className="text-xs text-white/50 mb-6 font-mono">Error code: {error}</p>
            )}

            <div className="w-full space-y-3 mt-4">
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-white hover:bg-white/90 text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>

              <Button
                onClick={() => router.push('/auth/signin')}
                className="w-full border-2 border-white/30 bg-white/5 text-white hover:bg-white/10 py-3 rounded-xl font-semibold"
              >
                Try Again
              </Button>
            </div>

            {/* Debug Info in Development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10 text-left w-full">
                <p className="text-xs text-white/50 font-mono break-all">
                  Debug: Check console for more details
                </p>
                {error && (
                  <p className="text-xs text-white/50 font-mono mt-2">
                    Full error: {error}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
