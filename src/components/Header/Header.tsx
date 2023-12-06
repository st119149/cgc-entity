import React from "react";
import styles from './Header.module.scss';
import {ReactComponent as LogoIcon} from '../../assets/logo.svg';
import FileList from "../FileList";
import Toolbar from "./Toolbar";


const Header: React.FC = () => {

  return (
    <div className={styles.component}>
      <header className={styles.header}>
        <div className={styles.title}>
          <LogoIcon className={styles.logo}/>
          <h1>
            Компонент формирования конфигурации <span className={styles.name}>Сущность</span>
          </h1>
        </div>


       <Toolbar/>
      </header>

      <FileList/>

    </div>

  );
}

export default Header;
