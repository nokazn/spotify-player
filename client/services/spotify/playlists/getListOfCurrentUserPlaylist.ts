import { Context } from '@nuxt/types';
import { SpotifyAPI, OneToFifty } from '~~/types';

export const getListOfCurrentUserPlaylist = (context: Context) => {
  const { app } = context;

  /**
   * limit は 1 ~ 50
   * offset は 0 ~ 10000
   */
  return ({
    limit = 20,
    offset = 0,
  }: {
    limit?: OneToFifty;
    offset?: number;
  }): Promise<SpotifyAPI.Paging<SpotifyAPI.SimplePlaylist> | undefined> => {
    return app.$spotifyApi.$get<SpotifyAPI.Paging<SpotifyAPI.SimplePlaylist>>('/me/playlists', {
      params: {
        limit,
        offset,
      },
    }).catch((err: Error) => {
      console.error({ err });
      return undefined;
    });
  };
};