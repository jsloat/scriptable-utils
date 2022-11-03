import { combineReducers } from './flow';
import { Persisted } from './io/persisted';
import { Stream } from './streams';

//
// REDUCER CREATOR
//

type MakeReducerGetterOpts<S> = {
  // Reducers run every time, before reducer arg
  preReducers?: Identity<S>[];
  // Run after reducer arg
  postReducers?: Identity<S>[];
};
/** Call this to create a reducer-getter generator for the given type. The
 * reducer-getter generator can then be used to create functions that take some
 * arguments and return a reducer for the given entity type. */
export const getReducerCreator =
  <T>({ preReducers = [], postReducers = [] }: MakeReducerGetterOpts<T> = {}) =>
  <A extends any[]>(getReducer: (currVal: T, ...args: A) => T) =>
  (...args: A): Identity<T> =>
    combineReducers(
      ...preReducers,
      currVal => getReducer(currVal, ...args),
      ...postReducers
    );

//
// ACTION CREATORS
// These are used to create actions that can be easily integrated with the reducer creator output above. Example usage:
//
// ```
// const reducer = getReducerCreator<State>();
// const action = getTableActionCreator(getState, setState);
// ...
// const handleSetAttr = reducer((state, value: string) => ({ ...state, value }));
// const setAttr = action(handleSetAttr);
// ```
//
// In the above example, `setAttr` has the signature `(value: string) => void`
//

export const getTableActionCreator =
  <S>(getState: NoParamFn<S>, setState: MapFn<S, any>) =>
  <A extends any[]>(reducerGetter: (...args: A) => MaybePromise<Identity<S>>) =>
  async (...args: A) => {
    const currState = getState();
    const reducer = await reducerGetter(...args);
    setState(reducer(currState));
  };

export const getStreamActionCreator =
  <T extends AnyObj>(stream: Stream<T>) =>
  <A extends any[]>(reducerGetter: (...args: A) => MaybePromise<Identity<T>>) =>
  async (...args: A) =>
    stream.updateData(await reducerGetter(...args));

export const getIOActionCreator =
  <T>(io: Persisted<T>) =>
  <A extends any[]>(reducerGetter: (...args: A) => MaybePromise<Identity<T>>) =>
  async (...args: A) =>
    io.reduce(await reducerGetter(...args));
