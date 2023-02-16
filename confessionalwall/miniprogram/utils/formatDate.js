// 选中时间格式化
function formatTime(date) {
     date = new Date(date);
     return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
export {
     formatTime
}