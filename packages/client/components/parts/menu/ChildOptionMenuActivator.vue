<template>
  <v-list-item
    dense
    v-on="on"
    @click.stop
  >
    <v-list-item-title>
      <slot />
    </v-list-item-title>

    <v-list-item-action>
      <v-icon small>
        mdi-chevron-right
      </v-icon>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';

const CLICK = 'click';

export type On = {
  [CLICK]: void;
};

type EventHandlers = {
  [k: string]: (e?: Event) => void;
};

export default defineComponent({
  props: {
    on: {
      type: Object as PropType<EventHandlers>,
      required: true,
    },
  },
});
</script>
