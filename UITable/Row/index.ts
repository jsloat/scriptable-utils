import { getSfSymbolImg } from '../../sfSymbols';
import { conditionalArr } from '../../array';
import {
  darken,
  ExcludeFalsy,
  fade,
  isNumber,
  isString,
  lighten,
} from '../../common';
import { BaseCell, BaseRow } from './base';
import {
  bgColorModeToColor,
  paddingSizeToNumMap,
  rowHeightSizeToNumMap,
  textSizeToNumMap,
} from './consts';
import {
  ContentAreaOpts,
  ParsedPaddingOpts,
  ParsedRowOpts,
  RowOpts,
} from './types';
import { getColor } from '../../colors';
import { compose, filter, map, toArray } from '../../arrayTransducers';
import { ErrorWithPayload } from '../../errorHandling';

/** For options which can be a string (e.g. Size) or another `ValueType`, this
 * returns the appropriate type (`ValueType`) */
const parseStringOrValue = <StringType extends string, ValueType>(
  stringOrValue: StringType | ValueType,
  lookupMap: Record<StringType, ValueType>
) => (isString(stringOrValue) ? lookupMap[stringOrValue] : stringOrValue);

const parsePaddingOpts = (padding: RowOpts['padding']): ParsedPaddingOpts => {
  const paddingTop = parseStringOrValue(
    padding?.paddingTop ?? 'sm',
    paddingSizeToNumMap
  );
  const paddingBottom = parseStringOrValue(
    padding?.paddingBottom ?? 'sm',
    paddingSizeToNumMap
  );
  return { paddingTop, paddingBottom };
};

const parseRowOpts = ({
  bgColor = getColor('bg'),
  // gridLayout = { gridWidth: 12, gutterLeftWidth: 1, gutterRightWidth: 2 },
  rowHeight = 'sm',
  padding,
  content = [],
  ...rest
}: RowOpts): ParsedRowOpts => ({
  ...rest,
  content,
  bgColor: parseStringOrValue(bgColor, bgColorModeToColor),
  rowHeight: parseStringOrValue(rowHeight, rowHeightSizeToNumMap),
  padding: parsePaddingOpts(padding),
});

//
//
//

const parseColor = (color: Color, { isFaded, fadeWith }: ParsedRowOpts) => {
  if (!isFaded) return color;
  if (!fadeWith) return fade(color);
  if (!isString(fadeWith)) return fadeWith;
  return (fadeWith === 'darken' ? darken : lighten)(color);
};

const getCell = (
  {
    iconKey,
    text,
    isEmpty,
    image,
    color = getColor('primaryTextColor'),
    fontConstructor = Font.regularRoundedSystemFont,
    textSize = 'sm',
    align = 'left',
    width,
  }: ContentAreaOpts,
  parsedRowOpts: ParsedRowOpts
) => {
  const commonArgs = { widthWeight: width, align };
  const parsedColor = parseColor(color, parsedRowOpts);
  if (iconKey) {
    return BaseCell({
      type: 'image',
      value: getSfSymbolImg(iconKey, parsedColor),
      ...commonArgs,
    });
  } else if (image) {
    return BaseCell({ type: 'image', value: image, ...commonArgs });
  } else if (text !== undefined || isEmpty) {
    return BaseCell({
      type: 'text',
      value: isNumber(text) || isString(text) ? String(text) : '',
      color: parsedColor,
      font: fontConstructor(parseStringOrValue(textSize, textSizeToNumMap)),
      ...commonArgs,
    });
  }
  throw new ErrorWithPayload('Cell configuration is invalid', {
    iconKey,
    text,
    isEmpty,
    hasImage: Boolean(image),
  });
};

type CommonRowParams = MapKeys<
  Pick<
    ParsedRowOpts,
    'onTap' | 'onDoubleTap' | 'onTripleTap' | 'dismissOnTap' | 'bgColor'
  >,
  { dismissTableOnTap: 'dismissOnTap' }
>;

const getPadding = (
  height: number,
  parsedOpts: ParsedRowOpts,
  commonArgs: CommonRowParams
) =>
  BaseRow({
    cells: [getCell({ isEmpty: true }, parsedOpts)!],
    ...commonArgs,
    height,
  });

export default (opts: RowOpts = {}) => {
  const parsedOpts = parseRowOpts(opts);
  const cells = toArray(
    parsedOpts.content,
    compose(
      map(content => getCell(content, parsedOpts)),
      filter(ExcludeFalsy)
    )
  );
  const {
    bgColor,
    padding,
    rowHeight,
    dismissOnTap,
    onTap,
    onDoubleTap,
    onTripleTap,
  } = parsedOpts;
  const commonArgs: CommonRowParams = {
    onTap,
    onDoubleTap,
    onTripleTap,
    dismissTableOnTap: dismissOnTap,
    bgColor,
  };
  return conditionalArr([
    padding.paddingTop &&
      getPadding(padding.paddingTop, parsedOpts, commonArgs),
    BaseRow({
      cells: cells.length ? cells : [BaseCell()],
      height: rowHeight,
      ...commonArgs,
    }),
    padding.paddingBottom &&
      getPadding(padding.paddingBottom, parsedOpts, commonArgs),
  ]).flat();
};
