import { isString } from './common';
import PersistedLog from './io/PersistedLog';
import { stringify } from './object';

const DEBUG = false;
const LOG_TO_PERSISTED_LOG = true;

const logUrlOpen = (url: string) =>
  DEBUG && LOG_TO_PERSISTED_LOG ? PersistedLog.log(url) : console.log(url);

/** Returns key=val w/ proper encoding */
const getUrlEncodedParam = (key: string, value: string | number | boolean) => {
  if (value === undefined) return null;
  const parsedVal = isString(value) ? value : JSON.stringify(value);
  return `${key}=${encodeURIComponent(parsedVal)}`;
};

/** Returns encoded params w/o ? at beginning, e.g. a=1&b=2&c=3 */
export const getUrlEncodedParams = (params: AnyObj) =>
  Object.entries(params).reduce((acc, [key, value]) => {
    const encodedParam = getUrlEncodedParam(key, value);
    return encodedParam ? `${acc}${acc.length ? '&' : ''}${encodedParam}` : acc;
  }, '');

const appendParam = (
  currUrl: string,
  key: string,
  value: string | number | boolean
) => {
  const separator = currUrl.includes('?') ? '&' : '?';
  const encodedParam = getUrlEncodedParam(key, value);
  return encodedParam ? [currUrl, separator, encodedParam].join('') : currUrl;
};

export const getUrlWithParams = (url: string, params: AnyObj = {}) =>
  Object.entries(params).reduce(
    (acc, [key, value]) => appendParam(acc, key, value),
    url
  );

export class Url {
  url: string;

  constructor(baseUrl: string, params: AnyObj = {}) {
    this.url = getUrlWithParams(baseUrl, params);
  }
  addParameter(param: string, value: string | number | boolean) {
    this.url = appendParam(this.url, param, value);
  }
  open() {
    logUrlOpen(this.url);
    Safari.open(this.url);
  }
  getURL() {
    return this.url;
  }
}

type SmartUrlProps = {
  baseUrl: string;
  isXCallback?: boolean;
  params?: AnyObj;
};
export class SmartUrl {
  urlObject: CallbackURL | Url;
  isXCallback: boolean;

  constructor({ baseUrl, isXCallback = false, params = {} }: SmartUrlProps) {
    const callback = new CallbackURL(baseUrl);
    this.urlObject = isXCallback ? callback : new Url(baseUrl);
    this.isXCallback = isXCallback;

    Object.entries(params).forEach(([key, val]) => {
      if (val === undefined) return;
      this.urlObject.addParameter(
        key,
        typeof val === 'string' ? val : stringify(val)
      );
    });
  }
  get url() {
    return this.urlObject.getURL();
  }
  addParam(name: string, value: string) {
    this.urlObject.addParameter(name, value);
  }
  async open() {
    // Normal URL logged in Url class
    if (this.isXCallback) logUrlOpen(this.url);
    try {
      const result = await this.urlObject.open();
      return this.isXCallback ? result : null;
    } catch (e) {
      const prompt = new Alert();
      prompt.title = `Error encountered in SmartUrl.open.`;
      prompt.message = String(e);
      prompt.addAction('OK');
      await prompt.present();
    }
  }
}

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
  ['https://www.google.com/search?q=', encodeURIComponent(query)].join('');

export const getForumSearchUrl = (query: string) => {
  const siteSearchText = FORUMS.reduce(
    (acc, forum, i) =>
      [acc, encodeURIComponent(!i ? ' site:' : ' OR site:'), forum].join(''),
    ''
  );
  return `${getGoogleSearchUrl(query)}${siteSearchText}`;
};

export const searchForums = (query: string) =>
  Safari.open(getForumSearchUrl(query));

export const isGmailLink = (link: string) =>
  link.toLowerCase().includes('mail.google.com');
