import { conditionalArr } from '../../array';
import { getColor } from '../../colors';
import {
  AnyElement,
  CellContainerShape,
  ContainerShape,
  ContainerStyle,
  isCellShape,
  Row,
} from './shapes';
import { TapProps } from './types';
import { getContainerSurroundingRows, parseColor } from './utils';

class Div extends ContainerShape {
  constructor(
    children: AnyElement[],
    style: ContainerStyle,
    tapProps: TapProps
  ) {
    super(children, style, tapProps);
  }

  render() {
    if (this.children.every(isCellShape)) {
      return new Row(this.children, this.style, this.tapProps).render();
    }
    if (this.children.some(isCellShape)) {
      throw new Error('Div contains a mix of cells and containers');
    }
    // Else, is a container for other containers/rows
    const {
      borderBottomRow,
      borderTopRow,
      marginBottomRow,
      marginTopRow,
      paddingBottomRow,
      paddingTopRow,
    } = getContainerSurroundingRows(
      this.style,
      parseColor(this.style.bgColor ?? getColor('bg'), this.style),
      this.tapProps
    );
    return conditionalArr([
      marginTopRow,
      borderTopRow,
      paddingTopRow,
      ...this.children.flatMap(child =>
        (child as CellContainerShape<AnyElement[]>).render()
      ),
      paddingBottomRow,
      borderBottomRow,
      marginBottomRow,
    ]);
  }
}

export default (children: AnyElement[], opts: ContainerStyle & TapProps = {}) =>
  new Div(children, opts, opts);
