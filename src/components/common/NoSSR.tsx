'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

function NoSSRWrapper<T = any>(Component: ComponentType<T>) {
  return dynamic(() => Promise.resolve(Component), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-neutral-200 rounded h-8"></div>
  });
}

export default NoSSRWrapper;
