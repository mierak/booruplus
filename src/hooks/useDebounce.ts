import { useState, useEffect } from 'react';

export const useDebounce = (value: string, delay = 500): string => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return (): void => {
			clearTimeout(handler);
		};
	}, [value]);

	return debouncedValue;
};
