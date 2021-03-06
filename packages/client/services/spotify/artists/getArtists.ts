import type { Context } from '@nuxt/types';

import type { SpotifyAPI } from 'shared/types';
import { multipleRequestsWithId } from '~/utils/request';

type Artists = { artists: (SpotifyAPI.Artist | null)[] };

export const getArtists = (context: Context) => {
  const { app } = context;

  return ({ artistIdList }: {
    artistIdList: string[];
  }): Promise<Artists['artists']> => {
    const request = async (ids: string, l: number) => {
      return app.$spotifyApi.$get<Artists>('/artists', {
        params: { ids },
      })
        .then(({ artists }) => artists)
        .catch((err: Error) => {
          console.error({ err });
          const artists: Artists['artists'] = new Array(l).fill(null);
          return artists;
        });
    };
    return multipleRequestsWithId(request, artistIdList, 50, (lists) => lists.flat());
  };
};
