import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { Card, Menu, Dropdown, Empty } from 'antd';

import type { ThumbnailProps } from './types';
import type { RootState, AppDispatch } from '@store/types';
import type { ContextMenu } from '@appTypes/components';

import { actions } from '@store';
import { getThumbnailBorder } from '@util/componentUtils';
import { getActions, getDummyActions } from './util';

import ThumbnailImage from './ThumbnailImage';

type CardProps = {
	$isActive: string;
	$theme: 'dark' | 'light';
	$height: string;
	$selected: boolean;
};

const StyledCard = styled(Card)<CardProps>`
	cursor: pointer;
	&& {
		border: ${(props): string | undefined => getThumbnailBorder(props.$isActive, props.$theme, props.$selected)};
		width: 195px;
		height: ${(props): string => props.$height};
	}
	&& > .ant-card-actions > li {
		margin-top: 2px;
		margin-bottom: 2px;
	}
`;

const StyledImageContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	padding: 10px;
`;

const SelectedCheckMark = () => (
	<CheckCircleTwoTone style={{ fontSize: '20px', position: 'absolute', top: '5px', right: '5px' }} />
);

const Thumbnail = (props: ThumbnailProps): React.ReactElement => {
	const dispatch = useDispatch<AppDispatch>();

	const activeView = useSelector((state: RootState) => state.system.activeView);
	const post = useSelector((state: RootState) =>
		props.index >= 0 && props.index < state.searchContexts[props.context].posts.length
			? state.searchContexts[props.context].posts[props.index]
			: undefined
	);
	const isActive = useSelector((state: RootState) =>
		(props.index === state.searchContexts[props.context].selectedIndex).toString()
	);
	const theme = useSelector((state: RootState) => state.settings.theme);

	if (!post) return <Empty />;

	const bodyStyle = { height: '195px', width: '195px', padding: '0' };
	const height = props.actions !== undefined ? '225px' : '197px';
	const cardActions =
		props.actions && !props.isScrolling
			? getActions({ post, context: props.context, actions: props.actions })
			: getDummyActions(theme);

	const handleThumbnailClick = (event: React.MouseEvent): void => {
		event.stopPropagation();
		if (event.ctrlKey) {
			dispatch(
				actions.searchContexts.setPostSelected({ data: { post: post, selected: !post.selected }, context: props.context })
			);
		} else if (event.shiftKey) {
			dispatch(actions.searchContexts.selectMultiplePosts({ data: props.index, context: props.context }));
		} else {
			activeView !== 'image' && dispatch(actions.system.setActiveView({ view: 'image', context: props.context }));
			dispatch(actions.searchContexts.updateContext({ data: { selectedIndex: props.index }, context: props.context }));
		}
	};

	const renderThumbNail = (): React.ReactNode => {
		return (
			<StyledCard
				bodyStyle={bodyStyle}
				$isActive={isActive}
				$theme={theme}
				$selected={post.selected}
				actions={cardActions}
				$height={height}
			>
				<StyledImageContainer onClick={handleThumbnailClick}>
					{post.selected && <SelectedCheckMark />}
					<ThumbnailImage {...props} />
				</StyledImageContainer>
			</StyledCard>
		);
	};

	if (!props.contextMenu) return <>{renderThumbNail()}</>;

	const renderWithContextMenu = (menuItems: ContextMenu[]): React.ReactNode => {
		const menu = (
			<Menu>
				{menuItems.map((action) => (
					<Menu.Item key={action.key} onClick={(): void => action.action(post)}>
						{action.title}
					</Menu.Item>
				))}
			</Menu>
		);
		return (
			<Dropdown overlay={menu} trigger={['contextMenu']}>
				{renderThumbNail()}
			</Dropdown>
		);
	};

	return <>{renderWithContextMenu(props.contextMenu)}</>;
};

export default Thumbnail;
