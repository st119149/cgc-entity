import React, {memo, useCallback, useEffect, useState} from "react";
import {Button, message, notification, Upload, UploadFile, UploadProps} from "antd";
import {RcFile, UploadChangeParam} from "antd/es/upload";
import {RootState, useAppDispatch} from "../../../store/store";
import {downloadYAML, fetchContainers, uploadFile, validateYAML} from "../../../store/slices/containersSlice";
import classNames from "classnames";
import styles from './Toolbar.module.scss';
import {ReactComponent as UploadIcon} from '../../../assets/upload.svg';
import {ReactComponent as DownloadIcon} from '../../../assets/download.svg';
import {ReactComponent as LogoutIcon} from '../../../assets/logout.svg';
import {ReactComponent as DocIcon} from '../../../assets/doc.svg';
import {ReactComponent as TemplateIcon} from '../../../assets/template.svg';
import {fetchRows} from "../../../store/slices/rowsSlice";
import {logout} from "../../../store/slices/authSlice";
import {useSelector} from "react-redux";
import {ContainersService} from "../../../services/containers.service";
import download from "../../../utils/download";
import {AxiosRequestConfig} from "axios";
import {createPortal} from "react-dom";


const Toolbar: React.FC = () => {

  const [notificationApi, contextHolder] = notification.useNotification();


  const dispatch = useAppDispatch();
  const username = useSelector((state: RootState) => state.auth.username)
  const entitiesLength = useSelector((state: RootState) => state.rows.entities.length)


  const [isValidateLoading, setIsValidateLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const handleUpload: UploadProps['customRequest'] = (options) => {
    const fmData = new FormData();
    const config: AxiosRequestConfig = {
      headers: {"content-type": "multipart/form-data"},
      onUploadProgress: event => {
        const percent = Math.floor((event.loaded / event.total!) * 100);
        //todo: uploadProgress
        // setUploadProgress(percent)
      }
    };
    fmData.append("files", options.file);

    // setUploadProgress(0);
    dispatch(uploadFile({formData: fmData, config}))
      .unwrap()
      .then(resp => {
        dispatch(fetchContainers())
        dispatch(fetchRows())
        message.info(resp.message, 5)
      })
      .finally(() => setUploadProgress(null))
  };

  function handleDownload() {
    if (!entitiesLength) {
      message.error('Данные отсутствуют')
      return;
    }
    dispatch(downloadYAML()).unwrap()
      .then(response => download(response.data, response.filename))
      .catch(e => message.error(e.message))
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, [])

  useEffect(() => {

    window.addEventListener('dragenter', handleDrag);
    return () => {
      window.removeEventListener('dragenter', handleDrag)
    }
  }, [])

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      const formData = new FormData();
      Array.from<Blob>(e.dataTransfer.files).forEach(file => {
        formData.append("files", file);
      });
      dispatch(uploadFile({formData})).unwrap()
        .then((resp) => {
          dispatch(fetchContainers())
          dispatch(fetchRows());
          message.info(resp.message, 5);
        })

    }
    setDragActive(false);
  };

  function handleLogout() {
    dispatch(logout());
  }

  function handleValidate() {
    if (!entitiesLength) {
      message.error('Данные отсутствуют')
      return;
    }
    const messageText = 'Результаты проверки YAML-конфигурации';
    const duration = 10;
    setIsValidateLoading(true)
    dispatch(validateYAML()).unwrap()
      .then(resp => notificationApi.success({
        message: messageText,
        description: 'Проверка пройдена успешно',
        duration,
        placement: 'topRight',
        className: styles.notification!
      }))
      .catch(resp => notificationApi.error({
        message: messageText,
        description: resp?.message ?? 'Валидация не пройдена',
        duration: 10000,
        placement: 'topRight',
        className: styles.notification!
      }))
      .finally(() => setIsValidateLoading(false))
  }

  function handleDownloadTemplate() {
    ContainersService.downloadTemplate()
      .then(response => download(response.data, response.filename))
  }


  const [dragActive, setDragActive] = useState(false);

  return (
    <div className={styles.component}>


      <div className={classNames(styles.progressBar, {[styles.visible!]: uploadProgress !== null})}>
        <div className={styles.progress} style={{width: (100 - (uploadProgress ?? 0)) + '%'}}/>
      </div>
      <Upload
        name={'files'}
        showUploadList={false}
        customRequest={handleUpload}
        accept={'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.yaml'}
        multiple
      >
        <Button icon={<UploadIcon fill={'#8c8c8c'}/>}>Загрузить</Button>
      </Upload>

      <Button.Group>
        <Button onClick={handleValidate} loading={isValidateLoading}>
          Проверить YAML
        </Button>

        <Button onClick={handleDownload} icon={<DownloadIcon fill={'#8c8c8c'}/>}>
          Выгрузить
        </Button>
      </Button.Group>

      <Button onClick={handleDownloadTemplate} icon={<TemplateIcon fill={'#8c8c8c'}/>} type={'text'}
              title={'Скачать шаблон'}/>

      <a href="http://adp-eiap-app1.adp.local/docs" target={'_blank'}>
        <Button title={'Документация ОД'} type={'text'} target={'_blank'} icon={<DocIcon fill={'#8c8c8c'}/>}/>
      </a>
      <Button onClick={handleLogout} title={`Выйти (${username})`} type={'text'} className={styles.user!}
              icon={<LogoutIcon fill={'#8c8c8c'}/>}/>

      {createPortal(<div
        onDragLeave={handleDrag}
        onDrag={handleDrag}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={classNames(styles.dropZone!, {[styles.active!]: dragActive})}
      >
        <UploadIcon fill={'#722ed1'} className={styles.dropZone__upload}/>
      </div>,
      document.body)}

      {contextHolder}
    </div>

  );
}

export default Toolbar;
