import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/index';
import Page from './pages/Page';

const App = (): React.ReactElement => {
	return (
		<Provider store={store}>
			<Page />
		</Provider>
	);
};
export default App;
