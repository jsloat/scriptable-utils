import { toggleArrayItem } from '../array';
import { cycle } from '../flow';
import { getTableReducerCreator } from '../streams/reducerAction';
import { AppliedFilter, AppliedFilterState, State } from './types';
import { findFilter, updateFilterInList, withoutFilter } from './utils';

const reducer = getTableReducerCreator<State>();

const addFilterToState = reducer((state, filter: AppliedFilter) => ({
  ...state,
  appliedFilters: [...state.appliedFilters, filter],
}));

const removeFilterFromState = reducer((state, filter: AppliedFilter) => ({
  ...state,
  appliedFilters: withoutFilter(state.appliedFilters, filter),
}));

const updateFilterState = reducer(
  (state, filter: AppliedFilter, newState: AppliedFilterState) => ({
    ...state,
    appliedFilters: updateFilterInList(state.appliedFilters, filter, f => ({
      ...f,
      state: newState,
    })),
  })
);

export const handleCycleFilterState = reducer(
  (state, targetFilter: AppliedFilter) => {
    const newFilterState = cycle<AppliedFilterState>(targetFilter.state, [
      'INCLUDE',
      'EXCLUDE',
      null,
    ]);
    const filterInState = findFilter(state.appliedFilters, targetFilter);
    const r = !filterInState
      ? addFilterToState({ ...targetFilter, state: newFilterState })
      : newFilterState === null
      ? removeFilterFromState(targetFilter)
      : updateFilterState(targetFilter, newFilterState);
    return r(state);
  }
);

export const handleClearFilters = reducer(state => ({
  ...state,
  appliedFilters: [],
}));

export const handleToggleFilterCategoryCollapse = reducer(
  (state, category: string) => ({
    ...state,
    collapsedFilterCategories: toggleArrayItem(
      state.collapsedFilterCategories,
      category
    ),
  })
);
