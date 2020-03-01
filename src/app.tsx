import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { mainReducer } from '../store/main';
import Page from './components/Page';
import { composeWithDevTools } from 'redux-devtools-extension';
import Dexie from 'dexie';

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

const db = new Dexie('test_db');
db.version(1).stores({
	testSchema: 'id,data'
});

db.table('testSchema')
	.put({ id: '123', data: 'datadatadata' })
	.then(() => {
		return db.table('testSchema').get('123');
	})
	.then((el) => {
		console.log(el);
	})
	.catch((err) => {
		console.log('error', err);
	});

export default App;
