import React, {Key, memo, useContext, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState, useAppDispatch} from "../../../store/store";
import AttributesTable from "./AttributesTable/AttributesTable";
import {addAttribute, removeEntity, selectEntityByEntityId, updateEntity} from "../../../store/slices/rowsSlice";
import styles from './EntityListItem.module.scss';
import classNames from "classnames";
import EntityBlock from "./EntityBlock";
import {CSSTransition} from 'react-transition-group';


type EntityListItemProps = {
  entityId: number,
  visible?: boolean
}

const EntityListItem: React.FC<EntityListItemProps> = memo(({entityId, visible = true}) => {



  return (

    <div
      className={classNames(styles.block,
        {[styles.hidden!]: !visible})}
    >
      <EntityBlock entityId={entityId}/>
      <AttributesTable entityId={entityId}/>
    </div>
  );
})


export default EntityListItem;
