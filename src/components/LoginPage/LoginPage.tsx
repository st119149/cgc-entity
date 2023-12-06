import React, {useCallback, useEffect, useRef, useState} from "react";
import {Button, Form, Input, InputRef, message, Typography, Upload, UploadFile, UploadProps} from "antd";
import styles from './LoginPage.module.scss';
import {login} from "../../store/slices/authSlice";
import {RootState, useAppDispatch} from "../../store/store";
import {ReactComponent as LogoIcon} from "../../assets/logo.svg";
import {useForm} from "antd/lib/form/Form";

type FieldType = {
  username?: string,
  password?: string
}

const LoginPage: React.FC = () => {

  const dispatch = useAppDispatch();

  const loginRef = useRef<InputRef>(null)

  const [form] = useForm<{ username: string, password: string }>()
  const [isWrong, setIsWrong] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (isWrong)
      form.validateFields();
  }, [isWrong])

  function handleLogin() {
    const {username, password} = form.getFieldsValue()
    if (username && password) {
      setIsLoading(true);
      dispatch(login({username, password})).unwrap()
        .catch(e => {
          if (e.message === '401') {
            setIsWrong(true)
          }
        })
        .finally(() => setIsLoading(false))
    }
  }


  const handleEnterPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }, [])



  useEffect(() => {
    if (loginRef.current) {
      loginRef.current.focus();
    }
    window.addEventListener('keypress', handleEnterPress)
    return () => {
      window.removeEventListener('keypress', handleEnterPress)
    }
  }, [])

  const regExpExpression = '^[A-Za-z0-9_]+$'

  return (
    <div className={styles.component}>
      <div className={styles.intro}>

        <LogoIcon fill={'#fff'} className={styles.intro__logo}/>

        <Typography.Title className={styles.intro__suptitle!} level={3}>
          Компонент формирования конфигурации
        </Typography.Title>

        <Typography.Title className={styles.intro__title!} level={2}>Сущность</Typography.Title>

        <a href="http://adp-eiap-app1.adp.local/docs" target={'_blank'} className={styles.intro__link}>Документация</a>
      </div>

      <div className={styles.form}>
        <Typography.Title level={3}>Вход</Typography.Title>
        <Form form={form} size={'large'}>
          <Form.Item<FieldType>
            name={'username'}
            rules={[
              {required: true, message: ''},
              {pattern: RegExp(regExpExpression), message: 'Введены недопустимые символы'},
              {validator: () => isWrong ? Promise.reject() : Promise.resolve()}
            ]}
          >
            <Input ref={loginRef} placeholder={'Введите наименование учетной записи'}/>
          </Form.Item>
          <Form.Item<FieldType>
            name={'password'}
            rules={[
              {required: true, message: ''},
              {validator: () => isWrong ? Promise.reject(new Error('Учетная запись с введенным наименованием/паролем не существует')) : Promise.resolve()},
              {pattern: RegExp(regExpExpression), message: 'Введены недопустимые символы'},
            ]}
          >
            <Input.Password placeholder={'Введите пароль'}/>
          </Form.Item>
          <Form.Item shouldUpdate>
            {() => {
              const {username,password} = form.getFieldsValue();
              const disabled = !username?.length || !password?.length || !username?.match(RegExp(regExpExpression)) || !password?.match(RegExp(regExpExpression))
              return (
                <Button
                  onClick={handleLogin}
                  htmlType={'submit'}
                  type={'primary'}
                  loading={isLoading}
                  disabled={disabled}
                  className={styles.enter!}
                >
                  Войти
                </Button>
              )
            }}
          </Form.Item>
        </Form>
      </div>

    </div>

  );
}

export default LoginPage;
