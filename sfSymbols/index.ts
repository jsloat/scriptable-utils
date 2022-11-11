import symbolsMap from './sfSymbolsMap';
import { SFSymbolKey } from './types';

export { getIconPreloadHelpers, getSfSymbolImg } from './imageTinting';
export { default as sfSymbolsMap } from './sfSymbolsMap';
export { SFSymbolKey } from './types';

export const isSfSymbolKey = (key: any): key is SFSymbolKey =>
  Object.keys(symbolsMap).some(k => k === key);
