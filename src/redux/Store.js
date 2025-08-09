import { configureStore } from '@reduxjs/toolkit';

// You can add your slices/reducers here as you build them
export const store = configureStore({
  reducer: {
    // Example: user: userReducer,
    // profile: profileReducer,
    // products: productsReducer,
  },
});

export default store;
