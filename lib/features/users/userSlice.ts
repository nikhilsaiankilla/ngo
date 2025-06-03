import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape of the user state
interface UserState {
    id: string | null;
    name: string | null;
    email: string | null;
    user_type: string | null;
    token: string | null;
}

// Initial state for the user
const initialState: UserState = {
    id: null,
    name: null,
    email: null,
    user_type: null,
    token: null,
};

// Create the user slice
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        // Set the user state with new values
        setUser: (
            state,
            action: PayloadAction<{
                id: string;
                name: string;
                email: string;
                user_type: string;
                token: string;
            }>
        ) => {
            // Merge the existing state with the payload
            return { ...state, ...action.payload };
        },

        // Reset the user state back to initial values
        clearUser: () => {
            return initialState;
        },
    },
});

// Export actions for dispatching in components
export const { setUser, clearUser } = userSlice.actions;

// Export the reducer to be used in the store
export default userSlice.reducer;
