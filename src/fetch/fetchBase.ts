import { mapFind } from '../array';
import { ErrorWithPayload, isObject, isString } from '../common';
import { getUrlEncodedParams } from '../url';
import { DEFAULT_DEBUG_OPTS, fetchDebug } from './debug';
import { FetchOpts, ParsedFetchOpts } from './types';
import { maybeCensorHeaders } from './utils';

const getBody = ({ body, contentType }: ParsedFetchOpts) => {
  if (!body) return null;
  if (isString(body)) return body;
  const isBodyUrlEncoded = contentType === 'application/x-www-form-urlencoded';
  return isBodyUrlEncoded ? getUrlEncodedParams(body) : JSON.stringify(body);
};

const getRequestAttributes = (opts: ParsedFetchOpts) => ({
  body: getBody(opts),
  headers: {
    'Content-Type': opts.contentType,
    ...opts.headers,
  },
});

/** Gets an object which describes the ongoing request for debug logging. */
const getRequestLogMessage = (opts: ParsedFetchOpts) => {
  const { body, headers } = getRequestAttributes(opts);
  return {
    ...opts,
    ...(opts.debug.includeVerbose && { body }),
    headers: maybeCensorHeaders(headers, opts),
  };
};

const getRequest = (opts: ParsedFetchOpts) => {
  const { url, method } = opts;
  const { body, headers } = getRequestAttributes(opts);
  const req = new Request(url);
  req.method = method;
  req.headers = headers;
  if (body) req.body = body;
  return req;
};

const parseFetchOpts = ({
  debug = DEFAULT_DEBUG_OPTS,
  ...restOpts
}: FetchOpts): ParsedFetchOpts => ({ debug, ...restOpts });

const isStatusCodeError = (code: unknown) => {
  const str = String(code);
  return !(str.startsWith('1') || str.startsWith('2'));
};

const possibleErrorKeys = ['message', 'errorMessages', 'error'];
/** This is a weak attempt to get error messages from a variety of error
 * response shapes across multiple APIs. */
const getResponseError = (response: unknown): string | null => {
  // In case the response is a stringified object/arr
  try {
    if (!isString(response)) {
      throw new Error('Response not a string');
    }
    const parsed = JSON.parse(response) as unknown;
    return getResponseError(parsed);
  } catch {
    if (Array.isArray(response)) {
      return response.find(getResponseError) as string | null;
    }
    if (isObject(response)) {
      const keyError = mapFind(Object.entries(response), ([key, val]) =>
        possibleErrorKeys.includes(key) ? getResponseError(val) : null
      );
      if (keyError) return keyError;
    }
    if (isString(response)) return response;
    return null;
  }
};

export default async <Returns = unknown>(opts: FetchOpts) => {
  const parsedOpts = parseFetchOpts(opts);
  const log = (message: any, isVerbose = false) =>
    fetchDebug({ message: String(message), parsedOpts, isVerbose });
  await log(`Initiating request to "${opts.url}"...`);
  log(getRequestLogMessage(parsedOpts));
  const requestObj = getRequest(parsedOpts);

  // Intentionally not trying or catching here -- this is the responsibility of
  // the calling function.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const response = (await requestObj[opts.fetchFnKey]()) as unknown;
  await log({ response }, true);
  const { statusCode } = requestObj.response;
  const isErrorCode = isStatusCodeError(statusCode);
  if (isErrorCode) {
    const error = new ErrorWithPayload(
      `${statusCode}: ${getResponseError(response) || 'Unknown error'}`,
      { completedRequestDetails: requestObj.response, response }
    );
    log({ error });
    throw error;
  }
  return response as Returns;
};
