import { combineReducers } from '../flow';
import { Persisted } from '../io/persisted';
import { Stream } from './streamUtils';

type Payload = AnyObj | void;

/** An action that may have payload, which triggers the reduction with that
 * payload and calls onReduce with the reduced state. */
type ReducerAction<P extends Payload> = P extends void
  ? () => Promise<void>
  : (payload: P) => Promise<void>;

type GetReducerCreatorOpts<State> = {
  onReduce: (newState: State, prevState: State) => any;
  getCurrState: () => MaybePromise<State>;
};

/**
 * A reducer action is sort of a combination of reducers, actions, and
 * dispatchAction.
 *
 * It creates an action with or without payload that is executed immediately.
 *
 * When called, the action may mutate the state, using the payload if needed,
 * and also may side-effect.
 *
 * If null is returned by the reducer instead of state, onReduce will not be
 * called.
 */
export const getReducerActionCreator =
  <State>({ onReduce, getCurrState }: GetReducerCreatorOpts<State>) =>
  <P extends Payload = void>(
    reduce: (
      currState: State,
      payload: P extends void ? never : P
    ) => MaybePromise<State | null>
  ) =>
    (async (payload?: any) => {
      const currState = await getCurrState();
      const newState = await reduce(currState, payload as any);
      if (onReduce && newState) await onReduce(newState, currState);
    }) as ReducerAction<P>;

type GetTableReducerCreatorOpts<S> = {
  // Reducers run every time, before reducer arg
  preReducers?: Identity<S>[];
  // Run after reducer arg
  postReducers?: Identity<S>[];
};
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
