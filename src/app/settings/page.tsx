"use client";

import { DarkLayout } from '@/components/layouts/DarkLayout';

export default function SettingsPage() {
  return (
    <DarkLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center backdrop-blur-xl bg-black/60 rounded-3xl p-12 border border-white/20">
          <h1 className="text-4xl font-bold mb-4 text-white">Settings</h1>
          <p className="text-white/70">Settings page content coming soon.</p>
        </div>
      </div>
    </DarkLayout>
  );
}
