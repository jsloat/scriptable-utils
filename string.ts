import { filterJoin } from './object';
import { isString, PrimitiveType } from './common';
import { ICONS } from './icons';

export const capitalize = (str: string) =>
  str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();

const isCapitalized = (str: string) => str.toLowerCase() !== str;

export const isFirstLetterCapitalized = (str: string) =>
  isCapitalized(str.slice(0, 1));

export const truncate = (str: string, maxLength: number) => {
  const isTruncated = str.length > maxLength;
  return isTruncated ? str.slice(0, maxLength) + ICONS.ELLIPSIS : str;
};

// ts-unused-exports:disable-next-line
export const letterToEmoji = (letter: string): string => {
  const emojiMap = {
    a: '🅐',
    b: '🅑',
    c: '🅒',
    d: '🅓',
    e: '🅔',
    f: '🅕',
    g: '🅖',
    h: '🅗',
    i: '🅘',
    j: '🅙',
    k: '🅚',
    l: '🅛',
    m: '🅜',
    n: '🅝',
    o: '🅞',
    p: '🅟',
    q: '🅠',
    r: '🅡',
    s: '🅢',
    t: '🅣',
    u: '🅤',
    v: '🅥',
    w: '🅦',
    x: '🅧',
    y: '🅨',
    z: '🅩',
  };
  // @ts-ignore
  const emoji = emojiMap[letter.toLowerCase()];
  return emoji || '?';
};

export const numberToEmoji = (
  num: number,
  emojiKey: 'circle' | 'square' = 'circle'
) => {
  const emojiMaps = {
    square: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'],
    circle: ['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'],
  };
  const emojiMap = emojiMaps[emojiKey];
  const isNegative = num < 0;
  const parsedNum = Math.abs(Math.round(num));

  const ones = parsedNum % 10;
  const tens = ((parsedNum - ones) / 10) % 10;
  const hundreds = ((parsedNum - 10 * tens - ones) / 100) % 10;
  return filterJoin([
    isNegative ? '-' : null,
    hundreds ? emojiMap[hundreds] : null,
    tens || hundreds ? emojiMap[tens] : null,
    emojiMap[ones],
  ]);
};

/**
 * For use mainly with Bear parsing -- indent level is calculated as number of
 * tabs at start of line.
 */
export const getIndentLevel = (line: string) => {
  const match = line.match(/^(\t*)/);
  return match ? match[1]?.length ?? 0 : 0;
};

type TrimLinesOpts = { onlyTop?: boolean; onlyBottom?: boolean };
/**
 * Given array of strings, return array of lines removing all empty lines
 * at beginning and end of lines.
 */
export const trimLines = <T extends string>(
  lines: T[],
  { onlyTop, onlyBottom }: TrimLinesOpts = {}
) => {
  const { firstContentLine, lastContentLine } = lines.reduce(
    (acc, line, i) => {
      const lineHasContent = Boolean(line.trim().length);
      if (acc.firstContentLine === -1 && lineHasContent)
        acc.firstContentLine = i;
      if (lineHasContent) acc.lastContentLine = i;
      return acc;
    },
    { firstContentLine: -1, lastContentLine: -1 }
  );
  if (lastContentLine === -1) return [];
  if (onlyTop) return lines.slice(firstContentLine);
  if (onlyBottom) return lines.slice(0, lastContentLine + 1);
  return lines.slice(firstContentLine, lastContentLine + 1);
};

/** Wrapper for trimLines that accepts string, rather than string[] */
export const trimLinesOfString = (str: string) =>
  trimLines(str.split('\n')).join('\n');

/** Input space-separated words, returns camelCasedResult */
export const camelCase = (sentence: string) =>
  sentence
    .split(' ')
    .reduce(
      (acc, word, i) => acc + (i === 0 ? word.toLowerCase() : capitalize(word)),
      ''
    );

// ts-unused-exports:disable-next-line
export const lispCase = (str: string) => str.toLowerCase().replace(/ /g, '-');

/** Very simplistic algorithm */
export const pluralize = (singularWord: string, count: number) =>
  `${singularWord}${count === 1 ? '' : 's'}`;

export const lowerIncludes = (containingString: string, query: string) =>
  containingString.toLowerCase().includes(query.toLowerCase());

export const lowerEquals = (s1: string, s2: string) =>
  s1.toLowerCase() === s2.toLowerCase();

export const escapeQuotesHTML = (str: string) =>
  str.replace(/'/g, '&apos;').replace(/"/g, '&quot;');

export const splitByRegex = (str: string, regex: RegExp) => {
  const uniqueRegexReplacer = UUID.string();
  const globalRegex = new RegExp(
    regex.source,
    regex.flags.includes('g') ? regex.flags : regex.flags + 'g'
  );
  const withUniqueDividers = str.replace(globalRegex, uniqueRegexReplacer);
  return withUniqueDividers.split(uniqueRegexReplacer);
};

export const tidyLog = (message: any) =>
  console.log(JSON.stringify(message, null, 2));

// https://stackoverflow.com/questions/15458876/check-if-a-string-is-html-or-not/15458987
// ts-unused-exports:disable-next-line
export const isProbablyHtml = (str: string) => /<\/?[a-z][\s\S]*>/i.test(str);

export const extractLinks = (text: string) => {
  const matches = text.match(/[a-z-]+:\/\/\S*/gim);
  return matches ? Array.from(matches) : [];
};

/** `Array.splice` mutates the source array and returns the spliced elements.
 * This rather clones the array, and returns the clone after being spliced */
export const spliceInPlace = <T extends PrimitiveType, U extends PrimitiveType>(
  arr: T[],
  startIndex: number,
  deleteCount: number,
  ...items: U[]
) => {
  const shallowClone = [...arr];
  // @ts-ignore
  shallowClone.splice(startIndex, deleteCount, ...items);
  return shallowClone as (T | U)[];
};

const countChar = (string: string, char: string) =>
  string.split(char).length - 1;

export const isID = (val: any): val is ID =>
  isString(val) && countChar(val, '-') === 4;

export const prefixEachLine = (str: string, prefix: string) =>
  str
    .split('\n')
    .map(line => `${prefix}${line}`)
    .join('\n');
