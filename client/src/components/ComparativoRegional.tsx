import React from "react";
import { Municipio, getRegioes } from "@/data/municipios";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ComparativoRegionalProps {
  candidato: "flavio" | "canella";
  municipiosData: Municipio[];
}

export default function ComparativoRegional({
  candidato,
  municipiosData,
}: ComparativoRegionalProps) {
  const regioes = getRegioes();

  const chartData = regioes
    .map((regiao) => {
      const municipiosDaRegiao = municipiosData.filter((m) => m.regiao === regiao);
      const totalVotos = municipiosDaRegiao.reduce(
        (sum, m) =>
          sum +
          (candidato === "flavio" ? m.votosFlavio : m.votosCanella),
        0
      );

      if (municipiosDaRegiao.length === 0) {
        return null;
      }

      const mediaSinergia =
        municipiosDaRegiao.reduce((sum, m) => sum + m.sinergia, 0) /
        municipiosDaRegiao.length;
      const mediaPercentual =
        municipiosDaRegiao.reduce(
          (sum, m) =>
            sum +
            (candidato === "flavio"
              ? m.percentualFlavio
              : m.percentualCanella),
          0
        ) / municipiosDaRegiao.length;

      return {
        regiao,
        votos: totalVotos,
        sinergia: mediaSinergia,
        percentual: mediaPercentual,
        municipios: municipiosDaRegiao.length,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Análise por Região</h3>
        <p className="text-sm text-gray-600">
          Comparativo de votos e sinergia por região do Rio de Janeiro
        </p>
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma região disponível para os filtros selecionados.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="regiao"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis yAxisId="left" label={{ value: "Votos", angle: -90, position: "insideLeft" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "Sinergia (%)", angle: 90, position: "insideRight" }}
              />
              <Tooltip
                formatter={(value) => {
                  if (typeof value === "number") {
                    return value.toLocaleString("pt-BR");
                  }
                  return value;
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="votos" fill="#3b82f6" name="Total de Votos" />
              <Bar yAxisId="right" dataKey="sinergia" fill="#10b981" name="Média de Sinergia" />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-1 gap-4 mt-6">
            {chartData.map((item, index) => (
              <div key={item.regiao} className="p-3 border border-gray-200 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="font-semibold text-sm">{item.regiao}</span>
                  </div>
                  <span className="text-xs text-gray-500">{item.municipios} municípios</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Votos</p>
                    <p className="font-semibold">
                      {item.votos.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Percentual Médio</p>
                    <p className="font-semibold">{item.percentual.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Sinergia Média</p>
                    <p className="font-semibold text-green-600">
                      {item.sinergia.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
