import symbolsMap from './sfSymbolsMap';
import { SFSymbolKey } from './types';

export { default as sfSymbolsMap } from './sfSymbolsMap';
export { SFSymbolKey } from './types';
export { getSfSymbolImg, preloadIcons } from './imageTinting';

export const isSfSymbolKey = (key: any): key is SFSymbolKey =>
  Object.keys(symbolsMap).some(k => k === key);
