<template>
  <div :class="$style.AccountPage">
    <h1>アカウント</h1>

    <v-skeleton-loader
      v-if="itemList == null"
      type="list-item"
    />
    <TwoColumnsListCard
      v-else
      :items="itemList"
    />

    <v-btn
      rounded
      color="success"
      nuxt
      to="//www.spotify.com/jp/account/overview/"
      target="_blank"
    >
      <span>
        アカウント情報を編集
      </span>
      <v-icon
        small
        right
      >
        mdi-open-in-new
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TwoColumnsListCard, { Item } from '~/components/parts/list/TwoColumnsListCard.vue';

export default Vue.extend({
  components: {
    TwoColumnsListCard,
  },

  head() {
    return {
      title: 'アカウント',
    };
  },

  computed: {
    itemList(): Item[] | undefined {
      const user = this.$getters()['auth/user'];
      if (user == null) return undefined;

      return [
        {
          title: 'ID',
          value: user.id,
        },
        {
          title: 'ユーザー名',
          value: user.display_name,
        },
        {
          title: 'メールアドレス',
          value: user.email,
        },
        {
          title: '国',
          value: user.country,
        },
      ];
    },
  },

  mounted() {
    this.$dispatch('resetDominantBackgroundColor');
  },
});
</script>

<style lang="scss" module>
.AccountPage {
  min-width: 300px;
  margin: 24px 6%;

  & > *:not(:last-child) {
    margin-bottom: 24px;
  }
}
</style>
