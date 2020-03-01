import React from 'react';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import { mainReducer } from '../store/main';
import Page from './components/Page';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';

const DevTools = createDevTools(
	// Monitors are individually adjustable with props.
	// Consult their repositories to learn about those props.
	// Here, we put LogMonitor inside a DockMonitor.
	// Note: DockMonitor is visible by default.
	<DockMonitor toggleVisibilityKey="ctrl-h" changePositionKey="ctrl-q" defaultIsVisible={false}>
		<LogMonitor theme="tomorrow" />
	</DockMonitor>
);

const enhancer = compose(
	// Middleware you want to use in development:
	// applyMiddleware(d1, d2, d3),
	// Required! Enable Redux DevTools with the monitors you chose
	DevTools.instrument()
);

const makeStore = () => {
	return createStore(mainReducer, enhancer);
};

const App = (): React.ReactElement => {
	return (
		<Provider store={makeStore()}>
			<Page></Page>
			<DevTools></DevTools>
		</Provider>
	);
};

export default App;
