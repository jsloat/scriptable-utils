import { isString, objectFromEntries } from '../common';
import alert from './alert';
import { Button } from './types';

const CANCEL_BUTTON_TEXT = 'Cancel';

type SharedOpts<Returns> = {
  title?: string;
  message?: string;
  onOptionSelect?: (result: Returns) => any;
  onCancel?: () => any;
};

type QuickOptions = {
  /** String options */
  <Label extends string>(
    listOptions: Label[],
    opts?: SharedOpts<Label>
  ): Promise<Label | null>;

  /** Labeled-value options */
  <Label extends string, Value>(
    listOptions: LabeledValue<Value, Label>[],
    opts?: SharedOpts<Value>
  ): Promise<Value | null>;
};

const quickOptions: QuickOptions = async (
  listOptions: (string | LabeledValue<any>)[],
  {
    title = 'Select option',
    message,
    onOptionSelect,
    onCancel,
  }: SharedOpts<any> = {}
): Promise<any> => {
  const optionButtonEntries = listOptions.map<[string, Button]>(strOrLV => [
    isString(strOrLV) ? strOrLV : strOrLV.label,
    {},
  ]);
  const { tappedButtonText } = await alert({
    title,
    message,
    buttons: {
      ...objectFromEntries(optionButtonEntries),
      [CANCEL_BUTTON_TEXT]: { isCancel: true },
    },
  });
  const cancelled = tappedButtonText === CANCEL_BUTTON_TEXT;

  if (cancelled) {
    await onCancel?.();
    return null;
  }

  const matchingOption = listOptions.find(strOrLV =>
    isString(strOrLV)
      ? strOrLV === tappedButtonText
      : strOrLV.label === tappedButtonText
  )!;
  const returnValue = isString(matchingOption)
    ? matchingOption
    : matchingOption.value;
  await onOptionSelect?.(returnValue);
  return returnValue;
};

export default quickOptions;
