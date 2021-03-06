import type { Context } from '@nuxt/types';

export const unfollowPlaylist = (context: Context) => {
  const { app } = context;

  return ({ playlistId }: { playlistId: string }): Promise<void> => {
    return app.$spotifyApi.$delete<void>(`/playlists/${playlistId}/followers`)
      .catch((err: Error) => {
        console.error({ err });
        throw err;
      });
  };
};
