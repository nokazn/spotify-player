import type dayjs from 'dayjs';
import type {
  RootGetters,
  SFCCommit,
  SFCDispatch,
} from 'typed-vuex';
import type { TypedNuxtAxiosInstance } from 'typed-axios';

import type { SpotifyServices } from '~/services/spotify';
import type { ServerServices } from '~/services/server';
import type { Constant } from '~/plugins/constant';
import type { $Header } from '~/plugins/observable/header';
import type { $Overlay } from '~/plugins/observable/overlay';
import type { $Toast } from '~/plugins/observable/toast';

declare module '@nuxt/types' {

  interface NuxtAppOptions {
    // typed-vuex
    $getters: () => RootGetters;
    $commit: SFCCommit;
    $dispatch: SFCDispatch;

    // plugin
    $constant: Constant;
    $dayjs: typeof dayjs;
    $spotifyApi: TypedNuxtAxiosInstance;
    $spotify: SpotifyServices;
    $serverApi: TypedNuxtAxiosInstance;
    $server: ServerServices;

    // observable
    $header: $Header;
    $overlay: $Overlay;
    $toast: $Toast;
  }
}

declare global {
  interface Window {
    onNuxtReady: (callback: () => void) => void;
  }
}
