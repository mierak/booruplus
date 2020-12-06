import React from 'react';
import { Popconfirm, Tooltip } from 'antd';
import { CardAction, Icon } from '@appTypes/components';
import { Post } from '@appTypes/gelbooruTypes';
import styled from 'styled-components';
import { getIcon } from '@util/componentUtils';

const StyledDummyActions = styled.div`
	width: 100%;
	height: 22px;
	background-color: ${(props): string => (props.theme === 'dark' ? 'rgb(29,29,29)' : 'rgb(250,250,250)')};
`;

interface PopConfirmProps {
	children: React.ReactElement;
	title: string;
	okText: string;
	cancelText: string;
	action: () => void;
}

const WithPopconfirm: React.FunctionComponent<PopConfirmProps> = (props) => {
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

const renderPostCardAction = (
	icon: Icon,
	key: string,
	tooltip: string,
	onClick?: (post: Post) => void,
	post?: Post
): React.ReactElement => {
	const handler = onClick && post ? (): void => onClick(post) : undefined;
	return (
		<Tooltip destroyTooltipOnHide title={tooltip} key={key}>
			{getIcon(icon, handler)}
		</Tooltip>
	);
};

export const getActions = ({ actions, post }: { actions: CardAction[]; post: Post }): React.ReactNode[] => {
	return actions
		.filter((a) => (a.condition ? a.condition(post) : true))
		.map((action) => {
			if (!action.popConfirm) {
				return renderPostCardAction(action.icon, action.key, action.tooltip, action.onClick, post);
			}
			return (
				<WithPopconfirm
					key={action.key}
					title={action.popConfirm.title}
					okText={action.popConfirm.okText}
					cancelText={action.popConfirm.cancelText}
					action={(): void => action.onClick(post)}
				>
					{renderPostCardAction(action.icon, action.key, action.tooltip)}
				</WithPopconfirm>
			);
		});
};

export const getDummyActions = (theme: 'dark' | 'light'): React.ReactNode[] => {
	return [<StyledDummyActions key='dummy' theme={theme} />];
};