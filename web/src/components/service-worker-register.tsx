'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Instalação como PWA continua funcionando via manifest mesmo se isso falhar.
      });
    }
  }, []);

  return null;
}
