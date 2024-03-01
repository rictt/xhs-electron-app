// // const axios = require('axios').default
// import axios from 'axios'
// import puppeteer from 'puppeteer'

// const baseURL = 'http://127.0.0.1:54345'

// const request = axios.create({
//   baseURL,
//   timeout: 0
// })

// request.interceptors.response.use(
//   (response) => {
//     if (response.status === 200) {
//       return response.data
//     } else {
//       console.log('请求失败，检查网络')
//     }
//   },
//   (error) => {
//     console.error('请求失败了')
//     return Promise.reject(error)
//   }
// )

// /**
//  * @description 打开浏览器并返回wspoint
//  * @returns {Promise<Object>} Promise<any>
//  * @param {Object} data
//  * @param {String} data.id 窗口id
//  * @param {Array} data.args 启动附加参数，数组类型，比如 ["--headless"]
//  * @param {Boolean} data.loadExtensions 是否加载扩展
//  * @param {Boolean} data.extractIp 是否尝试提取IP
//  */
// export function openBrowser(data) {
//   return request({ method: 'post', url: '/browser/open', data })
// }

// /**
//  * @description 关闭浏览器
//  * @param {String} id
//  * @returns {Promise}
//  */
// export function closeBrowser(id) {
//   return request({ method: 'post', url: '/browser/close', data: { id } })
// }

// /**
//  * @description 创建浏览器
//  * @param {Object} data
//  * @returns {Promise}
//  */
// export function createBrowser(data) {
//   return request({ method: 'post', url: '/browser/update', data })
// }
// /**
//  * @description 修改browser信息，只修改传入的配置
//  * @param {Object} data 参考创建配置项
//  * @returns {Promise}
//  */
// export function updatepartial(data) {
//   return request({ method: 'post', url: '/browser/update/partial', data })
// }
// /**
//  * @description 批量删除浏览器
//  * @param {array} ids
//  */
// export function deleteBatchBrowser(ids) {
//   return request({ method: 'post', url: '/browser/delete/ids', data: { ids } })
// }

// /**
//  * @description 删除浏览器
//  * @param {String} id
//  * @returns {Promise}
//  */
// export function deleteBrowser(id) {
//   return request({ method: 'post', url: '/browser/delete', data: { id } })
// }

// /**
//  * @description 获取浏览器详情
//  * @param {String} id
//  * @returns {Promise}
//  * */
// export function getBrowserDetail(id) {
//   return request({ method: 'post', url: '/browser/detail', data: { id } })
// }

// /**
//  * @description 获取浏览器列表
//  * @param {Object} data
//  * @param {Number} data.page // 必传
//  * @param {Number} data.pageSize // 必传
//  * @param {String} data.groupId // 分组ID，非必传
//  * @param {String} data.name // 窗口名称，用于模糊查询，非必传
//  * @param {String} data.sortProperties // 排序参数，默认序号，seq，非必传
//  * @param {String} data.sortDirection // 排序顺序参数，默认desc，可传asc，非必传
//  * @returns {Promise}
//  * */
// export function getBrowserList(data) {
//   return request({ method: 'post', url: '/browser/list', data })
// }
// /**
//  * @description 获取浏览器列表（简洁）
//  */
// export function getBrowserConciseList(data) {
//   return request({ method: 'post', url: '/browser/list/concise', data })
// }
// /**
//  * @description 分组list
//  * @param {Number} page 从0开始
//  * @param {Number} pageSize 例如10
//  * @returns {Promise}
//  * */
// export function getGroupList(page, pageSize) {
//   return request({ method: 'post', url: '/group/list', data: { page, pageSize } })
// }

// /**
//  * @description 添加分组
//  * @param {String} groupName
//  * @param {Number} sortNum
//  * @returns {Promise}
//  * */
// export function addGroup(groupName, sortNum) {
//   return request({ method: 'post', url: '/group/add', data: { groupName, sortNum } })
// }

// /**
//  * @description 修改分组
//  * @param {String} id
//  * @param {String} groupName
//  * @param {Number} sortNum
//  * @returns {Promise}
//  * */
// export function editGroup(id, groupName, sortNum) {
//   return request({ method: 'post', url: '/group/edit', data: { id, groupName, sortNum } })
// }

// /**
//  * @description 删除分组
//  * @param {String} id
//  * @returns {Promise}
//  * */
// export function deleteGroup(id) {
//   return request({ method: 'post', url: '/group/delete', data: { id } })
// }

// /**
//  * @description 分组详情
//  * @param {String} id
//  * */
// export function getGroupDetail(id) {
//   return request({ method: 'post', url: '/group/detail', data: { id } })
// }

// /**
//  * @description 获取指定窗口的pids
//  * @param {Array} ids
//  * @returns
//  */
// export function getPids(ids) {
//   return request({ url: '/browser/pids', method: 'post', data: { ids } })
// }
// /**
//  * @description 获取活着窗口的pids
//  * @param {Array} ids
//  * @returns
//  */
// export function getAlivePids(ids) {
//   return request({ url: '/browser/pids/alive', method: 'post', data: { ids } })
// }
// /**
//  * @description 获取所有活着窗口的pids
//  * @returns
//  */
// export function getAliveBrowsersPids() {
//   return request({ url: '/browser/pids/all', method: 'post' })
// }

// /**
//  * @description 批量修改窗口备注
//  * @param {String} remark
//  * @param {Array} browserIds
//  * @returns
//  */
// export function updateBrowserMemark(remark, browserIds) {
//   return request({ url: '/browser/remark/update', method: 'post', data: { remark, browserIds } })
// }
// /**
//  * @description 批量修改窗口分组
//  * @param {Object} data
//  * @param {Number} data.groupId
//  * @param {Array} data.browserIds
//  */
// export function batchUpdateBrowserGroup(data) {
//   return request({ url: '/browser/group/update', method: 'post', data })
// }
// /**
//  * @description 通过序号批量关闭浏览器
//  *
//  */
// export function closeBrowsersBySeqs(seqs) {
//   return request({ url: '/browser/close/byseqs', method: 'post', data: { seqs } })
// }
// /**
//  * @description 批量修改代理
//  * @param {Object} data
//  * @param {Number} data.proxyMethod //代理类型，2自定义代理，3提取IP
//  * @param {String} data.proxyType // 自定义代理类型
//  */
// export function batchUpdateProxy(data) {
//   return request({ url: '/browser/proxy/update', method: 'post', data })
// }

// export async function connect(res, id) {
//   const wsEndpoint = res.data.ws
//   try {
//     const browser = await puppeteer.connect({
//       browserWSEndpoint: wsEndpoint,
//       defaultViewport: null
//     })
//     console.log('browser: ', browser)
//     // 具体业务代码
//     const pages = await browser.pages()
//     console.log('pages length ===>>> ', pages.length)

//     // const res = await closeBrowser(id)
//     // if (res.success) {
//     //   console.log('关闭浏览器成功===>', id)
//     // }
//   } catch (err) {
//     console.error(err)
//   }
// }

// export function sleep(timeout) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, timeout)
//   })
// }

// // 创建窗口
// export async function createNewBrowser() {
//   try {
//     // 注意，完整参数，请参考文档
//     const res = await createBrowser({
//       groupId: null, // 分组ID，不指定的话，会默认归属到账号的默认API分组
//       name: '', // 窗口名称
//       remark: '111', // 备注
//       proxyMethod: 2, // 代理类型，2自定义代理，3提取IP
//       proxyType: 'noproxy', // 自定义代理类型 ['noproxy', 'http', 'https', 'socks5', 'ssh']
//       host: '', // 代理主机
//       port: '', // 代理端口
//       proxyUserName: '', // 代理账号
//       proxyPassword: '', // 代理密码
//       // 指纹对象，需要随机的值，不填即可，如果需要所有指纹都随机，则只传入 browserFingerPrint: {} 空对象即可
//       browserFingerPrint: {
//         coreVersion: '112', // 内核版本，默认104，可选92
//         ostype: 'PC', // 操作系统平台 PC|Android|IOS
//         os: 'Win32' // 为navigator.platform值 Win32 | Linux i686 | Linux armv7l | MacIntel，当ostype设置为IOS时，设置os为iPhone，ostype为Android时，设置为 Linux i686 || Linux armv7l
//       }
//     })
//     return res.data
//   } catch (err) {
//     console.error(err)
//   }
//   return null
// }
