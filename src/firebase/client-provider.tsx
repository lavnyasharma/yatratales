'use client';

import React, { useMemo, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

interface FirebaseClientProviderProps {
  children: React.ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  // Add persistence when auth is available
  useEffect(() => {
    if (firebaseServices?.auth) {
      setPersistence(firebaseServices.auth, browserLocalPersistence)
        .catch((error) => {
          console.error('Failed to set auth persistence:', error);
        });
    }
  }, [firebaseServices?.auth]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
