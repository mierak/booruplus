import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Spin, Tabs, Tooltip } from 'antd';
import { LoadingOutlined, DisconnectOutlined, GlobalOutlined } from '@ant-design/icons';

import type { RootState, AppDispatch, PostsContext, ContextMode } from '@store/types';

import { CardAction, openNotificationWithIcon } from '@appTypes/components';
import { actions, thunks } from '@store';
import ThumbnailsList from '@components/thumbnails/ThumbnailsList';
import { Post } from '@appTypes/gelbooruTypes';
import { ActiveModal } from '@appTypes/modalTypes';
import PageMenuHeader from '@components/common/PageMenuHeader';
import SearchResultsMenu from '@components/common/SearchResultsMenu';
import { capitalize, generateTabContext } from '@util/utils';
import { deletePostsContext, initPostsContext } from '../store/commonActions';

type Props = {
	className?: string;
};

const Container = styled.div`
	overflow-y: hidden;
	height: 100vh;
`;

const StyledThumbnailsList = styled(ThumbnailsList)`
	overflow: auto;
	max-height: calc(100vh - 72px);
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
	const savedSearchId = useSelector((state: RootState) => state.onlineSearchForm[context].savedSearchId);

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
					dispatch(actions.posts.addPosts({ data: post, context: 'checkLaterQueue' }));
				},
			},
		];
		return (
			<StyledThumbnailsList
				shouldShowLoadMoreButton
				context={context}
				hasHeader
				emptyDataLogoCentered={true}
				actions={thumbnailActions}
			/>
		);
	}
};

const Tab: React.FunctionComponent<{ mode: ContextMode; title: string }> = ({ mode, title }) => {
	const icon = mode === 'online' ? <GlobalOutlined /> : mode === 'offline' ? <DisconnectOutlined /> : null;
	return (
		<span>
			<Tooltip title={capitalize(mode)}>{icon}</Tooltip>
			{title}
		</span>
	);
};

const Searches: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const activeTab = useSelector((state: RootState) => state.system.activeSearchTab);

	const ts = useSelector(
		(state: RootState) => {
			const contexts = Object.keys(state.onlineSearchForm);
			return contexts
				.filter((ctx) => state.onlineSearchForm[ctx].mode !== 'other')
				.map((ctx) => {
					const title = state.onlineSearchForm[ctx]?.selectedTags[0]?.tag ?? 'New Tab';
					return {
						title,
						context: ctx,
						mode: state.onlineSearchForm[ctx].mode,
					};
				});
		},
		(first, second) => {
			return JSON.stringify(first) === JSON.stringify(second);
		}
	);

	return (
		<Container className={props.className}>
			<Tabs
				type='editable-card'
				size='small'
				activeKey={activeTab}
				tabBarStyle={{ marginBottom: 0 }}
				onEdit={(key, action) => {
					if (action === 'add') {
						const context = generateTabContext(ts.map((t) => t.context));
						dispatch(initPostsContext({ context: context, data: { mode: 'online' } }));
						dispatch(actions.modals.showModal(ActiveModal.SEARCH_FORM, { context: context, previousTab: activeTab }));
					} else {
						dispatch(deletePostsContext({ context: key.toString() }));
						dispatch(
							actions.system.setActiveSearchTab([...ts].reverse().find((tab) => tab.context !== key.toString())?.context ?? '')
						);
					}
				}}
				onChange={(tab): void => {
					dispatch(actions.system.setActiveSearchTab(tab));
				}}
			>
				{ts.map((tab) => (
					<Tabs.TabPane
						closable={ts.length > 1}
						key={tab.context}
						tab={<Tab mode={tab.mode} title={tab.title} />}
						style={{ height: '100vh' }}
					>
						<PageMenuHeader menu={<SearchResultsMenu context={tab.context} />} title='Image List' />
						<ThumbnailsListTabContent context={tab.context} />
					</Tabs.TabPane>
				))}
			</Tabs>
		</Container>
	);
};

export default Searches;
