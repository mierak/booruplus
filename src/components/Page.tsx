import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { State } from '../../store/main';
import { View } from '../../store/system';
import { setActivePostIndex, setPosts } from '../../store/posts';
import ThumbnailsList from './ThumbnailsList';
import { Post } from '../../types/gelbooruTypes';
import AppLayout from './Layout';
import ImageView from './ImageView';
import SearchForm from './SearchForm';
import database from '../../db/database';

interface Props extends PropsFromRedux {
	className?: string;
}

const renderView = (activeView: View): React.ReactNode => {
	switch (activeView) {
		case 'thumbnails':
			return <ThumbnailsList emptyDataLogoCentered={true} />;
		case 'image':
			return <ImageView />;
		case 'online-search':
			return <SearchForm />;
		default:
			return null;
	}
};

const Page: React.FunctionComponent<Props> = (props: Props) => {
	database.posts
		.where('favorite')
		.equals(1)
		.each((c) => {
			console.log(c);
		});

	const handleKeyPress = (event: KeyboardEvent): void => {
		if (props.activePostIndex !== undefined) {
			switch (event.keyCode) {
				case 39:
					if (props.activePostIndex !== props.posts.length - 1) {
						props.setActivePostIndex(props.activePostIndex + 1);
					} else {
						props.setActivePostIndex(0);
					}
					break;
				case 37:
					if (props.activePostIndex !== 0) {
						props.setActivePostIndex(props.activePostIndex - 1);
					} else {
						props.setActivePostIndex(props.posts.length - 1);
					}
					break;
			}
		}
	};

	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress, true);

		return (): void => {
			window.removeEventListener('keydown', handleKeyPress, true);
		};
	}, [props.activePostIndex]);

	return <AppLayout>{renderView(props.activeView)}</AppLayout>;
};

interface StateFromProps {
	posts: Post[];
	activePostIndex: number | undefined;
	activeView: View;
}

const mapState = (state: State): StateFromProps => ({
	posts: state.posts.posts,
	activePostIndex: state.posts.activePostIndex,
	activeView: state.system.activeView
});

const mapDispatch = {
	setActivePostIndex,
	setPosts
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Page);
