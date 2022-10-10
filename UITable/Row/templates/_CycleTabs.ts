import { getColor } from '../../../colors';
import { ExcludeFalsy } from '../../../common';
import { cycle } from '../../../flow';
import { ICONS } from '../../../icons';
import Row from '..';
import { ContentAreaOpts, RowSize } from '../types';
import _Spacer from './_Spacer';

const FADED_COLOR = getColor('green_l2');
const GRID_WIDTH = 12;
const COMBINED_ARROW_WIDTH = 2;

type Opts<T extends string = string> = {
  labels: T[];
  value: T;
  /** Used to transform the label (T) to a formatted string. E.g. if T were
   * GmailConnectionKey, you may want to transform "gmailPersonal" to "Personal" */
  mapLabel?: (rawLabel: T) => string;
  /** "Next tab" is the tab switched to immediately after tapping */
  onTabChange: (data: { currTab: T; nextTab: T }) => any;
  /** Smaller underline */
  subtle?: boolean;
  /** Default 3 */
  maxPerPage?: number;
};

type Data<T> = [normal: T, subtle: T];
type StyleLookup = {
  underlineChar: Data<string>;
  underlineCharRepeat: Data<number>;
  textSize: Data<RowSize>;
  rowHeight: Data<number>;
  underlineRowHeight: Data<number>;
};

const styleLookup: StyleLookup = {
  underlineChar: [ICONS.BLOCK, '–'],
  underlineCharRepeat: [5, 7],
  textSize: ['md', 'sm'],
  rowHeight: [24, 20],
  underlineRowHeight: [20, 2],
};

//

const getStyle = <K extends keyof StyleLookup>(
  key: K,
  subtle: boolean
): StyleLookup[K][0] => styleLookup[key][subtle ? 1 : 0];

//

type LabelCellOpts<T extends string> = Pick<Opts<T>, 'mapLabel'> & {
  label: T;
  isActive: boolean;
  subtle: boolean;
  tabWidth: number;
};
const LabelCell = <T extends string>({
  mapLabel,
  subtle,
  label,
  isActive,
  tabWidth,
}: LabelCellOpts<T>): ContentAreaOpts => ({
  text: mapLabel?.(label) ?? label,
  align: 'left',
  ...(!isActive && { color: FADED_COLOR }),
  width: tabWidth,
  textSize: getStyle('textSize', subtle),
});

const UnderlineCell = (
  isActive: boolean,
  subtle: boolean,
  tabWidth: number
): ContentAreaOpts =>
  isActive
    ? {
        text: getStyle('underlineChar', subtle).repeat(
          getStyle('underlineCharRepeat', subtle)
        ),
        color: getColor('deep_blue_l1'),
        align: 'left',
        width: tabWidth,
      }
    : { isEmpty: true, width: tabWidth };

const ArrowCell = (text: string): ContentAreaOpts => ({
  text,
  align: 'center',
  color: FADED_COLOR,
});

//

export default <T extends string>({
  labels,
  value,
  mapLabel,
  onTabChange,
  subtle = false,
  maxPerPage = Device.isPad() ? 4 : 3,
}: Opts<T>) => {
  const cycleForward = async () => {
    const nextTab = cycle(value, labels);
    await onTabChange({ currTab: value, nextTab });
  };
  const cycleBack = async () => {
    const currIndex = labels.indexOf(value);
    const newIndex = !currIndex ? labels.length - 1 : currIndex - 1;
    await onTabChange({ currTab: value, nextTab: labels[newIndex]! });
  };
  const activeIndex = labels.indexOf(value);
  const numTabs = labels.length;
  const doesScroll = numTabs > maxPerPage;
  // If all options can fit on one page, start at 0. If active is on the first
  // page, start at 0 (so always favor the first page.) Else, the active tab
  // will always be shown on the far right side so there's no empty space.
  const firstShownIndex =
    !doesScroll || activeIndex < maxPerPage
      ? 0
      : activeIndex - (maxPerPage - 1);
  const areHiddenToLeft = firstShownIndex !== 0;
  const areHiddenToRight = doesScroll && activeIndex !== numTabs - 1;
  const shownLabels = labels.slice(
    firstShownIndex,
    firstShownIndex + maxPerPage
  );
  const tabWidth = Math.floor((GRID_WIDTH - COMBINED_ARROW_WIDTH) / maxPerPage);

  const BackCyclingSpacer = _Spacer({ onTap: cycleBack });

  return [
    BackCyclingSpacer,
    BackCyclingSpacer,
    Row({
      content: [
        areHiddenToLeft ? ArrowCell(ICONS.CHEVRON_LEFT) : { isEmpty: true },
        ...shownLabels.map(label =>
          LabelCell({
            mapLabel,
            label,
            isActive: label === value,
            subtle,
            tabWidth,
          })
        ),
        areHiddenToRight ? ArrowCell(ICONS.CHEVRON_RIGHT) : { isEmpty: true },
      ].filter(ExcludeFalsy) as ContentAreaOpts[],
      onTap: cycleForward,
      padding: { paddingBottom: 0 },
      rowHeight: getStyle('rowHeight', subtle),
    }),
    Row({
      content: [
        { isEmpty: true },
        ...shownLabels.map(label =>
          UnderlineCell(label === value, subtle, tabWidth)
        ),
        { isEmpty: true },
      ],
      onTap: cycleForward,
      padding: { paddingTop: 0, paddingBottom: 0 },
      rowHeight: getStyle('underlineRowHeight', subtle),
    }),
  ].flat();
};
