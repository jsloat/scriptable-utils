import { ExcludeFalsy, isString, objectFromEntries } from '../common';
import alert from './alert';
import { AlertOpts, Button } from './types';

const CANCEL_BUTTON_TEXT = 'Cancel';

type SharedOpts<Returns> = Pick<
  Partial<AlertOpts>,
  'title' | 'message' | 'presentAsSheet'
> & { onOptionSelect?: MapFn<Returns, any>; onCancel?: NoParamFn };

type QuickOptions = {
  /** String options */
  <Label extends string>(
    listOptions: Label[],
    opts?: SharedOpts<Label>
  ): Promise<Label | null>;

  /** Labeled-value options */
  <Label extends string, Value>(
    listOptions: (LabeledValue<Value, Label> | Falsy)[],
    opts?: SharedOpts<Value>
  ): Promise<Value | null>;
};

const quickOptions: QuickOptions = async (
  listOptions: (string | LabeledValue<any> | Falsy)[],
  {
    title = 'Select option',
    onOptionSelect,
    onCancel,
    ...alertOpts
  }: SharedOpts<any> = {}
): Promise<any> => {
  const validListOptions = listOptions.filter(ExcludeFalsy);
  if (!validListOptions.length) return null;
  const optionButtonEntries = validListOptions.map<[string, Button]>(
    strOrLV => [isString(strOrLV) ? strOrLV : strOrLV.label, {}]
  );
  if (!optionButtonEntries.length) return null;
  const { tappedButtonText } = await alert({
    title,
    ...alertOpts,
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

  const matchingOption = validListOptions.find(strOrLV =>
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
