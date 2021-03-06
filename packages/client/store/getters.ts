import type { VuexGetters } from 'typed-vuex';

import { BACKGROUND_COLOR, DARKEN_FILTER_RATIO, BACKGROUND_COLOR_RGB } from '~/constants';
import type { App } from '~/entities';
import type { State } from './types';

export type Getters = {
  dominantBackgroundColor: App.DominantColor | undefined;
  backgroundStyles: (height: number) => { background?: string };
  headerStyles: { backgroundColor: string };
};

const getters: VuexGetters<State, Getters> = {
  dominantBackgroundColor(state) {
    return state.dominantBackgroundColor;
  },

  backgroundStyles(state) {
    return (gradationHeight: number) => {
      const rgb = state.dominantBackgroundColor?.rgb
        .map((color) => color * DARKEN_FILTER_RATIO)
        .join(',');
      return rgb != null
        ? { background: `linear-gradient(to bottom, rgb(${rgb}) 80px, ${BACKGROUND_COLOR} ${gradationHeight}px)` }
        : {};
    };
  },

  headerStyles(state) {
    const opacity = 0.6;
    const rgbList = state.dominantBackgroundColor?.rgb
      ?.map((color) => color * DARKEN_FILTER_RATIO) ?? BACKGROUND_COLOR_RGB;
    return { backgroundColor: `rgba(${rgbList.join(',')},${opacity})` };
  },
};

export default getters;
