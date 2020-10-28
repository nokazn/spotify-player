import { mount } from '@vue/test-utils';
import { options, mocks } from '~/tests/mocks/mount';
import ArtistCard from './ArtistCard.vue';
import UserAvatar from '~/components/parts/image/UserAvatar.vue';
import Card from '~/components/parts/card/Card.vue';
import type { SpotifyAPI } from '~~/types';

const ON_MEDIA_BUTTON_CLICKED = 'on-media-button-clicked';

const item = (i: number): SpotifyAPI.Artist => ({
  external_urls: {
    spotify: 'path/to/spotify',
  },
  href: 'href',
  name: `name${i}`,
  type: 'artist',
  uri: 'uri',
  id: `id${i}`,
  followers: {
    href: 'path/to/followers',
    total: 10000,
  },
  genres: ['rock', 'indie rock'],
  images: [{
    url: 'path/to/image',
    height: 500,
    width: 500,
  }],
  popularity: 100,
});

const $gettersMock = (set: boolean) => jest.fn().mockReturnValue({
  'playback/isContextSet': jest.fn().mockReturnValue(set),
});
const $stateMock = (isPlaying: boolean) => jest.fn().mockReturnValue({
  playback: {
    isPlaying,
  },
});
const $dispatchMock = jest.fn();

const factory = (set: boolean, playing: boolean) => {
  return mount(ArtistCard, {
    ...options,
    propsData: {
      item: item(1),
    },
    mocks: {
      ...mocks,
      $getters: $gettersMock(set),
      $state: $stateMock(playing),
      $dispatch: $dispatchMock,
      $screen: {
        isMultiColumn: true,
        isSingleColumn: false,
      },
    },
  });
};

describe('ArtistCard', () => {
  it('artist\'s path', async () => {
    const wrapper = factory(false, false);
    await wrapper.findComponent(Card).setData({
      isLoaded: true,
    });
    expect(wrapper.findComponent(Card).props().to).toBe('/artists/id1');
  });

  it('when an artist\'s track is not set', async () => {
    const wrapper = factory(false, false);
    await wrapper.findComponent(Card).setData({
      isLoaded: true,
    });
    expect(wrapper.findComponent(UserAvatar).props().icon).toBe('mdi-play-circle');
  });

  it('when an aritst\'s track set', async () => {
    const wrapper = factory(true, false);
    await wrapper.findComponent(Card).setData({
      isLoaded: true,
    });
    expect(wrapper.findComponent(UserAvatar).props().icon).toBe('mdi-play-circle');
  });

  it('when playing an artist\'s track', async () => {
    const wrapper = factory(true, true);
    await wrapper.findComponent(Card).setData({
      isLoaded: true,
    });
    expect(wrapper.findComponent(UserAvatar).props().icon).toBe('mdi-pause-circle');
  });

  it('play an artist context', async () => {
    const wrapper = factory(false, false);
    await wrapper.findComponent(Card).setData({
      isLoaded: true,
    });
    await wrapper.findComponent(UserAvatar).vm.$emit(ON_MEDIA_BUTTON_CLICKED);
    expect($dispatchMock).toHaveBeenCalledWith('playback/play', {
      contextUri: 'uri',
    });
  });

  it('resume a track', async () => {
    const wrapper = factory(true, false);
    await wrapper.findComponent(Card).setData({
      isLoaded: true,
    });
    await wrapper.findComponent(UserAvatar).vm.$emit(ON_MEDIA_BUTTON_CLICKED);
    expect($dispatchMock).toHaveBeenCalledWith('playback/play');
  });

  it('pause a track', async () => {
    const wrapper = factory(true, true);
    await wrapper.findComponent(Card).setData({
      isLoaded: true,
    });
    await wrapper.findComponent(UserAvatar).vm.$emit(ON_MEDIA_BUTTON_CLICKED);
    expect($dispatchMock).toHaveBeenCalledWith('playback/pause');
  });
});