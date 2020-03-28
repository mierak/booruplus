import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Statistic, Row, Col, Card, Tag, Table } from 'antd';
import { Pie } from 'ant-design-pro/lib/Charts';

import { RootState } from '../../store/types';
import { actions } from '../../store';

import { capitalize, getTagColor } from '../../util/utils';
import { TagType } from '../../types/gelbooruTypes';

interface Props {
	className?: string;
}

const Container = styled.div`
	padding: 10px;
`;

const ListCard = styled(Card)`
	height: 273px;
	& > .ant-card-body {
		overflow: auto;
		max-height: 233px;
		padding-top: 0;
		padding-bottom: 0;
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
	}, []);

	const downloadedPostCount = useSelector((state: RootState) => state.dashboard.totalDownloadedPosts);
	const blacklistedPostCount = useSelector((state: RootState) => state.dashboard.totalBlacklistedPosts);
	const favoritePostCount = useSelector((state: RootState) => state.dashboard.totalFavoritesPosts);
	const tagCount = useSelector((state: RootState) => state.dashboard.totalTags);
	const ratingCounts = useSelector((state: RootState) => state.dashboard.ratingCounts);
	const mostSearchedTags = useSelector((state: RootState) => state.dashboard.mostSearchedTags);

	const ratingCountsData =
		ratingCounts &&
		Object.keys(ratingCounts).map((key) => {
			return {
				x: capitalize(key),
				y: ratingCounts[key]
			};
		});

	const renderTag = (_text: unknown, tag: { tag: string; count: number; type: TagType }): JSX.Element => {
		return <Tag color={getTagColor(tag.type)}>{capitalize(tag.tag)}</Tag>;
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
				<Col xs={12}>
					<Card title="Rating Distribution of Downloaded Posts" size="small">
						<Pie
							hasLegend
							title="Rating Distribution"
							subTitle="Rating Distribution"
							total={(): number => {
								const total = (ratingCountsData && ratingCountsData.map((data) => data.y).reduce((acc, val) => (acc = acc + val))) || 0;
								return total;
							}}
							height={200}
							colors={['#a0d911', '#faad14', '#f5222d']}
							data={ratingCountsData}
						/>
					</Card>
				</Col>
				<Col xs={12}>
					<ListCard title="Most Searched Tags" size="small">
						<Table dataSource={mostSearchedTags} size="small" pagination={false}>
							<Table.Column title="Tag" dataIndex="tag" render={renderTag} />
							<Table.Column title="Count" dataIndex="count" />
						</Table>
					</ListCard>
				</Col>
			</Row>
			<Row gutter={10} style={{ marginBottom: '10px' }}></Row>
		</Container>
	);
};

export default Dashboard;
