import { compose, map, tap, toArray } from '../arrayTransducers';
import { getColor } from '../colors';
import { isString } from '../common';
import ThrottledBatchQueue from '../ThrottledBatchQueue';
import { NoParamFn } from '../types/utilTypes';
import { cacheTintedImage, getCachedImage } from './persistedIcons';
import {
  getCurrScriptPreloadIconKeys,
  throttledLogTintRequest,
} from './preloadList';
import replaceColorInCanvas from './replaceColorInCanvas';
import { TintRequestKey } from './types';
import { parseTintRequestKey } from './utils';

const tintAndCacheImage = async (
  sfSymbolImg: Image,
  color: Color,
  iconKey: string
) => {
  const tintedImg = await replaceColorInCanvas(sfSymbolImg, color);
  cacheTintedImage(iconKey, color.hex, tintedImg);
};

const getUntintedImage = (key: string) => {
  const symbol = SFSymbol.named(key);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!symbol) {
    throw new Error(`Invalid SFSymbol key: ${key}`);
  }
  /** Make it a bit bigger so it's high-def enough to scale up. */
  symbol.applyFont(Font.systemFont(53));
  symbol.applyThinWeight();
  return symbol.image;
};

const getPreloadIconQueue = (onBatchOperationDone?: NoParamFn) =>
  new ThrottledBatchQueue<TintRequestKey>({
    maxEntitiesPerOperation: 20,
    batchOperation: keys => {
      toArray(
        keys,
        compose(
          map(parseTintRequestKey),
          tap(({ iconKey, color }) => getSfSymbolImg(iconKey, color))
        )
      );
      onBatchOperationDone?.();
    },
  });

//

export const getSfSymbolImg = (
  key: string,
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

/** Because this creates a new queue every time it's called, it should be user
 * sparingly */
export const getIconPreloadHelpers = (onBatchOperationDone?: NoParamFn) => {
  const queue = getPreloadIconQueue(onBatchOperationDone);
  return {
    preloadIcons: async () =>
      queue.push(...(await getCurrScriptPreloadIconKeys())),
    haltIconPreload: () => queue.pause(),
  };
};
