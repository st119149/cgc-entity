import React, {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './components/App/App';
import {store} from './store'
import {Provider} from "react-redux";
import {ConfigProvider, message} from "antd";
import {StyleProvider} from '@ant-design/cssinjs';
import ErrorBoundary from "./components/ErrorBoundary";
import {setupInterceptors} from "./http";

message.config({
  top: 48
})

setupInterceptors(store);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <StyleProvider>
      <ConfigProvider
        theme={{
          token: {
            // Seed Token
            colorPrimary: '#722ed1',
          },
        }}>
        <ErrorBoundary>
          <Provider store={store}>
              <App/>
          </Provider>
        </ErrorBoundary>
      </ConfigProvider>
    </StyleProvider>
  </StrictMode>
);
