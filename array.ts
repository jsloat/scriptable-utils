import { map, toFind } from './arrayTransducers';
import { ExcludeFalsy, isString } from './common';
import { objectKeys } from './object';

export const isLastArrIndex = (index: number, arr: any[]) =>
  index === arr.length - 1;

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

const hasLength = <T>(arr: T[]): arr is [T, ...T[]] => Boolean(arr.length);

export const isHomogeneous = <T>(
  arr: T[],
  isEqual: ObjComparison<T> = (a, b) => a === b
) => {
  if (!hasLength(arr)) return true;
  if (arr.length === 1) return true;
  return arr.slice(1).every(val => isEqual(val, arr[0]));
};

export const sum = (arr: number[]) => arr.reduce((acc, num) => acc + num, 0);

export const avg = (arr: number[]) => sum(arr) / arr.length;

export const uniqueWith = <T>(arr: T[], areEqual: (a: T, b: T) => boolean) =>
  arr.filter(
    (currentEl, i) =>
      !arr.slice(i + 1).some(subsequentEl => areEqual(currentEl, subsequentEl))
  );

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
export const inANotB = <T, U>(
  a: (T | U)[],
  b: (T | U)[],
  isEqual: (a: T | U, b: T | U) => boolean = (a, b) => a === b
) => a.filter(aEl => !b.some(bEl => isEqual(aEl, bEl)));

const removeFromArr = <T extends PrimitiveType>(arr: T[], item: T) =>
  arr.filter(i => i !== item);

/** If item is present return arr without it, else return arr with it added. */

export const toggleArrayItem = <T extends PrimitiveType>(
  arr: T[],
  item: T,
  /** If true, ensure item is in arr; if false, ensure it is not. Else, toggle. */
  forceInclude?: boolean
) => {
  const hasItem = arr.includes(item);
  if (forceInclude === true) return hasItem ? arr : arr.concat(item);
  if (forceInclude === false) return hasItem ? removeFromArr(arr, item) : arr;
  if (hasItem) return removeFromArr(arr, item);
  else return arr.concat(item);
};

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
  return isString(joinWith) ? filteredArr.join(joinWith) : filteredArr;
};

export const isLengthOne = <T>(arr: T[]): arr is [T] => arr.length === 1;

/** Combines mapping and finding into a single operation. If no find callback
 * provided, default to Boolean.  */
export const mapFind = <T, U>(
  arr: T[],
  mapFn: MapFn<T, U>,
  find: MapFn<U, any> = Boolean
) => toFind(arr, map(mapFn), find);

/** Shorthand for filtering primitive values out of an array. */
export const without = <T extends PrimitiveType>(arr: T[], ...exclude: T[]) =>
  arr.filter(el => !exclude.includes(el));
