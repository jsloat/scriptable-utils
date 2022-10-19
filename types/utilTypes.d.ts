declare type MaybePromise<T> = T | Promise<T>;

declare type MaybeArray<T> = T | T[];

/** Given a promise type, returns the type contained within the promise */
declare type UnwrapPromise<T> = T extends PromiseLike<infer U> ? U : T;

declare type UnwrapArr<T> = T extends (infer U)[] ? U : unknown;

declare type Nullish = null | undefined;

declare type NonNullish<T> = Exclude<T, Nullish>;

// https://stackoverflow.com/questions/48230773/how-to-create-a-partial-like-that-requires-a-single-property-to-be-set
declare type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

declare type LabeledValue<Value, Label extends string = string> = {
  label: Label;
  value: Value;
};

//

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? A
  : B;

declare type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P
  >;
}[keyof T];

declare type ReadonlyKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    never,
    P
  >;
}[keyof T];

//

/** Useful for cases when need to type object w/ nothing inside */
declare type EmptyObject = {
  [K in any]: never;
};

declare type Falsy = false | null | undefined | '' | void | 0;

declare type NotFalsy<T> = Exclude<T, Falsy>;

//

declare type AnyFn = (...args: any) => any;

declare type NonFunctionKeys<T> = Exclude<
  {
    [K in keyof T]: T[K] extends AnyFn ? never : K;
  }[keyof T],
  undefined
>;

declare type NonFunctionProperties<T> = Pick<T, NonFunctionKeys<T>>;

declare type FunctionKeys<T> = Exclude<
  {
    [K in keyof T]: T[K] extends AnyFn ? K : never;
  }[keyof T],
  undefined
>;

declare type FunctionProperties<T> = Pick<T, FunctionKeys<T>>;

/** Writable non-function keys in a type */
declare type SettableKeys<T> = Exclude<NonFunctionKeys<T>, ReadonlyKeys<T>>;

//

// stackoverflow.com/questions/44425344/typescript-interface-with-xor-barstring-xor-cannumber
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
declare type XOR<T, U> = T | U extends AnyObj
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

//

declare type SortOrder = 'ASC' | 'DESC';

declare type MapFn<Input, Output> = (input: Input) => Output;

declare type NoParamFn<Output = any> = () => Output;

declare type OptionalMapFn<Input, Output> = (input?: Input) => Output;

declare type Identity<T> = MapFn<T, T>;

declare type Predicate<T> = MapFn<T, boolean>;

declare type Typeguard<AssertedType extends ActualType, ActualType = any> = (
  val: ActualType
) => val is AssertedType;

declare type NotUndefined<T> = Exclude<T, undefined>;

declare type ObjKey = string | number | symbol;

declare type AnyObj = Record<ObjKey, any>;

declare type ObjComparison<T, R = boolean> = (a: T, b: T) => R;

/** Used to define possible actions based on entity type being actioned. */
declare type ConditionalAction<E> = {
  label: string;
  action: (entity: E) => MaybePromise<boolean>;
  shouldRerenderOnSuccess?: boolean;
  shouldShow?: (entity: E) => boolean;
};

/** Used across many systems to differentiate between life domains */
declare type Domain = 'personal' | 'work';

declare type Align = 'left' | 'center' | 'right';

/**
 * Returns object keys that are optional
 * From https://stackoverflow.com/questions/53899692/typescript-how-to-extract-only-the-optional-keys-from-a-type
 */
declare type OptionalPropertyOf<T extends Record<string, unknown>> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? never : K;
  }[keyof T],
  undefined
>;
declare type RequiredPropertyOf<T extends Record<string, unknown>> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? K : never;
  }[keyof T],
  undefined
>;

declare type NonNullishRecord<T extends Record<string, unknown>> = {
  [k in keyof T]: NonNullish<T[k]>;
};

declare type PartialWithNull<T extends AnyObj> = {
  [key in keyof T]: T[key] | null;
};

declare type PickRequired<T, K extends keyof T> = Pick<Required<T>, K>;
declare type PickPartial<T, K extends keyof T> = Pick<Partial<T>, K>;

/** Convert some keys to be required, leaving others untouched. Can also include
 * keys to exclude from resulting type */
declare type MakeSomeReqd<
  Source extends Record<string, any>,
  // Keys to convert to required
  MakeReqKeys extends keyof Source = never,
  ExcludeKeys extends keyof Source = never
> = Omit<Source, ExcludeKeys | MakeReqKeys> &
  Pick<Required<Source>, MakeReqKeys>;

declare type MakeSomeOptional<
  T extends AnyObj,
  OptionalKeys extends keyof T,
  ExcludeKeys extends keyof T = never
> = Omit<T, ExcludeKeys | OptionalKeys> & Pick<Partial<T>, OptionalKeys>;

/** Map obj values to different key names. Optional properties in NewKeyMap will
 * be converted to optional props in the return type.
 *
 * Example, to map {first_name: string} to {firstName: string}:
 * `MapKeys<{first_name: string}, {firstName: 'first_name'}>`
 */
declare type MapKeys<
  Source extends Record<string, any>,
  NewKeyMap extends Record<string, any> = never
> = NewKeyMap extends never
  ? Source
  : {
      [newReqKey in RequiredPropertyOf<NewKeyMap>]: newReqKey extends keyof NewKeyMap
        ? Source[NewKeyMap[newReqKey]]
        : never;
    } & {
      [newOptKey in OptionalPropertyOf<NewKeyMap>]?: newOptKey extends keyof NewKeyMap
        ? Source[Exclude<NewKeyMap[newOptKey], undefined>]
        : never;
    } & Omit<
        Source,
        keyof { [key in keyof NewKeyMap as Required<NewKeyMap>[key]]: any }
      >;

/** Map some of the values of existing keys to new values */
declare type MapVals<
  Source extends AnyObj,
  PartialNewVals extends {
    [key in keyof Source]?: any;
  }
> = Omit<Source, keyof PartialNewVals> & PartialNewVals;

declare type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

declare type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

/**
 * Checks if object type `T` has at least one required attribute. If it does,
 * return type `IfTrue`, else `IfFalse`
 */
declare type IfHasAtLeastOneReq<
  T extends AnyObj,
  IfTrue,
  IfFalse
> = Partial<T> extends T ? IfFalse : IfTrue;

declare type ArrCallback<T, R = unknown> = (
  value: T,
  index: number,
  array: T[]
) => R;

declare type ReduceCallback<Final, Source> = (
  previousValue: Final,
  currentValue: Source,
  currentIndex: number,
  array: Source[]
) => Final;

declare type StreamCallback = { remove: () => void };

type _subrecordOrValue<SubKeyOrVal, SubSubKeyOrVal> =
  SubSubKeyOrVal extends void
    ? SubKeyOrVal
    : SubKeyOrVal extends ObjKey
    ? Record<SubKeyOrVal, SubSubKeyOrVal>
    : never;

/**
 * Util type to define nested object structures in a concise way.
 *
 * For example, this:
 * `Record<string, Record<number, Record<string, Set<any>>>>`
 *
 * Could be rewritten as:
 * `Index<string, number, string, Set<any>>`
 */
declare type Index<
  A extends ObjKey,
  B,
  C = void,
  D = void,
  E = void,
  F = void
> = Record<
  A,
  _subrecordOrValue<
    B,
    _subrecordOrValue<C, _subrecordOrValue<D, _subrecordOrValue<E, F>>>
  >
>;

/** With autosuggestion for keys */
declare type Omit_<T, K extends keyof T> = Omit<T, K>;
/** With autosuggestion for keys */
declare type Extract_<T, U extends T> = Extract<T, U>;

declare type ValOf<T extends AnyObj, K extends keyof T> = T[K];

/**
 * Returns tuple from inferred Map type.
 *
 * For example:
 * ```
 * type MyMap = Map<string, boolean>;
 * type MyMapEntry = MapEntry<MyMap>;
 * // Returns `[string, boolean]`
 * ```
 */
declare type MapEntry<M extends Map<any, any>> = M extends Map<infer T, infer U>
  ? [T, U]
  : never;

declare type Entry<T extends AnyObj> = [key: keyof T, val: T[keyof T]];

type WithoutNeverKeys<T extends AnyObj> = {
  [K in keyof T]: T[K] extends never ? never : K;
}[keyof T];

declare type WithoutNever<T extends AnyObj> = Pick<T, WithoutNeverKeys<T>>;

declare type SortFn<T> = (a: T, b: T) => number;

declare type PrimitiveType =
  | bigint
  | boolean
  | null
  | number
  | string
  | symbol
  | undefined;
