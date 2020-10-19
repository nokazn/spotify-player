import { Context } from '@nuxt/types';
import { SpotifyAPI, OneToFifty } from '~~/types';

type Playlists = { playlists: SpotifyAPI.Paging<SpotifyAPI.SimplePlaylist> };

export const getCategoryPlaylist = (context: Context) => {
  const { app } = context;

  return ({
    categoryId,
    country,
    limit = 20,
    offset = 0,
  }: {
    categoryId: string;
    country?: SpotifyAPI.Country;
    limit?: OneToFifty;
    offset?: number;
  }): Promise<Partial<Playlists>> => {
    return app.$spotifyApi.$get<Playlists>(`/browse/categories/${categoryId}/playlists`, {
      params: {
        country,
        limit,
        offset,
      },
    }).catch((err: Error) => {
      console.error({ err });
      return {};
    });
  };
};