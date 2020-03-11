/* eslint-disable react/prop-types */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../../store/main';
import { setImageViewThumbnailsCollapsed } from '../../store/system';
import ThumbnailsList from '../components/ThumbnailsList';
import { Layout } from 'antd';
import FullSizeImage from '../components/FullSizeImage';

interface Props {
	className?: string;
}

const Container = styled(Layout)`
	width: 100%;
	align-items: center;
`;

const StyledThumbnailsList = styled(ThumbnailsList)`
	max-width: 220px;
	margin: 0 0 0 7px;
`;

const ImageView: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();

	const thumbnailsListvisible = useSelector((state: RootState) => state.system.imageViewThumbnailsCollapsed);
	// const postsLength = useSelector((state: RootState) => state.posts.posts.length);
	// useEffect(() => {
	// 	if (props.postsLength > 0) {
	// 		props.setActivePostIndex(0);
	// 	}
	// }, []);

	return (
		<Container>
			<Layout>
				<Layout.Content>
					<FullSizeImage />
				</Layout.Content>
			</Layout>
			<Layout.Sider
				theme="light"
				collapsible
				reverseArrow
				collapsedWidth={0}
				collapsed={!thumbnailsListvisible}
				onCollapse={(): void => {
					dispatch(setImageViewThumbnailsCollapsed(!thumbnailsListvisible));
				}}
			>
				<StyledThumbnailsList />
			</Layout.Sider>
		</Container>
	);
};

export default React.memo(ImageView);
