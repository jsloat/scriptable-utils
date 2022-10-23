/**
 * A quick way to create a simple IO to view a list of entities. It supports
 * bulk selection & performing actions on them, and a single-tap action.
 */

import { ExcludeFalsy } from '../common';
import {
  getTableActionCreator,
  getTableReducerCreator,
} from '../streams/reducerAction';
import { SFSymbolKey } from '../sfSymbols';
import {
  ButtonStack,
  ButtonStackOpt,
  H1,
  PaginationController,
  Spacer,
} from '../UITable/Row/templates';
import { H1Opts } from '../UITable/Row/templates/_H1';
import getTable from '../UITable/getTable';
import { ValidTableEl } from '../UITable/types';
import listChoose, { ListChooseOption } from '../input/listChoose';
import { Stream } from '../streams';
import { FilterRecord, FilterWithState } from './entityFilter/types';
import { getAppliedFiltersPredicate } from './entityFilter/utils';
import entityFilter from './entityFilter';
import { conditionalArr } from '../array';

export type BulkAction<E> = {
  icon?: SFSymbolKey;
  label: string;
  onTap: MapFn<E[], any>;
  shouldHide?: MapFn<E[], boolean>;
};

export type EntityId = string | number;

/** Opts passed to consumer from this view when generating an entity row. */
type EntityRowCallbackOpts<E> = {
  entity: E;
  onTap: NoParamFn<any>;
  onDoubleTap?: NoParamFn<any>;
  isSelected: boolean;
};

type EntityMap<E> = Map<EntityId, E>;

type State<E> = {
  selectedEntityIds: Set<EntityId>;
  appliedFilters: FilterWithState<E>[];
};

type $Props<E> = {
  entityMap: EntityMap<E>;
  allEntityIds: EntityId[];
  allEntitiesCount: number;
};

type CustomCTACallbackOpts<E> = $Props<E> & { rerender: NoParamFn<any> };

export type SelectableEntityBrowserOpts<Entity> = {
  /** Optionally run this code before launching the table */
  beforeLoad?: NoParamFn<any>;
  onClose?: MapFn<$Props<Entity>, any>;
  getEntities: NoParamFn<MaybePromise<Entity[]>>;
  getEntityRow: MapFn<EntityRowCallbackOpts<Entity>, ValidTableEl>;
  /** This action occurs when single tapping an entity. */
  openEntity: MapFn<Entity, any>;
  /** Available actions when bulk selecting entities. If not provided,
   * multiselect is not permitted. */
  bulkActions?: BulkAction<Entity>[];
  /** Optionally generate a header for the view with visible entities as input */
  headerOpts?: H1Opts;
  getCustomCTAs?: MapFn<
    CustomCTACallbackOpts<Entity>,
    Omit_<ButtonStackOpt, 'flavor'>[]
  >;
  /** Used to toggle selection status, etc. */
  getUniqueEntityId: MapFn<Entity, EntityId>;
  filters?: FilterRecord<Entity>;
};

//

const selectBulkAction = async <E>(
  entities: E[],
  bulkActions: SelectableEntityBrowserOpts<E>['bulkActions']
) => {
  if (!bulkActions) return;
  await listChoose(
    bulkActions
      .map<ListChooseOption | null>(({ label, onTap, shouldHide, icon }) =>
        shouldHide?.(entities)
          ? null
          : { label, icon, getValueOnTap: () => onTap(entities) }
      )
      .filter(ExcludeFalsy)
  );
};

const getDefaultProps$State = <E>(): $Props<E> => ({
  entityMap: new Map(),
  allEntityIds: [],
  allEntitiesCount: 0,
});

const generateProps = <E>(
  entities: E[],
  getUniqueEntityId: SelectableEntityBrowserOpts<E>['getUniqueEntityId']
) =>
  entities.reduce((acc, entity) => {
    const id = getUniqueEntityId(entity);
    acc.entityMap.set(id, entity);
    acc.allEntityIds.push(id);
    acc.allEntitiesCount++;
    return acc;
  }, getDefaultProps$State<E>());

const getFilteredEntities = async <E>(
  getEntities: SelectableEntityBrowserOpts<E>['getEntities'],
  appliedFilters: FilterWithState<E>[]
) => (await getEntities()).filter(getAppliedFiltersPredicate(appliedFilters));

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
  headerOpts,
  filters,
}: SelectableEntityBrowserOpts<E>) => {
  await beforeLoad?.();

  const ID = `selectable entity browser ${UUID.string()}`;

  const props$ = new Stream<$Props<E>>({
    defaultState: getDefaultProps$State(),
    name: ID,
  });
  const reloadEntities = async ({ appliedFilters }: State<E>) =>
    props$.setData(
      generateProps(
        await getFilteredEntities(getEntities, appliedFilters),
        getUniqueEntityId
      )
    );

  const { present, connect, getProps, getState, setState } = getTable<
    State<E>,
    void,
    $Props<E>
  >({ name: ID, connected$: { $: props$ } });

  const reducer = getTableReducerCreator<State<E>>();

  const handleToggleEntitySelect = reducer((state, id: EntityId) => {
    const clone = new Set([...state.selectedEntityIds]);
    clone.has(id) ? clone.delete(id) : clone.add(id);
    return { ...state, selectedEntityIds: clone };
  });

  const handleDeselectAll = reducer(state => ({
    ...state,
    selectedEntityIds: new Set(),
  }));

  const handleSetSelectedIds = reducer((state, ids: EntityId[]) => ({
    ...state,
    selectedEntityIds: new Set(ids),
  }));

  const action = getTableActionCreator(getState, setState);
  const toggleEntitySelect = action(handleToggleEntitySelect);
  const deselectAll = action(handleDeselectAll);
  const setSelectedIds = action(handleSetSelectedIds);

  //

  const Header = connect(() => H1(headerOpts || { title: 'Entity browser' }));

  const FilterCTAOpts = (): ButtonStackOpt | null => {
    if (!filters) return null;
    const { appliedFilters } = getState();
    return {
      text: 'Edit filters',
      icon: 'filter',
      ...(appliedFilters.length && { metadata: appliedFilters.length }),
      onTap: async () => {
        const newFilters = await entityFilter({
          getEntities,
          filters,
          getUniqueEntityId,
          initAppliedFilters: appliedFilters,
        });
        setState({ appliedFilters: newFilters });
        reloadEntities(getState());
      },
    };
  };

  const SelectionCTAOpts = (): ButtonStackOpt | null => {
    const { selectedEntityIds } = getState();
    const { allEntitiesCount, allEntityIds } = getProps();
    if (!(allEntitiesCount && bulkActions)) return null;
    const areAllSelected = selectedEntityIds.size === allEntitiesCount;
    return {
      text: areAllSelected ? 'Clear selection' : 'Select all',
      icon: areAllSelected ? 'cancel' : 'select_all',
      onTap: () =>
        areAllSelected ? deselectAll() : setSelectedIds(allEntityIds),
    };
  };

  const CTAs = connect(({ state }) => {
    const stackOpts = conditionalArr([
      FilterCTAOpts(),
      SelectionCTAOpts(),
      ...(getCustomCTAs
        ? getCustomCTAs({
            ...getProps(),
            rerender: () => reloadEntities(state),
          })
        : []),
    ]).map<ButtonStackOpt>(opt => ({
      ...opt,
      flavor: 'transparentWithBorder',
      isLarge: true,
    }));
    return stackOpts.length && ButtonStack(stackOpts);
  });

  const EntityRow = connect(({ state }, id: EntityId) => {
    const { selectedEntityIds } = state;
    const { entityMap } = getProps();
    const numSelected = selectedEntityIds.size;
    const isSelected = selectedEntityIds.has(id);
    const entity = entityMap.get(id)!;
    return [
      getEntityRow({
        entity,
        isSelected,
        onTap: async () => {
          if (numSelected) return toggleEntitySelect(id);
          await openEntity(entity);
          reloadEntities(state);
        },
        onDoubleTap: async () => {
          if (!numSelected) return setSelectedIds([id]);
          const isSelectingBulkAction = isSelected && numSelected > 1;
          if (isSelectingBulkAction) {
            const selectedEntities = [...selectedEntityIds].map(
              id => entityMap.get(id)!
            );
            await selectBulkAction(selectedEntities, bulkActions);
          } else await openEntity(entity);
          deselectAll();
          reloadEntities(state);
        },
      }),
      Spacer({ rowHeight: 1 }),
    ].flat();
  });

  const Pagination = connect(({ rerender }) =>
    PaginationController({
      getEntities: () => getProps().allEntityIds,
      getEntityRow: EntityRow,
      rerenderParent: rerender,
      name: ID,
    })
  );

  //

  const defaultState: State<E> = {
    selectedEntityIds: new Set(),
    appliedFilters: [],
  };

  await present({
    defaultState,
    beforeLoad: () => reloadEntities(defaultState),
    onDismiss: () => onClose?.(props$.getData()),
    render: () => [Header(), CTAs(), Spacer(), Pagination()],
  });
};
