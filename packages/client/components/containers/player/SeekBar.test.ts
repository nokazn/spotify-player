import { mount } from '@vue/test-utils';
import { options, mocks } from '~/tests/mocks/mount';
import SeekBar from './SeekBar.vue';

const MOUSEDOWN = 'mousedown';
const CHANGE = 'change';

interface PlaybackGetters {
  positionMs: number;
  durationMs: number;
  isPlaying: boolean;
  isDisallowed: boolean;
}
type RootGetters = {
  [K in keyof PlaybackGetters as `playback/${K}`]: jest.Mock<PlaybackGetters[K]>;
};

const toRootGetters = (getters: PlaybackGetters): RootGetters => {
  return Object.entries(getters).reduce<RootGetters>((prev, [k, v]) => ({
    ...prev,
    [`playback/${k}`]: k === 'isDisallowed'
      ? () => v
      : v,
  }), {} as RootGetters);
};
const $getters = (gettersList: PlaybackGetters[]) => {
  const { length } = gettersList;
  return gettersList.reduce((mocked, getters, i) => {
    return i < length - 1
      ? mocked.mockReturnValueOnce(toRootGetters(getters))
      : mocked.mockReturnValue(toRootGetters(getters));
  }, jest.fn());
};
const $commit = jest.fn();
const $dispatch = jest.fn().mockResolvedValue(undefined);
const $subscribe = jest.fn();

const factory = (
  gettersList: PlaybackGetters[],
  hideText: boolean = false,
  thumbColor: string = 'white',
) => {
  return mount(SeekBar, {
    ...options,
    propsData: {
      hideText,
      thumbColor,
    },
    mocks: {
      ...mocks,
      $getters: $getters(gettersList),
      $commit,
      $dispatch,
      $subscribe,
    },
  });
};

describe('SeekBar', () => {
  it('set true to false for hideText prop', async () => {
    const wrapper = factory([{
      positionMs: 2 * 60 * 1000,
      durationMs: 4 * 60 * 1000,
      isPlaying: false,
      isDisallowed: false,
    }], false);
    expect(wrapper.findAll('div.SeekBar > *').length).toBe(2);
    expect(wrapper.find('div.SeekBar > div.SeekBar__mss').exists()).toBe(true);

    await wrapper.setProps({
      hideText: true,
    });
    expect(wrapper.findAll('div.SeekBar > *').length).toBe(1);
    expect(wrapper.find('div.SeekBar > div.SeekBar__mss').exists()).toBe(false);
  });

  it('thumbColor prop', async () => {
    const wrapper = factory([{
      positionMs: 2.5 * 60 * 1000,
      durationMs: 4 * 60 * 1000,
      isPlaying: false,
      isDisallowed: false,
    }], false, 'grey');
    const vSlider = wrapper.findComponent({ name: 'VSlider' });
    expect(vSlider.props().thumbColor).toBe('grey');
  });

  it('playing at 2:30 / 4:00', async () => {
    const wrapper = factory([{
      positionMs: 2.5 * 60 * 1000,
      durationMs: 4 * 60 * 1000,
      isPlaying: true,
      isDisallowed: false,
    }]);
    const vSlider = wrapper.findComponent({ name: 'VSlider' });
    expect(vSlider.props().color).toBe('active-icon');
    expect(vSlider.props().value).toBe((2 * 60 + 30) * 1000);
    expect(vSlider.props().max).toBe(4 * 60 * 1000);
    expect(vSlider.props().disabled).toBe(false);
    expect(wrapper.find('div > *:nth-child(2) > span:first-child').text()).toBe('2:30');
    const durationMss = wrapper.find('div > *:nth-child(2) > span:nth-child(2)');
    expect(durationMss.text()).toBe('4:00');
    expect(durationMss.attributes().title).toBeUndefined();
  });

  it('paused at 2:30 / Infinity (in case of playing episode with another device)', async () => {
    const wrapper = factory([{
      positionMs: 2.5 * 60 * 1000,
      durationMs: Infinity,
      isPlaying: false,
      isDisallowed: false,
    }]);
    const vSlider = wrapper.findComponent({ name: 'VSlider' });
    expect(vSlider.props().color).toBe('white');
    expect(vSlider.props().value).toBe((2 * 60 + 30) * 1000);
    expect(vSlider.props().max).toBe(Infinity);
    expect(vSlider.props().disabled).toBe(true);
    expect(wrapper.find('div > *:nth-child(2) > span:first-child').text()).toBe('2:30');
    const durationMss = wrapper.find('div > *:nth-child(2) > span:nth-child(2)');
    expect(durationMss.text()).toBe('???');
    expect(durationMss.attributes().title).toBe('再生時間が取得できません');
  });

  it('disallowed seeking', async () => {
    const wrapper = factory([{
      positionMs: 0,
      durationMs: 4 * 60 * 1000,
      isPlaying: false,
      isDisallowed: true,
    }]);
    const vSlider = wrapper.findComponent({ name: 'VSlider' });
    expect(vSlider.props().disabled).toBe(true);
  });

  it('on mousedown', async () => {
    const wrapper = factory([{
      positionMs: 0,
      durationMs: 4 * 60 * 1000,
      isPlaying: true,
      isDisallowed: false,
    }]);
    const vSlider = wrapper.findComponent({ name: 'VSlider' });
    const clearTimer = jest.spyOn(window, 'clearInterval').mockReturnValue();
    await vSlider.vm.$emit(MOUSEDOWN);
    expect(clearTimer).toHaveBeenCalled();
  });

  it('change from 2:30 to 2:45', async () => {
    const wrapper = factory([
      {
        positionMs: 2.5 * 60 * 1000,
        durationMs: 4 * 60 * 1000,
        isPlaying: true,
        isDisallowed: false,
      },
    ]);
    const vSlider = wrapper.findComponent({ name: 'VSlider' });
    await vSlider.vm.$emit(CHANGE, 2.75 * 60 * 1000);
    // onMouseDown
    expect(clearInterval).toHaveBeenCalled();
    // onChange
    expect($commit).toHaveBeenNthCalledWith(1, 'playback/SET_POSITION_MS', 2.75 * 60 * 1000);
    expect($dispatch).toHaveBeenNthCalledWith(1, 'playback/seek', {
      positionMs: 2.75 * 60 * 1000,
      currentPositionMs: 2.5 * 60 * 1000,
    });
    // setTimer
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 500);
  });

  it('change from 2:30 to 0:00', async () => {
    const wrapper = factory([
      {
        positionMs: 2.5 * 60 * 1000,
        durationMs: 4 * 60 * 1000,
        isPlaying: true,
        isDisallowed: false,
      },
    ]);
    const vSlider = wrapper.findComponent({ name: 'VSlider' });
    await vSlider.vm.$emit(CHANGE, 0);
    // onMouseDown
    expect(clearInterval).toHaveBeenCalled();
    // onChange
    expect($commit).toHaveBeenNthCalledWith(1, 'playback/SET_POSITION_MS', 0);
    expect($dispatch).toHaveBeenNthCalledWith(1, 'playback/seek', {
      positionMs: 0,
      currentPositionMs: 2.5 * 60 * 1000,
    });
    // setTimer
    expect(setInterval).toHaveBeenCalled();
  });

  it('set position', async () => {
    factory([
      {
        positionMs: 2.5 * 60 * 1000,
        durationMs: 4 * 60 * 1000,
        isPlaying: true,
        isDisallowed: false,
      },
    ]);
    jest.runOnlyPendingTimers();
    // setTimer
    expect(setInterval).toHaveBeenCalled();
    expect($commit).toHaveBeenCalledWith('playback/SET_POSITION_MS', 2.5 * 60 * 1000 + 500);
  });

  it.todo('stop updating seek bar when paused');
  it.todo('start updating seek bar after playing');
  it.todo('add a few seconds');
});
