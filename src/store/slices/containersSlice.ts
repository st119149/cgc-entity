import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {FileContainer} from "../../types";
import {RootState, store} from "../store";
import {fetchRows, removeEntities} from "./rowsSlice";
import {ContainersService} from "../../services/containers.service";
import {message} from "antd";
import {AxiosRequestConfig} from "axios";

type ContainersState = {
  files: FileContainer[],
  selectedFileKeys: number[],
  status: 'idle' | 'loading' | 'succeeded',
  error: string | null
}

const initialState: ContainersState = {
  files: [],
  selectedFileKeys: [],
  status: 'idle',
  error: null
};

const containersSlice = createSlice({
  name: 'containers',
  initialState,
  reducers: {
    setSelectedFileIds: (state, action: PayloadAction<number>) => {
      const fileId = action.payload;
      const currentFileId = state.selectedFileKeys.find(id => id === fileId)
      if (currentFileId) {
        state.selectedFileKeys = state.selectedFileKeys.filter(id => id !== currentFileId)
      } else {
        state.selectedFileKeys.push(fileId)
      }
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchContainers.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchContainers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.files = action.payload
      })

      .addCase(removeFile.fulfilled, (state, action) => {
        state.files = state.files.filter(file => file.id !== action.meta.arg.fileId);
        state.selectedFileKeys = state.selectedFileKeys.filter(id => id !== action.meta.arg.fileId);

      })


  },
})

export const fetchContainers = createAsyncThunk(
  'containers/fetchContainers',
  async () => {
    const response = await ContainersService.fetchContainers()
    return response
  }
)

export const removeFile = createAsyncThunk(
  'containers/removeFile',
  async ({fileId}: { fileId: number }, thunkAPI) => {
    const response = await ContainersService.removeFile(fileId)
      .then(() => thunkAPI.dispatch(removeEntities({fileId})))
    return response
  }
)

export const uploadFile = createAsyncThunk(
  'containers/uploadFile',
  async ({formData, config = {}}: { formData: FormData, config?: AxiosRequestConfig }) => {
    const response = await ContainersService.uploadFile(formData, config)
      .then(resp => resp.data)
    return response
  }
)

export const downloadYAML = createAsyncThunk(
  'containers/downloadYAML',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const selectedRowIds = state.rows.selectedRowIds

    const isCheckSelected = Object.values(selectedRowIds).length

    const response = await ContainersService.downloadYAML(isCheckSelected ? selectedRowIds : {})
    return response
  }
)


export const validateYAML = createAsyncThunk(
  'containers/validateYAML',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const selectedRowIds = state.rows.selectedRowIds;
    const isCheckSelected = Object.values(selectedRowIds).length;

    return ContainersService.fetchYAML(isCheckSelected ? selectedRowIds : {})
      .then(resp =>
        ContainersService.validateYAML(resp)
          .catch(e => Promise.reject(e.response?.data))
      )
  }
)

export const {setSelectedFileIds} = containersSlice.actions

export const containersReducer = containersSlice.reducer