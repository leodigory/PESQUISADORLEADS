/**
 * Mock Lead Data Service
 * Provides realistic example leads for demonstration
 */

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  facebook?: string; // Profile Name or Link
  comment: string;
  analysis?: string; // The formal summary
  platform: "instagram" | "facebook" | "linkedin" | "olx" | "google_maps" | "business_directory" | "marketplace" | "google_drive" | "library_doc";
  date: string; // Display date
  postDate: string; // ISO string for sorting
  quality: number;
  contact?: string;
  postUrl?: string;
  keywords: string[];
  location?: string;
  avatar?: string;
}

const fortalezaBairros = [
  "Meireles", "Aldeota", "Cocó", "Guararapes", "Papicu", "Dionísio Torres",
  "Fatima", "Benfica", "Centro", "Moura Brasil", "Praia de Iracema",
  "Varjota", "Mucuripe", "Cais do Porto", "Vicente Pinzon",
  "Joaquim Távora", "São João do Tauape", "Salinas", "Edson Queiroz",
  "Sabiaguaba", "Cambeba", "Messejana", "Lagoa Redonda", "Curió",
  "Guajeru", "Parangaba", "Maraponga", "Mondubim", "Vila Pery",
  "Passaré", "Castelão", "Cajazeiras", "Cidade dos Funcionários",
  "Parque Manibura", "Parque Iracema", "José de Alencar"
];

const generateName = () => {
  const firstNames = ["Carlos", "Marina", "João", "Fernanda", "Roberto", "Juliana", "Patricia", "Lucas", "Beatriz", "Thiago", "Ana", "Paulo", "Mariana", "Rafael", "Camila", "Bruno", "Leticia", "Gustavo"];
  const lastNames = ["Silva", "Costa", "Santos", "Oliveira", "Alves", "Pereira", "Gomes", "Martins", "Rocha", "Mendes", "Souza", "Lima", "Ferreira", "Rodrigues", "Barbosa", "Vieira"];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const REAL_COMMENTS = [
  { text: "qual o valor??? tenho interesse", intent: "Busca por Condições de Pagamento", score: 85 },
  { text: "aceita fgts na entrada?", intent: "Dúvida sobre Financiamento/FGTS", score: 88 },
  { text: "onde fica?? é longe do centro?", intent: "Interesse em Localização", score: 75 },
  { text: "valor por favor", intent: "Curiosidade sobre Preço", score: 60 },
  { text: "eu quero!! me chama no zap {PHONE}", intent: "Alta Intenção de Compra (Contato Ativo)", score: 99 },
  { text: "meu numero {PHONE} tenho interesse", intent: "Alta Intenção de Compra (Contato Ativo)", score: 99 },
  { text: "gostei da planta, quando pode visitar?", intent: "Solicitação de Visita Imediata", score: 95 },
  { text: "minha renda é 2.500, da pra financiar?", intent: "Perfil de Crédito / Minha Casa Minha Vida", score: 90 },
  { text: "vcs pegam carro como parte do pagamento?", intent: "Proposta de Permuta", score: 50 },
  { text: "tem vaga de garagem??", intent: "Dúvida Específica do Imóvel", score: 70 },
  { text: "entrega quando?", intent: "Interesse em Prazos de Entrega", score: 80 },
  { text: "falei no chat e ninguem respondeu. meu contato é {PHONE}", intent: "Lead Resgatado (Insatisfação Anterior)", score: 95 },
  { text: "lindo 😍 qual o valor?", intent: "Interesse Visual / Preço", score: 75 },
  { text: "me envia mais fotos pfv", intent: "Solicitação de Material", score: 82 },
  { text: "tenho um valor pra dar de entrada", intent: "Comprador com Recurso Definido", score: 96 },
  { text: "top dms", intent: "Baixa Intenção (Apenas Elogio)", score: 30 }
];

// Helper to create "Smart Links" that actually show relevant results when clicked
const getSmartLink = (platform: string, context: string = "", username?: string) => {
  const term = context || "Fortaleza";

  // More specific queries if brand names are detected
  let specificQuery = term;
  if (context.includes("MRV")) specificQuery = `MRV ${term}`;
  if (context.includes("Tenda")) specificQuery = `Tenda ${term}`;
  if (context.includes("Victa")) specificQuery = `Victa ${term}`;

  const encodedSpecific = encodeURIComponent(specificQuery);

  if (platform === "instagram") {
    if (username) return `https://www.instagram.com/${username.replace("@", "")}/`;
    return `https://www.instagram.com/explore/tags/${term.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}/`;
  }
  if (platform === "facebook") return `https://www.facebook.com/search/posts?q=${encodedSpecific}`;
  if (platform === "marketplace") return `https://www.facebook.com/marketplace/search/?q=${encodedSpecific}`;
  if (platform === "linkedin") return `https://www.linkedin.com/search/results/content/?keywords=${encodedSpecific}`;
  if (platform === "olx") return `https://www.olx.com.br/brasil?q=${encodedSpecific}`;
  if (platform === "google_maps") return `https://www.google.com/maps/search/imobiliaria+${encodedSpecific}`;
  if (platform === "business_directory") return `https://www.google.com/search?q=imobiliaria+${encodedSpecific}`;
  if (platform === "google_drive") return `https://docs.google.com/spreadsheets/d/${Math.random().toString(36).substring(7)}/edit#gid=0`;
  if (platform === "library_doc") return `https://mysharedfiles.com/uploads/lista_leads_${term.replace(/\s/g, "_").toLowerCase()}_2024.xlsx`;

  return "#";
};


const TOP_TIER_PROFILES = [
  // Grandes Imobiliárias
  { username: "lopesimmobilis", name: "Lopes Immobilis", url: "https://www.instagram.com/lopesimmobilis/" },
  { username: "triunfoimoveisfortaleza", name: "Triunfo Imóveis", url: "https://www.instagram.com/triunfoimoveisfortaleza/" },
  { username: "apredial", name: "A Predial", url: "https://www.instagram.com/apredial/" },
  { username: "madrededeusimoveis", name: "Madre de Deus", url: "https://www.instagram.com/madrededeusimoveis/" },
  { username: "alessandrobelchiorimoveis", name: "Alessandro Belchior", url: "https://www.instagram.com/alessandrobelchiorimoveis/" },
  { username: "sjimoveis", name: "SJ Imóveis", url: "https://www.instagram.com/sjimoveis/" },
  { username: "ricardo_bezerra", name: "Ricardo Bezerra", url: "https://www.instagram.com/ricardo_bezerra/" },
  { username: "flaviocastroimoveis", name: "Flávio Castro", url: "https://www.instagram.com/flaviocastroimoveis/" },
  { username: "marcellusbrunooficial", name: "Marcellus Bruno", url: "https://www.instagram.com/marcellusbrunooficial/" },
  // Construtoras (Foco em Lançamentos)
  { username: "mouradubeux_oficial", name: "Moura Dubeux", url: "https://www.instagram.com/mouradubeux_oficial/" },
  { username: "bspar_incorporacoes", name: "BSPAR", url: "https://www.instagram.com/bspar_incorporacoes/" },
  { username: "colmeiaconstrutora", name: "Colmeia Construtora", url: "https://www.instagram.com/colmeiaconstrutora/" },
  { username: "mota_machado", name: "Mota Machado", url: "https://www.instagram.com/mota_machado/" },
  { username: "victaengenharia", name: "Victa Engenharia", url: "https://www.instagram.com/victaengenharia/" },
  { username: "diagonalengenharia", name: "Diagonal", url: "https://www.instagram.com/diagonalengenharia/" },
];

const REAL_DEVELOPMENTS = [
  "ITC", "WSTC", "BS Design", "Legacy", "Rooftop Canuto 1000",
  "São Carlos Condominium", "Maison de la Musique", "Arboretto",
  "Azure", "Landscapes", "Mandara", "Golf Ville", "Beach Class"
];

// Comments specific to real estate context
const CONTEXTUAL_COMMENTS = [
  "Qual o valor da unidade de 3 quartos no {DEV}?",
  "Tenho interesse nesse do {NEIGHBORHOOD}. Pode mandar a tabela?",
  "@marido_exemplo olha esse no {NEIGHBORHOOD}, perto do colégio das crianças",
  "O {DEV} aceita financiamento pela Caixa?",
  "Ainda tem disponibilidade no {DEV}? Vi que a entrega é em breve.",
  "Valor do metro quadrado no {NEIGHBORHOOD} tá quanto?",
  "Me chama no direct, quero visitar o decorado do {DEV}",
  "Esse valor de entrada divide em quantas vezes?",
  "O {DEV} tem vista mar? Sou do {NEIGHBORHOOD}",
  "Tenho um imóvel no {NEIGHBORHOOD} pra dar de entrada, aceitam?",
  "Me passa as plantas do {DEV} por favor (85) 9{PHONE}",
  "Gostei muito desse no {NEIGHBORHOOD}. (85) 9{PHONE}",
  "Preço? (85) 9{PHONE}",
  "Informações direct",
  "valor",
];

const getRandomProfile = () => {
  return TOP_TIER_PROFILES[Math.floor(Math.random() * TOP_TIER_PROFILES.length)];
};

export const generateMockLeads = (
  city: string,
  neighborhood: string,
  platformFilter: string[] = ["instagram", "facebook", "olx"]
): Lead[] => {
  const baseLeads: Lead[] = [];

  const currentCity = city || "Fortaleza";
  const localNeighborhood = neighborhood || (city === "Fortaleza" ? fortalezaBairros[Math.floor(Math.random() * fortalezaBairros.length)] : "Centro");

  const TOTAL_LEADS_TO_GENERATE = Math.floor(Math.random() * (1500 - 800 + 1)) + 800;

  for (let i = 0; i < TOTAL_LEADS_TO_GENERATE; i++) {
    const intentType = Math.random();

    let platform = platformFilter[Math.floor(Math.random() * platformFilter.length)];
    if (intentType < 0.15) platform = "google_drive";
    else if (intentType < 0.25) platform = "business_directory";
    else if (intentType < 0.35) platform = "google_maps";

    const isLeakedList = platform === "google_drive" || platform === "library_doc";
    const isBusinessPlatform = platform === "google_maps" || platform === "business_directory";
    const isSocialMedia = platform === "instagram" || platform === "facebook" || platform === "olx";

    const daysAgo = Math.floor(Math.random() * 30);
    const postDate = new Date();
    postDate.setDate(postDate.getDate() - daysAgo);

    // UNIQUE ID: Ensure non-colliding IDs per batch
    const leadId = `lead_${platform}_${Date.now()}_${i}`;
    let leadName = generateName();

    let commentText = "";
    let analysisText = "";
    let qualityScore = 50;

    // Only generate a random phone for specific contexts where it's plausible (Leaked Lists)
    // For social media, WE DO NOT INVENT PHONES unless the "User" explicitly posted it.
    const plausiblePhone = `(85) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`;


    if (isLeakedList) {
      leadName = `Arquivo: Leilão/Lista ${localNeighborhood}`;
      commentText = "Dados extraídos de lista pública de interessados em imóveis econômicos. Nome, telefone e e-mail disponíveis no arquivo.";
      analysisText = "Resumo: Lead em massa (Lista Fria/Morn)";
      qualityScore = 95;
    } else {
      // Pick a CONTEXUAL comment capable of referencing real developments
      const development = REAL_DEVELOPMENTS[Math.floor(Math.random() * REAL_DEVELOPMENTS.length)];
      const rawComment = CONTEXTUAL_COMMENTS[Math.floor(Math.random() * CONTEXTUAL_COMMENTS.length)];

      commentText = rawComment
        .replace("{DEV}", development)
        .replace("{NEIGHBORHOOD}", localNeighborhood)
        .replace("{PHONE}", plausiblePhone);

      // Derive intent from the text content purely for display
      const intent = commentText.toLowerCase().includes("valor") ? "Cotação de Preço" :
        commentText.toLowerCase().includes("visitar") ? "Solicitação de Visita" :
          commentText.toLowerCase().includes("financiamento") ? "Dúvida Financeira" :
            "Interesse Geral";

      analysisText = `Resumo: ${intent}`;
      qualityScore = commentText.length > 20 ? 85 : 60;

      // Add context to comment (rarely) but never add a fake phone here
      if (Math.random() > 0.9) commentText += " aguardo retorno";
    }

    let phone: string | undefined = undefined;
    let email: string | undefined = undefined;

    // STRICT EXTRACTION: Only if explicitly present in text
    if (isLeakedList) {
      // Leaked lists imply the file HAS the data
      phone = plausiblePhone;
      email = `contato_${i}_${Math.floor(Math.random() * 100)}@email.com`;
    } else {
      // Social/Web: Extract only
      const extracted = extractPhone(commentText);
      if (extracted) phone = extracted;
    }

    const extractedEmail = extractEmail(commentText);
    if (extractedEmail) email = extractedEmail;

    let postUrl = "#";

    // Select a real profile context for Instagram
    let sourceProfile = null;

    if (platform === "instagram") {
      sourceProfile = getRandomProfile();
      // Generate EXACT comment deep link simulation
      // Format: instagram.com/p/{PostID}/c/{CommentID}
      // This looks like a direct link to the specific interaction
      const postId = `C${Math.random().toString(36).substring(2, 7)}`;
      const commentId = `17${Math.random().toString().substring(2, 15)}`;
      postUrl = `${sourceProfile.url}p/${postId}/c/${commentId}/`;

      // Add context to comment to show origin
      if (Math.random() > 0.6) {
        commentText += ` (via @${sourceProfile.username})`;
      }
    }
    else if (platform === "facebook") {
      // Direct permalink to comment
      const postId = Math.floor(Math.random() * 1000000000);
      const commentId = Math.floor(Math.random() * 1000000000);
      postUrl = `https://www.facebook.com/groups/imoveis${localNeighborhood.toLowerCase()}/permalink/${postId}/?comment_id=${commentId}`;
    }
    else if (platform === "olx") {
      const adId = Math.floor(Math.random() * 1000000000);
      postUrl = `https://ce.olx.com.br/fortaleza/imoveis/${localNeighborhood.toLowerCase()}-apartamento-${adId}`;
    }
    else if (isLeakedList) {
      const csvHeader = "Nome,Telefone,Email,Interesse,Origem\n";
      const csvRow = `"${leadName}","${phone || ''}","${email || ''}","${commentText.replace(/"/g, '""')}","${platform}"`;
      const csvContent = csvHeader + csvRow;
      // Data URL for viewing "original file"
      postUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    }
    else if (isBusinessPlatform) {
      postUrl = `https://www.google.com/maps/place/${localNeighborhood.replace(/\s/g, '+')}/@-${Math.random() * 10},-${Math.random() * 10},15z/data=!4m5!3m4!1s0x0:0x0!8m2!3d0!4d0?review_id=${Math.random().toString(36)}`;
    }

    const instagramUser = !isLeakedList && Math.random() > 0.3 && platform === "instagram" ? `@${leadName.replace(/\s/g, '').toLowerCase()}${Math.floor(Math.random() * 100)}` : undefined;

    let keywords = [currentCity, localNeighborhood];
    if (isBusinessPlatform) keywords.push("pergunta", "avaliação");
    if (isLeakedList) keywords.push("lista", "xls", "pdf");
    if (intentType < 0.25 && !isLeakedList) keywords.push("MRV", "Tenda", "Victa", "Minha Casa Minha Vida");

    // Add source tag
    if (sourceProfile) {
      keywords.push(`@${sourceProfile.username}`);
    }

    if (phone || email || isLeakedList) qualityScore += 10;

    baseLeads.push({
      id: leadId,
      name: leadName,
      phone: phone,
      whatsapp: phone,
      email: email,
      instagram: instagramUser,
      facebook: platform === "facebook" ? generateName() : undefined,
      avatar: `https://i.pravatar.cc/150?u=${leadId}`,
      comment: commentText,
      analysis: analysisText,
      platform: platform as Lead["platform"],
      date: postDate.toLocaleDateString('pt-BR'),
      postDate: postDate.toISOString(),
      quality: Math.min(qualityScore, 100),
      contact: phone || "Sem contato direto",
      postUrl: postUrl,
      keywords: keywords,
      location: `${currentCity}, ${localNeighborhood}`
    });
  }

  return sortLeadsByDateAndQuality(baseLeads);
};

// Sort: Newest First, then Highest Quality
export function sortLeadsByDateAndQuality(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    // Primary: Date (Newest first)
    const dateDiff = new Date(b.postDate).getTime() - new Date(a.postDate).getTime();
    if (dateDiff !== 0) return dateDiff;

    // Secondary: Quality (Highest first)
    return b.quality - a.quality;
  });
}

/**
 * Extracts phone number from text
 */
export function extractPhone(text: string): string | undefined {
  const phoneRegex = /\(?(\d{2})\)?[\s-]?(\d{4,5})[\s-]?(\d{4})/;
  const match = text.match(phoneRegex);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return undefined;
}

/**
 * Extracts email from text
 */
export function extractEmail(text: string): string | undefined {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : undefined;
}

/**
 * Extracts Instagram username from text
 */
export function extractInstagram(text: string): string | undefined {
  const instagramRegex = /@([a-zA-Z0-9._-]+)/;
  const match = text.match(instagramRegex);
  return match ? `@${match[1]}` : undefined;
}

/**
 * Sorts leads by quality score
 */
export function sortLeadsByQuality(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => b.quality - a.quality);
}

/**
 * Filters leads by minimum quality threshold
 */
export function filterLeadsByQuality(leads: Lead[], minQuality: number = 80): Lead[] {
  return leads.filter((lead) => lead.quality >= minQuality);
}

/**
 * Groups leads by platform
 */
export function groupLeadsByPlatform(
  leads: Lead[]
): Record<string, Lead[]> {
  return leads.reduce(
    (acc, lead) => {
      if (!acc[lead.platform]) {
        acc[lead.platform] = [];
      }
      acc[lead.platform].push(lead);
      return acc;
    },
    {} as Record<string, Lead[]>
  );
}
