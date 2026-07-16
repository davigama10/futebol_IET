'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { cadastro } from '@/app/actions/auth';
import { AuthShell } from '@/components/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  nome: z.string().trim().min(1, 'Informe seu nome'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export default function CadastroPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setCarregando(true);
    const result = await cadastro(values.email, values.senha, values.nome.trim());
    setCarregando(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Conta criada! Faça login para continuar.');
    router.push('/login');
  }

  return (
    <AuthShell title="Criar conta">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" autoComplete="name" {...register('nome')} />
          {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" type="password" autoComplete="new-password" {...register('senha')} />
          {errors.senha && <p className="text-sm text-destructive">{errors.senha.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/login" className="text-primary underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
