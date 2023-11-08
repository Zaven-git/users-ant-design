import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import UserApi from '../../api/index';

const api = new UserApi('http://localhost:3001/users');

const initialState = {
    list: [{
        name: "",
        address: "",
        website: "",
        email: "",
        id: '',
        key: ''
    }],
    loading: false
}


export const fetchUsers = createAsyncThunk(
    '/fetchUsers',
    async() => {
        const response = await api.getUsers()
        return response.data
    }
)
export const addNewUser = createAsyncThunk(
    '/addUser',
    async(item) => {
        const response = await api.addNewUser(item)
        return response.data
    }
)
export const editUser = createAsyncThunk(
    '/editUser',
    async({ key, row }) => {
        const response = await api.updateUser(key, row)
        return response.data
    }
)
export const removeUser = createAsyncThunk(
    '/removeUser',
    async(id) => {
        const response = await api.deleteUser(id)
        return response.status === 200 && id
    }
)

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        addEmptyItem(state) {
            state.list.push({
                key: 0,
                name: '',
                email: '',
                website: '',
                address: '',
            })
        },
    },
    extraReducers: (builder) => {

        const handleAsyncAction = (state, action) => {
            state.loading = action.meta.requestStatus === 'pending';
        };

        builder
            .addCase(fetchUsers.fulfilled, (state, action) => {
                if (action.payload) {
                    state.list = action.payload.map((u) => ({ key: u.id, ...u }));
                }
            })
            .addCase(addNewUser.fulfilled, (state, action) => {
                if (action.payload) {
                    state.list = state.list.filter((e) => e.key !== 0);
                    state.list.push({ key: action.payload.id, ...action.payload });
                }
            })
            .addCase(editUser.fulfilled, (state, action) => {
                if (action.payload) {
                    const index = state.list.findIndex((item) => action.payload.id === item.key);
                    state.list.splice(index, 1, { key: action.payload.id, ...action.payload });
                }
            })
            .addCase(removeUser.fulfilled, (state, action) => {
                if (action.payload) {
                    state.list = state.list.filter((e) => e.id !== action.payload);
                }
            })
            .addMatcher(
                (action) => action.type.startsWith('user/'),
                handleAsyncAction
            )
    },
})

export const { addEmptyItem, removeEmptyItem } = usersSlice.actions
export default usersSlice.reducer