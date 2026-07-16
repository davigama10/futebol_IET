import { History, ShieldCheck, Shuffle, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { DashboardCard } from '@/components/dashboard-card';
import { isAdmin, isMasterAdmin } from '@/constants/roles';
import { getUserProfile } from '@/lib/supabase/profile';

export default async function InicioPage() {
  const profile = await getUserProfile();
  const admin = isAdmin(profile?.role);
  const masterAdmin = isMasterAdmin(profile?.role);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Olá, {profile?.nome}</h1>
          <p className="text-muted-foreground">Bem-vindo de volta à pelada</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {profile?.role?.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard
          href="/jogadores"
          icon={Users}
          title="Jogadores"
          description="Ver jogadores cadastrados"
        />

        {admin && (
          <DashboardCard
            href="/sorteio"
            icon={Shuffle}
            title="Sorteio da semana"
            description="Selecionar e sortear times"
          />
        )}

        <DashboardCard
          href="/historico"
          icon={History}
          title="Histórico"
          description="Sorteios anteriores"
        />

        {masterAdmin && (
          <DashboardCard
            href="/usuarios"
            icon={ShieldCheck}
            title="Usuários"
            description="Gerenciar permissões"
          />
        )}
      </div>
    </div>
  );
}
