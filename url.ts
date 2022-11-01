import { isBoolean, isNumber, isString } from './common';

const getValAsString = (val: any) =>
  isString(val) ? val : JSON.stringify(val);

/** Returns key=val w/ proper encoding */
const getUrlEncodedParam = (key: ObjKey, val: unknown) => {
  if (val === undefined) return null;
  if (!isString(val) && !isNumber(val) && !isBoolean(val)) {
    throw new Error('Object value type not supported by getUrlEncodedParam');
  }
  return [key, encodeURIComponent(getValAsString(val))].join('=');
};

/** Returns encoded params w/o ? at beginning, e.g. a=1&b=2&c=3 */
export const getUrlEncodedParams = (params: AnyObj) =>
  Object.entries(params).reduce((params, [key, value]) => {
    const encodedParam = getUrlEncodedParam(key, value);
    if (!encodedParam) return params;
    const joiner = params.length ? '&' : '';
    return [params, encodedParam].join(joiner);
  }, '');

const appendParamReducer = (
  currUrl: string,
  [key, val]: [key: ObjKey, val: unknown]
) => {
  const joiner = currUrl.includes('?') ? '&' : '?';
  const encodedParam = getUrlEncodedParam(key, val);
  return encodedParam ? [currUrl, encodedParam].join(joiner) : currUrl;
};

export const url = (url: string, params: AnyObj = {}) =>
  Object.entries(params).reduce(appendParamReducer, url);

export const openUrl = (url: string) => Safari.open(url);

export const openCallbackUrl = async <ExpectedReturn = void>(
  baseUrl: string,
  params: AnyObj = {}
) => {
  const cb = new CallbackURL(baseUrl);
  Object.entries(params).forEach(([key, val]) => {
    // Params need to be explicitly added like this on CallbackURL objects.
    if (val !== undefined) cb.addParameter(key, getValAsString(val));
  });
  try {
    return cb.open<ExpectedReturn>();
  } catch (e) {
    const prompt = new Alert();
    prompt.title = `Error encountered opening callback URL`;
    prompt.message = String(e);
    prompt.addAction('OK');
    await prompt.present();
    throw new Error(e as any);
  }
};

const FORUMS = [
  'reddit.com',
  'stackoverflow.com',
  'stackexchange.com',
  'news.ycombinator.com',
  'macstories.net',
  'tripadvisor.com',
  'community.effectiveremotework.com',
  'forum.gettingthingsdone.com',
  'talk.automators.fm',
];

export const getGoogleSearchUrl = (query: string) =>
  url('https://www.google.com/search', { q: query });

export const getForumSearchUrl = (query: string) => {
  const siteSearchText = FORUMS.reduce(
    (acc, forum, i) =>
      [acc, encodeURIComponent(i ? ' OR site:' : ' site:'), forum].join(''),
    ''
  );
  return `${getGoogleSearchUrl(query)}${siteSearchText}`;
};

export const searchForums = (query: string) =>
  Safari.open(getForumSearchUrl(query));

export const isGmailLink = (link: string) =>
  link.toLowerCase().includes('mail.google.com');
