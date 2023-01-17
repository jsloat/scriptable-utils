import { sum } from '../../array';
import { fadeIntoColor, getColor } from '../../colors';
import { isNumber } from '../../common';
import { getMaxScreenHeight } from '../../device';
import { pick } from '../../object';
import { ScreenHeightMeasurements } from '../../serviceRegistry';
import { BaseRowOpts } from '../Row/base';
import { FALLBACK_CELL_WIDTH_PERCENT, FALLBACK_ROW_HEIGHT } from './consts';
import { ContainerStyle } from './shapes';
import {
  Border,
  CascadingRowStyle,
  CascadingStyle,
  Percent,
  RowStyle,
  TapProps,
} from './types';

type ValidatedCellWidth =
  | { isValid: true; width: number }
  | { isValid: false; width: number | undefined };

const validateCellWidth = (width: number | undefined): ValidatedCellWidth => ({
  isValid: Boolean(width && width > 0),
  width: width as any,
});

/** Cells are not required to have a specified width. This function fills in
 * blank cell widths in the context of the whole array of cells. */
export const fillInCellWidthBlanks = (
  cellWidthPercentages: (number | undefined)[]
): number[] => {
  const validatedWidths = cellWidthPercentages.map(validateCellWidth);
  const numInvalidWidths = validatedWidths.filter(
    ({ isValid }) => !isValid
  ).length;
  if (!numInvalidWidths) return cellWidthPercentages as number[];
  const totalSpecifiedWidth = sum(
    validatedWidths.map(({ width, isValid }) =>
      isValid ? (width as number) : 0
    )
  );
  const remainingSpaceToAllot = 100 - totalSpecifiedWidth;
  return validatedWidths.map(({ width, isValid }) => {
    // Leave valid widths untouched
    if (isValid) return width as number;
    // If specified cell widths add up to >= 100, use fallback percentage
    if (remainingSpaceToAllot <= 0) return FALLBACK_CELL_WIDTH_PERCENT;
    // If there is remaining space to allot, divide it evenly among unspecified widths
    return remainingSpaceToAllot / numInvalidWidths;
  });
};

/** Ensure that cell widths add up to 100 */
export const normalizeCellWidthPercentages = (
  cellWidthPercentages: number[]
) => {
  const totalPercent = sum(cellWidthPercentages);
  const normalizedValues =
    totalPercent === 100
      ? cellWidthPercentages
      : // Else, normalize the percentage values to the total percentage. Maintain
        // the ratio, but normalize to a total of 100.
        cellWidthPercentages.map(oldPct => (oldPct / totalPercent) * 100);
  return normalizedValues.map(val => Math.floor(val));
};

export const parsePercent = (percent: Percent) =>
  parseInt(percent.replace(/%/g, ''));

/** Converts border prop to a height and color. If the calling row has no
 * inherited color to use for the border (if the border doesn't specify its own
 * color), use default text color. */
export const parseBorder = (border: Border, inheritedColor?: Color) => {
  if (Array.isArray(border)) {
    const [height, color] = border;
    return { height, color };
  }
  return {
    height: border,
    color: inheritedColor ?? getColor('hr'),
  };
};

const heightPercentToNumber = (
  percent: Percent,
  mode: ScreenHeightMeasurements.Mode = 'notFullscreen'
) => {
  const number = parsePercent(percent);
  if (number < 1 || number > 100) {
    throw new Error(`Percent value must be between 1-100, actual: ${percent}`);
  }
  const fraction = number / 100;
  return Math.floor(fraction * getMaxScreenHeight(mode));
};

export const parseRowHeight = ({
  height,
  mode,
}: CascadingRowStyle & RowStyle) => {
  if (isNumber(height)) return height;
  const heightPercent: Percent = height ?? FALLBACK_ROW_HEIGHT;
  return heightPercentToNumber(heightPercent, mode);
};

export const parseColor = (color: Color, { isFaded }: CascadingStyle) =>
  isFaded ? new Color(color.hex, 0.6) : color;

/** Attempts to fade the foreground color into the background color. */
export const maybeFadeForegroundColor = (color: Color, style: CascadingStyle) =>
  style.isFaded ? fadeIntoColor(color, style.bgColor ?? getColor('bg')) : color;

export const tapPropsToBaseRowOpts = ({
  dismissOnTap: dismissTableOnTap,
  ...onTaps
}: TapProps): BaseRowOpts => ({ dismissTableOnTap, ...onTaps });

const getBorderRow = (
  border: Border | undefined,
  rowStyle: CascadingStyle,
  tapProps: TapProps
): BaseRowOpts | null => {
  if (!border) return null;
  const rowColor = rowStyle.color;
  const inheritedColor =
    rowColor && maybeFadeForegroundColor(rowColor, rowStyle);
  const { color, height } = parseBorder(border, inheritedColor);
  return rowOpts({
    bgColor: color,
    height,
    ...tapPropsToBaseRowOpts(tapProps),
  });
};

const rowOpts: Identity<BaseRowOpts> = x => x;

/** Returns adjacent rows including padding, margin, and border */
export const getContainerSurroundingRowsOpts = (
  style: ContainerStyle,
  contentBgColor: Color,
  tapProps: TapProps
) => {
  const bg = getColor('bg');
  const baseRowTapProps = tapPropsToBaseRowOpts(tapProps);
  const {
    borderBottom,
    borderTop,
    marginBottom,
    marginTop,
    paddingBottom,
    paddingTop,
  } = style;
  const paddingTopRow =
    paddingTop &&
    rowOpts({
      height: paddingTop,
      bgColor: contentBgColor,
      ...baseRowTapProps,
    });
  const paddingBottomRow =
    paddingBottom &&
    rowOpts({
      height: paddingBottom,
      bgColor: contentBgColor,
      ...baseRowTapProps,
    });
  const marginTopRow = marginTop && rowOpts({ height: marginTop, bgColor: bg });
  const marginBottomRow =
    marginBottom && rowOpts({ height: marginBottom, bgColor: bg });
  const borderTopRow = getBorderRow(borderTop, style, tapProps);
  const borderBottomRow = getBorderRow(borderBottom, style, tapProps);
  return {
    paddingTopRow,
    paddingBottomRow,
    marginTopRow,
    marginBottomRow,
    borderTopRow,
    borderBottomRow,
  };
};

export const numToPct = (num: number): Percent => `${num}%`;

/** Used to only pick the tap props when passing a combination of other props. */
export const getTapProps: Identity<TapProps> = props =>
  pick(props, ['dismissOnTap', 'onDoubleTap', 'onTap', 'onTripleTap']);
