import { SFSymbolKey } from '../../../../sfSymbols';
import { FlavorOption } from '../../flavors';
import { ContentAreaOpts, Flavor, RowOpts, RowSize } from '../../types';

type FromRowOpts = Omit_<
  RowOpts,
  'rowHeight' | 'padding' | 'bgColor' | 'fadeWith' | 'content'
>;

export type _INTERNAL_ButtonOpts = FromRowOpts & {
  /** All buttons have a top border; if `isLast`, also add a bottom border. */
  isLast: boolean;
  isDisabled?: boolean;
  flavor: FlavorOption | Flavor;
  // The border flavor opts handle cases where button stacks have mixed flavors.
  topBorderFlavor: Flavor;
  bottomBorderFlavor: Flavor;
  icon?: SFSymbolKey;
  image?: Image;
  metadata?: string | number;
  text: string;
  isSmall?: boolean;
  isLarge?: boolean;
};

export type _INTERNAL_CTAOpts = Omit_<
  _INTERNAL_ButtonOpts,
  'icon' | 'image' | 'metadata'
> & {
  align?: Align;
};

export type _EntityOpts = _INTERNAL_ButtonOpts | _INTERNAL_CTAOpts;

export type ButtonOpts = Omit_<
  MakeSomeOptional<_INTERNAL_ButtonOpts, 'flavor'>,
  'isLast' | 'topBorderFlavor' | 'bottomBorderFlavor'
>;

export type CTAOpts = Omit_<
  MakeSomeOptional<_INTERNAL_CTAOpts, 'flavor'>,
  'isLast' | 'topBorderFlavor' | 'bottomBorderFlavor'
>;

export type SizeConfig = Pick<ContentAreaOpts, 'textSize'> & {
  rowHeight: RowSize;
  padding: RowSize;
};

/** Used externally. Opts for a stack of multiple buttons. Always use this for
 * multiple buttons to avoid thinking about border collision. */
export type ButtonStackOpt = ButtonOpts & { flavor?: FlavorOption | Flavor };
