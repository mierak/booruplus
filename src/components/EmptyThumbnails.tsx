import React from 'react';
import { Empty, Button } from 'antd';
import { useDispatch } from 'react-redux';
import { setSearchFormDrawerVisible } from '../../store/system';

interface Props {
	className?: string;
}

const EmptyThumbnails: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();
	return (
		<Empty className={props.className} description="No Posts To Show">
			<Button
				onClick={(): void => {
					dispatch(setSearchFormDrawerVisible(true));
				}}
			>
				Open Search Form
			</Button>
		</Empty>
	);
};

export default EmptyThumbnails;
