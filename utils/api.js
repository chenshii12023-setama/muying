/**
 * 通用API工具类
 * 统一处理loading状态、错误提示和请求封装
 */

const app = getApp()

class APIUtils {
  
  // 通用请求方法
  static async request(options = {}) {
    const {
      url,
      method = 'GET',
      data = {},
      showLoading = true,
      loadingText = '加载中...',
      showError = true,
      successText = ''
    } = options

    // 显示加载状态
    if (showLoading) {
      wx.showLoading({
        title: loadingText,
        mask: true
      })
    }

    try {
      // 获取token
      const token = app.getToken()
      const header = {
        'Content-Type': 'application/json',
        ...options.header
      }
      
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }

      // 发起请求
      const result = await new Promise((resolve, reject) => {
        wx.request({
          url: url,
          method: method,
          data: data,
          header: header,
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(res.data)
            } else if (res.statusCode === 401) {
              // token过期，清除登录状态
              app.clearLoginStatus()
              reject(new Error('登录已过期，请重新登录'))
            } else {
              reject(new Error(res.data?.message || `请求失败: ${res.statusCode}`))
            }
          },
          fail: (error) => {
            reject(new Error('网络请求失败，请检查网络连接'))
          }
        })
      })

      // 隐藏加载状态
      if (showLoading) {
        wx.hideLoading()
      }

      // 显示成功提示
      if (successText) {
        wx.showToast({
          title: successText,
          icon: 'success',
          duration: 2000
        })
      }

      return result

    } catch (error) {
      // 隐藏加载状态
      if (showLoading) {
        wx.hideLoading()
      }

      // 显示错误提示
      if (showError) {
        wx.showToast({
          title: error.message || '请求失败',
          icon: 'none',
          duration: 2000
        })
      }

      throw error
    }
  }

  // GET请求
  static async get(url, params = {}, options = {}) {
    const queryString = Object.keys(params).length > 0 
      ? '?' + Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
      : ''
    
    return this.request({
      url: url + queryString,
      method: 'GET',
      ...options
    })
  }

  // POST请求
  static async post(url, data = {}, options = {}) {
    return this.request({
      url: url,
      method: 'POST',
      data: data,
      ...options
    })
  }

  // PUT请求
  static async put(url, data = {}, options = {}) {
    return this.request({
      url: url,
      method: 'PUT',
      data: data,
      ...options
    })
  }

  // DELETE请求
  static async delete(url, options = {}) {
    return this.request({
      url: url,
      method: 'DELETE',
      ...options
    })
  }

  // PATCH请求
  static async patch(url, data = {}, options = {}) {
    return this.request({
      url: url,
      method: 'PATCH',
      data: data,
      ...options
    })
  }

  // 文件上传
  static async uploadFile(filePath, uploadUrl, formData = {}, options = {}) {
    const {
      showLoading = true,
      loadingText = '上传中...',
      showError = true,
      successText = '上传成功'
    } = options

    if (showLoading) {
      wx.showLoading({
        title: loadingText,
        mask: true
      })
    }

    try {
      const token = app.getToken()
      
      const result = await new Promise((resolve, reject) => {
        wx.uploadFile({
          url: uploadUrl,
          filePath: filePath,
          name: 'file',
          formData: formData,
          header: {
            'Authorization': token ? `Bearer ${token}` : ''
          },
          success: (res) => {
            if (res.statusCode === 200) {
              try {
                const data = JSON.parse(res.data)
                resolve(data)
              } catch (e) {
                resolve(res.data)
              }
            } else {
              reject(new Error(`上传失败: ${res.statusCode}`))
            }
          },
          fail: (error) => {
            reject(new Error('文件上传失败'))
          }
        })
      })

      if (showLoading) {
        wx.hideLoading()
      }

      if (successText) {
        wx.showToast({
          title: successText,
          icon: 'success',
          duration: 2000
        })
      }

      return result

    } catch (error) {
      if (showLoading) {
        wx.hideLoading()
      }

      if (showError) {
        wx.showToast({
          title: error.message || '上传失败',
          icon: 'none',
          duration: 2000
        })
      }

      throw error
    }
  }

  // 显示确认对话框
  static showConfirm(title, content, confirmCallback, cancelCallback) {
    wx.showModal({
      title: title,
      content: content,
      confirmColor: '#FF6B95',
      success: (res) => {
        if (res.confirm) {
          confirmCallback && confirmCallback()
        } else {
          cancelCallback && cancelCallback()
        }
      }
    })
  }

  // 格式化错误信息
  static formatError(error) {
    if (typeof error === 'string') {
      return error
    } else if (error && error.message) {
      return error.message
    } else {
      return '操作失败，请重试'
    }
  }
}

module.exports = APIUtils