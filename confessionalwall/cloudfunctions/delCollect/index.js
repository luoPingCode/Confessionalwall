// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env: 'lp-baoq8'
});
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
     const wxContext = cloud.getWXContext()
     const openid = wxContext.OPENID;
     // const isAllDelete = event.isAllDelete;
     var id = event.ids;
     console.log(id)
     try {
          var result;
          for(var i = 0; i<id.length; i++){ //循环数组删除
               result = await db.collection('myCollect').doc(id[i]).remove();
          }
          return result
     } catch (e) {
          console.log(e)
     }
}