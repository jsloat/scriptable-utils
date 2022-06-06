export const ICONS = {
  ARROW_DOWN: '↓',
  ARROW_RIGHT: '→',
  BLOCK: '█',
  CHEVRON_LEFT: '‹',
  CHEVRON_RIGHT: '›',
  ELLIPSIS: '…',
  FOLDER: '📁',
  HEART: '❤️',
  MAGNIFYING_GLASS: '🔍',
  OPEN_EXTERNAL: ' ↗',
  PAPERCLIP: '📎',
  PENCIL: '✐',
  STAR: '✭',
  VERTICAL_ELLIPSIS: '⋮',
};

export const isIconKey = (key: any): key is keyof typeof ICONS =>
  Object.keys(ICONS).some(k => k === key);
