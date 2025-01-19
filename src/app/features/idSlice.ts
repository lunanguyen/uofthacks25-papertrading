import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state
interface IdState {
  id: string | null; // The ID can be null initially
}

const initialState: IdState = {
  id: null,
};

// Create a slice
const idSlice = createSlice({
  name: "id",
  initialState,
  reducers: {
    setId(state, action: PayloadAction<string>) {
      state.id = action.payload; // Update the ID
    },
    clearId(state) {
      state.id = null; // Reset the ID
    },
  },
});

// Export actions
export const { setId, clearId } = idSlice.actions;

// Export reducer
export default idSlice.reducer;
