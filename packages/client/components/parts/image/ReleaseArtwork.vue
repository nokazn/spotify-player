<template>
  <v-hover v-slot="{ hover }">
    <v-img
      v-if="src != null"
      :src="src"
      :alt="alt"
      :min-width="minSize || size"
      :min-height="minSize || size"
      :width="size"
      :height="size"
      :max-width="maxSize || size"
      :max-height="maxSize || size"
      :aspect-ratio="1"
      :class="{
        'g-box-shadow': shadow,
        [$style.ReleaseArtwork]: true,
      }"
      :style="cssProps"
      @load="onLoaded"
    >
      <ImageOverlay
        v-if="overlay"
        :hover="hover"
        :size="size"
        :icon="icon"
        @click="onClick"
      />
    </v-img>

    <div
      v-else
      :class="$style.Ratio"
    >
      <svg
        v-if="size == null"
        viewBox="0 0 1 1"
      />
      <v-sheet
        :min-width="minSize || size"
        :min-height="minSize || size"
        :width="size"
        :height="size"
        :max-width="maxSize || size"
        :max-height="maxSize || size"
        :class="$style['ReleaseArtwork--empty']"
      >
        <v-icon :size="defaultIconSize">
          mdi-music
        </v-icon>
      </v-sheet>
    </div>
  </v-hover>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api';
import ImageOverlay from '~/components/parts/image/ImageOverlay.vue';

export type MediaIcon = 'mdi-play-circle' | 'mdi-pause-circle';

const ON_MEDIA_BUTTON_CLICKED = 'on-media-button-clicked';
const ON_LOADED = 'on-loaded';

export type On = {
  [ON_MEDIA_BUTTON_CLICKED]: void;
  [ON_LOADED]: void;
};

export default defineComponent({
  components: {
    ImageOverlay,
  },

  props: {
    src: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    alt: {
      type: String,
      required: true,
    },
    size: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    minSize: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    maxSize: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    icon: {
      type: String as PropType<MediaIcon>,
      default: 'mdi-play-circle',
    },
    overlay: {
      type: Boolean,
      default: false,
    },
    shadow: {
      type: Boolean,
      default: false,
    },
    borderRadius: {
      type: Number,
      default: 0,
    },
  },

  setup(props, { emit }) {
    const defaultIconSize = computed(() => {
      const baseSize = props.size ?? props.minSize;
      return baseSize != null
        ? baseSize * 0.4
        : 60;
    });
    const cssProps = computed(() => ({ '--border-radius': `${props.borderRadius}px` }));
    const onClick = () => { emit(ON_MEDIA_BUTTON_CLICKED); };
    const onLoaded = () => { emit(ON_LOADED); };

    return {
      defaultIconSize,
      cssProps,
      onClick,
      onLoaded,
    };
  },
});
</script>

<style lang="scss" module>
.ReleaseArtwork {
  // 上だけ丸みをもたせる
  border-radius: var(--border-radius) var(--border-radius) 0 0;

  &--empty {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

// viewBox 0 0 1 1 の svg 要素と同じ位置に v-sheet を配置する
.Ratio {
  display: inline-grid;

  & > * {
    grid-area: 1 / 1;
  }
}
</style>
