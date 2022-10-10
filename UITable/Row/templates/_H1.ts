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

export default ({
  title,
  subtitle,
  onTap,
  titleColor,
  subtitleColor,
  badgeNumber,
  icon,
  onTapIndicatorIcon = 'ellipsis_circle',
}: H1Opts) => {
  const { textSize, fontConstructor, paddingTop, paddingBottom } = H1Consts;
  const showRightGutter = Boolean(onTap) || isNumber(badgeNumber);
  const topRow = _ThreeCol({
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

  const bottomRow = !subtitle
    ? null
    : composeRowConstructor(
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

  return conditionalArr([
    topRow,
    bottomRow?.({ onTap, padding: { paddingTop: 0, paddingBottom } }),
  ]).flat();
};
