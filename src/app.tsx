import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/index';
import Page from './pages/Page';

if (process.env.NODE_ENV === 'development') {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React, {
		trackAllPureComponents: true,
		logOwnerReasons: true,
	});
}

const App = (): React.ReactElement => {
	return (
		<Provider store={store}>
			<Page />
		</Provider>
	);
};
export default App;
