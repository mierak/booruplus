import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Statistic, Row, Col, Card } from 'antd';

import { RootState } from '../store/types';
import { thunks } from '../store';

import RatingDistributionsChart from '../components/dashboard/RatingDistributionsChart';
import TagStatistic from '../components/dashboard/TagStatistic';
import MostViewedPosts from '../components/dashboard/MostViewedPosts';

interface Props {
	className?: string;
}

const Container = styled.div`
	padding: 10px;
`;

const Dashboard: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();

	const downloadedPostCount = useSelector((state: RootState) => state.dashboard.totalDownloadedPosts);
	const blacklistedPostCount = useSelector((state: RootState) => state.dashboard.totalBlacklistedPosts);
	const favoritePostCount = useSelector((state: RootState) => state.dashboard.totalFavoritesPosts);
	const tagCount = useSelector((state: RootState) => state.dashboard.totalTags);
	const shouldLoadStatistics = useSelector((state: RootState) => state.settings.dashboard.loadTagStatistics);

	useEffect(() => {
		if (shouldLoadStatistics) {
			dispatch(thunks.dashboard.fetchDownloadedPostCount());
			dispatch(thunks.dashboard.fetchBlacklistedPostCount());
			dispatch(thunks.dashboard.fetchFavoritePostCount());
			dispatch(thunks.dashboard.fetchTagCount());
		}
	}, [dispatch, shouldLoadStatistics]);

	return (
		<Container className={props.className}>
			<Row gutter={[10, 10]}>
				<Col xs={6}>
					<Card>
						<Statistic title='Downloaded Posts' value={downloadedPostCount}></Statistic>
					</Card>
				</Col>
				<Col xs={6}>
					<Card>
						<Statistic title='Blacklisted Posts' value={blacklistedPostCount}></Statistic>
					</Card>
				</Col>
				<Col xs={6}>
					<Card>
						<Statistic title='Favorite Posts' value={favoritePostCount}></Statistic>
					</Card>
				</Col>
				<Col xs={6}>
					<Card>
						<Statistic title='Tags in Database' value={tagCount}></Statistic>
					</Card>
				</Col>
			</Row>
			<Row gutter={[10, 10]}>
				<Col xs={8}>
					<RatingDistributionsChart />
				</Col>
				<Col xs={8}>
					<TagStatistic title='Most Searched Tags' type='most-searched' />
				</Col>
				<Col xs={8}>
					<TagStatistic title='Most Favorited Tags' type='most-favorited' />
				</Col>
			</Row>
			<Row gutter={[10, 10]}>
				<Col span={24}>
					<MostViewedPosts />
				</Col>
			</Row>
		</Container>
	);
};

export default Dashboard;
