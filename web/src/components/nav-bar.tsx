import { logout } from '@/app/actions/auth';
import { BottomNav } from '@/components/bottom-nav';
import { NavLinks } from '@/components/nav-links';
import { Button } from '@/components/ui/button';
import { isAdmin, isMasterAdmin, type UserRole } from '@/constants/roles';

interface NavBarProps {
  nome: string;
  role: UserRole;
}

export function NavBar({ nome, role }: NavBarProps) {
  const admin = isAdmin(role);
  const masterAdmin = isMasterAdmin(role);

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-card/80 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 p-4">
          <span className="flex items-center gap-2 text-lg font-semibold">
            <span
              className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-lg"
              aria-hidden
            >
              ⚽
            </span>
            Pelada IET
          </span>

          <NavLinks admin={admin} masterAdmin={masterAdmin} />

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{nome}</span>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      <BottomNav admin={admin} masterAdmin={masterAdmin} />
    </>
  );
}
