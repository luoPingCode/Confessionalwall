// 云函数入口文件
const cloud = require('wx-server-sdk')
const tencentcloud = require("tencentcloud-sdk-nodejs");
const ImsClient = tencentcloud.ims.v20201229.Client;

cloud.init({
     env: 'lp-baoq8'
})

// 云函数入口函数
exports.main = async (event, context) => {
     console.log(event.img)
     let img = event.img;
     const clientConfig = {
          credential: {  //个人密匙参数
               secretId: "AKID3wdAYlDkPV3SignTccSholWAfy63nStq",
               secretKey: "3wtQoSwFLQL6oM6qRqBLJ8nDSVNBoANQ",
          },
          region: "ap-shanghai", //接口地区
          profile: {
               httpProfile: {
                    endpoint: "ims.tencentcloudapi.com",
               },
          },
     };

     const client = new ImsClient(clientConfig);
     const params = {
          "FileContent": img,
     };
     var r;
     await client.ImageModeration(params).then(
          (data) => {
               r = data;
          },
          (err) => {
               r = err;
          }
     );
     return r;
}