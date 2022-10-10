import { SFSymbolKey } from '../../sfSymbols';

export type RowSize = 'sm' | 'md' | 'lg';

export type BGColorMode = 'selected' | 'callout';

/** For user-selected options */
type Custom<T> = T;

type SizeOrCustomType = RowSize | Custom<number>;

type PaddingOpts = {
  paddingTop?: SizeOrCustomType;
  paddingBottom?: SizeOrCustomType;
};

export type SizeMap = Record<RowSize, number>;

export type ContentAreaOpts =
  // Only one will be evaluated
  Partial<{
    iconKey: SFSymbolKey;
    text: string | number;
    isEmpty: true;
    image: Image;
  }> &
    Partial<{
      color: Color;
      textSize: SizeOrCustomType;
      fontConstructor: (textSize: number) => Font;
      align: Align;
      width: number;
    }>;

export type RowOpts = {
  rowHeight?: SizeOrCustomType;
  /** NB: There is default padding. */
  padding?: PaddingOpts;
  bgColor?: Color | BGColorMode;
  isFaded?: boolean;
  /** Optionally indicate whether the row's bg is light or dark; this is used to
   * determine whether "faded" means becoming lighter or darker. Generally only
   * used when you have a constant bgColor that doesn't change in dark/light
   * modes. */
  fadeWith?: 'darken' | 'lighten' | Color;
  onTap?: NoParamFn;
  onDoubleTap?: NoParamFn;
  onTripleTap?: NoParamFn;
  dismissOnTap?: boolean;
  content?: ContentAreaOpts[];
};

type WithoutSize<T> = Exclude<T, RowSize>;

export type ParsedPaddingOpts = Required<{
  [key in keyof PaddingOpts]: WithoutSize<PaddingOpts[key]>;
}>;

/** Attributes of a row that is valid (unlike RowOpts, which will have fallbacks assigned) */
export type ParsedRowOpts = MakeSomeReqd<
  RowOpts,
  'content',
  'rowHeight' | 'padding' | 'bgColor'
> & {
  rowHeight: WithoutSize<Required<RowOpts>['rowHeight']>;
  padding: ParsedPaddingOpts;
  bgColor: Color;
};
