import {CustomRequest} from "@/api/server"

const getDataSourceList = (optionsParams,expandParams) => {
  return new Promise((resolve, reject) => {
    //将传递的入参进行后端元数据接口与前端新增参数进行组合
    const paramData = optionsParams?.widgetData
      ? { ...JSON.parse(optionsParams?.widgetData), ...expandParams }
      : expandParams;
    CustomRequest(
      optionsParams.widgetUrl,
      optionsParams.widgetMethod,
      optionsParams.widgetHeader,
      paramData
    ).then((res) => {
      //dataStructure结构由前后端约定组成，此处注意所有元数据请求的下拉项对象中，一定存在的只有value及label两项，其他都是动态变化的，页面中涉及下拉项的函数根据此两项进行判断
      let dataStructure = JSON.parse(optionsParams.widgetResult);
      const resData = eval("res." + dataStructure.key);
      const optionItems = resData?.length
        ? resData.map((v) => {
            return {
              ...v,
              value: v[dataStructure.id],
              label: v[dataStructure.label],
            };
          })
        : [];
        resolve(optionItems)
    });
  });
};

export {getDataSourceList}
