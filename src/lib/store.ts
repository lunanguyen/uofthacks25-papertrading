import { configureStore , createSlice, PayloadAction } from '@reduxjs/toolkit'

export const idSlice = createSlice({
  name: 'id',
  initialState: { id: '' } as { id: string },
  reducers: {
    setId(state, action: PayloadAction<string>) {
      state.id = action.payload;
    },
    resetId(state) {
      state.id = '';
    }
  }
});

export const makeStore = () => {
  return configureStore({
    reducer: {
      id: idSlice.reducer
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']