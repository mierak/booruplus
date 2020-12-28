import React from 'react';
import { useDispatch } from 'react-redux';
import { Button, Form, Col, Row, Modal, Tabs } from 'antd';

import { actions, thunks } from '@store';
import { AppDispatch, PostsContext } from '@store/types';

import TagSearch from './search-form/TagSearch';
import RatingSelect from './search-form/RatingSelect';
import SelectedTags from './search-form/SelectedTags';
import PostCountSelect from './search-form/PostCountSelect';
import PageSelect from './search-form/PageSelect';
import Checkboxes from './search-form/Checkboxes';
import SubmitButton from './search-form/SubmitButton';
import ExcludedTags from './search-form/ExcludedTags';
import SortSelect from './search-form/SortSelect';
import OrderSelect from './search-form/OrderSelect';
import { SearchFormModalProps } from '@appTypes/modalTypes';
import { deletePostsContext } from '@store/commonActions';

type Props = {
	className?: string;
	mode: 'online' | 'offline';
	context: PostsContext | string;
};

const SearchForm: React.FunctionComponent<Props> = ({ mode, context, className }) => {
	return (
		<Form labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} layout='horizontal' className={className}>
			<Form.Item label='Find Tag'>
				<TagSearch context={context} />
			</Form.Item>
			<Form.Item label='Selected Tags'>
				<SelectedTags context={context} />
			</Form.Item>
			<Form.Item label='Excluded Tags'>
				<ExcludedTags context={context} />
			</Form.Item>
			<Row>
				<Col span={12} style={{ paddingRight: 0 }}>
					<Form.Item label='Post Count' labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
						<PostCountSelect context={context} />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label='Page' labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
						<PageSelect context={context} />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col span={12} style={{ paddingRight: 0 }}>
					<Form.Item label='Sort' labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
						<SortSelect context={context} />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label='Order' labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
						<OrderSelect context={context} />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col span={12} style={{ paddingRight: 0 }}>
					<Form.Item label='Rating' labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
						<RatingSelect context={context} />
					</Form.Item>
				</Col>
			</Row>
			{mode === 'offline' && (
				<Form.Item wrapperCol={{ span: 21, offset: 3 }}>
					<Checkboxes context={context} />
				</Form.Item>
			)}
		</Form>
	);
};

export default SearchForm;

export const SearchFormModal: React.FunctionComponent<SearchFormModalProps> = (props) => {
	const dispatch = useDispatch<AppDispatch>();
	const [activeTab, setActiveTab] = React.useState<'online' | 'offline'>('online');
	const fetchPosts =
		activeTab === 'online' ? thunks.onlineSearchForm.fetchPosts : thunks.downloadedSearchForm.fetchPosts;

	const handleClear = (): void => {
		dispatch(actions.onlineSearchForm.clear({ context: props.context }));
	};

	const handleClose = (): void => {
		dispatch(actions.system.setActiveSearchTab(props.previousTab));
		dispatch(deletePostsContext({ context: props.context }));
		dispatch(actions.modals.setVisible(false));
	};

	const footer = (
		<>
			<SubmitButton
				context={props.context}
				onSubmit={(): void => {
					dispatch(actions.modals.setVisible(false));
					dispatch(actions.onlineSearchForm.setContextMode({ context: props.context, data: activeTab }));
					dispatch(fetchPosts({ context: props.context }));
				}}
			/>
			<Button type='dashed' onClick={handleClear} style={{ marginLeft: '8px' }}>
				Clear
			</Button>
			<Button onClick={handleClose} style={{ marginLeft: '8px' }}>
				Close
			</Button>
		</>
	);
	return (
		<Modal centered visible={true} footer={footer} width={700} onCancel={handleClose}>
			<Tabs size='small' activeKey={activeTab} onChange={(key): void => setActiveTab(key as 'online' | 'offline')}>
				<Tabs.TabPane tab='Online Search' key='online'>
					<SearchForm {...props} mode='online' />
				</Tabs.TabPane>
				<Tabs.TabPane tab='Offline Search' key='offline'>
					<SearchForm {...props} mode='offline' />
				</Tabs.TabPane>
			</Tabs>
		</Modal>
	);
};
