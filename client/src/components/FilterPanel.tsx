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

interface FilterPanelProps {
  candidato: "flavio" | "canella";
  metrica: "votos" | "sinergia" | "regiao";
  onCandidatoChange: (candidato: "flavio" | "canella") => void;
  onMetricaChange: (metrica: "votos" | "sinergia" | "regiao") => void;
}

export default function FilterPanel({
  candidato,
  metrica,
  onCandidatoChange,
  onMetricaChange,
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
            onValueChange={(value: any) => onCandidatoChange(value)}
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
            Métrica
          </label>
          <ToggleGroup
            type="single"
            value={metrica}
            onValueChange={(value) => {
              if (value) onMetricaChange(value as "votos" | "sinergia" | "regiao");
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="votos" aria-label="Volume de Votos">
              Volume de Votos
            </ToggleGroupItem>
            <ToggleGroupItem value="sinergia" aria-label="Nível de Sinergia">
              Nível de Sinergia
            </ToggleGroupItem>
            <ToggleGroupItem value="regiao" aria-label="Região">
              Região
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Dica:</span> Use os filtros para explorar
          diferentes perspectivas dos dados eleitorais. Passe o mouse sobre os
          municípios no mapa para ver detalhes rápidos.
        </p>
      </div>
    </Card>
  );
}
