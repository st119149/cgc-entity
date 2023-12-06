import {Attribute, AttributeTypes, CellDataIndex, ChangeTypes, Entity, FileContainer, EntityTypes} from "../types";
import {client, contentClient} from "../http";

export class RowsService {

  static fetchRows = () => {
    return contentClient.get<{ rows: (Omit<Entity, 'attributes'> | Attribute)[] }>('/entities')
      .then(resp => resp.data.rows)
  }

  static updateEntity = (entityId: number, body: { [key in CellDataIndex<Entity>]: Entity[key]['value'] }) => {
    return client.put<(Attribute | Entity)[]>(`/entity/${entityId}`, body)
      .then(resp => resp.data)
  }
  static updateAttribute = (entityId: number, attrId: number, body: { [key in CellDataIndex<Attribute>]: Attribute[key]['value'] }) => {
    return client.put<(Attribute | Entity)[]>(`/entity/${entityId}/attribute/${attrId}`, body)
      .then(resp => resp.data)
  }

  static addEntity = () => {
    return client.post<Entity>('/entity')
      .then(resp => resp.data)
  }
  static addAttribute = (entityId: number) => {
    return client.post<(Entity | Attribute)[]>(`/entity/${entityId}/attribute`)
      .then(resp => resp.data)
  }

  static copyEntity = (entityId:number, body: { [key in CellDataIndex<Entity>]: Entity[key]['value'] }) => {
    return client.post<Entity>('/entity', body)
      .then(resp => resp.data)
  }
  static copyAttribute = (entityId: number, body: { [key in CellDataIndex<Attribute>]: Attribute[key]['value'] }) => {
    return client.post<(Entity | Attribute)[]>(`/entity/${entityId}/attribute`, body)
      .then(resp => resp.data)
  }

  static removeEntity = (entityId: number) => {
    return client.delete<void>(`/entity/${entityId}`)
  }
  static removeAttribute = (entityId: number, attrId: number) => {
    return client.delete<(Entity | Attribute)[]>(`/entity/${entityId}/attribute/${attrId}`)
      .then(resp => resp.data)
  }


}