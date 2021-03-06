import VuexPersistence from 'vuex-persist';
import type { Context } from '@nuxt/types';
import type { RootState } from 'typed-vuex';

export default ({ store }: Context) => {
  new VuexPersistence<RootState>({
    storage: window.localStorage,
    reducer: (state) => ({
      playback: {
        volumePercent: state.playback.volumePercent,
        isMuted: state.playback.isMuted,
      },
    }),
  }).plugin(store);
};
