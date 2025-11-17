// 工具函数库

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式字符串，如 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const seconds = d.getSeconds().toString().padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 计算月龄
 * @param {string} birthDate - 出生日期，格式 'YYYY-MM-DD'
 * @returns {number} 月龄
 */
function calculateAgeInMonths(birthDate) {
  if (!birthDate) return 0
  
  const birth = new Date(birthDate)
  const today = new Date()
  
  const months = (today.getFullYear() - birth.getFullYear()) * 12 + 
                (today.getMonth() - birth.getMonth())
  
  return Math.max(0, months)
}

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean} 是否有效
 */
function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 深拷贝对象
 * @param {object} obj - 要拷贝的对象
 * @returns {object} 深拷贝后的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  
  const cloned = {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 防抖函数
 * @param {function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {function} func - 要执行的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {function} 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 获取距离现在的时间描述
 * @param {Date} date - 日期
 * @returns {string} 时间描述
 */
function getTimeAgo(date) {
  if (!date) return ''
  
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * 检查对象是否为空
 * @param {object} obj - 要检查的对象
 * @returns {boolean} 是否为空
 */
function isEmptyObject(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}

/**
 * 显示成功提示
 * @param {string} message - 提示消息
 */
function showSuccess(message) {
  wx.showToast({
    title: message,
    icon: 'success',
    duration: 2000
  })
}

/**
 * 显示错误提示
 * @param {string} message - 错误消息
 */
function showError(message) {
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 显示加载中
 * @param {string} message - 加载消息
 */
function showLoading(message = '加载中...') {
  wx.showLoading({
    title: message,
    mask: true
  })
}

/**
 * 隐藏加载
 */
function hideLoading() {
  wx.hideLoading()
}

/**
 * 显示确认对话框
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @param {function} confirmCallback - 确认回调
 * @param {function} cancelCallback - 取消回调
 */
function showConfirm(title, content, confirmCallback, cancelCallback) {
  wx.showModal({
    title: title,
    content: content,
    confirmColor: '#FF6B95',
    success: (res) => {
      if (res.confirm) {
        confirmCallback && confirmCallback()
      } else if (res.cancel) {
        cancelCallback && cancelCallback()
      }
    }
  })
}

module.exports = {
  formatDate,
  calculateAgeInMonths,
  validatePhone,
  deepClone,
  debounce,
  throttle,
  getTimeAgo,
  isEmptyObject,
  showSuccess,
  showError,
  showLoading,
  hideLoading,
  showConfirm
}