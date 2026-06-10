import TurndownService from "turndown";

export class HtmlUtil {
    /**
     * Convert HTML to Markdown
     * @param html - HTML string to convert
     * @returns Markdown string
     */
    static convertHtmlToMarkdown(html: string): string {
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            bulletListMarker: '-',
            emDelimiter: '*'
        });

        return turndownService.turndown(html);
    }

    /**
     * Remove all links from HTML content while preserving the link text
     * @param html - HTML string containing links
     * @returns HTML string with links removed but text preserved
     */
    static removeLinksFromHtml(html: string): string {
        if (!html) return html;

        return html.replace(/<a\s+(?:[^>]*?\s+)?href=["'][^"']*["'][^>]*>([^<]*)<\/a>/gi, '$1');
    }
}
