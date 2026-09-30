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

export type EstatisticaSorteioRow = {
  id: string;
  sorteio_id: string;
  jogador_id: string;
  gols: number;
  assistencias: number;
  created_at: string;
  updated_at: string;
};

export type FormatoTorneioRow = {
  id: string;
  nome: string;
  quantidade_times: number;
  criado_por: string | null;
  created_at: string;
};

export type FormatoPartidaRow = {
  id: string;
  formato_id: string;
  ordem: number;
  time_a_indice: number;
  time_b_indice: number;
};

export type TorneioStatus = 'em_andamento' | 'finalizado';

export type TorneioRow = {
  id: string;
  nome: string | null;
  data: string;
  quantidade_times: number;
  jogadores_por_time: 4 | 5 | 6;
  formato_id: string;
  status: TorneioStatus;
  criado_por: string | null;
  created_at: string;
};

export type TorneioTimeRow = {
  id: string;
  torneio_id: string;
  indice: number;
  jogadores: unknown; // JogadorSorteio[] serializado
  soma_nivel: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  pontos: number;
  cartoes_amarelos: number;
  cartoes_vermelhos: number;
};

export type PartidaStatus = 'em_andamento' | 'finalizada';

export type PartidaRow = {
  id: string;
  torneio_id: string;
  ordem: number;
  time_a_id: string;
  time_b_id: string;
  gols_time_a: number;
  gols_time_b: number;
  status: PartidaStatus;
  created_at: string;
  finalizada_em: string | null;
};

export type EventoGolRow = {
  id: string;
  partida_id: string;
  time_id: string;
  jogador_id: string;
  assistencia_jogador_id: string | null;
  gol_contra: boolean;
  created_at: string;
};

export type TipoCartao = 'amarelo' | 'vermelho';

export type EventoCartaoRow = {
  id: string;
  partida_id: string;
  time_id: string;
  jogador_id: string;
  tipo: TipoCartao;
  created_at: string;
};

export type TorneioGoleiroRow = {
  id: string;
  torneio_id: string;
  jogador_id: string;
  nome: string;
  created_at: string;
};

export type DefesaGoleiroRow = {
  id: string;
  partida_id: string;
  jogador_id: string;
  defesas: number;
  created_at: string;
  updated_at: string;
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
      estatisticas_sorteio: {
        Row: EstatisticaSorteioRow;
        Insert: Partial<EstatisticaSorteioRow> &
          Pick<EstatisticaSorteioRow, 'sorteio_id' | 'jogador_id'>;
        Update: Partial<EstatisticaSorteioRow>;
        Relationships: [];
      };
      formatos_torneio: {
        Row: FormatoTorneioRow;
        Insert: Partial<FormatoTorneioRow> & Pick<FormatoTorneioRow, 'nome' | 'quantidade_times'>;
        Update: Partial<FormatoTorneioRow>;
        Relationships: [];
      };
      formato_partidas: {
        Row: FormatoPartidaRow;
        Insert: Partial<FormatoPartidaRow> &
          Pick<FormatoPartidaRow, 'formato_id' | 'ordem' | 'time_a_indice' | 'time_b_indice'>;
        Update: Partial<FormatoPartidaRow>;
        Relationships: [];
      };
      torneios: {
        Row: TorneioRow;
        Insert: Partial<TorneioRow> &
          Pick<TorneioRow, 'data' | 'quantidade_times' | 'jogadores_por_time' | 'formato_id'>;
        Update: Partial<TorneioRow>;
        Relationships: [];
      };
      torneio_times: {
        Row: TorneioTimeRow;
        Insert: Partial<TorneioTimeRow> &
          Pick<TorneioTimeRow, 'torneio_id' | 'indice' | 'jogadores'>;
        Update: Partial<TorneioTimeRow>;
        Relationships: [];
      };
      partidas: {
        Row: PartidaRow;
        Insert: Partial<PartidaRow> &
          Pick<PartidaRow, 'torneio_id' | 'ordem' | 'time_a_id' | 'time_b_id'>;
        Update: Partial<PartidaRow>;
        Relationships: [];
      };
      eventos_gol: {
        Row: EventoGolRow;
        Insert: Partial<EventoGolRow> & Pick<EventoGolRow, 'partida_id' | 'time_id' | 'jogador_id'>;
        Update: Partial<EventoGolRow>;
        Relationships: [];
      };
      eventos_cartao: {
        Row: EventoCartaoRow;
        Insert: Partial<EventoCartaoRow> &
          Pick<EventoCartaoRow, 'partida_id' | 'time_id' | 'jogador_id' | 'tipo'>;
        Update: Partial<EventoCartaoRow>;
        Relationships: [];
      };
      torneio_goleiros: {
        Row: TorneioGoleiroRow;
        Insert: Partial<TorneioGoleiroRow> &
          Pick<TorneioGoleiroRow, 'torneio_id' | 'jogador_id' | 'nome'>;
        Update: Partial<TorneioGoleiroRow>;
        Relationships: [];
      };
      defesas_goleiro: {
        Row: DefesaGoleiroRow;
        Insert: Partial<DefesaGoleiroRow> & Pick<DefesaGoleiroRow, 'partida_id' | 'jogador_id'>;
        Update: Partial<DefesaGoleiroRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
