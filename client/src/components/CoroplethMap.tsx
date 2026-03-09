import React, { useEffect, useMemo, useState } from "react";
import { municipios, Municipio, getRegioes } from "@/data/municipios";
import { Card } from "@/components/ui/card";

type GeoFeature = {
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: any[];
  };
  properties: {
    name?: string;
    NM_MUN?: string;
  };
};

type GeoData = {
  features: GeoFeature[];
};

const GEOJSON_URL =
  "https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-33-mun.json";
const GEOJSON_CACHE_KEY = "rj-geojson-v1";

interface CoroplethMapProps {
  metrica: "votos" | "sinergia" | "regiao";
  candidato: "flavio" | "canella";
  municipiosFiltrados: Municipio[];
  onMunicipioClick?: (municipio: Municipio) => void;
}

export default function CoroplethMap({
  metrica,
  candidato,
  municipiosFiltrados,
  onMunicipioClick,
}: CoroplethMapProps) {
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    municipio: Municipio;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const normalizeName = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  useEffect(() => {
    let ignore = false;

    async function loadGeoData() {
      setLoadError(null);

      try {
        const cachedRaw = localStorage.getItem(GEOJSON_CACHE_KEY);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw) as GeoData;
          if (Array.isArray(parsed.features) && parsed.features.length > 0) {
            setGeoData(parsed);
            return;
          }
        }
      } catch {
        localStorage.removeItem(GEOJSON_CACHE_KEY);
      }

      try {
        const response = await fetch(GEOJSON_URL);
        if (!response.ok) {
          throw new Error(`Falha HTTP ${response.status}`);
        }

        const data = (await response.json()) as GeoData;
        if (!Array.isArray(data.features) || data.features.length === 0) {
          throw new Error("GeoJSON inválido ou vazio");
        }

        if (!ignore) {
          setGeoData(data);
          localStorage.setItem(GEOJSON_CACHE_KEY, JSON.stringify(data));
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error instanceof Error ? error.message : "Erro desconhecido");
        }
      }
    }

    loadGeoData();

    return () => {
      ignore = true;
    };
  }, [reloadCount]);

  const municipiosMap = useMemo(() => {
    const map = new Map<string, Municipio>();
    municipios.forEach((m) => map.set(normalizeName(m.nome), m));
    return map;
  }, []);

  const municipiosFiltradosSet = useMemo(
    () => new Set(municipiosFiltrados.map((m) => m.id)),
    [municipiosFiltrados]
  );

  const REGIOES_COLORS: { [key: string]: string } = useMemo(() => {
    const regioes = getRegioes();
    const colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#14b8a6",
      "#f97316",
    ];
    const colorMap: { [key: string]: string } = {};
    regioes.forEach((regiao, index) => {
      colorMap[regiao] = colors[index % colors.length];
    });
    return colorMap;
  }, []);

  const getColor = (municipio: Municipio | undefined): string => {
    if (!municipio) return "#f3f4f6";

    if (metrica === "regiao") {
      return REGIOES_COLORS[municipio.regiao] || "#e5e7eb";
    }

    const valor =
      metrica === "votos"
        ? candidato === "flavio"
          ? municipio.percentualFlavio
          : municipio.percentualCanella
        : municipio.sinergia;

    if (valor < 10) return "#eff6ff";
    if (valor < 20) return "#dbeafe";
    if (valor < 30) return "#bfdbfe";
    if (valor < 40) return "#93c5fd";
    if (valor < 50) return "#60a5fa";
    if (valor < 60) return "#fed7aa";
    if (valor < 70) return "#fb923c";
    if (valor < 80) return "#f87171";
    if (valor < 90) return "#ef4444";
    return "#dc2626";
  };

  const getTooltipValue = (municipio: Municipio): string => {
    if (metrica === "votos") {
      const valor =
        candidato === "flavio" ? municipio.votosFlavio : municipio.votosCanella;
      const percentual =
        candidato === "flavio"
          ? municipio.percentualFlavio
          : municipio.percentualCanella;
      return `${valor.toLocaleString("pt-BR")} votos (${percentual.toFixed(2)}%)`;
    }

    if (metrica === "sinergia") {
      return `Sinergia: ${municipio.sinergia.toFixed(2)}%`;
    }

    return "";
  };

  const { paths, viewBox, semDadosCount } = useMemo(() => {
    if (!geoData) {
      return { paths: [], viewBox: "0 0 800 600", semDadosCount: 0 };
    }

    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    const traverseCoords = (coords: any[]) => {
      if (typeof coords[0] === "number") {
        const [lon, lat] = coords;
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      } else {
        coords.forEach(traverseCoords);
      }
    };

    geoData.features.forEach((f) => traverseCoords(f.geometry.coordinates));

    const width = 800;
    const height = 600;
    const padding = 20;

    const lonSpan = maxLon - minLon;
    const latSpan = maxLat - minLat;
    const scale = Math.min(
      (width - padding * 2) / lonSpan,
      (height - padding * 2) / latSpan
    );

    const project = (lon: number, lat: number) => {
      const x =
        padding +
        (lon - minLon) * scale +
        (width - padding * 2 - lonSpan * scale) / 2;
      const y =
        padding +
        (maxLat - lat) * scale +
        (height - padding * 2 - latSpan * scale) / 2;
      return [x, y];
    };

    const generatePath = (coords: any[], type: string): string => {
      if (type === "Polygon") {
        return coords
          .map((ring: any[]) => {
            return (
              ring
                .map((c: any, i: number) => {
                  const [x, y] = project(c[0], c[1]);
                  return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" ") + "Z"
            );
          })
          .join(" ");
      }

      if (type === "MultiPolygon") {
        return coords.map((poly: any[]) => generatePath(poly, "Polygon")).join(" ");
      }

      return "";
    };

    let semDados = 0;
    const calculatedPaths = geoData.features.map((feature) => {
      const name = feature.properties.name || feature.properties.NM_MUN || "";
      const municipio = municipiosMap.get(normalizeName(name));
      if (!municipio) semDados += 1;

      return {
        d: generatePath(feature.geometry.coordinates, feature.geometry.type),
        municipio,
        name,
      };
    });

    return {
      paths: calculatedPaths,
      viewBox: `0 0 ${width} ${height}`,
      semDadosCount: semDados,
    };
  }, [geoData, municipiosMap]);

  return (
    <Card className="w-full h-full p-4">
      <div className="relative w-full h-full flex items-center justify-center min-h-[400px]">
        {!geoData && !loadError && (
          <div className="text-center text-gray-500">
            <p>Carregando mapa do Rio de Janeiro...</p>
          </div>
        )}

        {loadError && !geoData && (
          <div className="text-center text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md">
            <p className="font-medium mb-2">Não foi possível carregar o mapa.</p>
            <p className="text-sm mb-3">Detalhe: {loadError}</p>
            <button
              type="button"
              className="text-sm px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setReloadCount((value) => value + 1)}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {geoData && (
          <svg
            viewBox={viewBox}
            className="w-full h-full max-h-[600px]"
            preserveAspectRatio="xMidYMid meet"
          >
            {paths.map((p: any, i: number) => {
              const ativo = p.municipio && municipiosFiltradosSet.has(p.municipio.id);
              return (
                <path
                  key={i}
                  d={p.d}
                  fill={getColor(p.municipio)}
                  fillOpacity={ativo ? 1 : 0.2}
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  className="transition-all duration-200 cursor-pointer hover:opacity-80 hover:stroke-gray-500 hover:stroke-1"
                  onMouseEnter={(e) => {
                    if (p.municipio && ativo) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                        municipio: p.municipio,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setTooltip(null);
                  }}
                  onClick={() => {
                    if (p.municipio && ativo) {
                      onMunicipioClick?.(p.municipio);
                    }
                  }}
                />
              );
            })}
          </svg>
        )}

        <MapLegend
          metrica={metrica}
          regioesColors={REGIOES_COLORS}
          semDadosCount={semDadosCount}
        />

        {tooltip && (
          <div
            className="fixed bg-gray-900 text-white text-sm px-3 py-2 rounded shadow-lg z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: tooltip.x,
              top: tooltip.y - 10,
            }}
          >
            <div className="font-semibold">{tooltip.municipio.nome}</div>
            <div className="text-xs">{tooltip.municipio.regiao}</div>
            <div className="text-xs mt-1">{getTooltipValue(tooltip.municipio)}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

const MapLegend = ({
  metrica,
  regioesColors,
  semDadosCount,
}: {
  metrica: "votos" | "sinergia" | "regiao";
  regioesColors: { [key: string]: string };
  semDadosCount: number;
}) => {
  if (metrica === "regiao") {
    return (
      <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md">
        <h4 className="font-semibold text-xs mb-2">Regiões</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
          {Object.entries(regioesColors).map(([regiao, color]) => (
            <div key={regiao} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-xs">{regiao}</span>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-gray-600">Sem dados no mapa: {semDadosCount}</div>
      </div>
    );
  }

  const legendTitle = metrica === "votos" ? "Votos (%)" : "Sinergia (%)";
  const gradient = "linear-gradient(to right, #eff6ff, #60a5fa, #fb923c, #dc2626)";

  return (
    <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md">
      <h4 className="font-semibold text-xs mb-1">{legendTitle}</h4>
      <div className="flex items-center space-x-2 mb-1">
        <span className="text-xs">0</span>
        <div className="w-28 h-3 rounded" style={{ background: gradient }} />
        <span className="text-xs">100</span>
      </div>
      <div className="text-[11px] text-gray-600">Cinza claro: fora do filtro ou sem dados.</div>
    </div>
  );
};
