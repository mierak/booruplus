import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import Pie from '@ant-design/charts/lib/pie';
import { Card, Empty, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import { thunks } from '@store';
import { RootState, AppDispatch } from '@store/types';
import { capitalize } from '@util/utils';

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

const titleFormatter = (record?: Record<string, unknown>): string => {
	if (!record) return 'Total';

	return `${record.type}`;
};

const calculateTotalInRecords = (data: Record<string, unknown>[]): number => {
	return data.reduce((acc, val) => {
		if (typeof val.value === 'number') {
			return acc + val.value;
		}
		return acc;
	}, 0);
};

const contentFormatter = (record: Record<string, unknown> | undefined, data?: Record<string, unknown>[]): string => {
	if (!record && !data) return '';

	if (!record) return data ? calculateTotalInRecords(data).toString() : '';

	return `${record.value}`;
};

const titleStyle = {
	style: {
		fontSize: '1.35rem',
	},
	formatter: titleFormatter,
};

const contentStyle = {
	fontSize: '1.2rem',
	whiteSpace: 'pre-wrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const pieProps: Omit<React.ComponentProps<typeof Pie>, 'data'> = {
	legend: { layout: 'vertical', position: 'right' },
	colorField: 'type',
	angleField: 'value',
	height: 200,
	radius: 0.9,
	innerRadius: 0.75,
	color: ['#a0d911', '#faad14', '#f5222d'],
	statistic: {
		title: {
			style: titleStyle,
			formatter: titleFormatter,
		},
		content: {
			style: contentStyle,
			formatter: contentFormatter,
		},
	},
	interactions: [{ type: 'element-active' }, { type: 'pie-statistic-active' }],
};

const defaultCounts = { safe: 0, questionable: 0, explicit: 0 };

const RatingDistributionsChart: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const theme = useSelector((state: RootState) => state.settings.theme === 'light' ? 'default' : 'dark');
	const shouldLoad = useSelector((state: RootState) => state.settings.dashboard.loadRatingDistributionChart);
	const ratingCounts = useSelector((state: RootState) => state.dashboard.ratingCounts);
	const isRatingDistributionChartLoading = useSelector((state: RootState) => state.loadingStates.isRatingDistributionChartLoading);

	useEffect(() => {
		if (!ratingCounts) {
			shouldLoad && dispatch(thunks.dashboard.fetchRatingCounts());
		}
	}, [dispatch, ratingCounts, shouldLoad]);

	const ratingCountsData = Object.entries(ratingCounts ?? defaultCounts).map(([key, value]) => {
		return {
			type: capitalize(key),
			value: value,
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
					<Pie data={ratingCountsData} theme={theme} {...pieProps} />
				</StyledRatingDistributionsCard>
			);
		}
	};
	return <>{renderRatingDistributions()}</>;
};

export default RatingDistributionsChart;
