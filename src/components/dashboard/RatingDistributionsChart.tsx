import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Pie } from 'ant-design-pro/lib/Charts';
import { Card, Empty, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import { thunks } from '../../store';
import { RootState, AppDispatch } from '../../store/types';

const StyledRatingDistributionsCard = styled(Card)`
	height: 100%;
`;

const StyledRatingDistributionsLoadingCard = styled(StyledRatingDistributionsCard)`
	&& > .ant-card-body {
		display: flex;
		align-items: center;
	}
`;

const StyledEmpty = styled(Empty)`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

const StyledSpinContainer = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
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

const RatingDistributionsChart: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const theme = useSelector((state: RootState) => state.settings.theme);
	const shouldLoad = useSelector((state: RootState) => state.settings.dashboard.loadRatingDistributionChart);
	const ratingCounts = useSelector((state: RootState) => state.dashboard.ratingCounts);
	const isRatingDistributionChartLoading = useSelector((state: RootState) => state.loadingStates.isRatingDistributionChartLoading);

	useEffect(() => {
		if (!ratingCounts) {
			shouldLoad && dispatch(thunks.dashboard.fetchRatingCounts());
		}
	}, []);

	const ratingCountsData =
		ratingCounts &&
		Object.keys(ratingCounts).map((key) => {
			return {
				x: key,
				y: ratingCounts[key],
			};
		});

	const handleReload = (): void => {
		dispatch(thunks.dashboard.fetchRatingCounts());
	};

	const renderRatingDistributions = (): React.ReactNode => {
		const title = 'Rating Distribution of Downloaded Posts';
		const size = 'small';
		if (isRatingDistributionChartLoading) {
			return (
				<StyledRatingDistributionsLoadingCard title={title} size={size}>
					<StyledEmpty image={Empty.PRESENTED_IMAGE_SIMPLE} />
					<StyledSpinContainer>
						<Spin />
					</StyledSpinContainer>
				</StyledRatingDistributionsLoadingCard>
			);
		} else {
			return (
				<StyledRatingDistributionsCard title={title} size={size} extra={<ReloadOutlined onClick={handleReload} title='Reload' />}>
					<StyledPie
						hasLegend
						title='Rating'
						subTitle='Rating'
						total={(): number => {
							const total = (ratingCountsData && ratingCountsData.map((data) => data.y).reduce((acc, val) => (acc = acc + val))) || 0;
							return total;
						}}
						height={200}
						colors={['#a0d911', '#faad14', '#f5222d']}
						data={ratingCountsData}
						theme={theme}
					/>
				</StyledRatingDistributionsCard>
			);
		}
	};
	return <>{renderRatingDistributions()}</>;
};

export default RatingDistributionsChart;
