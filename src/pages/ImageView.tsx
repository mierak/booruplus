import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Layout } from 'antd';

import { actions } from '../../store';
import { RootState } from '../../store/types';

import ThumbnailsList from '../components/ThumbnailsList';
import FullSizeImage from '../components/FullSizeImage';

interface Props {
	className?: string;
}

const Container = styled(Layout)`
	width: 100%;
	align-items: center;
	overflow: hidden;
`;

const StyledThumbnailsList = styled(ThumbnailsList)`
	max-width: 220px;
	margin: 0 0 0 7px;
	height: 100vh;
`;

const StyledLayout = styled(Layout)`
	overflow-y: hidden;
`;

const ImageView: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();

	const thumbnailsListvisible = useSelector((state: RootState) => state.system.isImageViewThumbnailsCollapsed);
	const theme = useSelector((state: RootState) => state.settings.theme);

	return (
		<Container className={props.className}>
			<StyledLayout>
				<Layout.Content>
					<FullSizeImage />
				</Layout.Content>
			</StyledLayout>
			<Layout.Sider
				theme={theme === 'light' ? 'light' : 'dark'}
				collapsible
				reverseArrow
				collapsedWidth={0}
				collapsed={!thumbnailsListvisible}
				onCollapse={(): void => {
					dispatch(actions.system.setImageViewThumbnailsCollapsed(!thumbnailsListvisible));
				}}
			>
				<StyledThumbnailsList />
			</Layout.Sider>
		</Container>
	);
};

export default React.memo(ImageView);
