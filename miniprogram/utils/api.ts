import { UserEventStatusResponse, RegistrationParams, RegistrationResult, UserListResponse, SubmitPairsRequest, SubmitPairsResponse } from '../types/types';

export const API_CONFIG = {
  baseUrl: 'https://yesapi.txrczx.cn/',
  appKey: '601403AC619E9330F004A888A5F12DE2',
  sign: 'ae5df133e02ce4cd1dae505e8973ece3'
};

interface UploadResponse {
  ret: number;
  data: {
    err_code: number;
    err_msg: string;
    id: string;
    url: string;
  };
  msg: string;
}

export const api = {
  /**
   * Upload avatar image to server
   * @param openid User's OpenID
   * @param base64Data Base64 encoded image data (with data:image/png;base64, prefix)
   */
  uploadAvatar: (openid: string, base64Data: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.baseUrl + `?s=App.CDN.UploadImgByBase64&file_name=${openid}.png&file_type=image/png&app_key=${API_CONFIG.appKey}&sign=${API_CONFIG.sign}`,
        method: 'POST',
        data: {
          file: base64Data
        },
        success: (res: WechatMiniprogram.RequestSuccessCallbackResult) => {
          const data = res.data as UploadResponse;
          if (data.ret === 200 && data.data.err_code === 0) {
            resolve(data.data.url);
          } else {
            reject(new Error(data.msg || data.data?.err_msg || 'Upload failed'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  /**
   * Get OpenID from WeChat Code
   * @param code WeChat Login Code
   */
  getWeixinInfo: (code: string): Promise<any> => {
    // Sign provided specifically for this endpoint
    // const LOGIN_SIGN = 'E5B920503CE5A4A4AA7CF1B0FA43E148';
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.baseUrl + `?s=App.Weixin.GetWeixinInfoMini&return_data=0&code=${code}&app_key=${API_CONFIG.appKey}&sign=${API_CONFIG.sign}`,
        method: 'GET',
        success: (res: WechatMiniprogram.RequestSuccessCallbackResult) => {
          const data = res.data as any;
          if (data.ret === 200 && data.data.err_code === 0) {
            resolve(data.data);
          } else {
            reject(new Error(data.msg || data.data?.err_msg || 'Login failed'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  /**
   * Submit registration form
   * @param params Registration parameters
   */
  submitRegistration: (params: RegistrationParams): Promise<RegistrationResult> => {
    // const SIGN = '756B7A7D09D46460606895FD2D2818FB';
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.baseUrl + `?s=SVIP.Sxuwenkai357_MyApi.ASubmitRegistration&app_key=${API_CONFIG.appKey}&sign=${API_CONFIG.sign}`,
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: params,
        success: (res: WechatMiniprogram.RequestSuccessCallbackResult) => {
          const data = res.data as any;
          // Check for success (err_code 0) or specific business errors handled by caller
          if (data.ret === 200) {
            if (data.data.err_code === 0) {
              resolve(data.data.data);
            } else {
              // Pass the error structure back so UI can handle 409 etc.
              reject({
                errCode: data.data.err_code,
                errMsg: data.data.err_msg,
                data: data.data.data
              });
            }
          } else {
            reject(new Error(data.msg || 'Request failed'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  /**
   * Get user event status
   * @param openid User's OpenID
   */
  getUserEventStatus: (openid: string): Promise<UserEventStatusResponse> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.baseUrl + `?s=SVIP.Sxuwenkai357_MyApi.AGetUserEventStatus&app_key=${API_CONFIG.appKey}&sign=${API_CONFIG.sign}`,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          openid
        },
        success: (res: WechatMiniprogram.RequestSuccessCallbackResult) => {
          const data = res.data as any;
          if (data.ret === 200 && data.data.err_code === 0) {
            resolve(data.data.data);
          } else {
            // Handle unregistered as a pseudo-error or let the caller check state?
            // The API returns state: UNREGISTERED in data normally, so we resolve it.
            // But if err_code != 0, it's a real error.
            reject(new Error(data.msg || data.data?.err_msg || 'Request failed'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },
  /**
     * Get user list
     * 
     */
  getUserList: (): Promise<UserListResponse> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.baseUrl + `?s=SVIP.Sxuwenkai357_MyApi.AGetUserEventStatus&app_key=${API_CONFIG.appKey}&sign=${API_CONFIG.sign}`,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          // 默认传all
          type: 'all',
        },
        success: (res: WechatMiniprogram.RequestSuccessCallbackResult) => {
          const data = res.data as any;
          if (data.ret === 200 && data.data.err_code === 0) {
            resolve(data.data.data);
          } else {
            // Handle unregistered as a pseudo-error or let the caller check state?
            // The API returns state: UNREGISTERED in data normally, so we resolve it.
            // But if err_code != 0, it's a real error.
            reject(new Error(data.msg || data.data?.err_msg || 'Request failed'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  /**
   * Submit pairs to backend
   * @param params SubmitPairsRequest
   */
  submitPairsToBackend: (params: SubmitPairsRequest): Promise<SubmitPairsResponse> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.baseUrl + `?s=SVIP.Sxuwenkai357_MyApi.ASubmitPairsDirect&return_data=0&app_key=${API_CONFIG.appKey}&sign=${API_CONFIG.sign}`,
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: params,
        success: (res: WechatMiniprogram.RequestSuccessCallbackResult) => {
          const data = res.data as any;
          if (data.ret === 200 && data.data.err_code === 0) {
            resolve(data.data.data);
          } else {
            reject(new Error(data.msg || data.data?.err_msg || 'Submit pairs failed'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  /**
   * Delete registration
   * @param id Registration ID
   */
  deleteRegistration: (id: string): Promise<{ deleted_count: number }> => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: API_CONFIG.baseUrl + `?s=SVIP.Sxuwenkai357_MyApi.ADeleteRegistration&return_data=0&id=${id}&app_key=${API_CONFIG.appKey}&sign=${API_CONFIG.sign}`,
        method: 'GET',
        success: (res: WechatMiniprogram.RequestSuccessCallbackResult) => {
          const data = res.data as any;
          if (data.ret === 200 && data.data.err_code === 0) {
            resolve(data.data.data);
          } else {
            reject(new Error(data.msg || data.data?.err_msg || 'Delete failed'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },
};

