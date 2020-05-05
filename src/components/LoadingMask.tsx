/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

interface Props {
	className?: string;
	visible: boolean;
	delay?: number;
	fullscreen?: boolean;
}

interface ContainerProps {
	fullscreen?: boolean;
}

const StyledSpin = styled(Spin)`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(0, -50%);
`;

const Container = styled.div<ContainerProps>`
	position: ${(props): string => (props.fullscreen ? 'fixed' : 'absolute')};
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1000;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.7);
`;

const LoadingMask: React.FunctionComponent<Props> = (props: Props) => {
	const [visible, setVisible] = useState(false);
	const [timeoutHandle, setTimeoutHandle] = useState<number>();

	const delay = props.delay ?? 300;

	useEffect(() => {
		if (!props.visible) {
			timeoutHandle !== undefined && clearTimeout(timeoutHandle);
			setVisible(false);
		} else {
			setTimeoutHandle(
				setTimeout(() => {
					setVisible(true);
				}, delay)
			);
		}
	}, [props.visible]);

	const renderMask = (): JSX.Element => {
		return (
			<Container className={props.className} fullscreen={props.fullscreen}>
				<StyledSpin indicator={<LoadingOutlined style={{ fontSize: '64px' }} />} />
			</Container>
		);
	};

	const render = (): JSX.Element => {
		return visible ? renderMask() : <></>;
	};

	return render();
};

export default LoadingMask;
