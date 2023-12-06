import React, {Key, memo, RefObject, useContext, useEffect, useMemo, useRef, useState} from "react";
import {
  AutoComplete,
  Button,
  Checkbox,
  Dropdown,
  Form,
  Input,
  InputNumber,
  InputRef,
  Select,
  Table, Tag,
  Tooltip
} from 'antd'
import {Attribute, BaseChangeTypes, Cell, CellDataIndex, Entity} from "../../../../types";
import {useDispatch, useSelector} from "react-redux";
import {RootState, useAppDispatch} from "../../../../store/store";
import AttributesTable from "../AttributesTable/AttributesTable";
import {
  addAttribute,
  copyEntity,
  removeEntity,
  selectEntityByEntityId, setSelectedEntityId,
  updateEntity
} from "../../../../store/slices/rowsSlice";
import styles from './EntityBlock.module.scss';
import {ReactComponent as AddIcon} from '../../../../assets/add.svg';
import {ReactComponent as RemoveIcon} from '../../../../assets/remove.svg';
import {ReactComponent as CopyIcon} from '../../../../assets/copy.svg';
import {FormInstance} from "antd/lib";
import {DefaultOptionType} from "antd/es/select";
import classNames from "classnames";
import {CheckboxChangeEvent} from "antd/es/checkbox";

const EditableContext = React.createContext<FormInstance<any> | null>(null);


type EntityFieldProps = {
  record: Entity,
  dataIndex: CellDataIndex<Entity>,
  type?: 'input' | 'textarea' | 'select' | 'autocomplete',
  size?: 'large' | 'middle' | 'small',
  options?: DefaultOptionType[],
  autoSize?: boolean,
  placeholder?: string,
  label?: string,
  title?: string,
  className?: string,
  showSearch?: boolean,
  minWidth?: string
}


//todo: entityField -> editableField
const EntityField: React.FC<EntityFieldProps> = ({
                                                   type = 'input',
                                                   record,
                                                   dataIndex,
                                                   options = [],
                                                   autoSize = false,
                                                   label,
                                                   placeholder,
                                                   className,
                                                   title,
                                                   showSearch = false,
                                                   minWidth = 'auto',
  size = 'small'
                                                 }) => {
  const form = useContext(EditableContext)!;
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleSave() {
    if (inputRef.current) {
      inputRef.current.blur();
    }
    const value: string = form.getFieldValue(dataIndex);
    const body: Record<CellDataIndex<Entity>, string | null> = {
      entityName: record.entityName.value,
      entityDesc: record.entityDesc.value,
      tableType: record.tableType.value,
      changeType: record.changeType.value,
      schemaName: record.schemaName.value,
      detName: record.detName.value,
      destName: record.destName.value,
      connPoint: record.connPoint.value,
      domain: record.domain.value,
      [dataIndex]: value
    }
    dispatch(updateEntity([record.entityId, body]))
  };

  const isError = record[dataIndex].message
  const isBordered = Boolean(isError || !record[dataIndex].value)
  const errorMessage = record[dataIndex].message?.map(m => (
    m.message +
    (m.recomendation ? '\n' + m.recomendation : '') +
    (m.example ? '\nПример: ' + m.example : '')
  ))?.join('\n')

  const fieldTitle = title ?? label ?? '';

  return (
    <div className={classNames(styles.field, className)}>
      {label && <div className={styles.label}>{label}:</div>}
      <Tooltip color={"red"} title={errorMessage ?? null}>
        <Form.Item name={dataIndex} className={styles.formItem!}>
          {type === 'input' && (
            <Input
              ref={inputRef as RefObject<InputRef>}
              onPressEnter={handleSave}
              onBlur={handleSave}
              placeholder={placeholder ?? label}
              bordered={isBordered} status={isError ? 'error' : ''}
              htmlSize={form.getFieldValue(dataIndex)?.length}
              // className={styles.field__item!}
              title={fieldTitle}
              // defaultSize={12}
              size={size}
            />
          )}
          {type === 'textarea' && (
            <Input.TextArea
              ref={inputRef}
              onPressEnter={handleSave}
              onBlur={handleSave}
              placeholder={placeholder ?? label}
              status={isError ? 'error' : ''}
              className={styles.textarea!}
              autoSize
              bordered={isBordered}
              title={fieldTitle}
              size={size}
            />
          )}
          {type === 'select' && (
            <Select
              style={{minWidth}}
              showSearch={showSearch}
              status={isError ? 'error' : ''}
              options={options}
              onChange={handleSave}
              placeholder={placeholder ?? label}
              bordered={isBordered}
              className={styles.field__select!}
              title={fieldTitle}
              size={size}
            />
          )}
          {type === 'autocomplete' && (
            <AutoComplete
              //@ts-ignore
              ref={inputRef}
              onSelect={handleSave}
              onBlur={handleSave}
              placeholder={placeholder ?? label}
              bordered={isBordered} status={isError ? 'error' : ''}
              // className={styles.field__item!}
              title={fieldTitle}
              options={options}
              // defaultSize={12}
              size={size}
            />
          )}
        </Form.Item>
      </Tooltip>
    </div>
  )
}


type EntityBlockProps = {
  entityId: number
}

const EntityBlock: React.FC<EntityBlockProps> = memo(({entityId}) => {

  const dispatch = useAppDispatch();

  const changeTypes = useSelector((state: RootState) => state.dictionaries.changeTypes)
  const entityTypes = useSelector((state: RootState) => state.dictionaries.entityTypes)
  const tableTypes = useSelector((state: RootState) => state.dictionaries.tableTypes)
  const entityStorageTypes = useSelector((state: RootState) => state.dictionaries.entityStorageTypes)
  const domains = useSelector((state: RootState) => state.dictionaries.domains)
  const connectionPoints = useSelector((state: RootState) => state.dictionaries.connectionPoints)
  const entity = useSelector((state: RootState) => selectEntityByEntityId(state, entityId))
  const isChecked = useSelector((state: RootState) => Boolean(state.rows.selectedRowIds[entityId]))
  const isAddAttributeVisible = useMemo(() => entity?.changeType.value !== 'DELETED', [entity?.changeType])

  useEffect(() => {
    if (entity) {
      form.setFieldsValue({
        schemaName: entity.schemaName.value,
        entityName: entity.entityName.value,
        entityDesc: entity.entityDesc.value,
        tableType: entity.tableType.value,
        changeType: entity.changeType.value,
        domain: entity.domain.value,
        connPoint: entity.connPoint.value,
        detName: entity.detName.value,
        destName: entity.destName.value,
      })
    }
  }, [entity])

  const [form] = Form.useForm();

  const isSelectDisabled = useMemo(() =>
      Boolean(entity && Object.values(entity).find(field =>
        typeof field === 'object' &&
        !Array.isArray(field) &&
        field.errorFlg))
    , [entity])


  if (!entity) {
    return null;
  }


  const changeTypesOptions = changeTypes ? Object.entries(changeTypes).map(type => {
    const label = (<Tag
      color={
        type[0] === 'DELETED' ? 'red' :
          type[0] === 'UPDATED' ? 'gold' :
            type[0] === 'ADDED' ? 'green' : 'default'}>
      {type[1]}</Tag>)
    return {
      label: type[1],
      value: type[0]
    }
  }) : [];
  const entityTypesOptions = entityTypes ? entityTypes.map(type => ({
    label: type.detNmeUnq?.toLowerCase(),
    value: type.detNmeUnq?.toLowerCase()
  })) : [];
  const tableTypesOptions = tableTypes ? tableTypes.map(type => ({
    label: type.dttNmeUnq,
    value: type.dttNmeUnq
  })) : [];
  const entityStorageTypesOptions = entityStorageTypes ? entityStorageTypes.map(type => ({
    label: type.destNmeUnq,
    value: type.destNmeUnq
  })) : [];
  const domainsOptions = domains ? domains.map(type => ({
    label: type.dmNmeUnq,
    value: type.dmNmeUnq
  })) : [];
  const connectionPointsOptions = connectionPoints ? connectionPoints.map(type => ({
    label: type.cpNmeUnq,
    value: type.cpNmeUnq
  })) : [];


  const handleAddAttribute = () => {
    dispatch(addAttribute({entityId: entityId}))
  }
  const handleRemoveEntity = () => {
    dispatch(removeEntity({entityId}))
  }
  const handleCopyEntity = () => {
    const body: Record<CellDataIndex<Entity>, string | null> = {
      entityName: entity.entityName.value,
      entityDesc: entity.entityDesc.value,
      tableType: entity.tableType.value,
      changeType: entity.changeType.value,
      schemaName: entity.schemaName.value,
      detName: entity.detName.value,
      destName: entity.destName.value,
      connPoint: entity.connPoint.value,
      domain: entity.domain.value,
    }
    dispatch(copyEntity([entity.entityId, body]))
  }

  function handleSelect(e: CheckboxChangeEvent) {
    dispatch(setSelectedEntityId({entityId, checked: e.target.checked}))

  }


  return (
    <div className={classNames(styles.component!, {[styles.selected!]: isChecked})}>
      <Tooltip title={isSelectDisabled ? 'Сущность содержит ошибки' : ''}>
        <Checkbox disabled={isSelectDisabled} checked={isChecked} onChange={handleSelect}/>
      </Tooltip>
      <Form form={form} size={"small"} className={styles.form}>
        <EditableContext.Provider value={form}>
          <EntityField placeholder={'Схема'} type={"input"} dataIndex={'schemaName'} record={entity} label={'Схема'}/>
          <EntityField placeholder={'Наименование сущности'} type={"input"} dataIndex={'entityName'} record={entity}
                       label={'Наименование'}/>

          <EntityField placeholder={'Описание сущности'} type={"textarea"} dataIndex={'entityDesc'} record={entity}
                       label={'Описание'}/>

          <EntityField label={'Тип сущности'} type={"select"} dataIndex={'detName'}
                       record={entity}
                       minWidth={'180px'}
                       options={entityTypesOptions}/>

          <EntityField label={'Тип измерения'} type={"select"} options={tableTypesOptions} minWidth={'180px'}
                       dataIndex={'tableType'}
                       record={entity}/>
          <EntityField label={'Тип хранения'} type={"select"} options={entityStorageTypesOptions} minWidth={'180px'}
                       showSearch
                       dataIndex={'destName'}
                       record={entity}/>
          <EntityField label={'Домен'} type={"autocomplete"} options={domainsOptions} dataIndex={'domain'}
                       record={entity}/>
          <EntityField label={'Точка подключения'} type={"autocomplete"} options={connectionPointsOptions}
                       dataIndex={'connPoint'}
                       record={entity}/>

          <EntityField label={'Тип изменения'} type={"select"} dataIndex={'changeType'}
                       record={entity}
                       minWidth={'120px'}
                       options={changeTypesOptions} className={styles.changeType!}
                       size={'large'}
          />
        </EditableContext.Provider>
      </Form>

      <div className={styles.actions}>
        <Button onClick={handleAddAttribute} icon={<AddIcon/>} type={"text"}
                className={classNames({[styles.hidden!]: !isAddAttributeVisible})}>Добавить атрибут</Button>
        {/*<Button onClick={handleCopyEntity} icon={<CopyIcon/>} type={"text"}>Копировать</Button>*/}
        <Button onClick={handleRemoveEntity} icon={<RemoveIcon/>} type={"text"}>Удалить</Button>
      </div>
    </div>
  );
})


export default EntityBlock;
