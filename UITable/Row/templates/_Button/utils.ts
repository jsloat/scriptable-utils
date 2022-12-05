import { getRowHeight } from '../..';
import { parseFlavor } from '../../flavors';
import { RowOpts } from '../../types';
import { DEFAULT_HR_HEIGHT } from '../_HR';
import { getSizeConfig } from './consts';
import { _EntityOpts, _INTERNAL_ButtonOpts } from './types';

type GetButtonHeightOpts = {
  numBorders: 0 | 1 | 2;
} & Pick<_INTERNAL_ButtonOpts, 'isSmall' | 'isLarge'>;
/** Used for UI layout purposes. */
export const getButtonHeight = ({
  isLarge,
  isSmall,
  numBorders,
}: GetButtonHeightOpts) => {
  const sizeConfig = getSizeConfig({ isLarge, isSmall });
  const rowWithPaddingHeight = getRowHeight({
    padding: {
      paddingTop: sizeConfig.padding,
      paddingBottom: sizeConfig.padding,
    },
    rowHeight: sizeConfig.rowHeight,
  });
  return rowWithPaddingHeight + numBorders * DEFAULT_HR_HEIGHT;
};

/** Eliminate onTap if the button is disabled */
const parseOnTap = (onTap: NoParamFn | undefined, isDisabled: boolean) =>
  onTap && !isDisabled ? onTap : undefined;

export const getConfigOpts = ({ flavor, isSmall, isLarge }: _EntityOpts) => ({
  ...parseFlavor(flavor),
  ...getSizeConfig({ isLarge, isSmall }),
});

/** Used to generate common row opts for both Buttons and CTAs. */
export const getSharedOpts = (opts: _EntityOpts): RowOpts => {
  const {
    isDisabled = false,
    onTap,
    onDoubleTap,
    onTripleTap,
    isFaded,
    dismissOnTap,
  } = opts;
  const { bgColor, rowHeight, padding } = getConfigOpts(opts);
  return {
    onTap: parseOnTap(onTap, isDisabled),
    onDoubleTap: parseOnTap(onDoubleTap, isDisabled),
    onTripleTap: parseOnTap(onTripleTap, isDisabled),
    bgColor,
    isFaded: isFaded || isDisabled,
    rowHeight,
    padding: { paddingTop: padding, paddingBottom: padding },
    dismissOnTap: !isDisabled && dismissOnTap,
  };
};
