import fetchBase from '../fetchBase';
import { FetchImplementationOpts, FetchOpts } from '../types';

const getArgs = (
  contentType: FetchOpts['contentType'],
  fetchFnKey: FetchOpts['fetchFnKey'],
  opts: FetchImplementationOpts
): FetchOpts => ({ method: 'PUT', contentType, fetchFnKey, ...opts });

export const putJson = <R = void>(opts: FetchImplementationOpts) =>
  fetchBase<R>(getArgs('application/json', 'loadJSON', opts));

export const putString = (opts: FetchImplementationOpts) =>
  fetchBase<string>(getArgs('application/json', 'loadString', opts));
