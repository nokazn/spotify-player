import { Context } from '@nuxt/types';

import { convertReleaseForCard } from '~/scripts/converter/convertReleaseForCard';
import { App } from '~~/types';

export type ArtistReleaseInfo = {
  albums: {
    title: 'アルバム'
    items: App.ReleaseCardInfo[] | undefined
  }
  singles: {
    title: 'シングル・EP'
    items: App.ReleaseCardInfo[] | undefined
  }
  compilations: {
    title: 'コンピレーション'
    items: App.ReleaseCardInfo[] | undefined
  }
  appearsOns: {
    title: '参加作品'
    items: App.ReleaseCardInfo[] | undefined
  }
}

export const getReleaseListMap = async (
  { app, params }: Context,
  artworkSize: number,
): Promise<ArtistReleaseInfo | null> => {
  const country = app.$getters()['auth/userCountryCode'];
  if (country == null) return null;

  const getArtistReleases = (
    releaseType: App.ReleaseCardInfo['releaseType'],
    offset?: number,
  ) => app.$spotify.artists.getArtistAlbums({
    artistId: params.artistId,
    country,
    limit: 20,
    includeGroupList: [releaseType],
    offset,
  });

  const [albums, singles, compilations, appearsOns] = await Promise.all([
    getArtistReleases('album'),
    getArtistReleases('single'),
    getArtistReleases('compilation'),
    getArtistReleases('appears_on'),
  ] as const);

  const albumList = albums?.items.map(convertReleaseForCard(artworkSize));
  const singleList = singles?.items.map(convertReleaseForCard(artworkSize));
  const compilationList = compilations?.items.map(convertReleaseForCard(artworkSize));
  const appearsOnList = appearsOns?.items.map(convertReleaseForCard(artworkSize));

  return {
    albums: {
      title: 'アルバム',
      items: albumList,
    },
    singles: {
      title: 'シングル・EP',
      items: singleList,
    },
    compilations: {
      title: 'コンピレーション',
      items: compilationList,
    },
    appearsOns: {
      title: '参加作品',
      items: appearsOnList,
    },
  };
};