import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { actions } from 'store/';
import { AppDispatch } from 'store/types';

import { Post } from 'types/gelbooruTypes';
import TagsPopover from './TagsPopover';
import { ImageControl } from 'types/components';
import ImageControls from './ImageControls';

interface Props {
	className?: string;
	post: Post;
}

const Container = styled.div`
	position: relative;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Gif: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const handleOpenWeb = (): void => {
		window.api.send('open-in-browser', `https://gelbooru.com/index.php?page=post&s=view&id=${props.post.id}`);
	};

	const handleTagsPopoverVisibilityChange = (visible: boolean): void => {
		dispatch(actions.system.setTagsPopovervisible(visible));
	};

	const imageControls: ImageControl[] = [
		{
			icon: 'tags-outlined',
			key: 'image-control-show-tags',
			tooltip: 'Show tags',
			popOver: {
				content: <TagsPopover tags={props.post.tags} />,
				autoAdjustOverflow: true,
				onVisibleChange: handleTagsPopoverVisibilityChange,
				trigger: 'click',
			},
		},
		{
			icon: 'global-outlined',
			key: 'image-control-open-web',
			tooltip: 'Open in browser',
			onClick: handleOpenWeb,
		},
	];
	return (
		<Container className={props.className}>
			<img src={props.post.fileUrl} />
			<ImageControls actions={imageControls} />
		</Container>
	);
};

export default Gif;
