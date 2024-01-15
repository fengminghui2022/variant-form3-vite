import { ElMessage } from 'element-plus'
import cookie from 'js-cookie'
export const handleChangeRequestHeader = (config) => {
//   config["xxxx"] = "xxx";
  return config;
};

export const handleConfigureAuth = (config) => {
  config.headers["Authorization"] = "Bearer "+ cookie.get('admin-plus-token') || "Bearer eyJhbGciOiJIUzUxMiJ9.eyJ1c2VySWQiOjEyNjU0NzY4OTA2NzI2NzI4MDgsImFjY291bnQiOiJzdXBlckFkbWluIiwidXVpZCI6IjE5ZTQyODg4LWRhNDQtNGM4NS04NmUyLTI2NTM2MTEwNzVkMSIsInN1YiI6IjEyNjU0NzY4OTA2NzI2NzI4MDgiLCJpYXQiOjE3MDI1MjE4NDgsImV4cCI6MTcwMjYwODI0OH0.ZVDCIzlOF2XWda3hWNmRd5Y6mpj-UhSVtfW2Xz7DcyOGHE1ITATNkVYom9iZfKsEEz9CwRvIZgoQe6lR4gTENQ";
  return config;
};

export const handleNetworkError = (errStatus) => {
  const networkErrMap = {
    "400": "错误的请求", // token 失效
    "401": "未授权，请重新登录",
    "403": "拒绝访问",
    "404": "请求错误，未找到该资源",
    "405": "请求方法未允许",
    "408": "请求超时",
    "500": "服务器端出错",
    "501": "网络未实现",
    "502": "网络错误",
    "503": "服务不可用",
    "504": "网络超时",
    "505": "http版本不支持该请求",
  };
  if (errStatus) {
    ElMessage.error(networkErrMap[errStatus] ?? `其他连接错误 --${errStatus}`);
    switch(errStatus){
      case 401:
        console.log('errStatus: ', errStatus);
        break;
      default:
    }
    return;
  }

  ElMessage.error("无法连接到服务器！");
};

export const handleAuthError = (errno) => {
  const authErrMap = {
    "10031": "登录失效，需要重新登录", // token 失效
    "10032": "您太久没登录，请重新登录~", // token 过期
    "10033": "账户未绑定角色，请联系管理员绑定角色",
    "10034": "该用户未注册，请联系管理员注册用户",
    "10035": "code 无法获取对应第三方平台用户",
    "10036": "该账户未关联员工，请联系管理员做关联",
    "10037": "账号已无效",
    "10038": "账号未找到",
  };

  if (authErrMap.hasOwnProperty(errno)) {
    ElMessage.error(authErrMap[errno]);
    // 授权错误，登出账户
    // logout();
    return false;
  }

  return true;
};

export const handleGeneralError = (code, errMsg) => {
    console.log('code: ', code);
  if (code&&code != "200") {
    ElMessage.error(errMsg||'后台返回错误');
    return false;
  }

  return true;
};
