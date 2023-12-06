import {configureStore} from '@reduxjs/toolkit'
import {useDispatch} from "react-redux";
import {rowsReducer} from "./slices/rowsSlice";
import {dictionariesReducer} from "./slices/dictionariesSlice";
import {containersReducer} from "./slices/containersSlice";
import {authReducer} from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    rows: rowsReducer,
    dictionaries: dictionariesReducer,
    containers: containersReducer,
    auth: authReducer
  }
})

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch<AppDispatch>