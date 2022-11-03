import { combineReducers } from '../flow';
import { Persisted } from '../io/persisted';
import { Stream } from './streamUtils';

type GetTableReducerCreatorOpts<S> = {
  // Reducers run every time, before reducer arg
  preReducers?: Identity<S>[];
  // Run after reducer arg
  postReducers?: Identity<S>[];
};
/** @deprecated */
export const getTableReducerCreator =
  <S>({
    preReducers = [],
    postReducers = [],
  }: GetTableReducerCreatorOpts<S> = {}) =>
  <A extends any[]>(r: (state: S, ...args: A) => S) =>
  (...args: A): Identity<S> =>
  state =>
    combineReducers(
      ...preReducers,
      state => r(state, ...args),
      ...postReducers
    )(state);

/** Attempt at a more streamlined version of `getReducerActionCreator`. NB: One
 * major shortcoming of the typing here is that the `reducerGetter` argument
 * will not get inferred properly if defined inline. Rather, it must be declared
 * separately, or declared inline with `getTableReducerCreator`. */
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

/** Used with instances of the `Persisted` class */
export const getIOActionCreator =
  <T>(io: Persisted<T>) =>
  <A extends any[]>(reducerGetter: (...args: A) => MaybePromise<Identity<T>>) =>
  async (...args: A) =>
    io.reduce(await reducerGetter(...args));
