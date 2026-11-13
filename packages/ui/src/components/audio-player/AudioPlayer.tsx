import {
  forwardRef,
  useImperativeHandle,
  useState,
  type AudioHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
} from 'react';
import {
  PlayerControls,
  PlayerIcon,
  usePlayer,
  type PlayerControlOptions,
} from '../../internal/player';
import { cx } from '../../internal/cx';
import { useComponentDefaults, useLocale } from '../../theme';
import { useAnimation, type AnimationOptions } from '../../animation';
import { mergeProps } from '../../internal/merge-props';
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

export interface AudioPlayerProps
  extends Omit<AudioHTMLAttributes<HTMLAudioElement>, 'src'>, PlayerControlOptions {
  src?: MediaSource;
  description?: string;
  cover?: string;
  showMetadata?: boolean;
  onMetadata?: (metadata: MediaMetadata) => void;
  onMediaError?: (error: MediaFailure) => void;
  /** Opt in to visibility coordination. Becoming inactive pauses; reactivation never autoplays. */
  active?: boolean;
  animation?: AnimationOptions | false;
  captionProps?: HTMLAttributes<HTMLElement>;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
  renderError?: (error: MediaFailure, actions: { retry: () => void }) => ReactNode;
  mediaProps?: AudioHTMLAttributes<HTMLAudioElement>;
  coverProps?: HTMLAttributes<HTMLSpanElement>;
}
export const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(
  function AudioPlayer(input, ref) {
    const {
      src,
      title: requestedTitle,
      description,
      cover,
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
      coverProps,
      playbackRates,
      preload = 'metadata',
      ...props
    } = useComponentDefaults('AudioPlayer', input);
    const { messages } = useLocale();
    const title = requestedTitle ?? messages.audioTitle;
    const resource = useMediaResource<HTMLAudioElement>(src, children);
    const { media, metadata: current, failure: error } = resource;
    useImperativeHandle(ref, () => media!, [media]);
    const nativeProps = mergeProps<AudioHTMLAttributes<HTMLAudioElement>>(mediaProps, { ...props, onLoadedMetadata, onError });
    const player = usePlayer(media, nativeProps.muted);
    const { duration: _duration, delay: _delay, ...motion } = useAnimation(animation, 'fade');
    useEffect(() => {
      if (!active) media?.pause();
    }, [active, media]);
    const retry = resource.retry;
    const customControls = renderControls
      ? renderControls({ ...player, enabled: resource.enabled && active })
      : undefined;
    const [brokenCover, setBrokenCover] = useState<string>();
    return (
      <figure
        {...motion}
        className={cx('yuki-audio-player', motion.className, className)}
        style={{ ...motion.style, ...style }}
        data-active={active}
        hidden={props.hidden}
        data-playing={player.playing}
      >
        <figcaption {...captionProps}>
          <span
            {...coverProps}
            className={cx(
              'yuki-audio-player__art',
              (!cover || brokenCover === cover) && 'yuki-audio-player__art--vinyl',
              coverProps?.className,
            )}
            aria-hidden="true"
          >
            {cover && brokenCover !== cover ? (
              <img src={cover} alt="" onError={() => setBrokenCover(cover)} />
            ) : (
              <span className="yuki-audio-player__disc">
                <PlayerIcon name="music" />
              </span>
            )}
          </span>
          <div>
            <span className="yuki-audio-player__eyebrow">
              {player.playing
                ? messages.mediaPlaying
                : player.ended
                  ? messages.mediaEnded
                  : messages.mediaPreparing}
            </span>
            <strong>{title}</strong>
            {description && <p>{description}</p>}
          </div>
          {showMetadata && (
            <span className="yuki-audio-player__duration">
              {formatMediaTime(current?.duration ?? null)}
            </span>
          )}
        </figcaption>
        <audio
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
          {children}
        </audio>
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
              player={player}
              enabled={resource.enabled && active}
              label={title}
              playbackRates={playbackRates}
            />
          ))}
        {!resource.hasSource &&
          (renderEmpty ? (
            renderEmpty()
          ) : (
            <p className="yuki-audio-player__hint">{messages.audioChoose}</p>
          ))}
        {player.waiting && renderLoading?.()}
        {error &&
          (renderError ? (
            renderError(mediaFailure(error, messages), { retry })
          ) : (
            <p className="yuki-audio-player__error" role="alert">
              {mediaFailure(error, messages).message}
            </p>
          ))}
      </figure>
    );
  },
);
