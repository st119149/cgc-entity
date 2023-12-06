import axios from "axios";
import {message} from "antd";
import {AUTH_STORAGE_KEY, AuthData, logout} from "../store/slices/authSlice";
import {fetchRows} from "../store/slices/rowsSlice";
import {fetchContainers} from "../store/slices/containersSlice";
import {AppStore} from "../store/store";

//CGC
export const client = axios.create({
  baseURL: window['config']?.REACT_APP_BASE_URL_API,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  }
});

export const contentClient = axios.create({
  baseURL: window['config']?.REACT_APP_BASE_URL_API,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  }
});

//BUM
export const clientBUM = axios.create({
  baseURL: window['config']?.REACT_APP_BUM_API,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  auth: {
    username: process.env.REACT_APP_BUM_AUTH_LOGIN ?? window['config']?.BUM_AUTH_LOGIN,
    password: process.env.REACT_APP_BUM_AUTH_PASSWORD ?? window['config']?.BUM_AUTH_PASSWORD
  }
});

//SMC
export const clientSMC = axios.create({
  baseURL: window['config']?.REACT_APP_SMC_API,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});


export function setupInterceptors(store: AppStore) {

  client.interceptors.request.use(function (config) {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!) as AuthData;
    if (auth) {
      config.auth = {username: auth.username, password: auth.password}
    }
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

  client.interceptors.response.use(function (response) {
    return response;
  }, async function (error) {
    message.error(JSON.stringify(error.message))

    if (error.response.status === 401) {
      store.dispatch(logout())
    } else {
      store.dispatch(fetchRows())
      store.dispatch(fetchContainers())
    }

    return Promise.reject(error);
  });

  contentClient.interceptors.request.use(function (config) {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!) as AuthData;
    if (auth) {
      config.auth = {username: auth.username, password: auth.password}
    }
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

  contentClient.interceptors.response.use(function (response) {
    return response;
  }, async function (error) {
    message.error(JSON.stringify(error.message))

    if (error.response.status === 401) {
      store.dispatch(logout())
    }

    return Promise.reject(error);
  });


  clientBUM.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    console.log(error)
    message.error(JSON.stringify(error.message))
    return Promise.reject(error);
  });


  clientSMC.interceptors.request.use(function (config) {
    const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!) as AuthData;
    if (auth) {
      config.auth = {username: auth.username, password: auth.password}
    }
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

  clientSMC.interceptors.response.use(function (response) {

    return response;
  }, function (error) {
    // console.log(error)
    // message.error(JSON.stringify(error.message))
    return Promise.reject(error);
  });
}





