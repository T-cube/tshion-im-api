'use strict';

module.exports = function(app) {
  return function() {

    let channelService = app.get('channelService');
    if (channelService) {
      // 此处是脏代码
      channelService.constructor.prototype.getChannel = function(name, create) {
        let channel = this.channels[name];
        if (!channel && !!create) {
          channel = this.channels[name] = this.createChannel(name, this);
          channel.loginMap = new Map();
        }
        return channel;
      };
      // console.log(app.get('channelService').constructor);
      // console.info('                     _oo0oo_');
      // console.info('                    088888880');
      // console.info('                    88" . "88');
      // console.info('                    (| -_- |)');
      // console.info('                     0\\ = /0');
      // console.info('                  ___/\'---\'\\___');
      // console.info('                .\' \\\\|     |// \'.');
      // console.info('               / \\\\|||  :  |||// \\');
      // console.info('              /_ ||||| -:- |||||- \\');
      // console.info('             |   | \\\\\\  -  /// |   |');
      // console.info('             | \\_|  \'\'\\---/\'\'  |_/ |');
      // console.info('             \\  .-\\__  \'-\'  __/-.  /');
      // console.info('           ___\'. .\'  /--.--\\  \'. .\'___');
      // console.info('        ."" \'<  \'.___\\_<|>_/___.\' >\'  "".');
      // console.info('       | | : \'-  \\\'.;\'\\ _ /\';.\'/ - \' : | |');
      // console.info('       \\  \\ \'_.   \\_ __\\ /__ _/   .-\' /  /');
      // console.info('   =====\'-.____\'.___ \\_____/___.-\'____.-\'=====');
      // console.info('                     \'=---=\'');
      // console.info('');
      // console.info(' ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
      // console.info('       Buddha bless    : :    Never BUGs');
    }
  };
};
