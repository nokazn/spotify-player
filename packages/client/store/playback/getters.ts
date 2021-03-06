import type { VuexGetters } from 'typed-vuex';

import { getExternalUrlFromUri } from 'shared/utils';
import type { SpotifyAPI, ZeroToHundred } from 'shared/types';
import { getImageSrc, convertTrackForQueue, convertMinimumArtist } from '~/services/converter';
import { REPEAT_STATE_LIST, DEFAULT_DURATION_MS } from '~/constants';
import type { App } from '~/entities';
import type { State } from './types';

type Disallows = keyof SpotifyAPI.Disallows;

export type Getters = {
  track: App.ExtendedTrack | undefined;
  isPlaying: boolean;
  isSavedTrack: boolean;
  positionMs: number;
  durationMs: number;
  isShuffled: boolean;
  repeatMode: App.RepeatMode | undefined;
  isMuted: boolean;
  activeDevice: SpotifyAPI.Device | undefined;
  playbackDeviceId: string | undefined;
  deviceList: App.Device[];
  deviceState: App.DeviceState;
  currentTrack: App.SimpleTrackDetail | undefined;
  trackQueue: App.TrackQueue[];
  artworkSrc: (minSize?: number) => string | undefined;
  hasTrack: boolean;
  isTrackSet: (track: string | App.MinimumTrack | undefined | null) => boolean;
  contextUri: string | undefined;
  isContextSet: (uri: string | undefined) => boolean;
  remainingTimeMs: number;
  isBeginningOfTrack: boolean;
  repeatState: SpotifyAPI.RepeatState | undefined;
  isDisallowed: (disallow: Disallows | Disallows[]) => boolean;
  volumePercent: ZeroToHundred;
};

const playerGetters: VuexGetters<State, Getters> = {
  track(state) {
    return state.track;
  },

  isPlaying(state) {
    return state.isPlaying;
  },

  isSavedTrack(state) {
    return state.isSavedTrack;
  },

  positionMs(state) {
    return state.positionMs;
  },

  durationMs(state) {
    return state.durationMs;
  },

  isShuffled(state) {
    return state.isShuffled;
  },

  repeatMode(state) {
    return state.repeatMode;
  },

  isMuted(state) {
    return state.isMuted;
  },

  activeDevice(state) {
    return state.deviceList.find((device) => device.is_active);
  },

  playbackDeviceId(state) {
    return state.isPlaybackSleep
      ? state.activeDeviceId
      : undefined;
  },

  deviceList(state, getters) {
    const disabled = getters.isDisallowed('transferring_playback');
    const title = (device: SpotifyAPI.Device) => {
      if (device.is_active) return '再生中';
      return device.id === state.deviceId
        ? 'このデバイス'
        : device.name;
    };
    const subtitle = (device: SpotifyAPI.Device) => {
      if (device.is_active) {
        return device.id === state.deviceId
          ? 'このデバイス'
          : device.name;
      }
      return 'Spotify Connect';
    };
    return state.deviceList.map((device) => ({
      id: device.id ?? undefined,
      type: device.type,
      isActive: device.is_active,
      disabled: device.id == null || disabled,
      title: title(device),
      subtitle: subtitle(device),
    }));
  },

  deviceState(state, getters) {
    if (state.deviceId == null || getters.activeDevice == null) return 'disconnected';
    // このデバイスの ID が存在し、アクティブなデバイスの ID と同じとき
    if (getters.activeDevice.id === state.deviceId) return 'self';
    // このデバイスの ID が存在し、アクティブなデバイスの ID と違うとき
    return 'another';
  },

  currentTrack(state) {
    const {
      track,
      durationMs,
      isSavedTrack,
    } = state;
    if (track == null) return undefined;

    // Spotify で開く用のリンク
    const spotify = getExternalUrlFromUri(track.uri);
    const externalUrls: SpotifyAPI.ExternalUrls = spotify != null
      ? { spotify }
      : {};
    return {
      index: -1,
      type: track.type,
      id: track.id,
      name: track.name,
      uri: track.uri,
      artists: track.artists.map(convertMinimumArtist),
      featuredArtistList: [],
      durationMs,
      externalUrls,
      previewUrl: {},
      isSaved: isSavedTrack,
      releaseId: track.album.id,
      releaseName: track.album.name,
      images: track.album.images,
      linkedFrom: track.linked_from,
    };
  },

  trackQueue(state) {
    const { track } = state;
    if (track == null) return [];
    const currentTrack: App.TrackQueue = {
      isSet: true,
      isPlaying: state.isPlaying,
      index: 0,
      type: track.type,
      id: track.id,
      name: track.name,
      uri: track.uri,
      artists: track.artists.map(convertMinimumArtist),
      releaseId: track.album.id,
      releaseName: track.album.name,
      images: track.album.images,
      linkedFrom: track.linked_from,
      durationMs: state.durationMs,
    };
    // 前後2曲まで含める
    const numberOfTracks = 2;
    const prevLength = Math.min(state.previousTrackList.length, numberOfTracks);
    const previousTrackList = state.previousTrackList
      .slice(0, numberOfTracks)
      .map(convertTrackForQueue({
        isSet: false,
        isPlaying: false,
        offset: -1 * prevLength,
      }));
    const nextTrackList = state.nextTrackList
      .slice(0, numberOfTracks)
      .map(convertTrackForQueue({
        isSet: false,
        isPlaying: false,
        offset: 1,
      }));
    return [
      ...previousTrackList,
      currentTrack,
      ...nextTrackList,
    ];
  },

  artworkSrc(state) {
    return (minSize?: number) => getImageSrc(state.track?.album.images, minSize);
  },

  hasTrack(state) {
    return state.track != null
      && state.durationMs > 0
      && state.durationMs !== DEFAULT_DURATION_MS;
  },

  // TODO: string を省く
  isTrackSet(state) {
    return (track) => {
      const currentTrack = state.track;
      if (track == null || currentTrack == null) return false;
      const currentTrackId = currentTrack.linked_from?.id ?? currentTrack.id;
      if (typeof track === 'string') {
        return track === currentTrackId;
      }
      const trackId = track.linked_from?.id ?? track.linkedFrom?.id ?? track.id;
      return trackId === currentTrackId;
    };
  },

  contextUri(state) {
    return state.contextUri ?? state.customContextUri;
  },

  // アーティストページのトラックリストやコレクションから再生すると customContextUri に uri が保持される
  isContextSet(_, getters) {
    return (uri) => uri != null && (getters.contextUri === uri);
  },

  isDisallowed(state) {
    return (disallows) => {
      return Array.isArray(disallows)
        ? disallows.some((disallow) => state.disallows[disallow])
        : state.disallows[disallows] ?? false;
    };
  },

  remainingTimeMs(state) {
    return Math.max(state.durationMs - state.positionMs, 0);
  },

  isBeginningOfTrack(state) {
    return state.positionMs <= 1000;
  },

  repeatState(state) {
    return state.repeatMode != null
      ? REPEAT_STATE_LIST[state.repeatMode]
      : undefined;
  },

  volumePercent(state) {
    return state.isMuted
      ? 0
      : state.volumePercent;
  },
};

export default playerGetters;
