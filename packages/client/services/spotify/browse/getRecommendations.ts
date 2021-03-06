import type { Context } from '@nuxt/types';
import type { OneToHundred, SpotifyAPI } from 'shared/types';

type BrowseAttributes = SpotifyAPI.Browse.MinTrackAttributes
  | SpotifyAPI.Browse.MaxTrackAttributes
  | SpotifyAPI.Browse.TargetTrackAttributes;

export const getRecommendations = (context: Context) => {
  const { app } = context;

  return ({
    limit = 20,
    market = 'from_token',
    artistIdList,
    genreList,
    trackIdList,
    ...seedParams
  }: {
    limit?: OneToHundred;
    market?: SpotifyAPI.Country;
    artistIdList?: string[];
    genreList?: string[];
    trackIdList?: string[];
  } & {
    [k in BrowseAttributes]?: number;
  }): Promise<Partial<SpotifyAPI.Browse.Recommendations>> => {
    const seed_artists = artistIdList?.join(',');
    const seed_genres = genreList?.join(',');
    const seed_tracks = trackIdList?.join(',');
    return app.$spotifyApi.$get<SpotifyAPI.Browse.Recommendations>('/recommendations', {
      params: {
        limit,
        market,
        seed_artists,
        seed_genres,
        seed_tracks,
        ...seedParams,
      },
    }).catch((err: Error) => {
      console.error({ err });
      return {};
    });
  };
};
