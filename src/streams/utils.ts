import { AnyObj, MaybePromise } from '../types/utilTypes';
import Stream from './Stream';
import { StreamConstructorOpts } from './types';

export type StreamDataType<S> = S extends Stream<infer D> ? D : never;

type SubscriptionOpts<
  DependentState extends AnyObj,
  SourceState extends AnyObj
> = {
  subscriptionName: string;
  dependent$: Stream<DependentState>;
  source$: Stream<SourceState>;
  stateReducer?: (
    latestDependentState: DependentState,
    prevSourceState: SourceState,
    updatedSourceState: SourceState
  ) => MaybePromise<DependentState | null>;
};

const getUnsubscribe =
  <S extends AnyObj>(
    opts: Pick<SubscriptionOpts<any, S>, 'source$' | 'subscriptionName'>
  ) =>
  () =>
    opts.source$.unregisterUpdateCallback(opts.subscriptionName);

/**
 * Subscribe a stream to another stream.
 *
 * The 2 streams involved:
 *  - dependent$: the stream that subscribes to changes in another stream.
 *  - source$: the stream whose changes trigger updates in dependent$
 *
 * The stateReducer function takes the latest state of both streams and
 * reduces it into dependent$ state. This allows dependent$ to incorporate
 * changes from the source$ into its own state.
 *
 * If stateReducer returns null, the dependent$ state will not be updated.
 * This provides a mechanism for dependent$ to decide whether or not to update
 * based on the changes in source$.
 *
 * This action is triggered whenever a change occurs in source$
 *
 * If no stateReducer argument passed, don't change state on reload.
 *
 * Returns an object that allows you to unsubscribe.
 */
export const subscribe = <
  DependentState extends AnyObj,
  SourceState extends AnyObj
>({
  subscriptionName,
  dependent$,
  source$,
  stateReducer = state => state,
}: SubscriptionOpts<DependentState, SourceState>) => {
  source$.registerUpdateCallback({
    callbackId: subscriptionName,
    callback: async (prevSourceState, updatedSourceState) => {
      const latestDependentData = dependent$.getData();
      const reducedData = await stateReducer(
        latestDependentData,
        prevSourceState,
        updatedSourceState
      );
      // If the reducer returns null, no update should occur
      if (reducedData) dependent$.setData(reducedData);
    },
  });
  return { unsubscribe: getUnsubscribe({ source$, subscriptionName }) };
};

/** Useful when you need the unsubscribe function before initializing the
 * subscription. */
export const getSubscribeFns = <D extends AnyObj, S extends AnyObj>(
  opts: SubscriptionOpts<D, S>
) => ({ subscribe: () => subscribe(opts), unsubscribe: getUnsubscribe(opts) });

type CombineStreams = <StreamDict extends Record<string, Stream<any>>>(
  opts: {
    streamDict: StreamDict;
    name: string;
  } & Pick<StreamConstructorOpts<any>, 'showStreamDataUpdateDebug'>
) => Stream<{ [key in keyof StreamDict]: StreamDataType<StreamDict[key]> }>;
/**
 * Create a new stream that combines the data of multiple streams. Combined
 * stream state data is namespaced as per the streamDict passed in.
 *
 * The streams must be initialized at the time of combining, or this will fail.
 *
 * The returned stream will update whwnever its combined streams do.
 */
export const combineStreams: CombineStreams = ({
  streamDict,
  name,
  showStreamDataUpdateDebug,
}) => {
  const defaultState = Object.entries(streamDict).reduce(
    (accState, [namespace, $]) => ({ ...accState, [namespace]: $.getData() }),
    {} as any
  );
  const combined$ = new Stream({
    defaultState,
    name,
    showStreamDataUpdateDebug,
  });
  Object.entries(streamDict).forEach(([namespace, $]) =>
    $.registerUpdateCallback({
      callbackId: `Combined stream: ${name}/${namespace}`,
      callback: (_, latestSourceState) =>
        combined$.updateData(latestCombinedState => ({
          ...latestCombinedState,
          [namespace]: latestSourceState,
        })),
    })
  );
  return combined$;
};
