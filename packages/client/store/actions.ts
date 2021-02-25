import type { Actions } from 'typed-vuex';

import { extractDominantColors } from '~/utils/image';
import { DEFAULT_DOMINANT_COLOR } from '~/constants';
import type { RootState } from './state';
import type { RootGetters } from './getters';
import type { RootMutations } from './mutations';

export type RootActions = {
  extractDominantBackgroundColor: (src: string) => Promise<void>
  setDefaultDominantBackgroundColor: () => void
  resetDominantBackgroundColor: () => void
}

const actions: Actions<RootState, RootActions, RootGetters, RootMutations> = {
  async nuxtServerInit({ dispatch }) {
    const token = await dispatch('auth/getAccessToken', undefined, { root: true });
    if (token != null) {
      await dispatch('auth/getUserData', undefined, { root: true });
    }
  },

  async extractDominantBackgroundColor({ commit }, src) {
    const colors = await extractDominantColors(src);
    commit('SET_DOMINANT_BACKGROUND_COLOR', colors?.Muted, { root: true });
  },
  setDefaultDominantBackgroundColor({ commit }) {
    commit('SET_DOMINANT_BACKGROUND_COLOR', DEFAULT_DOMINANT_COLOR, { root: true });
  },

  resetDominantBackgroundColor({ commit }) {
    commit('SET_DOMINANT_BACKGROUND_COLOR', undefined, { root: true });
  },
};

export default actions;