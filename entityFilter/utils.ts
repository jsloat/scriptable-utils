import { SFSymbolKey } from '../sfSymbols';
import { FlavorOption } from '../UITable/Row/templates';
import selectableEntityBrowser from '../views/selectableEntityBrowser';
import {
  AllFilters,
  AppliedFilter,
  Filter,
  LoadedFilterCounts,
  Props,
  State,
} from './types';

type AnyFilter = Filter<any> | AppliedFilter;

const areFiltersEqual = (a: AnyFilter, b: AnyFilter) =>
  a.label === b.label &&
  a.filterCagtegory === b.filterCagtegory &&
  a.icon === b.icon;

export const withoutFilter = <T extends AnyFilter>(
  filters: T[],
  filterToRemove: AnyFilter
) => filters.filter(f => !areFiltersEqual(f, filterToRemove));

export const findFilter = <T extends AnyFilter>(
  filters: T[],
  targetFilter: AnyFilter
) => filters.find(f => areFiltersEqual(f, targetFilter));

export const updateFilterInList = <T extends AnyFilter>(
  filters: T[],
  filterToUpdate: AnyFilter,
  updater: Identity<T>
) => filters.map(f => (areFiltersEqual(f, filterToUpdate) ? updater(f) : f));

//

export const getFilterPredicate = <E>(
  appliedFilter: AppliedFilter,
  allFilters: AllFilters<E>
) => {
  const { filterCagtegory, label, state: filterState } = appliedFilter;
  const catFilters = allFilters[filterCagtegory];
  if (!catFilters) {
    throw new Error(`Filter category ${filterCagtegory} not found`);
  }
  const filter = findFilter(catFilters, appliedFilter);
  if (!filter) throw new Error(`No filter with label ${label} found`);
  return (entity: E) => {
    if (!filterState) return true;
    const shouldInclude = filter.includeEntity(entity);
    return filterState === 'INCLUDE' ? shouldInclude : !shouldInclude;
  };
};

const getAppliedFiltersPredicate =
  <E>(appliedFilters: AppliedFilter[], allFilters: AllFilters<E>) =>
  (entity: E) =>
    appliedFilters.reduce(
      (acc, filter) => acc && getFilterPredicate(filter, allFilters)(entity),
      true
    );

export const getFilteredEntities = <E>(
  allEntities: E[],
  appliedFilters: AppliedFilter[],
  allFilters: AllFilters<E>
) => allEntities.filter(getAppliedFiltersPredicate(appliedFilters, allFilters));

/** For an unselected filter, this returns how many of the given entities
 * match it */
export const getUnappliedFilterCount = <E>(
  entities: E[],
  filter: AppliedFilter,
  allFilters: AllFilters<E>
) =>
  entities.filter(entity => getFilterPredicate(filter, allFilters)(entity))
    .length;

/** When initializing state, don't apply any filters whose state is unapplied */
export const removeUnappliedFilters = (filters: AppliedFilter[]) =>
  filters.filter(filter => filter.state !== null);

export const getFilterIcon = ({ icon, state }: AppliedFilter): SFSymbolKey => {
  switch (state) {
    case null:
      return icon ?? 'task_incomplete';
    case 'INCLUDE':
      return 'checkmark';
    case 'EXCLUDE':
      return 'cancel';
  }
};

/** Map filters to applied filters, using the current state values to populate
 * filter state. */
export const mapFiltersToAppliedFilters = <E>(
  filters: Filter<E>[],
  appliedFiltersInState: AppliedFilter[]
): AppliedFilter[] =>
  filters.map(f => {
    const inState = findFilter(appliedFiltersInState, f);
    return { ...f, state: inState?.state ?? null };
  });

export const loadFilterCounts = <E>(
  entities: E[],
  allFilters: AllFilters<E>
) => {
  const loadedFilterCounts: LoadedFilterCounts = {};
  entities.forEach(entity => {
    Object.entries(allFilters).forEach(([category, filters]) =>
      filters.forEach(filter => {
        loadedFilterCounts[category] = {
          ...(loadedFilterCounts[category] ?? {}),
        };
        const currVal = loadedFilterCounts[category]![filter.label];
        const wouldMatchFilter = filter.includeEntity(entity);
        if (wouldMatchFilter) {
          loadedFilterCounts[category]![filter.label] = (currVal ?? 0) + 1;
        }
      })
    );
  });
  return loadedFilterCounts;
};

export const viewEntities = async <E>(
  { viewEntityOpts, getEntities, filters }: Props<E>,
  { appliedFilters }: State,
  reloadProps: NoParamFn
) => {
  await selectableEntityBrowser({
    getEntities: async () =>
      (
        await getEntities()
      ).filter(getAppliedFiltersPredicate(appliedFilters, filters)),
    ...viewEntityOpts,
  });
  reloadProps();
};

export const getFilterButtonFlavor = (
  { state }: AppliedFilter,
  isDisabled: boolean
): FlavorOption => {
  if (isDisabled) return 'transparentWithBorder';
  switch (state) {
    case 'INCLUDE':
      return 'happy';
    case 'EXCLUDE':
      return 'danger';
    case null:
      return 'default';
  }
};
