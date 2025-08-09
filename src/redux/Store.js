import { configureStore } from '@reduxjs/toolkit';

// Temporary "dummy" reducer so store isn't empty
const dummyReducer = (state = {}, action) => state;

export const store = configureStore({
  reducer: {
    dummy: dummyReducer
  }
});
