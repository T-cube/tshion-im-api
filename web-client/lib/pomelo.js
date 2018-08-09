var io = require('socket.io-client');
var Protocol = require('./protocol').Protocol;
var EventEmitter = require('events');
const _config = {
  // hostname: 'im.xuezi.tlifang.cn',
  host: '127.0.0.1',
  port: 3014
};

_config.hostname || (_config.hostname = `${_config.host}:${_config.port}`);

module.exports = class PomeloClient extends EventEmitter {

  constructor(params) {
    super();
    this.socket = null;
    this.id = 1;
    this.callbacks = {};
    this.params = params;
    this.state = 'disconnect'; // disconnect connecting connect

    this._waitingInitedEvents = [];
    this._defineInited();

    this.setMaxListeners(1000);
  }

  /**cl
   * define a property
   * @param {String|Symbol} property
   */
  _defineInited() {
    let _inited;
    Object.defineProperty(this, '_inited', {
      configurable: false,
      get: () => {
        return _inited;
      },
      set: value => {
        if ((!_inited) && value) {
          this._runWaiting();
        }
        _inited = value;
      }
    });
  }

  resetInited() {
    this._inited = false;
  }

  inited() {
    this._inited = true;
  }

  _runWaiting() {
    for (let args of this._waitingInitedEvents) {
      this
        .request
        .apply(this, args);
    }
  }

  /**
   * init pomelo connect
   * @param {Object} params
   * @param {Number|String} params.port
   * @param {String} param.host
   * @param {Function} cb
   */
  init(params, cb) {
    this.params = params;
    params.debug = true;
    let { protocol, host, port, hostname, path } = params;
    if (!protocol)
      protocol = 'ws';
    hostname || (hostname = `${host}:${port}`);
    let url = `${protocol || 'ws'}://${hostname}`;

    console.log('pomelo client init', url);
    const socket = io(url, { transports: ['websocket'] });
    socket.on('connect', () => {
      console.log('[pomeloclient.init] websocket connected!');
      if (cb) {
        cb(socket);
      }
      this.state = 'connect';
    });
    socket.on('reconnect', () => {
      this.state = 'connect';
      console.log('reconnect');
    });
    socket.on('message', (data) => {
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      // console.log(data);
      if (data instanceof Array) {
        this.processMessageBatch(data);
      } else {
        this.processMessage(data);
      }
    });
    socket.on('error', (err) => {
      // console.log('error', err);
      this.emit('error', err);
    });
    socket.on('disconnect', (reason) => {
      if (hostname == _config.hostname)
        return;
      this.emit('disconnect', reason);
    });

    this.socket = socket;
  };

  close() {
    this.socket = null;
  }

  /**
   * disconnect pomelo
   */
  disconnect() {
    this.state = 'disconnect';
    if (this.socket) {
      this
        .socket
        .disconnect();
      this.socket = null;
    }
  };

  /**
   * pomelo rpc request
   * @param {Object} route
   */
  request(route) {
    if (!route || !this.socket) {
      return;
    }

    let msg = {};
    let cb;
    let args = Array
      .prototype
      .slice
      .apply(arguments);

    if (/^pre\.\w/.test(route)) {
      route = route.replace('pre.', '');
    } else if (!this._inited) {
      return this
        ._waitingInitedEvents
        .push(args);
    }

    if (args.length === 2) {
      if (typeof args[1] === 'function') {
        cb = args[1];
      } else if (typeof args[1] === 'object') {
        msg = args[1];
      }
    } else if (args.length === 3) {
      msg = args[1];
      cb = args[2];
    }
    msg = this.filter(msg, route);
    this.id++;
    this.callbacks[this.id] = cb;
    let body = Protocol.encode(this.id, route, msg);
    this
      .socket
      .send(body);
  };

  /**
   * pomelo notify rpc
   * @param {Object} route
   * @param {Object} msg
   */
  notify(route, msg) {
    this.request(route, msg);
  };

  processMessage(msg) {
    if (msg.id) {
      //if have a id then find the callback function with the request
      const cb = this.callbacks[msg.id];
      delete this.callbacks[msg.id];
      if (typeof cb !== 'function') {
        console.log('[pomeloclient.processMessage] cb is not a function for request ' + msg.id);
        return;
      }
      cb(msg.body);
      return;
    }
    // server push message or old format message
    this.processCall(msg);
  }

  processCall(msg) {
    //if no id then it should be a server push message
    const route = msg.route;
    if (route) {
      if (msg.body) {
        let body = msg.body.body;
        if (!body) {
          body = msg.body;
        }
        this.emit(route, body);
      } else {
        this.emit(route, msg);
      }
    } else {
      this.emit(msg.body.route, msg.body);
    }
  }

  processMessageBatch(msgs) {
    for (let i = 0, l = msgs.length; i < l; i++) {
      this.processMessage(msgs[i]);
    }
  }

  filter(msg, route) {
    if (route.indexOf('area.') === 0) {
      msg.areaId = this.areaId;
    }
    msg.timestamp = Date.now();
    return msg;
  }

}
