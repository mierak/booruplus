import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { mainReducer } from '../store/main';
import Page from './components/Page';
import { composeWithDevTools } from 'redux-devtools-extension';

const makeStore = () => {
	return createStore(mainReducer, composeWithDevTools());
};

const App = (): React.ReactElement => {
	return (
		<Provider store={makeStore()}>
			<Page></Page>
		</Provider>
	);
};

export default App;
