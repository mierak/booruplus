import React from 'react';
import styled from 'styled-components';
import { PageHeader } from 'antd';

const StyledPageHeader = styled(PageHeader)`
	.ant-page-header-heading {
		justify-content: flex-start;
	}
	.ant-page-header-heading-extra {
		height: 32px;
		margin-top: 0px;
		margin-left: 50px;
	}
`;

type Props = {
    className?: string;
    menu: React.ReactNode;
    title: string;
}

const PageMenuHeader: React.FunctionComponent<Props> = (props) => {

    return <StyledPageHeader ghost={false} title={props.title} extra={props.menu} />;
};

export default PageMenuHeader;