/* eslint-disable no-param-reassign */
import type { VuexMutations } from 'typed-vuex';
import type { SpotifyAPI } from 'shared/types';
import type { State } from './types';

export type Mutations = {
  SET_SHOW_LIST: SpotifyAPI.SimpleShow[];
  ADD_TO_SHOW_LIST: SpotifyAPI.SimpleShow[];
  UNSHIFT_TO_SHOW_LIST: SpotifyAPI.SimpleShow[];
  SET_TOTAL: number;
  INCREMENT_UNACQUIRED_SHOWS: void;
  RESET_UNACQUIRED_SHOWS: void;
  SET_ACTUAL_IS_SAVED: [string, boolean];
  DELETE_ACTUAL_IS_SAVED: string;
};

const mutations: VuexMutations<State, Mutations> = {
  SET_SHOW_LIST(state, showList) {
    state.showList = showList;
  },

  ADD_TO_SHOW_LIST(state, showList) {
    const currentShowList = state.showList;
    state.showList = [...currentShowList, ...showList];
  },

  UNSHIFT_TO_SHOW_LIST(state, showList) {
    const currentShowList = state.showList;
    state.showList = [...showList, ...currentShowList];
  },

  SET_TOTAL(state, total) {
    state.total = total;
  },

  INCREMENT_UNACQUIRED_SHOWS(state) {
    state.unacquiredShows += 1;
  },

  RESET_UNACQUIRED_SHOWS(state) {
    state.unacquiredShows = 0;
  },

  SET_ACTUAL_IS_SAVED(state, [key, isSaved]) {
    state.actualIsSavedMap.set(key, isSaved);
  },

  DELETE_ACTUAL_IS_SAVED(state, key) {
    state.actualIsSavedMap.delete(key);
  },
};

export default mutations;
