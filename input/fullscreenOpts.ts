// Full-screen, no-distraction buttons

import { getColor, getDynamicColor } from '../colors';
import { isFunc } from '../common';
import { getMaxScreenHeight } from '../device';
import { isOdd } from '../numbers';
import { getSfSymbolImg, SFSymbolKey } from '../sfSymbols';
import getTable from '../UITable/getTable';
import { BaseCell, BaseRow } from '../UITable/Row/base';
import { FlavorOption, parseFlavor } from '../UITable/Row/flavors';

export type FullscreenOptNode = {
  label: string;
  icon: SFSymbolKey;
  flavor?: FlavorOption;
  /** Action or children are required, though typing doesn't enforce it. */
  action?: NoParamFn;
  /** Action or children are required, though typing doesn't enforce it.
   * Children can be either an array or an array getter function, useful for
   * cases when children may be computationally complex to generate and should
   * be delayed as long as possible for better performance. */
  children?: FullscreenOptNode[] | NoParamFn<MaybePromise<FullscreenOptNode[]>>;
};

type State = { nodes: FullscreenOptNode[]; selectedActionLabel: string | null };

export const getZebraStripeColor = (index: number) =>
  isOdd(index) ? getColor('bg') : getDynamicColor('gray0', 'gray8');

const MAX_OPTIONS_ON_SCREEN = 7;

const getOptionHeight = (totalNodesShown: number) => {
  const totalHeight = getMaxScreenHeight('notFullscreen');
  const minOptionHeight = Math.floor(totalHeight / MAX_OPTIONS_ON_SCREEN);
  const heightWithAllShown = Math.floor(totalHeight / totalNodesShown);
  return Math.max(heightWithAllShown, minOptionHeight);
};

//

export default async (initNodes: FullscreenOptNode[]) => {
  const { present, connect } = getTable<State>({
    name: `fullscreenOpts ${UUID.string()}`,
  });

  //

  const OptionRow = connect(
    (
      { setState },
      { label, action, children, icon, flavor }: FullscreenOptNode,
      totalNodesShown: number,
      index: number
    ) => {
      if (!(action || children)) {
        throw new Error(
          'Fullscreen option requires either an action or children'
        );
      }
      const defaultBgColor = getZebraStripeColor(index);
      const color = flavor
        ? parseFlavor(flavor).color
        : getColor('primaryTextColor');
      return BaseRow({
        bgColor: flavor ? parseFlavor(flavor).bgColor : defaultBgColor,
        dismissTableOnTap: !children,
        height: getOptionHeight(totalNodesShown),
        onTap: async () => {
          if (children) {
            const childrenNodes = isFunc(children)
              ? await children()
              : children;
            setState({ nodes: childrenNodes });
          } else if (action) {
            setState({ selectedActionLabel: label });
            action();
          }
        },
        cells: [
          BaseCell({
            type: 'image',
            value: getSfSymbolImg(icon, color),
            align: 'center',
          }),
          BaseCell({ type: 'text', value: '', widthWeight: 1 }),
          BaseCell({
            type: 'text',
            value: label,
            align: 'left',
            color,
            font: Font.title1(),
            widthWeight: 14,
          }),
        ],
      });
    }
  );

  const OptionRows = connect(({ state: { nodes } }) =>
    nodes.flatMap((node, i) => OptionRow(node, nodes.length, i))
  );

  //

  const { selectedActionLabel } = await present({
    defaultState: { nodes: initNodes, selectedActionLabel: null },
    render: () => [OptionRows()],
    shouldPreloadIcons: true,
  });
  return selectedActionLabel;
};
