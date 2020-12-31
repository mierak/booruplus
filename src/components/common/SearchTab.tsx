import React from 'react';
import { useSelector } from 'react-redux';
import { Col, Dropdown, Menu, Row, Tag, Tooltip } from 'antd';
import { GlobalOutlined, DisconnectOutlined } from '@ant-design/icons';

import type { ContextMode, RootState } from '@store/types';
import type { TabAction } from '@appTypes/components';

import { getTagColor } from '@util/utils';
import { getIcon } from '@util/componentUtils';

type Props = {
	mode: ContextMode;
	title: string;
	context?: string;
	contextMenu?: TabAction[];
};

const SearchTab: React.FunctionComponent<Props> = ({ mode, title, contextMenu, context }) => {
	const { selectedTags, excludedTags, page, rating, mode: searchMode } = useSelector((state: RootState) => {
		if (context) {
			const slice = state.onlineSearchForm[context];
			return {
				selectedTags: slice.selectedTags,
				excludedTags: slice.excludedTags,
				page: slice.page,
				rating: slice.rating,
				mode: slice.mode,
			};
		}
		return { selectedTags: undefined, excludedTags: undefined, page: undefined, rating: undefined };
	});
	const icon = mode === 'online' ? <GlobalOutlined /> : mode === 'offline' ? <DisconnectOutlined /> : null;
	const tabName = title ? title : selectedTags ? selectedTags[0]?.tag ?? 'New Tab' : 'New Tab';
	const menu = (
		<Menu>
			{contextMenu?.map((action) => (
				<Menu.Item
					disabled={action.disabled}
					icon={getIcon(action.icon)}
					key={action.key}
					onClick={() => context && action.onClick(context, mode)}
				>
					{action.title}
				</Menu.Item>
			))}
		</Menu>
	);
	const tooltip = (
		<>
			<Row gutter={[8, 8]}>
				<Col span={8}>Selected Tags:</Col>
				<Col span={16}>
					{selectedTags?.length
						? selectedTags?.map((tag) => (
								<Tag key={tag.id} color={getTagColor(tag.type)} style={{ marginBottom: '8px' }}>
									{tag.tag}
								</Tag>
						  ))
						: 'none'}
				</Col>
			</Row>
			<Row gutter={[8, 8]}>
				<Col span={8}>Excluded Tags:</Col>
				<Col span={16}>
					{excludedTags?.length
						? excludedTags?.map((tag) => (
								<Tag key={tag.id} color={getTagColor(tag.type)} style={{ marginBottom: '8px' }}>
									{tag.tag}
								</Tag>
						  ))
						: 'none'}
				</Col>
			</Row>
			<Row gutter={[8, 8]}>
				<Col span={8}>Page:</Col>
				<Col span={16}>{page}</Col>
			</Row>
			<Row gutter={[8, 8]}>
				<Col span={8}>Rating:</Col>
				<Col span={16}>{rating}</Col>
			</Row>
			<Row gutter={[8, 8]}>
				<Col span={8}>Mode:</Col>
				<Col span={16}>{searchMode}</Col>
			</Row>
		</>
	);

	return (
		<Dropdown trigger={['contextMenu']} overlay={menu}>
			<Tooltip title={tooltip} overlayStyle={{ maxWidth: 350, minWidth: 350 }} mouseEnterDelay={0.5}>
				<span>
					{icon}
					{tabName}
				</span>
			</Tooltip>
		</Dropdown>
	);
};

export default SearchTab;
