/**
 * Enhanced Google Dorking Search Service
 * Implements best practices for finding Instagram real estate leads
 */

export interface SearchProgress {
  stage: string;
  query: string;
  status: "pending" | "searching" | "completed" | "error";
  resultsFound: number;
}

export interface SearchResult {
  username: string;
  profileUrl: string;
  commentText: string;
  postUrl: string;
  postDate?: Date;
  keywords: string[];
  source: string;
}

/**
 * Best practices for lead identification in real estate
 */
export const LEAD_IDENTIFICATION_BEST_PRACTICES = {
  keywords: [
    "mais informações",
    "eu quero",
    "me chama",
    "valor",
    "preço",
    "tenho interesse",
    "quero saber",
    "qual o valor",
    "qual é o preço",
    "como funciona",
    "me interessa",
    "gostei",
    "onde fica",
    "qual é a localização",
    "disponível",
    "quando",
    "quanto custa",
    "financiamento",
    "parcelado",
    "entrada",
  ],
  searchStrategies: [
    "site:instagram.com imobiliária {city} {state}",
    "site:instagram.com imóvel {city} {state}",
    "site:instagram.com \"venda\" {city} {state}",
    "site:instagram.com \"aluguel\" {city} {state}",
    "site:instagram.com realtor {city}",
    "site:instagram.com \"real estate\" {city}",
    "site:instagram.com broker {city} {state}",
    "site:instagram.com property {city} {state}",
  ],
};

/**
 * Generates optimized Google Dorking queries for Instagram real estate searches
 */
export function generateOptimizedQueries(
  city: string,
  state: string,
  startDate?: Date,
  endDate?: Date
): { query: string; description: string }[] {
  const queries: { query: string; description: string }[] = [];

  // Strategy 1: Direct imobiliária search
  queries.push({
    query: `site:instagram.com imobiliária "${city}" "${state}"`,
    description: `Buscando imobiliárias em ${city}, ${state}`,
  });

  // Strategy 2: Property sales
  queries.push({
    query: `site:instagram.com "venda" "imóvel" "${city}" "${state}"`,
    description: `Buscando vendas de imóveis em ${city}`,
  });

  // Strategy 3: Property rentals
  queries.push({
    query: `site:instagram.com "aluguel" "imóvel" "${city}" "${state}"`,
    description: `Buscando aluguéis em ${city}`,
  });

  // Strategy 4: Real estate agents
  queries.push({
    query: `site:instagram.com realtor "${city}" "${state}"`,
    description: `Buscando corretores em ${city}`,
  });

  // Strategy 5: Broker search
  queries.push({
    query: `site:instagram.com broker "${city}"`,
    description: `Buscando brokers de imóveis em ${city}`,
  });

  // Strategy 6: Property listings
  queries.push({
    query: `site:instagram.com "imóvel à venda" "${city}"`,
    description: `Buscando listagens de imóveis em ${city}`,
  });

  // Strategy 7: Hashtag-based search
  queries.push({
    query: `site:instagram.com #imobiliária${city.toLowerCase().replace(/\s/g, "")} OR #imóvel${city.toLowerCase().replace(/\s/g, "")}`,
    description: `Buscando hashtags de imóveis em ${city}`,
  });

  // Strategy 8: Location-based search
  queries.push({
    query: `site:instagram.com "localizado em ${city}" imóvel`,
    description: `Buscando imóveis localizados em ${city}`,
  });

  // Add date filters if provided
  if (startDate && endDate) {
    const startYear = startDate.getFullYear();
    const startMonth = String(startDate.getMonth() + 1).padStart(2, "0");
    const startDay = String(startDate.getDate()).padStart(2, "0");
    const endYear = endDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, "0");
    const endDay = String(endDate.getDate()).padStart(2, "0");

    queries.forEach((q) => {
      q.query += ` after:${startYear}-${startMonth}-${startDay} before:${endYear}-${endMonth}-${endDay}`;
    });
  }

  return queries;
}

/**
 * Extracts Instagram usernames from search results
 */
export function extractUsernamesFromResults(
  searchResults: string[]
): { username: string; profileUrl: string }[] {
  const usernames = new Set<string>();
  const results: { username: string; profileUrl: string }[] = [];

  for (const result of searchResults) {
    // Match Instagram profile URLs
    const profileMatches = result.match(
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._-]+)/g
    );

    if (profileMatches) {
      for (const match of profileMatches) {
        const username = match.match(/instagram\.com\/([a-zA-Z0-9._-]+)/)?.[1];
        if (username && !usernames.has(username)) {
          usernames.add(username);
          results.push({
            username,
            profileUrl: `https://www.instagram.com/${username}/`,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Scores a comment based on lead quality indicators
 */
export function scoreLeadQuality(
  commentText: string,
  keywords: string[]
): number {
  let score = 0;

  // Base score for having keywords
  score += keywords.length * 10;

  // Bonus for multiple keywords
  if (keywords.length >= 2) score += 15;
  if (keywords.length >= 3) score += 25;

  // Bonus for specific high-intent keywords
  const highIntentKeywords = [
    "valor",
    "preço",
    "tenho interesse",
    "financiamento",
    "entrada",
  ];
  const highIntentCount = keywords.filter((k) =>
    highIntentKeywords.some((hik) => k.includes(hik))
  ).length;
  score += highIntentCount * 20;

  // Bonus for question marks (indicates genuine inquiry)
  const questionMarks = (commentText.match(/\?/g) || []).length;
  score += Math.min(questionMarks * 5, 15);

  // Penalty for very short comments (likely spam)
  if (commentText.length < 10) score -= 10;

  // Bonus for longer, more detailed comments
  if (commentText.length > 50) score += 10;

  return Math.max(0, score);
}

/**
 * Filters and ranks leads by quality
 */
export function rankLeadsByQuality(
  leads: SearchResult[]
): SearchResult[] {
  return leads
    .map((lead) => ({
      ...lead,
      quality: scoreLeadQuality(lead.commentText, lead.keywords),
    }))
    .sort((a, b) => (b as any).quality - (a as any).quality)
    .map(({ quality, ...lead }) => lead);
}

/**
 * Generates a human-readable search status message
 */
export function generateSearchStatusMessage(
  currentQuery: number,
  totalQueries: number,
  description: string
): string {
  const progress = Math.round((currentQuery / totalQueries) * 100);
  return `Procurando leads... (${progress}%) - ${description}`;
}

/**
 * Validates search parameters
 */
export function validateSearchParameters(
  city: string,
  state: string,
  startDate?: Date,
  endDate?: Date
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!city || city.trim().length === 0) {
    errors.push("Cidade é obrigatória");
  }

  if (!state || state.trim().length === 0) {
    errors.push("Estado é obrigatório");
  }

  if (startDate && endDate && startDate > endDate) {
    errors.push("Data inicial não pode ser posterior à data final");
  }

  if (endDate && endDate > new Date()) {
    errors.push("Data final não pode ser no futuro");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
