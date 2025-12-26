'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ size = 32, text, fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 size={size} className="animate-spin text-[var(--sakay-yellow)]" />
      {text && <p className="text-[var(--tertiary-text)] text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {content}
      </div>
    );
  }

  return content;
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-[var(--dark-background)]/50 flex items-center justify-center z-50 rounded-2xl">
      <Loading size={32} />
    </div>
  );
}
