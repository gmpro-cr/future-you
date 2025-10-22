'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { Suspense, useEffect } from 'react';
import { isUserLoggedIn } from '@/lib/utils/auth';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/onboarding';

  // Check if user is already logged in
  useEffect(() => {
    if (isUserLoggedIn()) {
      router.push('/personas');
    }
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Sign In */}
      <div className="w-full lg:w-1/3 flex items-center justify-start px-6 lg:pl-8 lg:pr-4 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Logo/Brand */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-3"
            >
              <Sparkles className="w-8 h-8 text-black" />
            </motion.div>
            <h1 className="text-2xl font-bold text-black mb-1">Future You</h1>
            <p className="text-gray-600 text-sm">Talk to your future self</p>
          </div>

          {/* Sign In Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-6 border-2 border-black"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Welcome
            </h2>
            <p className="text-gray-600 text-center mb-6 text-sm">
              Create your account to discover your future self
            </p>

            {/* Primary: Registration Button */}
            <Button
              onClick={() => router.push('/onboarding')}
              className="w-full text-sm bg-black hover:bg-gray-800 text-white"
              size="lg"
            >
              Register Yourself
            </Button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or sign in with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-gray-50 text-black border-2 border-gray-300 rounded-lg shadow-sm flex items-center justify-center gap-2 py-2.5 px-4 transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC04"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium">Google</span>
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center mt-5">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-gray-500 mt-6"
          >
            Discover your potential through conversation
          </motion.p>
        </motion.div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-2/3 items-center justify-center bg-gray-50 px-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl"
        >
          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-black/5 border border-gray-200 px-4 py-2 rounded-full text-black text-sm mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>Discover Your Potential Through Conversation</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6"
          >
            Talk to Your{' '}
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="text-gray-600 underline decoration-4 decoration-gray-300"
            >
              Future Self
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-gray-600 mb-12 leading-relaxed"
          >
            Explore personal growth through meaningful conversations with AI personas representing your
            aspirational future. Get guidance on career, life balance, and purpose.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 gap-4 text-gray-600"
          >
            {[
              { label: 'Custom Personas', description: 'Create your own unique personas' },
              { label: 'AI-Powered Insights', description: 'Deep, personalized conversations' },
              { label: 'Privacy First', description: 'Your journey stays yours' },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white"
              >
                <div className="w-2 h-2 bg-black rounded-full mt-2" />
                <div>
                  <h3 className="font-semibold text-black mb-1">{feature.label}</h3>
                  <p className="text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignInContent />
    </Suspense>
  );
}
