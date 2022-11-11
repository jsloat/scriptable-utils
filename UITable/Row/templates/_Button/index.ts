import Row from '../..';
import { conditionalArr, isLastArrIndex } from '../../../../array';
import { ExcludeFalsy } from '../../../../common';
import conditionalValue, {
  NO_CONDITIONAL_VALUE_MATCH,
} from '../../../../conditionalValue';
import { parseFlavor, whichFlavorIsBolder } from '../../flavors';
import { ContentAreaOpts } from '../../types';
import _HR from '../_HR';
import _ThreeCol from '../_ThreeCol';
import _TwoCol from '../_TwoCol';
import {
  ButtonOpts,
  ButtonStackOpt,
  CTAOpts,
  _INTERNAL_ButtonOpts,
  _INTERNAL_CTAOpts,
} from './types';
import { getConfigOpts, getSharedOpts } from './utils';

export { ButtonOpts, ButtonStackOpt } from './types';
export { getButtonHeight } from './utils';

//

const _Button = (opts: _INTERNAL_ButtonOpts) => {
  const {
    icon,
    image,
    text,
    metadata,
    isLast,
    topBorderFlavor,
    bottomBorderFlavor,
  } = opts;
  const { color, textSize, fontConstructor } = getConfigOpts(opts);
  const sharedOpts = {
    ...getSharedOpts(opts),
    gutterLeft: conditionalValue<ContentAreaOpts>([
      () => (icon ? { iconKey: icon, color } : NO_CONDITIONAL_VALUE_MATCH),
      () => (image ? { image } : NO_CONDITIONAL_VALUE_MATCH),
      { isEmpty: true },
    ]),
    main: { text, textSize, color, fontConstructor },
  };
  const mainRow = metadata
    ? _ThreeCol({ ...sharedOpts, gutterRight: { text: metadata, color } })
    : _TwoCol(sharedOpts);
  const topBorderRow =
    !topBorderFlavor.noBorder && _HR({ color: topBorderFlavor.color });
  const bottomBorderRow =
    !bottomBorderFlavor.noBorder && _HR({ color: bottomBorderFlavor.color });
  return conditionalArr([
    topBorderRow,
    mainRow,
    isLast && bottomBorderRow,
  ]).flat();
};

export const Button = ({ flavor = 'default', ...restOpts }: ButtonOpts) =>
  _Button({
    flavor,
    isLast: true,
    topBorderFlavor: parseFlavor(flavor),
    bottomBorderFlavor: parseFlavor(flavor),
    ...restOpts,
  });

/** Use when stacking 2+ buttons to avoid border collision. */
export const ButtonStack = (
  opts: (ButtonStackOpt | Falsy)[],
  commonOpts?: Partial<ButtonStackOpt>
) =>
  opts
    .filter(ExcludeFalsy)
    .flatMap(({ flavor = 'default', ...restOpts }, i, arr) => {
      const isLast = isLastArrIndex(i, arr);
      const prevOpts = arr[i - 1];
      const nextOpts = arr[i + 1];
      const topBorderFlavor = prevOpts
        ? whichFlavorIsBolder(prevOpts.flavor, flavor)
        : parseFlavor(flavor);
      const bottomBorderFlavor = nextOpts
        ? whichFlavorIsBolder(flavor, nextOpts.flavor)
        : parseFlavor(flavor);
      return _Button({
        flavor,
        isLast,
        topBorderFlavor,
        bottomBorderFlavor,
        ...restOpts,
        ...commonOpts,
      });
    });

//
// CTA
//

const _CTA = (opts: _INTERNAL_CTAOpts) => {
  const overriddenOpts = { ...opts, isSmall: false, isLarge: true };
  const { color, textSize, noBorder, fontConstructor } =
    getConfigOpts(overriddenOpts);
  const { text, isLast, align = 'center' } = overriddenOpts;
  const mainRow = Row({
    content: [{ text, align, color, textSize, fontConstructor }],
    ...getSharedOpts(overriddenOpts),
  });
  const borderRow = !noBorder && _HR({ color });
  return conditionalArr([borderRow, mainRow, isLast && borderRow]).flat();
};

export const CTA = ({ flavor = 'default', ...restOpts }: CTAOpts) =>
  _CTA({
    flavor,
    isLast: true,
    topBorderFlavor: parseFlavor(flavor),
    bottomBorderFlavor: parseFlavor(flavor),
    ...restOpts,
  });
