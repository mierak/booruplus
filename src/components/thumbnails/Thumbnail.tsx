import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { Card, Popconfirm, Menu, Dropdown } from 'antd';

import { actions } from '@store';
import { RootState, AppDispatch, PostsContext } from '@store/types';
import { Post } from '@appTypes/gelbooruTypes';
import { CardAction, ContextMenu, openNotificationWithIcon } from '@appTypes/components';
import { renderPostCardAction, getThumbnailBorder, thumbnailLoader } from '@util/componentUtils';

interface Props {
	context: PostsContext;
	index: number;
	contextMenu?: ContextMenu[];
	actions?: CardAction[];
	isScrolling?: boolean;
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
	onMouseMove?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
}

interface CardProps {
	$isActive: string;
	$theme: 'dark' | 'light';
	$height: string;
	$selected: boolean;
}

interface PopConfirmProps {
	children: React.ReactElement;
	title: string;
	okText: string;
	cancelText: string;
	action: () => void;
}

const StyledDummyActions = styled.div`
	width: 100%;
	height: 22px;
	background-color: ${(props): string => (props.theme === 'dark' ? 'rgb(29,29,29)' : 'rgb(250,250,250)')};
`;

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

const StyledThumbnailImage = styled.img`
	max-width: 175px;
	max-height: 175px;
`;

const Thumbnail = (props: Props): React.ReactElement => {
	const dispatch = useDispatch<AppDispatch>();
	const imageRef = React.useRef<HTMLImageElement>(null);

	const activeView = useSelector((state: RootState) => state.system.activeView);
	const post = useSelector((state: RootState) =>
		props.index >= 0 && props.index < state.posts.posts[props.context].length
			? state.posts.posts[props.context][props.index]
			: undefined
	);
	const isActive = useSelector((state: RootState) => props.index === state.posts.selectedIndices[props.context]);
	const theme = useSelector((state: RootState) => state.settings.theme);
	const downloadMissingImage = useSelector((state: RootState) => state.settings.downloadMissingImages);

	useEffect(() => {
		const ref = imageRef.current;
		if (ref && post) {
			let canceled = false;
			const loader = thumbnailLoader(post, true);
			loader.then((url) => {
				if (!canceled) {
					ref.src = url;
				}
			});

			return (): void => {
				canceled = true;
			};
		}
	}, [dispatch, downloadMissingImage, post]);

	const handleThumbnailClick = (event: React.MouseEvent): void => {
		event.stopPropagation();
		if (event.ctrlKey) {
			if (post) {
				dispatch(actions.posts.setPostSelected({ data: { post: post, selected: !post.selected }, context: props.context }));
			}
		} else if (event.shiftKey) {
			dispatch(actions.posts.selectMultiplePosts({ data: props.index, context: props.context }));
		} else {
			dispatch(actions.posts.setActivePostIndex({ data: props.index, context: props.context }));
			activeView !== 'image' && dispatch(actions.system.setActiveView({ view: 'image', context: props.context }));
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

	const renderDummyActions = (): React.ReactNode[] => {
		if (!props.actions) {
			return [];
		}
		return [<StyledDummyActions key='dummy' theme={theme} />];
	};

	const renderThumbNail = (): React.ReactNode => {
		return (
			<StyledCard
				bodyStyle={{ height: '195px', width: '195px', padding: '0' }}
				$isActive={isActive.toString()}
				$theme={theme}
				$selected={post?.selected ?? false}
				actions={!props.isScrolling ? renderActions() : renderDummyActions()}
				$height={props.actions !== undefined ? '225px' : '197px'}
			>
				<StyledImageContainer onClick={(event: React.MouseEvent): void => handleThumbnailClick(event)}>
					{post && post.selected && <CheckCircleTwoTone style={{ fontSize: '20px', position: 'absolute', top: '5px', right: '5px' }} />}
					{post && (
						<StyledThumbnailImage
							ref={imageRef}
							data-testid='thumbnail-image'
							onMouseEnter={(e): void => post && props.onMouseEnter && props.onMouseEnter(e, post)}
							onMouseLeave={(e): void => post && props.onMouseLeave && props.onMouseLeave(e, post)}
							onMouseMove={(e): void => post && props.onMouseMove && props.onMouseMove(e, post)}
						></StyledThumbnailImage>
					)}
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

export default Thumbnail;
