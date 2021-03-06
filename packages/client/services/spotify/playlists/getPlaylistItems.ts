import type { Context } from '@nuxt/types';
import type { SpotifyAPI, OneToFifty } from 'shared/types';

export const getPlaylistItems = (context: Context) => {
  const { app } = context;

  /**
   * fields 必要な情報をカンマ区切りで指定する
   * offset は 0 ~ 10000
   */
  return ({
    playlistId,
    fields,
    limit = 20,
    offset = 0,
    market = 'from_token',
    additionalTypeList,
  }: {
    playlistId: string;
    fields?: string;
    limit?: OneToFifty;
    offset?: number;
    market?: string;
    additionalTypeList?: Array<'track' | 'episode'>;
  }): Promise<SpotifyAPI.Paging<SpotifyAPI.PlaylistTrack> | undefined> => {
    return app.$spotifyApi.$get<SpotifyAPI.Paging<SpotifyAPI.PlaylistTrack>>(`/playlists/${playlistId}/tracks`, {
      params: {
        fields,
        limit,
        offset,
        market,
        additional_types: additionalTypeList?.join(','),
      },
    }).catch((err: Error) => {
      console.error({ err });
      return undefined;
    });
  };
};
