import type { AppRoute, PerfilUsuario } from "../types/app";

export const allRoles: PerfilUsuario[] = [
  "administrador",
  "operador",
  "motorista",
  "auditor",
];

export const appRoutes: AppRoute[] = [
  {
    path: "/",
    label: "Dashboard",
    title: "Dashboard administrativo",
    subtitle: "Resumo geral da frota institucional",
    roles: ["administrador", "operador", "auditor"],
    group: "principal",
  },
  {
    path: "/motorista",
    label: "Motorista",
    title: "Painel do motorista",
    subtitle: "Viagens, quilometragem, abastecimentos e ocorrencias",
    roles: ["motorista", "administrador"],
    group: "principal",
  },
  {
    path: "/usuarios",
    label: "Usuarios",
    title: "Usuarios e permissoes",
    subtitle: "Controle de acesso por perfil",
    roles: ["administrador"],
    group: "gestao",
  },
  {
    path: "/veiculos",
    label: "Veiculos",
    title: "Veiculos",
    subtitle: "Cadastro, status e historico da frota",
    roles: ["administrador", "operador", "auditor"],
    group: "cadastros",
  },
  {
    path: "/motoristas",
    label: "Motoristas",
    title: "Motoristas",
    subtitle: "CNH, status e dados operacionais",
    roles: ["administrador", "operador", "auditor"],
    group: "cadastros",
  },
  {
    path: "/viagens",
    label: "Viagens",
    title: "Viagens",
    subtitle: "Agendamento, inicio, finalizacao e acompanhamento",
    roles: ["administrador", "operador", "motorista", "auditor"],
    group: "operacao",
  },
  {
    path: "/calendario",
    label: "Calendario",
    title: "Calendario de viagens",
    subtitle: "Agenda de viagens, manutencoes e indisponibilidades",
    roles: ["administrador", "operador", "auditor"],
    group: "operacao",
  },
  {
    path: "/manutencoes",
    label: "Manutencoes",
    title: "Manutencoes",
    subtitle: "Corretivas, preventivas e proximos vencimentos",
    roles: ["administrador", "operador", "auditor"],
    group: "operacao",
  },
  {
    path: "/abastecimentos",
    label: "Abastecimentos",
    title: "Abastecimentos",
    subtitle: "Combustivel, custos e quilometragem",
    roles: ["administrador", "operador", "motorista", "auditor"],
    group: "operacao",
  },
  {
    path: "/ocorrencias",
    label: "Ocorrencias",
    title: "Ocorrencias",
    subtitle: "Registros de viagem com destaque para severidade alta",
    roles: ["administrador", "operador", "motorista", "auditor"],
    group: "operacao",
  },
  {
    path: "/relatorios",
    label: "Relatorios",
    title: "Relatorios",
    subtitle: "Uso, custos, historicos e indicadores",
    roles: ["administrador", "operador", "auditor"],
    group: "gestao",
  },
  {
    path: "/configuracoes",
    label: "Perfil",
    title: "Configuracoes",
    subtitle: "Dados do usuario e preferencias",
    roles: allRoles,
    group: "gestao",
  },
];

export function getRouteByPath(path: string) {
  return appRoutes.find((route) => route.path === path) || appRoutes[0];
}

export function canAccessRoute(route: AppRoute, role: PerfilUsuario) {
  return route.roles.includes(role);
}
