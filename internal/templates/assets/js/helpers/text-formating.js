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
