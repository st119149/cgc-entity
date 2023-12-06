import React, {Key, memo, MutableRefObject, RefObject, useContext, useEffect, useMemo, useRef, useState} from "react";
import {Button, Checkbox, Dropdown, Form, Input, InputNumber, InputRef, Select, Table, Tooltip} from 'antd'
import {FormInstance} from "antd/lib";
import {Attribute, Cell, CellDataIndex, Entity} from "../../../../types";
import {useDispatch, useSelector} from "react-redux";
import {RootState, useAppDispatch} from "../../../../store/store";
import {
  addAttribute, copyAttribute,
  removeAttribute,
  removeEntity,
  selectAttributesByEntityId, selectEntityByEntityId, selectSelectedAttributeIdsByEntityId, setSelectedAttributeIds,
  updateAttribute,
  updateEntity
} from "../../../../store/slices/rowsSlice";
import styles from "./AttributesTable.module.scss";
import {ReactComponent as RemoveIcon} from '../../../../assets/remove.svg';
import {ReactComponent as CopyIcon} from '../../../../assets/copy.svg';
import classNames from "classnames";
import {TableRowSelection} from "antd/es/table/interface";
import {CSSTransition} from "react-transition-group";
import {ColumnsType} from "antd/lib/table";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

type EditableRowProps = {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({index, ...props}) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false} size={"small"}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

type EditableCell = {
  dataIndex: CellDataIndex<Attribute>;
  record: Attribute;
  type?: 'input' | 'textarea' | 'number' | 'checkbox' | 'dropdown';
  options?: Array<{ label: string, value: unknown }>
}


const EditableCell: React.FC<EditableCell> = memo(({
                                                     type = 'input',
                                                     options = [],
                                                     dataIndex,
                                                     record,
                                                   }) => {

  const form = useContext(EditableContext)!;
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    form.setFieldsValue({[dataIndex]: record[dataIndex].value});
  }, [record]);


  const save = async () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }

    const value: string = form.getFieldValue(dataIndex);
    const body = {
      attrName: record.attrName.value,
      attrDesc: record.attrDesc.value,
      attrType: record.attrType.value,
      attrSize: record.attrSize.value,
      attrPrec: record.attrPrec.value,
      attrMand: record.attrMand.value,
      attrPk: record.attrPk.value,
      changeType: record.changeType.value,
      [dataIndex]: value
    }
    await dispatch(updateAttribute([record.entityId, record.id, body]))

  };
  const isError = record[dataIndex].message
  const isBordered = Boolean(isError || !record[dataIndex].value)
  const errorMessage = record[dataIndex].message?.map(m => m.message)?.join('\n')
  console.log('render', dataIndex)
  return (
    <Tooltip color={"red"} title={errorMessage ?? null}>
      {type === 'input' && (
        <Form.Item name={dataIndex} noStyle>
          <Input ref={inputRef as RefObject<InputRef>} onPressEnter={save} className={styles.field!} onBlur={save}
                 bordered={isBordered}
                 status={errorMessage ? "error" : ''}/>
        </Form.Item>
      )}
      {type === 'textarea' && (
        <Form.Item name={dataIndex} noStyle>
          <Input.TextArea ref={inputRef} onPressEnter={save} className={styles.textarea!} onBlur={save} autoSize
                          bordered={isBordered} status={errorMessage ? "error" : ''}/>
        </Form.Item>
      )}
      {type === 'number' && (
        <Form.Item name={dataIndex} noStyle>
          <InputNumber ref={inputRef} onPressEnter={save} className={styles.field!}
                       bordered={isBordered} onBlur={save}
                       status={errorMessage ? "error" : ''}/>
        </Form.Item>
      )}
      {type === 'checkbox' && (
        <Form.Item name={dataIndex} noStyle valuePropName="checked">
          <Checkbox onChange={save} className={styles.checkbox!}/>
        </Form.Item>
      )}
      {type === 'dropdown' && (
        <Form.Item name={dataIndex} noStyle>
          <Select options={options} className={styles.field!} onChange={save} bordered={isBordered}
                  status={errorMessage ? "error" : ''}/>
        </Form.Item>
      )}
    </Tooltip>
  )
});


type AttributesTableProps = {
  entityId: number,
}

const AttributesTable: React.FC<AttributesTableProps> = memo(({entityId}) => {

  const dispatch = useAppDispatch();

  const changeTypes = useSelector((state: RootState) => state.dictionaries.changeTypes)
  const attrTypes = useSelector((state: RootState) => state.dictionaries.attributeTypes)
  const entity = useSelector((state: RootState) => selectEntityByEntityId(state, entityId))
  const selectedAttributeKeys = useSelector((state: RootState) => selectSelectedAttributeIdsByEntityId(state, entityId))
  const attributes = entity?.attributes

  const changeTypesOptions = changeTypes ? Object.entries(changeTypes).map(type => ({
    label: type[1] as string,
    value: type[0]
  })) : [];
  const attrTypesOptions = attrTypes ? Object.entries(attrTypes).map(type => ({
    label: type[0],
    value: type[1]
  })) : [];

  function shouldCellUpdate(record: Attribute, prevRecord: Attribute, dataIndex: CellDataIndex<Attribute>) {
    const cell = record[dataIndex],
      prevCell = prevRecord[dataIndex]
    return cell.value !== prevCell.value || cell.errorFlg !== prevCell.errorFlg
  }


  const defaultColumns: ColumnsType<Attribute> = [
    {
      title: 'Наименование',
      key: 'attrName',
      width: '160px',
      render: (value: Attribute) => <EditableCell dataIndex={'attrName'} record={value} type={'input'}/>,
      shouldCellUpdate: (rec, prevRec) => shouldCellUpdate(rec, prevRec, 'attrName')
    },
    {
      title: 'Описание',
      key: 'attrDesc',
      width: 'auto',
      render: (value: Attribute) => <EditableCell dataIndex={'attrDesc'} record={value} type={'textarea'}/>,
      shouldCellUpdate: (rec, prevRec) => shouldCellUpdate(rec, prevRec, 'attrDesc')
    },
    {
      title: 'Тип данных',
      key: 'attrType',
      width: '128px',
      render: (value: Attribute) => <EditableCell dataIndex={'attrType'} record={value} type={'dropdown'}
                                                  options={attrTypesOptions}/>,
      shouldCellUpdate: (rec, prevRec) => shouldCellUpdate(rec, prevRec, 'attrType')
    },
    {
      title: 'Размер поля',
      key: 'attrSize',
      width: '100px',
      render: (value: Attribute) => <EditableCell dataIndex={'attrSize'} record={value} type={'number'}/>,
      shouldCellUpdate: (rec, prevRec) => shouldCellUpdate(rec, prevRec, 'attrSize')
    },
    {
      title: 'Точность поля',
      key: 'attrPrec',
      width: '120px',
      render: (value: Attribute) => <EditableCell dataIndex={'attrPrec'} record={value} type={'number'}/>,
      shouldCellUpdate: (rec, prevRec) => shouldCellUpdate(rec, prevRec, 'attrPrec')
    },
    {
      title: 'Обязательность',
      key: 'attrMand',
      align: 'center',
      width: '124px',
      render: (value: Attribute) => <EditableCell dataIndex={'attrMand'} record={value} type={'checkbox'}/>,
      shouldCellUpdate: (rec, prevRec) => shouldCellUpdate(rec, prevRec, 'attrMand')
    },
    {
      title: 'РК',
      key: 'attrPk',
      width: '36px',
      render: (value: Attribute) => <EditableCell dataIndex={'attrPk'} record={value} type={'checkbox'}/>,
      shouldCellUpdate: (rec, prevRec) => shouldCellUpdate(rec, prevRec, 'attrPk')
    },
    {
      title: 'Тип изменения',
      key: 'changeType',
      width: '128px',
      render: (value: Attribute) => <EditableCell dataIndex={'changeType'} record={value} type={'dropdown'}
                                                  options={changeTypesOptions}/>,
      shouldCellUpdate: (rec, prevRec) => shouldCellUpdate(rec, prevRec, 'changeType')
    },
    {
      key: 'actions',
      width: '80px',
      render: (attr: Attribute) => (
        <div className={styles.actions}>
          <Button
            onClick={() => handleCopyAttribute(attr)}
            icon={<CopyIcon/>}
            type={'text'}
          />
          <Button
            onClick={() => handleRemoveAttribute(attr.id)}
            icon={<RemoveIcon/>}
            type={'text'}
          />
        </div>
      )
    }
  ]

  const components = {
    body: {
      row: EditableRow,
    },
  };


  function hasErrorMessage(record: Attribute) {
    return Boolean(
      Object.values(record).find(field => typeof field === 'object' && field.message) || (entity &&
        Object.values(entity).find(field => typeof field === 'object' && !Array.isArray(field) && field.message))
    )
  }

  // const rowSelection: TableRowSelection<Attribute> = {
  //   selectedRowKeys: selectedAttributeKeys,
  //   onChange: (selectedRowKeys, selectedRows) => {
  //     dispatch(setSelectedAttributeIds({entityId, selectedRowKeys: selectedRowKeys as number[]}))
  //   },
  //   getCheckboxProps: (record) => ({
  //     disabled: hasErrorMessage(record),
  //   }),
  //   renderCell: (value, record, index, originNode) => {
  //     return (
  //       <Tooltip
  //         title={hasErrorMessage(record) ? 'Атрибут или сущность содержит ошибки' : 'Выбрать атрибут для выгрузки'}>
  //         {originNode}
  //       </Tooltip>
  //     )
  //   }
  // };


  const handleRemoveAttribute = (id: number) => {
    dispatch(removeAttribute({entityId: entityId, attrId: id}))
  }
  const handleCopyAttribute = (record: Attribute) => {
    const body = {
      attrName: record.attrName.value,
      attrDesc: record.attrDesc.value,
      attrType: record.attrType.value,
      attrSize: record.attrSize.value,
      attrPrec: record.attrPrec.value,
      attrMand: record.attrMand.value,
      attrPk: record.attrPk.value,
      changeType: record.changeType.value,
    }
    dispatch(copyAttribute([entityId, body]))
  }

  return (
    <Table
      dataSource={attributes as any}
      columns={defaultColumns as any}
      components={components}
      pagination={false}
      size={"small"}
      rowKey={(record) => record.id}
      // @ts-ignore
      rowSelection={rowSelection}
      tableLayout={"fixed"}
      className={styles.component!}
      rowClassName={() => styles.row!}
      locale={{
        emptyText: 'Атрибуты отсутствуют'
      }}
      sticky

    />
  );
})


export default AttributesTable;
