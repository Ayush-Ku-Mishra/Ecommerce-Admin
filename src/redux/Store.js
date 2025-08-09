import { configureStore, createSlice } from '@reduxjs/toolkit';

// Create a dummy slice just to avoid empty reducer errors
const dummySlice = createSlice({
  name: 'dummy',
  initialState: { message: 'This is a dummy reducer' },
  reducers: {
    setMessage: (state, action) => {
      state.message = action.payload;
    }
  }
});

export const { setMessage } = dummySlice.actions;

export const store = configureStore({
  reducer: {
    dummy: dummySlice.reducer
  }
});

export default store;
