/**
 * Google Dorking service for finding Instagram real estate posts
 * Uses Google Search API to find public Instagram posts without login
 */

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
}

/**
 * Builds a Google Dorking query for Instagram real estate posts
 */
export function buildDorkingQuery(
  city: string,
  state: string,
  startDate?: Date,
  endDate?: Date
): string {
  const baseQuery = `site:instagram.com "imobiliária" OR "imóvel" OR "imovel" "${city}" "${state}"`;

  if (startDate && endDate) {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    return `${baseQuery} after:${startYear}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")} before:${endYear}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
  }

  return baseQuery;
}

/**
 * Extracts Instagram post URLs from Google search results
 */
export function extractInstagramUrls(results: GoogleSearchResult[]): string[] {
  const instagramUrls: string[] = [];

  for (const result of results) {
    // Match Instagram post URLs
    const postMatch = result.link.match(/https:\/\/www\.instagram\.com\/p\/[a-zA-Z0-9_-]+/);
    if (postMatch) {
      instagramUrls.push(postMatch[0]);
    }

    // Also check in snippet
    const snippetMatch = result.snippet.match(/instagram\.com\/p\/[a-zA-Z0-9_-]+/);
    if (snippetMatch && !instagramUrls.includes(snippetMatch[0])) {
      instagramUrls.push(`https://www.${snippetMatch[0]}`);
    }
  }

  return Array.from(new Set(instagramUrls)); // Remove duplicates
}

/**
 * Parses Instagram post URL to extract post ID
 */
export function extractPostId(url: string): string | null {
  const match = url.match(/\/p\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Generates alternative search queries for better coverage
 */
export function generateAlternativeQueries(
  city: string,
  state: string
): string[] {
  const queries = [
    `site:instagram.com imobiliária ${city} ${state}`,
    `site:instagram.com "imóvel" ${city} ${state}`,
    `site:instagram.com "imovel" ${city} ${state}`,
    `site:instagram.com "venda" ${city} ${state} imóvel`,
    `site:instagram.com "aluguel" ${city} ${state} imóvel`,
    `site:instagram.com "imobiliária" ${city}`,
    `site:instagram.com realtor ${city} ${state}`,
    `site:instagram.com "real estate" ${city} ${state}`,
  ];

  return queries;
}

/**
 * Simulates fetching Google search results (in real implementation, would use Google Search API)
 * Returns mock data for demonstration
 */
export async function searchInstagramPosts(
  query: string
): Promise<GoogleSearchResult[]> {
  // In a real implementation, this would call Google Custom Search API
  // For now, return empty array as placeholder
  // The actual implementation would require API key and quota

  console.log(`[Google Dorking] Query: ${query}`);

  // Mock results for demonstration
  return [];
}

/**
 * Validates if a URL is a valid Instagram post URL
 */
export function isValidInstagramPostUrl(url: string): boolean {
  return /https:\/\/www\.instagram\.com\/p\/[a-zA-Z0-9_-]+/.test(url);
}

/**
 * Extracts caption/snippet from Instagram post URL
 * (would require actual scraping in real implementation)
 */
export function extractPostCaption(snippet: string): string {
  // Remove URLs and clean up text
  return snippet
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/#\w+/g, "")
    .trim();
}
