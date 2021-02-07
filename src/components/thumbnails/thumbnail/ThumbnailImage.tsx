import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { LoadingOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Spin, Result } from 'antd';

import type { ThumbnailImageProps } from './types';
import type { RootState, AppDispatch } from '@store/types';

import { thumbnailLoader } from '@util/componentUtils';

const StyledThumbnailImage = styled.img`
	max-width: 175px;
	max-height: 175px;
`;

const ThumbnailImage: React.FunctionComponent<ThumbnailImageProps> = (props) => {
	const dispatch = useDispatch<AppDispatch>();
	const imageRef = React.useRef<HTMLImageElement>(null);
	const [loaded, setLoaded] = React.useState(false);
	const [error, setError] = React.useState(false);

	const downloadMissingImage = useSelector((state: RootState) => state.settings.downloadMissingImages);
	const post = useSelector((state: RootState) =>
		props.index >= 0 && props.index < state.searchContexts[props.context].posts.length
			? state.searchContexts[props.context].posts[props.index]
			: undefined
	);

	useEffect(() => {
		const ref = imageRef.current;
		let canceled = false;
		if (ref && post) {
			const loader = thumbnailLoader(post, true);
			loader.then((url) => {
				if (!canceled) {
					ref.src = url;
					ref.onload = () => {
						!canceled && setLoaded(true);
					};
					ref.onerror = () => {
						if (!canceled) {
							setError(true);
						}
					};
				}
			});
		}
		return (): void => {
			canceled = true;
		};
	}, [dispatch, downloadMissingImage, post]);

	if (!post) return <></>;

	return (
		<>
			{error ? (
				<Result status='error' subTitle='Could not load thumbnail' />
			) : (
				<>
					{!loaded && <Spin indicator={<LoadingOutlined style={{ fontSize: '48px' }} />} style={{ position: 'absolute' }} />}
					<StyledThumbnailImage
						ref={imageRef}
						data-testid='thumbnail-image'
						onMouseEnter={(e): void => props.onMouseEnter?.(e, post)}
						onMouseLeave={(e): void => props.onMouseLeave?.(e, post)}
						onMouseMove={(e): void => props.onMouseMove?.(e, post)}
					/>
				</>
			)}
		</>
	);
};

export default ThumbnailImage;
