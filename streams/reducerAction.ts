import { Persisted } from '../io/persisted';
import { Stream } from './streamUtils';

/** NB: One major shortcoming of the typing here is that the `reducerGetter`
 * argument will not get inferred properly if defined inline. Rather, it must be
 * declared separately, or declared inline with `makeReducerGetter`. */
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
