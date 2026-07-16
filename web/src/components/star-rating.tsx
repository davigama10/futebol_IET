'use client';

import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="rounded-md p-1 transition-transform hover:scale-110"
          aria-label={`Nível ${n}`}
        >
          <Star
            className={cn(
              'size-7',
              n <= value ? 'fill-primary text-primary' : 'text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  );
}
