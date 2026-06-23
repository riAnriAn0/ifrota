import { useState, type FormEvent } from "react";
import logoSgf from "../assets/icon_sfg.svg";
import { useAuth } from "../hooks/useAuth";

function FieldIcon({ type }: { type: "user" | "lock" }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-xs font-semibold text-gray-500">
      {type === "user" ? "@" : "*"}
    </span>
  );
}

export default function Login() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await login(email, senha);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Nao foi possivel entrar no sistema."
      );
    }
  }

  return (
    <main className="min-h-screen w-full bg-background px-4 py-8 text-text-main sm:px-6 lg:px-8">
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-[360px] rounded-lg bg-surface px-8 py-8 shadow-xl shadow-black/10 sm:max-w-[420px] sm:px-10 sm:py-10">
          <div className="mb-7 flex flex-col items-center text-center">
            <img
              src={logoSgf}
              alt="Sistema de Gestao de Frota"
              className="mb-2 h-auto w-44 sm:w-48"
            />

            <h1 className="text-lg font-semibold leading-tight text-primary-700 sm:text-xl">
              Sistema de Gestao de Frota
            </h1>

            <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
              IFMA Campus Caxias
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-text-main sm:text-base"
              >
                Email
              </label>

              <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-3 transition focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100">
                <FieldIcon type="user" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu.email@ifma.edu.br"
                  className="h-full w-full bg-transparent text-sm text-text-main outline-none placeholder:text-gray-400 sm:text-base"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="senha"
                className="mb-2 block text-sm font-medium text-text-main sm:text-base"
              >
                Senha
              </label>

              <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-3 transition focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100">
                <FieldIcon type="lock" />

                <input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Digite sua senha"
                  className="h-full w-full bg-transparent text-sm text-text-main outline-none placeholder:text-gray-400 sm:text-base"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-lg bg-primary-600 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
