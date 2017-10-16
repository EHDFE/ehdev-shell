/**
 * @author ryan.bian
 */
import { message } from 'antd';

/**
 * handle fetch's response
 * @param {Response} response
 * @param {Object} config
 * @param {boolean} config.errorNotification - show notification when get failure response
 * @param {boolean} config.successNotification - show notification when success
 * @param {string} config.successMsg - success message's content
 */
export const handleResponse = async (response, config = {
  errorNotification: true,
  successNotification: false,
  successMsg: 'Successful!',
}) => {
  let result;
  try {
    result = await response.json();
  } catch (e) {
    config.errorNotification && message.error(e.toString());
    throw Error(e);
  }
  if (!result.success) {
    config.errorNotification && message.error(
      typeof result.errorMsg === 'object' ?
        JSON.stringify(result.errorMsg) : result.errorMsg
    );
    throw Error(result.errorMsg);
  }
  config.successNotification && message.success(config.successMsg);
  return result.data;
};

/**
 * serialize parameters to search string
 * @param {Object} params
 */
export const serialize = params => new URLSearchParams(Object.entries(params));
