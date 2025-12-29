import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Lead } from "../../../server/mockLeadData";
import {
  MessageCircle, ExternalLink, MapPin, Clock, Phone, Mail, CheckCircle2,
  FileCheck, Sparkles, Eye, Table as TableIcon, Download
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeadsResultsListProps {
  leads: Lead[];
  isLoading: boolean;
  actionedLeads?: Set<string>;
  onToggleAction?: (id: string) => void;
}

export default function LeadsResultsList({ leads, isLoading, actionedLeads, onToggleAction }: LeadsResultsListProps) {
  const [viewingFileLead, setViewingFileLead] = useState<Lead | null>(null);

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "instagram": return "bg-pink-50 text-pink-600 border-pink-100 ring-pink-50";
      case "facebook": return "bg-blue-50 text-blue-600 border-blue-100 ring-blue-50";
      case "linkedin": return "bg-sky-50 text-sky-600 border-sky-100 ring-sky-50";
      case "olx": return "bg-purple-50 text-purple-600 border-purple-100 ring-purple-50";
      case "google_maps": return "bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-50";
      case "business_directory": return "bg-amber-50 text-amber-600 border-amber-100 ring-amber-50";
      case "google_drive": return "bg-red-50 text-red-600 border-red-100 ring-red-50";
      case "library_doc": return "bg-slate-100 text-slate-600 border-slate-200 ring-slate-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100 ring-slate-50";
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Helper to generate fake table data for the viewer
  const getSimulatedFileContent = (lead: Lead) => {
    const rows = [];
    for (let i = 0; i < 8; i++) {
      rows.push({
        name: i === 0 ? lead.name : `Cliente Interessado ${i + 1}`,
        phone: i === 0 ? lead.phone || "(85) 99999-9999" : `(85) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        email: i === 0 ? lead.email || "-" : `contato${i}@gmail.com`,
        status: ["Interessado", "Visitou", "Proposta", "Em análise"][Math.floor(Math.random() * 4)]
      });
    }
    return rows;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-white rounded-xl shadow-sm animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {leads.map((lead) => {
          const isActioned = actionedLeads?.has(lead.id);
          const isFile = lead.platform === "google_drive" || lead.platform === "library_doc";
          const whatsappNumber = lead.whatsapp ? lead.whatsapp.replace(/\D/g, "") : (lead.phone ? lead.phone.replace(/\D/g, "") : null);
          const profileUrl = lead.instagram ? `https://instagram.com/${lead.instagram.replace("@", "")}` : null;

          const platformDisplay = lead.platform === "google_maps" ? "Google Maps" :
            lead.platform === "business_directory" ? "Diretório" :
              lead.platform.replace("_", " ").toUpperCase();

          return (
            <motion.div key={lead.id} variants={item}>
              <div
                className={`bg-white rounded-xl border-2 transition-all hover:shadow-xl hover:border-blue-200 group ${isActioned ? 'border-green-200 bg-green-50/20' : 'border-slate-100 shadow-sm'}`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${getPlatformColor(lead.platform)}`}>
                      {isFile ? <FileCheck size={12} /> : <ExternalLink size={12} />}
                      VIA {platformDisplay}
                    </div>

                    {onToggleAction && (
                      <button
                        onClick={() => onToggleAction(lead.id)}
                        className={`group relative flex items-center justify-center p-2 rounded-full transition-all ${isActioned ? 'text-green-600 bg-green-100' : 'text-slate-300 hover:text-green-500 hover:bg-green-50'
                          }`}
                        title={isActioned ? "Desfazer" : "Marcar como verificado"}
                      >
                        <CheckCircle2 size={24} className={isActioned ? "fill-current" : ""} />
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="font-bold text-slate-900 text-xl leading-tight mb-1">{lead.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-slate-400" /> {lead.location}</span>
                      <span className="flex items-center gap-1"><Clock size={14} className="text-slate-400" /> {lead.postDate ? formatDistanceToNow(new Date(lead.postDate), { addSuffix: true, locale: ptBR }) : "Recente"}</span>
                      {profileUrl && (
                        <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                          <ExternalLink size={12} /> Ver Perfil
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mb-5 space-y-3">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                      <div className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-bold uppercase text-slate-400 border border-slate-100 rounded-full">
                        {isFile ? "Conteúdo do Arquivo" : "Mensagem Original"}
                      </div>
                      <p className="text-slate-800 text-base leading-relaxed font-medium italic">
                        "{lead.comment}"
                      </p>
                    </div>

                    {lead.analysis && (
                      <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100 flex gap-3 items-start">
                        <div className="mt-0.5 min-w-[18px]">
                          <Sparkles size={16} className="text-blue-500" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase text-blue-400 mb-0.5">Análise de Intenção</div>
                          <p className="text-blue-900 text-sm font-medium">
                            {lead.analysis.replace("Resumo: ", "")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                    <div className="flex gap-2">
                      {/* Minimal Contact Actions */}
                      {whatsappNumber && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 px-3 text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700 font-bold"
                          onClick={() => window.open(`https://wa.me/55${whatsappNumber}`, '_blank')}
                          title="WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </Button>
                      )}
                      {lead.phone && !whatsappNumber && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 px-3 text-slate-600 bg-slate-50 hover:bg-slate-100"
                          onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                          title="Ligar"
                        >
                          <Phone size={18} />
                        </Button>
                      )}
                      {lead.email && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 px-3 text-slate-600 bg-slate-50 hover:bg-slate-100"
                          onClick={() => window.open(`mailto:${lead.email}`, '_self')}
                          title="Email"
                        >
                          <Mail size={18} />
                        </Button>
                      )}
                    </div>

                    {isFile ? (
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-sm"
                        onClick={() => setViewingFileLead(lead)}
                      >
                        <TableIcon size={16} className="mr-2" />
                        Ver Lista
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700 font-bold"
                        onClick={() => window.open(lead.postUrl || '#', '_blank')}
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Ver Postagem
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {lead.keywords.map((k, i) => (
                      <span key={i} className="text-[10px] text-slate-400">#{k}</span>
                    ))}
                  </div>

                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* FILE VIEWER MODAL */}
      <Dialog open={!!viewingFileLead} onOpenChange={(open) => !open && setViewingFileLead(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileCheck className="text-amber-500" />
              Conteúdo da Lista: {viewingFileLead?.name}
            </DialogTitle>
            <p className="text-slate-500 text-sm">
              Esta lista contém múltiplos contatos. Visualize abaixo antes de exportar.
            </p>
          </DialogHeader>

          <div className="border rounded-lg overflow-hidden my-4">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewingFileLead && getSimulatedFileContent(viewingFileLead).map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell className="text-slate-500">{row.email}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                        {row.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setViewingFileLead(null)}>Fechar</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Download size={16} className="mr-2" />
              Exportar CSV
            </Button>
          </div>

        </DialogContent>
      </Dialog>
    </>
  );
}
