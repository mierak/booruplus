import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions } from '../../src/store/tags';
import { thunks } from '../../src/store/';
import { createAction, mTag } from '../helpers/test.helper';

describe('store/tags', () => {
	it('Sets tags', () => {
		// given
		const tags = [mTag({ tag: 'tag1' })];
		const action = createAction(actions.setTags.type, tags);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.tags).toStrictEqual(tags);
	});
	it('Sets when tags loadAllTagsFromDb is fulfilled', () => {
		// given
		const tags = [mTag({ tag: 'tag1' })];
		const action = createAction(thunks.tags.loadAllTagsFromDb.fulfilled.type, tags);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.tags).toStrictEqual(tags);
	});
	it('Sets when tags loadByPatternFromDb is fulfilled', () => {
		// given
		const tags = [mTag({ tag: 'tag1' })];
		const action = createAction(thunks.tags.loadByPatternFromDb.fulfilled.type, tags);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.tags).toStrictEqual(tags);
	});
	it('Sets when tags loadAllWithLimitAndOffset is fulfilled', () => {
		// given
		const tags = [mTag({ tag: 'tag1' })];
		const action = createAction(thunks.tags.loadAllWithLimitAndOffset.fulfilled.type, tags);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.tags).toStrictEqual(tags);
	});
});
