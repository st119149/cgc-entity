import React, {useCallback, useEffect, useState} from "react";
import {RootState, useAppDispatch} from "../../store/store";
import styles from './FileList.module.scss';
import {useSelector} from "react-redux";
import {Button} from "antd";
import {ReactComponent as RemoveIcon} from '../../assets/remove.svg';
import classNames from "classnames";
import {fetchContainers, removeFile, setSelectedFileIds} from "../../store/slices/containersSlice";
import {fetchRows} from "../../store/slices/rowsSlice";


const FileList: React.FC = () => {

  const dispatch = useAppDispatch();

  const files = useSelector((state: RootState) => state.containers.files);
  const selectedFileKeys = useSelector((state: RootState) => state.containers.selectedFileKeys);

  function handleRemoveFile(e: React.MouseEvent, fileId: number) {

    e.stopPropagation();
    dispatch(removeFile({fileId}))
  }

  return (
    <div className={classNames(styles.component, {[styles.hidden!]: !files.length})}>
      {files.map(file => (
        <div
          key={file.id}
          className={classNames(styles.file, {[styles.selected!]: selectedFileKeys.includes(file.id)})}
          onClick={() => dispatch(setSelectedFileIds(file.id))}
        >
          <div>{file.name}{file.ext && <span className={styles.ext}>.{file.ext}</span>}</div>
          <Button onClick={e => handleRemoveFile(e, file.id)} size={"small"} type={"text"} icon={<RemoveIcon/>}/>
        </div>
      ))}
    </div>
  );
}

export default FileList;
