import { useState } from "react";
import type { SubmitEvent } from "react";
import logoSgf from "../assets/icon_sfg.svg";

type UserRole = "admin" | "motorista";

interface LoginData {
  usuario: string;
  senha: string;
  perfil: UserRole;
}

interface LoginProps {
  onLogin?: (data: LoginData) => void;
}

function UserIcon() {
  return (
    <svg
      className="h-5 w-5 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="h-5 w-5 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V7.5a4.5 4.5 0 00-9 0v3m-.75 0h10.5A1.5 1.5 0 0118.75 12v7.5A1.5 1.5 0 0117.25 21H6.75a1.5 1.5 0 01-1.5-1.5V12a1.5 1.5 0 011.5-1.5z"
      />
    </svg>
  );
}

export default function Login({ onLogin }: LoginProps) {
  const [perfil, setPerfil] = useState<UserRole>("admin");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
  event.preventDefault();

  const loginData: LoginData = {
    usuario,
    senha,
    perfil,
  };

  console.log("Dados do login:", loginData);
  onLogin?.(loginData);
}

  return (
    <main className="min-h-screen w-full bg-background px-4 py-8 text-text-main sm:px-6 lg:px-8">
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-[345px] rounded-2xl bg-surface px-8 py-8 shadow-xl shadow-black/15 sm:max-w-[420px] sm:px-10 sm:py-10">
          <div className="mb-7 flex flex-col items-center text-center">
            <img
              src={logoSgf}
              alt="Sistema de Gestão de Frota"
              className="mb-2 h-auto w-44 sm:w-48"
            />

            <h1 className="text-lg font-semibold leading-tight text-primary-700 sm:text-xl">
              Sistema de Gestão de Frota
            </h1>

            <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
              Instituto Federal do
              <br />
              Maranhão
            </p>
          </div>

          <div className="mb-7 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPerfil("admin")}
              className={`h-10 rounded-lg text-sm font-medium transition sm:h-11 sm:text-base ${
                perfil === "admin"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Admin
            </button>

            <button
              type="button"
              onClick={() => setPerfil("motorista")}
              className={`h-10 rounded-lg text-sm font-medium transition sm:h-11 sm:text-base ${
                perfil === "motorista"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Motorista
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="usuario"
                className="mb-2 block text-sm font-medium text-text-main sm:text-base"
              >
                Usuário
              </label>

              <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-3 transition focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100 sm:h-13">
                <UserIcon />

                <input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(event) => setUsuario(event.target.value)}
                  placeholder="Digite seu usuário"
                  className="h-full w-full bg-transparent text-sm text-text-main outline-none placeholder:text-gray-400 sm:text-base"
                  autoComplete="username"
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

              <div className="flex h-12 items-center gap-3 rounded-lg border border-border bg-white px-3 transition focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-100 sm:h-13">
                <LockIcon />

                <input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Digite sua senha"
                  className="h-full w-full bg-transparent text-sm text-text-main outline-none placeholder:text-gray-400 sm:text-base"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 h-12 w-full rounded-lg bg-primary-600 text-sm font-medium text-white transition hover:bg-primary-700 active:bg-primary-800 sm:h-13 sm:text-base"
            >
              Entrar
            </button>
          </form>

          <button
            type="button"
            className="mx-auto mt-7 block text-sm font-medium text-primary-700 transition hover:text-primary-800 hover:underline"
          >
            Esqueceu sua senha?
          </button>
        </div>
      </section>
    </main>
  );
}