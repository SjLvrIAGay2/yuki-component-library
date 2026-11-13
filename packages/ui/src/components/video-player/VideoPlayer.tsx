import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
  type VideoHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type ButtonHTMLAttributes,
  type ComponentPropsWithRef,
} from 'react';
import {
  PlayerControls,
  PlayerIcon,
  usePlayer,
  VideoControlsExtra,
  type PlayerControlOptions,
} from '../../internal/player';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useLocale } from '../../theme';
import { useAnimation, type AnimationOptions } from '../../animation';
import { mergeProps } from '../../internal/merge-props';
import { useVideoControlsVisibility } from '../../internal/video-controls-visibility';
import {
  useMediaResource,
  mediaFailure,
  formatMediaTime,
  type MediaSource,
  type MediaMetadata,
  type MediaFailure,
} from '../../internal/media';
export { parseMediaMetadata, formatMediaTime } from '../../internal/media';
export type { MediaSource, MediaMetadata, MediaFailure } from '../../internal/media';
export type { PlayerControlOptions, PlayerControlsState } from '../../internal/player';

export interface VideoTrack {
  src: string;
  label: string;
  srcLang: string;
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  default?: boolean;
}
export interface VideoPlayerProps
  extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'>, PlayerControlOptions {
  src?: MediaSource;
  tracks?: readonly VideoTrack[];
  showMetadata?: boolean;
  onMetadata?: (metadata: MediaMetadata) => void;
  onMediaError?: (error: MediaFailure) => void;
  /** Opt in to visibility coordination. Becoming inactive pauses; reactivation never autoplays. */
  active?: boolean;
  animation?: AnimationOptions | false;
  captionProps?: ComponentPropsWithRef<'figcaption'>;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
  renderError?: (error: MediaFailure, actions: { retry: () => void }) => ReactNode;
  mediaProps?: VideoHTMLAttributes<HTMLVideoElement>;
  stageProps?: HTMLAttributes<HTMLDivElement>;
  startButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
}
export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  function VideoPlayer(input, ref) {
    const {
      src,
      tracks = [],
      title: requestedTitle,
      showMetadata = true,
      onMetadata,
      onMediaError,
      onLoadedMetadata,
      onError,
      className,
      style,
      children,
      controls = true,
      controlsVariant = 'custom',
      controlOptions,
      controlsProps,
      playButtonProps,
      timelineProps,
      volumeProps,
      renderControls,
      active = true,
      animation,
      captionProps,
      mediaProps,
      renderEmpty,
      renderLoading,
      renderError,
      stageProps,
      startButtonProps,
      playbackRates,
      preload = 'metadata',
      playsInline = true,
      ...props
    } = useComponentDefaults('VideoPlayer', input);
    const { messages } = useLocale();
    const title = requestedTitle ?? messages.videoTitle;
    const resource = useMediaResource<HTMLVideoElement>(src, children);
    const { media, metadata: current, failure: error } = resource;
    const [container, setContainer] = useState<HTMLElement | null>(null);
    const [caption, setCaption] = useState<HTMLElement | null>(null);
    const requestedCaptionRef = captionProps?.ref;
    const captionRef = useCallback((node: HTMLElement | null) => {
      setCaption(node);
      if (typeof requestedCaptionRef === 'function') requestedCaptionRef(node);
      else if (requestedCaptionRef) {
        (requestedCaptionRef as { current: HTMLElement | null }).current = node;
      }
    }, [requestedCaptionRef]);
    useImperativeHandle(ref, () => media!, [media]);
    const nativeProps = mergeProps<VideoHTMLAttributes<HTMLVideoElement>>(mediaProps, { ...props, onLoadedMetadata, onError });
    const player = usePlayer(media, nativeProps.muted);
    const { duration: _duration, delay: _delay, ...motion } = useAnimation(animation, 'fade');
    useEffect(() => {
      if (!active) media?.pause();
    }, [active, media]);
    const retry = resource.retry;
    const customControls = renderControls
      ? renderControls({ ...player, enabled: resource.enabled && active })
      : undefined;
    const [menuOpen, setMenuOpen] = useState(false);
    const chrome = useVideoControlsVisibility(
      container,
      caption,
      controls && controlsVariant === 'custom',
      menuOpen,
    );
    useEffect(() => {
      setMenuOpen(false);
    }, [resource.key]);
    return (
      <figure
        ref={setContainer}
        {...motion}
        className={cx('yuki-video-player', motion.className, className)}
        style={{ ...motion.style, ...style }}
        data-active={active}
        hidden={props.hidden}
        data-controls-hidden={chrome.hidden}
        data-custom-controls={controls && controlsVariant === 'custom'}
      >
        <div {...stageProps} className={cx('yuki-video-player__stage', stageProps?.className)}>
          <video
            {...nativeProps}
            key={resource.key}
            src={resource.url}
            ref={resource.ref}
            title={title}
            aria-label={nativeProps['aria-label'] ?? title}
            controls={controls && controlsVariant === 'native'}
            autoPlay={active && nativeProps.autoPlay}
            onPlay={(event) => {
              if (!active) event.currentTarget.pause();
              nativeProps.onPlay?.(event);
            }}
            preload={preload}
            playsInline={playsInline}
            onLoadedMetadata={(event) => {
              const value = resource.loaded(event.currentTarget);
              if (value) onMetadata?.(value);
              nativeProps.onLoadedMetadata?.(event);
            }}
            onErrorCapture={(event) => {
              const value = resource.sourceFailed(event.currentTarget, event.target);
              if (value) onMediaError?.(value);
              nativeProps.onErrorCapture?.(event);
            }}
            onError={(event) => {
              if (event.target === event.currentTarget) {
                const value = resource.failed(event.currentTarget);
                if (value) onMediaError?.(value);
              }
              nativeProps.onError?.(event);
            }}
          >
            {tracks.map((track) => (
              <track
                key={`${track.src}-${track.srcLang}`}
                {...track}
                kind={track.kind ?? 'captions'}
              />
            ))}
            {children}
          </video>
          {controls && controlsVariant === 'custom' && !player.playing && (
            <button
              {...startButtonProps}
              className={cx('yuki-video-player__start', startButtonProps?.className)}
              type="button"
              disabled={!resource.enabled || !active || startButtonProps?.disabled}
              aria-label={
                startButtonProps?.['aria-label'] ??
                (player.ended ? messages.replayVideo : messages.playVideo)
              }
              onClick={(event) => {
                startButtonProps?.onClick?.(event);
                if (!event.defaultPrevented) void player.toggle();
              }}
            >
              {startButtonProps?.children !== undefined ? (
                startButtonProps.children
              ) : (
                <PlayerIcon name={player.ended ? 'replay' : 'play'} />
              )}
            </button>
          )}
          {player.waiting &&
            (renderLoading ? (
              renderLoading()
            ) : (
              <span className="yuki-video-player__loading" aria-hidden="true">
                {messages.mediaBuffering}…
              </span>
            ))}
        </div>
        <figcaption
          {...captionProps}
          ref={captionRef}
          className={cx('yuki-video-player__chrome', captionProps?.className)}
        >
          <div className="yuki-video-player__caption">
            <span>{title}</span>
            {showMetadata && (
              <span className="yuki-video-player__metadata">
                {current
                  ? `${current.width} × ${current.height} · ${formatMediaTime(current.duration)}`
                  : resource.hasSource
                    ? messages.mediaMetadataLoading
                    : messages.videoChoose}
              </span>
            )}
          </div>
          {controls &&
            controlsVariant === 'custom' &&
            (renderControls ? (
              customControls
            ) : (
              <PlayerControls
                controlOptions={controlOptions}
                controlsProps={controlsProps}
                playButtonProps={playButtonProps}
                timelineProps={timelineProps}
                volumeProps={volumeProps}
                compact
                summary={
                  <>
                    <span title={title}>{title}</span>
                    {showMetadata && current && (
                      <span className="yuki-video-player__metadata">
                        {current.width} × {current.height}
                      </span>
                    )}
                  </>
                }
                player={player}
                enabled={resource.enabled && active}
                label={title}
                playbackRates={playbackRates}
                menuContainer={chrome.fullscreen ? container : undefined}
                onMenuOpenChange={setMenuOpen}
                extra={
                  <VideoControlsExtra
                    controlOptions={controlOptions}
                    media={media}
                    container={container}
                    onMenuOpenChange={setMenuOpen}
                  />
                }
              />
            ))}
        </figcaption>
        {!resource.hasSource && renderEmpty?.()}
        {error &&
          (renderError ? (
            renderError(mediaFailure(error, messages), { retry })
          ) : (
            <p className="yuki-video-player__error" role="alert">
              {mediaFailure(error, messages).message}
            </p>
          ))}
      </figure>
    );
  },
);
