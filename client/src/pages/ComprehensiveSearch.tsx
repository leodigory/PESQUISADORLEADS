import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Search as SearchIcon,
  ExternalLink,
  Loader2,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const BRAZILIAN_STATES = [
  { code: "AC", name: "Acre" },
  { code: "AL", name: "Alagoas" },
  { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" },
  { code: "BA", name: "Bahia" },
  { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" },
  { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "MG", name: "Minas Gerais" },
  { code: "PA", name: "Pará" },
  { code: "PB", name: "Paraíba" },
  { code: "PR", name: "Paraná" },
  { code: "PE", name: "Pernambuco" },
  { code: "PI", name: "Piauí" },
  { code: "RJ", name: "Rio de Janeiro" },
  { code: "RN", name: "Rio Grande do Norte" },
  { code: "RS", name: "Rio Grande do Sul" },
  { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" },
  { code: "SC", name: "Santa Catarina" },
  { code: "SP", name: "São Paulo" },
  { code: "SE", name: "Sergipe" },
  { code: "TO", name: "Tocantins" },
];

const CITIES_BY_STATE: Record<string, string[]> = {
  SP: ["São Paulo", "Campinas", "Santos", "Sorocaba", "Ribeirão Preto"],
  RJ: ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu"],
  MG: ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista"],
  RS: ["Porto Alegre", "Caxias do Sul", "Pelotas"],
  PR: ["Curitiba", "Londrina", "Maringá"],
  PE: ["Recife", "Jaboatão dos Guararapes", "Olinda"],
  CE: ["Fortaleza", "Caucaia", "Maracanaú"],
};

const NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  "São Paulo": [
    "Centro",
    "Vila Madalena",
    "Pinheiros",
    "Higienópolis",
    "Consolação",
    "Bela Vista",
    "Liberdade",
    "Tatuapé",
    "Mooca",
    "Zona Leste",
  ],
  "Rio de Janeiro": [
    "Centro",
    "Copacabana",
    "Ipanema",
    "Leblon",
    "Barra da Tijuca",
    "Botafogo",
    "Flamengo",
    "Zona Norte",
  ],
  "Belo Horizonte": [
    "Centro",
    "Savassi",
    "Funcionários",
    "Lourdes",
    "Santo Agostinho",
  ],
  Campinas: ["Centro", "Vila Brandina", "Cambuí", "Barão Geraldo"],
  Curitiba: ["Centro", "Batel", "Água Verde", "Bigorrilho"],
};

const PLATFORMS = [
  { id: "instagram", name: "Instagram", color: "bg-pink-100 text-pink-700" },
  { id: "facebook", name: "Facebook", color: "bg-blue-100 text-blue-700" },
  { id: "marketplace", name: "Marketplace", color: "bg-orange-100 text-orange-700" },
  { id: "linkedin", name: "LinkedIn", color: "bg-blue-600 text-white" },
  { id: "pdf", name: "PDFs", color: "bg-red-100 text-red-700" },
  { id: "spreadsheet", name: "Planilhas", color: "bg-green-100 text-green-700" },
];

export default function ComprehensiveSearch() {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
  const [stateSearch, setStateSearch] = useState<string>("");
  const [citySearch, setCitySearch] = useState<string>("");
  const [neighborhoodSearch, setNeighborhoodSearch] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<string>("");
  const [completedPlatforms, setCompletedPlatforms] = useState<string[]>([]);
  const [searchProgress, setSearchProgress] = useState(0);

  const filteredStates = useMemo(() => {
    if (!stateSearch) return BRAZILIAN_STATES;
    return BRAZILIAN_STATES.filter(
      (s) =>
        s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(stateSearch.toLowerCase())
    );
  }, [stateSearch]);

  const filteredCities = useMemo(() => {
    if (!selectedState || !citySearch) return CITIES_BY_STATE[selectedState] || [];
    const cities = CITIES_BY_STATE[selectedState] || [];
    return cities.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()));
  }, [selectedState, citySearch]);

  const filteredNeighborhoods = useMemo(() => {
    if (!selectedCity || !neighborhoodSearch)
      return NEIGHBORHOODS_BY_CITY[selectedCity] || [];
    const neighborhoods = NEIGHBORHOODS_BY_CITY[selectedCity] || [];
    return neighborhoods.filter((n) => n.toLowerCase().includes(neighborhoodSearch.toLowerCase()));
  }, [selectedCity, neighborhoodSearch]);

  const startDateObj = startDate ? new Date(startDate) : undefined;
  const endDateObj = endDate ? new Date(endDate) : undefined;

  const isDateValid = !startDate || !endDate || new Date(startDate) <= new Date(endDate);
  const today = format(new Date(), "yyyy-MM-dd");
  const isEndDateFuture = endDate && endDate > today;

  const handleSearch = async () => {
    if (selectedState && selectedCity && isDateValid && !isEndDateFuture) {
      setIsSearching(true);
      setCompletedPlatforms([]);
      setSearchProgress(0);

      // Simulate multi-platform search
      const platformsToSearch = [
        "instagram",
        "facebook",
        "marketplace",
        "linkedin",
        "pdf",
        "spreadsheet",
      ];

      for (let i = 0; i < platformsToSearch.length; i++) {
        setCurrentPlatform(platformsToSearch[i]);
        setSearchProgress(Math.round(((i + 1) / platformsToSearch.length) * 100));
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setCompletedPlatforms((prev) => [...prev, platformsToSearch[i]]);
      }

      setIsSearching(false);
    }
  };

  const canSearch = selectedState && selectedCity && isDateValid && !isEndDateFuture;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            🔍 Busca Abrangente de Leads Imobiliários
          </h1>
          <p className="text-lg text-slate-600">
            Pesquisa em múltiplas plataformas: Instagram, Facebook, Marketplace, LinkedIn, PDFs e Planilhas
          </p>
        </div>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon className="w-5 h-5" />
              Filtros Avançados de Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* State */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estado
                </label>
                <Input
                  placeholder="Selecione um estado..."
                  value={stateSearch || selectedState}
                  onChange={(e) => {
                    setStateSearch(e.target.value);
                    setShowStateDropdown(true);
                  }}
                  onFocus={() => setShowStateDropdown(true)}
                  onBlur={() => setTimeout(() => setShowStateDropdown(false), 200)}
                  className="w-full"
                  disabled={isSearching}
                />
                {showStateDropdown && filteredStates.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredStates.map((state) => (
                      <button
                        key={state.code}
                        onClick={() => {
                          setSelectedState(state.code);
                          setStateSearch(state.name);
                          setShowStateDropdown(false);
                          setSelectedCity("");
                          setCitySearch("");
                          setSelectedNeighborhood("");
                          setNeighborhoodSearch("");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-900"
                      >
                        {state.name} ({state.code})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cidade
                </label>
                <Input
                  placeholder="Selecione uma cidade..."
                  value={citySearch || selectedCity}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                  disabled={!selectedState || isSearching}
                  className="w-full"
                />
                {showCityDropdown && filteredCities.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setSelectedCity(city);
                          setCitySearch(city);
                          setShowCityDropdown(false);
                          setSelectedNeighborhood("");
                          setNeighborhoodSearch("");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-900"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Neighborhood */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Bairro (Opcional - Digite ou Selecione)
              </label>
              <Input
                placeholder="Digite ou selecione um bairro..."
                value={neighborhoodSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setNeighborhoodSearch(val);
                  setSelectedNeighborhood(val); // Allow custom neighborhood
                  setShowNeighborhoodDropdown(true);
                }}
                onFocus={() => setShowNeighborhoodDropdown(true)}
                onBlur={() => setTimeout(() => setShowNeighborhoodDropdown(false), 200)}
                disabled={!selectedCity || isSearching}
                className="w-full"
              />
              {showNeighborhoodDropdown && filteredNeighborhoods.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredNeighborhoods.map((neighborhood) => (
                    <button
                      key={neighborhood}
                      onClick={() => {
                        setSelectedNeighborhood(neighborhood);
                        setNeighborhoodSearch(neighborhood);
                        setShowNeighborhoodDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-900"
                    >
                      {neighborhood}
                    </button>
                  ))}
                  <div className="px-4 py-2 text-xs text-slate-500 italic border-t border-slate-100">
                    Digite para procurar em outro bairro...
                  </div>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={today}
                  className="w-full"
                  disabled={isSearching}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data Final
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={today}
                  className="w-full"
                  disabled={isSearching}
                />
              </div>
            </div>

            {!isDateValid && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                A data inicial não pode ser posterior à data final.
              </div>
            )}
            {isEndDateFuture && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                A data final não pode ser no futuro.
              </div>
            )}

            <Button
              onClick={handleSearch}
              disabled={!canSearch || isSearching}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Buscando em Múltiplas Plataformas...
                </>
              ) : (
                <>
                  <SearchIcon className="mr-2 w-5 h-5" />
                  Buscar Leads em Todas as Plataformas
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isSearching && (
          <Card className="mb-8 shadow-lg border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Progresso da Busca Abrangente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full bg-blue-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-700 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${searchProgress}%` }}
                ></div>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900 mb-4">
                  {searchProgress}% Concluído
                </p>
                {currentPlatform && (
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-300 mb-4">
                    <p className="text-sm text-slate-600 mb-2">Procurando em:</p>
                    <p className="text-xl font-bold text-blue-700 animate-pulse">
                      {PLATFORMS.find((p) => p.id === currentPlatform)?.name || currentPlatform}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PLATFORMS.map((platform) => (
                  <div
                    key={platform.id}
                    className={`p-3 rounded-lg text-center font-medium text-sm flex items-center justify-center gap-2 ${completedPlatforms.includes(platform.id)
                        ? `${platform.color} border-2 border-current`
                        : currentPlatform === platform.id
                          ? "bg-blue-200 text-blue-900 border-2 border-blue-500 animate-pulse"
                          : "bg-slate-200 text-slate-600"
                      }`}
                  >
                    {completedPlatforms.includes(platform.id) ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : currentPlatform === platform.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {platform.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!isSearching && completedPlatforms.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-green-700 font-semibold text-lg">
                  Busca Concluída em {completedPlatforms.length} Plataformas!
                </p>
                <p className="text-green-600 text-sm mt-2">
                  Os resultados estão sendo processados e consolidados de todas as fontes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isSearching && completedPlatforms.length === 0 && (
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="pt-6">
              <p className="text-slate-600 text-center">
                Preencha os filtros acima e clique em "Buscar Leads em Todas as Plataformas" para começar a
                procurar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
