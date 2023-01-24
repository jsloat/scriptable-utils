import { isString } from '../common';
import { AttrDictionary, Child, Element, PageStyle } from './types';

const getStyleString = (styleDefinition: AttrDictionary) => {
  if (!Object.keys(styleDefinition).length) return '';
  return Object.entries(styleDefinition)
    .map(([key, val]) => `${key}:${val};`)
    .join('');
};

export const getPageStyleString = (style: PageStyle) => {
  if (!Object.keys(style).length) return '';
  const declarations = Object.entries(style).reduce(
    (acc, [selector, styleDict]) =>
      acc.concat(`${selector} {${getStyleString(styleDict)}}`),
    [] as string[]
  );
  return declarations.join('');
};

export const getElement = (
  tagName: string,
  opts: Omit_<Element, 'tagName'> = {}
) => ({ tagName, ...opts });

const childToHTML = (el: Child) => (isString(el) ? el : getElementHTML(el));

const parseChild = (child: Child) => {
  const stringifiedChild = childToHTML(child);
  return stringifiedChild
    ? stringifiedChild
        .split('\n')
        .map(childLine => `\t${childLine}`)
        .join('\n')
    : null;
};

export const getElementHTML = (el: Element): string => {
  const {
    tagName,
    attributes = {},
    children = [],
    classList = [],
    id,
    prettify,
    style = {},
  } = el;
  const allAttrs: AttrDictionary = {
    ...attributes,
    ...(Object.keys(style).length && { style: getStyleString(style) }),
    ...(id && { id }),
    ...(classList.length && { class: classList.join(' ') }),
  };
  const attrsStr = Object.entries(allAttrs)
    .map(([key, val]) => `${key}="${val}"`)
    .join(' ');

  const openTag = `<${tagName} ${attrsStr}>`;
  const closeTag = `</${tagName}>`;

  if (prettify) {
    const indentedChildrenString = (children ?? [])
      .map(parseChild)
      .filter(Boolean)
      .join('\n');
    return [openTag, indentedChildrenString, closeTag].join('\n');
  }

  if (children.length)
    return [openTag, ...children.map(childToHTML), closeTag].join('');
  return `${openTag}${closeTag}`;
};
