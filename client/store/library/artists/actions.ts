import { Actions } from 'vuex';

import { convertArtistForCard } from '~/scripts/converter/convertArtistForCard';
import { LibraryArtistsState } from './state';
import { LibraryArtistsGetters } from './getters';
import { LibraryArtistsMutations } from './mutations';
import { SpotifyAPI } from '~~/types';

export type LibraryArtistsActions = {
  getSavedArtistList: (payload?: { limit: number } | undefined) => Promise<void>
  updateLatestSavedArtistList: () => Promise<void>
  followArtists: (artistIdList: string[]) => Promise<void>
  unfollowArtists: (artistIdList: string[]) => Promise<void>
  modifyArtistSavedState: ({ artistId, isSaved }: {
    artistId: string
    isSaved: boolean
  }) => void
};

export type RootActions = {
  'library/artists/getSavedArtistList': LibraryArtistsActions['getSavedArtistList']
  'library/artists/updateLatestSavedArtistList': LibraryArtistsActions['updateLatestSavedArtistList']
  'library/artists/followArtists': LibraryArtistsActions['followArtists']
  'library/artists/unfollowArtists': LibraryArtistsActions['unfollowArtists']
  'library/artists/modifyArtistSavedState': LibraryArtistsActions['modifyArtistSavedState']
};

const MAX_ARTWORK_SIZE = 240;
const convertArtist = (artist: SpotifyAPI.Artist) => convertArtistForCard(MAX_ARTWORK_SIZE)(artist);

const actions: Actions<
  LibraryArtistsState,
  LibraryArtistsActions,
  LibraryArtistsGetters,
  LibraryArtistsMutations
> = {
  /**
   * 指定されない場合は limit: 30 で取得
   */
  async getSavedArtistList({ state, commit, getters }, payload) {
    // すでに全データを取得している場合は何もしない
    if (state.isFullArtistList) return;

    const limit = payload?.limit ?? 30;
    const after = getters.lastArtistId;
    const { artists } = await this.$spotify.following.getUserFollowed({
      type: 'artist',
      limit,
      after,
    });
    if (artists == null) {
      commit('SET_ARTIST_LIST', null);
      return;
    }

    const artistList = artists.items.map(convertArtist);

    commit('ADD_TO_ARTIST_LIST', artistList);

    // limit 以下の個数が返ってきた場合、これをもって全データが取得されたとする
    if (artistList.length < limit) {
      commit('SET_IS_FULL_ARTIST_LIST', true);
    }
  },

  async updateLatestSavedArtistList({ state, commit }) {
    // ライブラリの情報が更新されていないものの数
    const limit = state.numberOfUnupdatedArtist;
    if (limit === 0) return;

    const { artists } = await this.$spotify.following.getUserFollowed({
      type: 'artist',
      limit,
    });
    if (artists == null) {
      commit('SET_ARTIST_LIST', null);
      return;
    }

    const currentArtistList = state.artistList;
    if (currentArtistList == null) {
      commit('SET_ARTIST_LIST', artists.items.map(convertArtist));
      return;
    }

    const currentLatestArtistId = currentArtistList[0].id;
    const lastArtistIndex = artists.items
      .findIndex((artist) => artist.id === currentLatestArtistId);

    const addedArtistList = lastArtistIndex === -1
      ? artists.items.map(convertArtist)
      : artists.items.slice(0, lastArtistIndex).map(convertArtist);

    commit('UNSHIFT_TO_ARTIST_LIST', addedArtistList);
    commit('RESET_NUMBER_OF_UNUPDATED_ARTISTS');
  },

  async followArtists({ dispatch }, artistIdList) {
    await this.$spotify.following.follow({
      type: 'artist',
      artistIdList,
    });

    artistIdList.forEach((artistId) => {
      dispatch('modifyArtistSavedState', {
        artistId,
        isSaved: true,
      });
    });
  },

  async unfollowArtists({ dispatch }, artistIdList) {
    await this.$spotify.following.unfollow({
      type: 'artist',
      artistIdList,
    });

    artistIdList.forEach((artistId) => {
      dispatch('modifyArtistSavedState', {
        artistId,
        isSaved: false,
      });
    });
  },

  async modifyArtistSavedState({ state, commit }, { artistId, isSaved }) {
    const currentArtistList = state.artistList;
    if (currentArtistList == null) return;

    const savedArtistIndex = currentArtistList
      .findIndex((artist) => artist.id === artistId);
    // ライブラリ一覧を更新
    if (savedArtistIndex !== -1) {
      const nextArtistList = [...currentArtistList];
      // savedArtistIndex から1個取り除く
      nextArtistList.splice(savedArtistIndex, 1);
      commit('SET_ARTIST_LIST', nextArtistList);
    }

    const [actualIsSaved] = await this.$spotify.following.checkUserFollowed({
      type: 'artist',
      artistIdList: [artistId],
    });
    // 実際の状態と異なれば戻す
    if (isSaved !== actualIsSaved) {
      // ライブラリ一覧を戻す
      commit('SET_ARTIST_LIST', currentArtistList);
    }

    // ライブラリ一覧に表示されてないリリースを保存した場合
    if (isSaved && savedArtistIndex === -1 && isSaved === actualIsSaved) {
      commit('INCREMENT_NUMBER_OF_UNUPDATED_ARTISTS');
    }
  },
};

export default actions;