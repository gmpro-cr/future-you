import { useEffect, useState } from 'react';

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateFingerprint = async () => {
      try {
        // Check for existing fingerprint in localStorage
        const existing = localStorage.getItem('future_you_session_id');
        if (existing) {
          setFingerprint(existing);
          setIsLoading(false);
          return;
        }

        // Generate new fingerprint using browser properties
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillText('fingerprint', 0, 0);
        }
        const canvasData = canvas.toDataURL();

        const data = {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          canvas: canvasData,
          timestamp: Date.now(),
        };

        const jsonString = JSON.stringify(data);
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(jsonString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

        localStorage.setItem('future_you_session_id', hashHex);
        setFingerprint(hashHex);
      } catch (error) {
        console.error('Error generating fingerprint:', error);
        // Fallback to random ID
        const fallbackId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('future_you_session_id', fallbackId);
        setFingerprint(fallbackId);
      } finally {
        setIsLoading(false);
      }
    };

    generateFingerprint();
  }, []);

  return { fingerprint, isLoading };
}
