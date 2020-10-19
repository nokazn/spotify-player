import { Context } from '@nuxt/types';
import { SpotifyAPI } from '~~/types';

export const getArtist = (context: Context) => {
  const { app } = context;

  return ({ artistId }: {
    artistId: string;
  }): Promise<SpotifyAPI.Artist | undefined> => {
    return app.$spotifyApi.$get<SpotifyAPI.Artist>(`/artists/${artistId}`)
      .catch((err: Error) => {
        console.error({ err });
        return undefined;
      });
  };
};