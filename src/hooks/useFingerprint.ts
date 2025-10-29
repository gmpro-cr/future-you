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

        // Convert hash to UUID v4 format (deterministic from hash)
        // Take first 16 bytes of hash and format as UUID
        const uuid = [
          hashArray.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join(''),
          hashArray.slice(4, 6).map(b => b.toString(16).padStart(2, '0')).join(''),
          hashArray.slice(6, 8).map(b => b.toString(16).padStart(2, '0')).join(''),
          hashArray.slice(8, 10).map(b => b.toString(16).padStart(2, '0')).join(''),
          hashArray.slice(10, 16).map(b => b.toString(16).padStart(2, '0')).join(''),
        ].join('-');

        localStorage.setItem('future_you_session_id', uuid);
        setFingerprint(uuid);
      } catch (error) {
        console.error('Error generating fingerprint:', error);
        // Fallback to random UUID
        const fallbackUuid = crypto.randomUUID();
        localStorage.setItem('future_you_session_id', fallbackUuid);
        setFingerprint(fallbackUuid);
      } finally {
        setIsLoading(false);
      }
    };

    generateFingerprint();
  }, []);

  return { fingerprint, isLoading };
}
