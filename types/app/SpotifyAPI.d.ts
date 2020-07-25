import { Merge } from '~~/types/utility-types';

export namespace SpotifyAPI {
  export namespace Auth {
    type Token = {
      access_token: string
      token_type: string
      scope: string
      expires_in: number
      refresh_token?: string
    }

    export namespace GetToken {
      type Params = {
        grant_type: 'authorization_code'
        code: string
        redirect_uri: string
        client_id?: string
        client_secret?: string
      }
    }

    export namespace RefreshToken {
      type Params = {
        grant_type: 'refresh_token'
        refresh_token: string
      }
    }
  }

  type SimpleAlbum = {
    // artist の album を取得すると├に含まれる値
    album_group?: 'album' | 'single' | 'compilation' | 'appears_on'
    album_type: 'album' | 'single' | 'compilation'
    artists: Artist[]
    available_markets: Country[]
    copyrights: Copyright[]
    external_urls: ExternalUrls
    href: string
    id: string
    images: Image[]
    name: string
    release_date: string
    release_date_precision: 'year' | 'month' | 'day'
    restriction: Restriction
    type: 'album'
    uri: string
  }
  type Album = {
    external_ids: ExternalId
    genres: string[]
    label: string
    popularity: number // 0 ~ 100
    tracks: Paging<SimpleTrack>
    total_tracks: number
  } & Omit<SimpleAlbum, 'album_group'>

  type SimpleArtist = {
    external_urls: ExternalUrls
    href: string
    id: string
    name: string
    type: 'artist'
    uri: string
  }
  type Artist = {
    followers: Followers
    genres: string[]
    images: Image[]
    popularity: number
  } & SimpleArtist

  export namespace Browse {
    type NewReleases = Paging<Album>
    type TopArtists = Paging<Artist>
    type TopTracks = Paging<Track>
  }

  type Category = {
    href: string
    icons: Image[]
    id: string
    name: string
  }

  type Context = {
    // @todo
    type: 'artist' | 'playlist' | 'album' | 'track' | 'episode'| string
    href: string
    external_urls: ExternalUrls
    uri: string
  }

  type Copyright = {
    text: string
    type: 'C' | 'P'
  }

  type Device = {
    id: string | null
    is_active: boolean
    is_private_session: boolean
    is_restricted: boolean
    name: string
    type: 'Computer' | 'Tablet' | 'Smartphone' | 'Speaker' | 'TV' | 'AVR' | 'STB' | 'AudioDongle' | 'GameConsole' | 'CastVideo' | 'CastAudio' | 'Automobile' | 'Unknown'
    volume_percent: number
  }

  type Disallows = {
    interrupting_playback?: boolean
    pausing?: boolean
    resuming?: boolean
    seeking?: boolean
    skipping_next?: boolean
    skipping_prev?: boolean
    toggling_repeat_context?: boolean
    toggling_shuffle?: boolean
    toggling_repeat_track?: boolean
    transferring_playback?: boolean
  }

  type SimpleEpisode = {
    audio_preview_url: string | null
    description: string
    duration_ms: number
    explicit: boolean
    external_urls: ExternalUrls
    href: string
    id: string
    images: Image[]
    is_externally_hosted: boolean
    is_playable: boolean
    language: string // deprecated
    languages: string[]
    name: string
    release_date: string
    release_date_precision: 'year' | 'month' | 'day'
    resume_point: ResumePoint
    type: 'episode'
    uri: string
  }
  type Episode = SimpleEpisode & {
    show: SimpleShow
  }

  // @todo
  type ExternalId = Merge<{
    isrc?: string
    ean?: string
    upc?: string
  }, {
    [k: string]: string
  }>

  // @todo
  type ExternalUrls = {
    spotify?: string
  } & {
    [k: string]: string
  }

  type Followers = {
    href: string | null
    total: number | null
  }

  type Image = {
    height?: number | null
    url: string
    width?: number | null
  }

  type LibraryOf<T extends 'album' | 'show' | 'track'> = Paging<{
    added_at: string // timestamp
  } & {
    [k in T]: T extends 'album'
      ? Album
      : T extends 'show'
      ? Show
      : Track
  }>

  type LinkedTrack = {
    external_urls: ExternalUrls
    href: string
    id: string
    type: 'track'
    uri: string
  }

  type Country = 'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 'AQ' | 'AR' | 'AS' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | 'BA' | 'BB' | 'BD' | 'BE' | 'BF' | 'BG' | 'BH' | 'BI' | 'BJ' | 'BL' | 'BM' | 'BN' | 'BO' | 'BQ' | 'BQ' | 'BR' | 'BS' | 'BT' | 'BV' | 'BW' | 'BY' | 'BZ' | 'CA' | 'CC' | 'CD' | 'CF' | 'CG' | 'CH' | 'CI' | 'CK' | 'CL' | 'CM' | 'CN' | 'CO' | 'CR' | 'CU' | 'CV' | 'CW' | 'CX' | 'CY' | 'CZ' | 'DE' | 'DJ' | 'DK' | 'DM' | 'DO' | 'DZ' | 'EC' | 'EE' | 'EG' | 'EH' | 'ER' | 'ES' | 'ET' | 'FI' | 'FJ' | 'FK' | 'FM' | 'FO' | 'FR' | 'GA' | 'GB' | 'GD' | 'GE' | 'GF' | 'GG' | 'GH' | 'GI' | 'GL' | 'GM' | 'GN' | 'GP' | 'GQ' | 'GR' | 'GS' | 'GT' | 'GU' | 'GW' | 'GY' | 'HK' | 'HM' | 'HN' | 'HR' | 'HT' | 'HU' | 'ID' | 'IE' | 'IL' | 'IM' | 'IN' | 'IO' | 'IQ' | 'IR' | 'IS' | 'IT' | 'JE' | 'JM' | 'JO' | 'JP' | 'KE' | 'KG' | 'KH' | 'KI' | 'KM' | 'KN' | 'KP' | 'KR' | 'KW' | 'KY' | 'KZ' | 'LA' | 'LB' | 'LC' | 'LI' | 'LK' | 'LR' | 'LS' | 'LT' | 'LU' | 'LV' | 'LY' | 'MA' | 'MC' | 'MD' | 'ME' | 'MF' | 'MG' | 'MH' | 'MK' | 'ML' | 'MM' | 'MN' | 'MO' | 'MP' | 'MQ' | 'MR' | 'MS' | 'MT' | 'MU' | 'MV' | 'MW' | 'MX' | 'MY' | 'MZ' | 'NA' | 'NC' | 'NE' | 'NF' | 'NG' | 'NI' | 'NL' | 'NO' | 'NP' | 'NR' | 'NU' | 'NZ' | 'OM' | 'PA' | 'PE' | 'PF' | 'PG' | 'PH' | 'PK' | 'PL' | 'PM' | 'PN' | 'PR' | 'PS' | 'PT' | 'PW' | 'PY' | 'QA' | 'RE' | 'RO' | 'RS' | 'RU' | 'RW' | 'SA' | 'SB' | 'SC' | 'SD' | 'SE' | 'SG' | 'SH' | 'SI' | 'SJ' | 'SK' | 'SL' | 'SM' | 'SN' | 'SO' | 'SR' | 'SS' | 'ST' | 'SV' | 'SX' | 'SY' | 'SZ' | 'TC' | 'TD' | 'TF' | 'TG' | 'TH' | 'TJ' | 'TK' | 'TL' | 'TM' | 'TN' | 'TO' | 'TR' | 'TT' | 'TV' | 'TW' | 'TZ' | 'UA' | 'UG' | 'UM' | 'US' | 'UY' | 'UZ' | 'VA' | 'VC' | 'VE' | 'VG' | 'VI' | 'VN' | 'VU' | 'WF' | 'WS' | 'YE' | 'YT' | 'ZA' | 'ZM' | 'ZW'

  type Paging<I> = {
    href: string
    items: I[]
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
  }

  type Cursor = {
    after: string
    before?: string
  }

  type CursorPaging<I> = {
    cursor: Cursor
    href: string
    items: I[]
    limit: number
    next: string | null
    total: number
  }

  export namespace Player {
    type RecentlyPlayed = CursorPaging<{
      context: Context
      played_at: string // timestamp
      track: SimpleTrack
    }>

    type PlayingType = 'track' | 'episode' | 'ad' | 'unknown'
    // アクティブなデバイスが存在しない場合は空文字が返ってくる
    type CurrentPlayback<T extends PlayingType = PlayingType> = '' | {
      actions: {
        disallows: Disallows
      }
      context: Context | null
      currently_playing_type: T
      device: Device
      is_playing: boolean
      item: T extends 'track'
        ? Track
        : T extends 'episode'
        ? Episode | null
        : null
      progress_ms: number | null
      repeat_state: RepeatState
      shuffle_state: 'on' | 'off'
      timestamp: number
    }
  }

  type SimplePlaylist = {
    collaborative: boolean
    description: string | null
    external_urls: ExternalUrls
    href: string
    id: string
    images: Image[]
    name: string
    owner: UserData
    public: boolean | null
    snapshot_id: string
    tracks: {
      href: string
      total: number
    }
    type: 'playlist'
    uri: string
  }
  type Playlist = SimplePlaylist & {
    followers: Followers
    tracks: Paging<PlaylistTrack>
  }
  type PlaylistTrack = {
    added_at: string // timestamp
    added_by: UserData
    is_local: boolean
    track: Track | null
  }
  type PlaylistSnapshot = {
    snapshot_id: string
  }

  // @todo
  type SearchTypes = {
    album: 'albums',
    artist: 'artists',
    track: 'tracks',
    playlist: 'playlists',
    show: 'shows',
    episode: 'episodes',
  }
  type SearchResultBase = {
    albums?: Paging<SimpleAlbum>
    artists?: Paging<Artist>
    tracks?: Paging<Track>
    playlists?: Paging<SimplePlaylist>
    shows?: Paging<SimpleShow>
    episodes?: Paging<SimpleEpisode | null>
  }
  type SearchType = keyof SearchTypes
  // キーが T のものを抜き出す
  type SearchResult<T extends SearchType = SearchType> = Partial<Pick<
    SearchResultBase, SearchTypes[T]
  >>

  type RepeatState = 'off' | 'track' | 'context'

  type Restriction = {
    reason: string
    [k: string]: string
  }

  type ResumePoint = {
    fully_played: boolean
    resume_position_ms: number
  }

  type SimpleShow = {
    available_markets: string[]
    copyrights: Copyright[]
    description: string
    explicit: boolean
    external_urls: ExternalUrls
    href: string
    id: string
    images: Image[]
    is_externally_hosted: boolean
    languages: string[]
    media_type: string
    name: string
    publisher: string
    type: 'show'
    total_episodes: number
    uri: string
  }
  type Show = SimpleShow & {
    episodes: Paging<SimpleEpisode>
  }

  type SimpleTrack = {
    artists: SimpleArtist[]
    available_markets: Country[]
    disc_number: number
    duration_ms: number
    explicit: boolean
    external_urls: ExternalUrls
    href: string
    id: string
    is_playable: boolean
    linked_from: LinkedTrack
    restrictions: Restriction
    name: string
    preview_url: string
    track_number: number
    type: 'track'
    uri: string
    is_local: boolean
  }
  type Track = SimpleTrack & {
    album: SimpleAlbum
    external_ids: ExternalId
    popularity: string
  }

  type UserData = {
    country: Country
    display_name: string | null
    email: string
    explicit_content: {
      filter_enabled: boolean
      filter_locked: boolean
    }
    external_urls: {
      [key: string]: string
    }
    followers: {
      href: string | null,
      total: number
    }
    href: string
    id: string
    images: Image[]
    product: string
    type: string
    uri: string
  }
}