import { objSpreadWithoutUndefined } from '../../object';
import fetchBase from '../fetchBase';
import { FetchImplementationOpts } from '../types';

export const deleteRequest = (opts: FetchImplementationOpts) =>
  fetchBase(
    objSpreadWithoutUndefined(
      {
        method: 'DELETE',
        contentType: 'application/json',
        fetchFnKey: 'load',
      },
      opts
    )
  );
