import { useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Coordenada = [number, number];

type ResultadoBusca = {
  display_name: string;
  lat: string;
  lon: string;
};

const origemInicial: Coordenada = [-4.8589, -43.3554];
const destinoInicial: Coordenada = [-4.8656, -43.3619];

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function CliqueNoMapa({
  modoSelecao,
  setOrigem,
  setDestino,
}: {
  modoSelecao: "origem" | "destino";
  setOrigem: (coord: Coordenada) => void;
  setDestino: (coord: Coordenada) => void;
}) {
  useMapEvents({
    click(e) {
      const coordenada: Coordenada = [e.latlng.lat, e.latlng.lng];

      if (modoSelecao === "origem") {
        setOrigem(coordenada);
      } else {
        setDestino(coordenada);
      }
    },
  });

  return null;
}

export default function TesteMapaViagem() {
  const [origem, setOrigem] = useState<Coordenada>(origemInicial);
  const [destino, setDestino] = useState<Coordenada>(destinoInicial);
  const [modoSelecao, setModoSelecao] = useState<"origem" | "destino">(
    "destino"
  );

  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);

  const [rota, setRota] = useState<Coordenada[]>([]);
  const [distancia, setDistancia] = useState("");
  const [duracao, setDuracao] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function buscarLocal() {
    if (!busca.trim()) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      busca
    )}&limit=5`;

    const response = await fetch(url);
    const data = await response.json();

    setResultados(data);
  }

  function selecionarResultado(local: ResultadoBusca) {
    const coordenada: Coordenada = [
      Number(local.lat),
      Number(local.lon),
    ];

    setDestino(coordenada);
    setResultados([]);
    setBusca(local.display_name);
  }

  async function calcularRota() {
    try {
      setCarregando(true);

      const url = `https://router.project-osrm.org/route/v1/driving/${origem[1]},${origem[0]};${destino[1]},${destino[0]}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      const rotaPrincipal = data.routes[0];

      const coordenadas: Coordenada[] =
        rotaPrincipal.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );

      setRota(coordenadas);
      setDistancia((rotaPrincipal.distance / 1000).toFixed(2) + " km");
      setDuracao(Math.round(rotaPrincipal.duration / 60) + " min");
    } catch (error) {
      console.error("Erro ao calcular rota:", error);
      alert("Não foi possível calcular a rota.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Teste de Mapa e Rota
          </h1>
          <p className="text-sm text-slate-600">
            Pesquise um destino ou toque no mapa para selecionar origem/destino.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_340px]">
          <div className="overflow-hidden rounded-2xl bg-white shadow">
            <MapContainer
              center={origem}
              zoom={14}
              style={{ height: "600px", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <CliqueNoMapa
                modoSelecao={modoSelecao}
                setOrigem={setOrigem}
                setDestino={setDestino}
              />

              <Marker position={origem} icon={markerIcon}>
                <Popup>Origem</Popup>
              </Marker>

              <Marker position={destino} icon={markerIcon}>
                <Popup>Destino</Popup>
              </Marker>

              {rota.length > 0 && <Polyline positions={rota} weight={5} />}
            </MapContainer>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Planejar viagem
            </h2>

            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setModoSelecao("origem")}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                    modoSelecao === "origem"
                      ? "bg-green-700 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  Selecionar origem
                </button>

                <button
                  onClick={() => setModoSelecao("destino")}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                    modoSelecao === "destino"
                      ? "bg-green-700 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  Selecionar destino
                </button>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Buscar destino
                </label>

                <div className="mt-1 flex gap-2">
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Ex: IFMA Caxias, MA"
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600"
                  />

                  <button
                    onClick={buscarLocal}
                    className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              {resultados.length > 0 && (
                <div className="max-h-48 space-y-2 overflow-auto rounded-xl border p-2">
                  {resultados.map((local, index) => (
                    <button
                      key={index}
                      onClick={() => selecionarResultado(local)}
                      className="w-full rounded-lg p-2 text-left text-xs text-slate-700 hover:bg-slate-100"
                    >
                      {local.display_name}
                    </button>
                  ))}
                </div>
              )}

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                <p>
                  <strong>Origem:</strong> {origem[0].toFixed(5)},{" "}
                  {origem[1].toFixed(5)}
                </p>
                <p>
                  <strong>Destino:</strong> {destino[0].toFixed(5)},{" "}
                  {destino[1].toFixed(5)}
                </p>
              </div>

              <button
                onClick={calcularRota}
                disabled={carregando}
                className="w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
              >
                {carregando ? "Calculando..." : "Calcular rota"}
              </button>

              {distancia && (
                <div className="rounded-xl bg-green-50 p-4 text-sm">
                  <p>
                    <strong>Distância:</strong> {distancia}
                  </p>
                  <p>
                    <strong>Tempo estimado:</strong> {duracao}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}