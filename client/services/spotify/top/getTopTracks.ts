import { Context } from '@nuxt/types';
import { SpotifyAPI, OneToFifty } from '~~/types';

export const getTopTracks = (context: Context) => {
  const { app } = context;

  return ({
    limit = 20,
    offset = 0,
    timeRange = 'medium_term',
  }: {
    limit?: OneToFifty;
    offset?: number;
    timeRange?: 'long_term' | 'medium_term' | 'short_term';
  }): Promise<SpotifyAPI.Paging<SpotifyAPI.Track> | undefined> => {
    return app.$spotifyApi.$get<SpotifyAPI.Paging<SpotifyAPI.Track>>('/me/top/tracks', {
      params: {
        limit,
        offset,
        time_range: timeRange,
      },
    }).catch((err: Error) => {
      console.error({ err });
      return undefined;
    });
  };
};