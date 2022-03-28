import fetchBase from '../fetchBase';
import { FetchImplementationOpts, FetchOpts } from '../types';

const getArgs = (
  contentType: FetchOpts['contentType'],
  fetchFnKey: FetchOpts['fetchFnKey'],
  opts: FetchImplementationOpts
): FetchOpts => ({
  method: 'POST',
  contentType,
  fetchFnKey,
  ...opts,
});

export const postJson = <R = void>(opts: FetchImplementationOpts) =>
  fetchBase<R>(getArgs('application/json', 'loadJSON', opts));

export const postString = (opts: FetchImplementationOpts) =>
  fetchBase<string>(getArgs('application/json', 'loadString', opts));
