import {createAsyncThunk, createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Attribute, CellDataIndex, Entity} from "../../types";
import {RootState} from "../store";
import {RowsService} from "../../services/rows.service";

type RowsState = {
  entities: (Entity & { attributes: Attribute[] })[],
  error: string | null,
  status: 'idle' | 'loading' | 'succeeded',
  selectedRowIds: { [key: number]: number[] }
}

const initialState: RowsState = {
  entities: [],
  error: null,
  status: 'idle',
  selectedRowIds: {}
};

const rowsSlice = createSlice({
  name: 'rows',
  initialState,
  reducers: {
    setSelectedAttributeIds: (state, action: PayloadAction<{ entityId: number, selectedAttributeIds?: number[] }>) => {
      const {entityId, selectedAttributeIds = []} = action.payload;
      state.selectedRowIds[entityId] = selectedAttributeIds;
    },
    setSelectedEntityId: (state, action: PayloadAction<{ entityId: number, checked: boolean }>) => {
      const {entityId, checked} = action.payload;
      if (!checked) {
        delete state.selectedRowIds[entityId];
        return;
      }
      if (!state.selectedRowIds[entityId]) {
        state.selectedRowIds[entityId] = [];
      }
    },
    removeEntities: (state, action: PayloadAction<{ fileId: number }>) => {
      const {fileId} = action.payload
      state.entities = state.entities.filter(entity => entity.excelFileId !== fileId)
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchRows.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchRows.rejected, (state, action) => {
        state.status = 'idle'
      })
      .addCase(fetchRows.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.entities = action.payload
          .filter(row => row.rowType === 'ENTITY')
          .map(entity => ({
            ...entity as Entity,
            attributes: action.payload.filter(row => row.rowType === 'ATTRIBUTE' && row.entityId === entity.entityId) as Attribute[],
            selectedAttributeKeys: []
          }))
      })

      .addCase(addEntity.fulfilled, (state, action) => {
        state.entities.push({...action.payload, attributes: []});
      })
      .addCase(addAttribute.fulfilled, (state, action) => {
        const entityId = action.meta.arg.entityId;
        const [newEntity, newAttrs] = separateEntityAndAttributes(action.payload);

        state.entities.forEach((entity, i) => {
          if (entity.entityId === entityId) {
            clearEntityErrors(entity);

            state.entities[i] = {
              ...(newEntity ?? entity),
              attributes: [
                ...entity.attributes.map(attr => newAttrs.find(item => item.id === attr.id) ?? attr),
                newAttrs.find(attr =>
                  !entity.attributes.reduce((acc, item) => item.id !== attr.id ? acc : acc + 1, 0)
                )!
              ],
            }
          }
        })
      })

      // .addCase(copyEntity.fulfilled, (state, action) => {
      //   state.entities.push({...action.payload, attributes: []});
      // })
      .addCase(copyAttribute.fulfilled, (state, action) => {
        const [entityId] = action.meta.arg;
        const [newEntity, newAttrs] = separateEntityAndAttributes(action.payload);

        state.entities.forEach((entity, i) => {
          if (entity.entityId === entityId) {
            clearEntityErrors(entity);

            state.entities[i] = {
              ...(newEntity ?? entity),
              attributes: [
                ...entity.attributes.map(attr => newAttrs.find(item => item.id === attr.id) ?? attr),
                newAttrs.find(attr =>
                  !entity.attributes.reduce((acc, item) => item.id !== attr.id ? acc : acc + 1, 0)
                )!
              ],
            }
          }
        })
      })

      .addCase(updateEntity.fulfilled, (state, action) => {
        const [entityId] = action.meta.arg;
        const [newEntity, newAttrs] = separateEntityAndAttributes(action.payload);

        state.entities.forEach((entity, i) => {
          if (entity.entityId === entityId) {
            state.entities[i] = {
              ...(newEntity ?? entity),
              attributes: entity.attributes.map(attr => newAttrs.find(item => item.id === attr.id) ?? attr),
            }
          }
        })
      })
      .addCase(updateAttribute.fulfilled, (state, action) => {
        const [entityId] = action.meta.arg;
        const [newEntity, newAttrs] = separateEntityAndAttributes(action.payload);

        state.entities.forEach((entity, i) => {
          if (entity.entityId === entityId) {
            clearEntityErrors(entity);

            state.entities[i] = {
              ...(newEntity ?? entity),
              attributes: entity.attributes.map(attr => newAttrs.find(item => item.id === attr.id) ?? attr),
            }
          }
        })
      })

      .addCase(removeEntity.fulfilled, (state, action) => {
        state.entities = state.entities.filter(entity => entity.entityId !== action.meta.arg.entityId)
      })
      .addCase(removeAttribute.fulfilled, (state, action) => {
        const {entityId, attrId} = action.meta.arg;
        const [newEntity] = separateEntityAndAttributes(action.payload);

        state.entities.forEach((entity, i) => {
          if (entity.entityId === entityId) {
            clearEntityErrors(entity);

            state.entities[i] = {
              ...(newEntity ?? entity),
              attributes: entity.attributes.filter(attr => attr.id !== attrId),
            }
          }
        })

      })
  },
});

function clearEntityErrors(entity: Entity & {attributes: Attribute[]}) {
  for (let key in entity) {
    if (entity[key]?.message || entity[key]?.errorFlg) {
      entity[key].message = null;
      entity[key].errorFlg = false;
    }
  }
};

function separateEntityAndAttributes(rows: (Entity | Attribute)[]) {
  const entity = rows.find(item => item.rowType === 'ENTITY') as Entity;
  const attributes = rows.filter(item => item.rowType === 'ATTRIBUTE') as Attribute[];
  return [entity, attributes] as const;
}

export const fetchRows = createAsyncThunk(
  'rows/fetchEntities',
  async () => {
    const response = await RowsService.fetchRows()
    return response
  }
)

export const updateEntity = createAsyncThunk(
  'rows/updateEntity',
  async (args: Parameters<typeof RowsService.updateEntity>) => {
    const response = await RowsService.updateEntity(...args)
    return response
  }
)

export const updateAttribute = createAsyncThunk(
  'rows/updateAttribute',
  async (args: Parameters<typeof RowsService.updateAttribute>) => {
    const response = await RowsService.updateAttribute(...args)
    return response
  }
)

export const addEntity = createAsyncThunk(
  'rows/addEntity',
  async (_, tnunkAPI) => {
    const response = await RowsService.addEntity()
    return response
  }
)

export const addAttribute = createAsyncThunk(
  'rows/addAttribute',
  async ({entityId}: { entityId: number }) => {
    const response = await RowsService.addAttribute(entityId)
    return response
  }
)

export const copyEntity = createAsyncThunk(
  'rows/copyEntity',
  async (args: Parameters<typeof RowsService.copyEntity>, thunkAPI) => {
    const {rows: {entities}} = thunkAPI.getState() as RootState;
    const response = await RowsService.copyEntity(...args)
      .then(resp => {
        const entity = entities.find(entity => entity.entityId === args[0])
        return Promise.all([...entity?.attributes.map(attr => {
          const body: Record<CellDataIndex<Attribute>, string | null> = {
            attrDesc: attr.attrDesc.value,
            attrMand: attr.attrMand.value,
            attrName: attr.attrName.value,
            attrPk: attr.attrPk.value,
            attrPrec: attr.attrPrec.value,
            attrSize: attr.attrSize.value,
            attrType: attr.attrType.value,
            changeType: attr.changeType.value,
          }
          return RowsService.copyAttribute(resp.entityId, body)
        }) ?? []])
      })
      .then(resp => {
        thunkAPI.dispatch(fetchRows())
      })
    return response
  }
)

export const copyAttribute = createAsyncThunk(
  'rows/copyAttribute',
  async (args: Parameters<typeof RowsService.copyAttribute>) => {
    const response = await RowsService.copyAttribute(...args)
    return response
  }
)


export const removeEntity = createAsyncThunk(
  'rows/removeEntity',
  async ({entityId}: { entityId: number }) => {
    const response = await RowsService.removeEntity(entityId)
    // return response
  }
)

export const removeAttribute = createAsyncThunk(
  'rows/removeAttribute',
  async ({entityId, attrId}: { entityId: number, attrId: number }) => {
    const response = await RowsService.removeAttribute(entityId, attrId)
    return response;
  }
)


export const selectEntities = (state: RootState) => state.rows.entities;
export const selectSelectedRowIds = (state: RootState) => state.rows.selectedRowIds;

export const selectEntityByEntityId = createSelector(
  [selectEntities, (state: RootState, entityId: number) => entityId],
  (entities, entityId) => entities.find(row => row.entityId === entityId)
)
export const selectAttributesByEntityId = createSelector(
  [selectEntities, (state: RootState, entityId: number) => entityId],
  (entities, entityId) => entities.find(entity => entity.entityId === entityId)?.attributes ?? [] as Attribute[]
)
export const selectSelectedAttributeIdsByEntityId = createSelector(
  [selectSelectedRowIds, (state: RootState, entityId: number) => entityId],
  (selectedRowIds, entityId) => selectedRowIds[entityId]
)


export const {setSelectedAttributeIds, setSelectedEntityId, removeEntities} = rowsSlice.actions

export const rowsReducer = rowsSlice.reducer