import { createAction } from '@reduxjs/toolkit';

export const setFullscreenLoadingMaskMessage = createAction<string>('loadingState/setFullscreenLoadingMaskMessage');
