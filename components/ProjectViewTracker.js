'use client';

import { useEffect, useRef } from 'react';
import { captureEvent } from '../utils/telemetryClient';

export default function ProjectViewTracker({ projectId, projectTitle }) {
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // 1. Initial Load Event
    captureEvent('project_view', { projectId, projectTitle, action: 'load' });

    // 2. Duration tracking on cleanup
    return () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 1) {
        captureEvent('project_view', { 
          projectId, 
          projectTitle, 
          action: 'exit', 
          durationSeconds: duration 
        });
      }
    };
  }, [projectId, projectTitle]);

  return null;
}
