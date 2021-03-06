import { computed, SetupContext } from '@vue/composition-api';

export const useContentPosition = (root: SetupContext['root']) => {
  const styles = computed(() => {
    const { isPc } = root.$screen;
    const isAnotherDevicePlaying: boolean = root.$getters()['playback/deviceState'] === 'another';
    const top = `${root.$constant.HEADER_HEIGHT}px`;
    // ナビゲーションバーが表示されてるかで変わる
    const left = isPc
      ? `${root.$constant.NAVIGATION_DRAWER_WIDTH}px`
      : '0';
    let footerHeight = isPc
      ? root.$constant.FOOTER_HEIGHT
      : root.$constant.FOOTER_HEIGHT_MOBILE + root.$constant.NAVIGATION_BAR_HEIGHT;
    // 他のデバイスで再生中のとき
    if (isAnotherDevicePlaying && isPc) {
      footerHeight += root.$constant.DEVICE_BAR_HEIGHT;
    }
    const bottom = `${footerHeight}px`;

    return {
      position: 'fixed' as const,
      top,
      left,
      bottom,
    };
  });

  return styles;
};
