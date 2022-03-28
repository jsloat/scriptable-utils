import { ExcludeFalsy, PrimitiveType } from './common';
import { objectEntries, objectKeys } from './object';
import sortObjects from './sortObjects';

// ts-unused-exports:disable-next-line
export const isLastArrIndex = (index: number, arr: any[]) =>
  index === arr.length - 1;

// ts-unused-exports:disable-next-line
export const last = <T>(arr: T[]) => arr[arr.length - 1];

/**
 * Vaguely similar to Array.split(), but instead of converting to string, returns array.
 * Will insert `between` between each element in the array (not at beginning or end)
 */
export const insertBetween = <T, U>(arr: T[], between: U) =>
  arr.length < 2
    ? arr
    : arr.flatMap((item, i) =>
        isLastArrIndex(i, arr) ? item : [item, between]
      );

/** Exactly one el in arr matches predicate. Default predicate is Boolean. */
// ts-unused-exports:disable-next-line
export const exactlyOne = <T>(
  arr: T[],
  predicate: ArrCallback<T, boolean> = Boolean
) => arr.map(predicate).filter(Boolean).length === 1;

export const isHomogeneous = <T extends number | string | boolean>(arr: T[]) =>
  arr.length < 2 || arr.slice(1).every(val => val === arr[0]);

export const sum = (arr: number[]) => arr.reduce((acc, num) => acc + num, 0);

// ts-unused-exports:disable-next-line
export const avg = (arr: number[]) => sum(arr) / arr.length;

export const uniqueWith = <T>(arr: T[], areEqual: (a: T, b: T) => boolean) =>
  arr.filter(
    (currentEl, i) =>
      !arr.slice(i + 1).some(subsequentEl => areEqual(currentEl, subsequentEl))
  );

export const chopEnd = <T>(arr: T[], numToChop = 1) => {
  if (numToChop > arr.length) return [];
  return arr.slice(0, arr.length - numToChop);
};

const wrap = <T extends any[], J>(arr: T, wrapper: J) => [
  wrapper,
  ...arr,
  wrapper,
];

type JoinSandwich = {
  <T extends string>(arr: T[], joiner: string, convertToString?: true): string;
  <T extends string, J extends string>(
    arr: T[],
    joiner: J,
    convertToString?: false
  ): (T | J)[];
};
/** Just like join, but also adds join string to either end of joined string */
// ts-unused-exports:disable-next-line
export const joinSandwich: JoinSandwich = (
  arr: any[],
  joiner: string,
  convertToString = true
): any => {
  if (convertToString) return wrap([arr.join(joiner)], joiner).join('');
  else return wrap(insertBetween(arr, joiner), joiner);
};

type UniqueWithCountOpts = { sort?: boolean; sortOrder?: SortOrder };
export const uniqueWithCount = <T extends string | number>(
  arr: T[],
  { sort = false, sortOrder = 'DESC' }: UniqueWithCountOpts = {}
) => {
  const unsorted = objectEntries(
    arr.reduce(
      (acc, val) => ({ ...acc, [val]: (acc[val] || 0) + 1 }),
      {} as Record<T, number>
    )
  ).map(([value, count]) => ({ value, count }));
  return sort
    ? sortObjects(unsorted, ({ count }) => count, sortOrder)
    : unsorted;
};

// Attempt at an efficient intersection algorithm. Inspired by:
// https://stackoverflow.com/questions/497338/efficient-list-intersection-algorithm
export const intersection = <T extends PrimitiveType, U extends PrimitiveType>(
  arrA: (T | U)[],
  arrB: (T | U)[]
) => {
  const isAShorter = arrA.length < arrB.length;
  const compareSet = new Set(isAShorter ? arrA : arrB);
  return (isAShorter ? arrB : arrA).filter(arrEl => compareSet.has(arrEl));
};

/** AKA "complement" in set theory */
export const inANotB = <T extends PrimitiveType, U extends PrimitiveType>(
  a: (T | U)[],
  b: (T | U)[]
) => {
  const bSet = new Set(b);
  return a.filter(aEl => !bSet.has(aEl));
};

/** Returns first non-nullish value */
export const coalesce = <T>(arr: (T | Falsy)[]) => arr.filter(ExcludeFalsy)[0];

/** If item is present return arr without it, else return arr with it added. */
// ts-unused-exports:disable-next-line
export const toggleArrayItem = <T extends PrimitiveType>(
  arr: T[],
  item: T,
  /** If true, ensure item is in arr; if false, ensure it is not. Else, toggle. */
  forceInclude?: boolean
) => {
  const hasItem = arr.includes(item);
  const isAdding = !hasItem || forceInclude === true;
  const isRemoving = hasItem || forceInclude === false;
  if (isAdding) return hasItem ? arr : arr.concat(item);
  if (isRemoving) return arr.filter(i => i !== item);
  throw new Error('Unreachable toggleArrayItem');
};

export const countArrVal = <T>(arr: T[], countVal: T) =>
  arr.filter(val => val === countVal).length;

/** Used in cases where you want an array of all possible values in a
 * string-like type. Using this ensures that TS will complain if it is missing
 * any values. */
export const getTypesafeArrOfType = <T extends string>(
  valRecord: Record<T, any>
) => objectKeys(valRecord);

type ConditionalArr = {
  <T>(arr: (T | Falsy)[]): T[];
  <T>(arr: (T | Falsy)[], joinWith: string): string;
};
/** Used in cases when creating an array where some elements may be falsy, then
 * filtering those falsy values out. This provides a typesafe way to get the
 * resulting array */
export const conditionalArr: ConditionalArr = (
  arr: any[],
  joinWith?: string
): any => {
  const filteredArr = arr.filter(ExcludeFalsy);
  return joinWith ? filteredArr.join(joinWith) : filteredArr;
};

export const isLengthOne = <T>(arr: T[]): arr is [T] => arr.length === 1;

/** Combines mapping and finding into a single operation. If no find callback
 * provided, default to Boolean.  */
export const mapFind = <T, U>(
  arr: T[],
  map: ArrCallback<T, U>,
  find: ArrCallback<U> = Boolean
) => arr.map(map).find(find);
