import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Search as SearchIcon,
  Loader2,
  CheckCircle2,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Filter,
  ArrowRight,
  Map,
  Clock
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import LeadsResultsList from "@/components/LeadsResultsList";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { useLocation } from "wouter";

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
  CE: ["Fortaleza", "Caucaia", "Maracanaú", "Eusébio", "Aquiraz", "Maranguape", "Pacatuba", "Horizonte", "Pacajus", "Cascavel", "São Gonçalo do Amarante", "Pindoretama", "Itaitinga", "Sobral", "Juazeiro do Norte", "Crato", "Barbalha", "Iguatu", "Quixadá"],
};

const NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  "São Paulo": ["Centro", "Vila Madalena", "Pinheiros", "Higienópolis", "Consolação", "Bela Vista", "Liberdade", "Tatuapé", "Mooca", "Zona Leste"],
  "Rio de Janeiro": ["Centro", "Copacabana", "Ipanema", "Leblon", "Barra da Tijuca", "Botafogo", "Flamengo", "Zona Norte"],
  "Belo Horizonte": ["Centro", "Savassi", "Funcionários", "Lourdes", "Santo Agostinho"],
  Campinas: ["Centro", "Vila Brandina", "Cambuí", "Barão Geraldo"],
  Curitiba: ["Centro", "Batel", "Água Verde", "Bigorrilho"],
  Fortaleza: [
    "Centro", "Meireles", "Aldeota", "Praia do Futuro", "Cocó", "Mucuripe", "Varjota", "Praia de Iracema",
    "Papicu", "Dionísio Torres", "Bairro de Fátima", "Benfica", "Parquelândia", "Farias Brito",
    "São Gerardo", "Messejana", "Cambeba", "Cidade dos Funcionários", "Parque Manibura", "Sapiranga",
    "Edson Queiroz", "Guararapes", "Engenheiro Luciano Cavalcante", "Passaré", "Mondubim", "Maraponga",
    "Parangaba", "Vila Pery", "Jóquei Clube", "Antônio Bezerra", "Barra do Ceará", "Cristo Redentor",
    "Pirambu", "Jacarecanga", "Carlito Pamplona", "Álvaro Weyne", "Jangurussu", "Conjunto Ceará"
  ],
};

const PLATFORMS = [
  { id: "instagram", name: "Instagram", color: "bg-pink-100 text-pink-700" },
  { id: "facebook", name: "Facebook", color: "bg-blue-100 text-blue-700" },
  { id: "marketplace", name: "Marketplace", color: "bg-orange-100 text-orange-700" },
  { id: "linkedin", name: "LinkedIn", color: "bg-blue-600 text-white" },
  { id: "pdf", name: "PDFs", color: "bg-red-100 text-red-700" },
  { id: "spreadsheet", name: "Planilhas", color: "bg-green-100 text-green-700" },
  { id: "google_maps", name: "Google Maps", color: "bg-indigo-100 text-indigo-700" },
  { id: "business_directory", name: "Diretórios B2B", color: "bg-yellow-100 text-yellow-800" },
];

export default function ComprehensiveSearchWithResults() {
  const [location, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");

  // Date Logic simplified: "Last 7 days" by default or custom
  const today = format(new Date(), "yyyy-MM-dd");
  const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState<string>(sevenDaysAgo);
  const [endDate, setEndDate] = useState<string>(today);
  const [dateRangePreset, setDateRangePreset] = useState("7d"); // 24h, 7d, 30d, custom

  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<string>("");
  const [completedPlatforms, setCompletedPlatforms] = useState<string[]>([]);
  const [searchProgress, setSearchProgress] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Results Management
  const [activeTab, setActiveTab] = useState<"results" | "actioned">("results");
  const [actionedLeads, setActionedLeads] = useState<Set<string>>(new Set());

  // Load Actioned Leads from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("actionedLeads");
    if (saved) {
      try {
        setActionedLeads(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to parse actioned leads", e);
      }
    }
  }, []);

  // Lists State
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [stateSearch, setStateSearch] = useState<string>("");
  const [citySearch, setCitySearch] = useState<string>("");

  const { data: mockResults, isLoading: isLoadingResults, refetch } = trpc.leads.getMockResults.useQuery(
    {
      state: selectedState,
      city: selectedCity,
      neighborhood: selectedNeighborhood,
    },
    { enabled: false }
  );

  const filteredStates = useMemo(() => {
    if (!stateSearch) return BRAZILIAN_STATES;
    return BRAZILIAN_STATES.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase()) || s.code.toLowerCase().includes(stateSearch.toLowerCase()));
  }, [stateSearch]);

  const filteredCities = useMemo(() => {
    if (!selectedState) return [];
    const cities = CITIES_BY_STATE[selectedState] || [];
    if (!citySearch) return cities;
    return cities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));
  }, [selectedState, citySearch]);

  const filteredNeighborhoods = useMemo(() => {
    if (!selectedCity) return [];
    const neighborhoods = NEIGHBORHOODS_BY_CITY[selectedCity] || [];
    return neighborhoods;
  }, [selectedCity]);

  // Date Presets Handler
  const handleDatePreset = (preset: string) => {
    setDateRangePreset(preset);
    if (preset === "24h") {
      setStartDate(format(subDays(new Date(), 1), "yyyy-MM-dd"));
      setEndDate(today);
    } else if (preset === "7d") {
      setStartDate(format(subDays(new Date(), 7), "yyyy-MM-dd"));
      setEndDate(today);
    } else if (preset === "15d") {
      setStartDate(format(subDays(new Date(), 15), "yyyy-MM-dd"));
      setEndDate(today);
    } else if (preset === "30d") {
      setStartDate(format(subDays(new Date(), 30), "yyyy-MM-dd"));
      setEndDate(today);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setCompletedPlatforms([]);
    setSearchProgress(0);
    setHasSearched(true);

    const platformsToSearch = PLATFORMS.map(p => p.id);

    for (let i = 0; i < platformsToSearch.length; i++) {
      setCurrentPlatform(platformsToSearch[i]);
      setSearchProgress(Math.round(((i + 1) / platformsToSearch.length) * 100));
      // Simulate checking real profiles
      if (i === 0) { // On first step, wait a bit longer to simulate "Google Search" finding profiles
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // Randomly update status "Checking profile..."
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCompletedPlatforms((prev) => [...prev, platformsToSearch[i]]);
    }

    setIsSearching(false);
    await refetch();
  };

  // Update LocalStorage when actionedLeads changes
  const toggleActioned = (leadId: string) => {
    setActionedLeads(prev => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      localStorage.setItem("actionedLeads", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const goToStep = (s: number) => setStep(s);

  // ---- RENDER STEPS ----

  // STEP 1: LOCATION
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 pb-24 p-6"> {/* Added padding for sticky footer */}
        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
            <MapPin size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Onde vamos procurar?</h2>
          <p className="text-slate-500 mt-1">Selecione a região para rastrear os leads.</p>
        </div>

        {/* State Selection */}
        <div className="space-y-4 mb-8">
          <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 ml-1">Estado</label>
          {!selectedState ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {/* Popular States */}
                {["SP", "RJ", "MG", "CE", "BA", "RS"].map(code => (
                  <button
                    key={code}
                    onClick={() => setSelectedState(code)}
                    className="h-14 rounded-xl border-2 border-slate-100 bg-white text-lg font-semibold text-slate-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
                  >
                    {code}
                  </button>
                ))}
              </div>

              {/* Full List Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <SearchIcon size={18} />
                </div>
                <Input
                  placeholder="Buscar outro estado..."
                  value={stateSearch}
                  onChange={e => setStateSearch(e.target.value)}
                  onFocus={() => setShowStateDropdown(true)}
                  className="h-14 pl-10 text-lg rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all"
                />
                <AnimatePresence>
                  {showStateDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-xl max-h-60 overflow-y-auto z-50"
                    >
                      {filteredStates.map(state => (
                        <div
                          key={state.code}
                          className="p-4 border-b border-slate-50 hover:bg-blue-50 cursor-pointer text-base font-medium text-slate-700 active:bg-blue-100"
                          onClick={() => {
                            setSelectedState(state.code);
                            setShowStateDropdown(false);
                          }}
                        >
                          {state.name}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div
              onClick={() => { setSelectedState(""); setSelectedCity(""); }}
              className="group bg-blue-600 text-white p-4 rounded-xl flex items-center justify-between shadow-lg shadow-blue-200 cursor-pointer transition-transform active:scale-95"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-200" />
                <span className="font-bold text-xl">
                  {BRAZILIAN_STATES.find(s => s.code === selectedState)?.name || selectedState}
                </span>
              </div>
              <span className="text-sm font-medium bg-blue-500 px-3 py-1 rounded-full group-hover:bg-blue-400">Alterar</span>
            </div>
          )}
        </div>

        {/* City Selection */}
        <AnimatePresence>
          {selectedState && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 ml-1">Cidade</label>
              {!selectedCity ? (
                <div className="space-y-3">
                  {/* List of Main Cities */}
                  <div className="grid grid-cols-1 gap-2 max-h-[30vh] overflow-y-auto pr-1">
                    {filteredCities.map(city => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className="h-14 w-full text-left px-5 rounded-xl border border-slate-200 bg-white text-base font-medium text-slate-700 hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.98]"
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                      <SearchIcon size={18} />
                    </div>
                    <Input
                      placeholder="Digite o nome da cidade..."
                      value={citySearch}
                      onChange={e => setCitySearch(e.target.value)}
                      className="h-12 pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setSelectedCity("")}
                  className="group bg-green-600 text-white p-4 rounded-xl flex items-center justify-between shadow-lg shadow-green-200 cursor-pointer transition-transform active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-200" />
                    <span className="font-bold text-xl">{selectedCity}</span>
                  </div>
                  <span className="text-sm font-medium bg-green-500 px-3 py-1 rounded-full group-hover:bg-green-400">Alterar</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50 md:absolute md:rounded-b-2xl">
        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xl disabled:opacity-50 transition-all"
          disabled={!selectedState || !selectedCity}
          onClick={() => goToStep(2)}
        >
          Continuar <ChevronRight className="ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  // STEP 2: DETAILS
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 pb-24 p-6">
        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-purple-100">
            <Filter size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Refinar Detalhes</h2>
          <div className="flex items-center justify-center gap-2 mt-2 text-slate-500 text-sm bg-slate-100 py-1 px-3 rounded-full mx-auto w-fit">
            <MapPin size={14} /> {selectedCity} • {selectedState}
          </div>
        </div>

        {/* Date Range Simplifier */}
        <div className="space-y-4 mb-8">
          <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 ml-1">Quando foi postado?</label>
          <div className="grid grid-cols-4 gap-2"> {/* Changed to grid-cols-4 */}
            {[
              { id: "24h", label: "Hoje", sub: "24h" },
              { id: "7d", label: "7 Dias", sub: "Semana" },
              { id: "15d", label: "15 Dias", sub: "Quinzena" },
              { id: "30d", label: "30 Dias", sub: "Mês" },
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => handleDatePreset(preset.id)}
                className={`py-3 px-1 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${dateRangePreset === preset.id
                  ? 'bg-purple-600 text-white border-purple-600 shadow-lg scale-105'
                  : 'bg-white text-slate-700 border-slate-100 hover:border-purple-200'
                  }`}
              >
                <span className="font-bold text-base md:text-lg">{preset.label}</span>
                <span className={`text-[10px] md:text-xs ${dateRangePreset === preset.id ? 'text-purple-200' : 'text-slate-400'}`}>{preset.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Neighborhood Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold uppercase tracking-wider text-slate-500 ml-1">Bairro Ideal</label>
            <span className="text-xs text-slate-400 font-medium">Opcional</span>
          </div>

          {filteredNeighborhoods.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-[35vh] overflow-y-auto content-start">
              <button
                onClick={() => setSelectedNeighborhood("")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedNeighborhood
                  ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
              >
                Todos os Bairros
              </button>
              {filteredNeighborhoods.map(bairro => (
                <button
                  key={bairro}
                  onClick={() => setSelectedNeighborhood(bairro === selectedNeighborhood ? "" : bairro)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedNeighborhood === bairro
                    ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                >
                  {bairro}
                </button>
              ))}
            </div>
          ) : (
            <div className="relative">
              <Map size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Ex: Centro, Zona Sul..."
                value={selectedNeighborhood}
                onChange={e => setSelectedNeighborhood(e.target.value)}
                className="h-14 pl-10 rounded-xl"
              />
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50 md:absolute md:rounded-b-2xl flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-14 text-lg rounded-xl border-slate-300 text-slate-600"
          onClick={() => goToStep(1)}
        >
          <ChevronLeft className="mr-2" /> Voltar
        </Button>
        <Button
          size="lg"
          className="flex-[2] h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 rounded-xl"
          onClick={() => { goToStep(3); handleSearch(); }}
        >
          <SearchIcon className="mr-2" /> Buscar Leads
        </Button>
      </div>
    </motion.div>
  );

  // STEP 3: RESULTS
  const renderStep3 = () => {
    // Filter leads based on tab
    const allLeads = mockResults || [];
    const displayedLeads = allLeads.filter(lead => {
      if (activeTab === "results") {
        return !actionedLeads.has(lead.id); // Show only un-actioned
      } else {
        return actionedLeads.has(lead.id); // Show only actioned
      }
    });

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col h-full bg-slate-50"
      >
        {/* Sticky Header with TABS */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm md:rounded-t-2xl">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <button onClick={() => goToStep(2)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600">
                <ChevronLeft size={20} />
              </button>
              <div className="flex flex-col min-w-0">
                <h2 className="font-bold text-slate-900 leading-tight truncate">
                  {activeTab === "results" ? "Resultados" : "Leads Acionados"}
                </h2>
                <p className="text-xs text-slate-500 truncate">{displayedLeads.length} leads • {selectedCity}</p>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex px-4 pb-0 gap-6 border-b border-slate-100">
            <button
              onClick={() => setActiveTab("results")}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "results" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              Novos Resultados
            </button>
            <button
              onClick={() => setActiveTab("actioned")}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "actioned" ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              Já Verificados ({actionedLeads.size})
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 pb-20 overflow-y-auto bg-slate-50">
          {isSearching ? (
            // ... (Keep existing loading state)
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
              {/* ... loading UI from previous turn ... */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-slate-800">
                  {searchProgress}%
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {searchProgress < 20 ? "Mapeando imobiliárias em Fortaleza..." :
                    searchProgress < 40 ? "Encontrado: 12 perfis com atividade recente..." :
                      searchProgress < 60 ? "Acessando postagens em @imobiliariasolnascente e similares..." :
                        searchProgress < 80 ? "Lendo 450+ novos comentários..." :
                          "Extraindo contatos e filtrando intenção..."}
                </h3>
                <p className="text-slate-500">Varrendo postagens e stories recentes</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Feedback if empty */}
              {!isLoadingResults && displayedLeads.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>
                    {activeTab === "results"
                      ? "Nenhum novo lead encontrado ou todos já foram verificados."
                      : "Nenhum lead marcado como verificado ainda."}
                  </p>
                  {activeTab === "results" && <Button variant="link" onClick={() => goToStep(1)}>Tentar outra região</Button>}
                </div>
              )}

              <LeadsResultsList
                leads={displayedLeads}
                isLoading={isLoadingResults}
                actionedLeads={actionedLeads}
                onToggleAction={toggleActioned}
              />

              <div className="h-12"></div> {/* Footer Spacer */}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-20 transition-all duration-300">
      <Navigation location={location} setLocation={setLocation} />

      <div className="md:p-6 p-4 max-w-3xl mx-auto">
        <div className="bg-white min-h-[85vh] md:rounded-3xl shadow-sm md:shadow-xl overflow-hidden border border-slate-100 relative">

          {/* Header visible only on Steps 1 & 2 */}
          {step < 3 && (
            <div className="p-6 pb-0 flex items-center justify-between">
              <button onClick={() => setLocation("/")} className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-bold">
                <ChevronLeft size={16} /> Voltar ao Início
              </button>
              <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                Passo {step} de 3
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
