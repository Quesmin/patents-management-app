import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { AccountState } from "../types/Account";
import { LicensedState, PatentState } from "../types/Patent";
import { accountReducerSlice } from "./account/slice";
import { licensedReducerSlice } from "./licensed/slice";
import { notificationReducerSlice } from "./notification/slice";
import { patentReducerSlice } from "./patents/slice";

const accountPersistConfig = {
    key: "account",
    storage,
};

const patentsPersistConfig = {
    key: "patent",
    storage,
};

const licensedPersistConfig = {
    key: "licensedPatent",
    storage,
};

export const store = configureStore({
    reducer: {
        [accountReducerSlice.name]: persistReducer<AccountState>(
            accountPersistConfig,
            accountReducerSlice.reducer
        ),
        [patentReducerSlice.name]: persistReducer<PatentState>(
            patentsPersistConfig,
            patentReducerSlice.reducer
        ),
        [licensedReducerSlice.name]: persistReducer<LicensedState>(
            licensedPersistConfig,
            licensedReducerSlice.reducer
        ),
        [notificationReducerSlice.name]: notificationReducerSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
