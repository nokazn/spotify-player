import type { VuexActions } from 'typed-vuex';
import type { OneToFifty, TODO } from 'shared/types';
import type { State, Getters, Mutations } from './types';

interface ModifyArtistSavedStateParams {
  artistId: string;
  isSaved: boolean;
}

export type Actions = {
  getSavedArtistList: (params?: { limit: OneToFifty } | undefined) => Promise<void>;
  updateLatestSavedArtistList: () => Promise<void>;
  followArtists: (idList: string[]) => Promise<void>;
  unfollowArtists: (idList: string[]) => Promise<void>;
  modifyArtistSavedState: (params: ModifyArtistSavedStateParams) => void;
};

const actions: VuexActions<State, Actions, Getters, Mutations> = {
  /**
   * フォロー済みのアーティストを取得
   * 指定されない場合は limit: 30 で取得
   */
  async getSavedArtistList({ getters, commit, dispatch }, payload) {
    // すでに全データを取得している場合は何もしない
    if (getters.isFull) return;
    const isAuthorized = await dispatch('auth/confirmAuthState', undefined, { root: true });
    if (!isAuthorized) return;

    const limit = payload?.limit ?? 30;
    const after = getters.lastArtistId;
    const { artists } = await this.$spotify.following.getUserFollowed({
      type: 'artist',
      limit,
      after,
    });
    if (artists == null) {
      this.$toast.pushError('フォロー中のアーティストの一覧を取得できませんでした。');
      return;
    }

    const artistList = artists.items;
    commit('ADD_TO_ARTIST_LIST', artistList);
    commit('SET_TOTAL', artists.total);
  },

  /**
   * 未更新分を追加
   * TODO: 追加順に取得できないので未更新分を上から見ていっても意味ない
   */
  async updateLatestSavedArtistList({ state, commit, dispatch }) {
    // ライブラリの情報が更新されていないものの数
    const {
      unacquiredArtists,
      artistList: currentArtistList,
    } = state;
    if (unacquiredArtists === 0) return;
    const isAuthorized = await dispatch('auth/confirmAuthState', undefined, { root: true });
    if (!isAuthorized) return;

    const maxLimit = 50;
    // TODO: コンパイルを通すためにとりあえずキャストする
    const { artists } = await this.$spotify.following.getUserFollowed({
      type: 'artist',
      limit: Math.min(unacquiredArtists, maxLimit) as TODO,
    });
    if (artists == null) {
      this.$toast.pushError('フォロー中のアーティストの一覧を更新できませんでした。');
      return;
    }

    // TODO: lastRelease の位置まで取得すべき?
    // 現在のライブラリの先頭があるかどうか
    const currentLatestArtistId = currentArtistList[0].id;
    const lastArtistIndex = artists.items
      .findIndex((artist) => artist.id === currentLatestArtistId);

    const addedArtistList = lastArtistIndex === -1
      ? artists.items
      : artists.items.slice(0, lastArtistIndex);

    commit('UNSHIFT_TO_ARTIST_LIST', addedArtistList);
    commit('SET_TOTAL', artists.total);
    commit('RESET_UNACQUIRED_ARTISTS');
  },

  /**
   * アーティストをフォローする
   */
  async followArtists({ dispatch }, idList) {
    const isAuthorized = await dispatch('auth/confirmAuthState', undefined, { root: true });
    if (!isAuthorized) return;

    await this.$spotify.following.follow({
      type: 'artist',
      idList,
    }).catch((err: Error) => {
      console.error({ err });
      this.$toast.pushError('フォローに失敗しました。');
    });

    idList.forEach((artistId) => {
      dispatch('modifyArtistSavedState', {
        artistId,
        isSaved: true,
      });
    });
  },

  /**
   * アーティストのフォローを解除する
   */
  async unfollowArtists({ dispatch }, idList) {
    const isAuthorized = await dispatch('auth/confirmAuthState', undefined, { root: true });
    if (!isAuthorized) return;

    await this.$spotify.following.unfollow({
      type: 'artist',
      idList,
    }).catch((err: Error) => {
      console.error({ err });
      this.$toast.pushError('フォローの解除に失敗しました。');
    });

    idList.forEach((artistId) => {
      dispatch('modifyArtistSavedState', {
        artistId,
        isSaved: false,
      });
    });
  },

  /**
   * followArtists, unfollowArtists から呼ばれる
   */
  modifyArtistSavedState({ state, commit }, { artistId, isSaved }) {
    // TODO: コピーしないと表示に反映されない
    const artistList = [...state.artistList];
    const savedArtistIndex = artistList
      .findIndex((artist) => artist.id === artistId);
    // ライブラリに存在する場合、削除したリリースは削除し、保存したリリースは再度先頭にするためにライブラリからは一度削除
    if (savedArtistIndex !== -1) {
      // savedArtistIndex から1個取り除く
      artistList.splice(savedArtistIndex, 1);
      commit('SET_ARTIST_LIST', artistList);
    }

    // ライブラリ一覧に表示されてないリリースを保存した場合
    if (isSaved && savedArtistIndex === -1) {
      commit('INCREMENT_UNACQUIRED_ARTISTS');
    }

    commit('SET_ACTUAL_IS_SAVED', [artistId, isSaved]);
  },
};

export default actions;
