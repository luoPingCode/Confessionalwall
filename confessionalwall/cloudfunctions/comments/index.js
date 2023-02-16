// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
     env: 'lp-baoq8'
});
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
     const wxContext = cloud.getWXContext()
     const openid = wxContext.OPENID;
     const _id = event.commentId;
     const comment = event.comment;
     const del = event.deleteComment;
     const type = event.type;
     const isBuilding = event.isBuilding; //是否楼主
     // console.log(_id, comment)
     const number = event.number;//评论数
     const id = event._id; //墙的id
     try {
          if (type == 'sale') {
               db.collection('saleFriend').doc(id).update({
                    data: {
                         comment_number: number
                    }
               });
          } else {
               db.collection('confessionContents').doc(id).update({
                    data: {
                         commentsNum: number
                    }
               });
          }
          if (isBuilding) { //父评论
               if (del) {
                    return await db.collection('comment').add({
                         data: {
                              id: _id,
                              comment,
                              type: type,
                              childComment: []
                         }
                    });
               } else { //删除
                    return await db.collection('comment').doc(_id).remove();

               }
          } else { // 子评论
               const Id = event.childComId;
               console.log(Id)
               if (del) { //添加
                    return await db.collection('comment').doc(Id).update({
                         data: {
                              childComment: _.push(comment)
                         }
                    });
               } else { //删除
                    return await db.collection('comment').doc(Id).update({
                         data: {
                              childComment: comment
                         }
                    })
               }
          }
     } catch (e) {
          console.log(e)
     }

}