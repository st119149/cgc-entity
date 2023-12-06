import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {DictionaryService} from "../../services/dictionary.service";
import {
  AttributeTypes,
  ChangeTypes, ConnectionPoint, Domain,
  EntityStorageTypes,
  EntityTypes,
  TableTypes
} from "../../types";

type DictionariesState = {
  changeTypes: ChangeTypes | null,
  tableTypes: TableTypes | null,
  entityTypes: EntityTypes | null,
  entityStorageTypes: EntityStorageTypes | null,
  attributeTypes: AttributeTypes | null,
  domains: Domain[] | null,
  connectionPoints: ConnectionPoint[] | null,
}

const initialState: DictionariesState = {
  changeTypes: null,
  tableTypes: null,
  entityTypes: null,
  entityStorageTypes: null,
  attributeTypes: null,
  domains: null,
  connectionPoints: null,
};

const dictionariesSlice = createSlice({
  name: 'dictionaries',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchChangeTypes.fulfilled, (state, action) => {
        state.changeTypes = action.payload;
      })
      .addCase(fetchTableTypes.fulfilled, (state, action) => {
        state.tableTypes = action.payload;
      })
      .addCase(fetchEntityTypes.fulfilled, (state, action) => {
        state.entityTypes = action.payload;
      })
      .addCase(fetchAttributeTypes.fulfilled, (state, action) => {
        state.attributeTypes= action.payload;
      })
      .addCase(fetchEntityStorageTypes.fulfilled, (state, action) => {
        state.entityStorageTypes= action.payload;
      })
      .addCase(fetchDomains.fulfilled, (state, action) => {
        state.domains= action.payload;
      })
      .addCase(fetchConnectionPoints.fulfilled, (state, action) => {
        state.connectionPoints= action.payload;
      })
  },
})

export const fetchChangeTypes = createAsyncThunk(
  'dictionaries/getChangeTypes',
  async () => {
    const response = await DictionaryService.getChangeTypes()
    return response
  }
)
export const fetchTableTypes = createAsyncThunk(
  'dictionaries/getTableTypes',
  async () => {
    const response = await DictionaryService.getTableTypes()
    return response
  }
)
export const fetchAttributeTypes = createAsyncThunk(
  'dictionaries/getAttributeTypes',
  async () => {
    const response = await DictionaryService.getAttributeTypes()
    return response
  }
)
export const fetchEntityTypes = createAsyncThunk(
  'dictionaries/getEntityTypes',
  async () => {
    const response = await DictionaryService.getEntityTypes()
    return response
  }
)
export const fetchEntityStorageTypes = createAsyncThunk(
  'dictionaries/getEntityStorageTypes',
  async () => {
    const response = await DictionaryService.getEntityStorageTypes()
    return response
  }
)
export const fetchDomains = createAsyncThunk(
  'dictionaries/getDomains',
  async () => {
    const response = await DictionaryService.getDomains()
    return response
  }
)
export const fetchConnectionPoints = createAsyncThunk(
  'dictionaries/getConnectionPoints ',
  async () => {
    const response = await DictionaryService.getConnectionPoints()
    return response
  }
)


export const {} = dictionariesSlice.actions

export const dictionariesReducer = dictionariesSlice.reducer