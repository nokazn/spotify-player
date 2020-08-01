import { Context } from '@nuxt/types';
import { App } from '~~/types';
import { getFollowersText } from '~/scripts/converter/getFollowersText';

export const getUserInfo = async (
  { app, params }: Context,
): Promise<App.UserInfo | undefined> => {
  const user = await app.$spotify.users.getUserProfile({
    userId: params.userId,
  });
  if (user == null) return undefined;

  const {
    display_name: displayName,
    external_urls: externalUrls,
    followers,
    href,
    id,
    images,
    type,
    uri,
  } = user;

  return {
    displayName,
    externalUrls,
    followersText: getFollowersText(followers.total),
    href,
    id,
    images,
    type,
    uri,
  };
};