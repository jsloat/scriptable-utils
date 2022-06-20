import { filter, toReduce } from './arrayTransducers';
import {
  getType,
  isObject,
  objectFromEntries,
  PrimitiveType,
  safeArrLookup,
} from './common';
import sortObjects from './sortObjects';

/**
 * NB: doesn't take into account order of elements in an array
 * Could be useful if inserting an existing row in table into a different position.
 */
export const isEqual = (el1: any, el2: any): boolean => {
  const el1Type = getType(el1);
  const el2Type = getType(el2);
  if (el1Type !== el2Type) return false;

  // This would probably work fine for other types, but just for date for now
  if (el1Type === 'date') return JSON.stringify(el1) === JSON.stringify(el2);

  // Simple return if not obj/array. Not dealing w/ Sets or Map
  if (!['object', 'array'].includes(el1Type)) return el1 === el2;

  // Array or obj, compare deep equality
  // Key for array = index
  const el1Keys = Object.keys(el1);
  const el2Keys = Object.keys(el2);
  if (el1Keys.length !== el2Keys.length) return false;

  return el1Keys.every(key => isEqual(el1[key], el2[key]));
};

/** Do arrays have same values, in any order? isEqual requires same order */
export const arraysHaveSameValues = (arr1: any[], arr2: any[]) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every(val => arr2.some(arr2Val => isEqual(val, arr2Val)));
};

// https://stackoverflow.com/questions/53966509/typescript-type-safe-omit-function
export const omit = <T, K extends (keyof T)[]>(object: T, omitKeysArray: K) =>
  toReduce(
    Object.entries(object),
    filter(([key]) => !omitKeysArray.includes(key as keyof T)),
    (acc, [key, val]) => ({ ...acc, [key]: val }),
    {} as { [K2 in Exclude<keyof T, K[number]>]: T[K2] }
  );

export const pick = <T, K extends keyof T>(object: T, includeKeysArray: K[]) =>
  objectFromEntries(
    objectEntries(object).filter(([key]) => includeKeysArray.includes(key as K))
  ) as unknown as Pick<T, K>;

const replacer = (key: any, value: any) => {
  const stringified = JSON.stringify(value);
  if (!stringified && value.toString) return value.toString();
  return stringified;
};
export const stringify = (input: any) => JSON.stringify(input, replacer);

export const uniqueArray = <T>(...arrays: T[][]) => [...new Set(arrays.flat())];

export const uniqueBy = <T, CompareVal extends PrimitiveType>(
  arr: T[],
  getCompareVal: (el: T) => CompareVal
) => {
  const { uniqueArr } = arr.reduce<{
    uniqueArr: T[];
    includedCompareVals: CompareVal[];
  }>(
    (acc, el) => {
      const compareVal = getCompareVal(el);
      const isUnique = !acc.includedCompareVals.includes(compareVal);
      if (isUnique) {
        acc.includedCompareVals.push(compareVal);
        acc.uniqueArr.push(el);
      }
      return acc;
    },
    { uniqueArr: [], includedCompareVals: [] }
  );
  return uniqueArr;
};

/** Inclusive on both start and end */
export const range = (start: number, end: number) =>
  [...new Array(end - start + 1).keys()].map(i => i + start);

export const filterJoin = (arr: any[], joinChar = '') =>
  arr.filter(Boolean).join(joinChar);

// ts-unused-exports:disable-next-line
export const arrPadStart = <T, U>(
  arr: T[],
  targetLength: number,
  padValue: U | null = null
): (T | U)[] =>
  arr.length >= targetLength
    ? arr
    : [...new Array(targetLength - arr.length).fill(padValue), ...arr];

export const arrPadEnd = <T, U>(
  arr: T[],
  targetLength: number,
  padValue: U | null = null
): (T | U)[] =>
  arr.length >= targetLength
    ? arr
    : [...arr, ...new Array(targetLength - arr.length).fill(padValue)];

/** Breaks up arr into arrays of size maxLength, maintaining order */
export const chunkArray = <T>(arr: T[], maxLength: number) =>
  arr.reduce((acc, val) => {
    if (!acc.length) return [[val]];
    const mostRecentChunk = safeArrLookup(acc, acc.length - 1, 'chunkArray');
    const previousChunks = acc.slice(0, acc.length - 1);
    const isMostRecentFull = mostRecentChunk.length === maxLength;
    return isMostRecentFull
      ? [...acc, [val]]
      : [...previousChunks, mostRecentChunk.concat(val)];
  }, [] as T[][]);

type SmooshReturn<T> = Record<keyof T, T[keyof T][]>;

/**
 * E.g. [{a: 1}, {a: 2}] => {a: [1,2]}
 * Returns all values of all keys for each array item, even if it's
 * not present in an array item.
 */
// ts-unused-exports:disable-next-line
export const smoosh = <T>(arrOfObjs: T[]): SmooshReturn<T> => {
  const allKeys = arrOfObjs.reduce(
    (keys, obj) => uniqueArray(keys, Object.keys(obj) as (keyof T)[]),
    [] as (keyof T)[]
  );
  // @ts-ignore
  const defaultReturnObj: SmooshReturn<T> = {};
  return arrOfObjs.reduce((objWithAllVals, obj) => {
    allKeys.forEach(key => {
      const val = obj[key] || null;
      // @ts-ignore
      objWithAllVals[key] = [...(objWithAllVals[key] || []), val];
    });
    return objWithAllVals;
  }, defaultReturnObj);
};

/** Given array of string or number, return obj with unique items as keys and counts as values */
// ts-unused-exports:disable-next-line
export const countArray = <T extends string | number>(
  arr: T[],
  sort?: SortOrder
) => {
  const unsorted = arr.reduce(
    (acc, val) => ({
      ...acc,
      [val]: acc[val] ? acc[val] + 1 : 1,
    }),
    {} as Record<T, number>
  );
  if (!sort) return unsorted;
  return objectFromEntries(
    sortObjects(objectEntries(unsorted), ([_, count]) => count, sort)
  );
};

// ts-unused-exports:disable-next-line
export const objectEntries = <T>(
  obj: T
): { [K in keyof T]: [K, T[K]] }[keyof T][] => Object.entries(obj) as any;

export const objectKeys = <T extends Record<string, any>>(obj: T) =>
  Object.keys(obj) as (keyof T)[];

export const objectValues = <T extends Record<string, unknown>>(obj: T) =>
  Object.values(obj) as T[keyof T][];

// ts-unused-exports:disable-next-line
export type UnresolvedPromiseObject<R> = { [K in keyof R]: Promise<R[K]> };
/** Applied Promise.all to the promise values of an object, returning the same
 * object with resolved promises */
export const objectPromiseAll = async <ResolvedObject extends AnyObj>(
  objWithPromises: UnresolvedPromiseObject<ResolvedObject>
) =>
  (
    await Promise.all(
      objectEntries(objWithPromises).map(async ([key, promise]) => ({
        key,
        data: await promise,
      }))
    )
  ).reduce(
    (acc, { key, data }) => ({ ...acc, [key]: data }),
    {} as ResolvedObject
  );

//

type TypeofObj<K, O extends AnyObj> = K extends keyof O ? O[K] : never;
type TypeofObjNotUndefined<K, O extends AnyObj> = K extends keyof O
  ? NotUndefined<O[K]>
  : never;
type ObjSpreadWithoutUndefined = {
  /** Must provide at least 2 object parameters! */
  (o1: AnyObj): unknown;
  <A extends AnyObj, B extends AnyObj>(o1: A, o2: B): {
    [key in keyof (A & B)]: TypeofObj<key, A> | TypeofObjNotUndefined<key, B>;
  };
  <A extends AnyObj, B extends AnyObj, C extends AnyObj>(o1: A, o2: B, o3: C): {
    [key in keyof (A & B & C)]:
      | TypeofObj<key, A>
      | TypeofObjNotUndefined<key, B>
      | TypeofObjNotUndefined<key, C>;
  };
  /** Add support for 3+ objects typing! */
  (...objs: AnyObj[]): unknown;
};
/**
 * This addresses the following issue:
 * { ...{ a: 1 }, ...{ a: undefined } } returns { a: undefined }
 * Intuitively, I expect it to return { a: 1 }
 */
export const objSpreadWithoutUndefined: ObjSpreadWithoutUndefined = (
  ...objs: AnyObj[]
) =>
  objs.slice(1).reduce<any>((acc, obj) => {
    Object.entries(obj).forEach(
      ([key, val]) => val !== undefined && (acc[key] = val)
    );
    return acc;
  }, objs[0]);

//

/** Map values of an obj, maintaining its keys */
// ts-unused-exports:disable-next-line
export const objValMap = <K extends string | number | symbol, V1, V2>(
  obj: Record<K, V1>,
  callback: (origVal: V1, key: K) => V2
) =>
  objectFromEntries(
    objectEntries(obj).map(([key, origVal]) => [key, callback(origVal, key)])
  );

/** Filter key-value pairs in an obj, similar to Array.filter */
// ts-unused-exports:disable-next-line
export const objFilter = <K extends string | number, V>(
  obj: Record<K, V>,
  callback: Predicate<[key: K, val: V]>
) => objectFromEntries(objectEntries(obj).filter(callback));

/** Given input array and mapping function, create an object from the arr. */
export const arrToObjMap = <T, O extends AnyObj>(
  arr: T[],
  arrayItemToAttr: (item: T) => [key: keyof O, value: O[keyof O]]
) => objectFromEntries(arr.map(arrayItemToAttr));

/**
 * Rudimentary setIn function that allows setting a value at any level within an
 * object. If a level in the path doesn't yet exist,it is created. NB: there is
 * no type safety here, use with caution.
 */
export const setIn = <T extends AnyObj>(
  obj: T,
  path: [keyof T, ...ObjKey[]],
  value: any
): T => {
  const [currPath, ...restPath] = path;
  if (restPath.length) {
    obj[currPath] = setIn(
      (isObject(obj[currPath]) ? obj[currPath] : {}) as T[keyof T],
      restPath as [T[keyof T], ...ObjKey[]],
      value
    );
  } else {
    obj[currPath] = value;
  }
  return obj;
};
