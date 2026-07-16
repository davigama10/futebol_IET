# Pelada IET — Web

Versão web (Next.js + Supabase) do app de sorteio de times da pelada, hospedada na Vercel como PWA instalável. Substitui a distribuição via APK/TestFlight do app mobile (que continua no repositório, na raiz, sem mudanças) — mesma base Supabase para os dois.

## Setup local

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha com os mesmos dados do projeto Supabase já usado no app mobile (Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

### 3. Rodar

```bash
npm run dev
```

Abra http://localhost:3000 — deve redirecionar pra `/login` se não estiver autenticado.

## Testes e verificação

```bash
npm run test        # Vitest — algoritmo de sorteio
npx tsc --noEmit     # typecheck
npm run lint         # eslint
npm run build        # build de produção completo
```

## Deploy na Vercel

1. Importar o repositório GitHub na Vercel.
2. Em **Project Settings → General → Root Directory**, definir **`web`** (o app mobile fica na raiz do mesmo repo, então a Vercel precisa saber que só essa subpasta é o projeto Next.js).
3. Adicionar as env vars `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em **Project Settings → Environment Variables**.
4. Deploy. A Vercel gera uma URL `https://<projeto>.vercel.app`.
5. **Importante**: no painel do Supabase, em **Authentication → URL Configuration**, adicionar essa URL da Vercel (e `http://localhost:3000` para dev local) em **Redirect URLs** / **Site URL** — sem isso, o fluxo de auth pode falhar em produção.

## Instalar como PWA (sem loja de app)

- **Android/Chrome**: abrir a URL, tocar no menu (⋮) → "Adicionar à tela inicial" / "Instalar app".
- **iOS/Safari**: abrir a URL, tocar em Compartilhar → "Adicionar à Tela de Início". Diferente do Android, o iOS não oferece esse prompt automaticamente — é sempre manual.

## Arquitetura

- Next.js App Router + TypeScript, Tailwind + shadcn/ui.
- Supabase via `@supabase/ssr` (`src/lib/supabase/{client,server,middleware}.ts` + `proxy.ts` na raiz — no Next.js 16 o arquivo de middleware foi renomeado para `proxy.ts`, função exportada `proxy`).
- Mutations: CRUD de jogadores via `@tanstack/react-query` (client-side, código reaproveitado do app mobile); promover usuário e salvar sorteio via Server Actions (`src/app/actions/*.ts`).
- `src/domain/`, `src/constants/roles.ts` e `src/types/database.types.ts` são cópias verbatim do app mobile — mesma lógica de sorteio, mesmos tipos de banco.
