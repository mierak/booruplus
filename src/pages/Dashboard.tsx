import React from 'react';
import styled from 'styled-components';

interface Props {
	className?: string;
}

const Container = styled.div``;

const Dashboard: React.FunctionComponent<Props> = (props: Props) => {
	return <Container className={props.className}>I AM THE DASHBOARD BITCH</Container>;
};

export default Dashboard;
