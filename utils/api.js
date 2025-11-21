/**
 * 通用API工具类
 * 统一处理loading状态、错误提示和请求封装
 */

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
      const currentApp = getApp()
      const token = currentApp && typeof currentApp.getToken === 'function' ? currentApp.getToken() : null
      
      // 复制一份传入的 header
      const header = {
        'Content-Type': 'application/json',
        ...(options.header || {}) // 确保 options.header 存在
      }
      
      // [核心修复]：只有当 header 中没有 Authorization 时，才放入本地 token
      // 这样就不会覆盖 supabase_config.js 中传入的 Supabase Key
      if (token && !header['Authorization']) {
        header['Authorization'] = `Bearer ${token}`
        console.log('🔍 使用本地 Token 认证')
      } else if (header['Authorization']) {
        // console.log('🔍 使用调用方提供的 Token/Key 认证')
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
              // [优化] 仅当使用的是本地token时才清除登录状态
              // 如果是 Supabase Anon Key 报 401，说明 RLS 策略没配置好，不应该清除本地用户
              if (!options.header?.Authorization) {
                  const currentApp = getApp()
                  if (currentApp && currentApp.clearLoginStatus) {
                    currentApp.clearLoginStatus()
                  }
                  reject(new Error('登录已过期，请重新登录'))
              } else {
                  reject(new Error('Supabase 认证失败(401): 请检查 RLS 策略'))
              }
            } else {
              // 尝试提取更详细的错误信息
              const errorMsg = res.data?.message || res.data?.error_description || res.data?.msg || `请求失败: ${res.statusCode}`
              reject(new Error(errorMsg))
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
        // 不显示 "cancel" 类的错误（用户主动取消）
        if (error.errMsg && error.errMsg.includes('cancel')) return;
        
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
      // 获取 app 实例来拿 token
      const app = getApp()
      const token = app && app.getToken ? app.getToken() : '';
      
      // [修复] 同样应用 Authorization 逻辑
      let header = {};
      // 如果 options 中有 header 且有 Auth，则使用 options 的
      if (options.header && options.header.Authorization) {
          header['Authorization'] = options.header.Authorization;
          // 添加 Supabase 必须的 apikey 如果在 options 中
          if (options.header.apikey) header['apikey'] = options.header.apikey;
      } else if (token) {
          header['Authorization'] = `Bearer ${token}`;
      }

      const result = await new Promise((resolve, reject) => {
        wx.uploadFile({
          url: uploadUrl,
          filePath: filePath,
          name: 'file',
          formData: formData,
          header: header,
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
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