import { insertBetween } from '../../array';
import { isNullish, isNumber } from '../../common';
import { splitByRegex } from '../../string';
import { MultipartOpts } from './types';

/** Response uses \r for linebreak (gmail API, at least), normalize all to be \n */
const normalizeLineBreaks = (str: string) => str.replace(/\r/g, '\n');

/**
 * Each multipart response chunk has headers & JSON data returned.
 * Presumably there could be multipart responses that don't return data inside
 * curly braces, but this should probably work for most use cases.
 * This also assumes that the JSON data is formatted & split across newlines,
 * which is is the case for Gmail at least.
 */
const extractJSONDataFromMultipartChunk = <R>(lines: string[]) => {
  const [firstOpen, lastClose] = lines.reduce<[number | null, number | null]>(
    (acc, line, i) => [
      isNullish(acc[0]) && line === '{' ? i : acc[0],
      line === '}' ? i : acc[1],
    ],
    [null, null]
  );
  if (!(isNumber(firstOpen) && isNumber(lastClose)))
    throw new Error('No JSON data to extract!');
  const jsonStr = lines.slice(firstOpen, lastClose + 1).join('\n');
  return JSON.parse(jsonStr) as R;
};

export const extractMultipartResponseArray = <R>(response: string) => {
  const splitByBoundaryLikeString = splitByRegex(
    response,
    /(\r|\n)--[^ ]+(\r|\n)/
  );
  const chunks = splitByBoundaryLikeString.filter(Boolean);
  const withoutEmptyChunks = chunks
    .map(normalizeLineBreaks)
    .filter(chunk => Boolean(chunk.replace(/\n/g, '')));
  return withoutEmptyChunks.map(chunk =>
    extractJSONDataFromMultipartChunk<R>(chunk.split('\n'))
  );
};

export const getMultipartBody = ({
  requests,
  boundary,
}: Required<Pick<MultipartOpts, 'requests' | 'boundary'>>) => {
  const requestBlocks = requests.map(({ contentType, method, url, body }) =>
    [
      `Content-Type: ${contentType}`,
      '',
      `${method} ${url}`,
      ...(body ? ['', ...JSON.stringify(body).split('\n')] : []),
    ].join('\n')
  );
  const boundaryStr = `--${boundary}`;
  const bodyStr = [
    boundaryStr,
    ...insertBetween(requestBlocks, boundaryStr),
    `${boundaryStr}--`,
  ].join('\n');
  return Data.fromString(bodyStr).toRawString();
};
