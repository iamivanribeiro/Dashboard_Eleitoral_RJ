import React, { useMemo } from "react";
import { Municipio, getRegioes } from "@/data/municipios";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type RegiaoData = {
  regiao: string;
  votos: number;
  sinergia: number;
  percentual: number;
  municipios: number;
};

export default function ComparativoRegional({
  candidato,
  municipiosData,
}: ComparativoRegionalProps) {
  const regioes = getRegioes();

  const chartData = useMemo(() => {
    return regioes
      .map((regiao) => {
        const municipiosDaRegiao = municipiosData.filter((m) => m.regiao === regiao);
        const totalVotos = municipiosDaRegiao.reduce(
          (sum, m) => sum + (candidato === "flavio" ? m.votosFlavio : m.votosCanella),
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
              (candidato === "flavio" ? m.percentualFlavio : m.percentualCanella),
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
      .filter((item): item is RegiaoData => Boolean(item));
  }, [candidato, municipiosData, regioes]);

  const top3Sinergia = useMemo(
    () => [...chartData].sort((a, b) => b.sinergia - a.sinergia).slice(0, 3),
    [chartData]
  );

  const getShortLabel = (nome: string) =>
    nome.length > 12 ? `${nome.slice(0, 10)}…` : nome;

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Análise por Região</h3>
        <p className="text-sm text-gray-600">
          Comparativo de votos e sinergia por região do Rio de Janeiro
        </p>
      </div>

      {chartData.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nenhuma região disponível para os filtros selecionados.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {top3Sinergia.map((item, index) => (
              <div key={item.regiao} className="rounded-lg border border-slate-200 p-3 bg-slate-50/60">
                <p className="text-xs text-slate-500">Top {index + 1} sinergia</p>
                <p className="font-semibold text-sm text-slate-900">{item.regiao}</p>
                <p className="text-sm font-bold text-emerald-700">{item.sinergia.toFixed(2)}%</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="grafico" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grafico">Gráfico</TabsTrigger>
              <TabsTrigger value="lista">Resumo por região</TabsTrigger>
            </TabsList>

            <TabsContent value="grafico" className="mt-4">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 16, right: 12, left: 0, bottom: 36 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="regiao"
                    interval={0}
                    tick={{ fontSize: 11 }}
                    tickFormatter={getShortLabel}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis yAxisId="left" width={52} />
                  <YAxis yAxisId="right" orientation="right" width={42} />
                  <Tooltip
                    formatter={(value) =>
                      typeof value === "number" ? value.toLocaleString("pt-BR") : value
                    }
                    labelFormatter={(value) => `Região: ${value}`}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="votos" fill="#3b82f6" name="Total de Votos" />
                  <Bar yAxisId="right" dataKey="sinergia" fill="#10b981" name="Média de Sinergia" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="lista" className="mt-4">
              <div className="space-y-2">
                {chartData.map((item) => (
                  <div key={item.regiao} className="rounded-md border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{item.regiao}</span>
                      <span className="text-xs text-gray-500">{item.municipios} municípios</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                      <div>
                        <p className="text-gray-600">Votos</p>
                        <p className="font-semibold">{item.votos.toLocaleString("pt-BR")}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Percentual</p>
                        <p className="font-semibold">{item.percentual.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Sinergia</p>
                        <p className="font-semibold text-green-600">{item.sinergia.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </Card>
  );
}
