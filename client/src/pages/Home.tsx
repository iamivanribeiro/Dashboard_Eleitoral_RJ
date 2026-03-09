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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTheme } from "@/contexts/ThemeContext";
import { Compass, MoonStar, SlidersHorizontal, SunMedium, X } from "lucide-react";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [candidato, setCandidato] = useState<"flavio" | "canella">("flavio");
  const [metrica, setMetrica] = useState<"votos" | "sinergia" | "regiao">("regiao");
  const [municipioSelecionado, setMunicipioSelecionado] = useState<Municipio | null>(null);
  const [ultimosMunicipios, setUltimosMunicipios] = useState<Municipio[]>([]);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<string>("todas");
  const [buscaMunicipio, setBuscaMunicipio] = useState("");
  const [sinergiaMin, setSinergiaMin] = useState(0);
  const [populacaoMin, setPopulacaoMin] = useState(0);

  const regioes = useMemo(() => getRegioes(), []);
  const municipioSugestoes = useMemo(
    () => municipios.map((m) => m.nome).sort((a, b) => a.localeCompare(b, "pt-BR")),
    []
  );

  const municipiosFiltrados = useMemo(() => {
    return municipios.filter((municipio) => {
      const filtroRegiao = regiaoSelecionada === "todas" || municipio.regiao === regiaoSelecionada;
      const filtroNome = municipio.nome.toLowerCase().includes(buscaMunicipio.toLowerCase());
      const filtroSinergia = municipio.sinergia >= sinergiaMin;
      const filtroPopulacao = municipio.populacao >= populacaoMin;
      return filtroRegiao && filtroNome && filtroSinergia && filtroPopulacao;
    });
  }, [buscaMunicipio, populacaoMin, regiaoSelecionada, sinergiaMin]);

  const rankingSinergia = useMemo(
    () => [...municipiosFiltrados].sort((a, b) => b.sinergia - a.sinergia).slice(0, 5),
    [municipiosFiltrados]
  );

  const kpis = useMemo(() => {
    const mediaSinergia =
      municipiosFiltrados.length === 0
        ? 0
        : municipiosFiltrados.reduce((acc, item) => acc + item.sinergia, 0) /
          municipiosFiltrados.length;
    const totalVotos = municipiosFiltrados.reduce(
      (acc, item) => acc + (candidato === "flavio" ? item.votosFlavio : item.votosCanella),
      0
    );
    const regiaoLider = municipiosFiltrados.reduce<Record<string, number>>((acc, item) => {
      acc[item.regiao] = (acc[item.regiao] || 0) + 1;
      return acc;
    }, {});
    const regiaoTop = Object.entries(regiaoLider).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
    return { mediaSinergia, totalVotos, regiaoTop };
  }, [candidato, municipiosFiltrados]);

  const filtrosAtivos = [
    regiaoSelecionada !== "todas"
      ? { key: "regiao", label: `Região: ${regiaoSelecionada}`, clear: () => setRegiaoSelecionada("todas") }
      : null,
    buscaMunicipio
      ? { key: "busca", label: `Busca: ${buscaMunicipio}`, clear: () => setBuscaMunicipio("") }
      : null,
    sinergiaMin > 0
      ? { key: "sinergia", label: `Sinergia ≥ ${sinergiaMin}%`, clear: () => setSinergiaMin(0) }
      : null,
    populacaoMin > 0
      ? {
          key: "populacao",
          label: `População ≥ ${populacaoMin.toLocaleString("pt-BR")}`,
          clear: () => setPopulacaoMin(0),
        }
      : null,
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

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

  const handleMunicipioSelect = (municipio: Municipio) => {
    setMunicipioSelecionado(municipio);
    setUltimosMunicipios((prev) => [municipio, ...prev.filter((item) => item.id !== municipio.id)].slice(0, 5));
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
      municipioSugestoes={municipioSugestoes}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <a href="#etapa-recorte" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 bg-white dark:bg-slate-900 border rounded px-3 py-2 text-sm">Ir para recorte</a>
      <a href="#etapa-mapa" className="sr-only focus:not-sr-only focus:fixed focus:top-14 focus:left-2 focus:z-50 bg-white dark:bg-slate-900 border rounded px-3 py-2 text-sm">Ir para mapa</a>
      <a href="#etapa-comparacao" className="sr-only focus:not-sr-only focus:fixed focus:top-26 focus:left-2 focus:z-50 bg-white dark:bg-slate-900 border rounded px-3 py-2 text-sm">Ir para comparação</a>

      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Dashboard Eleitoral RJ 2026</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1 text-sm md:text-base">Fluxo de decisão: recorte → exploração → comparação → validação</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={toggleTheme} aria-label="Alternar modo escuro">
              {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />} {theme === "dark" ? "Light" : "Dark"}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden"><SlidersHorizontal className="h-4 w-4" /> Filtros</Button>
              </SheetTrigger>
              <SheetContent side="right" className="overflow-y-auto">
                <SheetHeader><SheetTitle>Etapa 1: Defina o recorte</SheetTitle></SheetHeader>
                <div className="px-4 pb-4">{filterPanel}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <Card className="p-3 md:p-4 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"><Compass className="h-4 w-4" /> Navegação por contexto</div>
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Navegação contextual da dashboard">
            <Button asChild size="sm" variant="outline"><a href="#etapa-recorte">1. Recorte</a></Button>
            <Button asChild size="sm" variant="outline"><a href="#etapa-mapa">2. Mapa</a></Button>
            <Button asChild size="sm" variant="outline"><a href="#etapa-comparacao">3. Comparação</a></Button>
            <Button asChild size="sm" variant="outline"><a href="#etapa-metodologia">4. Metodologia</a></Button>
          </nav>
        </Card>

        <section id="etapa-recorte" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 scroll-mt-28" aria-label="Resumo executivo">
          <Card className="p-4"><p className="text-xs text-slate-500 dark:text-slate-400">Municípios filtrados</p><p className="text-2xl font-bold">{municipiosFiltrados.length}</p></Card>
          <Card className="p-4"><p className="text-xs text-slate-500 dark:text-slate-400">Média de sinergia</p><p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{kpis.mediaSinergia.toFixed(1)}%</p></Card>
          <Card className="p-4"><p className="text-xs text-slate-500 dark:text-slate-400">Total de votos</p><p className="text-2xl font-bold">{kpis.totalVotos.toLocaleString("pt-BR")}</p></Card>
          <Card className="p-4"><p className="text-xs text-slate-500 dark:text-slate-400">Região mais representada</p><p className="text-sm md:text-base font-semibold">{kpis.regiaoTop}</p></Card>
        </section>

        <section aria-live="polite" className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Etapa 1 · Recorte ativo</Badge>
          {filtrosAtivos.length === 0 ? (
            <Badge variant="outline">Sem filtros adicionais ativos</Badge>
          ) : (
            filtrosAtivos.map((filtro) => (
              <Badge key={filtro.key} variant="secondary" className="gap-1 pr-1">
                {filtro.label}
                <Button type="button" size="icon-sm" variant="ghost" className="h-5 w-5" aria-label={`Remover filtro ${filtro.label}`} onClick={filtro.clear}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))
          )}
        </section>

        <section id="etapa-mapa" className="space-y-3 scroll-mt-28" aria-label="Etapa 2: exploração geográfica">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Etapa 2 · Explore no mapa</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Clique em um município para abrir o detalhamento</p>
          </div>

          <div className="hidden lg:grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside id="painel-filtros" className="lg:col-span-1 sticky top-24 self-start" aria-label="Painel de recorte">{filterPanel}</aside>
            <div id="mapa-principal" className="lg:col-span-3">
              <CoroplethMap metrica={metrica} candidato={candidato} municipiosFiltrados={municipiosFiltrados} onMunicipioClick={handleMunicipioSelect} />
            </div>
          </div>

          <div className="lg:hidden">
            <Tabs defaultValue="mapa" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="mapa">2. Mapa</TabsTrigger>
                <TabsTrigger value="detalhes">3. Município</TabsTrigger>
                <TabsTrigger value="regioes">3. Regiões</TabsTrigger>
              </TabsList>
              <TabsContent value="mapa" className="mt-4">
                <CoroplethMap metrica={metrica} candidato={candidato} municipiosFiltrados={municipiosFiltrados} onMunicipioClick={handleMunicipioSelect} />
              </TabsContent>
              <TabsContent value="detalhes" className="mt-4"><MunicipioDetails municipio={municipioSelecionado} /></TabsContent>
              <TabsContent value="regioes" className="mt-4"><ComparativoRegional candidato={candidato} municipiosData={municipiosFiltrados} /></TabsContent>
            </Tabs>
          </div>
        </section>

        <section id="etapa-comparacao" className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-28" aria-label="Etapa 3: comparação e validação">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Etapa 3 · Compare por município</h2>
            <Card className="p-4 border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Últimos municípios vistos</p>
              {ultimosMunicipios.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400">Ainda não há histórico de seleção.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ultimosMunicipios.map((m) => (
                    <Button key={m.id} type="button" variant="outline" size="sm" onClick={() => setMunicipioSelecionado(m)}>
                      {m.nome}
                    </Button>
                  ))}
                </div>
              )}
            </Card>
            <MunicipioDetails municipio={municipioSelecionado} />
          </div>

          <div className="space-y-6" id="comparativo-regional">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Etapa 3 · Compare por região</h2>
              <ComparativoRegional candidato={candidato} municipiosData={municipiosFiltrados} />
            </div>

            <Card className="p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Top 5 municípios por sinergia (filtro atual)</h3>
              <ul className="space-y-2 text-sm">
                {rankingSinergia.length === 0 ? (
                  <li className="text-gray-500 dark:text-slate-400">Nenhum município corresponde aos filtros.</li>
                ) : (
                  rankingSinergia.map((municipio, index) => (
                    <li key={municipio.id} className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-2">
                      <span>{index + 1}. {municipio.nome}</span>
                      <span className="font-semibold text-green-700 dark:text-emerald-400">{municipio.sinergia.toFixed(2)}%</span>
                    </li>
                  ))
                )}
              </ul>
            </Card>
          </div>
        </section>

        <section id="etapa-metodologia" className="scroll-mt-28" aria-label="Etapa 4: metodologia e interpretação">
          <Card className="p-6 border-gray-200 dark:border-slate-700 shadow-sm">
            <Accordion type="single" collapsible defaultValue="metodologia">
              <AccordionItem value="metodologia">
                <AccordionTrigger className="text-base">Etapa 4 · Valide com a metodologia do índice de sinergia</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
                    O índice de sinergia expressa a convergência entre desempenho percentual e volume de votos dos candidatos no município.
                    Nesta versão, adotamos uma fórmula simplificada e transparente para leitura exploratória.
                  </p>
                  <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded p-3 mb-4 text-sm font-mono overflow-x-auto">
                    Sinergia = 100 × (Percentual Canella ÷ Percentual Flávio) × log10(1 + Votos Canella) ÷ log10(1 + Votos Flávio)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="p-3 rounded bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900"><span className="font-semibold">0% a 30%</span><br />Convergência fraca</div>
                    <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900"><span className="font-semibold">30% a 50%</span><br />Convergência moderada</div>
                    <div className="p-3 rounded bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900"><span className="font-semibold">Acima de 50%</span><br />Convergência alta</div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </section>
      </main>
    </div>
  );
}
