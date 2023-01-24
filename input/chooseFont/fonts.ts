import { objectKeys } from '../../object';
import { FontFamily, FontFamilyName, FontGetter, FontWeight } from './types';

const staticFonts = {
  largeTitle: Font.largeTitle,
  title1: Font.title1,
  title2: Font.title2,
  title3: Font.title3,
  headline: Font.headline,
  subheadline: Font.subheadline,
  body: Font.body,
  callout: Font.callout,
  footnote: Font.footnote,
  caption1: Font.caption1,
  caption2: Font.caption2,
};

export const STATIC_FONT_LABELS = objectKeys(staticFonts);

export type StaticFontLabel = typeof STATIC_FONT_LABELS[number];

const systemFont: FontFamily = {
  100: Font.ultraLightSystemFont,
  200: Font.thinSystemFont,
  300: Font.lightSystemFont,
  400: Font.regularSystemFont,
  500: Font.mediumSystemFont,
  600: Font.semiboldSystemFont,
  700: Font.boldSystemFont,
  800: Font.heavySystemFont,
  900: Font.blackSystemFont,
};

const monospacedFont: FontFamily = {
  100: Font.ultraLightMonospacedSystemFont,
  200: Font.thinMonospacedSystemFont,
  300: Font.lightMonospacedSystemFont,
  400: Font.regularMonospacedSystemFont,
  500: Font.mediumMonospacedSystemFont,
  600: Font.semiboldMonospacedSystemFont,
  700: Font.boldMonospacedSystemFont,
  800: Font.heavyMonospacedSystemFont,
  900: Font.blackMonospacedSystemFont,
};

const roundedFont: FontFamily = {
  100: Font.ultraLightRoundedSystemFont,
  200: Font.thinRoundedSystemFont,
  300: Font.lightRoundedSystemFont,
  400: Font.regularRoundedSystemFont,
  500: Font.mediumRoundedSystemFont,
  600: Font.semiboldRoundedSystemFont,
  700: Font.boldRoundedSystemFont,
  800: Font.heavyRoundedSystemFont,
  900: Font.blackRoundedSystemFont,
};

const fontFamilies: Record<FontFamilyName, FontFamily> = {
  System: systemFont,
  Monospaced: monospacedFont,
  Rounded: roundedFont,
};

//

type SharedGetFontFamilyOpts = { family: FontFamilyName; weight?: FontWeight };

type GetFontFamily = {
  (opts: SharedGetFontFamilyOpts & { size: number }): Font;
  (opts: SharedGetFontFamilyOpts & { size?: number }): FontGetter;
};

export const getFontFamily: GetFontFamily = ({
  family,
  size,
  weight = 400,
}): any => {
  const fontGetter = fontFamilies[family][weight];
  return size ? fontGetter(size) : fontGetter;
};

type GetItalicFont = {
  (size: number): Font;
  (size?: number): FontGetter;
};

/** This font is sort of unique in that it has no weight variations, but can
 * vary in size. */
export const getItalicFont: GetItalicFont = (size): any =>
  size ? Font.italicSystemFont(size) : Font.italicSystemFont;

export const getStaticFont = (fontLabel: StaticFontLabel) =>
  staticFonts[fontLabel];
