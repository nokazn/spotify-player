import { Actions } from 'vuex';

import { convertReleaseForCard } from '~/scripts/converter/convertReleaseForCard';
import { LibraryReleasesState } from './state';
import { LibraryReleasesGetters } from './getters';
import { LibraryReleasesMutations } from './mutations';
import { SpotifyAPI } from '~~/types';

export type LibraryReleasesActions = {
  getSavedReleaseList: (payload?: { limit: number } | undefined) => Promise<void>
  updateLatestSavedReleaseList: () => Promise<void>
  saveReleases: (albumIdList: string[]) => Promise<void>
  removeReleases: (albumIdList: string[]) => Promise<void>
  modifyReleaseSavedState: ({ releaseId, isSaved }: {
    releaseId: string
    isSaved: boolean
  }) => void
};

export type RootActions = {
  'library/releases/getSavedReleaseList': LibraryReleasesActions['getSavedReleaseList']
  'library/releases/updateLatestSavedReleaseList': LibraryReleasesActions['updateLatestSavedReleaseList']
  'library/releases/saveReleases': LibraryReleasesActions['saveReleases']
  'library/releases/removeReleases': LibraryReleasesActions['removeReleases']
  'library/releases/modifyReleaseSavedState': LibraryReleasesActions['modifyReleaseSavedState']
};

const MAX_ARTWORK_SIZE = 240;
const convertRelease = ({ album }: {
  album: SpotifyAPI.SimpleAlbum | SpotifyAPI.Album
}) => convertReleaseForCard(MAX_ARTWORK_SIZE)(album);

const actions: Actions<
  LibraryReleasesState,
  LibraryReleasesActions,
  LibraryReleasesGetters,
  LibraryReleasesMutations
> = {
  /**
   * 指定されない場合は limit: 30 で取得
   */
  async getSavedReleaseList({
    state, commit, getters, rootGetters,
  }, payload) {
    // すでに全データを取得している場合は何もしない
    if (state.isFullReleaseList) return;

    const limit = payload?.limit ?? 30;
    const offset = getters.releaseListLength;
    const market = rootGetters['auth/userCountryCode'];
    const releases = await this.$spotify.library.getUserSavedAlbums({
      limit,
      offset,
      market,
    });
    // @todo
    // 取得できなければリセットする
    if (releases == null) {
      commit('SET_RELEASE_LIST', null);
      commit('SET_IS_FULL_RELEASE_LIST', true);
      throw new Error('お気に入りのアルバムの一覧を取得できませんでした。');
    }

    const releaseList = releases.items.map(convertRelease);

    commit('ADD_TO_RELEASE_LIST', releaseList);

    if (releases.next == null) {
      commit('SET_IS_FULL_RELEASE_LIST', true);
    }
  },

  /**
   * 未更新分を追加
   */
  async updateLatestSavedReleaseList({ state, commit, rootGetters }) {
    // ライブラリの情報が更新されていないものの数
    const limit = state.numberOfUnupdatedReleases;
    if (limit === 0) return;

    const market = rootGetters['auth/userCountryCode'];
    const releases = await this.$spotify.library.getUserSavedAlbums({
      limit,
      market,
    });
    // @todo
    // 追加分が取得できなければリセットする
    if (releases == null) {
      commit('SET_RELEASE_LIST', null);
      throw new Error('お気に入りのアルバムの一覧を更新できませんでした。');
    }

    const currentReleaseList = state.releaseList;
    // 現在のライブラリが未取得ならそのままセット
    if (currentReleaseList == null) {
      commit('SET_RELEASE_LIST', releases.items.map(convertRelease));
      return;
    }

    // @todo lastRelease の位置まで取得すべき?
    // 現在のライブラリの先頭があるかどうか
    const currentLatestReleaseId = currentReleaseList[0].id;
    const lastReleaseIndex = releases.items
      .findIndex(({ album }) => album.id === currentLatestReleaseId);

    const addedReleaseList = lastReleaseIndex === -1
      ? releases.items.map(convertRelease)
      : releases.items.slice(0, lastReleaseIndex).map(convertRelease);

    commit('UNSHIFT_TO_RELEASE_LIST', addedReleaseList);
    commit('RESET_NUMBER_OF_UNUPDATED_RELEASES');
  },

  async saveReleases({ dispatch }, albumIdList) {
    await this.$spotify.library.saveAlbums({ albumIdList })
      .catch((err) => {
        console.error(err.message);
        throw new Error('ライブラリにアルバムを保存できませんでした。');
      });

    albumIdList.forEach((releaseId) => {
      dispatch('modifyReleaseSavedState', {
        releaseId,
        isSaved: true,
      });
    });
  },

  async removeReleases({ dispatch }, albumIdList) {
    await this.$spotify.library.removeUserSavedAlbums({ albumIdList })
      .catch((err) => {
        console.error(err.message);
        throw new Error('ライブラリからアルバムを削除できませんでした。');
      });

    albumIdList.forEach((releaseId) => {
      dispatch('modifyReleaseSavedState', {
        releaseId,
        isSaved: false,
      });
    });
  },

  modifyReleaseSavedState({ state, commit }, { releaseId, isSaved }) {
    const currentReleaseList = state.releaseList;
    if (currentReleaseList == null) return;

    const savedReleaseIndex = currentReleaseList
      .findIndex((release) => release.id === releaseId);
    // ライブラリに存在する場合、削除したリリースは削除し、保存したリリースは再度先頭にするためにライブラリからは一度削除
    if (savedReleaseIndex !== -1) {
      const nextReleaseList = [...currentReleaseList];
      // savedReleaseIndex から1個取り除く
      nextReleaseList.splice(savedReleaseIndex, 1);
      commit('SET_RELEASE_LIST', nextReleaseList);
    }

    // ライブラリ一覧に表示されてないリリースを保存した場合
    if (isSaved && savedReleaseIndex === -1) {
      commit('INCREMENT_NUMBER_OF_UNUPDATED_RELEASES');
    }

    commit('SET_ACTUAL_IS_SAVED', [releaseId, isSaved]);
  },
};

export default actions;
