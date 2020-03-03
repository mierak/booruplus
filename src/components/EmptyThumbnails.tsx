import React from 'react';
import { Empty, Button } from 'antd';

interface Props {
	className?: string;
	handleButtonClick(): void;
}

const EmptyThumbnails: React.FunctionComponent<Props> = (props: Props) => {
	return (
		<Empty className={props.className} description="No Posts To Show">
			<Button onClick={(): void => props.handleButtonClick()}>Open Search Form</Button>
		</Empty>
	);
};

export default EmptyThumbnails;
