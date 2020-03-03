import React from 'react';
import { Empty, Button } from 'antd';
import { ConnectedProps, connect } from 'react-redux';
import { setSearchFormDrawerVisible } from '../../store/system';

interface Props extends PropsFromRedux {
	className?: string;
}

const EmptyThumbnails: React.FunctionComponent<Props> = (props: Props) => {
	return (
		<Empty className={props.className} description="No Posts To Show">
			<Button
				onClick={(): void => {
					props.setSearchFormDrawerVisible(true);
				}}
			>
				Open Search Form
			</Button>
		</Empty>
	);
};

const mapDispatch = {
	setSearchFormDrawerVisible
};

const connector = connect(null, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(EmptyThumbnails);
