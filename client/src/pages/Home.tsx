import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  TrendingUp,
  Users,
  Home as HomeIcon,
  History,
  Settings,
  Bell,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-20 transition-all duration-300">
      {/* Desktop Sidebar / Mobile Bottom Nav Placeholder */}
      <Navigation location="/" setLocation={setLocation} />

      {/* Header Area */}
      <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">InstaLeads</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Bem-vindo de volta</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-slate-200/50">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50" />
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">

        {/* Main Hero Card - App Style */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-900/10">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Encontre Clientes</h2>
                <p className="text-blue-100/90 max-w-[250px]">
                  Busque leads qualificados no Instagram com inteligência artificial.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setLocation("/search")}
              className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold h-12 rounded-xl shadow-lg border-0 transition-all active:scale-[0.98]"
            >
              <Search className="mr-2 w-5 h-5" />
              Começar Nova Busca
            </Button>
          </div>
        </section>

        {/* Quick Stats / Status */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-slate-900">1,204</span>
              <span className="text-xs text-slate-500 font-medium mt-1">Leads Totais</span>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-slate-900">85%</span>
              <span className="text-xs text-slate-500 font-medium mt-1">Conversão</span>
            </CardContent>
          </Card>
        </div>

        {/* Feature Carousel (Horizontal Scroll) */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-lg font-bold text-slate-900">Recursos</h3>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs font-semibold h-auto py-1 px-2">
              Ver todos
            </Button>
          </div>

          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex w-max space-x-4 px-2">
              <FeatureCard
                icon={<MapPin className="w-5 h-5 text-orange-500" />}
                title="Geolocalização"
                desc="Filtre por cidade"
                color="bg-orange-50"
              />
              <FeatureCard
                icon={<Calendar className="w-5 h-5 text-pink-500" />}
                title="Data Recente"
                desc="Leads de hoje"
                color="bg-pink-50"
              />
              <FeatureCard
                icon={<Sparkles className="w-5 h-5 text-blue-500" />}
                title="IA Analysis"
                desc="Score de lead"
                color="bg-blue-50"
              />
              <FeatureCard
                icon={<History className="w-5 h-5 text-indigo-500" />}
                title="Histórico"
                desc="Buscas salvas"
                color="bg-indigo-50"
              />
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </section>

        {/* How it works List */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Processo Simplificado</h3>
          <div className="space-y-6">
            <StepItem number="01" title="Defina o Alvo" desc="Escolha localização e nicho de mercado para focar sua busca." />
            <StepItem number="02" title="Coleta Automática" desc="Nosso sistema varre milhares de comentários em segundos." />
            <StepItem number="03" title="Conversão" desc="Receba os contatos e inicie sua abordagem comercial." />
          </div>
        </section>

        {/* Bottom padding to account for navbar on mobile */}
        <div className="h-12 md:hidden"></div>
      </main>
    </div>
  );
}

// Components



function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="flex-none w-[140px] p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", color)}>
        {icon}
      </div>
      <h4 className="font-bold text-slate-800 text-sm mb-1">{title}</h4>
      <p className="text-slate-500 text-xs">{desc}</p>
    </div>
  );
}

function StepItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4 items-start group">
      <span className="flex-none text-2xl font-bold text-slate-200 group-hover:text-blue-200 transition-colors">{number}</span>
      <div>
        <h4 className="font-bold text-slate-900 mb-1 flex items-center">
          {title}
          <ChevronRight className="w-4 h-4 text-slate-300 ml-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0" />
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
