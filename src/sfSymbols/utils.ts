import { KEY_SEPARATOR } from './consts';
import { TintRequestKey } from './types';

export const getTintRequestKey = (
  iconKey: string,
  colorHex: string
): TintRequestKey => `${iconKey}${KEY_SEPARATOR}${colorHex}`;

export const parseTintRequestKey = (key: TintRequestKey) => {
  const [iconKey, colorHex] = key.split(KEY_SEPARATOR);
  return { iconKey: iconKey!, color: new Color(colorHex!) };
};

export const isSFSymbolKey = (key: string) => Boolean(SFSymbol.named(key));
