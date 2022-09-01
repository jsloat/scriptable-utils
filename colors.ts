import { countArrVal } from './array';
import { isString, objectFromEntries } from './common';
import { shortSwitch } from './flow';
import { hasKey, objectKeys } from './object';

type DynamicColor = { color: Color; isDynamic: true };
export type EnhancedColor = { color: Color; label: string; isDynamic: boolean };

const c = ([hex]: TemplateStringsArray) => new Color(hex!);

const getDynamicColorObj = (
  lightColor: Color,
  darkColor: Color
): DynamicColor => {
  const color = Color.dynamic(lightColor, darkColor);
  return { color, isDynamic: true };
};

const isDynamicColor = (val: any): val is DynamicColor =>
  Boolean(val && 'isDynamic' in val && val.isDynamic);

const COLORS = {
  white: c`ffffff`,
  black: c`000000`,

  grayMinus3: c`fdfdfd`,
  grayMinus2: c`fcfcfc`,
  grayMinus1: c`fbfbfb`,
  gray0: c`efefef`,
  gray1: c`d8d8d8`,
  gray2: c`c2c2c2`,
  gray3: c`adadad`,
  gray4: c`979797`,
  gray5: c`6c6c6c`,
  gray6: c`414141`,
  gray7: c`2b2b2b`,
  gray8: c`161616`,

  // Naming convention:
  //  {color}_d1 = a darker shade by degree 1
  //  {color}_l1 = a lighter shade by degree 1
  // https://coolors.co/253031-315659-2978a0-bcab79-c6e0ff

  red_l4: c`e3949e`,
  red_l3: c`da717e`,
  red_l2: c`d14d5e`,
  red_l1: c`c33245`,
  red: c`a12a3a`,
  red_d1: c`82212e`,
  red_d2: c`611923`,

  yellow_l3: c`eae5d6`,
  yellow_l2: c`ddd4bb`,
  yellow_l1: c`cfc3a0`,
  yellow: c`bcab79`,
  yellow_d1: c`b4a16a`,
  yellow_d2: c`a38f52`,

  dark_green_l2: c`4f6769`,
  dark_green_l1: c`3d5051`,
  dark_green: c`253031`,
  dark_green_d1: c`1a2223`,
  dark_green_d2: c`121717`,

  green_l4: c`96babd`,
  green_l3: c`73a3a7`,
  green_l2: c`508c91`,
  green_l1: c`417376`,
  green: c`315659`,
  green_d1: c`244042`,
  green_d2: c`162627`,

  deep_blue_l2: c`4da5d1`,
  deep_blue_l1: c`3292c3`,
  deep_blue: c`2978a0`,
  deep_blue_d1: c`216282`,
  deep_blue_d2: c`194961`,

  blue_l1: c`ebf4ff`,
  blue: c`c6e0ff`,
  blue_d1: c`add2ff`,
  blue_d2: c`85bcff`,
};

const COLOR_ALIASES = {
  domain_personal: COLORS.deep_blue,
  domain_work: COLORS.yellow,
  domain_mix: c`73928D`,
  danger: COLORS.red_l1,
  success: COLORS.green_l2,
  bg: getDynamicColorObj(COLORS.white, COLORS.black),
  primaryTextColor: getDynamicColorObj(COLORS.gray8, COLORS.gray1),
  secondaryTextColor: getDynamicColorObj(COLORS.gray6, COLORS.gray3),
  hr: getDynamicColorObj(COLORS.gray0, COLORS.gray7),
};

export const colorKeys = [...objectKeys(COLORS), ...objectKeys(COLOR_ALIASES)];

type ColorKey = typeof colorKeys[number];

const getKeyVal = (key: ColorKey) => {
  if (hasKey(COLORS, key)) return COLORS[key];
  if (hasKey(COLOR_ALIASES, key)) return COLOR_ALIASES[key];
  throw new Error(`No color found for key ${key}`);
};

export const getColor = (key: ColorKey) => {
  const val = getKeyVal(key);
  return isDynamicColor(val) ? val.color : val;
};

export const getDynamicColor = (
  lightColorOrKey: ColorKey | Color,
  darkColorOrKey: ColorKey | Color
) => {
  const lightColor = isString(lightColorOrKey)
    ? getColor(lightColorOrKey)
    : lightColorOrKey;
  const darkColor = isString(darkColorOrKey)
    ? getColor(darkColorOrKey)
    : darkColorOrKey;
  return Color.dynamic(lightColor, darkColor);
};

export const getColors = () =>
  objectFromEntries(colorKeys.map(key => [key, getColor(key)]));

export const getEnhancedColor = (key: ColorKey): EnhancedColor => {
  const val = getKeyVal(key);
  const isDynamic = isDynamicColor(val);
  return {
    color: isDynamicColor(val) ? val.color : val,
    label: key,
    isDynamic,
  };
};

export const getDomainColor = (domain: Domain) =>
  shortSwitch(domain, {
    personal: getColor('domain_personal'),
    work: getColor('domain_work'),
  });

export const getEntityArrColor = <T>(
  arr: T[],
  getDomain: (entity: T) => Domain | null
) => {
  const domains = arr.map(getDomain);
  const personal = countArrVal(domains, 'personal');
  const work = countArrVal(domains, 'work');
  const key: ColorKey | null =
    personal && !work
      ? 'domain_personal'
      : work && !personal
      ? 'domain_work'
      : work || personal
      ? 'domain_mix'
      : null;
  return key && getColor(key);
};
