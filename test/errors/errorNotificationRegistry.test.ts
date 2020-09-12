import { clearRegistry, registerErrorNotification } from '@errors/errorNotificationRegistry';
import { ErrorWithNotification } from '@errors/types';
import * as utils from '@appTypes/components';
import log from 'electron-log';

describe('errors/errorNotificationRegistry', () => {
	class TestError extends ErrorWithNotification {
		constructor(message: string) {
			super(message);
			this.name = 'TestError';
		}
	}
	class TestError2 extends TestError {}
	beforeEach(() => {
		jest.clearAllMocks();
	});
	afterEach(() => {
		clearRegistry();
	});
	it('Registers an error and shows notification for said error', () => {
		// given
		const title = 'Test Error Title';
		const message = 'Test Error Message';
		const duration = 10;
		const err = new TestError(message);
		const err2 = new TestError2(message);
		registerErrorNotification(TestError, { title, message, duration, icon: 'warning' });
		registerErrorNotification(TestError2, { title, message });
		const notificationSpy = jest.spyOn(utils, 'openNotificationWithIcon').mockImplementation();

		// when
		err.showNotification();
		err2.showNotification();

		// then
		expect(notificationSpy).toHaveBeenCalledWith('warning', title, message, duration);
		expect(notificationSpy).toHaveBeenCalledWith('error', title, message, 5);
	});
	it('Logs an error when notification was not registered', () => {
		// given
		const err = new TestError('Test Error Message');
		const errorLogSpy = jest.spyOn(window.log, 'error').mockImplementationOnce((..._: any[]) => undefined);

		// when
		err.showNotification();

		// then
		expect(errorLogSpy).toHaveBeenCalledTimes(1);
	});
	it('Clears registry', () => {
		// given
		const title = 'Test Error Title';
		const message = 'Test Error Message';
		const duration = 10;
		const err = new TestError('Test Error Message');
		const errorLogSpy = jest.spyOn(window.log, 'error').mockImplementationOnce((..._: any[]) => undefined);
		registerErrorNotification(TestError, { title, message, duration });
		clearRegistry();

		// when
		err.showNotification();

		// then
		expect(errorLogSpy).toHaveBeenCalledTimes(1);
	});
});
