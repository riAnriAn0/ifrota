export type PerfilUsuario = "administrador" | "operador" | "motorista" | "auditor";

export type StatusVeiculo = "disponivel" | "em_uso" | "em_manutencao" | "inativo";

export type StatusMotorista = "ativo" | "inativo" | "afastado";

export type StatusViagem = "agendada" | "em_andamento" | "finalizada" | "cancelada";

export type TipoManutencao = "corretiva" | "preventiva";

export type StatusManutencao = "pendente" | "em_andamento" | "concluida" | "cancelada";

export type SeveridadeOcorrencia = "baixa" | "media" | "alta";

export type TipoOcorrencia =
  | "problema_mecanico"
  | "atraso"
  | "acidente"
  | "desvio_rota"
  | "pneu"
  | "documentacao"
  | "outro";

export type StatusOcorrencia = "aberta" | "em_analise" | "resolvida";

export type AppRoute = {
  path: string;
  label: string;
  title: string;
  subtitle: string;
  roles: PerfilUsuario[];
  group: "principal" | "cadastros" | "operacao" | "gestao";
};

export type UsuarioPerfil = {
  id: string;
  authUserId: string;
  nome: string;
  email: string;
  tipo: PerfilUsuario;
  fotoUrl?: string;
  ativo: boolean;
};

export type Veiculo = {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  ano: number;
  numAssentos: number;
  kmAtual: number;
  status: StatusVeiculo;
  observacoes: string;
  fotoUrl: string;
};

export type VeiculoFormData = Omit<Veiculo, "id">;

export type Motorista = {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  nome: string;
  contato: string;
  categoriaCnh: string;
  validadeCnh: string;
  status: StatusMotorista;
  observacoes: string;
};

export type MotoristaFormData = Omit<
  Motorista,
  "id" | "usuarioNome" | "usuarioEmail"
>;

export type UsuarioOption = {
  id: string;
  nome: string;
  email: string;
};

export type Viagem = {
  id: string;
  motoristaId: string;
  motoristaNome: string;
  veiculoId: string;
  veiculoDescricao: string;
  veiculoPlaca: string;
  origem: string;
  destino: string;
  numPassageiros: number;
  dataSaidaPrevista: string;
  dataChegadaPrevista: string;
  kmInicial: number | null;
  kmFinal: number | null;
  status: StatusViagem;
  observacoes: string;
};

export type ViagemFormData = Omit<
  Viagem,
  "id" | "motoristaNome" | "veiculoDescricao" | "veiculoPlaca"
>;

export type Manutencao = {
  id: string;
  veiculoId: string;
  veiculoDescricao: string;
  veiculoPlaca: string;
  tipo: TipoManutencao;
  categoria: string;
  data: string;
  kmRegistro: number;
  custo: number;
  oficina: string;
  descricao: string;
  status: StatusManutencao;
  proximaDataPrevista: string;
  proximoKmPrevisto: number | null;
};

export type ManutencaoFormData = Omit<
  Manutencao,
  "id" | "veiculoDescricao" | "veiculoPlaca"
>;

export type TipoCombustivel =
  | "gasolina"
  | "etanol"
  | "diesel"
  | "diesel_s10"
  | "flex"
  | "outro";

export type Abastecimento = {
  id: string;
  veiculoId: string;
  veiculoDescricao: string;
  veiculoPlaca: string;
  motoristaId: string;
  motoristaNome: string;
  litros: number;
  valorTotal: number;
  tipoCombustivel: TipoCombustivel;
  data: string;
  kmRegistro: number;
  posto: string;
  cidade: string;
  observacoes: string;
};

export type AbastecimentoFormData = Omit<
  Abastecimento,
  "id" | "veiculoDescricao" | "veiculoPlaca" | "motoristaNome"
>;

export type Ocorrencia = {
  id: string;
  viagemId: string;
  viagemDestino: string;
  veiculoId: string;
  veiculoDescricao: string;
  veiculoPlaca: string;
  motoristaId: string;
  motoristaNome: string;
  tipo: TipoOcorrencia;
  severidade: SeveridadeOcorrencia;
  descricao: string;
  dataOcorrencia: string;
  status: StatusOcorrencia;
};

export type OcorrenciaFormData = Omit<
  Ocorrencia,
  | "id"
  | "viagemDestino"
  | "veiculoDescricao"
  | "veiculoPlaca"
  | "motoristaNome"
>;

export type AnexoOcorrencia = {
  id: string;
  ocorrenciaId: string;
  arquivoUrl: string;
  tipoArquivo: string;
  descricao: string;
};
