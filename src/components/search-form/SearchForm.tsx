import React from 'react';
import { useSelector } from 'react-redux';
import { Form, Col, Row } from 'antd';

import type { PostsContext, RootState } from '@store/types';

import TagSearch from './TagSearch';
import RatingSelect from './RatingSelect';
import SelectedTags from './SelectedTags';
import PostCountSelect from './PostCountSelect';
import PageSelect from './PageSelect';
import Checkboxes from './Checkboxes';
import ExcludedTags from './ExcludedTags';
import SortSelect from './SortSelect';
import OrderSelect from './OrderSelect';

type Props = {
	className?: string;
	context: PostsContext | string;
};

const SearchForm: React.FunctionComponent<Props> = ({ context, className }) => {
	const mode = useSelector((state: RootState) => state.searchContexts[context].mode);

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
