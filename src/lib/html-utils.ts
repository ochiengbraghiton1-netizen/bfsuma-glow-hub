/**
 * Strips HTML tags from a string for use in SEO metadata and JSON-LD.
 * @param html - The HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/&amp;/g, '&')  // Replace &amp; with &
    .replace(/&lt;/g, '<')   // Replace &lt; with <
    .replace(/&gt;/g, '>')   // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'")  // Replace &#39; with '
    .replace(/\s+/g, ' ')    // Collapse multiple spaces
    .trim();
}

/**
 * Truncates text to a maximum length, adding ellipsis if needed.
 * @param text - The text to truncate
 * @param maxLength - Maximum length (default 160 for meta descriptions)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}
