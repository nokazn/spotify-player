import { mount } from '@vue/test-utils';
import { options } from '~/tests/mocks/mount';
import EpisodeTableRowPc from './EpisodeTableRow.pc.vue';
import { textColorClass, subtextColorClass } from '~/utils/text';
import type { App } from '~/entities';

const CLICK = 'click';
const ON_ROW_CLICKED = 'on-row-clicked';
const ON_MEDIA_BUTTON_CLICKED = 'on-media-button-clicked';
const ON_FAVORITE_BUTTON_CLICKED = 'on-favorite-button-clicked';

const activeClass = 'active--text';
const inactiveClass = 'inactive--text';
const subtextClass = 'subtext--text';
const item = (isPlayable: boolean): App.EpisodeDetail => ({
  index: 1,
  id: 'id',
  name: 'name',
  uri: 'uri',
  description: 'description',
  images: [],
  isPlayable,
  explicit: false,
  releaseDate: '2020',
  releaseDatePrecision: 'year',
  durationMs: 100000,
  resumePoint: {
    fully_played: false,
    resume_position_ms: 0,
  },
  externalUrls: {
    spotify: 'path/to/spotify',
  },
  previewUrl: 'path/to/preview',
  showId: 'showId',
  showName: 'showName',
});
const factory = (
  set: boolean,
  playing: boolean,
  isPlayable: boolean,
  hideAddedAt: boolean = false,
) => {
  return mount(EpisodeTableRowPc, {
    ...options,
    propsData: {
      item: item(isPlayable),
      publisher: 'publisher',
      set,
      playing,
      episodePath: 'path/to/episode',
      titleColor: textColorClass(set, !isPlayable),
      subtitleColor: subtextColorClass(set, !isPlayable),
      releaseDate: 'releaseDate',
      hideAddedAt,
    },
  });
};

describe('EpisodeTableRowPc', () => {
  it('emit when click item', async () => {
    const wrapper = factory(false, false, false);
    await wrapper.trigger(CLICK);
    expect(wrapper.emitted(ON_ROW_CLICKED)?.[0][0]).toEqual(item(false));
  });

  it('emit when click media button', async () => {
    const wrapper = factory(false, false, false);
    await wrapper.vm.$emit(ON_MEDIA_BUTTON_CLICKED, item(false));
    expect(wrapper.emitted(ON_MEDIA_BUTTON_CLICKED)?.[0][0]).toEqual(item(false));
  });

  it('emit when click favorite button', async () => {
    const wrapper = factory(false, false, false);
    await wrapper.vm.$emit(ON_FAVORITE_BUTTON_CLICKED, item(false));
    expect(wrapper.emitted(ON_FAVORITE_BUTTON_CLICKED)?.[0][0]).toEqual(item(false));
  });

  it('change from normal to active', async () => {
    const wrapper = factory(false, false, true);
    const title = wrapper.find('td:nth-child(2) > div > div > *:first-child');
    const subtitle = wrapper.find('td:nth-child(2) > div > div > div.g-small-text');
    expect(title.classes()).not.toContain(activeClass);
    expect(subtitle.classes()).toContain(subtextClass);

    await wrapper.setProps({
      set: true,
      playing: true,
      titleColor: activeClass,
      subtitleColor: activeClass,
    });
    expect(title.classes()).toContain(activeClass);
    expect(subtitle.classes()).toContain(activeClass);
  });

  it('inactive', async () => {
    const wrapper = factory(false, false, false);
    const title = wrapper.find('td:nth-child(2) > div > div > *:first-child');
    const subtitle = wrapper.find('td:nth-child(2) > div > div > div.g-small-text');
    expect(title.classes()).toContain(inactiveClass);
    expect(subtitle.classes()).toContain(inactiveClass);
  });

  it('hideAddedAt prop', async () => {
    const wrapper = factory(false, false, true, true);
    expect(wrapper.findAll('tr > td').length).toBe(5);
    await wrapper.setProps({
      hideAddedAt: false,
    });
    expect(wrapper.findAll('tr > td').length).toBe(6);
  });

  it.todo('explicit item');
});
