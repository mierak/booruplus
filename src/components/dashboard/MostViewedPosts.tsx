import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Card, Empty, Tooltip } from 'antd';
import { CheckCircleTwoTone, ReloadOutlined } from '@ant-design/icons';

import { actions, thunks } from '../../store';
import { AppDispatch, RootState } from '../../store/types';

import { Post } from '../../types/gelbooruTypes';
import { mostViewedLoader } from '../../util/componentUtils';

const StyledMostViewedGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
	grid-template-rows: repeat(auto-fit, 225px);
	grid-gap: 10px;
	padding: 10px 10px 10px 10px;
`;

const StyledMostViewedCard = styled(Card)`
	&& > .ant-card-head {
		margin-bottom: 1px;
	}

	&& > .ant-card-body {
		padding: 0px;
		max-height: calc(100vh - 466px);
		height: calc(100vh - 466px);
		overflow-y: auto;
		overflow-x: hidden;
	}
`;

const StyledEmpty = styled(Empty)`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

const StyledThumbnailCard = styled(Card)`
	width: 195px;
	height: 215px;
	&& > .ant-card-body {
		height: 200px;
		padding: 0;
		display: flex;
		justify-content: center;
		flex-direction: column;
	}
`;

const StyledImage = styled.img`
	max-width: 175px;
	max-height: 175px;
`;

const StyledImageContainer = styled.div`
	width: 100%;
	height: 195px;
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	padding: 10px;
`;

const StyledMeta = styled(Card.Meta)`
	display: flex;
	justify-content: center;
`;

const MostViewedPosts: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const mostViewedCount = useSelector((state: RootState) => state.settings.dashboard.mostViewedCount);
	const mostViewedPosts = useSelector((state: RootState) => state.dashboard.mostViewedPosts);
	const shouldLoad = useSelector((state: RootState) => state.settings.dashboard.loadMostViewedPosts);
	const [thumbs, setThumbs] = useState<JSX.Element[]>([]);

	useEffect(() => {
		if (mostViewedPosts.length === 0) {
			shouldLoad && dispatch(thunks.dashboard.fetchMostViewedPosts(mostViewedCount));
		}
	}, [dispatch, mostViewedCount, mostViewedPosts.length, shouldLoad]);

	const handleMostViewedImageClick = useCallback(
		(post: Post): void => {
			dispatch(actions.system.setSearchMode('most-viewed'));
			dispatch(actions.posts.setPosts(mostViewedPosts));
			dispatch(actions.posts.setActivePostIndex(mostViewedPosts.findIndex((p) => p.id === post.id)));
			dispatch(actions.system.setActiveView('image'));
		},
		[dispatch, mostViewedPosts]
	);

	const handleReload = (): void => {
		dispatch(thunks.dashboard.fetchMostViewedPosts(mostViewedCount));
	};

	useEffect(() => {
		(async (): Promise<void> => {
			const promises = mostViewedPosts.map(async (post) => {
				const url = await mostViewedLoader(post, true);
				return (
					<StyledThumbnailCard hoverable key={post.id} onClick={(): void => handleMostViewedImageClick(post)}>
						<StyledImageContainer>
							<StyledImage src={url} alt='most-viewed-thumbnail' />
						</StyledImageContainer>
						<StyledMeta
							description={
								<span>
									Viewed {post.viewCount} times{' '}
									{post.downloaded === 1 && (
										<Tooltip destroyTooltipOnHide title='Downloaded'>
											<CheckCircleTwoTone />
										</Tooltip>
									)}
								</span>
							}
						/>
					</StyledThumbnailCard>
				);
			});
			const posts = await Promise.all(promises);
			setThumbs(posts);
		})();
	}, [handleMostViewedImageClick, mostViewedPosts]);

	return (
		<StyledMostViewedCard title='Most Viewed Posts' size='small' extra={<ReloadOutlined onClick={handleReload} title='Reload' />}>
			<StyledMostViewedGrid>
				{mostViewedPosts.length > 0 ? thumbs : <StyledEmpty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
			</StyledMostViewedGrid>
		</StyledMostViewedCard>
	);
};

export default MostViewedPosts;
