import type { CardAction, ContextMenu } from '@appTypes/components';
import type { Post } from '@appTypes/gelbooruTypes';
import type { PostsContext } from '@store/types';

export type ThumbnailProps = {
	context: PostsContext | string;
	index: number;
	contextMenu?: ContextMenu[];
	actions?: CardAction[];
	isScrolling?: boolean;
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
	onMouseMove?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
};

export type ThumbnailImageProps = Pick<
	ThumbnailProps,
	'index' | 'context' | 'onMouseEnter' | 'onMouseLeave' | 'onMouseMove'
>;
