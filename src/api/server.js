import axios from "axios";

import {
  handleChangeRequestHeader,
  handleConfigureAuth,
  handleAuthError,
  handleGeneralError,
  handleNetworkError,
} from "./tools";

const baseURL='https://api.dev.furenyun.com/api'

const service = axios.create({
  // 表示请求URL公共部分，它会读取这里的值，然后拼接上页面使用的url
  baseURL,
  timeout: 5000,
  withCredentials: false, // 跨域请求时是否需要cookie等凭证
  responseType: "json",
  params: {},
  maxContentLength: 2000,
  validateStatus: status => status >= 200 && status < 300, //默认值
  maxRedirects: 5, //最大允许重定向次数
  headers: {
    //公共请求头配置，本项目请求头大多数接口是这个，所以这里可以配置一下，对于特殊接口单独配置
    // "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    "Content-Type": "application/json;charset=UTF-8"
  }
  // transformRequest: [data => Qs.stringify(data, { indices: true })] //将参数key=value序列化，因为本项目有的接口需要json/对象传参数，这里就不能这样直接全局配置，否则有的接口会报400(因为你把json或者是对象类型的数据，在这里key=value序列化了)
})

service.interceptors.request.use((config) => {
  config = handleChangeRequestHeader(config);
  config = handleConfigureAuth(config);
  console.log('config: ', config);
  return config;
});

service.interceptors.response.use(
  (response) => {
    if (response.status !== 200) return Promise.reject(response.data);
    handleAuthError(response.data.code);
    handleGeneralError(response.data.code, response.data.errMsg);
    return response;
  },
  (err) => {
    handleNetworkError(err.response.status);
    return Promise.reject(err.response);
  }
);

export const Get = (url, params = {}, clearFn) =>
  new Promise((resolve) => {
    service
      .get(url, { params })
      .then((result) => {
        let res;
        if (clearFn !== undefined) {
          res = clearFn(result.data);
        } else {
          res = result.data;
        }
        resolve(res);
      })
      .catch((err) => {
        resolve(err);
      });
  });

export const Post = (url, data, params = {}) => {
  return new Promise((resolve) => {
    service
      .post(url, data, { params })
      .then((result) => {
        resolve(result.data);
      })
      .catch((err) => {
        resolve(err);
      });
  });
};

export const CustomRequest=(url,method,contentType,data)=>{
  return new Promise((resolve)=>{
    service({
      method,
      url,
      headers:{
        'Content-Type': contentType||"application/json;charset=UTF-8",
      },
      data
    }).then((result) => {
      resolve(result.data);
    })
    .catch((err) => {
      resolve(err);
    });
  })
}

