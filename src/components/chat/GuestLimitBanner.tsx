'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface GuestLimitBannerProps {
  current: number;
  max: number;
  remainingMessages: number;
}

export function GuestLimitBanner({ current, max, remainingMessages }: GuestLimitBannerProps) {
  const percentage = (current / max) * 100;

  return (
    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 backdrop-blur-xl rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-300 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-orange-200 text-sm font-medium mb-2">
            {remainingMessages > 0
              ? `${remainingMessages} messages remaining`
              : 'Message limit reached'}
          </p>

          {/* Progress bar */}
          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-orange-100/80 text-xs mb-3">
            Sign up to continue chatting with unlimited messages
          </p>

          <Link
            href="/"
            className="inline-block px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
}
