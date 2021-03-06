<template>
  <tr
    :class="{
      [$style.EpisodeTableRow]: true,
      'inactive--text': !item.isPlayable
    }"
    @click="onRowClicked"
  >
    <td
      :class="$style.EpisodeTableRow_buttons"
      class="text-center"
    >
      <PlaylistMediaButton
        :disabled="!item.isPlayable"
        :size="$constant.DEFAULT_BUTTON_SIZE"
        :value="playing"
        @input="onMediaButtonClicked"
      />
    </td>

    <td>
      <div :class="$style.Content">
        <div :class="$style.Content__left">
          <div
            :class="titleColor"
            class="g-ellipsis-text"
            :title="item.name"
          >
            <nuxt-link :to="episodePath">
              {{ item.name }}
            </nuxt-link>
          </div>

          <div
            :class="[$style.Content__subtitle, subtitleColor]"
            class="g-small-text g-ellipsis-text"
            :title="item.description"
          >
            {{ item.description }}
          </div>
        </div>

        <ExplicitChip
          v-if="item.explicit"
          :class="$style.Content__right"
        />
      </div>
    </td>

    <td class="text-center">
      <EpisodeProgressBar
        :max-width="56"
        :resume-point="item.resumePoint"
        :duration-ms="item.durationMs"
      />
    </td>

    <td
      v-if="!hideAddedAt"
      :title="releaseDate"
      class="text-center"
    >
      <time
        :datetime="item.releaseDate"
        class="g-small-text"
      >
        {{ releaseDate }}
      </time>
    </td>

    <td class="text-center g-small-text">
      <TrackTime :time-ms="item.durationMs" />
    </td>

    <td>
      <EpisodeMenu
        offset-x
        left
        :size="$constant.DEFAULT_BUTTON_SIZE"
        :episode="item"
        :publisher="publisher"
      />
    </td>
  </tr>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';
import PlaylistMediaButton from '~/components/parts/button/PlaylistMediaButton.vue';
import ExplicitChip from '~/components/parts/chip/ExplicitChip.vue';
import TrackTime from '~/components/parts/text/TrackTime.vue';
import EpisodeProgressBar from '~/components/parts/progress/EpisodeProgressBar.vue';
import EpisodeMenu from '~/components/containers/menu/EpisodeMenu.vue';
import {
  ON_ROW_CLICKED,
  ON_MEDIA_BUTTON_CLICKED,
  ON_FAVORITE_BUTTON_CLICKED,
} from '~/components/parts/table/EpisodeTableRow.vue';
import type { App } from '~/entities';

export type On = {
  [ON_ROW_CLICKED]: App.EpisodeDetail;
  [ON_MEDIA_BUTTON_CLICKED]: App.EpisodeDetail;
  [ON_FAVORITE_BUTTON_CLICKED]: App.EpisodeDetail;
};

export default defineComponent({
  components: {
    PlaylistMediaButton,
    ExplicitChip,
    TrackTime,
    EpisodeProgressBar,
    EpisodeMenu,
  },

  props: {
    item: {
      type: Object as PropType<App.EpisodeDetail>,
      required: true,
    },
    publisher: {
      type: String,
      required: true,
    },
    playing: {
      type: Boolean,
      required: true,
    },
    episodePath: {
      type: String,
      required: true,
    },
    titleColor: {
      type: String as PropType<App.TitleColorClass | undefined>,
      default: undefined,
    },
    subtitleColor: {
      type: String as PropType<App.SubtitleColorClass>,
      required: true,
    },
    releaseDate: {
      type: String,
      required: true,
    },
    hideAddedAt: {
      type: Boolean,
      required: true,
    },
  },

  setup(props, { emit }) {
    const onRowClicked = () => { emit(ON_ROW_CLICKED, props.item); };
    const onMediaButtonClicked = () => { emit(ON_MEDIA_BUTTON_CLICKED, props.item); };
    const onFavoriteButtonClicked = () => { emit(ON_FAVORITE_BUTTON_CLICKED, props.item); };

    return {
      onRowClicked,
      onMediaButtonClicked,
      onFavoriteButtonClicked,
    };
  },
});
</script>

<style lang="scss" module>
.EpisodeTableRow {
  .Content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__left {
      @include avoid-overflowing();

      & > *:not(:last-child) {
        margin-bottom: 0.25rem;
      }
    }

    &__right {
      margin-left: 0.5rem;
      flex: 0 0 $g-explicit-chip-width;
    }

    &__subtitle {
      &--divider {
        margin: 0 0.25rem;
      }
    }
  }
}
</style>
