import Row, { getRowHeight } from '..';
import { conditionalArr, isLastArrIndex } from '../../../array';
import { getColors, getDynamicColor } from '../../../colors';
import { ExcludeFalsy, isString } from '../../../common';
import conditionalValue, {
  NO_CONDITIONAL_VALUE_MATCH,
} from '../../../conditionalValue';
import { SFSymbolKey } from '../../../sfSymbols';
import { ContentAreaOpts, RowOpts, RowSize } from '../types';
import { H1Consts } from './consts';
import _HR, { DEFAULT_HR_HEIGHT } from './_HR';
import _ThreeCol from './_ThreeCol';
import _TwoCol from './_TwoCol';

type FromRowOpts = Omit_<
  RowOpts,
  'rowHeight' | 'padding' | 'bgColor' | 'fadeWith' | 'content'
>;

type Flavor = Pick<RowOpts, 'bgColor' | 'fadeWith'> &
  Pick<ContentAreaOpts, 'color' | 'fontConstructor'> & {
    noBorder?: boolean;
  };
const flav: Identity<Flavor> = f => f;
const {
  gray8,
  grayMinus1,
  green,
  green_l4,
  yellow_d2,
  yellow_l3,
  red_d1,
  red_l4,
  deep_blue,
  gray2,
  gray4,
} = getColors();

const h1FlavorOpts = { fontConstructor: H1Consts.fontConstructor };

const serene = flav({ bgColor: deep_blue, color: gray2, fadeWith: gray4 });
const transparent = flav({ noBorder: true });

const flavors = {
  default: flav({ bgColor: getDynamicColor(grayMinus1, gray8) }),
  defaultNoBorder: flav({
    bgColor: getDynamicColor(grayMinus1, gray8),
    noBorder: true,
  }),
  happy: flav({ bgColor: green_l4, color: green, fadeWith: 'lighten' }),
  warning: flav({ bgColor: yellow_l3, color: yellow_d2, fadeWith: 'lighten' }),
  danger: flav({ bgColor: red_l4, color: red_d1, fadeWith: 'lighten' }),
  transparent,
  transparentH1: flav({ ...transparent, ...h1FlavorOpts }),
  transparentWithBorder: flav({}),
  serene,
  sereneH1: flav({ ...serene, ...h1FlavorOpts, noBorder: true }),
};

// ts-unused-exports:disable-next-line
export type FlavorOption = keyof typeof flavors;

type SizeConfig = Pick<ContentAreaOpts, 'textSize'> & {
  rowHeight: RowSize;
  padding: RowSize;
};

const defaultSizeConfig: SizeConfig = {
  rowHeight: 'lg',
  textSize: 'md',
  padding: 'md',
};
const smallSizeConfig: SizeConfig = {
  rowHeight: 'sm',
  textSize: 'sm',
  padding: 'sm',
};
const largeSizeConfig: SizeConfig = {
  rowHeight: 'lg',
  textSize: 'lg',
  padding: 'lg',
};

const getSizeConfig = ({
  isSmall = false,
  isLarge = false,
}: Pick<_ButtonOpts, 'isSmall' | 'isLarge'>) =>
  conditionalValue([
    [isSmall, smallSizeConfig],
    [isLarge, largeSizeConfig],
    defaultSizeConfig,
  ]);

type GetButtonHeightOpts = {
  numBorders: 0 | 1 | 2;
} & Pick<_ButtonOpts, 'isSmall' | 'isLarge'>;
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

type _ButtonOpts = FromRowOpts & {
  /** All buttons have a top border; if `isLast`, also add a bottom border. */
  isLast: boolean;
  isDisabled?: boolean;
  flavor: FlavorOption | Flavor;
  icon?: SFSymbolKey;
  image?: Image;
  metadata?: string | number;
  text: string;
  isSmall?: boolean;
  isLarge?: boolean;
};
type _CTAOpts = Omit_<_ButtonOpts, 'icon' | 'image' | 'metadata'> & {
  align?: Align;
};
type _EntityOpts = _ButtonOpts | _CTAOpts;

/** Eliminate onTap if the button is disabled */
const parseOnTap = (onTap: NoParamFn | undefined, isDisabled: boolean) =>
  onTap && !isDisabled ? onTap : undefined;

const getConfigOpts = ({ flavor, isSmall, isLarge }: _EntityOpts) => ({
  ...(isString(flavor) ? flavors[flavor] : flavor),
  ...getSizeConfig({ isLarge, isSmall }),
});

/** Used to generate common row opts for both Buttons and CTAs. */
const getSharedOpts = (opts: _EntityOpts): RowOpts => {
  const {
    isDisabled = false,
    onTap,
    onDoubleTap,
    onTripleTap,
    isFaded,
    dismissOnTap,
  } = opts;
  const { bgColor, fadeWith, rowHeight, padding } = getConfigOpts(opts);
  return {
    onTap: parseOnTap(onTap, isDisabled),
    onDoubleTap: parseOnTap(onDoubleTap, isDisabled),
    onTripleTap: parseOnTap(onTripleTap, isDisabled),
    bgColor,
    fadeWith,
    isFaded: isFaded || isDisabled,
    rowHeight,
    padding: { paddingTop: padding, paddingBottom: padding },
    dismissOnTap: !isDisabled && dismissOnTap,
  };
};

const _Button = (opts: _ButtonOpts) => {
  const { icon, image, text, metadata, isLast } = opts;
  const { color, textSize, noBorder, fontConstructor } = getConfigOpts(opts);
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
  const borderRow = !noBorder && _HR({ color });
  return conditionalArr([borderRow, mainRow, isLast && borderRow]).flat();
};

const _CTA = (opts: _CTAOpts) => {
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

//
//

/** Used externally. Opts for a lone button. */
// ts-unused-exports:disable-next-line
export type ButtonOpts = Omit_<_ButtonOpts, 'isLast' | 'flavor'>;

const singleButtonGetter = (flavor: FlavorOption) => (opts: ButtonOpts) =>
  _Button({ ...opts, flavor, isLast: true });

// ts-unused-exports:disable-next-line
export const Button = ({
  flavor = 'default',
  ...restOpts
}: MakeSomeOptional<Omit_<_ButtonOpts, 'isLast'>, 'flavor'>) =>
  _Button({ flavor, isLast: true, ...restOpts });
// ts-unused-exports:disable-next-line
export const ButtonNoBorder = singleButtonGetter('defaultNoBorder');
// ts-unused-exports:disable-next-line
export const HappyButton = singleButtonGetter('happy');
// ts-unused-exports:disable-next-line
export const WarningButton = singleButtonGetter('warning');
// ts-unused-exports:disable-next-line
export const DangerButton = singleButtonGetter('danger');
// ts-unused-exports:disable-next-line
export const TransparentButton = singleButtonGetter('transparent');
// ts-unused-exports:disable-next-line
export const TransparentButtonWithBorder = singleButtonGetter(
  'transparentWithBorder'
);
// ts-unused-exports:disable-next-line
export const SereneButton = singleButtonGetter('serene');

//
//

type CTAOpts = Omit_<_CTAOpts, 'isLast' | 'flavor'>;

const singleCTAGetter = (flavor: FlavorOption) => (opts: CTAOpts) =>
  _CTA({ ...opts, flavor, isLast: true });

// ts-unused-exports:disable-next-line
export const CTA = ({
  flavor = 'default',
  ...restOpts
}: MakeSomeOptional<Omit_<_CTAOpts, 'isLast'>, 'flavor'>) =>
  _CTA({ flavor, isLast: true, ...restOpts });
// ts-unused-exports:disable-next-line
export const HappyCTA = singleCTAGetter('happy');
// ts-unused-exports:disable-next-line
export const WarningCTA = singleCTAGetter('warning');
// ts-unused-exports:disable-next-line
export const DangerCTA = singleCTAGetter('danger');
// ts-unused-exports:disable-next-line
export const TransparentCTA = singleCTAGetter('transparent');
// ts-unused-exports:disable-next-line
export const TransparentCTAWithBorder = singleCTAGetter(
  'transparentWithBorder'
);
// ts-unused-exports:disable-next-line
export const SereneCTA = singleCTAGetter('serene');

//
//

/** Used externally. Opts for a stack of multiple buttons. Always use this for
 * multiple buttons to avoid thinking about border collision. */
// ts-unused-exports:disable-next-line
export type ButtonStackOpt = ButtonOpts & { flavor?: FlavorOption | Flavor };

/** Use when stacking 2+ buttons to avoid border collision. */
// ts-unused-exports:disable-next-line
export const ButtonStack = (
  opts: (ButtonStackOpt | Falsy)[],
  commonOpts?: Partial<ButtonStackOpt>
) =>
  opts
    .filter(ExcludeFalsy)
    .flatMap(({ flavor = 'default', ...restOpts }, i, arr) =>
      _Button({
        flavor,
        isLast: isLastArrIndex(i, arr),
        ...restOpts,
        ...commonOpts,
      })
    );

//
//

// ts-unused-exports:disable-next-line
export type CTAStackOpt = CTAOpts & { flavor?: FlavorOption | Flavor };

/** Use when stacking 2+ CTAs to avoid border collision. */
// ts-unused-exports:disable-next-line
export const CTAStack = (opts: (CTAStackOpt | Falsy)[]) =>
  opts
    .filter(ExcludeFalsy)
    .flatMap(({ flavor = 'default', ...restOpts }, i, arr) =>
      _CTA({ flavor, isLast: isLastArrIndex(i, arr), ...restOpts })
    );
