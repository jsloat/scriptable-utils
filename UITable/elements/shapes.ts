import { conditionalArr } from '../../array';
import { getColor } from '../../colors';
import { isNumber } from '../../common';
import { BaseRow } from '../Row/base';
import {
  CascadingCellStyle,
  CascadingRowStyle,
  CascadingStyle,
  CellStyle,
  RowStyle,
  TapProps,
} from './types';
import {
  fillInCellWidthBlanks,
  getContainerSurroundingRows,
  normalizeCellWidthPercentages,
  parseColor,
  parsePercent,
  parseRowHeight,
  tapPropsToBaseRowOpts,
} from './utils';

/**
 * Inheritance  tree (read as "Cell is an Element")
 *
 * Element
 * |-- Cell
 * |-- CellContainer
 *    |-- Row
 *    |-- Container
 */

/**
 * Parent-child tree
 *
 * Container
 * |-- Container
 * |-- Cell
 * |-- Row
 *    |-- Cell
 */

abstract class Element<
  ValidParentType extends Element<any, Style, any>,
  Style extends AnyObj,
  Renders
> {
  protected parent: ValidParentType | null = null;
  style: Style;

  constructor(style: Style) {
    this.style = style;
  }

  setParent(parent: ValidParentType) {
    this.parent = parent;
    this.style = { ...this.parent.style, ...this.style };
  }

  // eslint-disable-next-line class-methods-use-this
  render(): Renders {
    throw new Error('Render not implemented');
  }
}

export type AnyElement = Element<any, any, any>;

//
//
//

export type CellShapeStyle = Pick<CascadingRowStyle, 'isFaded'> &
  CascadingCellStyle &
  CellStyle;

/** A cell within a `CellContainer`, laid out horizontally. This base class is
 * defined w/ text cells in mind; sub-class ImageCell is used for image use
 * cases. */
export abstract class CellShape extends Element<
  Row,
  CellShapeStyle,
  UITableCell
> {
  siblingIndex: number | null = null;

  constructor(style: CellShapeStyle) {
    super(style);
  }

  protected getWidthPercent() {
    if (!(this.parent && isNumber(this.siblingIndex))) {
      throw new Error(
        'Parent and siblingIndex must be registered before calculating cell width.'
      );
    }
    return this.parent.getCellWidthPercent(this.siblingIndex);
  }
}

export const isCellShape = (child: AnyElement): child is CellShape =>
  child instanceof CellShape;

//
//
//

/** A container may only serve to cascade style downward, or it may serve as a
 * row that has cells as children. Thus it must accept `RowStyle` as well */
export type ContainerStyle = CascadingStyle & RowStyle;

/** An element that can act as a container for `Cell`s (but could have other
 * child types). A `Cell` container evaluates to a UITableRow, and thus can have
 * onTap attributes. */
export abstract class CellContainerShape<
  ValidChildren extends AnyElement[] = AnyElement[]
> extends Element<ContainerShape, ContainerStyle, UITableRow[]> {
  protected children: ValidChildren;
  /** If children are cells, this will contain their normalized width percentages. */
  private childCellWidths: number[] | null = null;
  protected tapProps: TapProps;

  constructor(
    children: ValidChildren,
    style: ContainerStyle,
    tapProps: TapProps
  ) {
    super(style);
    this.children = children;
    this.children.forEach((child, i) => {
      child.setParent(this);
      if (isCellShape(child)) child.siblingIndex = i;
    });
    if (this.children.every(isCellShape)) {
      this.childCellWidths = normalizeCellWidthPercentages(
        fillInCellWidthBlanks(
          this.children.map(cell => {
            const width = cell.style.width;
            return width ? parsePercent(width) : width;
          })
        )
      );
    }
    this.tapProps = tapProps;
  }

  getCellWidthPercent(index: number) {
    if (!this.childCellWidths) {
      throw new Error('Attempting to fetch cell width, but it is not defined');
    }
    const widthPercent = this.childCellWidths[index];
    if (!isNumber(widthPercent)) throw new Error('Invalid index');
    return widthPercent;
  }
}

//
//
//

export class Row extends CellContainerShape<CellShape[]> {
  constructor(
    children: CellShape[],
    style: ContainerStyle,
    tapProps: TapProps
  ) {
    super(children, style, tapProps);
  }

  render() {
    // Defined here to it will be dynamic with rerenders
    const fallbackBG = getColor('bg');
    const { bgColor = fallbackBG } = this.style;
    const cells = this.children.map(child => child.render());
    const contentBgColor = parseColor(bgColor, this.style);
    const mainRow = BaseRow({
      cells,
      height: parseRowHeight(this.style),
      bgColor: parseColor(bgColor, this.style),
      ...tapPropsToBaseRowOpts(this.tapProps),
    });
    const {
      borderBottomRow,
      borderTopRow,
      marginBottomRow,
      marginTopRow,
      paddingBottomRow,
      paddingTopRow,
    } = getContainerSurroundingRows(this.style, contentBgColor, this.tapProps);
    return conditionalArr([
      marginTopRow,
      borderTopRow,
      paddingTopRow,
      mainRow,
      paddingBottomRow,
      borderBottomRow,
      marginBottomRow,
    ]);
  }
}

//
//
//

/** A container for any type of element. If its children are `Cell`s, the
 * container acts as their parent row. */
export abstract class ContainerShape extends CellContainerShape<AnyElement[]> {
  constructor(
    children: AnyElement[],
    style: ContainerStyle,
    tapProps: TapProps
  ) {
    super(children, style, tapProps);
  }
}
