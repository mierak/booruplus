import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { State } from '../../store/main';
import styled from 'styled-components';

interface Props extends PropsFromRedux {
	className?: string;
}

const Container = styled.div``;

const Dashboard: React.FunctionComponent<Props> = (props: Props) => {
	return <Container className={props.className}>I AM THE DASHBOARD BITCH</Container>;
};

interface StateFromProps {}

const mapState = (state: State): StateFromProps => ({});

const mapDispatch = {};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Dashboard);
