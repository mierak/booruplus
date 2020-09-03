jest.mock('lodash', () => {
	const orig = jest.requireActual('lodash');
	return {
		...orig,
		debounce: (cb: any, _: number): any => {
			const func = (): void => cb();
			func.cancel = jest.fn();
			return func;
		},
	};
});
import { log } from './helpers/window.mock';
(global as any).log = log;

expect.extend({
	/**
	 * Matches given redux action to an arrray of dispatched actions from redux-mock-store.
	 * meta.arg is matched by stringifying both objects and comparing the result. As a result
	 * this function does not support matching non-serializable objects
	 */
	toContainMatchingAction(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		received: { type: string; meta?: any; payload?: any }[],
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expected: { type: string; meta?: any; payload?: any }
	): jest.CustomMatcherResult {
		let found = false;
		let foundSameTypeMessage = '';
		for (const r of received) {
			if (
				r.type === expected.type &&
				JSON.stringify(r.meta?.arg) === JSON.stringify(expected.meta?.arg) &&
				JSON.stringify(r.payload) === JSON.stringify(expected.payload)
			) {
				found = true;
				break;
			} else if (
				r.type === expected.type &&
				expected.meta === undefined &&
				JSON.stringify(r.payload) === JSON.stringify(expected.payload)
			) {
				found = true;
				break;
			} else if (
				r.type === expected.type &&
				expected.payload === undefined &&
				JSON.stringify(r.meta?.arg) === JSON.stringify(expected.meta?.arg)
			) {
				found = true;
				break;
			} else if (r.type === expected.type && expected.payload === undefined && expected.meta === undefined) {
				found = true;
				break;
			} else if (r.type === expected.type) {
				foundSameTypeMessage = ` Found action with the same type: \r\n${JSON.stringify(r)}\r\nexpected:\r\n${JSON.stringify(expected)}`;
			}
		}
		return {
			message: (): string => (found ? '' : `Supplied action not found in dispatched actions.${foundSameTypeMessage}`),
			pass: found,
		};
	},
});
