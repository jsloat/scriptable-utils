import { conditionalArr } from '../../array';
import { compose, filter, map, toArray } from '../../arrayTransducers';
import { getColor } from '../../colors';
import {
  ErrorWithPayload,
  ExcludeFalsy,
  isNumber,
  isString,
} from '../../common';
import { ScreenHeightMeasurements } from '../../serviceRegistry';
import { getSfSymbolImg } from '../../sfSymbols';
import { getMaxScreenHeight } from '../utils';
import { BaseCell, BaseRow } from './base';
import {
  bgColorModeToColor,
  paddingSizeToNumMap,
  rowHeightSizeToNumMap,
  textSizeToNumMap,
} from './consts';
import {
  BGColorMode,
  ContentAreaOpts,
  ParsedPaddingOpts,
  ParsedRowOpts,
  Percent,
  RowOpts,
  RowSize,
  SizeMap,
} from './types';

const isPercent = (val: any): val is Percent =>
  isString(val) && val.includes('%');

const isRowSize = (val: any): val is RowSize =>
  isString(val) && (['lg', 'md', 'sm'] as RowSize[]).includes(val as RowSize);

const heightPercentToNumber = (
  percent: Percent,
  mode: ScreenHeightMeasurements.Mode = 'notFullscreen'
) => {
  const numberStr = percent.split('%')[0];
  if (!numberStr) {
    throw new Error(`Incorrectly formatted percent value: ${percent}`);
  }
  const number = parseInt(numberStr, 10);
  if (number < 1 || number > 100) {
    throw new Error(`Percent value must be between 1-100: ${percent}`);
  }
  const fraction = number / 100;
  return Math.floor(fraction * getMaxScreenHeight(mode));
};

const parseSizeValue = (
  value: number | RowSize | Percent,
  lookupMap: SizeMap,
  mode?: ScreenHeightMeasurements.Mode
): number => {
  const mappedValue = isRowSize(value) ? lookupMap[value] : value;
  return isPercent(mappedValue)
    ? heightPercentToNumber(mappedValue, mode)
    : mappedValue;
};

const parsePaddingOpts = (padding: RowOpts['padding']): ParsedPaddingOpts => {
  const paddingTop = parseSizeValue(
    padding?.paddingTop ?? 'sm',
    paddingSizeToNumMap
  );
  const paddingBottom = parseSizeValue(
    padding?.paddingBottom ?? 'sm',
    paddingSizeToNumMap
  );
  return { paddingTop, paddingBottom };
};

type HeightOpts = Pick<RowOpts, 'padding' | 'rowHeight' | 'mode'>;
const parseHeightVals = ({ padding, rowHeight = 'sm', mode }: HeightOpts) => ({
  padding: parsePaddingOpts(padding),
  rowHeight: parseSizeValue(rowHeight, rowHeightSizeToNumMap, mode),
});

const parseBgColorValue = (bgColor: Color | BGColorMode) =>
  isString(bgColor) ? bgColorModeToColor[bgColor] : bgColor;

const parseRowOpts = ({
  bgColor = getColor('bg'),
  rowHeight,
  padding,
  mode,
  content = [],
  ...rest
}: RowOpts): ParsedRowOpts => ({
  ...rest,
  content,
  bgColor: parseBgColorValue(bgColor),
  ...parseHeightVals({ padding, rowHeight, mode }),
});

//
//
//

const parseColor = (color: Color, { isFaded }: ParsedRowOpts) =>
  isFaded ? new Color(color.hex, 0.6) : color;

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
      font: fontConstructor(parseSizeValue(textSize, textSizeToNumMap)),
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

export const getRowHeight = (opts: HeightOpts) => {
  const { padding, rowHeight } = parseHeightVals(opts);
  return rowHeight + padding.paddingBottom + padding.paddingTop;
};
