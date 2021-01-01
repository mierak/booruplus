import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { Card, Menu, Dropdown, Empty } from 'antd';

import { actions } from '@store';
import { RootState, AppDispatch, PostsContext } from '@store/types';
import { Post } from '@appTypes/gelbooruTypes';
import { CardAction, ContextMenu } from '@appTypes/components';
import { getThumbnailBorder, thumbnailLoader } from '@util/componentUtils';
import { getActions, getDummyActions } from './util';

type Props = {
	context: PostsContext | string;
	index: number;
	contextMenu?: ContextMenu[];
	actions?: CardAction[];
	isScrolling?: boolean;
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
	onMouseMove?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
};

type CardProps = {
	$isActive: string;
	$theme: 'dark' | 'light';
	$height: string;
	$selected: boolean;
};

const StyledCard = styled(Card)<CardProps>`
	cursor: pointer;

	&& {
		border: ${(props): string | undefined => getThumbnailBorder(props.$isActive, props.$theme, props.$selected)};
		width: 195px;
		height: ${(props): string => props.$height};
	}
	&& > .ant-card-actions > li {
		margin-top: 2px;
		margin-bottom: 2px;
	}
`;

const StyledImageContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	padding: 10px;
`;

const StyledThumbnailImage = styled.img`
	max-width: 175px;
	max-height: 175px;
`;

const Thumbnail = (props: Props): React.ReactElement => {
	const dispatch = useDispatch<AppDispatch>();
	const imageRef = React.useRef<HTMLImageElement>(null);

	const activeView = useSelector((state: RootState) => state.system.activeView);
	const post = useSelector((state: RootState) =>
		props.index >= 0 && props.index < state.posts.posts[props.context].length
			? state.posts.posts[props.context][props.index]
			: undefined
	);
	const isActive = useSelector((state: RootState) => props.index === state.posts.selectedIndices[props.context]);
	const theme = useSelector((state: RootState) => state.settings.theme);
	const downloadMissingImage = useSelector((state: RootState) => state.settings.downloadMissingImages);

	useEffect(() => {
		const ref = imageRef.current;
		if (ref && post) {
			let canceled = false;
			const loader = thumbnailLoader(post, true);
			loader.then((url) => {
				if (!canceled) {
					ref.src = url;
				}
			});

			return (): void => {
				canceled = true;
			};
		}
	}, [dispatch, downloadMissingImage, post]);

	if (!post) return <Empty />;

	const handleThumbnailClick = (event: React.MouseEvent): void => {
		event.stopPropagation();
		if (event.ctrlKey) {
			dispatch(actions.posts.setPostSelected({ data: { post: post, selected: !post.selected }, context: props.context }));
		} else if (event.shiftKey) {
			dispatch(actions.posts.selectMultiplePosts({ data: props.index, context: props.context }));
		} else {
			activeView !== 'image' && dispatch(actions.system.setActiveView({ view: 'image', context: props.context }));
			dispatch(actions.posts.setActivePostIndex({ data: props.index, context: props.context }));
		}
	};

	const renderThumbNail = (): React.ReactNode => {
		return (
			<StyledCard
				bodyStyle={{ height: '195px', width: '195px', padding: '0' }}
				$isActive={isActive.toString()}
				$theme={theme}
				$selected={post.selected}
				actions={
					props.actions && !props.isScrolling
						? getActions({ post, context: props.context, actions: props.actions })
						: getDummyActions(theme)
				}
				$height={props.actions !== undefined ? '225px' : '197px'}
			>
				<StyledImageContainer onClick={(event: React.MouseEvent): void => handleThumbnailClick(event)}>
					{post.selected && (
						<CheckCircleTwoTone style={{ fontSize: '20px', position: 'absolute', top: '5px', right: '5px' }} />
					)}
					<StyledThumbnailImage
						ref={imageRef}
						data-testid='thumbnail-image'
						onMouseEnter={(e): void => props.onMouseEnter?.(e, post)}
						onMouseLeave={(e): void => props.onMouseLeave?.(e, post)}
						onMouseMove={(e): void => props.onMouseMove?.(e, post)}
					></StyledThumbnailImage>
				</StyledImageContainer>
			</StyledCard>
		);
	};

	if (!props.contextMenu) return <>{renderThumbNail()}</>;

	const renderWithContextMenu = (menuItems: ContextMenu[]): React.ReactNode => {
		const menu = (
			<Menu>
				{menuItems.map((action) => (
					<Menu.Item key={action.key} onClick={(): void => action.action(post)}>
						{action.title}
					</Menu.Item>
				))}
			</Menu>
		);
		return (
			<Dropdown overlay={menu} trigger={['contextMenu']}>
				{renderThumbNail()}
			</Dropdown>
		);
	};

	return <>{renderWithContextMenu(props.contextMenu)}</>;
};

export default Thumbnail;
