import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { Form, Row, Col, Checkbox, InputNumber } from 'antd';

import { thunks, actions } from 'store/';
import { RootState, AppDispatch } from 'store/types';

const { Item } = Form;

const Dashboard: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const settings = useSelector((state: RootState) => state.settings.dashboard);

	const handleMostViewedCountChange = (value: number | undefined): void => {
		value && dispatch(actions.settings.setMostViewedCount(value));
	};

	const handleCheckboxMostSearched = (event: CheckboxChangeEvent): void => {
		dispatch(actions.settings.setLoadMostSearchedTags(event.target.checked));
	};

	const handleCheckboxMostFavorited = (event: CheckboxChangeEvent): void => {
		dispatch(actions.settings.setLoadMostFavoritedTags(event.target.checked));
	};

	const handleCheckboxMostViewed = (event: CheckboxChangeEvent): void => {
		dispatch(actions.settings.setLoadMostViewedPosts(event.target.checked));
	};

	const handleCheckboxTagStatistic = (event: CheckboxChangeEvent): void => {
		dispatch(actions.settings.setLoadTagStatistics(event.target.checked));
	};

	const handleCheckboxRatingDistribution = (event: CheckboxChangeEvent): void => {
		dispatch(actions.settings.setLoadRatingDistribution(event.target.checked));
	};

	return (
		<Form>
			<Row>
				<Col span={24}>
					<Item label="Load on app start" labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}>
						<Checkbox name="chb-most-searched" checked={settings.loadMostSearchedTags} onChange={handleCheckboxMostSearched}>
							Most Searched Tags
						</Checkbox>
						<Checkbox name="chb-most-favorited" checked={settings.loadMostFavoritedTags} onChange={handleCheckboxMostFavorited}>
							Most Favorited Tags
						</Checkbox>
					</Item>
					<Item wrapperCol={{ span: 16, offset: 5 }}>
						<Checkbox name="chb-most-viewed" checked={settings.loadMostViewedPosts} onChange={handleCheckboxMostViewed}>
							Most Viewed Posts
						</Checkbox>
						<Checkbox name="chb-tag-statistic" checked={settings.loadTagStatistics} onChange={handleCheckboxTagStatistic}>
							Tag Statistics
						</Checkbox>
					</Item>
					<Item wrapperCol={{ span: 16, offset: 5 }}>
						<Checkbox
							name="chb-rating-distribution"
							checked={settings.loadRatingDistributionChart}
							onChange={handleCheckboxRatingDistribution}
						>
							Rating Distribution Chart
						</Checkbox>
					</Item>
				</Col>
			</Row>
			<Row>
				<Col span={24}>
					<Item label="Most Viewed Count" labelCol={{ span: 5 }} wrapperCol={{ span: 15 }}>
						<InputNumber value={settings.mostViewedCount} min={1} max={100} onChange={handleMostViewedCountChange} />
					</Item>
				</Col>
			</Row>
		</Form>
	);
};

export default Dashboard;
