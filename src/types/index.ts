export enum RowType {
  ENTITY = 'ENTITY',
  ATTRIBUTE = 'ATTRIBUTE'
}

export type Message = {
  errorFlg: boolean | null,
  example: string | null,
  message: string,
  recomendation: string | null,
}

export type Cell = {
  id: number | null,
  value: string | null,
  message: Message[] | null,
  originalValue: string | null,
  errorFlg: boolean
}

export type CellDataIndex<T extends Attribute | Entity> = {
  [key in keyof T]: T[key] extends Cell ? key : never
}[keyof T]

export type Entity = {
  entityId: number,
  excelFileId: number,
  schemaName: Cell,
  entityName: Cell,
  entityDesc: Cell,
  tableType: Cell,
  changeType: Cell,
  destName: Cell,
  detName: Cell,
  domain: Cell,
  connPoint: Cell
  rowType: 'ENTITY',
}


export type Attribute = {
  id: number,
  entityId: number,
  excelFileId: number,
  attrName: Cell,
  attrDesc: Cell,
  attrType: Cell,
  attrSize: Cell,
  attrPrec: Cell,
  attrMand: Cell,
  attrPk: Cell,
  changeType: Cell,
  rowType: 'ATTRIBUTE'
}

export enum BaseChangeTypes {
  UPDATED='UPDATED',
  ADDED='ADDED',
  DELETED='DELETED',
}

export type ChangeTypes = {
  [key: string]: string
};
export type EntityTypes = {
  detDesc: string,
  detNmeUnq: string
}[]
export type AttributeTypes = {
  dagtDesc: string,
  dagtNmeUnq: string
}[];
export type EntityStorageTypes = {
  destDesc: string,
  destNmeUnq: string,
  destSysTypNme: string
}[];
export type TableTypes = {
  dttDesc: string,
  dttNmeUnq: string
}[];
export type Domain = {
  dmNmeUnq: string,
  dmNme: string,
  dmDesc: string,
  dmOwnerLastName: string | null,
  dmOwnerFirstName: string | null,
  dmOwnerSecondName: string | null,
  dmOwnerEmail: string,
  domain: string
};
export type ConnectionPoint = {
  "cpNmeUnq": string,
  "cpDesc": string,
  "cpHost": string
  "cpPort": string,
  "cpVersion": string,
  "cpObjectName": string,
  "cpUser": string,
  "domain": string
  "parameters": { "paramNmeUnq": string }[],
  "parameterGroups": { "pgNmeUnq": string }[],
}
export type FileContainer = {
  createdAtAsString: string,
  createdBy: string,
  errorFlg: boolean | null,
  ext: string,
  fullName: string,
  id: number,
  loadedAtAsString: string,
  message: Message[] | null,
  modifiedAtAsString: string
  name: string,
};


