/**
 * Lead extraction and keyword detection utilities
 */

const LEAD_KEYWORDS = [
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
];

/**
 * Detects if a comment contains lead-related keywords
 */
export function isLeadComment(text: string): boolean {
  const lowerText = text.toLowerCase().trim();
  return LEAD_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

/**
 * Extracts keywords found in the comment
 */
export function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  return LEAD_KEYWORDS.filter((keyword) => lowerText.includes(keyword));
}

/**
 * Parses Instagram username from a URL or text
 */
export function parseInstagramUsername(url: string): string | null {
  // Match patterns like instagram.com/username or @username
  const patterns = [
    /instagram\.com\/([a-zA-Z0-9._-]+)/,
    /@([a-zA-Z0-9._-]+)/,
    /^([a-zA-Z0-9._-]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Constructs Instagram profile URL from username
 */
export function getInstagramProfileUrl(username: string): string {
  return `https://www.instagram.com/${username}/`;
}

/**
 * Extracts Instagram post URL from Google search result
 */
export function extractInstagramPostUrl(text: string): string | null {
  const match = text.match(/https:\/\/www\.instagram\.com\/p\/[a-zA-Z0-9_-]+/);
  return match ? match[0] : null;
}

/**
 * Simulates extracting comments from a post URL (would need real implementation)
 * For now, returns mock data structure
 */
export interface ExtractedComment {
  username: string;
  text: string;
  timestamp?: Date;
}

/**
 * Validates if a string is a valid Instagram username
 */
export function isValidInstagramUsername(username: string): boolean {
  // Instagram usernames: 1-30 characters, letters, numbers, periods, underscores
  const pattern = /^[a-zA-Z0-9._]{1,30}$/;
  return pattern.test(username);
}
