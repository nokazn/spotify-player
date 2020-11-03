import { SetupContext } from '@vue/composition-api';
import { App } from '~~/types';

export const useReleaseLinkMenu = (
  root: SetupContext['root'],
  item: App.SimpleTrackDetail | undefined,
): App.MenuItem<'custom' | 'to'> => {
  const isEpisode = item?.type === 'episode';
  const name = isEpisode
    ? 'ポッドキャストのページに移動'
    : 'アルバムのページに移動';
  if (item == null) {
    return {
      type: 'custom',
      name,
      handler: () => {},
      disabled: true,
    };
  }

  const { releaseId } = item;
  return {
    type: 'to',
    name,
    to: isEpisode
      ? `/shows/${releaseId}`
      : `/releases/${releaseId}`,
    disabled: isEpisode
      ? root.$route.params.showId === releaseId
      : root.$route.params.releaseId === releaseId,
  };
};
