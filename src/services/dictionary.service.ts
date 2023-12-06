import {
  Attribute,
  AttributeTypes,
  CellDataIndex,
  ChangeTypes,
  Entity,
  FileContainer,
  EntityTypes,
  EntityStorageTypes, TableTypes, Domain, ConnectionPoint
} from "../types";
import {client, clientBUM, clientSMC} from "../http";
import {message} from "antd";

export class DictionaryService {

  static getChangeTypes = () => {
    return client.get<{ changeTypes: ChangeTypes }>('/dict/changetypes')
      .then(resp => resp.data.changeTypes)
  }

  static getAttributeTypes = () => {
    return clientBUM.get<AttributeTypes>('/api/eiap/bum/dictattributegeneraltype')
      .then(resp => resp.data)
  }

  static getEntityTypes = () => {
    return clientBUM.get<EntityTypes>('/api/eiap/bum/dictentitytype')
      .then(resp => resp.data)
  }

  static getEntityStorageTypes = () => {
    return clientBUM.get<EntityStorageTypes>('/api/eiap/bum/dictentitystoragetype')
      .then(resp => resp.data)
  }

  static getTableTypes = () => {
    return clientBUM.get<TableTypes>('/api/eiap/bum/dicttabletype')
      .then(resp => resp.data)

  }

  static getDomains = () => {
    return clientSMC.get<Domain[]>('/svc/mdc/domains')
      .then(resp => resp.data)
      .catch(error => {
        console.log(error)
        message.error(JSON.stringify(error.message))
        return Promise.reject(error)
      })
  }

  static getConnectionPoints = () => {
    return clientSMC.get<ConnectionPoint[]>('/svc/mdc/connection-points')
      .then(resp => resp.data)
      .catch(error => {
        console.log(error)
        message.error(JSON.stringify(error.message))
        return Promise.reject(error)
      })
  }
}