import TextInput from '../../../../input/textInput';
import { notifyNow } from '../../../../notifications';
import { RowOpts } from '../../types';
import { Button } from '../_Button';
import _H3 from '../_H3';
import _HR from '../_HR';
import _TwoCol from '../_TwoCol';

type Opts<T extends string = string> = {
  value: T | null;
  opts: T[];
  onSelect: MapFn<T, any>;
  /** Needed to reflect changes in internal state in the parent table. */
  rerenderParent: NoParamFn<any>;
  /** Shown in dropdown row if nothing selected */
  defaultDropdownLabel?: string;
  /** Shown above dropdown, optional */
  label?: string;
  /** Optionally transform the option values when displayed */
  mapValue?: Identity<T>;
  /** Leave blank for default size */
  size?: 'lg';

  allowCustom?: boolean;
  customEntryLabel?: string;
  onAddCustom?: MapFn<string, any>;
};

/** State for open state is managed internally with this object */
type OpenStateManagement = {
  isOpen: boolean;
  setIsOpen: MapFn<boolean, void>;
};

const largePadding: Required<RowOpts>['padding'] = {
  paddingBottom: 'lg',
  paddingTop: 'lg',
};

//

const Controller = <T extends string>({
  value,
  defaultDropdownLabel = 'Select',
  isOpen,
  setIsOpen,
  mapValue,
  size,
}: Opts<T> & OpenStateManagement) =>
  Button({
    text: value ? mapValue?.(value) ?? value : defaultDropdownLabel,
    icon: isOpen ? 'dropup' : 'dropdown',
    isLarge: size === 'lg',
    onTap: () => setIsOpen(!isOpen),
  });

const Options = <T extends string>({
  opts,
  mapValue,
  value,
  onSelect,
  setIsOpen,
  size,
}: Opts<T> & OpenStateManagement) => {
  const isLarge = size === 'lg';
  return opts.flatMap(opt =>
    [
      _TwoCol({
        gutterLeft:
          opt === value ? { iconKey: 'checkmark' } : { isEmpty: true },
        main: {
          text: mapValue?.(opt) ?? opt,
          ...(isLarge && { textSize: 'lg' }),
        },
        onTap: () => {
          setIsOpen(false);
          onSelect(opt);
        },
        ...(isLarge && { rowHeight: 'lg', padding: largePadding }),
      }),
      _HR(),
    ].flat()
  );
};

const AddButton = <T extends string>({
  customEntryLabel = 'Add custom',
  onAddCustom,
  opts,
  size,
}: Opts<T>) =>
  Button({
    icon: 'add',
    text: customEntryLabel,
    isLarge: size === 'lg',
    isFaded: true,
    onTap: async () => {
      const newOpt = await TextInput(customEntryLabel);
      if (!newOpt) return;
      if (opts.some(opt => opt === newOpt)) {
        return notifyNow('Option already exists!');
      }
      onAddCustom?.(newOpt);
    },
  });

//

const openState = new Map<ID, boolean>();

const getDropdown = () => {
  // Unique ID per instantiation allows open state to persist.
  const id = UUID.string();
  openState.set(id, false);

  return <T extends string>(opts: Opts<T>) => {
    const { label, allowCustom, rerenderParent } = opts;

    const isOpen = openState.get(id)!;
    const openStateManagement: OpenStateManagement = {
      isOpen,
      setIsOpen: (val: boolean) => {
        openState.set(id, val);
        rerenderParent();
      },
    };
    const combinedOpts = { ...opts, ...openStateManagement };

    return [
      label && _H3({ label }),
      Controller(combinedOpts),
      isOpen && Options(combinedOpts),
      allowCustom && isOpen && AddButton(opts),
    ].flat();
  };
};

export default getDropdown;
