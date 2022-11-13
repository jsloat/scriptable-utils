// Full-screen, no-distraction buttons

import { isLastArrIndex } from '../array';
import { getColor } from '../colors';
import { getScreenHeightMeasurements } from '../serviceRegistry';
import { getSfSymbolImg, SFSymbolKey } from '../sfSymbols';
import getTable from '../UITable/getTable';
import { BaseCell, BaseRow } from '../UITable/Row/base';
import {
  FlavorOption,
  parseFlavor,
  whichFlavorIsBolder,
} from '../UITable/Row/flavors';
import { HR } from '../UITable/Row/templates';
import { getDeviceOrientation } from '../UITable/utils';

export type FullscreenOptNode = {
  label: string;
  icon: SFSymbolKey;
  flavor?: FlavorOption;
} & RequireOnlyOne<{ action: NoParamFn; children: FullscreenOptNode[] }>;

type State = { nodes: FullscreenOptNode[] };

const DIVIDER_HEIGHT = 2;

const getOptionHeight = (totalNodesShown: number) => {
  // One HR between each option, and one at the top and bottom
  const numOfHRs = totalNodesShown + 1;
  const totalHRHeight = numOfHRs * DIVIDER_HEIGHT;
  // this logic to get height should be abstracted
  const totalHeight =
    getScreenHeightMeasurements()[Device.model()]!.notFullscreen[
      getDeviceOrientation()
    ];
  const remainingHeight = totalHeight - totalHRHeight;
  return Math.floor(remainingHeight / totalNodesShown);
};

const getHRFlavor = (
  aboveNode: FullscreenOptNode | undefined,
  belowNode: FullscreenOptNode | undefined
) => {
  if (!(aboveNode || belowNode)) {
    throw new Error('Must pass at least one CommandNode');
  }
  if (!(aboveNode && belowNode)) {
    return parseFlavor((aboveNode || belowNode)!.flavor);
  }
  return whichFlavorIsBolder(aboveNode.flavor, belowNode.flavor);
};

const Divider = (color: Color) =>
  HR({
    height: DIVIDER_HEIGHT,
    padding: { paddingTop: 0, paddingBottom: 0 },
    color,
  });

//

export default (initNodes: FullscreenOptNode[]) => {
  const { present, connect } = getTable<State>({
    name: `fullscreenOpts ${UUID.string()}`,
  });

  //

  const OptionRow = connect(
    (
      { setState },
      {
        label,
        action,
        children,
        icon,
        flavor = 'transparentWithBorder',
      }: FullscreenOptNode,
      totalNodesShown: number
    ) => {
      const { bgColor, color, fontConstructor } = parseFlavor(flavor);
      return BaseRow({
        bgColor: bgColor as Color,
        dismissTableOnTap: !children,
        height: getOptionHeight(totalNodesShown),
        onTap: () => {
          if (children) return setState({ nodes: children });
          if (action) return action();
        },
        cells: [
          BaseCell({ type: 'text', value: '', widthWeight: 3 }),
          BaseCell({
            type: 'image',
            value: getSfSymbolImg(icon, color),
            align: 'right',
          }),
          BaseCell({
            type: 'text',
            value: label,
            align: 'center',
            color,
            font: fontConstructor?.(30) ?? Font.title1(),
            widthWeight: 5,
          }),
          BaseCell({ type: 'text', value: '', widthWeight: 3 }),
        ],
      });
    }
  );

  const OptionRows = connect(({ state: { nodes } }) =>
    nodes.flatMap((node, i, arr) => {
      const nodeAbove = arr[i - 1];
      // Top HR takes the flavor of the bolder of the nodes
      const topHRFlavor = getHRFlavor(nodeAbove, node);
      // Bottom HR only shown for last node, always takes own node's flavor.
      const bottomHRFlavor = parseFlavor(node.flavor);
      const topHRColor = topHRFlavor.color ?? getColor('primaryTextColor');
      const bottomHRColor =
        bottomHRFlavor.color ?? getColor('primaryTextColor');
      const shouldShowBottomHR = isLastArrIndex(i, arr);
      return [
        Divider(topHRColor),
        OptionRow(node, nodes.length),
        shouldShowBottomHR && Divider(bottomHRColor),
      ].flat();
    })
  );

  //

  return present({
    defaultState: { nodes: initNodes },
    render: () => [OptionRows()],
  });
};
