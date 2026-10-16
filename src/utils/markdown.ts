// 카드 미리보기용: 마크다운 문법 기호를 제거한 평문 반환
export const markdownUtils = {
  toPlainText: (markdown: string): string =>
    markdown
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
      .replace(/^\s*[-*_]{3,}\s*$/gm, '')
      .replace(/^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/gm, '')
      .replace(/\[[ xX]\]\s+/g, '')
      .replace(/(\*\*|__|\*|_|~~|`)/g, '')
      .replace(/\|/g, ' ')
      .replace(/\s*\n\s*/g, ' ')
      .trim(),
}
