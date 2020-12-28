import React from 'react';
import { Popconfirm, Tooltip } from 'antd';
import { CardAction, Icon } from '@appTypes/components';
import { Post } from '@appTypes/gelbooruTypes';
import styled from 'styled-components';
import { getIcon } from '@util/componentUtils';
import { PostsContext } from '@store/types';

const StyledDummyActions = styled.div`
	width: 100%;
	height: 22px;
	background-color: ${(props): string => (props.theme === 'dark' ? 'rgb(29,29,29)' : 'rgb(250,250,250)')};
`;

type CardActionProps = {
	icon: Icon;
	tooltip: string;
	post?: Post;
	context: PostsContext | string;
	actionHandler?: (post: Post, context: PostsContext | string) => Promise<void> | void;
	onClick?: () => void;
};

const PostCardAction: React.FunctionComponent<CardActionProps> = (props: CardActionProps) => {
	const [loading, setLoading] = React.useState(false);

	const { post, actionHandler, onClick } = props;
	let handler: (() => void) | undefined;

	if (actionHandler && post) {
		handler = async (): Promise<void> => {
			setLoading(true);
			await actionHandler(post, props.context);
			setLoading(false);
		};
	} else {
		handler = onClick;
	}

	return (
		<Tooltip destroyTooltipOnHide title={props.tooltip}>
			{getIcon(loading ? 'loading-outlined' : props.icon, handler)}
		</Tooltip>
	);
};

export const getActions = ({
	actions,
	post,
	context,
}: {
	actions: CardAction[];
	post: Post;
	context: PostsContext | string;
}): React.ReactNode[] => {
	return actions
		.filter((a) => (a.condition ? a.condition(post) : true))
		.map((action) => {
			if (!action.popConfirm) {
				return (
					<PostCardAction
						icon={action.icon}
						key={action.key}
						context={context}
						tooltip={action.tooltip}
						actionHandler={action.onClick}
						post={post}
					/>
				);
			}
			return (
				<Popconfirm
					key={action.key}
					title={action.popConfirm.title}
					cancelText={action.popConfirm.okText}
					okText={action.popConfirm.cancelText}
					onCancel={(): void => action.onClick(post, context)}
					okType='default'
					cancelButtonProps={{
						type: 'primary',
					}}
				>
					<PostCardAction context={context} icon={action.icon} key={action.key} tooltip={action.tooltip} />
				</Popconfirm>
			);
		});
};

export const getDummyActions = (theme: 'dark' | 'light'): React.ReactNode[] => {
	return [<StyledDummyActions key='dummy' theme={theme} />];
};
