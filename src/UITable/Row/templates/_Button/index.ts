import { conditionalArr } from '../../../../array';
import { ExcludeFalsy } from '../../../../common';
import { Button as NewButton, Div } from '../../../elements';
import presetStyles, { FlavorKey } from '../../../elements/presetStyles';
import { ButtonOpts, ButtonStackOpt } from './types';

export { ButtonOpts, ButtonStackOpt } from './types';
export { getButtonHeight } from './utils';

export const Button = ({
  flavor,
  text,
  dismissOnTap,
  icon = 'dot_in_circle',
  isDisabled,
  isFaded,
  isLarge,
  metadata,
  mode,
  onDoubleTap,
  onTap,
  onTripleTap,
}: ButtonOpts) =>
  NewButton({
    ...(flavor && presetStyles().flavors[flavor as FlavorKey]),
    text: conditionalArr([text, metadata && `(${metadata})`]).join(' '),
    icon,
    isDisabled,
    dismissOnTap,
    isFaded,
    isLarge,
    mode,
    onTap,
    onDoubleTap,
    onTripleTap,
  });

export const ButtonStack = (
  opts: (ButtonStackOpt | Falsy)[],
  commonOpts?: Partial<ButtonStackOpt>
) =>
  Div(
    opts
      .filter(ExcludeFalsy)
      .map(buttonOpts => Button({ ...buttonOpts, ...commonOpts }))
  );
