import type { Context } from '@nuxt/types';
import { multipleRequestsWithId } from '~/utils/request';

export const unfollow = (context: Context) => {
  const { app } = context;

  return ({ type, idList }: {
    type: 'artist' | 'user';
    idList: string[];
  }): Promise<void> => {
    const { length } = idList;
    if (length === 0) {
      return Promise.resolve();
    }

    const request = (ids: string) => {
      return app.$spotifyApi.$delete<void>('/me/following', {
        params: {
          type,
          ids,
        },
      });
    };
    return multipleRequestsWithId(request, idList, 50);
  };
};
