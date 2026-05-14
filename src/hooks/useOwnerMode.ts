import { useState } from 'react';

export function useOwnerMode() {
  const [isOwner, setIsOwner] = useState(() => {
    try {
      return sessionStorage.getItem('dd-owner') === 'true';
    } catch {
      return false;
    }
  });

  function unlock(pin: string): boolean {
    const correctPin = import.meta.env.VITE_OWNER_PIN;
    if (!correctPin || pin !== correctPin) return false;
    try { sessionStorage.setItem('dd-owner', 'true'); } catch { /* ignore */ }
    setIsOwner(true);
    return true;
  }

  function lock() {
    try { sessionStorage.removeItem('dd-owner'); } catch { /* ignore */ }
    setIsOwner(false);
  }

  return { isOwner, unlock, lock };
}
