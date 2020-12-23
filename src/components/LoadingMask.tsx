import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin, Typography, Progress } from 'antd';
import { useSelector } from 'react-redux';

import { RootState } from '@store/types';

interface Props {
	className?: string;
	visible: boolean;
	delay?: number;
	fullscreen?: boolean;
	opacity?: number;
}

interface ContainerProps {
	fullscreen?: boolean;
	opacity?: number;
}

const StyledSpinContainer = styled.div`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
`;

const Container = styled.div<ContainerProps>`
	position: ${(props): string => (props.fullscreen ? 'fixed' : 'absolute')};
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1001;
	height: 100%;
	background-color: ${(props): string => (props.opacity === undefined ? 'rgba(0, 0, 0, 0.7)' : `rgba(0, 0, 0, ${props.opacity})`)};
`;

const StyledText = styled(Typography.Text)`
	position: absolute;
	left: 50%;
	top: calc(50% + 64px);
	transform: translate(-50%, -50%);
`;

const StyledProgress = styled(Progress)`
	&& {
		position: absolute;
		left: 50%;
		top: calc(50% + 86px);
		transform: translate(-50%, -50%);
		width: 400px;
	}
`;

const LoadingMask: React.FunctionComponent<Props> = (props: Props) => {
	const [visible, setVisible] = useState(false);
	const timeoutHandle = useRef<number>();
	const loadingMaskMessage = useSelector((state: RootState) => state.loadingStates.fullscreenLoadingMaskMessage);
	const loadingMaskProgress = useSelector((state: RootState) => state.loadingStates.fullscreenLoadingMaskPercentProgress);

	const delay = props.delay ?? 300;

	useEffect(() => {
		let canceled = false;
		if (!props.visible) {
			timeoutHandle !== undefined && clearTimeout(timeoutHandle.current);
			setVisible(false);
		} else {
			timeoutHandle.current = setTimeout(() => {
				!canceled && setVisible(true);
			}, delay);
		}
		return (): void => {
			canceled = true;
		};
	}, [delay, props.visible]);

	const renderMask = (): JSX.Element => {
		return (
			<Container className={props.className} fullscreen={props.fullscreen} opacity={props.opacity}>
				<StyledSpinContainer>
					<Spin indicator={<LoadingOutlined style={{ fontSize: '64px' }} />} />
				</StyledSpinContainer>
				{loadingMaskMessage && <StyledText>{loadingMaskMessage}</StyledText>}
				{loadingMaskProgress !== undefined && <StyledProgress percent={loadingMaskProgress} status='active' />}
			</Container>
		);
	};

	const render = (): JSX.Element => {
		return visible ? renderMask() : <></>;
	};

	return render();
};

export default LoadingMask;
