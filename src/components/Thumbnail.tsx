/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { CheckCircleTwoTone, LoadingOutlined } from '@ant-design/icons';
import { Card, Popconfirm, Spin, Menu, Dropdown } from 'antd';

import { actions } from '../store';
import { RootState, AppDispatch } from '../store/types';

import { CardAction, ContextMenu, openNotificationWithIcon } from '../types/components';
import { renderPostCardAction, getThumbnailBorder } from '../util/componentUtils';
import { getThumbnailUrl } from '../service/webService';

interface Props {
	index: number;
	contextMenu?: ContextMenu[];
	actions?: CardAction[];
}

interface CardProps {
	isactive: string;
	theme: 'dark' | 'light';
	height: string;
}

interface SelectedIndexes {
	first: number | undefined;
	last: number | undefined;
}

interface PopConfirmProps {
	children: React.ReactElement;
	title: string;
	okText: string;
	cancelText: string;
	action: () => void;
}

const StyledCard = styled(Card)<CardProps>`
	border: ${(props): false | 0 | 'dashed 1px black' | 'dashed 1px white' | undefined => getThumbnailBorder(props.isactive, props.theme)};
	width: 170px;
	height: ${(props): string => props.height};
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

const StyledThumbnailImage = styled.img`
	max-width: 150px;
	max-height: 150px;
`;

const Thumbnail = (props: Props): React.ReactElement => {
	const dispatch = useDispatch<AppDispatch>();

	const activeView = useSelector((state: RootState) => state.system.activeView);
	const post = useSelector((state: RootState) =>
		props.index >= 0 && props.index < state.posts.posts.length ? state.posts.posts[props.index] : undefined
	);
	const isActive = useSelector((state: RootState) => props.index === state.posts.activePostIndex);
	const theme = useSelector((state: RootState) => state.settings.theme);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [loaded, setLoaded] = useState(true);

	const handleThumbnailClick = (event: React.MouseEvent): void => {
		if (event.ctrlKey) {
			if (post) {
				dispatch(actions.posts.setPostSelected({ post: post, selected: !post.selected }));
			}
		} else {
			dispatch(actions.posts.setActivePostIndex(props.index));
			activeView !== 'image' && dispatch(actions.system.setActiveView('image'));
		}
	};

	const renderWithPopconfirm = (props: PopConfirmProps): React.ReactNode => {
		return (
			<Popconfirm
				title={props.title}
				cancelText={props.okText}
				okText={props.cancelText}
				onCancel={props.action}
				okType='default'
				cancelButtonProps={{
					type: 'primary',
				}}
			>
				{props.children}
			</Popconfirm>
		);
	};

	const renderActions = (): React.ReactNode[] => {
		if (!post) {
			openNotificationWithIcon('error', 'Cannot find post', 'Cannot render post actions because post is undefined', 5);
			return [];
		}
		if (props.actions === undefined) {
			return [];
		}

		const actions: React.ReactNode[] = [];

		props.actions.forEach((action) => {
			if (action.condition) {
				if (!action.condition(post)) {
					return;
				}
			}

			if (!action.popConfirm) {
				actions.push(renderPostCardAction(action.icon, action.key, action.tooltip, action.onClick, post));
			} else {
				const handler = (): void => action.onClick(post);
				const popConfirmProps: PopConfirmProps = {
					title: action.popConfirm.title,
					okText: action.popConfirm.okText,
					cancelText: action.popConfirm.cancelText,
					action: handler,
					children: renderPostCardAction(action.icon, action.key, action.tooltip),
				};
				actions.push(renderWithPopconfirm(popConfirmProps));
			}
		});

		return actions;
	};

	const renderThumbNail = (): React.ReactNode => {
		return (
			<StyledCard
				bodyStyle={{ height: '170px', width: '170px', padding: '0' }}
				isactive={isActive.toString()}
				theme={theme}
				actions={renderActions()}
				hoverable
				height={props.actions !== undefined ? '200px' : '172px'}
			>
				<StyledImageContainer onClick={(event: React.MouseEvent): void => handleThumbnailClick(event)}>
					{post && post.selected ? (
						<CheckCircleTwoTone style={{ fontSize: '20px', position: 'absolute', top: '5px', right: '5px' }} />
					) : (
						<></>
					)}
					{post && (
						<StyledThumbnailImage
							data-testid='thumbnail-image'
							src={getThumbnailUrl(post.directory, post.hash)}
							style={{ display: loaded ? 'block' : 'none' }}
							onLoad={(): void => setLoaded(true)}
							onLoadStart={(): void => setLoaded(false)}
						></StyledThumbnailImage>
					)}
					{!loaded && <Spin indicator={<LoadingOutlined style={{ fontSize: '32px' }} />} />}
				</StyledImageContainer>
			</StyledCard>
		);
	};

	const renderWithContextMenu = (): React.ReactNode => {
		let actions = [<></>];
		if (props.contextMenu && post) {
			actions = props.contextMenu.map((action) => {
				return (
					<Menu.Item key={action.key} onClick={(): void => action.action(post)}>
						{action.title}
					</Menu.Item>
				);
			});
		}
		const menu = <Menu>{actions}</Menu>;

		return (
			<Dropdown overlay={menu} trigger={['contextMenu']}>
				{renderThumbNail()}
			</Dropdown>
		);
	};

	return <>{props.contextMenu !== undefined ? renderWithContextMenu() : renderThumbNail()}</>;
};

export default React.memo(Thumbnail);
