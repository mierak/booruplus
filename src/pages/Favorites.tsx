import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Layout } from 'antd';

import { actions, thunks } from '@store';
import ThumbnailsList from '@components/thumbnails/ThumbnailsList';
import SiderContent from '@components/favorites/SiderContent';
import { Post } from '@appTypes/gelbooruTypes';
import { RootState, AppDispatch } from '@store/types';
import { CardAction, openNotificationWithIcon } from '@appTypes/components';
import { ActiveModal } from '@appTypes/modalTypes';

type Props = {
	className?: string;
}

type DividerProps = {
	$active: boolean;
}

const Container = styled.div``;

const StyledContent = styled(Layout.Content)`
	height: 100vh;
`;

const StyledSider = styled(Layout.Sider)`
	max-height: 100vh;
`;

const Divider = styled.div<DividerProps>`
	width: 4px;
	height: 100vh;
	cursor: ${(props): string => (props.$active ? 'ew-resize' : 'auto')};
	z-index: 1500;
`;

const DividerDummy = styled.div`
	width: 0px;
	height: 100vh;
	z-index: 1500;
`;

const Favorites: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const theme = useSelector((state: RootState) => state.settings.theme);
	const activeDirectory = useSelector((state: RootState) => state.favorites.activeNodeKey);
	const isSiderCollapsed = useSelector((state: RootState) => state.system.isFavoritesDirectoryTreeCollapsed);
	const siderWidth = useSelector((state: RootState) => state.settings.favorites.siderWidth);

	const dragging = useRef({ value: false });
	const dividerRef = useRef<HTMLDivElement>(null);
	const dividerDummyRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const minGridWidth = 250;
	const minSiderWidth = 100;
	const context = 'favorites';

	useEffect(() => {
		const renderThumbnailList = async (): Promise<void> => {
			dispatch(thunks.favorites.fetchPostsInDirectory(activeDirectory));
		};
		renderThumbnailList();
	}, [activeDirectory, dispatch]);

	const handleBlacklist = async (post: Post): Promise<void> => {
		await dispatch(thunks.posts.blacklistPosts({ context, posts: [post] }));
		await dispatch(thunks.favorites.removePostsFromActiveDirectory([post]));
		openNotificationWithIcon('success', 'Post deleted', 'Image was successfuly deleted from disk.');
	};

	const handleDownload = async (post: Post): Promise<void> => {
		await dispatch(thunks.posts.downloadPost({ context, post }));
		openNotificationWithIcon('success', 'Post downloaded', 'Image was successfuly saved to disk.');
	};

	const handleRemoveFromDirectory = async (post: Post): Promise<void> => {
		await dispatch(thunks.favorites.removePostsFromActiveDirectory([post]));
		openNotificationWithIcon('success', 'Success', 'Successfuly removed post from directory');
	};

	const handleMoveToDirectory = (post: Post): void => {
		dispatch(
			actions.modals.showModal(ActiveModal.MOVE_POSTS_TO_DIRECTORY_SELECTION, {
				postsToMove: [post],
			})
		);
	};

	const toggleCollapse = (): void => {
		dispatch(actions.system.toggleFavoritesDirectoryTreeCollapsed());
	};

	const cardActions: CardAction[] = [
		{
			key: 'card-action-remove-from-favorites',
			icon: 'close-outlined',
			tooltip: 'Remove from this directory',
			onClick: handleRemoveFromDirectory,
			popConfirm: {
				okText: 'Remove',
				cancelText: 'Cancel',
				title: 'Remove from Favorites?',
			},
		},
		{
			key: 'card-action-download',
			tooltip: 'Download post image',
			icon: 'download-outlined',
			onClick: handleDownload,
			condition: (post: Post): boolean => post.downloaded === 0,
		},
		{
			key: 'card-action-blacklist',
			tooltip: 'Blacklist',
			icon: 'delete-outlined',
			onClick: handleBlacklist,
			popConfirm: {
				okText: 'Blacklist',
				cancelText: 'Cancel',
				title: 'Blacklist image?',
			},
		},
		{
			key: 'card-action-move-to-folder',
			tooltip: 'Move to Folder',
			icon: 'folder-outlined',
			onClick: handleMoveToDirectory,
		},
	];

	const onResizeStart = (event: React.MouseEvent<HTMLDivElement>): void => {
		if (isSiderCollapsed || !dividerRef.current || !dividerDummyRef.current) return;

		dividerRef.current.style.backgroundColor = '#177ddc';
		dividerRef.current.style.position = 'absolute';
		dividerRef.current.style.left = `${event.clientX}px`;
		dividerDummyRef.current.style.width = '4px';
		dragging.current.value = true;
	};

	const onResizeEnd = (event: React.MouseEvent<HTMLDivElement>): void => {
		if (
			isSiderCollapsed ||
			!dragging.current.value ||
			!containerRef.current ||
			!dividerRef.current ||
			!dividerDummyRef.current
		)
			return;

		const containerOffsetX = containerRef.current.getBoundingClientRect().left;
		let newWidth = minGridWidth;

		if (event.clientX < containerOffsetX + minGridWidth) {
			newWidth = containerRef.current.clientWidth - minGridWidth;
		} else if (event.clientX > containerRef.current.clientWidth + containerOffsetX - minSiderWidth) {
			newWidth = minSiderWidth;
		} else {
			newWidth = containerRef.current.clientWidth + containerOffsetX - event.clientX;
		}
		dispatch(actions.settings.setFavoritesSiderWidth(newWidth - 2));
		dispatch(thunks.settings.saveSettings());

		dividerRef.current.style.backgroundColor = '';
		dividerRef.current.style.position = 'relative';
		dividerRef.current.style.left = '';
		dividerDummyRef.current.style.width = '0px';

		dragging.current.value = false;
	};

	const onResizeMove = (event: React.MouseEvent<HTMLDivElement>): void => {
		if (isSiderCollapsed || !dragging.current.value || !containerRef.current || !dividerRef.current) return;

		const containerOffsetX = containerRef.current.getBoundingClientRect().left;

		if (event.clientX < containerOffsetX + minGridWidth) {
			dividerRef.current.style.left = `${containerOffsetX + minGridWidth}px`;
		} else if (event.clientX > containerRef.current.clientWidth + containerOffsetX - minSiderWidth) {
			dividerRef.current.style.left = `${containerRef.current.clientWidth + containerOffsetX - minSiderWidth}px`;
		} else {
			dividerRef.current.style.left = `${event.clientX}px`;
		}
	};

	return (
		<Container
			ref={containerRef}
			className={props.className}
			onMouseUp={onResizeEnd}
			onMouseLeave={onResizeEnd}
			onMouseMove={onResizeMove}
		>
			<Layout>
				<StyledContent>
					<ThumbnailsList
						shouldShowLoadMoreButton
						context={context}
						emptyDataLogoCentered={true}
						actions={cardActions}
						hasHeader={false}
					/>
				</StyledContent>
				<Divider ref={dividerRef} $active={!isSiderCollapsed} onMouseDown={onResizeStart} />
				<DividerDummy ref={dividerDummyRef} />
				<StyledSider
					theme={theme}
					collapsible
					reverseArrow
					collapsedWidth={25}
					width={siderWidth}
					onCollapse={toggleCollapse}
					collapsed={isSiderCollapsed}
				>
					<SiderContent />
				</StyledSider>
			</Layout>
		</Container>
	);
};

export default Favorites;
