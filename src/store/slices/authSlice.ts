import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import axios from "axios";
import {message} from "antd";

export const AUTH_STORAGE_KEY = 'auth'

export type AuthData = {
  username: string,
  password: string
}

const userData = (JSON.parse(localStorage.getItem('auth')!) ?? null) as AuthData | null


type AuthState = {
  username: string | null,
  password: string | null,
  isAuth: boolean,
}

const initialState: AuthState = {
  username: null,
  password: null,
  isAuth: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state, action: PayloadAction<void>) {
      state.username = null;
      state.password = null;
      state.isAuth = false;
      localStorage.removeItem(AUTH_STORAGE_KEY)
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const {username, password} = action.meta.arg

        state.username = username;
        state.password = password;
        state.isAuth = true;

        const authData: AuthData = {username: encodeURI(username), password: encodeURI(password)}
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData))
      })

      .addCase(checkAuth.fulfilled, (state, action) => {
        if (userData) {
          state.username = userData.username;
          state.password = userData.password;
          state.isAuth = true;
        }
      })
  }
})

export const login = createAsyncThunk(
  'auth/login',
  async ({username, password}: { username: string, password: string }, thunkAPI) => {
    const authData: AuthData = {username: encodeURI(username), password: encodeURI(password)}
    return axios.get(`${window['config']?.REACT_APP_BASE_URL_API}/login`,
      {
        auth: authData,
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(resp => resp.data)
      .catch(e => {
        if (e.response?.status !== 401) {
          message.error(e.respose?.message)
        }
        return Promise.reject(e.response?.status)
      })

  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, thunkAPI) => {
    if (userData) {
      axios.get(`${window['config']?.REACT_APP_BASE_URL_API}/login`, {
        auth: userData,
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
      })
        .catch(e => {
          console.log(e.response?.data?.message)
        })
    }
  }
)


export const {logout} = authSlice.actions

export const authReducer = authSlice.reducer