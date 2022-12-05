import { getColor } from '../../colors';
import { ContainerStyle, Row } from './shapes';

type HRStyle = Pick<
  ContainerStyle,
  'color' | 'height' | 'marginBottom' | 'marginTop'
>;

class HR extends Row {
  constructor({
    color = getColor('hr'),
    height = 1,
    marginBottom = 8,
    marginTop = 8,
  }: HRStyle) {
    super([], { bgColor: color, height, marginBottom, marginTop }, {});
  }
}

export default (style: HRStyle = {}) => new HR(style);
