import React, { useEffect, useState, useMemo } from "react";
import { municipios, Municipio } from "@/data/municipios";
import { Card } from "@/components/ui/card";

interface CoroplethMapProps {
  metrica: "votos" | "sinergia";
  candidato: "flavio" | "canella";
  onMunicipioClick?: (municipio: Municipio) => void;
}

export default function CoroplethMap({
  metrica,
  candidato,
  onMunicipioClick,
}: CoroplethMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredMunicipio, setHoveredMunicipio] = useState<Municipio | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    municipio: Municipio;
  } | null>(null);

  // Carregar GeoJSON do Rio de Janeiro
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-33-mun.json"
    )
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Erro ao carregar mapa:", err));
  }, []);

  // Normalizar nomes para correspondência
  const normalizeName = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Criar mapa de municípios para acesso rápido
  const municipiosMap = useMemo(() => {
    const map = new Map<string, Municipio>();
    municipios.forEach((m) => map.set(normalizeName(m.nome), m));
    return map;
  }, []);

  // Calcular cor baseada na métrica
  const getColor = (municipio: Municipio | undefined): string => {
    if (!municipio) return "#f3f4f6"; // Cor padrão para sem dados

    let valor: number;

    if (metrica === "votos") {
      valor =
        candidato === "flavio"
          ? municipio.percentualFlavio
          : municipio.percentualCanella;
    } else {
      valor = municipio.sinergia;
    }

    // Escala de cores: verde (baixo) -> amarelo -> vermelho (alto)
    if (valor < 10) return "#e8f5e9";
    if (valor < 15) return "#c8e6c9";
    if (valor < 20) return "#a5d6a7";
    if (valor < 25) return "#81c784";
    if (valor < 30) return "#66bb6a";
    if (valor < 35) return "#4caf50";
    if (valor < 40) return "#43a047";
    if (valor < 50) return "#388e3c";
    if (valor < 60) return "#2e7d32";
    if (valor < 70) return "#1b5e20";
    return "#0d3818";
  };

  // Obter valor para tooltip
  const getTooltipValue = (municipio: Municipio): string => {
    if (metrica === "votos") {
      const valor =
        candidato === "flavio"
          ? municipio.votosFlavio
          : municipio.votosCanella;
      const percentual =
        candidato === "flavio"
          ? municipio.percentualFlavio
          : municipio.percentualCanella;
      return `${valor.toLocaleString("pt-BR")} votos (${percentual.toFixed(2)}%)`;
    } else {
      return `Sinergia: ${municipio.sinergia.toFixed(2)}%`;
    }
  };

  // Processar geometria e projeção
  const { paths, viewBox } = useMemo(() => {
    if (!geoData) return { paths: [], viewBox: "0 0 800 600" };

    // Calcular bounding box do GeoJSON
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;

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

    geoData.features.forEach((f: any) => traverseCoords(f.geometry.coordinates));

    // Configurar projeção
    const width = 800;
    const height = 600;
    const padding = 20;
    
    const lonSpan = maxLon - minLon;
    const latSpan = maxLat - minLat;
    
    // Manter aspect ratio
    const scale = Math.min(
      (width - padding * 2) / lonSpan,
      (height - padding * 2) / latSpan
    );

    const project = (lon: number, lat: number) => {
      const x = padding + (lon - minLon) * scale + (width - padding * 2 - lonSpan * scale) / 2;
      const y = padding + (maxLat - lat) * scale + (height - padding * 2 - latSpan * scale) / 2;
      return [x, y];
    };

    // Gerar paths SVG
    const generatePath = (coords: any[], type: string): string => {
      if (type === "Polygon") {
        return coords.map((ring: any[]) => {
          return ring.map((c: any, i: number) => {
            const [x, y] = project(c[0], c[1]);
            return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(" ") + "Z";
        }).join(" ");
      } else if (type === "MultiPolygon") {
        return coords.map((poly: any[]) => generatePath(poly, "Polygon")).join(" ");
      }
      return "";
    };

    const calculatedPaths = geoData.features.map((feature: any) => {
      const name = feature.properties.name || feature.properties.NM_MUN;
      const municipio = municipiosMap.get(normalizeName(name));
      
      return {
        d: generatePath(feature.geometry.coordinates, feature.geometry.type),
        municipio,
        name
      };
    });

    return { paths: calculatedPaths, viewBox: `0 0 ${width} ${height}` };
  }, [geoData, municipiosMap]);

  return (
    <Card className="w-full h-full p-4">
      <div className="relative w-full h-full flex items-center justify-center min-h-[400px]">
        {!geoData ? (
          <div className="text-center text-gray-500">
            <p>Carregando mapa do Rio de Janeiro...</p>
          </div>
        ) : (
          <svg
            viewBox={viewBox}
            className="w-full h-full max-h-[600px]"
            preserveAspectRatio="xMidYMid meet"
          >
            {paths.map((p: any, i: number) => (
              <path
                key={i}
                d={p.d}
                fill={getColor(p.municipio)}
                stroke="#ffffff"
                strokeWidth="0.5"
                className="transition-all duration-200 cursor-pointer hover:opacity-80 hover:stroke-gray-500 hover:stroke-1"
                onMouseEnter={(e) => {
                  if (p.municipio) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                      municipio: p.municipio,
                    });
                    setHoveredMunicipio(p.municipio);
                  }
                }}
                onMouseLeave={() => {
                  setTooltip(null);
                  setHoveredMunicipio(null);
                }}
                onClick={() => p.municipio && onMunicipioClick?.(p.municipio)}
              />
            ))}
          </svg>
        )}

        {/* Tooltip */}
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
