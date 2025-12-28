import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Search as SearchIcon, ExternalLink, Loader2 } from "lucide-react";
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

export default function Search() {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [stateSearch, setStateSearch] = useState<string>("");
  const [citySearch, setCitySearch] = useState<string>("");

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

  const startDateObj = startDate ? new Date(startDate) : undefined;
  const endDateObj = endDate ? new Date(endDate) : undefined;

  const isDateValid = !startDate || !endDate || new Date(startDate) <= new Date(endDate);
  const today = format(new Date(), "yyyy-MM-dd");
  const isEndDateFuture = endDate && endDate > today;

  const { data: leads, isLoading, error } = trpc.leads.search.useQuery(
    {
      state: selectedState,
      city: selectedCity,
      startDate: startDateObj,
      endDate: endDateObj,
    },
    {
      enabled: !!selectedState && !!selectedCity && isDateValid && !isEndDateFuture,
    }
  );

  const canSearch = selectedState && selectedCity && isDateValid && !isEndDateFuture;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Instagram Real Estate Leads</h1>
          <p className="text-lg text-slate-600">
            Encontre potenciais clientes em comentários de imobiliárias
          </p>
        </div>

        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon className="w-5 h-5" />
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-900"
                      >
                        {state.name} ({state.code})
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
                  disabled={!selectedState}
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
          </CardContent>
        </Card>

        {canSearch && (
          <div>
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-slate-600">Buscando leads...</span>
              </div>
            )}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-700">Erro ao buscar leads: {error.message}</p>
                </CardContent>
              </Card>
            )}

            {!isLoading && leads && leads.length === 0 && (
              <Card className="border-slate-200 bg-slate-50">
                <CardContent className="pt-6">
                  <p className="text-slate-600 text-center">
                    Nenhum lead encontrado para os critérios selecionados.
                  </p>
                </CardContent>
              </Card>
            )}

            {!isLoading && leads && leads.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  {leads.length} Lead{leads.length !== 1 ? "s" : ""} Encontrado
                  {leads.length !== 1 ? "s" : ""}
                </h2>
                <div className="grid gap-4">
                  {leads.map((lead, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <a
                                href={lead.instagramProfileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                              >
                                @{lead.instagramUsername}
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                            <p className="text-slate-700 mb-3">{lead.commentText}</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {lead.keywords &&
                                lead.keywords.split(",").map((keyword, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                  >
                                    {keyword.trim()}
                                  </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              {lead.postDate && (
                                <span>
                                  📅{" "}
                                  {format(new Date(lead.postDate), "dd 'de' MMMM 'de' yyyy", {
                                    locale: ptBR,
                                  })}
                                </span>
                              )}
                              {lead.postUrl && (
                                <a
                                  href={lead.postUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  Ver Post <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!canSearch && (
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="pt-6">
              <p className="text-slate-600 text-center">
                Preencha os filtros acima para começar a buscar leads.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
