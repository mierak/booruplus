import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { Spin, Tabs as AntTabs } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import type { RootState, AppDispatch, PostsContext } from '@store/types';

import { CardAction, openNotificationWithIcon, TabAction } from '@appTypes/components';
import { actions, thunks } from '@store';
import ThumbnailsList from '@components/thumbnails/ThumbnailsList';
import { Post } from '@appTypes/gelbooruTypes';
import { ActiveModal } from '@appTypes/modalTypes';
import PageMenuHeader from '@components/common/PageMenuHeader';
import SearchResultsMenu from '@components/common/SearchResultsMenu';
import { deletePostsContext, initPostsContext } from '../store/commonActions';
import SearchTab from '@components/common/SearchTab';

type Props = {
	className?: string;
};

const Container = styled.div`
	overflow-y: hidden;
	height: 100vh;
`;

const StyledThumbnailsList = styled(ThumbnailsList)`
	overflow: auto;
	height: 100%;
`;

const StyledSpin = styled(Spin)`
	&& {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
`;

const ThumbnailsListTabContent: React.FunctionComponent<{ context: PostsContext | string }> = ({ context }) => {
	const dispatch = useDispatch<AppDispatch>();
	const isFetchingPosts = useSelector((state: RootState) => state.loadingStates.isFetchingPosts);
	const savedSearchId = useSelector((state: RootState) => state.searchContexts[context].savedSearchId);
	const hasHeader = useSelector((state: RootState) => state.searchContexts[context].mode !== 'other');

	if (isFetchingPosts) {
		return <StyledSpin indicator={<LoadingOutlined style={{ fontSize: '64px' }} />} />;
	} else {
		const handleFavorite = (post: Post): void => {
			dispatch(actions.modals.showModal(ActiveModal.ADD_POSTS_TO_FAVORITES, { postsToFavorite: [post] }));
		};

		const handleBlacklist = (post: Post): void => {
			dispatch(thunks.posts.blacklistPosts({ context, posts: [post] }));
			openNotificationWithIcon('success', 'Post deleted', 'Image was successfuly deleted from disk.');
		};

		const handleDownload = async (post: Post): Promise<void> => {
			await dispatch(thunks.posts.downloadPost({ context, post }));
			openNotificationWithIcon('success', 'Post downloaded', 'Image was successfuly saved to disk.');
		};

		const handleAddPreview = (post: Post): void => {
			dispatch(thunks.savedSearches.addPreviewsToSavedSearch({ savedSearchId, posts: [post] }));
			openNotificationWithIcon('success', 'Preview added', 'Preview was successfuly added to saved search');
		};
		const thumbnailActions: CardAction[] = [
			{
				key: 'card-action-add-to-favorites',
				tooltip: 'Add to favorites',
				icon: 'heart-outlined',
				onClick: handleFavorite,
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
				key: 'card-action-add-preview-to-saved-search',
				tooltip: 'Add preview',
				icon: 'plus-outlined',
				onClick: handleAddPreview,
				condition: (_: Post): boolean => savedSearchId !== undefined,
				popConfirm: {
					okText: 'Add',
					cancelText: 'Cancel',
					title: 'Add preview to Saved Search?',
				},
			},
			{
				key: 'card-action-add-to-queue',
				tooltip: 'Check Later',
				icon: 'clock-circle-outlined',
				onClick: (post: Post): void => {
					dispatch(actions.searchContexts.addPosts({ data: post, context: 'checkLaterQueue' }));
				},
			},
		];
		return (
			<StyledThumbnailsList
				shouldShowLoadMoreButton
				context={context}
				hasHeader={hasHeader}
				emptyDataLogoCentered={true}
				actions={thumbnailActions}
			/>
		);
	}
};

const Searches: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const { tabs, activeTab, shouldRenderHeader } = useSelector(
		(state: RootState) => {
			const contexts = Object.keys(state.searchContexts).filter((ctx) => state.searchContexts[ctx].mode !== 'system');
			const currentTab = state.system.activeSearchTab;

			const tss = contexts.map((ctx) => {
				const title = state.searchContexts[ctx]?.tabName ?? '';
				return {
					title,
					context: ctx,
					mode: state.searchContexts[ctx].mode,
				};
			});

			if (contexts.includes(currentTab)) {
				const mode = state.searchContexts[currentTab].mode;
				return {
					tabs: tss,
					activeTab: currentTab,
					shouldRenderHeader: mode !== 'other',
				};
			} else {
				const mode = contexts.length ? state.searchContexts[contexts[contexts.length - 1]] : 'other';
				return {
					tabs: tss,
					activeTab: contexts.length ? contexts[contexts.length - 1] : undefined,
					shouldRenderHeader: mode !== 'other',
				};
			}
		},
		(first, second) => {
			return JSON.stringify(first) === JSON.stringify(second);
		}
	);

	const tabsContextMenu: TabAction[] = [
		{
			key: 'reload',
			title: 'Reload from first page',
			icon: 'reload-outlined',
			disabled: (_, mode) => mode === 'other',
			onClick: (context, mode) => {
				dispatch(actions.searchContexts.updateContext({ context, data: { page: 0 } }));
				if (mode === 'online') {
					dispatch(thunks.onlineSearches.fetchPosts({ context }));
				} else if (mode === 'offline') {
					dispatch(thunks.offlineSearches.fetchPosts({ context }));
				}
			},
		},
		{
			key: 'rename',
			title: 'Rename',
			icon: 'dash-outlined',
			disabled: (_, mode) => mode === 'other',
			onClick: (context) => {
				dispatch(actions.modals.showModal(ActiveModal.RENAME_TAB, { context }));
			},
		},
		{
			key: 'edit',
			title: 'Edit search parameters',
			icon: 'edit-outlined',
			disabled: (_, mode) => mode === 'other',
			onClick: (context) => {
				dispatch(actions.modals.showModal(ActiveModal.SEARCH_FORM, { context }));
			},
		},
		{
			key: 'close',
			title: 'Close',
			icon: 'close-outlined',
			disabled: () => tabs.length <= 1,
			onClick: (context) => {
				dispatch(deletePostsContext({ context }));
			},
		},
	];

	return (
		<Container className={props.className}>
			<AntTabs
				type='editable-card'
				size='small'
				activeKey={activeTab}
				tabBarStyle={{ marginBottom: 0 }}
				onEdit={async (key, action) => {
					if (action === 'add') {
						const context = unwrapResult(await dispatch(thunks.searchContexts.generateSearchContext()));
						dispatch(initPostsContext({ context: context, data: { mode: 'online' } }));
						dispatch(actions.modals.showModal(ActiveModal.SEARCH_FORM, { context, deleteOnClose: true }));
					} else {
						dispatch(deletePostsContext({ context: key.toString() }));
					}
				}}
				onChange={(tab): void => {
					dispatch(actions.system.setActiveSearchTab(tab));
				}}
			>
				{tabs.map((tab) => (
					<AntTabs.TabPane
						closable={tabs.length > 1}
						key={tab.context}
						tab={
							<SearchTab hasTooltip mode={tab.mode} title={tab.title} contextMenu={tabsContextMenu} context={tab.context} />
						}
						style={{ height: '100vh' }}
					>
						{shouldRenderHeader && <PageMenuHeader menu={<SearchResultsMenu context={tab.context} />} title='Image List' />}
						<ThumbnailsListTabContent context={tab.context} />
					</AntTabs.TabPane>
				))}
			</AntTabs>
		</Container>
	);
};

export default Searches;
