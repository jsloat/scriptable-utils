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

export const getTableReducerCreator =
  <S>() =>
  <A extends any[]>(r: (state: S, ...args: A) => S) =>
  (...args: A): Identity<S> =>
  state =>
    r(state, ...args);

/** Attempt at a more streamlined version of `getReducerActionCreator` */
export const getTableActionCreator =
  <S>(getState: NoParamFn<S>, setState: MapFn<S, any>) =>
  <A extends any[]>(reducerGetter: (...args: A) => MaybePromise<Identity<S>>) =>
  async (...args: A) => {
    const currState = getState();
    const reducer = await reducerGetter(...args);
    setState(reducer(currState));
  };
