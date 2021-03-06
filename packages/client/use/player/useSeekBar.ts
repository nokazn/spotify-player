import {
  computed,
  onMounted,
  onBeforeUnmount,
  SetupContext,
} from '@vue/composition-api';
import { ExtendedMutationPayload } from 'typed-vuex';
import { elapsedTime } from 'shared/utils';

export const useSeekBar = (root: SetupContext['root']) => {
  const positionMs = computed(() => root.$getters()['playback/positionMs']);
  // TODO: this.value が undefined になるときがある
  const positionMss = computed(() => {
    const min = Math.floor((positionMs.value ?? 0) / 1000 / 60).toString();
    const sec = Math.floor(((positionMs.value ?? 0) / 1000) % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  });
  const durationMs = computed(() => root.$getters()['playback/durationMs']);
  const durationMss = computed(() => elapsedTime(durationMs.value));
  const durationMsTitle = computed(() => {
    return durationMs.value === root.$constant.DEFAULT_DURATION_MS
      ? '再生時間が取得できません'
      : undefined;
  });
  const progress = computed(() => (positionMs.value / durationMs.value) * 100);

  const isPlaying = computed(() => root.$getters()['playback/isPlaying']);
  // durationMs が不適な値の場合もシークバーを操作できないようにする
  const disabled = computed(() => root.$getters()['playback/isDisallowed']('seeking')
    || durationMs.value === root.$constant.DEFAULT_DURATION_MS);

  const color = computed(() => {
    return isPlaying.value
      ? 'active-icon'
      : 'white';
  });

  const setPositionMs = (p: number) => {
    root.$commit('playback/SET_POSITION_MS', p);
  };

  let timer: ReturnType<typeof setInterval> | undefined;
  const clearTimer = () => {
    if (timer != null) {
      clearInterval(timer);
      timer = undefined;
    }
  };
  const setTimer = () => {
    if (!isPlaying.value) return;
    const intervalMs = 500;
    clearTimer();
    timer = setInterval(() => {
      setPositionMs(root.$getters()['playback/positionMs'] + intervalMs);
    }, intervalMs);
  };

  const onMouseDown = () => { clearTimer(); };
  const onChange = async (p: number) => {
    const currentPositionMs = root.$getters()['playback/positionMs'];
    setPositionMs(p);
    await root.$dispatch('playback/seek', {
      positionMs: p,
      currentPositionMs,
    }).then(() => {
      if (isPlaying.value) {
        setTimer();
      }
    });
  };

  let mutationUnsubscribe: (() => void) | undefined;
  onMounted(() => {
    if (isPlaying.value) {
      setTimer();
    }
    const subscribeIsPlaying = ({ payload }: ExtendedMutationPayload<'playback/SET_IS_PLAYING'>) => {
      if (payload) {
        setTimer();
      } else {
        clearTimer();
      }
    };
    mutationUnsubscribe = root.$subscribe((mutation) => {
      const { type } = mutation;
      switch (type) {
        case 'playback/SET_IS_PLAYING':
          subscribeIsPlaying(mutation as ExtendedMutationPayload<typeof type>);
          break;
        default:
          break;
      }
    });
  });
  onBeforeUnmount(() => {
    clearTimer();
    if (mutationUnsubscribe != null) {
      mutationUnsubscribe();
      mutationUnsubscribe = undefined;
    }
  });

  return {
    positionMs,
    positionMss,
    durationMs,
    durationMss,
    durationMsTitle,
    progress,
    isPlaying,
    disabled,
    color,
    onMouseDown,
    onChange,
  };
};
