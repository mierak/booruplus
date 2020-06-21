import React from 'react';
import styled from 'styled-components';
import { ImageControl } from '../../types/components';
import { Button, Popover } from 'antd';
import { getIcon } from '../../util/componentUtils';

interface ContainerProps {
	count: number;
}

const StyledControlsContainer = styled.div<ContainerProps>`
	position: absolute;
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: repeat(${(props: ContainerProps): number => props.count}, 1fr);
	grid-row-gap: 5px;
	top: 25px;
	left: 25px;
`;

interface Props {
	actions: ImageControl[];
}

const ImageControls: React.FunctionComponent<Props> = (props: Props) => {
	const rendnerActions = (): React.ReactNode => {
		const actions = props.actions.map((action) => {
			if (!action.popOver) {
				return <Button key={action.key} type="primary" title={action.tooltip} icon={getIcon(action.icon)} onClick={action.onClick} />;
			}
			return (
				<Popover
					key={action.key}
					autoAdjustOverflow={action.popOver.autoAdjustOverflow}
					content={action.popOver.content}
					trigger={action.popOver.trigger}
					onVisibleChange={action.popOver.onVisibleChange}
				>
					<Button type="primary" title={action.tooltip} icon={getIcon(action.icon)} onClick={action.onClick} />
				</Popover>
			);
		});
		return actions;
	};
	return <StyledControlsContainer count={props.actions.length}>{rendnerActions()}</StyledControlsContainer>;
};

export default ImageControls;
