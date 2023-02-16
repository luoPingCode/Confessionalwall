// 云函数入口文件
const cloud = require('wx-server-sdk')
const tencentcloud = require("tencentcloud-sdk-nodejs");//腾讯云API 3.0 SDK

const IaiClient = tencentcloud.iai.v20200303.Client;//人脸识别API

cloud.init({
     env:'lp-baoq8'
})

// 云函数入口函数
exports.main = async (event, context) => {
    var image1 = event.image1
    var image2 = event.image2
//     console.log(image1,image2)
    const clientConfig = {
        credential: {
            secretId: "AKID3wdAYlDkPV3SignTccSholWAfy63nStq",//个人密匙id
            secretKey: "3wtQoSwFLQL6oM6qRqBLJ8nDSVNBoANQ", //个人密匙钥匙
        },
        region: "ap-shanghai",  //请求区域
        profile: {
            httpProfile: {
                endpoint: "iai.tencentcloudapi.com", //接口请求域名
            },
        },
    };
    const client = new IaiClient(clientConfig);
    const params = {  //小程序端上传的两张Base64格式的图片
         "ImageA":image1, 
         "ImageB":image2 
     };
    var r;
     await client.CompareFace(params).then(//异步返回比对结果
        (data) => {
            r = data;
            console.log(data)
        },
        (err) => {
            r = err;
            console.log(err)
        }
    );
    return r  //返回结果
}