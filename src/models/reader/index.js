// const http = require('http');
const https = require('https');
// const fastXmlParser = require('fast-xml-parser');
const context = require('../../context');

// const parserOptions = {
//   ignoreAttributes: true,
//   ignoreNameSpace: true,
//   parseNodeValue: true,
//   parseAttributeValue: false,
//   trimValues: true,
// };

const db = context.getDataBase('feeds');
const updateOptions = {
  returnUpdatedDocs: true,
};

const SEARCH_ENGINE_API = 'https://cloud.feedly.com/v3/search/feeds';
const FEED_ENTRIES_API = 'https://cloud.feedly.com/v3/entries';
const STREAM_CONTENT_API = 'https://cloud.feedly.com/v3/streams/contents';

exports.search = query => {
  return new Promise((resolve, reject) => {
    const searchUrl = new URL(`${SEARCH_ENGINE_API}?query=${query}`);
    const req = https.request(searchUrl, res => {
      if (res.statusCode !== 200) return reject(res.statusMessage);
      const bufAry = [];
      let length = 0;
      res.on('data', chunk => {
        bufAry.push(chunk);
        length += chunk.length;
      });
      res.on('end', () => {
        const buf = Buffer.concat(bufAry, length);
        const string = buf.toString();
        try {
          const json = JSON.parse(string);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', e => {
      reject(e);
    });
    req.end();
  });
};

exports.getFeeds = () => {
  return new Promise((resolve, reject) => {
    db.find({}, (err, docs) => {
      if (err) {
        return reject(err);
      }
      resolve(docs);
    });
  });
};

exports.createCategory = category => {
  return new Promise((resolve, reject) => {
    db.find({ title: category }, (err, docs) => {
      if (Array.isArray(docs) && docs.length === 0) {
        db.insert({ title: category, outline: [] }, (err, newDoc) => {
          if (err) {
            return reject(err);
          }
          resolve(newDoc);
        });
      } else {
        reject(new Error('当前分类已经存在!'));
      }
    });
  });
};

exports.updateCategory = (pid, newCategory) => {
  return new Promise((resolve, reject) => {
    const update = {
      $set: {
        title: newCategory,
      },
    };
    db.update({ _id: pid }, update, updateOptions, (err, numAffected, affectedDocuments) => {
      if (err) {
        return reject(err);
      }
      resolve(affectedDocuments);
    });
  });
};

exports.removeCategory = pid => {
  return new Promise((resolve, reject) => {
    db.remove({ _id: pid }, {}, err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

exports.addFeed = (pid, feedData) => {
  return new Promise((resolve, reject) => {
    const query = { _id: pid };
    const update = {
      $addToSet: {
        outline: feedData,
      },
    };
    db.update(query, update, updateOptions, (err, numAffected, affectedDocuments) => {
      if (err) {
        return reject(err);
      }
      resolve(affectedDocuments);
    });
  });
};

exports.removeFeed = (pid, id) => {
  return new Promise((resolve, reject) => {
    const query = { _id: pid };
    const update = {
      $pull: {
        outline: {
          _id: id,
        },
      },
    };
    db.update(query, update, updateOptions, (err, numAffected, affectedDocuments) => {
      if (err) {
        return reject(err);
      }
      resolve(affectedDocuments);
    });
  });
};

exports.loadFeedStream = (feedId, options) => {
  return new Promise((resolve, reject) => {
    const usp = new URLSearchParams(Object.assign(options, {
      streamId: feedId,
    }));
    const parsedUrl = new URL(`${STREAM_CONTENT_API}?${usp.toString()}`);
    const req = https.request(parsedUrl, res => {
      if (res.statusCode !== 200) return reject(res.statusMessage);
      const bufAry = [];
      let length = 0;
      res.on('data', chunk => {
        bufAry.push(chunk);
        length += chunk.length;
      });
      res.on('end', () => {
        const buf = Buffer.concat(bufAry, length);
        const string = buf.toString();
        try {
          const json = JSON.parse(string);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', e => {
      reject(e);
    });
    req.end();
  });
};
