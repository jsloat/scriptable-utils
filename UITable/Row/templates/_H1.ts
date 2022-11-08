import { conditionalArr } from '../../../array';
import { getColor } from '../../../colors';
import { SFSymbolKey } from '../../../sfSymbols';
import { numberToEmoji } from '../../../string';
import { H1Consts } from './consts';
import { composeRowConstructor } from './utils';
import { getFootnoteReducer } from './_Footnote';
import _ThreeCol, { getThreeColReducer } from './_ThreeCol';

export type H1Opts = {
  title: string;
  subtitle?: string;
  onTap?: () => any;
  titleColor?: Color;
  subtitleColor?: Color;
  /** Shown in place of action indicator icon */
  badgeNumber?: number;
  icon?: SFSymbolKey;
};

//

const TopRow = ({
  icon,
  title,
  titleColor,
  onTap,
  badgeNumber,
  subtitle,
}: H1Opts) => {
  const { textSize, fontConstructor, paddingTop, paddingBottom } = H1Consts;
  return _ThreeCol({
    ...(icon && { gutterLeft: { iconKey: icon } }),
    main: {
      text: title,
      fontConstructor,
      textSize,
      ...(titleColor && { color: titleColor }),
    },
    ...(badgeNumber && {
      gutterRight: {
        text: numberToEmoji(badgeNumber!),
        color: getColor('danger'),
      },
    }),
    onTap,
    padding: { paddingTop, paddingBottom: subtitle ? 0 : paddingBottom },
    rowHeight: 'lg',
  });
};

const BottomRow = ({
  subtitle,
  icon,
  subtitleColor,
  badgeNumber,
  onTap,
}: H1Opts) => {
  if (!subtitle) return null;
  const { paddingBottom } = H1Consts;
  const rowConstructor = composeRowConstructor(
    getThreeColReducer({
      ...(icon && { gutterLeft: { isEmpty: true } }),
      main: {
        text: subtitle,
        ...(subtitleColor && { color: subtitleColor }),
      },
      ...(badgeNumber && { gutterRight: { isEmpty: true } }),
    }),
    getFootnoteReducer()
  );
  return rowConstructor({ onTap, padding: { paddingTop: 0, paddingBottom } });
};

//

export default (opts: H1Opts) =>
  conditionalArr([TopRow(opts), BottomRow(opts)]).flat();
