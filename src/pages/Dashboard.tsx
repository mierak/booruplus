import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Statistic, Row, Col, Card, Tag as AntTag, Table } from 'antd';
import { Pie } from 'ant-design-pro/lib/Charts';

import { RootState, TagHistory } from 'store/types';
import { actions } from 'store';

import { getTagColor } from 'util/utils';
import { Post } from 'types/gelbooruTypes';

interface Props {
	className?: string;
}

const Container = styled.div`
	padding: 10px;
`;

const StyledListCard = styled(Card)`
	height: 273px;

	&& > .ant-card-head {
		margin-bottom: 1px;
	}

	& > .ant-card-body {
		overflow: auto;
		max-height: 231px;
		padding-top: 0px;
		padding-bottom: 0;
	}
`;

const StyledMostViewedGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
	grid-template-rows: repeat(auto-fit, 200px);
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
		overflow-y: auto;
		overflow-x: hidden;
	}
`;

const StyledThumbnailCard = styled(Card)`
	width: 170px;
	height: 200px;
	&& > .ant-card-body {
		height: 200px;
		padding: 0;
		display: flex;
		justify-content: center;
		flex-direction: column;
	}
`;

const StyledImageContainer = styled.div`
	width: 100%;
	height: 170px;
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

const StyledPie = styled(Pie)`
	&& .pie-sub-title {
		color: ${(props): string => (props.theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '')};
	}
	&& .antd-pro-charts-pie-legendTitle {
		color: ${(props): string => (props.theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '')};
	}
	&& .antd-pro-charts-pie-percent {
		color: ${(props): string => (props.theme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : '')};
	}
	&& .antd-pro-charts-pie-value {
		color: ${(props): string => (props.theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '')};
	}
`;

const Dashboard: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(actions.dashboard.fetchDownloadedPostCount());
		dispatch(actions.dashboard.fetchBlacklistedPostCount());
		dispatch(actions.dashboard.fetchFavoritePostCount());
		dispatch(actions.dashboard.fetchTagCount());
		dispatch(actions.dashboard.fetchRatingCounts());
		dispatch(actions.dashboard.fetchMostSearchedTags());
		dispatch(actions.dashboard.fetchMostViewedPosts(28));
		dispatch(actions.dashboard.fetchMostFavoritedTags());
	}, []);

	const theme = useSelector((state: RootState) => state.settings.theme);
	const downloadedPostCount = useSelector((state: RootState) => state.dashboard.totalDownloadedPosts);
	const blacklistedPostCount = useSelector((state: RootState) => state.dashboard.totalBlacklistedPosts);
	const favoritePostCount = useSelector((state: RootState) => state.dashboard.totalFavoritesPosts);
	const tagCount = useSelector((state: RootState) => state.dashboard.totalTags);
	const ratingCounts = useSelector((state: RootState) => state.dashboard.ratingCounts);
	const mostSearchedTags = useSelector((state: RootState) => state.dashboard.mostSearchedTags);
	const mostViewedPosts = useSelector((state: RootState) => state.dashboard.mostViewedPosts);
	const mostFavoritedTags = useSelector((state: RootState) => state.dashboard.mostFavoritedTags);

	const ratingCountsData =
		ratingCounts &&
		Object.keys(ratingCounts).map((key) => {
			return {
				x: key,
				y: ratingCounts[key]
			};
		});

	const handleMostViewedImageClick = (post: Post): void => {
		dispatch(actions.system.setSearchMode('most-viewed'));
		dispatch(actions.posts.setPosts(mostViewedPosts));
		dispatch(actions.posts.setActivePostIndex(mostViewedPosts.findIndex((p) => p.id === post.id)));
		dispatch(actions.system.setActiveView('image'));
	};

	const renderActions = (_: unknown, record: TagHistory): JSX.Element => {
		return (
			<div>
				<a
					onClick={(): void => {
						dispatch(actions.onlineSearchForm.setSelectedTags([record.tag]));
						dispatch(actions.onlineSearchForm.fetchPosts());
						dispatch(actions.system.setActiveView('thumbnails'));
					}}
				>
					Online
				</a>
				<span> </span>
				<a
					onClick={(): void => {
						dispatch(actions.downloadedSearchForm.setSelectedTags([record.tag]));
						dispatch(actions.downloadedSearchForm.fetchPosts());
						dispatch(actions.system.setActiveView('thumbnails'));
					}}
					style={{ float: 'right' }}
				>
					Offline
				</a>
			</div>
		);
	};

	const renderTag = (_text: unknown, mostSearchedTag: TagHistory): JSX.Element => {
		return <AntTag color={getTagColor(mostSearchedTag.tag.type)}>{mostSearchedTag.tag.tag}</AntTag>;
	};

	return (
		<Container className={props.className}>
			<Row gutter={10} style={{ marginBottom: '10px' }}>
				<Col xs={6}>
					<Card>
						<Statistic title="Downloaded Posts" value={downloadedPostCount}></Statistic>
					</Card>
				</Col>
				<Col xs={6}>
					<Card>
						<Statistic title="Blacklisted Posts" value={blacklistedPostCount}></Statistic>
					</Card>
				</Col>
				<Col xs={6}>
					<Card>
						<Statistic title="Favorite Posts" value={favoritePostCount}></Statistic>
					</Card>
				</Col>
				<Col xs={6}>
					<Card>
						<Statistic title="Tags With Downloaded Posts" value={tagCount}></Statistic>
					</Card>
				</Col>
			</Row>
			<Row gutter={10} style={{ marginBottom: '10px' }}>
				<Col xs={8}>
					<Card title="Rating Distribution of Downloaded Posts" size="small">
						<StyledPie
							hasLegend
							title="Rating"
							subTitle="Rating"
							total={(): number => {
								const total = (ratingCountsData && ratingCountsData.map((data) => data.y).reduce((acc, val) => (acc = acc + val))) || 0;
								return total;
							}}
							height={200}
							colors={['#a0d911', '#faad14', '#f5222d']}
							data={ratingCountsData}
							theme={theme}
						/>
					</Card>
				</Col>
				<Col xs={8}>
					<StyledListCard title="Most Searched Tags" size="small">
						<Table dataSource={mostSearchedTags} size="small" pagination={false} rowKey="tag">
							<Table.Column title="Tag" dataIndex="tag" render={renderTag} />
							<Table.Column title="Count" dataIndex="count" />
							<Table.Column title="Search" dataIndex="" render={renderActions} width={120} />
						</Table>
					</StyledListCard>
				</Col>
				<Col xs={8}>
					<StyledListCard title="Most Favorited Tags" size="small">
						<Table dataSource={mostFavoritedTags} size="small" pagination={false} rowKey="tag">
							<Table.Column title="Tag" dataIndex="tag" render={renderTag} />
							<Table.Column title="Count" dataIndex="count" />
							<Table.Column title="Search" dataIndex="" render={renderActions} width={120} />
						</Table>
					</StyledListCard>
				</Col>
			</Row>
			<Row gutter={10} style={{ marginBottom: '10px' }}>
				<Col span={24}>
					<StyledMostViewedCard title="Most Viewed Posts" size="small">
						<StyledMostViewedGrid>
							{mostViewedPosts.map((post) => {
								return (
									<StyledThumbnailCard hoverable key={post.id} onClick={(): void => handleMostViewedImageClick(post)}>
										<StyledImageContainer>
											<img src={`https://gelbooru.com/thumbnails/${post.directory}/thumbnail_${post.hash}.jpg`} />
										</StyledImageContainer>
										<StyledMeta description={`Viewed ${post.viewCount} times`} />
									</StyledThumbnailCard>
								);
							})}
						</StyledMostViewedGrid>
					</StyledMostViewedCard>
				</Col>
			</Row>
		</Container>
	);
};

export default Dashboard;
