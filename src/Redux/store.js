import { configureStore } from "@reduxjs/toolkit";

import {todoSlice} from './todoSlice';

export const store = configureStore({
    reducer: {
        todoKey:todoSlice.reducer,
    },
})
export default store;