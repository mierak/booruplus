import React from 'react';
import { Col, Row } from 'antd';
import { IpcSendChannels } from '@appTypes/processDto';
import { globals } from '@/globals';

const About: React.FunctionComponent = () => {
	const firstColWidth = 4;
	const openInBrowser = (url: string): void => {
		window.api.send(IpcSendChannels.OPEN_IN_BROWSER, url);
	};
	return (
		<>
			<Row gutter={[10, 10]}>
				<Col lg={firstColWidth}>Version:</Col>
				<Col>{globals.VERSION}</Col>
			</Row>
			<Row gutter={[10, 10]}>
				<Col lg={firstColWidth}>Github:</Col>
				<Col>
					<a onClick={(): void => openInBrowser('https://github.com/mierak/booruplus')}>
						https://github.com/mierak/booruplus
					</a>
				</Col>
			</Row>
			<Row gutter={[10, 10]}>
				<Col lg={firstColWidth}>Changelog:</Col>
				<Col>
					<a onClick={(): void => openInBrowser('https://github.com/mierak/booruplus/blob/master/changelog.md')}>
						https://github.com/mierak/booruplus/blob/master/changelog.md
					</a>
				</Col>
			</Row>
			<Row gutter={[10, 10]}>
				<Col>
					You can support this project, buy me a coffee or just say thanks via{' '}
					<a onClick={(): void => openInBrowser('https://paypal.me/mierakoj')}>paypal.me link</a>
				</Col>
			</Row>
		</>
	);
};

export default About;
