<template>
  <PlaylistModal
    v-model="modal"
    detail-text="編集"
    handler-text="更新"
    :handler="handler"
    :form="form"
    @update:image="onUpdateImage"
  />
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from '@vue/composition-api';
import PlaylistModal, {
  On as OnModal,
  INPUT,
  UPDATE_IMAGE,
  Form,
  Handler,
} from '~/components/containers/modal/PlaylistModal.vue';

export type { Form } from '~/components/containers/modal/PlaylistModal.vue';

export type On = {
  [INPUT]: OnModal['input'];
  [UPDATE_IMAGE]: OnModal['update:image'];
};

export default defineComponent({
  components: {
    PlaylistModal,
  },

  props: {
    value: {
      type: Boolean,
      required: true,
    },
    form: {
      type: Object as PropType<Form | undefined>,
      default: undefined,
    },
  },

  setup(props, { root, emit }) {
    const modal = computed<boolean>({
      get() { return props.value; },
      set(value: OnModal['input']) { emit(INPUT, value); },
    });
    const handler = (payload: Parameters<Handler<'edit'>>[0]) => {
      return root.$dispatch('playlists/editPlaylist', payload)
        .catch((err: Error) => {
          console.error({ err });
          root.$toast.pushError(err.message);
        });
    };
    const onUpdateImage = () => { emit(UPDATE_IMAGE); };

    return {
      modal,
      handler,
      onUpdateImage,
    };
  },
});
</script>
