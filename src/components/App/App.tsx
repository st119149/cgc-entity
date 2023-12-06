import logo from '../logo.svg';
import Header from "../Header";
import EntityList from "../EntityList";
import FileList from "../FileList";
import styles from './App.module.scss';
import React, {createRef, useEffect, useRef, useState} from "react";
import LoginPage from "../LoginPage";
import {RootState, useAppDispatch} from "../../store/store";
import {checkAuth, login} from "../../store/slices/authSlice";
import {useSelector} from "react-redux";
import {message, Spin} from "antd";


const App: React.FC = () => {

  const dispatch = useAppDispatch();
  const isAuth = useSelector((state: RootState) => state.auth.isAuth)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    dispatch(checkAuth()).unwrap()
      .finally(() => setIsLoading(false))
  }, [])


  if (isLoading) {
    return <Spin size={"large"} spinning className={styles.spin!}/>
  }

  return (
    <div className={styles.component}>
      {isAuth ? (
          <>
            <Header/>
            <EntityList />
          </>
        ) :
        <LoginPage/>
      }
    </div>
  );
}

export default App;
