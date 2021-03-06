<template>
  <v-list-item
    link
    nuxt
    :to="item.to"
    :title="item.name"
    dense
    :class="{
      [$style['NavigationListItem--dense']]: dense,
    }"
    class="g-no-text-decoration"
  >
    <v-list-item-icon v-if="item.icon != null">
      <v-icon
        color="subtext"
        :size="20"
        :title="item.name"
      >
        {{ item.icon }}
      </v-icon>
    </v-list-item-icon>

    <v-list-item-content>
      <v-list-item-title :class="[$style.NavigationListItem__title, titleColor]">
        <span class="g-ellipsis-text">
          {{ item.name }}
        </span>
        <v-icon
          v-if="item.isSet && item.isPlaying"
          small
          color="active"
        >
          mdi-volume-high
        </v-icon>
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api';
import { textColorClass } from '~/utils/text';

export type Item = {
  name: string;
  to: string;
  icon?: string;
  isSet?: boolean;
  isPlaying?: boolean;
};

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<Item>,
      required: true,
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const titleColor = computed(() => textColorClass(props.item.isSet));
    return { titleColor };
  },
});
</script>

<style lang="scss" module>
.NavigationListItem {
  &--dense {
    min-height: 36px;
  }

  &__title {
    display: flex;
    justify-content: space-between;
  }
}
</style>
