/**
 * Fait apparaître les balises BBCode dans le textarea autour de la zone de texte sélectionnée
 * Si aucun texte n'est sélectionné, les balises apparaissent à la fin et le curseur se place entre elles
 * @param {string} tag L'indicateur de balise BBCode à utiliser (b, i, center, ...)
 */
export function applyBBCode(tag) {
  const textarea = document.getElementById("post-content");
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);

  const openTag = `[${tag}]`;
  const closeTag = `[/${tag}]`;
  const replacement = openTag + selectedText + closeTag;

  textarea.setRangeText(replacement, start, end, "preserve");

  const newStart = start + openTag.length;
  const newEnd = newStart + selectedText.length;

  textarea.setSelectionRange(newStart, newEnd);

  textarea.focus();
}

/**
 * Transforme le contenu du message en HTML lisible pour l'affichage du post
 * Retire d'éventuelles balises HTML injectées par l'utilisateur
 *
 * @param {string} postContent Le contenu brut du message avec les balises et le MD
 * @param {string} typeMode Les modes de saisie activés (BBCode et/ou Markdown)
 * @returns {string} Le texte en HTML safe et avec la mise en page
 */
export function readBBCode(postContent, typeMode) {
  // Retire les tag HTML potentiellement dangereux dans les messages
  let secureHTML = postContent
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  if (typeMode.MDon) secureHTML = mdToHTML(secureHTML);
  if (typeMode.BBcode) secureHTML = bbToHTML(secureHTML);

  return secureHTML;
}

/**
 * Transforme les balises BBCode en HTML
 * @param {string} text Le texte contenant les balises BBCode
 * @returns {string} Le texte avec des balises HTML équivalentes
 */
function bbToHTML(text) {
  const tagMap = {
    b: "strong",
    i: "em",
    u: "u",
    s: "s",
    left: 'div style="text-align:left"',
    right: 'div style="text-align:right"',
    center: 'div style="text-align:center"',
    justify: 'div style="text-align:justify"',
  };

  const tags = Object.keys(tagMap).join("|");
  const balancedRegex = new RegExp(
    `\\[(${tags})\\]([\\s\\S]*?)\\[\\/\\1\\]`,
    "g",
  );

  let oldText;
  do {
    oldText = text;
    text = text.replace(balancedRegex, (match, tag, content) => {
      const htmlTag = tagMap[tag];
      const baseTag = htmlTag.split(" ")[0];
      return `<${htmlTag}>${content}</${baseTag}>`;
    });
  } while (text !== oldText);

  return text;
}

/**
 * Transforme les indicateurs markdown (**gras**, _italique_) en HTML
 * @param {string} text Le texte contenant les indicateurs markdown
 * @returns {string} Le texte avec des balises HTML équivalentes
 */
function mdToHTML(text) {
  const patterns = {
    boldItalic: /\*\*\*(.*?)\*\*\*/,
    bold: /\*\*(.*?)\*\*/,
    underline: /__(.*?)__/,
    italic1: /[_](.*?)[_]/,
    italic2: /[*](.*?)[*]/,
    strike: /~~(.*?)~~/,
  };

  const masterRegex = new RegExp(
    Object.values(patterns)
      .map((re) => re.source)
      .join("|"),
    "g",
  );

  return text.replace(masterRegex, (match, p1, p2, p3, p4, p5, p6) => {
    if (p1) return `<strong><em>${p1}</em></strong>`;
    if (p2) return `<strong>${p2}</strong>`;
    if (p3) return `<u>${p3}</u>`;
    if (p4) return `<em>${p4}</em>`;
    if (p5) return `<em>${p5}</em>`;
    if (p6) return `<s>${p6}</s>`;
    return match;
  });
}

/**
 * Transforme les balises HTML en BBCode
 * @param {string} html Le texte HTML provenant de .innerHTML
 * @returns {string} Le texte formaté en BBCode
 */
export function htmlToBB(html) {
  let text = html;

  const alignMap = {
    "text-align:left": "left",
    "text-align:right": "right",
    "text-align:center": "center",
    "text-align:justify": "justify",
  };

  Object.entries(alignMap).forEach(([style, bbTag]) => {
    const regex = new RegExp(`<div style=["']${style}["']>(.*?)<\\/div>`, "gi");
    text = text.replace(regex, `[${bbTag}]$1[/${bbTag}]`);
  });

  const tagMap = {
    strong: "b",
    b: "b",
    em: "i",
    i: "i",
    u: "u",
    s: "s",
  };

  Object.entries(tagMap).forEach(([htmlTag, bbTag]) => {
    const regex = new RegExp(`<${htmlTag}>(.*?)<\\/${htmlTag}>`, "gi");
    text = text.replace(regex, `[${bbTag}]$1[/${bbTag}]`);
  });

  text = text.replace(/<br\s*\/?>/gi, "\n");

  return text;
}

/**
 * Transforme les balises HTML en indicateurs Markdown
 * @param {string} html Le texte HTML provenant de .innerHTML
 * @returns {string} Le texte formaté en Markdown
 */
export function htmlToMD(html) {
  let text = html;

  text = text.replace(/<strong><em>(.*?)<\/em><\/strong>/gi, "***$1***");

  text = text.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");

  text = text.replace(/<u>(.*?)<\/u>/gi, "__$1__");

  text = text.replace(/<em>(.*?)<\/em>/gi, "_$1_");

  text = text.replace(/<s>(.*?)<\/s>/gi, "~~$1~~");

  text = text.replace(/<br\s*\/?>/gi, "\n");

  return text;
}

export function decodeHTML(map) {
  const txt = document.createElement("textarea");
  txt.innerHTML = map;
  return txt.value;
}
