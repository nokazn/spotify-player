<template>
  <TextInfo
    :size="size"
    :icon="icon"
    :subtext="subtext"
    :title="text"
  >
    <template #icon>
      mdi-account-multiple
    </template>

    {{ text }}
  </TextInfo>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api';
import type { SpotifyAPI } from 'shared/types';
import TextInfo from '~/components/parts/text/TextInfo.vue';
import { getFollowersText } from '~/services/converter';

export default defineComponent({
  components: {
    TextInfo,
  },

  props: {
    followers: {
      type: Object as PropType<SpotifyAPI.Followers>,
      required: true,
    },
    size: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    icon: {
      type: Boolean,
      default: false,
    },
    subtext: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const text = computed(() => getFollowersText(props.followers.total));
    return { text };
  },
});
</script>
