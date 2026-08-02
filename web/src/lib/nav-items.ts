import { History, Home, ShieldCheck, Shuffle, Trophy, Users, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  show: boolean;
}

export function getNavItems(admin: boolean, masterAdmin: boolean): NavItem[] {
  return [
    { href: '/', label: 'Início', icon: Home, show: true },
    { href: '/jogadores', label: 'Jogadores', icon: Users, show: true },
    { href: '/sorteio', label: 'Sorteio', icon: Shuffle, show: admin },
    { href: '/torneios', label: 'Torneios', icon: Trophy, show: true },
    { href: '/historico', label: 'Histórico', icon: History, show: true },
    { href: '/usuarios', label: 'Usuários', icon: ShieldCheck, show: masterAdmin },
  ].filter((item) => item.show);
}
