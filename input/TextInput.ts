import { conditionalArr } from '../array';
import { getRandomArrayItem } from '../common';
import { BUTTON_TEXTS } from '../privateConfig';
import Base from './Base';
import { TextInputOpts } from './types';

export default async (
  title = 'Enter text',
  {
    submitText = getRandomArrayItem(BUTTON_TEXTS),
    cancelText = 'Cancel',
    onSubmit = () => {},
    onCancel = () => {},
    message,
    initValue,
    placeholder,
    flavor,
  }: TextInputOpts = {}
) => {
  const clipboardValue = Pasteboard.paste();
  const USE_CLIPBOARD_LABEL = `📋 ${clipboardValue}`;
  const {
    textFieldValues: { inputText },
    cancelled,
    buttonTapped,
  } = await Base(
    title,
    conditionalArr([
      { isCancel: true, label: cancelText },
      clipboardValue && { label: USE_CLIPBOARD_LABEL },
      { label: submitText },
    ]),
    {
      message,
      textFields: { inputText: { placeholder, initValue, flavor } },
    }
  );

  const shouldUseClipboard = buttonTapped === USE_CLIPBOARD_LABEL;
  const resultText = (shouldUseClipboard && clipboardValue) || inputText;

  cancelled ? await onCancel() : await onSubmit(resultText);
  return cancelled ? '' : resultText;
};
