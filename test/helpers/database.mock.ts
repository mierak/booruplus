import { mocked } from 'ts-jest/utils';
jest.mock('../../src/db/database', () => ({
	__esModule: true,
	default: jest.fn(),
}));
import { dbWorker } from '../../src/db/worker';

jest.mock('../../src/db/worker');
export const mockedDb = mocked(dbWorker, true);

export const doDatabaseMock = (): typeof jest => {
	const mock = jest.mock('../../src/db', () => {
		return {
			__esModule: true,
			db: mockedDb,
		};
	});

	return mock;
};
