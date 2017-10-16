/**
 * Upload List Model
 * @author ryan.bian
 */

class ListAPI {
  /**
   * fetch file list by limit & start
   * limit: Number,
   * start: Number
   */
  async get(ctx) {
    const { limit, start } = Object.assign({
      limit: 100,
      start: 0,
    }, ctx.query);
    await new Promise(resolve => {
      ctx.app.db.upload.find({})
        .skip(start)
        .limit(limit)
        .exec((err, docs) => {
          if (err) {
            ctx.body = ctx.app.responser(err, false);
          } else {
            ctx.body = ctx.app.responser({
              content: docs,
              limit,
              start,
            }, true);
          }
          resolve();
        });
    });
  }
  // async post() {
  // }
  /**
   * insert files to the list
   * files: Array<Object>
   */
  async put(ctx) {
    const { files } = ctx.request.body;
    try {
      const insertData = JSON.parse(files);
      await new Promise(resolve => {
        ctx.app.db.upload.insert(
          Array.isArray(insertData) ? insertData : [insertData],
          (err, newDocs) => {
            if (err) {
              ctx.body = ctx.app.responser(err, false);
            } else {
              ctx.body = ctx.app.responser(newDocs, true);
            }
            resolve();
          }
        );
      });
    } catch (e) {
      ctx.body = ctx.app.responser(e.message, false);
    }
  }
  /**
   * delete files by id
   * ids: Array<String>
   */
  async del(ctx) {
    const ids = ctx.query.ids ? ctx.query.ids.split(',') : [];
    await new Promise(resolve => {
      ctx.app.db.upload.remove(
        {
          _id: { $in: ids }
        },
        { multi: true },
        (err, numRemoved) => {
          if (err) {
            ctx.body = ctx.app.responser(err, false);
          } else {
            ctx.body = ctx.app.responser(numRemoved, true);
          }
          resolve();
        }
      );
    });
  }
}

module.exports = ListAPI;
