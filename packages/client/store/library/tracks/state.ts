import type { App } from '~/entities';

export type State = {
  trackList: App.PlaylistTrackDetail[];
  total: number | undefined;
  unacquiredTracks: number;
  actualIsSavedMap: Map<string, boolean>;
};

const state = (): State => ({
  trackList: [],
  total: undefined,
  unacquiredTracks: 0,
  actualIsSavedMap: new Map(),
});

export default state;
