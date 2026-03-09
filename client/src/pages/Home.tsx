import React, { useMemo, useState } from "react";
import { Municipio, municipios, getRegioes } from "@/data/municipios";
import CoroplethMap from "@/components/CoroplethMap";
import MunicipioDetails from "@/components/MunicipioDetails";
import FilterPanel from "@/components/FilterPanel";
import ComparativoRegional from "@/components/ComparativoRegional";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SlidersHorizontal } from "lucide-react";

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

  const kpis = useMemo(() => {
    const mediaSinergia =
      municipiosFiltrados.length === 0
        ? 0
        : municipiosFiltrados.reduce((acc, item) => acc + item.sinergia, 0) /
          municipiosFiltrados.length;

    const totalVotos = municipiosFiltrados.reduce(
      (acc, item) =>
        acc + (candidato === "flavio" ? item.votosFlavio : item.votosCanella),
      0
    );

    const regiaoLider = municipiosFiltrados.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.regiao] = (acc[item.regiao] || 0) + 1;
        return acc;
      },
      {}
    );

    const regiaoTop = Object.entries(regiaoLider).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    return { mediaSinergia, totalVotos, regiaoTop };
  }, [candidato, municipiosFiltrados]);

  const filtrosAtivos = [
    regiaoSelecionada !== "todas" ? `Região: ${regiaoSelecionada}` : null,
    buscaMunicipio ? `Busca: ${buscaMunicipio}` : null,
    sinergiaMin > 0 ? `Sinergia ≥ ${sinergiaMin}%` : null,
    populacaoMin > 0 ? `População ≥ ${populacaoMin.toLocaleString("pt-BR")}` : null,
  ].filter(Boolean) as string[];

  const clearAllFilters = () => {
    setRegiaoSelecionada("todas");
    setBuscaMunicipio("");
    setSinergiaMin(0);
    setPopulacaoMin(0);
  };

  const applyPreset = (preset: "altasinergia" | "baixada" | "populoso") => {
    if (preset === "altasinergia") {
      setSinergiaMin(50);
      setRegiaoSelecionada("todas");
      setPopulacaoMin(0);
      setBuscaMunicipio("");
    }
    if (preset === "baixada") {
      setRegiaoSelecionada("Baixada Fluminense");
      setBuscaMunicipio("");
    }
    if (preset === "populoso") {
      setPopulacaoMin(200000);
      setRegiaoSelecionada("todas");
      setBuscaMunicipio("");
    }
  };

  const filterPanel = (
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
      onClearAll={clearAllFilters}
      onPresetSelect={applyPreset}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Dashboard Eleitoral RJ 2026
            </h1>
            <p className="text-slate-600 mt-1 text-sm md:text-base">
              Mapeamento Cruzado: Flávio Bolsonaro & Márcio Canella
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros da análise</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4">{filterPanel}</div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-4"><p className="text-xs text-slate-500">Municípios filtrados</p><p className="text-2xl font-bold">{municipiosFiltrados.length}</p></Card>
          <Card className="p-4"><p className="text-xs text-slate-500">Média de sinergia</p><p className="text-2xl font-bold text-emerald-700">{kpis.mediaSinergia.toFixed(1)}%</p></Card>
          <Card className="p-4"><p className="text-xs text-slate-500">Total de votos</p><p className="text-2xl font-bold">{kpis.totalVotos.toLocaleString("pt-BR")}</p></Card>
          <Card className="p-4"><p className="text-xs text-slate-500">Região mais representada</p><p className="text-sm md:text-base font-semibold">{kpis.regiaoTop}</p></Card>
        </section>

        <section aria-live="polite" className="flex flex-wrap items-center gap-2">
          {filtrosAtivos.length === 0 ? (
            <Badge variant="outline">Sem filtros adicionais ativos</Badge>
          ) : (
            filtrosAtivos.map((filtro) => (
              <Badge key={filtro} variant="secondary">{filtro}</Badge>
            ))
          )}
        </section>

        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 sticky top-24 self-start">{filterPanel}</div>
          <div className="lg:col-span-3">
            <CoroplethMap
              metrica={metrica}
              candidato={candidato}
              municipiosFiltrados={municipiosFiltrados}
              onMunicipioClick={setMunicipioSelecionado}
            />
          </div>
        </div>

        <div className="lg:hidden">
          <Tabs defaultValue="mapa" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="mapa">Mapa</TabsTrigger>
              <TabsTrigger value="detalhes">Município</TabsTrigger>
              <TabsTrigger value="regioes">Regiões</TabsTrigger>
            </TabsList>
            <TabsContent value="mapa" className="mt-4">
              <CoroplethMap
                metrica={metrica}
                candidato={candidato}
                municipiosFiltrados={municipiosFiltrados}
                onMunicipioClick={setMunicipioSelecionado}
              />
            </TabsContent>
            <TabsContent value="detalhes" className="mt-4">
              <MunicipioDetails municipio={municipioSelecionado} />
            </TabsContent>
            <TabsContent value="regioes" className="mt-4">
              <ComparativoRegional candidato={candidato} municipiosData={municipiosFiltrados} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <MunicipioDetails municipio={municipioSelecionado} />
          </div>

          <div className="space-y-6">
            <ComparativoRegional candidato={candidato} municipiosData={municipiosFiltrados} />
            <Card className="p-6 shadow-sm">
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

        <Card className="p-6 border-gray-200 shadow-sm">
          <Accordion type="single" collapsible defaultValue="metodologia">
            <AccordionItem value="metodologia">
              <AccordionTrigger className="text-base">Metodologia do índice de sinergia</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  O índice de sinergia expressa a convergência entre desempenho percentual e volume de votos dos candidatos no município.
                  Nesta versão, adotamos uma fórmula simplificada e transparente para leitura exploratória.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4 text-sm font-mono overflow-x-auto">
                  Sinergia = 100 × (Percentual Canella ÷ Percentual Flávio) × log10(1 + Votos Canella) ÷ log10(1 + Votos Flávio)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 rounded bg-red-50 border border-red-100"><span className="font-semibold">0% a 30%</span><br />Convergência fraca</div>
                  <div className="p-3 rounded bg-amber-50 border border-amber-100"><span className="font-semibold">30% a 50%</span><br />Convergência moderada</div>
                  <div className="p-3 rounded bg-green-50 border border-green-100"><span className="font-semibold">Acima de 50%</span><br />Convergência alta</div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </main>
    </div>
  );
}
