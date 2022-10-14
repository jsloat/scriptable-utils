/**
 * A quick way to create a simple IO to view a list of entities. It supports
 * bulk selection & performing actions on them, and a single-tap action.
 */

import { toggleArrayItem } from '../array';
import { ExcludeFalsy } from '../common';
import {
  getTableActionCreator,
  getTableReducerCreator,
} from '../streams/reducerAction';
import { SFSymbolKey } from '../sfSymbols';
import {
  Button,
  ButtonStack,
  ButtonStackOpt,
  H1,
  Spacer,
} from '../UITable/Row/templates';
import { H1Opts } from '../UITable/Row/templates/_H1';
import getTable from '../UITable/getTable';
import { ValidTableEl } from '../UITable/types';
import listChoose, { ListChooseOption } from '../input/listChoose';

export type BulkAction<E> = {
  icon?: SFSymbolKey;
  label: string;
  onTap: MapFn<E[], any>;
  shouldHide?: MapFn<E[], boolean>;
};

type EntityId = string | number;

/** Opts passed to consumer from this view when generating an entity row. */
type EntityRowCallbackOpts<E> = {
  entity: E;
  onTap: NoParamFn<any>;
  onDoubleTap?: NoParamFn<any>;
  isSelected: boolean;
};

type CustomCTACallbackOpts<E> = { entities: E[]; rerender: NoParamFn<any> };

export type SelectableEntityBrowserOpts<Entity> = {
  /** Optionally run this code before launching the table */
  beforeLoad?: NoParamFn<any>;
  onClose?: MapFn<Entity[], any>;
  getEntities: NoParamFn<MaybePromise<Entity[]>>;
  getEntityRow: MapFn<EntityRowCallbackOpts<Entity>, ValidTableEl>;
  /** This action occurs when single tapping an entity. */
  openEntity: MapFn<Entity, any>;
  /** Available actions when bulk selecting entities. If not provided,
   * multiselect is not permitted. */
  bulkActions?: BulkAction<Entity>[];
  /** Optionally generate a header for the view with visible entities as input */
  getHeaderOpts?: MapFn<Entity[], H1Opts>;
  getCustomCTAs?: MapFn<CustomCTACallbackOpts<Entity>, ButtonStackOpt[]>;
  /** Used to toggle selection status, etc. */
  getUniqueEntityId: MapFn<Entity, EntityId>;
};

type State = { selectedEntityIds: EntityId[] };
type Props<E> = { entities: E[] };

//

export default async <E>({
  beforeLoad,
  onClose,
  getEntities,
  getEntityRow,
  openEntity,
  bulkActions,
  getUniqueEntityId,
  getCustomCTAs,
  getHeaderOpts,
}: SelectableEntityBrowserOpts<E>) => {
  await beforeLoad?.();

  const { present, connect, getProps, getState, setState } = getTable<
    State,
    Props<E>
  >({ name: `selectable entity browser ${UUID.string()}` });

  const action = getTableActionCreator(getState, setState);
  const reducer = getTableReducerCreator<State>();

  //

  const toggleEntitySelect = action(
    reducer((state, entity: E) => ({
      ...state,
      selectedEntityIds: toggleArrayItem(
        state.selectedEntityIds,
        getUniqueEntityId(entity)
      ),
    }))
  );

  const deselectAll = action(
    reducer(state => ({
      ...state,
      selectedEntityIds: [],
    }))
  );

  const selectFirstEntity = action(
    reducer((state, entity: E) => ({
      ...state,
      selectedEntityIds: [getUniqueEntityId(entity)],
    }))
  );

  const selectAll = action(
    reducer(state => ({
      ...state,
      selectedEntityIds: getProps().entities.map(getUniqueEntityId),
    }))
  );

  //

  const selectBulkAction = () => {
    if (!bulkActions) return;
    const { selectedEntityIds } = getState();
    const { entities } = getProps();
    const selectedEntities = entities.filter(e =>
      selectedEntityIds.some(selectedId => selectedId === getUniqueEntityId(e))
    );
    listChoose(
      bulkActions
        .map<ListChooseOption | null>(({ label, onTap, shouldHide, icon }) =>
          shouldHide?.(selectedEntities)
            ? null
            : { label, icon, getValueOnTap: () => onTap(entities) }
        )
        .filter(ExcludeFalsy)
    );
  };

  //

  const Header = connect(() =>
    H1(getHeaderOpts?.(getProps().entities) || { title: 'Entity browser' })
  );

  const SelectionCTA = connect(({ state: { selectedEntityIds } }) => {
    const { entities } = getProps();
    if (!(entities.length && bulkActions)) return null;
    const areAllSelected = selectedEntityIds.length === entities.length;
    return Button({
      text: areAllSelected ? 'Clear selection' : 'Select all',
      icon: areAllSelected ? 'cancel' : 'select_all',
      onTap: areAllSelected ? deselectAll : selectAll,
    });
  });

  const CustomCTAs = connect(({ rerender }) => {
    if (!getCustomCTAs) return null;
    return ButtonStack(
      getCustomCTAs({ entities: getProps().entities, rerender: rerender })
    );
  });

  const EntityRows = connect(({ state: { selectedEntityIds }, rerender }) =>
    getProps().entities.flatMap(e => {
      const numSelected = selectedEntityIds.length;
      const id = getUniqueEntityId(e);
      const isSelected = selectedEntityIds.includes(id);
      return [
        getEntityRow({
          entity: e,
          isSelected,
          onTap: async () => {
            if (numSelected) toggleEntitySelect(e);
            await openEntity(e);
            rerender();
          },
          onDoubleTap: () => {
            if (numSelected) {
              isSelected && numSelected > 1
                ? selectBulkAction()
                : openEntity(e);
              deselectAll();
            } else {
              selectFirstEntity(e);
            }
          },
        }),
        Spacer({ rowHeight: 1 }),
      ].flat();
    })
  );

  //

  await present({
    defaultState: { selectedEntityIds: [] },
    loadProps: async () => ({ entities: await getEntities() }),
    onDismiss: async () => onClose?.(await getEntities()),
    render: () => [
      Header(),
      CustomCTAs(),
      SelectionCTA(),
      Spacer(),
      EntityRows(),
    ],
  });
};
