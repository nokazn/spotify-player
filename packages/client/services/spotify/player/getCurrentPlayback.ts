import type { Context } from '@nuxt/types';
import type { SpotifyAPI } from 'shared/types';

export const getCurrentPlayback = (context: Context) => {
  const { app } = context;

  return ({ market = 'from_token', additionalTypeList }: {
    market?: SpotifyAPI.Country;
    additionalTypeList?: Array<'track' | 'episode'>;
  }): Promise<SpotifyAPI.Player.CurrentPlayback | undefined> => {
    return app.$spotifyApi.$get<SpotifyAPI.Player.CurrentPlayback>('/me/player', {
      params: {
        market,
        additional_types: additionalTypeList?.join(','),
      },
    }).catch((err: Error) => {
      console.error({ err });
      return undefined;
    });
  };
};
