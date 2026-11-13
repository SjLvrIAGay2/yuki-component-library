import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
} from 'react';
import { formatMediaTime } from './media';
import { FormItemControlContext } from '../components/form/context';
import { Select } from '../components/select';
import { formatMessage } from '../locale';
import { useLocale } from '../theme';
import { Icon } from '../components/icon';

export interface PlayerControlOptions {
  /** Custom controls by default; native remains available as an explicit fallback. */
  controlsVariant?: 'custom' | 'native';
  playbackRates?: readonly number[];
  controlOptions?: {
    timeline?: boolean;
    skip?: boolean;
    volume?: boolean;
    playbackRate?: boolean;
    captions?: boolean;
    fullscreen?: boolean;
    skipSeconds?: number;
  };
  controlsProps?: HTMLAttributes<HTMLDivElement>;
  playButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  timelineProps?: InputHTMLAttributes<HTMLInputElement>;
  volumeProps?: InputHTMLAttributes<HTMLInputElement>;
  /** Replace custom controls using public state/actions; native controls are unaffected. */
  renderControls?: (state: PlayerControlsState) => ReactNode;
}
export type PlayerControlsState = ReturnType<typeof usePlayer> & { enabled: boolean };

function snapshot(media: HTMLMediaElement | null) {
  const duration = media && Number.isFinite(media.duration) ? Math.max(0, media.duration) : 0;
  return {
    playing: media ? !media.paused && !media.ended : false,
    time: media?.currentTime || 0,
    duration,
    buffered:
      media && duration && media.buffered.length
        ? (media.buffered.end(media.buffered.length - 1) / duration) * 100
        : 0,
    volume: media?.volume ?? 1,
    muted: media?.muted ?? false,
    rate: media?.playbackRate ?? 1,
    ended: media?.ended ?? false,
  };
}

export function usePlayer(media: HTMLMediaElement | null, muted?: boolean) {
  const { messages } = useLocale();
  const [state, setState] = useState(() => snapshot(null));
  const [waiting, setWaiting] = useState(false);
  const [failure, setFailure] = useState<'play' | 'seek' | ''>('');
  const error =
    failure === 'play'
      ? messages.mediaPlayFailure
      : failure === 'seek'
        ? messages.mediaSeekFailure
        : '';
  const current = useRef(media);
  current.current = media;
  const mutedProp = useRef(muted);
  mutedProp.current = muted;
  const preferences = useRef<{ volume: number; muted: boolean; rate: number } | undefined>(
    undefined,
  );
  const syncState = (element: HTMLMediaElement) => {
    if (current.current !== element) return;
    const next = snapshot(element);
    preferences.current = { volume: next.volume, muted: next.muted, rate: next.rate };
    setState(next);
  };
  useEffect(() => {
    setFailure('');
    setWaiting(false);
    if (!media) {
      setState(snapshot(null));
      return;
    }
    if (preferences.current) {
      media.volume = preferences.current.volume;
      media.defaultPlaybackRate = preferences.current.rate;
      media.playbackRate = preferences.current.rate;
      if (mutedProp.current === undefined) media.muted = preferences.current.muted;
    }
    const sync = () => syncState(media);
    sync();
    const busy = () => {
      if (current.current !== media) return;
      setWaiting(true);
      sync();
    };
    const ready = () => {
      if (current.current !== media) return;
      setWaiting(false);
      sync();
    };
    const events = [
      'loadedmetadata',
      'durationchange',
      'timeupdate',
      'progress',
      'volumechange',
      'ratechange',
      'play',
    ];
    const readyEvents = ['playing', 'canplay', 'pause', 'ended', 'error', 'emptied', 'seeked'];
    events.forEach((event) => media.addEventListener(event, sync));
    readyEvents.forEach((event) => media.addEventListener(event, ready));
    media.addEventListener('waiting', busy);
    media.addEventListener('seeking', busy);
    return () => {
      preferences.current = {
        volume: media.volume,
        muted: media.muted,
        rate: media.playbackRate,
      };
      events.forEach((event) => media.removeEventListener(event, sync));
      readyEvents.forEach((event) => media.removeEventListener(event, ready));
      media.removeEventListener('waiting', busy);
      media.removeEventListener('seeking', busy);
    };
  }, [media]);
  const toggle = async () => {
    if (!media) return;
    setFailure('');
    if (!media.paused && !media.ended) {
      media.pause();
      return;
    }
    try {
      await media.play();
    } catch (cause) {
      if (current.current === media && (cause as Error)?.name !== 'AbortError') setFailure('play');
    }
  };
  const seek = (value: number) => {
    if (!media || !state.duration) return;
    try {
      media.currentTime = Math.min(state.duration, Math.max(0, value));
      syncState(media);
    } catch {
      setFailure('seek');
    }
  };
  const volume = (value: number) => {
    if (media) {
      media.volume = Math.max(0, Math.min(1, value));
      media.muted = value === 0;
      syncState(media);
    }
  };
  const mute = () => {
    if (media) {
      media.muted = !(media.muted || media.volume === 0);
      if (!media.muted && media.volume === 0) media.volume = 1;
      syncState(media);
    }
  };
  const rate = (value: number) => {
    if (media) {
      media.playbackRate = value;
      syncState(media);
    }
  };
  return {
    ...state,
    waiting,
    error,
    toggle,
    seek,
    volumeTo: volume,
    toggleMute: mute,
    rateTo: rate,
  };
}

export function PlayerIcon({
  name,
  seconds = 10,
}: {
  name:
    | 'play'
    | 'pause'
    | 'replay'
    | 'volume'
    | 'mute'
    | 'expand'
    | 'collapse'
    | 'back'
    | 'forward'
    | 'music';
  seconds?: number;
}) {
  const paths: Record<typeof name, ReactNode> = {
    play: <path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none" />,
    pause: <path d="M7 5h3v14H7zm7 0h3v14h-3z" fill="currentColor" stroke="none" />,
    replay: (
      <>
        <path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" />
      </>
    ),
    volume: (
      <>
        <path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
      </>
    ),
    mute: (
      <>
        <path d="m11 4-6 5H2v6h3l6 5zM16 9l6 6m0-6-6 6" />
      </>
    ),
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
    collapse: <path d="M3 8h5V3m8 0v5h5M8 21v-5H3m18 0h-5v5" />,
    back: (
      <>
        <path d="m4 8 5-5M4 8h7m-7 0a9 9 0 1 1-1 8" />
        <text x="9" y="16" fill="currentColor" stroke="none" fontSize="9" fontWeight="600">
          {seconds}
        </text>
      </>
    ),
    forward: (
      <>
        <path d="m20 8-5-5m5 5h-7m7 0a9 9 0 1 0 1 8" />
        <text x="7" y="16" fill="currentColor" stroke="none" fontSize="9" fontWeight="600">
          {seconds}
        </text>
      </>
    ),
    music: (
      <>
        <path d="M9 18V5l11-2v13M9 8l11-2" />
        <ellipse cx="6" cy="18" rx="3" ry="3" />
        <ellipse cx="17" cy="16" rx="3" ry="3" />
      </>
    ),
  };
  return (
    <Icon size="1.25em">{paths[name]}</Icon>
  );
}

export function PlayerControls({
  player,
  enabled,
  playbackRates = [0.5, 1, 1.5, 2],
  extra,
  label,
  menuContainer,
  onMenuOpenChange,
  compact = false,
  summary,
  controlOptions,
  controlsProps,
  playButtonProps,
  timelineProps,
  volumeProps,
}: {
  player: ReturnType<typeof usePlayer>;
  enabled: boolean;
  playbackRates?: readonly number[];
  extra?: ReactNode;
  label: string;
  menuContainer?: HTMLElement | null;
  onMenuOpenChange?: (open: boolean) => void;
  compact?: boolean;
  summary?: ReactNode;
  controlOptions?: PlayerControlOptions['controlOptions'];
  controlsProps?: HTMLAttributes<HTMLDivElement>;
  playButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  timelineProps?: InputHTMLAttributes<HTMLInputElement>;
  volumeProps?: InputHTMLAttributes<HTMLInputElement>;
}) {
  const { messages } = useLocale();
  const rates = [
    ...new Set([
      1,
      ...playbackRates.filter((rate) => Number.isFinite(rate) && rate >= 0.25 && rate <= 4),
      player.rate,
    ]),
  ].sort((a, b) => a - b);
  const progress = player.duration ? Math.min(100, (player.time / player.duration) * 100) : 0;
  const skipSeconds =
    Number.isFinite(controlOptions?.skipSeconds) && controlOptions!.skipSeconds! > 0
      ? controlOptions!.skipSeconds!
      : 10;
  return (
    <div
      {...controlsProps}
      className={`yuki-player-controls${compact ? ' yuki-player-controls--video' : ''} ${controlsProps?.className ?? ''}`}
      role={controlsProps?.role ?? 'group'}
      aria-label={
        controlsProps?.['aria-label'] ?? formatMessage(messages.mediaControls, { name: label })
      }
    >
      {controlOptions?.timeline !== false && (
        <div className="yuki-player-controls__timeline">
          <span className="yuki-player-controls__time">{formatMediaTime(player.time)}</span>
          <input
            {...timelineProps}
            className={`yuki-player-controls__range ${timelineProps?.className ?? ''}`}
            type="range"
            min={0}
            max={player.duration || 1}
            step="0.1"
            value={Math.min(player.time, player.duration || 1)}
            disabled={!enabled || !player.duration || timelineProps?.disabled}
            aria-label={timelineProps?.['aria-label'] ?? messages.mediaProgress}
            aria-valuetext={`${formatMediaTime(player.time)} / ${formatMediaTime(player.duration || null)}`}
            style={
              {
                '--yuki-player-progress': `${progress}%`,
                '--yuki-player-buffered': `${Math.min(100, player.buffered)}%`,
                ...timelineProps?.style,
              } as CSSProperties
            }
            onChange={(event) => {
              timelineProps?.onChange?.(event);
              if (!event.defaultPrevented) player.seek(Number(event.target.value));
            }}
          />
          <span className="yuki-player-controls__time">
            {formatMediaTime(player.duration || null)}
          </span>
        </div>
      )}
      <div className="yuki-player-controls__row">
        <button
          {...playButtonProps}
          type="button"
          className={`yuki-player-controls__play ${playButtonProps?.className ?? ''}`}
          disabled={!enabled || playButtonProps?.disabled}
          onClick={(event) => {
            playButtonProps?.onClick?.(event);
            if (!event.defaultPrevented) void player.toggle();
          }}
          aria-label={
            playButtonProps?.['aria-label'] ??
            (player.playing ? messages.pause : player.ended ? messages.replay : messages.play)
          }
        >
          {playButtonProps?.children !== undefined ? (
            playButtonProps.children
          ) : (
            <PlayerIcon name={player.playing ? 'pause' : player.ended ? 'replay' : 'play'} />
          )}
        </button>
        {compact && (
          <span className="yuki-player-controls__clock">
            {formatMediaTime(player.time)}
            <span aria-hidden="true"> / </span>
            {formatMediaTime(player.duration || null)}
          </span>
        )}
        {controlOptions?.skip !== false && (
          <>
            <button
              type="button"
              className="yuki-player-controls__button yuki-player-controls__skip"
              disabled={!enabled || !player.duration}
              aria-label={messages.skipBackward.replace('10', String(skipSeconds))}
              onClick={() => player.seek(player.time - skipSeconds)}
            >
              <PlayerIcon name="back" seconds={skipSeconds} />
            </button>
            <button
              type="button"
              className="yuki-player-controls__button yuki-player-controls__skip"
              disabled={!enabled || !player.duration}
              aria-label={messages.skipForward.replace('10', String(skipSeconds))}
              onClick={() => player.seek(player.time + skipSeconds)}
            >
              <PlayerIcon name="forward" seconds={skipSeconds} />
            </button>
          </>
        )}
        {compact && summary && <span className="yuki-player-controls__summary">{summary}</span>}
        <span className="yuki-player-controls__spacer" />
        {controlOptions?.volume !== false && (
          <div className="yuki-player-controls__volume">
            <button
              type="button"
              className="yuki-player-controls__button"
              aria-label={player.muted || !player.volume ? messages.unmute : messages.mute}
              onClick={player.toggleMute}
            >
              <PlayerIcon name={player.muted || !player.volume ? 'mute' : 'volume'} />
            </button>
            <input
              {...volumeProps}
              className={`yuki-player-controls__range ${volumeProps?.className ?? ''}`}
              type="range"
              min="0"
              max="1"
              step="0.01"
              aria-label={volumeProps?.['aria-label'] ?? messages.volume}
              aria-valuetext={`${Math.round((player.muted ? 0 : player.volume) * 100)}%`}
              value={player.muted ? 0 : player.volume}
              onChange={(event) => {
                volumeProps?.onChange?.(event);
                if (!event.defaultPrevented) player.volumeTo(Number(event.target.value));
              }}
              style={
                {
                  '--yuki-player-progress': `${(player.muted ? 0 : player.volume) * 100}%`,
                  ...volumeProps?.style,
                } as CSSProperties
              }
            />
          </div>
        )}
        {controlOptions?.playbackRate !== false && (
          <FormItemControlContext.Provider value={null}>
            <Select
              size="sm"
              className="yuki-player-controls__select"
              aria-label={messages.playbackRate}
              value={String(player.rate)}
              onChange={(value) => player.rateTo(Number(value))}
              options={rates.map((rate) => ({ value: String(rate), label: `${rate}×` }))}
              popupWidth="content"
              portalContainer={menuContainer}
              onOpenChange={onMenuOpenChange}
            />
          </FormItemControlContext.Provider>
        )}
        {extra}
        {controlsProps?.children}
      </div>
      {player.error && (
        <p className="yuki-player-controls__error" role="alert">
          {player.error}
        </p>
      )}
      <span className="yuki-visually-hidden" role="status">
        {player.waiting ? messages.mediaBuffering : ''}
      </span>
    </div>
  );
}

export function VideoControlsExtra({
  media,
  container,
  onMenuOpenChange,
  controlOptions,
}: {
  media: HTMLVideoElement | null;
  container: HTMLElement | null;
  onMenuOpenChange?: (open: boolean) => void;
  controlOptions?: PlayerControlOptions['controlOptions'];
}) {
  const { messages } = useLocale();
  const [full, setFull] = useState(false);
  const [error, setError] = useState(false);
  const [captions, setCaptions] = useState<{ label: string; index: number; showing: boolean }[]>(
    [],
  );
  useEffect(() => {
    if (!media?.textTracks) {
      setCaptions([]);
      return;
    }
    const update = () =>
      setCaptions(
        Array.from(media.textTracks)
          .map((track, index) => ({ track, index }))
          .filter(({ track }) => ['subtitles', 'captions'].includes(track.kind))
          .map(({ track, index }) => ({
            label:
              track.label ||
              track.language ||
              formatMessage(messages.caption, { index: index + 1 }),
            index,
            showing: track.mode === 'showing',
          })),
      );
    update();
    // TextTrackList does not notify when an existing <track>'s label/kind changes.
    const observer = new MutationObserver(update);
    observer.observe(media, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['label', 'srclang', 'kind', 'src', 'default'],
    });
    const events = ['addtrack', 'removetrack', 'change'];
    events.forEach((event) => media.textTracks.addEventListener?.(event, update));
    media.addEventListener('loadedmetadata', update);
    return () => {
      observer.disconnect();
      events.forEach((event) => media.textTracks.removeEventListener?.(event, update));
      media.removeEventListener('loadedmetadata', update);
    };
  }, [media, messages.caption]);
  useEffect(() => {
    const update = () => setFull(document.fullscreenElement === container && !!container);
    document.addEventListener('fullscreenchange', update);
    update();
    return () => document.removeEventListener('fullscreenchange', update);
  }, [container]);
  const toggleFullscreen = async () => {
    try {
      setError(false);
      if (full) await document.exitFullscreen();
      else await container?.requestFullscreen();
    } catch {
      setError(true);
    }
  };
  return (
    <>
      {controlOptions?.captions !== false && captions.length > 0 && (
        <FormItemControlContext.Provider value={null}>
          <Select
            size="sm"
            className="yuki-player-controls__select yuki-player-controls__captions"
            aria-label={messages.captions}
            value={String(captions.find((track) => track.showing)?.index ?? -1)}
            popupWidth="content"
            portalContainer={full ? container : undefined}
            onOpenChange={onMenuOpenChange}
            onChange={(value) => {
              if (media)
                Array.from(media.textTracks).forEach((track, index) => {
                  if (['subtitles', 'captions'].includes(track.kind))
                    track.mode = index === Number(value) ? 'showing' : 'disabled';
                });
            }}
            options={[
              { value: '-1', label: messages.captionsOff },
              ...captions.map((track) => ({ value: String(track.index), label: track.label })),
            ]}
          />
        </FormItemControlContext.Provider>
      )}
      {controlOptions?.fullscreen !== false && container?.requestFullscreen && (
        <button
          className="yuki-player-controls__button"
          type="button"
          aria-label={full ? messages.exitFullscreen : messages.fullscreen}
          onClick={() => void toggleFullscreen()}
        >
          <PlayerIcon name={full ? 'collapse' : 'expand'} />
        </button>
      )}
      {error && (
        <span role="alert" className="yuki-player-controls__error">
          {messages.fullscreenFailure}
        </span>
      )}
    </>
  );
}
