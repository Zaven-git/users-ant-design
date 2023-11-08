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
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            state.loading = true
            if (action.payload) {
                state.list = action.payload.map((u) => ({ key: u.id, ...u }))
                state.loading = false
            }
        })
        builder.addCase(fetchUsers.pending, (state, action) => { state.loading = true })
        builder.addCase(fetchUsers.rejected, (state, action) => { state.loading = false })

        builder.addCase(addNewUser.fulfilled, (state, action) => {
            state.loading = true
            if (action.payload) {
                state.list = state.list.filter(e => e.key !== 0)
                state.list.push({ key: action.payload.id, ...action.payload })
            }
            state.loading = false
        })
        builder.addCase(addNewUser.pending, (state, action) => { state.loading = true })
        builder.addCase(addNewUser.rejected, (state, action) => { state.loading = false })

        builder.addCase(editUser.fulfilled, (state, action) => {
            state.loading = true
            if (action.payload) {
                const index = state.list.findIndex((item) => action.payload.id === item.key);
                state.list.splice(index, 1, { key: action.payload.id, ...action.payload });
            }
            state.loading = false
        })
        builder.addCase(editUser.pending, (state, action) => { state.loading = true })
        builder.addCase(editUser.rejected, (state, action) => { state.loading = false })

        builder.addCase(removeUser.fulfilled, (state, action) => {
            state.loading = true
            if (action.payload) {
                state.list = state.list.filter(e => e.id !== action.payload)
            }
            state.loading = false
        })
        builder.addCase(removeUser.pending, (state, action) => { state.loading = true })
        builder.addCase(removeUser.rejected, (state, action) => { state.loading = false })
    },
})

export const { addEmptyItem } = usersSlice.actions
export default usersSlice.reducer