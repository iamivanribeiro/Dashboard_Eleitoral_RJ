import React from "react";
import { Municipio } from "@/data/municipios";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface MunicipioDetailsProps {
  municipio: Municipio | null;
}

export default function MunicipioDetails({ municipio }: MunicipioDetailsProps) {
  if (!municipio) {
    return (
      <Card className="w-full h-full p-6 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">Selecione um município</p>
          <p className="text-sm">Clique em um município no mapa para ver detalhes</p>
        </div>
      </Card>
    );
  }

  const chartData = [
    {
      name: "Flávio Bolsonaro",
      votos: municipio.votosFlavio,
      percentual: municipio.percentualFlavio,
    },
    {
      name: "Márcio Canella",
      votos: municipio.votosCanella,
      percentual: municipio.percentualCanella,
    },
  ];

  const sinergiaData = [
    {
      name: "Índice de Sinergia",
      valor: municipio.sinergia,
    },
  ];

  return (
    <div className="w-full space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">{municipio.nome}</h2>
        <p className="text-gray-600 mb-4">{municipio.regiao}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">População</p>
            <p className="text-lg font-semibold">
              {municipio.populacao.toLocaleString("pt-BR")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Índice de Sinergia</p>
            <p className="text-lg font-semibold text-green-600">
              {municipio.sinergia.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold mb-1">Flávio Bolsonaro (2018)</p>
            <p className="text-sm text-gray-600">
              {municipio.votosFlavio.toLocaleString("pt-BR")} votos ({municipio.percentualFlavio.toFixed(2)}%)
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Márcio Canella (2022)</p>
            <p className="text-sm text-gray-600">
              {municipio.votosCanella.toLocaleString("pt-BR")} votos ({municipio.percentualCanella.toFixed(2)}%)
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Comparativo de Votos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => {
                if (typeof value === "number") {
                  return value.toLocaleString("pt-BR");
                }
                return value;
              }}
            />
            <Bar dataKey="votos" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Análise de Sinergia</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Índice de Sinergia</span>
              <span className="text-sm font-semibold text-green-600">
                {municipio.sinergia.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${Math.min(municipio.sinergia, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Interpretação:</span> Um índice de sinergia de{" "}
              <span className="font-semibold text-blue-600">
                {municipio.sinergia.toFixed(2)}%
              </span>{" "}
              indica{" "}
              {municipio.sinergia > 50
                ? "uma convergência muito forte entre as bases eleitorais de Flávio Bolsonaro e Márcio Canella."
                : municipio.sinergia > 30
                  ? "uma convergência moderada entre as bases eleitorais."
                  : "uma convergência fraca, sugerindo desafios na transferência de votos."}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
