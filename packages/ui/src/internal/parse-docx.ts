import mammoth from 'mammoth';
import DOMPurify from 'dompurify';

export async function parseDocx(data: ArrayBuffer, idPrefix: string) {
  const result = await mammoth.convertToHtml(
    { arrayBuffer: data },
    {
      externalFileAccess: false,
      includeEmbeddedStyleMap: false,
      idPrefix,
      convertImage: mammoth.images.imgElement(async (image) => {
        if (!/^image\/(png|jpeg|gif|webp|bmp)$/.test(image.contentType)) return { src: '' };
        return { src: `data:${image.contentType};base64,${await image.readAsBase64String()}` };
      }),
    },
  );
  const html = DOMPurify.sanitize(result.value, {
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'del',
      'sup',
      'sub',
      'ul',
      'ol',
      'li',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'a',
      'img',
      'blockquote',
      'pre',
      'code',
      'hr',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'start', 'id', 'scope'],
    SANITIZE_NAMED_PROPS: true,
  });
  const document = new DOMParser().parseFromString(html, 'text/html');
  for (const link of document.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href') ?? '';
    if (href.startsWith('#')) link.setAttribute('href', `#user-content-${href.slice(1)}`);
    if (/^(https?:)?\/\//i.test(href)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  }
  return {
    html: document.body.innerHTML,
    text: document.body.textContent ?? '',
    warnings: result.messages.map((message) => message.message),
  };
}
