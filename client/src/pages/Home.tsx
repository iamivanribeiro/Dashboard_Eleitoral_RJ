import React, { useState } from "react";
import { Municipio } from "@/data/municipios";
import CoroplethMap from "@/components/CoroplethMap";
import MunicipioDetails from "@/components/MunicipioDetails";
import FilterPanel from "@/components/FilterPanel";
import ComparativoRegional from "@/components/ComparativoRegional";

export default function Home() {
  const [candidato, setCandidato] = useState<"flavio" | "canella">("flavio");
  const [metrica, setMetrica] = useState<"votos" | "sinergia" | "regiao">("sinergia");
  const [municipioSelecionado, setMunicipioSelecionado] =
    useState<Municipio | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Eleitoral RJ 2026
          </h1>
          <p className="text-gray-600 mt-2">
            Mapeamento Cruzado: Flávio Bolsonaro & Márcio Canella
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Sidebar - Filtros */}
          <div className="lg:col-span-1">
            <FilterPanel
              candidato={candidato}
              metrica={metrica}
              onCandidatoChange={setCandidato}
              onMetricaChange={setMetrica}
            />
          </div>

          {/* Main Map */}
          <div className="lg:col-span-3">
            <CoroplethMap
              metrica={metrica}
              candidato={candidato}
              onMunicipioClick={setMunicipioSelecionado}
            />
          </div>
        </div>

        {/* Details and Comparative */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Município Details */}
          <div>
            <MunicipioDetails municipio={municipioSelecionado} />
          </div>

          {/* Comparative Regional */}
          <div>
            <ComparativoRegional candidato={candidato} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Sobre este Dashboard</h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            Este dashboard apresenta uma análise cruzada dos dados eleitorais do
            Rio de Janeiro, comparando a votação de Flávio Bolsonaro (Senado,
            2018) com a de Márcio Canella (Deputado, 2022). O índice de sinergia
            mede a convergência entre as bases eleitorais dos dois candidatos em
            cada município, indicando o potencial de transferência de votos para
            a chapa conjunta em 2026.
          </p>
        </div>
      </main>
    </div>
  );
}
