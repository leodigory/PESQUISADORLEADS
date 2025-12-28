import axios from "axios";
import { Lead } from "./mockLeadData";

export interface GoogleSearchResult {
    kind: string;
    title: string;
    htmlTitle: string;
    link: string;
    displayLink: string;
    snippet: string;
    htmlSnippet: string;
    formattedUrl: string;
    pagemap?: {
        metatags?: Array<Record<string, string>>;
    };
}

interface SearchResponse {
    items?: GoogleSearchResult[];
    searchInformation?: {
        totalResults: string;
    };
}

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_SEARCH_ENGINE_ID;

// Simple ID generator to avoid external dependencies
function generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Performs a real search using Google Custom Search JSON API
 * Supports pagination via start index
 */
export async function performRealSearch(query: string, start: number = 1): Promise<GoogleSearchResult[]> {
    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
        console.warn("Missing Google API Key or Custom Search Engine ID. Returning empty results.");
        return [];
    }

    try {
        console.log(`[Google Search] Searching for: "${query}" (start: ${start})`);
        const response = await axios.get<SearchResponse>("https://www.googleapis.com/customsearch/v1", {
            params: {
                key: GOOGLE_API_KEY,
                cx: GOOGLE_CX,
                q: query,
                num: 10, // Max allowed per request
                start: start,
            },
        });

        return response.data.items || [];
    } catch (error) {
        console.error("Error performing Google Search:", error);
        return [];
    }
}

/**
 * Generates search queries
 */
export function generateLiveSearchQueries(city: string, state: string, neighborhood?: string): string[] {
    const location = neighborhood ? `${neighborhood}, ${city}` : `${city}, ${state}`;
    const broadLocation = `${city}, ${state}`;

    return [
        `site:instagram.com "imóveis" "${location}" "contato"`,
        `site:instagram.com "venda" "apartamento" "${location}"`,
        `site:facebook.com "imóvel" "${location}" "mais informações"`,
        `site:linkedin.com "corretor de imóveis" "${city}"`,
        `site:instagram.com "aluguel" "${location}" -imobiliaria`, // Try to find owners directly
        `site:facebook.com "vendo casa" "${broadLocation}"`,
        `site:olx.com.br "imóvel" "${city}"`,
        // B2B & Directories (Econodata, CNPJ, Maps)
        `site:econodata.com.br "imobiliária" "${city}" "telefone"`,
        `site:cnpj.biz "imobiliária" "${city}" "whatsapp"`,
        `site:solutudo.com.br "${city}" "imobiliárias"`,
        `site:google.com/maps "imobiliária" "${city}"`,
        `site:linkedin.com/company "imobiliária" "${city}"`,
        `site:instagram.com "creci" "${city}" "business"`, // Agents with CRECI
        // Construction Companies & Deep Search
        `site:tenda.com "lançamento" "subsídio" "${city}"`,
        `site:mrv.com.br "apartamento" "venda" "${city}"`,
        `site:victa.com.br "${city}"`,
        `site:direcional.com.br "${city}"`,

        // Leaked/Public Docs & Libraries
        `site:docs.google.com/spreadsheets "leads" "imobiliária" "${city}"`,
        `site:drive.google.com "lista" "corretores" "${city}"`,
        `site:drive.google.com "clientes" "imóveis" "${city}"`,
        `filetype:pdf "lista de preços" "imóveis" "${city}"`,
        `filetype:xls "cadastro" "clientes" "imobiliária"`,
        `intitle:"index of" "corretores" "${city}"`, // Open Directories
        `intitle:"lista de corretores" "${city}" filetype:pdf`,
    ];
}

/**
 * Orchestrates the search and maps to Lead format
 * NOW ENHANCED: Searches multiple pages and multiple queries
 */
export async function searchAndMapToLeads(city: string, state: string, neighborhood?: string): Promise<Lead[]> {
    const queries = generateLiveSearchQueries(city, state, neighborhood);
    let allResults: GoogleSearchResult[] = [];

    // We will execute the first 4 queries to get a good mix
    // And for each, we might fetch up to 2 pages (20 results) if possible
    // Be mindful of quota: 100 queries per day free.
    // 4 queries * 2 pages = 8 API calls per search. Safe for ~12 searches a day.

    const QUERIES_TO_RUN = 5;
    const PAGES_PER_QUERY = 2; // 10 results per page, so 2 pages = 20 results per query

    for (let i = 0; i < Math.min(queries.length, QUERIES_TO_RUN); i++) {
        const query = queries[i];

        for (let page = 0; page < PAGES_PER_QUERY; page++) {
            const start = (page * 10) + 1;
            const results = await performRealSearch(query, start);

            if (results.length === 0) break; // Stop if no results on this page

            allResults = [...allResults, ...results];

            // Small delay to be nice to the API
            await delay(500);
        }
    }

    // Deduplicate based on Link
    const seenLinks = new Set<string>();
    const uniqueResults = allResults.filter(r => {
        if (seenLinks.has(r.link)) return false;
        seenLinks.add(r.link);
        return true;
    });

    console.log(`[Search] Found ${uniqueResults.length} unique results from ${allResults.length} total raw hits.`);

    return uniqueResults.map(r => {
        let platform: any = "instagram";
        if (r.link.includes("facebook")) platform = "facebook";
        else if (r.link.includes("linkedin")) platform = "linkedin";
        else if (r.link.includes("olx")) platform = "olx";
        else if (r.link.includes("google.com/maps")) platform = "google_maps";
        else if (r.link.includes("econodata") || r.link.includes("cnpj.biz") || r.link.includes("solutudo")) platform = "business_directory";

        const instagramUserMatch = r.link.match(/instagram\.com\/([^/]+)/);
        const instagramUser = instagramUserMatch ? `@${instagramUserMatch[1]}` : undefined;

        // Try to find a date in the snippet (heuristic)
        let postDate = new Date();
        const dateMatch = r.snippet.match(/(\d{1,2}) de ([a-z]+)\. de (\d{4})/i) || r.snippet.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        // This is very rough, usually Google API doesn't give clean dates. 
        // We defaults to "now" but maybe we can randomize slightly to show variety if needed, 
        // or just keep it as "Recently found".

        return {
            id: generateId(),
            name: r.title
                .replace(/ \| Instagram.*$/, "")
                .replace(/ - Instagram.*$/, "")
                .replace(/ \| Facebook.*$/, "")
                .replace(/ - Facebook.*$/, "")
                .replace(/ \| LinkedIn.*$/, "")
                .trim()
                .substring(0, 50),
            comment: r.snippet,
            platform: platform as Lead["platform"],
            date: postDate.toLocaleDateString('pt-BR'),
            postDate: postDate.toISOString(),
            keywords: [city, neighborhood || state].filter(Boolean) as string[],
            quality: 70 + Math.floor(Math.random() * 30), // Random quality score 70-100
            postUrl: r.link,
            instagram: instagramUser,
            facebook: platform === "facebook" ? r.title : undefined,
            contact: undefined,
            email: undefined,
            phone: undefined,
            whatsapp: undefined
        };
    });
}
