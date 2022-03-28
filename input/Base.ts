import { safeArrLookup } from '../common';
import { shortSwitch } from '../flow';
import { range } from '../object';
import { BaseOpts, Button, ButtonType, TextField } from './types';

const { CANCEL, ACTION } = ButtonType;

/** Mapping user prefs to predicates to determine what type of button to add */
const parseButton = ({ label, color, isCancel }: Button) => {
  const buttonType = isCancel ? CANCEL : ACTION;
  const fallbackLabel = buttonType === CANCEL ? 'Cancel' : 'OK';
  const fallbackColor = isCancel ? 'red' : 'black';
  return {
    label: label || fallbackLabel,
    buttonType,
    color: color || fallbackColor,
  };
};

const getTappedButtonResults = (
  enhancedButtons: ReturnType<typeof parseButton>[],
  tappedButtonIndex: number
) => {
  if (tappedButtonIndex === -1)
    return { tappedButtonLabel: null, cancelled: true };
  const { label, buttonType } = safeArrLookup(
    enhancedButtons,
    tappedButtonIndex,
    'getTappedButtonResults'
  );
  const cancelled = buttonType === CANCEL;
  return { tappedButtonLabel: label, cancelled };
};

export default async <T extends Record<string, TextField>>(
  title: string,
  buttons: Button[],
  { message, textFields, presentAsSheet = false }: BaseOpts<T> = {}
) => {
  const prompt = new Alert();
  prompt.title = title;
  if (message) prompt.message = message;

  const textFieldLabels = textFields ? Object.keys(textFields) : [];

  if (textFields) {
    Object.values(textFields).forEach(
      ({
        initValue = '',
        placeholder = '',
        align = 'left',
        flavor = 'default',
        font = Font.thinMonospacedSystemFont(16),
        textColor,
      }) => {
        const field = prompt.addTextField(placeholder, initValue);
        shortSwitch(align, {
          left: () => field.leftAlignText(),
          center: () => field.centerAlignText(),
          right: () => field.rightAlignText(),
        })();
        shortSwitch(flavor, {
          default: () => field.setDefaultKeyboard(),
          email: () => field.setEmailAddressKeyboard(),
          number: () => field.setDecimalPadKeyboard(),
          phone: () => field.setPhonePadKeyboard(),
          url: () => field.setURLKeyboard(),
        })();
        field.font = font;
        if (textColor) field.textColor = textColor;
      }
    );
  }

  const parsedButtons = buttons.map(parseButton);
  parsedButtons.forEach(({ label, buttonType, color }) => {
    switch (buttonType) {
      case ACTION: {
        if (color === 'red') prompt.addDestructiveAction(label);
        else prompt.addAction(label);
        break;
      }
      case CANCEL: {
        if (color === 'red') prompt.addDestructiveAction(label);
        else prompt.addAction(label);
      }
    }
  });

  const tappedButtonIndex = presentAsSheet
    ? await prompt.presentSheet()
    : await prompt.present();
  const { cancelled, tappedButtonLabel } = getTappedButtonResults(
    parsedButtons,
    tappedButtonIndex
  );

  const textFieldValues: Record<keyof T, string> = textFields
    ? range(0, textFieldLabels.length - 1).reduce(
        (acc, i) => ({
          ...acc,
          [safeArrLookup(textFieldLabels, i, 'Base/textFieldValues')]:
            prompt.textFieldValue(i),
        }),
        {} as Record<keyof T, string>
      )
    : ({} as Record<keyof T, string>);

  return {
    textFieldValues,
    buttonTapped: tappedButtonLabel,
    cancelled,
  };
};
