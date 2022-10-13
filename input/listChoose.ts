import { SFSymbolKey } from '../sfSymbols';
import { Button, H1, HR, IconRow, Spacer } from '../UITable/Row/templates';
import { isString } from '../common';
import textInput from './textInput';
import { compose, filter, map, toArray } from '../arrayTransducers';
import getTable from '../UITable/getTable';

export type ListChooseOption<
  Value = unknown,
  Label extends string = Value extends string ? Value : string
> = {
  label?: Label;
  icon?: SFSymbolKey;
  /** CTA options behave like any other, but have a more prominent appearance. */
  isCTA?: boolean;
  color?: Color;
} & RequireOnlyOne<{
  value: Value;
  getValueOnTap: () => MaybePromise<Value | null>;
}>;

type ParsedOption = MakeSomeReqd<ListChooseOption, 'icon' | 'label'>;

type ListChooseOpts<Returns = any> = {
  title?: string;
  message?: string;
  onOptionSelect?: (result: Returns) => any;
  onCancel?: () => any;
  /** NB: custom responses will be cast as the expected return type (which
   * extends string), but will not be bound to anything beyond being
   * string-type. Use with caution. */
  allowCustom?: boolean;
  onCustomResponseCreation?: (customResponse: string) => any;
  /** If provided, use this icon as the default, unless an icon is provided in a
   * ListChooseOption */
  fallbackIcon?: SFSymbolKey;
};

type ListChooseOptsWithCustom<Returns = any> = ListChooseOpts<Returns> & {
  allowCustom: true;
};

type ListChoose = {
  /** Non-string value, with option for custom response (string) */
  <Value, Label extends string = string>(
    listOptions: ListChooseOption<Value, Label>[],
    opts: ListChooseOptsWithCustom<Value>
    // Custom responses are returned as string values
  ): Promise<Value extends infer U ? U | string | null : Value | string | null>;

  /** Non-string value */
  <Value, Label extends string = string>(
    listOptions: ListChooseOption<Value, Label>[],
    opts?: ListChooseOpts<Value>
  ): Promise<Value extends infer U ? U | null : Value | null>;

  /** String value, with option for custom response (string) */
  <Value extends string = string, Label extends string = Value>(
    listOptions: Label[],
    opts: ListChooseOptsWithCustom<Label>
  ): Promise<Label | string | null>;

  /** String value */
  <Value extends string = string, Label extends string = Value>(
    listOptions: Label[],
    opts?: ListChooseOpts<Label>
  ): Promise<Label | null>;
};

type TableState = RequireOnlyOne<{
  selectedOption: any;
  getCustomResponse: boolean;
  getValueOnTap: () => MaybePromise<any>;
}>;

//

const isOption = (
  option: string | ListChooseOption
): option is ListChooseOption => !isString(option);

const optionToParsedOption = (
  option: ListChooseOption,
  fallbackIcon?: SFSymbolKey
): ParsedOption => ({
  ...option,
  icon: option.icon || fallbackIcon || 'chevron_right',
  label: option.label || String(option.value),
});

const listChoose: ListChoose = async (
  listOptions: (string | ListChooseOption)[],
  {
    title = 'Choose option',
    message,
    onOptionSelect,
    onCancel,
    allowCustom,
    onCustomResponseCreation,
    fallbackIcon,
  }: ListChooseOpts = {}
) => {
  const { present, connect } = getTable<TableState>({ name: 'list choose' });

  const ctaOptions = toArray(
    listOptions,
    compose(
      filter(isOption),
      filter(option => option.isCTA),
      map(option => optionToParsedOption(option, fallbackIcon))
    )
  );

  const parsedNonCtaOptions = toArray(
    listOptions,
    compose(
      map(
        (option): ListChooseOption =>
          isString(option) ? { label: option, value: option } : option
      ),
      filter(option => !option.isCTA),
      map(option => optionToParsedOption(option, fallbackIcon))
    )
  );

  //

  const AddCustomCTA = connect(
    ({ setState }) =>
      allowCustom &&
      Button({
        text: 'Custom response',
        icon: 'add',
        dismissOnTap: true,
        onTap: () => setState({ getCustomResponse: true }),
      })
  );

  const Divider = () => HR({ dim: 0.4 });

  const OptionRow = connect(
    (
      { setState },
      { isCTA, label, icon, value, getValueOnTap, color }: ParsedOption
    ) => {
      const onTap = () =>
        setState(getValueOnTap ? { getValueOnTap } : { selectedOption: value });
      const sharedProps = {
        label,
        text: label,
        dismissOnTap: true,
        onTap,
        accentColor: color,
      };
      return [
        isCTA
          ? Button({ icon, ...sharedProps })
          : IconRow({ icon, ...sharedProps }),
        !isCTA && [Spacer(), Divider(), Spacer()].flat(),
      ].flat();
    }
  );

  //

  const { selectedOption, getCustomResponse, getValueOnTap } = await present({
    defaultState: {} as TableState,
    render: () => [
      H1({ title, ...(message && { subtitle: message }) }),
      AddCustomCTA(),
      ...ctaOptions.map(OptionRow),
      Spacer(),
      Divider(),
      Spacer(),
      ...parsedNonCtaOptions.map(OptionRow),
    ],
  });

  let result;
  if (selectedOption) result = selectedOption;
  else if (getCustomResponse) {
    const customResponse = await textInput('Custom response?');
    if (customResponse) await onCustomResponseCreation?.(customResponse);
    result = customResponse || null;
  } else if (getValueOnTap) result = await getValueOnTap();

  await (result ? onOptionSelect?.(result) : onCancel?.());
  return result;
};

export default listChoose;
