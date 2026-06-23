// src/pages/TesteMapaViagem.tsx

import { useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Coordenada = [number, number];

const origemInicial: Coordenada = [-4.8589, -43.3554]; // IFMA Caxias aproximado
const destinoInicial: Coordenada = [-4.8656, -43.3619]; // Centro aproximado

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Mapa() {
  const [origem] = useState<Coordenada>(origemInicial);
  const [destino] = useState<Coordenada>(destinoInicial);
  const [rota, setRota] = useState<Coordenada[]>([]);
  const [distancia, setDistancia] = useState<string>("");
  const [duracao, setDuracao] = useState<string>("");
  const [carregando, setCarregando] = useState(false);

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
            Tela usando Leaflet, OpenStreetMap e OSRM para testar rotas do IFROTA.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
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

              <Marker position={origem} icon={markerIcon}>
                <Popup>Origem da viagem</Popup>
              </Marker>

              <Marker position={destino} icon={markerIcon}>
                <Popup>Destino da viagem</Popup>
              </Marker>

              {rota.length > 0 && (
                <Polyline positions={rota} weight={5} />
              )}
            </MapContainer>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Dados da viagem
            </h2>

            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <strong>Origem:</strong>
                <p>{origem[0]}, {origem[1]}</p>
              </div>

              <div>
                <strong>Destino:</strong>
                <p>{destino[0]}, {destino[1]}</p>
              </div>

              <button
                onClick={calcularRota}
                disabled={carregando}
                className="w-full rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
              >
                {carregando ? "Calculando..." : "Calcular rota"}
              </button>

              {distancia && (
                <div className="rounded-xl bg-green-50 p-4">
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
