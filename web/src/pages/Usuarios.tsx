import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  atualizarUsuario,
  criarUsuario,
  inativarUsuario,
  listarUsuarios,
} from "../services/usuariosService";
import type { PerfilUsuario, UsuarioFormData, UsuarioPerfil } from "../types/app";

const roleOptions: Array<{ value: PerfilUsuario; label: string }> = [
  { value: "administrador", label: "Administrador" },
  { value: "operador", label: "Operador" },
  { value: "motorista", label: "Motorista" },
  { value: "auditor", label: "Auditor" },
];

const emptyForm: UsuarioFormData = {
  authUserId: "",
  nome: "",
  email: "",
  contato: "",
  setor: "",
  tipo: "auditor",
  fotoUrl: "",
  ativo: true,
};

function getRoleLabel(role: PerfilUsuario) {
  return roleOptions.find((option) => option.value === role)?.label || role;
}

function formFromUsuario(usuario: UsuarioPerfil): UsuarioFormData {
  return {
    authUserId: usuario.authUserId,
    nome: usuario.nome,
    email: usuario.email,
    contato: usuario.contato || "",
    setor: usuario.setor || "",
    tipo: usuario.tipo,
    fotoUrl: usuario.fotoUrl || "",
    ativo: usuario.ativo,
  };
}

function validateUser(data: UsuarioFormData) {
  const errors: string[] = [];
  if (!data.nome.trim()) errors.push("Informe o nome.");
  if (!data.email.trim()) errors.push("Informe o email.");
  if (!data.email.includes("@")) errors.push("Informe um email valido.");
  return errors;
}

type UserFormProps = {
  initialData: UsuarioFormData;
  mode: "create" | "edit";
  saving: boolean;
  onCancel: () => void;
  onSubmit: (data: UsuarioFormData) => Promise<void>;
};

function UserForm({
  initialData,
  mode,
  saving,
  onCancel,
  onSubmit,
}: UserFormProps) {
  const [form, setForm] = useState<UsuarioFormData>(initialData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setForm(initialData);
    setValidationErrors([]);
  }, [initialData]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors = validateUser(form);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    await onSubmit(form);
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-main">
            {mode === "create" ? "Cadastrar perfil" : "Editar perfil"}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            O login deve existir no Supabase Auth; esta tela gerencia o perfil
            interno e as permissoes.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
        >
          Fechar
        </button>
      </div>

      {validationErrors.length > 0 && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {validationErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-text-main">
          Auth user ID
          <input
            value={form.authUserId}
            onChange={(event) =>
              setForm({ ...form, authUserId: event.target.value })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            placeholder="UUID do usuario no Supabase Auth"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Perfil
          <select
            value={form.tipo}
            onChange={(event) =>
              setForm({ ...form, tipo: event.target.value as PerfilUsuario })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-text-main">
          Nome
          <input
            value={form.nome}
            onChange={(event) => setForm({ ...form, nome: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Contato
          <input
            value={form.contato}
            onChange={(event) =>
              setForm({ ...form, contato: event.target.value })
            }
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="text-sm font-medium text-text-main">
          Setor
          <input
            value={form.setor}
            onChange={(event) => setForm({ ...form, setor: event.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-text-main md:col-span-2">
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={(event) =>
              setForm({ ...form, ativo: event.target.checked })
            }
            className="h-4 w-4"
          />
          Usuario ativo
        </label>

        <div className="flex flex-col-reverse gap-3 md:col-span-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-muted transition hover:bg-background"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Salvando..." : "Salvar perfil"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<PerfilUsuario | "todos">("todos");
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [selectedUser, setSelectedUser] = useState<UsuarioPerfil | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      setUsuarios(await listarUsuarios());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nao foi possivel carregar usuarios."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      const matchesRole = roleFilter === "todos" || usuario.tipo === roleFilter;
      const matchesSearch =
        !term ||
        usuario.nome.toLowerCase().includes(term) ||
        usuario.email.toLowerCase().includes(term) ||
        (usuario.setor || "").toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }, [roleFilter, search, usuarios]);

  function openCreateForm() {
    setSelectedUser(null);
    setFormMode("create");
    setError("");
    setSuccess("");
  }

  function openEditForm(usuario: UsuarioPerfil) {
    setSelectedUser(usuario);
    setFormMode("edit");
    setError("");
    setSuccess("");
  }

  function closeForm() {
    setSelectedUser(null);
    setFormMode(null);
  }

  async function handleSubmit(data: UsuarioFormData) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (formMode === "edit" && selectedUser) {
        const updated = await atualizarUsuario(selectedUser.id, data);
        setUsuarios((current) =>
          current.map((usuario) => (usuario.id === updated.id ? updated : usuario))
        );
        setSuccess("Usuario atualizado com sucesso.");
      } else {
        const created = await criarUsuario(data);
        setUsuarios((current) => [created, ...current]);
        setSuccess("Usuario cadastrado com sucesso.");
      }
      closeForm();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nao foi possivel salvar o usuario."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(usuario: UsuarioPerfil) {
    if (!window.confirm(`Inativar ${usuario.nome}?`)) return;

    setError("");
    setSuccess("");
    try {
      await inativarUsuario(usuario.id);
      setUsuarios((current) =>
        current.map((item) =>
          item.id === usuario.id ? { ...item, ativo: false } : item
        )
      );
      setSuccess("Usuario inativado com sucesso.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Nao foi possivel inativar o usuario."
      );
    }
  }

  const formInitialData = selectedUser ? formFromUsuario(selectedUser) : emptyForm;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-main">
              Usuarios e permissoes
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Gerencie perfis internos vinculados ao Supabase Auth.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-800"
          >
            Novo perfil
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, email ou setor"
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          />
          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value as PerfilUsuario | "todos")
            }
            className="h-11 rounded-lg border border-border px-3 text-sm outline-none transition focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
          >
            <option value="todos">Todos os perfis</option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      {formMode && (
        <UserForm
          initialData={formInitialData}
          mode={formMode}
          saving={saving}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      )}

      <section className="rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-text-main">
            {filteredUsers.length} usuario(s) encontrado(s)
          </p>
          <button
            type="button"
            onClick={() => void loadUsers()}
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-text-muted transition hover:bg-background"
          >
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-text-muted">
            Carregando usuarios...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-muted">
            Nenhum usuario encontrado.
          </div>
        ) : (
          <div className="grid gap-3 p-4">
            {filteredUsers.map((usuario) => (
              <article
                key={usuario.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-semibold text-text-main">{usuario.nome}</h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {usuario.email} | {usuario.setor || "Sem setor"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                      {getRoleLabel(usuario.tipo)}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        usuario.ativo
                          ? "border-green-200 bg-green-50 text-green-800"
                          : "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(usuario)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary-800 transition hover:bg-primary-100"
                  >
                    Editar
                  </button>
                  {usuario.ativo && (
                    <button
                      type="button"
                      onClick={() => void handleDeactivate(usuario)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-100"
                    >
                      Inativar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
