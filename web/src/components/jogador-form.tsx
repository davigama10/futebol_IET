'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Posicao } from '@/domain/sorteio.types';

const jogadorSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome do jogador'),
  nivel: z.string().refine(
    (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 1 && n <= 5 && Number.isInteger(n * 2);
    },
    { message: 'Nível deve ser entre 1 e 5, em incrementos de meia estrela' }
  ),
  posicao: z.enum(['atacante', 'defensor']),
});

export type JogadorFormValues = z.infer<typeof jogadorSchema>;

interface JogadorFormProps {
  valoresIniciais?: { nome: string; nivel: number; posicao: Posicao };
  onSubmit: (values: { nome: string; nivel: number; posicao: Posicao }) => Promise<void> | void;
  enviando?: boolean;
  textoBotao?: string;
}

export function JogadorForm({
  valoresIniciais,
  onSubmit,
  enviando,
  textoBotao = 'Salvar',
}: JogadorFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JogadorFormValues>({
    resolver: zodResolver(jogadorSchema),
    defaultValues: {
      nome: valoresIniciais?.nome ?? '',
      nivel: valoresIniciais ? String(valoresIniciais.nivel) : '3',
      posicao: valoresIniciais?.posicao ?? 'atacante',
    },
  });

  function handleFormSubmit(values: JogadorFormValues) {
    return onSubmit({
      nome: values.nome.trim(),
      nivel: Number(values.nivel),
      posicao: values.posicao,
    });
  }

  return (
    <Card className="max-w-md border-border/60 shadow-sm">
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do jogador</Label>
            <Input id="nome" placeholder="Ex: João Silva" {...register('nome')} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Função</Label>
            <Controller
              control={control}
              name="posicao"
              render={({ field: { value, onChange } }) => (
                <ToggleGroup
                  value={[value]}
                  onValueChange={(vals) => vals[0] && onChange(vals[0] as Posicao)}
                  variant="outline"
                  className="w-full"
                >
                  <ToggleGroupItem value="atacante" className="flex-1">
                    Atacante
                  </ToggleGroupItem>
                  <ToggleGroupItem value="defensor" className="flex-1">
                    Defensor
                  </ToggleGroupItem>
                </ToggleGroup>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Nível de habilidade</Label>
            <Controller
              control={control}
              name="nivel"
              render={({ field: { value, onChange } }) => (
                <StarRating value={Number(value)} onChange={(n) => onChange(String(n))} />
              )}
            />
            {errors.nivel && <p className="text-sm text-destructive">{errors.nivel.message}</p>}
          </div>

          <Button type="submit" disabled={enviando} className="w-full">
            {enviando ? 'Salvando...' : textoBotao}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
