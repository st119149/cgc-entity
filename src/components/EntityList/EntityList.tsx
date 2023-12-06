import React, {
  createRef,
  forwardRef, ForwardRefExoticComponent,
  Key,
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {useSelector} from "react-redux";
import {addEntity, fetchRows, selectEntities} from "../../store/slices/rowsSlice";
import {
  fetchAttributeTypes,
  fetchChangeTypes, fetchConnectionPoints, fetchDomains,
  fetchEntityStorageTypes,
  fetchEntityTypes, fetchTableTypes
} from "../../store/slices/dictionariesSlice";
import {RootState, store, useAppDispatch} from "../../store/store";
import {Button, Empty, Skeleton, Spin} from "antd";
import styles from './EntityList.module.scss';
import AttributesTable from "./EntityListItem/AttributesTable";
import classNames from "classnames";
import {ReactComponent as AddIcon} from '../../assets/add.svg';
import {fetchContainers} from "../../store/slices/containersSlice";
import {
  CSSTransition,
  TransitionGroup,
} from 'react-transition-group';
import EntityListItem from "./EntityListItem/EntityListItem";

const EntitySkeleton = forwardRef<HTMLDivElement, {}>((props, ref) => (
  <div
    ref={ref}
    className={classNames(styles.block, styles.skeleton)}
  >
    <div className={styles.first!}>
      <Skeleton className={styles.skeletonItem!} paragraph={{rows: 1, width: '100%'}} active title={false}/>
      <Skeleton className={styles.skeletonItem!} paragraph={{rows: 1, width: '100%'}} active title={false}/>
    </div>
    <div className={styles.second!}>
      <Skeleton className={styles.skeletonItem!} paragraph={{rows: 1, width: '100%'}} active title={false}/>
    </div>
    <div className={styles.third!}>
      <Skeleton className={styles.skeletonItem!} paragraph={{rows: 1, width: '100%'}} active title={false}/>
      <Skeleton className={styles.skeletonItem!} paragraph={{rows: 1, width: '100%'}} active title={false}/>
    </div>

    <div className={styles.fourth}>
      <Skeleton.Input className={styles.skeletonItem!} active block/>

      <Skeleton.Input className={styles.skeletonItem!} active block/>
      <Skeleton.Input className={styles.skeletonItem!} active block/>
      <Skeleton.Input className={styles.skeletonItem!} active block/>
    </div>

  </div>
))

type EntityListProps = {
}


const EntityList: React.FC<EntityListProps> = () => {

  const dispatch = useAppDispatch();

  const entities = useSelector(selectEntities);
  const selectedFileKeys = useSelector((state: RootState) => state.containers.selectedFileKeys);
  const status = useSelector((state: RootState) => state.rows.status);
  const containerRef = useRef<HTMLDivElement>(null)

  const skeletonRef = createRef<HTMLDivElement>()

  useEffect(() => {
    dispatch(fetchRows());
    dispatch(fetchChangeTypes());
    dispatch(fetchEntityTypes());
    dispatch(fetchAttributeTypes());
    dispatch(fetchEntityStorageTypes());
    dispatch(fetchContainers());
    dispatch(fetchTableTypes());
    dispatch(fetchDomains());
    dispatch(fetchConnectionPoints());
  }, [])

  useEffect(() => {
    containerRef.current?.scrollTo(0,0)
  }, [selectedFileKeys])
  useEffect(() => {
    if (status === 'loading') {
      skeletonRef.current?.scrollIntoView({block: 'center', behavior: 'smooth'})
    }
  }, [status])


  function handleAddEntity() {
    dispatch(addEntity())
      .then(() => {
        dispatch(fetchContainers())
        containerRef.current?.scrollTo(0, containerRef.current?.scrollHeight)
      })
  }

  return (

    <div ref={containerRef} className={styles.component!}>

      {!entities.length && status !== 'loading' && (
        <div className={styles.component!}>
          <Empty description={'Данные отсутствуют'}/>
        </div>
      )}

      {/*<TransitionGroup component={null}>*/}
        {entities.map(entity => (
          // <CSSTransition
          //   key={entity.entityId}
          //   timeout={{
          //     enter: 200,
          //     exit: 200,
          //   }}
          //   classNames={{
          //     enter: styles.itemEnter,
          //     enterActive: styles.itemEnterActive,
          //     exit: styles.itemExit,
          //     exitActive: styles.itemExitActive
          //   }}
          // >
            <EntityListItem
              key={entity.entityId}
              visible={Boolean(!entity.excelFileId || !selectedFileKeys.length || selectedFileKeys.includes(entity.excelFileId))}
              entityId={entity.entityId}
            />
          // </CSSTransition>
        ))}
      {/*</TransitionGroup>*/}
      {status === 'loading' && (
        <>
          <EntitySkeleton ref={skeletonRef}/>
          <EntitySkeleton/>
          <EntitySkeleton/>
        </>
      )}
      <Button
        onClick={handleAddEntity}
        className={styles.bottomButton!}
        icon={<AddIcon/>}
        type={"primary"}
      >
        Добавить сущность
      </Button>
    </div>

  );
}


export default EntityList;
