import { SFSymbolKey } from '../../../../sfSymbols';
import { ButtonStackOpt } from '../_Button';

export type HeaderMenuState = { isExpanded: boolean; timer: Timer };

export type TableOpts = {
  name: string;
  rerenderParent: NoParamFn;
  isTableActive: NoParamFn<boolean>;
};

type TapCardinality = 'single' | 'double' | 'triple';

type ShouldNotCollapseRecord = Partial<Record<TapCardinality, boolean>>;

export type HeaderMenuOpts = {
  /** Defaults to hamburger */
  icon?: SFSymbolKey;
  /** Defaults to X to show user it is closeable. */
  iconWhileOpen?: SFSymbolKey;
  /** Defaults to empty */
  text?: string;
  /** Optionally show different text when menu is open. If not provided,
   * fallback to `text`. */
  textWhileOpen?: string;
  settingOpts: (HeaderMenuButtonOpts | Falsy)[];
} & TableOpts;

export type HeaderMenuButtonOpts = Omit_<
  ButtonStackOpt,
  'isLarge' | 'isSmall'
> & {
  /** By default, any tap action will collapse the menu */
  shouldNotCollapseMenuOnNTap?: ShouldNotCollapseRecord;
};
