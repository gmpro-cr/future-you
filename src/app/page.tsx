'use client';

import { useRouter } from 'next/navigation';
import { HeroSection } from '@/components/home/HeroSection';

export default function HomePage() {
  const router = useRouter();

  const handleStartJourney = () => {
    router.push('/persona');
  };

  return <HeroSection onCTAClick={handleStartJourney} />;
}
