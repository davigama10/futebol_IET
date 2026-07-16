import { definirRoleForm } from '@/app/actions/usuarios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ProfileRow } from '@/types/database.types';

interface UsuarioRowProps {
  usuario: ProfileRow;
  souEu: boolean;
}

export function UsuarioRow({ usuario, souEu }: UsuarioRowProps) {
  const ehMasterAdmin = usuario.role === 'master_admin';
  const podeAlterar = !souEu && !ehMasterAdmin;
  const novoRole = usuario.role === 'viewer' ? 'admin' : 'viewer';
  const acao = definirRoleForm.bind(null, usuario.id, novoRole);

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium">{usuario.nome}</p>
          <p className="text-sm text-muted-foreground">Papel: {usuario.role}</p>
        </div>
        {podeAlterar && (
          <form action={acao}>
            <Button type="submit" size="sm" variant="outline">
              {usuario.role === 'viewer' ? 'Promover a admin' : 'Revogar admin'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
