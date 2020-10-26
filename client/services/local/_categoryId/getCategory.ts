import { Context } from '@nuxt/types';
import { SpotifyAPI } from '~~/types';

export const getCategory = async (
  { app, params }: Context,
): Promise<SpotifyAPI.Category | undefined> => {
  const country = app.$getters()['auth/userCountryCode'];
  const category = await app.$spotify.browse.getCategory({
    categoryId: params.categoryId,
    country,
  });
  return category;
};
