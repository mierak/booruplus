import React, { useState, useRef, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Space, Button } from 'antd';

type Props = {
	onSearch(pattern: string): void;
	confirm(): void;
	visible: boolean;
}

const TagSearchFilter: React.FunctionComponent<Props> = (props: Props) => {
	const [pattern, setPattern] = useState('');
	const inputRef = useRef<Input>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, [props.visible]);

	const handleSearch = (): void => {
		props.onSearch(pattern);
		props.confirm();
	};

	const handleReset = (): void => {
		setPattern('');
		props.onSearch('');
		props.confirm();
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setPattern(event.currentTarget.value);
	};

	return (
		<div style={{ padding: 8 }}>
			<Input
				ref={inputRef}
				placeholder="Search"
				value={pattern}
				onChange={handleChange}
				onPressEnter={handleSearch}
				style={{ width: 188, marginBottom: 8, display: 'block' }}
			/>
			<Space>
				<Button type="primary" onClick={handleSearch} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
					Search
				</Button>
				<Button onClick={handleReset} size="small" style={{ width: 90 }}>
					Reset
				</Button>
			</Space>
		</div>
	);
};

export default TagSearchFilter;
