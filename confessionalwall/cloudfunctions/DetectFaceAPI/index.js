// 云函数入口文件
const cloud = require('wx-server-sdk')
const tencentcloud = require("tencentcloud-sdk-nodejs");
const IaiClient = tencentcloud.iai.v20200303.Client;
cloud.init({
     env:"lp-baoq8"
})

// 云函数入口函数
exports.main = async (event, context) => {
     const img = event.img;
     const clientConfig = {
          credential: {
               secretId: "AKID3wdAYlDkPV3SignTccSholWAfy63nStq",
               secretKey: "3wtQoSwFLQL6oM6qRqBLJ8nDSVNBoANQ",
          },
          region: "ap-shanghai",
          profile: {
            httpProfile: {
              endpoint: "iai.tencentcloudapi.com",
            },
          },
        };
        
        const client = new IaiClient(clientConfig);
        const params = {
          "Image":img,
          "NeedFaceAttributes": 1
        };
        var r;
        await client.DetectFace(params).then(
          (data) => {
            r = data;
          },
          (err) => {
            r = err;
          }
        );
        return r
}