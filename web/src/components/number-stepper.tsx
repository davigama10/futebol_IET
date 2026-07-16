'use client';

import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  ariaLabel: string;
  size?: 'icon' | 'icon-sm';
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  ariaLabel,
  size = 'icon',
}: NumberStepperProps) {
  const inputWidth = size === 'icon-sm' ? 'w-10' : 'w-12';

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Diminuir ${ariaLabel}`}
      >
        <Minus />
      </Button>
      <Input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
        className={`${inputWidth} text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
        aria-label={ariaLabel}
      />
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={() => onChange(value + 1)}
        aria-label={`Aumentar ${ariaLabel}`}
      >
        <Plus />
      </Button>
    </div>
  );
}
