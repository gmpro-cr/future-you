"use client";

import { DarkLayout } from '@/components/layouts/DarkLayout';

export default function AboutPage() {
  return (
    <DarkLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center backdrop-blur-xl bg-black/60 rounded-3xl p-12 border border-white/20">
          <h1 className="text-4xl font-bold mb-4 text-white">About Esperit</h1>
          <p className="text-white/70">Connecting you with AI spirits for meaningful conversations.</p>
        </div>
      </div>
    </DarkLayout>
  );
}
