import ModulePage from "./ModulePage";

export default function Usuarios() {
  return (
    <ModulePage
      title="Usuarios e permissoes"
      description="Perfis de administrador, operador, motorista e auditor vinculados ao Supabase Auth."
      actionLabel="Novo usuario"
      columns={["Nome", "Email", "Perfil", "Ativo", "Acoes"]}
    />
  );
}
