import React, { useMemo, useState } from "react";
import { Municipio, municipios, getRegioes } from "@/data/municipios";
import CoroplethMap from "@/components/CoroplethMap";
import MunicipioDetails from "@/components/MunicipioDetails";
import FilterPanel from "@/components/FilterPanel";
import ComparativoRegional from "@/components/ComparativoRegional";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [candidato, setCandidato] = useState<"flavio" | "canella">("flavio");
  const [metrica, setMetrica] = useState<"votos" | "sinergia" | "regiao">("regiao");
  const [municipioSelecionado, setMunicipioSelecionado] =
    useState<Municipio | null>(null);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<string>("todas");
  const [buscaMunicipio, setBuscaMunicipio] = useState("");
  const [sinergiaMin, setSinergiaMin] = useState(0);
  const [populacaoMin, setPopulacaoMin] = useState(0);

  const regioes = useMemo(() => getRegioes(), []);

  const municipiosFiltrados = useMemo(() => {
    return municipios.filter((municipio) => {
      const filtroRegiao =
        regiaoSelecionada === "todas" || municipio.regiao === regiaoSelecionada;
      const filtroNome = municipio.nome
        .toLowerCase()
        .includes(buscaMunicipio.toLowerCase());
      const filtroSinergia = municipio.sinergia >= sinergiaMin;
      const filtroPopulacao = municipio.populacao >= populacaoMin;

      return filtroRegiao && filtroNome && filtroSinergia && filtroPopulacao;
    });
  }, [buscaMunicipio, populacaoMin, regiaoSelecionada, sinergiaMin]);

  const rankingSinergia = useMemo(
    () =>
      [...municipiosFiltrados]
        .sort((a, b) => b.sinergia - a.sinergia)
        .slice(0, 5),
    [municipiosFiltrados]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterPanel
              candidato={candidato}
              metrica={metrica}
              regioes={regioes}
              regiaoSelecionada={regiaoSelecionada}
              buscaMunicipio={buscaMunicipio}
              sinergiaMin={sinergiaMin}
              populacaoMin={populacaoMin}
              onCandidatoChange={setCandidato}
              onMetricaChange={setMetrica}
              onRegiaoChange={setRegiaoSelecionada}
              onBuscaMunicipioChange={setBuscaMunicipio}
              onSinergiaMinChange={setSinergiaMin}
              onPopulacaoMinChange={setPopulacaoMin}
            />
          </div>

          <div className="lg:col-span-3">
            <CoroplethMap
              metrica={metrica}
              candidato={candidato}
              municipiosFiltrados={municipiosFiltrados}
              onMunicipioClick={setMunicipioSelecionado}
            />
          </div>
        </div>

        <Card className="p-4 border-blue-200 bg-blue-50">
          <p className="text-sm text-blue-900">
            Filtros ativos retornaram <span className="font-semibold">{municipiosFiltrados.length}</span> municípios.
          </p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <MunicipioDetails municipio={municipioSelecionado} />
          </div>

          <div className="space-y-6">
            <ComparativoRegional candidato={candidato} municipiosData={municipiosFiltrados} />
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top 5 municípios por sinergia (filtro atual)</h3>
              <ul className="space-y-2 text-sm">
                {rankingSinergia.length === 0 ? (
                  <li className="text-gray-500">Nenhum município corresponde aos filtros.</li>
                ) : rankingSinergia.map((municipio, index) => (
                  <li key={municipio.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span>{index + 1}. {municipio.nome}</span>
                    <span className="font-semibold text-green-700">{municipio.sinergia.toFixed(2)}%</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        <Card className="p-6 border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Metodologia do índice de sinergia</h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            O índice de sinergia expressa a convergência entre desempenho percentual e volume de votos dos candidatos no município.
            Nesta versão, adotamos uma fórmula simplificada e transparente para leitura exploratória.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4 text-sm font-mono">
            Sinergia = 100 × (Percentual Canella ÷ Percentual Flávio) × log10(1 + Votos Canella) ÷ log10(1 + Votos Flávio)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded bg-red-50 border border-red-100"><span className="font-semibold">0% a 30%</span><br />Convergência fraca</div>
            <div className="p-3 rounded bg-amber-50 border border-amber-100"><span className="font-semibold">30% a 50%</span><br />Convergência moderada</div>
            <div className="p-3 rounded bg-green-50 border border-green-100"><span className="font-semibold">Acima de 50%</span><br />Convergência alta</div>
          </div>
        </Card>
      </main>
    </div>
  );
}
