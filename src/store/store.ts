import { combineReducers, configureStore } from "@reduxjs/toolkit";

import eventsReducer from "./eventsSlice";

const rootReducer = combineReducers({
  events: eventsReducer,
});

const setupStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    preloadedState,
    reducer: rootReducer,
  });
};

type AppDispatch = AppStore["dispatch"];
type AppStore = ReturnType<typeof setupStore>;
type RootState = ReturnType<typeof rootReducer>;

export { setupStore };

export type { AppDispatch, AppStore, RootState };
