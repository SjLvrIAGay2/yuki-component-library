import { CodeBlock, type CodeBlockProps } from '../code-block';
import { Markdown, type MarkdownProps } from '../markdown';
import { DocumentViewer, type DocumentViewerProps } from '../document-viewer';
import { VideoPlayer, type VideoPlayerProps } from '../video-player';
import { AudioPlayer, type AudioPlayerProps } from '../audio-player';
import { ImageViewer, type ImageViewerProps } from '../image-viewer';
import { useComponentDefaults } from '../../theme';

export type ContentRendererProps =
  | ({ type: 'code' } & CodeBlockProps)
  | ({ type: 'markdown' } & MarkdownProps)
  | ({ type: 'document' } & DocumentViewerProps)
  | ({ type: 'video' } & VideoPlayerProps)
  | ({ type: 'audio' } & AudioPlayerProps)
  | ({ type: 'image' } & ImageViewerProps);

/** Discriminated props preserve each renderer's API and prevent ambiguous URL/content inference. */
export function ContentRenderer(input: ContentRendererProps) {
  const props = useComponentDefaults('ContentRenderer', input);
  switch (props.type) {
    case 'code': {
      const { type: _type, ...rest } = props;
      return <CodeBlock {...rest} />;
    }
    case 'markdown': {
      const { type: _type, ...rest } = props;
      return <Markdown {...rest} />;
    }
    case 'document': {
      const { type: _type, ...rest } = props;
      return <DocumentViewer {...rest} />;
    }
    case 'video': {
      const { type: _type, ...rest } = props;
      return <VideoPlayer {...rest} />;
    }
    case 'audio': {
      const { type: _type, ...rest } = props;
      return <AudioPlayer {...rest} />;
    }
    case 'image': {
      const { type: _type, ...rest } = props;
      return <ImageViewer {...rest} />;
    }
  }
}
