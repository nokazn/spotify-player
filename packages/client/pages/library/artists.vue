<template>
  <div :class="$style.LibraryArtistsPage">
    <CardsWrapper
      :min-width="$screen.cardWidthMinMax[0]"
      :max-width="$screen.cardWidthMinMax[1]"
    >
      <ArtistCard
        v-for="artist in artistList"
        :key="artist.id"
        :item="artist"
        :min-width="$screen.cardWidthMinMax[0]"
        :max-width="$screen.cardWidthMinMax[1]"
      />
    </CardsWrapper>

    <IntersectionLoadingCircle
      :loading="!isFull"
      @appear="onLoadingCircleAppeared"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator';

import type { SpotifyAPI } from 'shared/types';
import CardsWrapper from '~/components/parts/wrapper/CardsWrapper.vue';
import ArtistCard from '~/components/containers/card/ArtistCard.vue';
import IntersectionLoadingCircle from '~/components/parts/progress/IntersectionLoadingCircle.vue';

interface Data {
  observer: IntersectionObserver | undefined;
}

const LIMIT_OF_ARTISTS = 30;

@Component({
  components: {
    ArtistCard,
    CardsWrapper,
    IntersectionLoadingCircle,
  },

  async fetch({ app }): Promise<void> {
    if (app.$getters()['library/artists/artistListLength'] === 0) {
      await app.$dispatch('library/artists/getSavedArtistList', {
        limit: LIMIT_OF_ARTISTS,
      });
    } else {
      await app.$dispatch('library/artists/updateLatestSavedArtistList');
    }
  },

  head() {
    return {
      title: 'お気に入りのアーティスト',
    };
  },
})
export default class LibraryArtistsPage extends Vue implements Data {
  observer: IntersectionObserver | undefined = undefined;

  get artistList(): SpotifyAPI.Artist[] {
    return this.$getters()['library/artists/artistList'];
  }
  get isFull(): boolean {
    return this.$getters()['library/artists/isFull'];
  }

  onLoadingCircleAppeared() {
    this.$dispatch('library/artists/getSavedArtistList', {
      limit: LIMIT_OF_ARTISTS,
    });
  }
}
</script>

<style lang="scss" module>
.LibraryArtistsPage {
  & > * {
    margin-bottom: 24px;
  }
}
</style>
