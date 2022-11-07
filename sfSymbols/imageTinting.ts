import { compose, map, tap, toArray } from '../arrayTransducers';
import { getColor } from '../colors';
import { isString } from '../common';
import ThrottledBatchQueue from '../ThrottledBatchQueue';
import { cacheTintedImage, getCachedImage } from './persistedIcons';
import {
  getCurrScriptPreloadIconKeys,
  throttledLogTintRequest,
} from './preloadList';
import replaceColorInCanvas from './replaceColorInCanvas';
import symbolsMap from './sfSymbolsMap';
import { SFSymbolKey, TintRequestKey } from './types';
import { parseTintRequestKey } from './utils';

const tintAndCacheImage = async (
  sfSymbolImg: Image,
  color: Color,
  iconKey: SFSymbolKey
) => {
  const tintedImg = await replaceColorInCanvas(sfSymbolImg, color);
  cacheTintedImage(iconKey, color.hex, tintedImg);
};

const getUntintedImage = (key: SFSymbolKey) => {
  const symbol = SFSymbol.named(symbolsMap[key]);
  if (!symbol) {
    throw new Error(`Invalid SFSymbol key: ${key}`);
  }
  /** Make it a bit bigger so it's high-def enough to scale up. */
  symbol.applyFont(Font.systemFont(53));
  symbol.applyThinWeight();
  return symbol.image;
};

const preloadIconQueue = new ThrottledBatchQueue<TintRequestKey>({
  maxEntitiesPerOperation: 20,
  batchOperation: keys =>
    toArray(
      keys,
      compose(
        map(parseTintRequestKey),
        tap(({ iconKey, color }) => getSfSymbolImg(iconKey, color))
      )
    ),
});

//

export const getSfSymbolImg = (
  key: SFSymbolKey,
  color: Color | null = getColor('primaryTextColor')
) => {
  const untintedImg = getUntintedImage(key);
  if (!color) return untintedImg;
  const hex = color.hex;
  throttledLogTintRequest(key, hex);
  const cachedImgResponse = getCachedImage(key, hex);
  if (!isString(cachedImgResponse)) return cachedImgResponse;
  if (cachedImgResponse === 'FILE_DOES_NOT_EXIST') {
    tintAndCacheImage(untintedImg, color, key);
  }
  return untintedImg;
};

export const preloadIcons = async () =>
  preloadIconQueue.push(...(await getCurrScriptPreloadIconKeys()));

export const haltIconPreload = () => preloadIconQueue.pause();
