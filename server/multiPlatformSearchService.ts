/**
 * Multi-Platform Search Service
 * Searches across Instagram, Facebook, Marketplace, LinkedIn, PDFs, and spreadsheets
 */

export interface MultiPlatformSearchResult {
  platform: "instagram" | "facebook" | "marketplace" | "linkedin" | "pdf" | "spreadsheet";
  username?: string;
  profileUrl?: string;
  commentText: string;
  postUrl?: string;
  postDate?: Date;
  keywords: string[];
  source: string;
  quality?: number;
}

export interface SearchStrategy {
  platform: string;
  queries: string[];
  description: string;
}

/**
 * Generates comprehensive search strategies for all platforms
 */
export function generateMultiPlatformQueries(
  city: string,
  state: string,
  neighborhood?: string,
  startDate?: Date,
  endDate?: Date
): SearchStrategy[] {
  const strategies: SearchStrategy[] = [];

  const location = neighborhood ? `${neighborhood}, ${city}` : `${city}, ${state}`;
  const dateFilter = startDate && endDate 
    ? ` after:${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")} before:${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`
    : "";

  // Instagram Strategies
  strategies.push({
    platform: "Instagram",
    queries: [
      `site:instagram.com imobiliária "${location}"${dateFilter}`,
      `site:instagram.com "venda" "imóvel" "${city}"${dateFilter}`,
      `site:instagram.com "aluguel" "imóvel" "${city}"${dateFilter}`,
      `site:instagram.com realtor "${city}"${dateFilter}`,
      `site:instagram.com #imóvel${city.toLowerCase().replace(/\s/g, "")}${dateFilter}`,
    ],
    description: "Buscando em Instagram",
  });

  // Facebook Strategies
  strategies.push({
    platform: "Facebook",
    queries: [
      `site:facebook.com imobiliária "${location}"${dateFilter}`,
      `site:facebook.com "venda de imóvel" "${city}"${dateFilter}`,
      `site:facebook.com "aluguel" "imóvel" "${city}"${dateFilter}`,
      `site:facebook.com grupo imóvel "${city}"${dateFilter}`,
      `site:facebook.com marketplace imóvel "${city}"${dateFilter}`,
    ],
    description: "Buscando em Facebook",
  });

  // Facebook Marketplace Strategies
  strategies.push({
    platform: "Marketplace",
    queries: [
      `site:facebook.com/marketplace imóvel "${city}"${dateFilter}`,
      `site:facebook.com/marketplace "venda" "${location}"${dateFilter}`,
      `site:facebook.com/marketplace "aluguel" "${city}"${dateFilter}`,
      `site:facebook.com/marketplace imobiliária "${city}"${dateFilter}`,
    ],
    description: "Buscando em Facebook Marketplace",
  });

  // LinkedIn Strategies
  strategies.push({
    platform: "LinkedIn",
    queries: [
      `site:linkedin.com "real estate" "${city}"${dateFilter}`,
      `site:linkedin.com "imobiliária" "${city}"${dateFilter}`,
      `site:linkedin.com broker "${city}"${dateFilter}`,
      `site:linkedin.com "property manager" "${city}"${dateFilter}`,
    ],
    description: "Buscando em LinkedIn",
  });

  // PDF Strategies
  strategies.push({
    platform: "PDF",
    queries: [
      `filetype:pdf imobiliária "${city}" "${state}"${dateFilter}`,
      `filetype:pdf "venda de imóvel" "${city}"${dateFilter}`,
      `filetype:pdf "catálogo de imóveis" "${city}"${dateFilter}`,
      `filetype:pdf "lista de imóveis" "${city}"${dateFilter}`,
    ],
    description: "Buscando em PDFs",
  });

  // Spreadsheet Strategies
  strategies.push({
    platform: "Spreadsheet",
    queries: [
      `filetype:xlsx imobiliária "${city}"${dateFilter}`,
      `filetype:xls "lista de imóveis" "${city}"${dateFilter}`,
      `filetype:csv imóvel "${city}"${dateFilter}`,
      `filetype:ods "venda de imóvel" "${city}"${dateFilter}`,
    ],
    description: "Buscando em Planilhas",
  });

  // OLX and other classifieds
  strategies.push({
    platform: "Classifieds",
    queries: [
      `site:olx.com.br imóvel "${city}"${dateFilter}`,
      `site:vivareal.com.br "${city}"${dateFilter}`,
      `site:imoveisweb.com.br "${city}"${dateFilter}`,
    ],
    description: "Buscando em Classificados",
  });

  return strategies;
}

/**
 * Extracts neighborhood suggestions from a city
 */
export function getNeighborhoodsByCity(city: string): string[] {
  const neighborhoodsByCity: Record<string, string[]> = {
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
      "Zona Oeste",
    ],
    "Belo Horizonte": [
      "Centro",
      "Savassi",
      "Funcionários",
      "Lourdes",
      "Santo Agostinho",
      "Zona Norte",
      "Zona Leste",
    ],
    "Campinas": [
      "Centro",
      "Vila Brandina",
      "Cambuí",
      "Barão Geraldo",
      "Zona Leste",
    ],
    "Curitiba": [
      "Centro",
      "Batel",
      "Água Verde",
      "Bigorrilho",
      "Zona Sul",
    ],
  };

  return neighborhoodsByCity[city] || [];
}

/**
 * Scores multi-platform results by relevance
 */
export function scoreMultiPlatformResult(
  result: MultiPlatformResult,
  keywords: string[]
): number {
  let score = 0;

  // Platform relevance scoring
  const platformScores: Record<string, number> = {
    instagram: 25,
    facebook: 20,
    marketplace: 22,
    linkedin: 18,
    pdf: 15,
    spreadsheet: 15,
  };

  score += platformScores[result.platform] || 10;

  // Keyword matching
  score += keywords.length * 10;
  if (keywords.length >= 2) score += 15;
  if (keywords.length >= 3) score += 25;

  // Text quality
  if (result.commentText.length > 50) score += 10;
  if (result.commentText.includes("?")) score += 5;

  // Recent content bonus
  if (result.postDate) {
    const daysSincePost = Math.floor(
      (new Date().getTime() - new Date(result.postDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePost < 7) score += 20;
    else if (daysSincePost < 30) score += 10;
  }

  return Math.max(0, score);
}

/**
 * Filters and ranks results by quality across all platforms
 */
export function rankMultiPlatformResults(
  results: MultiPlatformSearchResult[]
): MultiPlatformSearchResult[] {
  const scored = results.map((result) => ({
    ...result,
    quality: scoreMultiPlatformResult(result, result.keywords),
  }));
  
  scored.sort((a, b) => (b.quality || 0) - (a.quality || 0));
  
  return scored.map(({ quality, ...result }) => result);
}

/**
 * Deduplicates results from multiple platforms
 */
export function deduplicateResults(
  results: MultiPlatformSearchResult[]
): MultiPlatformSearchResult[] {
  const seen = new Set<string>();
  const deduplicated: MultiPlatformSearchResult[] = [];

  for (const result of results) {
    const key = `${result.commentText.toLowerCase().substring(0, 50)}${result.username || result.source}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(result);
    }
  }

  return deduplicated;
}

/**
 * Generates search progress messages
 */
export function generateProgressMessage(
  platform: string,
  currentIndex: number,
  totalQueries: number
): string {
  const percentage = Math.round((currentIndex / totalQueries) * 100);
  return `Procurando em ${platform}... (${percentage}%)`;
}

interface MultiPlatformResult {
  platform: string;
  commentText: string;
  keywords: string[];
  postDate?: Date;
  username?: string;
  source: string;
}
