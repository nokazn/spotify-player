import type { Context } from '@nuxt/types';

import { albums } from './albums';
import { artists } from './artists';
import { browse } from './browse';
import { episodes } from './episodes';
import { following } from './following';
import { library } from './library';
import { player } from './player';
import { playlists } from './playlists';
import { search } from './search';
import { shows } from './shows';
import { top } from './top';
import { tracks } from './tracks';
import { users } from './users';

export const spotify = (context: Context) => ({
  albums: albums(context),
  artists: artists(context),
  browse: browse(context),
  episodes: episodes(context),
  following: following(context),
  library: library(context),
  player: player(context),
  playlists: playlists(context),
  search: search(context),
  shows: shows(context),
  top: top(context),
  tracks: tracks(context),
  users: users(context),
});

const endpoints = (context: Context) => spotify(context);
export type SpotifyServices = ReturnType<typeof endpoints>;
