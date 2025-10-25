'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isUserLoggedIn, createUserSession } from '@/lib/utils/auth';
import { HeroSection } from '@/components/home/HeroSection';

export default function HomePage() {
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    if (isUserLoggedIn()) {
      router.push('/personas');
    }
  }, [router]);

  const handleGuestExplore = () => {
    // Create a guest session without requiring details
    const userId = `guest_${Date.now()}`;
    createUserSession(userId, 'Guest');
    router.push('/personas');
  };

  return <HeroSection onCTAClick={handleGuestExplore} />;
}
