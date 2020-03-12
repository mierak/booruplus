import React from 'react';
import styled from 'styled-components';
import ThumbnailsList from '../components/ThumbnailsList';
import { PageHeader, Button } from 'antd';
import { useDispatch } from 'react-redux';
import { downloadSelectedPosts } from '../../store/posts';

interface Props {
	className?: string;
}

const Container = styled.div`
	/* overflow-y: auto; */
	height: 100vh;
`;

const StyledThumbnailsList = styled(ThumbnailsList)`
	overflow: hidden;
	height: auto;
`;

const Thumbnails: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();
	return (
		<Container className={props.className}>
			<PageHeader
				ghost={false}
				// onBack={() => window.history.back()}
				title="Image List"
				// subTitle="This is a subtitle"
				extra={[
					<Button key="9">Download Search</Button>,
					<Button key="8">Save Search</Button>,
					<Button key="7">Blacklist All</Button>,
					<Button key="6">Blacklist Selected</Button>,
					<Button key="5">Add All To Favorites</Button>,
					<Button key="4">Add Selected To Favorites</Button>,
					<Button key="3">Download All</Button>,
					<Button
						key="2"
						onClick={(): void => {
							dispatch(downloadSelectedPosts());
						}}
					>
						Download Selected
					</Button>
				]}
			></PageHeader>
			<StyledThumbnailsList emptyDataLogoCentered={true} />
		</Container>
	);
};

export default Thumbnails;
