import { doDatabaseMock } from '../../helpers/database.mock';
doDatabaseMock();

import type { AppDispatch, RootState } from '@store/types';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import * as thunks from '../../../src/store/thunks';
import { mState } from '../../helpers/store.helper';
import { unwrapResult } from '@reduxjs/toolkit';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('thunks/searchContexts', () => {
	it('Generates first tab when no contexts are present', async () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {},
			})
		);

		// when
		const result = unwrapResult(await store.dispatch(thunks.searchContexts.generateSearchContext()));

		// then
		expect(result).toBe('tab1');
	});
	it('Generates 5th tab corectly', async () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					tab4: {},
				},
			})
		);

		// when
		const result = unwrapResult(await store.dispatch(thunks.searchContexts.generateSearchContext()));

		// then
		expect(result).toBe('tab5');
	});
});
