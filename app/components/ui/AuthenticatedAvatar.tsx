'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { api } from '@/lib/api-client';

interface AuthenticatedAvatarProps {
  /** URL that requires JWT (e.g. from getAvatarUrl). Fetched with api so Bearer token is attached. Backend returns { url: "<signed-s3-url>" }. */
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** Shown when no src, while loading, or on error (e.g. initials placeholder). */
  fallback?: ReactNode;
}

/**
 * Renders an avatar image. Calls the api (with JWT) to get a signed URL, then uses that URL for the img.
 * Backend /url/generate returns { url: "https://...s3...signed..." }; the signed URL is used as img src.
 */
export default function AuthenticatedAvatar({ src, alt, className, fallback }: AuthenticatedAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src?.trim()) {
      setImageUrl(null);
      setError(false);
      return;
    }
    setImageUrl(null);
    setError(false);
    api
      .get<{ url?: string; data?: { url?: string } }>(src)
      .then((res) => {
        const data = res.data;
        const url = typeof data?.url === 'string' ? data.url : (data as { data?: { url?: string } })?.data?.url;
        if (url) setImageUrl(url);
      })
      .catch(() => {
        setError(true);
        setImageUrl(null);
      });
  }, [src]);

  if (imageUrl && !error) return <img src={imageUrl} alt={alt} className={className} />;
  if (fallback) return <>{fallback}</>;
  return null;
}
