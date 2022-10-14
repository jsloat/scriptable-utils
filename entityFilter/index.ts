import { conditionalArr } from '../array';
import { Stream } from '../streams';
import { getTableActionCreator } from '../streams/reducerAction';
import getTable from '../UITable/getTable';
import {
  ButtonStack,
  ButtonStackOpt,
  H1,
  H2,
  Spacer,
} from '../UITable/Row/templates';
import {
  handleClearFilters,
  handleCycleFilterState,
  handleToggleFilterCategoryCollapse,
} from './reducers';
import { $Props, AppliedFilter, Opts, Props, State } from './types';
import {
  getFilterButtonFlavor,
  getFilteredEntities,
  getFilterIcon,
  loadFilterCounts,
  mapFiltersToAppliedFilters,
  removeUnappliedFilters,
  viewEntities,
} from './utils';

export default <E>(opts: Opts<E>) => {
  const { initAppliedFilters, getEntities, filters, beforeLoad, onDismiss } =
    opts;

  const props$ = new Stream<$Props<E>>({
    defaultState: { allEntities: [], filteredEntities: [], filterCounts: {} },
  });
  const reloadProps$ = async () => {
    const allEntities = await getEntities();
    const filteredEntities = getFilteredEntities(
      allEntities,
      getState().appliedFilters,
      filters
    );
    props$.setData({
      allEntities,
      filteredEntities,
      filterCounts: loadFilterCounts(filteredEntities, filters),
    });
  };

  const tableName = `entityFilter ${UUID.string()}`;
  const { present, connect, getState, setState, getProps } = getTable<
    State,
    Props<E>,
    $Props<E>
  >({
    name: tableName,
    connected$: { $: props$ },
  });

  const action = getTableActionCreator(getState, setState);
  const withReload =
    <A extends any[]>(fn: (...args: A) => any) =>
    (...args: A) => {
      fn(...args);
      reloadProps$();
    };
  const cycleFilterState = withReload(action(handleCycleFilterState));
  const clearFilters = withReload(action(handleClearFilters));
  const toggleFilterCategoryCollapse = action(
    handleToggleFilterCategoryCollapse
  );

  //

  const Title = connect(() => {
    const { title, allEntities, filteredEntities } = getProps();
    return H1({
      title: title ?? 'Filter entities',
      subtitle: `${filteredEntities.length}/${allEntities.length}`,
    });
  });

  const CTAs = connect(({ state }) => {
    const numFilters = state.appliedFilters.length;
    return ButtonStack(
      [
        {
          text: 'View entities',
          icon: 'dash_list',
          onTap: () => viewEntities(getProps(), state, reloadProps$),
        },
        {
          text: 'Clear filters',
          icon: 'filter',
          onTap: clearFilters,
          isDisabled: !numFilters,
        },
      ],
      { flavor: 'transparentWithBorder', isLarge: true }
    );
  });

  const getFilterRowOpts = (filter: AppliedFilter): ButtonStackOpt => {
    const { state, label, filterCagtegory } = filter;
    const { filterCounts } = getProps();
    const isApplied = state !== null;
    const count = filterCounts[filterCagtegory]?.[label];
    const isDisabled = !count && !isApplied;
    return {
      text: label,
      icon: getFilterIcon(filter),
      flavor: getFilterButtonFlavor(filter, isDisabled),
      ...(count && !isApplied && { metadata: count }),
      onTap: () => cycleFilterState(filter),
      isDisabled,
    };
  };

  const FilterCategoryHeader = connect(
    (_, category: string, isCollapsed: boolean) =>
      H2({
        label: category,
        iconKey: isCollapsed ? 'expand' : 'collapse',
        padding: { paddingBottom: 0, paddingTop: 0 },
        onTap: () => toggleFilterCategoryCollapse(category),
      })
  );

  const FilterCategory = connect(
    (
      { state: { collapsedFilterCategories, appliedFilters } },
      category: string
    ) => {
      const isCollapsed = collapsedFilterCategories.includes(category);
      const filters = getProps().filters[category]!;
      const applyableFilters = mapFiltersToAppliedFilters(
        filters,
        appliedFilters
      );
      return conditionalArr([
        FilterCategoryHeader(category, isCollapsed),
        !isCollapsed && ButtonStack(applyableFilters.map(getFilterRowOpts)),
        Spacer(),
        Spacer(),
      ]).flat();
    }
  );

  const FilterCategories = connect(() =>
    Object.keys(getProps().filters).flatMap(FilterCategory)
  );

  //

  present({
    beforeLoad: () => {
      beforeLoad?.();
      reloadProps$();
    },
    onDismiss,
    defaultState: {
      appliedFilters: removeUnappliedFilters(initAppliedFilters ?? []),
      collapsedFilterCategories: [],
    },
    loadProps: () => opts,
    render: () => [
      Title(),
      CTAs(),
      Spacer(),
      Spacer(),
      Spacer(),
      FilterCategories(),
    ],
  });
};
