/**
 * Remove espaços múltiplos, tabs e quebras de linha de textos raspados do VLR
 */
function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Converte strings de premiação (ex: "$250,000 USD") em número inteiro puro (250000)
 */
function parsePrizeAmount(rawText) {
  if (!rawText) return 0;
  const digits = rawText.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Garante protocolo HTTPS em URLs de imagens que vêm como '//owcdn.net/...'
 */
function normalizeUrl(url) {
  if (!url) return null;
  if (url.startsWith('//')) return `https:${url}`;
  return url;
}

module.exports = {
  cleanText,
  parsePrizeAmount,
  normalizeUrl,
};