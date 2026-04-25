'use client';

import Link from 'next/link';
import { useLoading } from './LoadingProvider';

export default function SmartLink({ href, children, ...props }) {
  const { startLoading } = useLoading();

  const handleClick = (e) => {
    // Only trigger loading for internal links
    if (href.startsWith('/') && !href.includes('#')) {
      startLoading();
    }
    
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <Link href={href} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
