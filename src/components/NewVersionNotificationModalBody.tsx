import { ReleaseResponse } from '@appTypes/gelbooruTypes';
import { IpcSendChannels } from '@appTypes/processDto';
import { Divider, List, Typography } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface Props {
	data: ReleaseResponse;
}

const Container = styled.div<{ $height: number }>`
	overflow: auto;
	height: ${(props): number => props.$height}px;
	max-height: 400px;
	transition: height 0.25s ease-in;
`;

const NewVersionNotificationModalBody: React.FunctionComponent<Props> = ({ data }) => {
	const [showChangelog, setShowChangelog] = React.useState(false);
	const openDownload = (): void => {
		const url = data.assets.find((a) => a.browser_download_url.endsWith('Setup.exe'))?.browser_download_url;
		url && window.api.send(IpcSendChannels.OPEN_IN_BROWSER, url);
	};
	const openReleases = (): void =>
		window.api.send(IpcSendChannels.OPEN_IN_BROWSER, 'https://github.com/mierak/booruplus/releases');
	const toggleChangelog = (): void => setShowChangelog((prev) => !prev);

	return (
		<Container $height={showChangelog ? 400 : 66}>
			<div>
				<Typography.Text>{`Version ${data.tag_name} is available.`}</Typography.Text>
			</div>
			<div>
				<Typography.Text>
					You can download it on the&nbsp;
					<Typography.Link onClick={openReleases}>releases page</Typography.Link>&nbsp; or via the direct link&nbsp;
					<Typography.Link onClick={openDownload}>here.</Typography.Link>&nbsp;
				</Typography.Text>
			</div>
			<div>
				<Typography.Text>
					See what changed by&nbsp;
					<Typography.Link onClick={toggleChangelog}>clicking here</Typography.Link>
				</Typography.Text>
			</div>
			{showChangelog && (
				<>
					<Divider style={{ marginTop: '12px', marginBottom: '12px' }} />
					<Typography.Title level={5}>Changelog:</Typography.Title>
					<List size='small'>
						{data.body.split('\r\n').map((s, i) => (
							<List.Item style={{ padding: '4px 12px 4px 0px', textAlign: 'justify' }} key={i}>
								{s.startsWith('-') ? s.slice(1).trim() : s}
							</List.Item>
						))}
					</List>
				</>
			)}
		</Container>
	);
};

export default NewVersionNotificationModalBody;
