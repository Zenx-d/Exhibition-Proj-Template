'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureEvent } from '../utils/telemetryClient';

export default function TelemetryProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Log Page View whenever the route changes
    captureEvent('page_view', {
      path: pathname,
      params: searchParams.toString(),
    });
  }, [pathname, searchParams]);

  return null;
}
