export const ICONS = {
  ARROW_DOWN: '↓',
  ARROW_RIGHT: '→',
  BLOCK: '█',
  ELLIPSIS: '…',
  OPEN_EXTERNAL: ' ↗',
  PAPERCLIP: '📎',
  VERTICAL_ELLIPSIS: '⋮',
  PENCIL: '✐',
  HEART: '❤️',
  STAR: '✭',
  FOLDER: '📁',
  CHEVRON_RIGHT: '›',
};

export const isIconKey = (key: any): key is keyof typeof ICONS =>
  Object.keys(ICONS).some(k => k === key);
