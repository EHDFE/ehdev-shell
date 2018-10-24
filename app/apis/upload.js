/**
 * upload apis
 * @author ryan.bian
 */
import { remoteAPI } from './utils';

const UPLOAD_API = {
  list: {
    async get(
      params = {
        start: 0,
        limit: 100,
      },
    ) {
      try {
        const res = await remoteAPI.upload.getList(params);
        return res;
      } catch (e) {
        throw e;
      }
    },
    // TODO: Notification
    async post(files) {
      try {
        const res = await remoteAPI.upload.updateList(files);
        return res;
      } catch (e) {
        throw e;
      }
      // const res = await fetch(`${LIST_PATH}/`, {
      //   method: 'post',
      //   headers: {
      //     'Content-Type': 'application/x-www-form-urlencoded',
      //   },
      //   body: `files=${JSON.stringify(files)}`,
      // });
      // return handleResponse(res, {
      //   successNotification: true,
      //   successMsg: '上传成功！',
      // });
    },
    async del(ids) {
      try {
        const res = await remoteAPI.upload.deleteList(ids);
        return res;
      } catch (e) {
        throw e;
      }
      // const res = await fetch(`${LIST_PATH}/${ids.join(',')}`, {
      //   method: 'delete',
      // });
      // return handleResponse(res);
    },
  },
  file: {
    async post(file) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await fetch('http://image.tf56.com/fastdfsWeb/upload', {
          method: 'post',
          body: fd,
        });
        const data = await res.json();
        return data;
      } catch (e) {
        throw e;
      }
      // return handleResponse(res);
    },
  },
  // gfile: {
  //   async post(files, config) {
  //     const fd = new FormData();
  //     for (let file of files) {
  //       fd.append('files', file.file);
  //     }

  //     fd.append('config', JSON.stringify(config));
  //     const res = await fetch(GEN_FILE, {
  //       method: 'post',
  //       body: fd,
  //     });

  //     return handleResponse(res,  {
  //       successNotification: true,
  //       successMsg: '图片处理成功！',
  //     });
  //   }
  // }
};

export default UPLOAD_API;
