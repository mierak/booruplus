import React from 'react';
import { Popconfirm, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { actions } from '@store';
import { AppDispatch, PostsContext, RootState } from '@store/types';

type Props = {
	context: PostsContext | string;
	onSubmit: () => void;
};

const SubmitButton: React.FunctionComponent<Props> = ({ context, onSubmit }: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const stateSlice = useSelector((state: RootState) => state.onlineSearchForm[context]);
	const isDisabled = stateSlice.page === 0;
	const isSearchButtonDisabled = useSelector((state: RootState) => state.loadingStates.isSearchDisabled);

	const handleCancel = (): void => {
		dispatch(actions.onlineSearchForm.updateContext({ context, data: { page: 0 } }));
		onSubmit();
	};

	const handleConfim = (): void => {
		onSubmit();
	};

	const handleSubmit = (): void => {
		isDisabled && onSubmit();
	};

	const renderButton = (): JSX.Element => {
		return (
			<Button type='primary' onClick={handleSubmit} disabled={isSearchButtonDisabled}>
				Search
			</Button>
		);
	};

	const renderPopConfirm = (child: JSX.Element): JSX.Element => {
		return (
			<Popconfirm
				title={`Are you sure you want to start search from page ${stateSlice.page}?`}
				cancelText={`Start from page ${stateSlice.page}`}
				okText='Start from first page'
				onCancel={handleConfim}
				onConfirm={handleCancel}
				okType='default'
				cancelButtonProps={{
					type: 'primary',
				}}
			>
				{child}
			</Popconfirm>
		);
	};
	return isDisabled ? renderButton() : renderPopConfirm(renderButton());
};

export default React.memo(SubmitButton);
