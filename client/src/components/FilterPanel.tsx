import React from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Map, BarChart3, Network, Search, FilterX } from "lucide-react";

interface FilterPanelProps {
  candidato: "flavio" | "canella";
  metrica: "votos" | "sinergia" | "regiao";
  regioes: string[];
  regiaoSelecionada: string;
  buscaMunicipio: string;
  sinergiaMin: number;
  populacaoMin: number;
  municipioSugestoes: string[];
  onCandidatoChange: (candidato: "flavio" | "canella") => void;
  onMetricaChange: (metrica: "votos" | "sinergia" | "regiao") => void;
  onRegiaoChange: (regiao: string) => void;
  onBuscaMunicipioChange: (texto: string) => void;
  onSinergiaMinChange: (valor: number) => void;
  onPopulacaoMinChange: (valor: number) => void;
  onClearAll: () => void;
  onPresetSelect: (preset: "altasinergia" | "baixada" | "populoso") => void;
}

export default function FilterPanel({
  candidato,
  metrica,
  regioes,
  regiaoSelecionada,
  buscaMunicipio,
  sinergiaMin,
  populacaoMin,
  municipioSugestoes,
  onCandidatoChange,
  onMetricaChange,
  onRegiaoChange,
  onBuscaMunicipioChange,
  onSinergiaMinChange,
  onPopulacaoMinChange,
  onClearAll,
  onPresetSelect,
}: FilterPanelProps) {
  return (
    <Card className="p-5 space-y-5 border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Filtros analíticos</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
          <FilterX className="h-4 w-4" /> Limpar
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Presets rápidos">
        <Button type="button" variant="secondary" size="sm" onClick={() => onPresetSelect("altasinergia")}>Alta sinergia</Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => onPresetSelect("baixada")}>Baixada</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onPresetSelect("populoso")}>Mais populosos</Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="candidato-select">Candidato</label>
          <Select value={candidato} onValueChange={(value: "flavio" | "canella") => onCandidatoChange(value)}>
            <SelectTrigger id="candidato-select" className="w-full">
              <SelectValue placeholder="Selecione um candidato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flavio">Flávio Bolsonaro (Senado 2018)</SelectItem>
              <SelectItem value="canella">Márcio Canella (Deputado 2022)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="regiao-select">Região</label>
          <Select value={regiaoSelecionada} onValueChange={onRegiaoChange}>
            <SelectTrigger id="regiao-select" className="w-full">
              <SelectValue placeholder="Todas as regiões" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as regiões</SelectItem>
              {regioes.map((regiao) => (
                <SelectItem key={regiao} value={regiao}>{regiao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="buscar-municipio">Buscar município</label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              id="buscar-municipio"
              value={buscaMunicipio}
              onChange={(e) => onBuscaMunicipioChange(e.target.value)}
              className="pl-9"
              placeholder="Ex: Niterói"
              list="municipio-sugestoes"
            />
            <datalist id="municipio-sugestoes">
              {municipioSugestoes.map((nome) => (
                <option key={nome} value={nome} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700 block mb-2">Métrica</span>
          <ToggleGroup
            type="single"
            value={metrica}
            onValueChange={(value) => { if (value) onMetricaChange(value as "votos" | "sinergia" | "regiao"); }}
            className="flex flex-col gap-2 w-full"
            aria-label="Escolha de métrica do mapa"
          >
            <ToggleGroupItem value="regiao" className="justify-start w-full gap-2" aria-label="Região"><Map className="h-4 w-4" /> Região</ToggleGroupItem>
            <ToggleGroupItem value="votos" className="justify-start w-full gap-2" aria-label="Volume de Votos"><BarChart3 className="h-4 w-4" /> Volume de Votos</ToggleGroupItem>
            <ToggleGroupItem value="sinergia" className="justify-start w-full gap-2" aria-label="Nível de Sinergia"><Network className="h-4 w-4" /> Nível de Sinergia</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="sinergia-range">Sinergia mínima: {sinergiaMin.toFixed(0)}%</label>
          <Input id="sinergia-range" type="range" min={0} max={100} step={1} value={sinergiaMin} onChange={(e) => onSinergiaMinChange(Number(e.target.value))} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2" htmlFor="populacao-range">População mínima: {populacaoMin.toLocaleString("pt-BR")}</label>
          <Input id="populacao-range" type="range" min={0} max={1200000} step={5000} value={populacaoMin} onChange={(e) => onPopulacaoMinChange(Number(e.target.value))} />
        </div>
      </div>
    </Card>
  );
}
