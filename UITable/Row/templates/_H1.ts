import { SFSymbolKey } from '../../../sfSymbols';
import { conditionalArr } from '../../../array';
import { isNumber } from '../../../common';
import { numberToEmoji } from '../../../string';
import { composeRowConstructor } from './utils';
import { getFootnoteReducer } from './_Footnote';
import _ThreeCol, { getThreeColReducer } from './_ThreeCol';
import { getColor } from '../../../colors';
import { H1Consts } from './consts';

export type H1Opts = {
  title: string;
  subtitle?: string;
  onTap?: () => any;
  titleColor?: Color;
  subtitleColor?: Color;
  /** Shown in place of action indicator icon */
  badgeNumber?: number;
  icon?: SFSymbolKey;
  /** Optionally override the default icon shown to indicate an onTap */
  onTapIndicatorIcon?: SFSymbolKey;
};

type ParsedH1Opts = MakeSomeReqd<H1Opts, 'onTapIndicatorIcon'>;

type InternalRowOpts = ParsedH1Opts & { showRightGutter: boolean };

const parseOpts = ({
  onTapIndicatorIcon = 'ellipsis_circle',
  ...rest
}: H1Opts): ParsedH1Opts => ({ onTapIndicatorIcon, ...rest });

//

const TopRow = ({
  icon,
  title,
  titleColor,
  onTapIndicatorIcon,
  onTap,
  badgeNumber,
  showRightGutter,
  subtitle,
}: InternalRowOpts) => {
  const { textSize, fontConstructor, paddingTop, paddingBottom } = H1Consts;
  return _ThreeCol({
    ...(icon && { gutterLeft: { iconKey: icon } }),
    main: {
      text: title,
      fontConstructor,
      textSize,
      ...(titleColor && { color: titleColor }),
    },
    ...(showRightGutter && {
      gutterRight: {
        ...(onTap
          ? { iconKey: onTapIndicatorIcon }
          : { text: numberToEmoji(badgeNumber!), color: getColor('danger') }),
      },
    }),
    onTap,
    padding: { paddingTop, paddingBottom: subtitle ? 0 : paddingBottom },
  });
};

const BottomRow = ({
  subtitle,
  icon,
  subtitleColor,
  showRightGutter,
  onTap,
}: InternalRowOpts) => {
  if (!subtitle) return null;
  const { paddingBottom } = H1Consts;
  const rowConstructor = composeRowConstructor(
    getThreeColReducer({
      ...(icon && { gutterLeft: { isEmpty: true } }),
      main: {
        text: subtitle,
        ...(subtitleColor && { color: subtitleColor }),
      },
      ...(showRightGutter && { gutterRight: { isEmpty: true } }),
    }),
    getFootnoteReducer()
  );
  return rowConstructor({ onTap, padding: { paddingTop: 0, paddingBottom } });
};

//

export default (opts: H1Opts) => {
  const { onTap, badgeNumber } = opts;
  const rowOpts: InternalRowOpts = {
    ...parseOpts(opts),
    showRightGutter: Boolean(onTap) || isNumber(badgeNumber),
  };
  return conditionalArr([TopRow(rowOpts), BottomRow(rowOpts)]).flat();
};
