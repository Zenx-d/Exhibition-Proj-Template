'use client';

import { useEffect, useRef } from 'react';
import { captureEvent } from '../utils/telemetryClient';

export default function MemberViewTracker({ memberId, memberName }) {
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // 1. Initial Load Event
    captureEvent('member_view', { memberId, memberName, action: 'load' });

    // 2. Duration tracking on cleanup
    return () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 1) { // Only log if they stayed for more than 1 second
        captureEvent('member_view', { 
          memberId, 
          memberName, 
          action: 'exit', 
          durationSeconds: duration 
        });
      }
    };
  }, [memberId, memberName]);

  return null;
}
