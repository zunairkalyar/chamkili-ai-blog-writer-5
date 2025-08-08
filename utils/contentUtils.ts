import TurndownService from 'turndown';
import { ContentBlock } from '../components/BlogPostDisplay';
import { ImageState } from '../App';

const turndownService = new TurndownService();

export function convertBlocksToHtml(blocks: ContentBlock[], imageStates: Record<string, ImageState>): string {
    return blocks.map(block => {
        if (block.type === 'html') {
            return block.data.html;
        }
        if (block.type === 'image') {
            const state = imageStates[block.id];
            if (state?.status === 'success' && state.url) {
                const altText = state.prompt.substring(0, 100).replace(/"/g, '&quot;');
                return `<p><img src="${state.url}" alt="${altText}" style="width: 100%; height: auto; border-radius: 12px; margin-top: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);" /></p>`;
            }
        }
        return '';
    }).join('\n');
}

export function convertBlocksToMarkdown(blocks: ContentBlock[], imageStates: Record<string, ImageState>): string {
    const html = blocks.map(block => {
        if (block.type === 'html') {
            return block.data.html;
        }
        if (block.type === 'image') {
            const state = imageStates[block.id];
            if (state?.status === 'success' && state.url) {
                // Markdown images: ![alt text](url)
                const altText = state.prompt.substring(0, 100);
                return `![${altText}](${state.url})`;
            }
        }
        return '';
    }).join('\n\n');
    
    return turndownService.turndown(html);
}

export function convertBlocksToText(blocks: ContentBlock[]): string {
    const html = blocks.map(block => {
        if (block.type === 'html') {
            return block.data.html;
        }
        return '';
    }).join('\n');

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
}

export function convertFaqToHtml(faq: { question: string, answer: string }[]): string {
  if (!faq || faq.length === 0) return '';

  const faqItems = faq.map(item => `
    <details style="margin-bottom: 1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; font-family: 'Poppins', sans-serif;">
      <summary style="font-weight: 600; cursor: pointer; color: #3D2C21;">${item.question}</summary>
      <p style="margin-top: 0.75rem; color: #4b5563;">${item.answer}</p>
    </details>
  `).join('');

  return `
    <div style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px dashed #e0d1c8;">
        <h2 style="font-family: 'Playfair Display', serif; color: #C57F5D; margin-bottom: 1.5rem;">Frequently Asked Questions</h2>
        ${faqItems}
    </div>
  `;
}