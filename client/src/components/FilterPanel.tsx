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
import { Map, BarChart3, Network, Search } from "lucide-react";

interface FilterPanelProps {
  candidato: "flavio" | "canella";
  metrica: "votos" | "sinergia" | "regiao";
  regioes: string[];
  regiaoSelecionada: string;
  buscaMunicipio: string;
  sinergiaMin: number;
  populacaoMin: number;
  onCandidatoChange: (candidato: "flavio" | "canella") => void;
  onMetricaChange: (metrica: "votos" | "sinergia" | "regiao") => void;
  onRegiaoChange: (regiao: string) => void;
  onBuscaMunicipioChange: (texto: string) => void;
  onSinergiaMinChange: (valor: number) => void;
  onPopulacaoMinChange: (valor: number) => void;
}

export default function FilterPanel({
  candidato,
  metrica,
  regioes,
  regiaoSelecionada,
  buscaMunicipio,
  sinergiaMin,
  populacaoMin,
  onCandidatoChange,
  onMetricaChange,
  onRegiaoChange,
  onBuscaMunicipioChange,
  onSinergiaMinChange,
  onPopulacaoMinChange,
}: FilterPanelProps) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Filtros</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Candidato
          </label>
          <Select
            value={candidato}
            onValueChange={(value: "flavio" | "canella") => onCandidatoChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um candidato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flavio">Flávio Bolsonaro (Senado 2018)</SelectItem>
              <SelectItem value="canella">Márcio Canella (Deputado 2022)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Região
          </label>
          <Select value={regiaoSelecionada} onValueChange={onRegiaoChange}>
            <SelectTrigger className="w-full">
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
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Buscar município
          </label>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={buscaMunicipio}
              onChange={(e) => onBuscaMunicipioChange(e.target.value)}
              className="pl-9"
              placeholder="Ex: Niterói"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Métrica
          </label>
          <ToggleGroup
            type="single"
            value={metrica}
            onValueChange={(value) => {
              if (value) onMetricaChange(value as "votos" | "sinergia" | "regiao");
            }}
            className="flex flex-col gap-2 w-full"
          >
            <ToggleGroupItem value="regiao" className="justify-start w-full gap-2" aria-label="Região">
              <Map className="h-4 w-4" />
              Região
            </ToggleGroupItem>
            <ToggleGroupItem value="votos" className="justify-start w-full gap-2" aria-label="Volume de Votos">
              <BarChart3 className="h-4 w-4" />
              Volume de Votos
            </ToggleGroupItem>
            <ToggleGroupItem value="sinergia" className="justify-start w-full gap-2" aria-label="Nível de Sinergia">
              <Network className="h-4 w-4" />
              Nível de Sinergia
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Sinergia mínima: {sinergiaMin.toFixed(0)}%
          </label>
          <Input
            type="range"
            min={0}
            max={100}
            step={1}
            value={sinergiaMin}
            onChange={(e) => onSinergiaMinChange(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            População mínima: {populacaoMin.toLocaleString("pt-BR")}
          </label>
          <Input
            type="range"
            min={0}
            max={1200000}
            step={5000}
            value={populacaoMin}
            onChange={(e) => onPopulacaoMinChange(Number(e.target.value))}
          />
        </div>
      </div>
    </Card>
  );
}
