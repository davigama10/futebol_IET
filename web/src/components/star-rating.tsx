'use client';

import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number; // incrementos de 0.5, de 0.5 a 5
  onChange: (value: number) => void;
}

const ESTRELAS = [1, 2, 3, 4, 5];

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {ESTRELAS.map((n) => {
        const cheia = value >= n;
        const metade = !cheia && value >= n - 0.5;

        return (
          <div key={n} className="relative size-7">
            <Star className="size-7 text-muted-foreground" />

            {(cheia || metade) && (
              <div className={cn('absolute inset-0 overflow-hidden', metade && 'w-1/2')}>
                <Star className="size-7 fill-primary text-primary" />
              </div>
            )}

            <button
              type="button"
              onClick={() => onChange(n - 0.5)}
              className="absolute inset-y-0 left-0 w-1/2"
              aria-label={`Nível ${n - 0.5}`}
            />
            <button
              type="button"
              onClick={() => onChange(n)}
              className="absolute inset-y-0 right-0 w-1/2"
              aria-label={`Nível ${n}`}
            />
          </div>
        );
      })}
    </div>
  );
}
