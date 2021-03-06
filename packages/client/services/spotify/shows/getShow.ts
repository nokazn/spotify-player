import type { Context } from '@nuxt/types';
import type { SpotifyAPI } from 'shared/types';

export const getShow = (context: Context) => {
  const { app } = context;

  return ({ showId, market = 'from_token' }: {
    showId: string;
    market?: SpotifyAPI.Country;
  }): Promise<SpotifyAPI.Show | undefined> => {
    return app.$spotifyApi.$get<SpotifyAPI.Show>(`/shows/${showId}`, {
      params: {
        market,
      },
    }).catch((err: Error) => {
      console.error({ err });
      return undefined;
    });
  };
};
