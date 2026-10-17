import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Official Jadvix wordmark. Intrinsic ratio ~4.32:1.
 * `light` swaps to the white wordmark for dark surfaces.
 */
export function Logo({
  light = false,
  className,
  href = '/',
}: {
  light?: boolean;
  className?: string;
  href?: string | null;
}) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={light ? '/jadvix-logo-light.svg' : '/jadvix-logo.svg'}
      alt="Jadvix"
      width={160}
      height={37}
      className={cn('h-8 w-auto', className)}
    />
  );
  if (href === null) return img;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="Jadvix home">
      {img}
    </Link>
  );
}
