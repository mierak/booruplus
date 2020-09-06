import configureStore from 'redux-mock-store';
import { RootState, AppDispatch } from '@store/types';
import thunk from 'redux-thunk';
import { initialState } from '@store';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);
const store = mockStore(initialState);

export type MockedStore = typeof store;
