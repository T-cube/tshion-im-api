'use strict';

module.exports = function(app) {
  const ObjectID = app.get('ObjectID');
  const groupSettingCollection = app.db.collection('chat.group.setting');

  defaultInfo = {
    level: '',
    status: 'normal',
    type: 'normal'
  };

  return class Setting {
    constructor(info) {
      Object.assign(this, info, defaultInfo, {
        create_at: new Date
      });
    }

    static _update(query, data, options) {
      return groupSettingCollection.findOneAndUpdate(query, data, Object.assign({
        returnOriginal: false,
        returnNewDocument: true
      }, options)).then(result => result.value);
    }

    _update() {
      return Setting._update.apply(this, arguments);
    }

    save() {
      let { group } = this;
      let query = { group: ObjectID(group) };
      return this._update(query, { $set: this }, { upsert: true });
    }

    static updateById(_id, data) {
      let query = { _id: ObjectID(_id) };

      return Setting._update(query, { $set: data });
    }
  };
};
