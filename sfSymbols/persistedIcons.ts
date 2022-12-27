import { destructiveConfirm, OK } from '../input/confirm';
import { createDirIfNotExists, getDirContents } from '../io/filesystemUtils';
import { FILE_EXTENSION, IMAGE_DIR_PATH } from './consts';
import { SFSymbolKey, TintRequestKey } from './types';
import { getTintRequestKey } from './utils';

/** Images stored in-memory once requested */
const cache = new Map<TintRequestKey, Image>();

const getImgPath = (key: TintRequestKey) =>
  `${IMAGE_DIR_PATH}/${key}.${FILE_EXTENSION}`;

const downloadAndCacheImage = async (key: TintRequestKey, path: string) => {
  const io = FileManager.iCloud();
  if (!io.isFileDownloaded(path)) await io.downloadFileFromiCloud(path);
  const image = io.readImage(path);
  if (!image) throw new Error(`Can not load icon ${key}`);
  cache.set(key, image);
};

const saveImage = (key: TintRequestKey, image: Image) => {
  const io = FileManager.iCloud();
  const path = getImgPath(key);
  io.writeImage(path, image);
  cache.set(key, image);
};

/** Used to reset the stored icon cache, useful if e.g. there's a major change
 * to the icons or color palettes used in scripts. */
export const deleteAllCachedIcons = async () => {
  const cachedIcons = getDirContents(IMAGE_DIR_PATH);
  if (!cachedIcons.length) {
    OK('No icons to delete');
    return;
  }
  const confirmed = await destructiveConfirm(
    `Delete all cached icons (${cachedIcons.length})?`,
    { message: 'Icons will be re-cached over time' }
  );
  if (!confirmed) return;
  const io = FileManager.iCloud();
  cachedIcons.forEach(({ filepath: cachedIconPath }) =>
    io.remove(cachedIconPath)
  );
};

type GetCachedImageReturn = Image | 'FILE_DOES_NOT_EXIST' | 'LOADING_FILE';
export const getCachedImage = (
  iconKey: SFSymbolKey,
  colorHex: string
): GetCachedImageReturn => {
  createDirIfNotExists(IMAGE_DIR_PATH);
  const key = getTintRequestKey(iconKey, colorHex);
  const cachedImg = cache.get(key);
  if (cachedImg) return cachedImg;
  const path = getImgPath(key);
  if (!FileManager.iCloud().fileExists(path)) return 'FILE_DOES_NOT_EXIST';
  downloadAndCacheImage(key, path);
  return 'LOADING_FILE';
};

export const cacheTintedImage = (
  iconKey: SFSymbolKey,
  colorHex: string,
  image: Image
) => {
  createDirIfNotExists(IMAGE_DIR_PATH);
  const key = getTintRequestKey(iconKey, colorHex);
  const exists = FileManager.iCloud().fileExists(getImgPath(key));
  if (!exists) saveImage(key, image);
};
