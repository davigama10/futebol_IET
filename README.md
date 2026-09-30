# Pelada IET

App para gerenciar o sorteio semanal dos times de futebol ("pelada") da igreja: cadastro de jogadores, seleção dos que vão jogar na semana e sorteio balanceado por nível de habilidade e função (atacante/meio-campo/defensor/goleiro), evitando repetir as duplas do último sorteio.

> **Este repositório tem dois projetos, mesma base Supabase:**
> - **Raiz** (este README): app mobile React Native/Expo — distribuição via APK/Expo Go. Mantido no repo, mas não é mais o foco principal.
> - **`web/`**: app web Next.js hospedado na Vercel (PWA instalável, funciona em Android e iOS sem loja/TestFlight) — ver [`web/README.md`](web/README.md). É a versão recomendada atualmente.

## Setup (app mobile)

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o projeto Supabase

1. Crie uma conta e um projeto em [supabase.com](https://supabase.com) (plano gratuito atende esse uso).
2. No **SQL Editor** do painel do Supabase, rode em ordem todos os arquivos de `supabase/migrations/` (0001 → 0010), um de cada vez.
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
4. Copie `.env.example` para `.env` e preencha:
   ```
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```

### 3. Rodar o app

```bash
npx expo start
```

Abra no celular com o app **Expo Go** (escaneando o QR code) para testar sem precisar gerar APK.

### 4. Promover o primeiro master_admin

Depois de criar sua conta pelo app (tela de cadastro), rode no SQL Editor do Supabase (trocando o e-mail):

```sql
update public.profiles
set role = 'master_admin'
where id = (select id from auth.users where email = 'seu-email@exemplo.com');
```

A partir daí, esse usuário pode promover outras contas a `admin` pela aba **Usuários** do app.

## Gerar um APK para distribuir (sem loja de app)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Ao final, a Expo gera um link de download do `.apk`. Basta enviar esse link (WhatsApp, Drive, etc.) — quem for instalar precisa permitir "instalar de fontes desconhecidas" no Android.

Para atualizar o app depois sem gerar um novo APK (mudanças só de código JS/TS), use `eas update`.

## Testes

```bash
npx jest
```

Cobre principalmente o algoritmo de sorteio em `src/domain/sorteio.ts`.
