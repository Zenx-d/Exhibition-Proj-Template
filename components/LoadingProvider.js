'use client';

import { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';

const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

function LoadingStateWatcher({ setIsLoading }) {
  const pathname = usePathname();
  
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, setIsLoading]);

  return null;
}

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      <Suspense fallback={null}>
        <LoadingStateWatcher setIsLoading={setIsLoading} />
      </Suspense>
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => useContext(LoadingContext);
