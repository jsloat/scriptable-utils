import { conditionalArr } from '../array';
import {
  colorKeys,
  EnhancedColor,
  getColor,
  getEnhancedColor,
} from '../colors';
import { getReducerCreator, getTableActionCreator } from '../reducerAction';
import getTable from '../UITable/getTable';
import Row from '../UITable/Row';
import { Button, H1 } from '../UITable/Row/templates';
import textInput from './textInput';

type S = { selectedColor: EnhancedColor | 'ADD_CUSTOM' | null };

const { getState, setState, present, connect } = getTable<S>({
  name: 'chooseColor',
});

const reducer = getReducerCreator<S>();
const action = getTableActionCreator(getState, setState);

const handleSelectColor = reducer((state, selectedColor: EnhancedColor) => ({
  ...state,
  selectedColor,
}));
const selectColor = action(handleSelectColor);

const colorData = colorKeys.map(getEnhancedColor);

//

const Title = () => H1({ title: 'Choose color' });

const AddCustomCTA = () =>
  Button({
    text: 'Add custom',
    icon: 'add',
    dismissOnTap: true,
    onTap: () => setState({ selectedColor: 'ADD_CUSTOM' }),
  });

const IndividualColorRow = (
  colorData: EnhancedColor,
  textColor: Color,
  onTap: NoParamFn,
  dismissOnTap: boolean
) => {
  const { color, label, isDynamic } = colorData;
  return Row({
    content: [
      {
        text: conditionalArr([label, isDynamic && '(dynamic)'], ' '),
        color: textColor,
      },
    ],
    bgColor: color,
    rowHeight: 30,
    dismissOnTap,
    onTap,
  });
};

type ColorRowOpts = {
  colorData: EnhancedColor;
  onTap: NoParamFn;
  dismissOnTap?: boolean;
};
export const ColorRow = ({
  colorData,
  onTap,
  dismissOnTap = false,
}: ColorRowOpts) =>
  [
    IndividualColorRow(colorData, getColor('white'), onTap, dismissOnTap),
    IndividualColorRow(colorData, getColor('black'), onTap, dismissOnTap),
  ].flat();

const ColorRows = connect(() =>
  colorData.flatMap(color =>
    ColorRow({
      colorData: color,
      onTap: () => selectColor(color),
      dismissOnTap: true,
    })
  )
);

//

export default async () => {
  const { selectedColor } = await present({
    defaultState: { selectedColor: null },
    render: () => [Title(), AddCustomCTA(), ColorRows()],
  });
  if (selectedColor === 'ADD_CUSTOM') {
    const hexStr = await textInput('Enter hex w/o #');
    return hexStr
      ? { color: new Color(hexStr), label: hexStr, isDynamic: false }
      : null;
  }
  return selectedColor;
};
