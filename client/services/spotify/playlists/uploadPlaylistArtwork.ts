import { Context } from '@nuxt/types';

/**
 * TODO: 400 Bad request になる
 */
export const uploadPlaylistArtwork = (context: Context) => {
  const { app } = context;

  return ({
    playlistId,
    artwork,
  }: {
    playlistId: string;
    artwork: string;
  }): Promise<void> => {
    return app.$spotifyApi.$put<void>(`playlists/${playlistId}/images`, artwork, {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    }).catch((err: Error) => {
      console.error({ err });
      throw err;
    });
  };
};
