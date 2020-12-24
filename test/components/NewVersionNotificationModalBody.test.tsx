import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import NewVersionNotificationModalBody from '../../src/components/NewVersionNotificationModalBody';
import userEvent from '@testing-library/user-event';
import { ReleaseResponse } from '@appTypes/gelbooruTypes';
import { IpcSendChannels } from '@appTypes/processDto';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('LoadingMask', () => {
	it('Renders correctly', () => {
		// given
		const store = mockStore();
		const data: ReleaseResponse = {
			body: '',
			assets: [],
			tag_name: 'v5.5.5-asdf',
		};

		// when
		render(
			<Provider store={store}>
				<NewVersionNotificationModalBody data={data} />
			</Provider>
		);

        // then
        expect(screen.getByText(`Version ${data.tag_name} is available.`)).not.toBeNull();
	});
	it('Opens changelog', () => {
		// given
		const store = mockStore();
		const data: ReleaseResponse = {
            body: 'some\r\n- changes\r\nthat\r\n- were\r\ndone',
			assets: [],
			tag_name: 'v5.5.5-asdf',
		};

		// when
		render(
			<Provider store={store}>
				<NewVersionNotificationModalBody data={data} />
			</Provider>
        );
        userEvent.click(screen.getByText('clicking here'));

        // then
        expect(screen.getByText('Changelog:')).not.toBeNull();
        expect(screen.getByText('some')).not.toBeNull();
        expect(screen.getByText('changes')).not.toBeNull();
        expect(screen.getByText('that')).not.toBeNull();
        expect(screen.getByText('were')).not.toBeNull();
        expect(screen.getByText('done')).not.toBeNull();
	});
	it('Sends IPC to open releases page', () => {
		// given
		const store = mockStore();
		const data: ReleaseResponse = {
            body: '',
			assets: [],
			tag_name: '',
        };
        const ipcSendSpy = jest.fn();
		(global as any).api = {
			send: ipcSendSpy,
		};

		// when
		render(
			<Provider store={store}>
				<NewVersionNotificationModalBody data={data} />
			</Provider>
        );
        userEvent.click(screen.getByText('releases page'));

        // then
        expect(ipcSendSpy).toHaveBeenCalledWith(IpcSendChannels.OPEN_IN_BROWSER, 'https://github.com/mierak/booruplus/releases');
	});
	it('Sends IPC to open direct download', () => {
		// given
		const store = mockStore();
		const data: ReleaseResponse = {
            body: '',
			assets: [{browser_download_url: 'some.url.to.file.Setup.exe'}],
			tag_name: '',
        };
        const ipcSendSpy = jest.fn();
		(global as any).api = {
			send: ipcSendSpy,
		};

		// when
		render(
			<Provider store={store}>
				<NewVersionNotificationModalBody data={data} />
			</Provider>
        );
        userEvent.click(screen.getByText('here.'));

        // then
        expect(ipcSendSpy).toHaveBeenCalledWith(IpcSendChannels.OPEN_IN_BROWSER, data.assets[0].browser_download_url);
	});
});
