const formatTime = date => {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}
const formatDate = date => {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  return year + '年' + month + '月' + day + '日';
}
const formatDates = date => {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  return `${[year, month, day].map(formatNumber).join('')}`;
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
const formatISOTime = date => {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds() + 30
  return `${[year, month, day].map(formatNumber).join('-')}T${[hour, minute, second].map(formatNumber).join(':')}Z`;
}
module.exports = {
  formatTime,
  formatDate,
  formatDates,
  formatNumber,
  formatISOTime
}