import { isString } from '../common';
import Base from './Base';
import { Button } from './types';

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
  const { buttonTapped, cancelled } = await Base(
    title,
    [
      ...listOptions.map<Button>(strOrLV => ({
        label: isString(strOrLV) ? strOrLV : strOrLV.label,
      })),
      { isCancel: true },
    ],
    { message }
  );

  if (cancelled) {
    await onCancel?.();
    return null;
  }

  const matchingOption = listOptions.find(strOrLV =>
    isString(strOrLV)
      ? strOrLV === buttonTapped
      : strOrLV.label === buttonTapped
  )!;
  const returnValue = isString(matchingOption)
    ? matchingOption
    : matchingOption.value;
  await onOptionSelect?.(returnValue);
  return returnValue;
};

export default quickOptions;
