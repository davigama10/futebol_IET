// Tipos manuais espelhando o schema em supabase/migrations/*.sql.
// Assim que o projeto Supabase existir, substituir por:
//   npx supabase gen types typescript --project-id <id> > src/types/database.types.ts
//
// Usa `type` (não `interface`) porque o generic Database do supabase-js exige que Row/Insert/Update
// satisfaçam `Record<string, unknown>` — interfaces não satisfazem essa checagem estrutural em tipos condicionais.
import type { Posicao } from '../domain/sorteio.types';
import type { UserRole } from '../constants/roles';

export type ProfileRow = {
  id: string;
  nome: string;
  role: UserRole;
  created_at: string;
};

export type JogadorRow = {
  id: string;
  nome: string;
  nivel: number;
  posicao: Posicao;
  ativo: boolean;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
};

export type SorteioRow = {
  id: string;
  tamanho_time: 4 | 5 | 6;
  resultado: unknown; // ResultadoSorteio serializado
  criado_por: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, 'id' | 'nome'>;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      jogadores: {
        Row: JogadorRow;
        Insert: Partial<JogadorRow> & Pick<JogadorRow, 'nome' | 'nivel' | 'posicao'>;
        Update: Partial<JogadorRow>;
        Relationships: [];
      };
      sorteios: {
        Row: SorteioRow;
        Insert: Partial<SorteioRow> & Pick<SorteioRow, 'tamanho_time' | 'resultado'>;
        Update: Partial<SorteioRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
