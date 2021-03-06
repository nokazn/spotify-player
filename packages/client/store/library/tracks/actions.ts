import type { VuexActions } from 'typed-vuex';

import type { OneToFifty, SpotifyAPI } from 'shared/types';
import { convertPlaylistTrackDetail } from '~/services/converter';
import { multipleRequests } from '~/utils/request/multipleRequests';
import { EMPTY_PAGING } from '~/constants';
import type { State, Mutations, Getters } from './types';

interface ModifyTrackSavedStateParams {
  trackId: string;
  isSaved: boolean;
}

export type Actions = {
  getSavedTrackList: (params: { limit: OneToFifty } | undefined) => Promise<void>;
  updateLatestSavedTrackList: () => Promise<void>;
  removeUnsavedTracks: () => void;
  saveTracks: (trackIdList: string[]) => Promise<void>;
  removeTracks: (trackIdList: string[]) => Promise<void>;
  modifyTrackSavedState: (params: ModifyTrackSavedStateParams) => void;
};

const actions: VuexActions<State, Actions, Getters, Mutations> = {
  /**
   * 保存済みのトラックを取得
   * 指定されない場合は limit: 30 で取得
   */
  async getSavedTrackList({ getters, commit, dispatch }, payload) {
    // すでに全データを取得している場合は何もしない
    if (getters.isFull) return;
    const isAuthorized = await dispatch('auth/confirmAuthState', undefined, { root: true });
    if (!isAuthorized) return;

    const limit = payload?.limit ?? 30;
    const offset = getters.trackListLength;
    const tracks = await this.$spotify.library.getUserSavedTracks({
      limit,
      offset,
    });
    if (tracks == null) {
      this.$toast.pushError('お気に入りのトラックの一覧を取得できませんでした。');
      return;
    }

    // 保存された楽曲を取得しているので isSaved はすべて true
    const isTrackSavedList = new Array(tracks.items.length).fill(true);
    const trackList = tracks.items.map(convertPlaylistTrackDetail({
      isTrackSavedList,
      offset,
    }));

    commit('ADD_TO_TRACK_LIST', trackList);
    commit('SET_TOTAL', tracks.total);
  },

  /**
   * 未更新のトラックを追加
   */
  async updateLatestSavedTrackList({ state, commit, dispatch }) {
    type LibraryOfTracks = SpotifyAPI.LibraryOf<'track'>;
    // ライブラリの情報が更新されていないものの数
    const {
      unacquiredTracks,
      trackList: currentTrackList,
    } = state;
    if (unacquiredTracks === 0) return;

    const isAuthorized = await dispatch('auth/confirmAuthState', undefined, { root: true });
    if (!isAuthorized) return;

    const maxLimit = 50;
    // 最大値は50
    const limit = Math.min(unacquiredTracks, maxLimit) as OneToFifty;
    const handler = (index: number): Promise<LibraryOfTracks | undefined> => {
      const offset = limit * index;
      return this.$spotify.library.getUserSavedTracks({
        limit,
        offset,
      });
    };
    const tracks: LibraryOfTracks | undefined = await multipleRequests(
      handler,
      unacquiredTracks,
      maxLimit,
    ).then((pagings) => pagings.reduce((prev, curr) => {
      // 1つでもリクエストが失敗したらすべて無効にする
      if (prev == null || curr == null) return undefined;
      return {
        ...curr,
        items: [...prev.items, ...curr.items],
      };
    }, EMPTY_PAGING as LibraryOfTracks));

    if (tracks == null) {
      this.$toast.pushError('お気に入りのトラックの一覧を更新できませんでした。');
      return;
    }

    // 保存された楽曲を取得しているので isSaved はすべて true
    const isTrackSavedList = new Array(tracks.items.length).fill(true);
    const currentLatestTrackId = currentTrackList[0].id;
    const lastTrackIndex = tracks.items
      .findIndex(({ track }) => track.id === currentLatestTrackId);

    // TODO: lastRelease の位置まで取得すべき?
    // 現在のライブラリの先頭があるかどうか// TODO
    const addedTrackList = lastTrackIndex === -1
      ? tracks.items
        .map(convertPlaylistTrackDetail({ isTrackSavedList }))
      : tracks.items
        .slice(0, lastTrackIndex)
        .map(convertPlaylistTrackDetail({ isTrackSavedList }));

    commit('UNSHIFT_TO_TRACK_LIST', addedTrackList);
    commit('SET_TOTAL', tracks.total);
    commit('RESET_UNACQUIRED_TRACKS');
  },

  /**
   * 保存していないトラックが含まれている場合は除外する
   * ライブラリページでトラックの保存を解除してもページ遷移するまでは表示を削除しないため、保存されていないトラックが混じっていることがある
   */
  removeUnsavedTracks({ state, commit }) {
    const { trackList } = state;
    if (trackList == null) return;

    const filteredTrackList = trackList.filter((track) => track.isSaved);
    commit('SET_TRACK_LIST', filteredTrackList);
  },

  /**
   * トラックを保存
   */
  async saveTracks({ dispatch }, trackIdList) {
    const isAuthorized = await dispatch('auth/confirmAuthState', undefined, { root: true });
    if (!isAuthorized) return;

    await this.$spotify.library.saveTracks({ trackIdList })
      .then(() => {
        trackIdList.forEach((trackId) => {
          dispatch('modifyTrackSavedState', {
            trackId,
            isSaved: true,
          });
        });
      })
      .catch((err: Error) => {
        console.error({ err });
        this.$toast.pushError('ライブラリにトラックを保存できませんでした。');
      });
  },

  /**
   * 保存済みのトラックを削除
   */
  async removeTracks({ dispatch }, trackIdList) {
    const isAuthorized = await dispatch('auth/confirmAuthState', undefined, { root: true });
    if (!isAuthorized) return;

    await this.$spotify.library.removeUserSavedTracks({ trackIdList })
      .then(() => {
        trackIdList.forEach((trackId) => {
          dispatch('modifyTrackSavedState', {
            trackId,
            isSaved: false,
          });
        });
      })
      .catch((err: Error) => {
        console.error({ err });
        this.$toast.pushError('ライブラリからトラックを削除できませんでした。');
      });
  },

  /**
   * saveTracks, removeTracks から呼ばれる
   */
  modifyTrackSavedState({ state, commit, dispatch }, { trackId, isSaved }) {
    // TODO: コピーしないと表示に反映されない
    const trackList = [...state.trackList];
    const savedTrackIndex = trackList.findIndex((track) => track.id === trackId);
    // ライブラリに存在する場合、削除したリリースは削除し、保存したリリースは再度先頭にするためにライブラリからは一度削除
    if (savedTrackIndex !== -1) {
      trackList[savedTrackIndex] = {
        ...trackList[savedTrackIndex],
        isSaved,
      };
      commit('SET_TRACK_LIST', trackList);
    }

    // プレイヤーを更新
    dispatch('playback/modifyTrackSavedState', { trackId, isSaved }, { root: true });

    // 履歴に該当のトラックがあれば更新
    dispatch('library/history/modifyTrackSavedState', {
      trackId,
      isSaved,
    }, { root: true });

    // ライブラリ一覧に表示されてない曲を保存した場合
    if (isSaved && savedTrackIndex === -1) {
      commit('INCREMENT_UNACQUIRED_TRACKS');
    }

    commit('SET_ACTUAL_IS_SAVED', [trackId, isSaved]);
  },
};

export default actions;
