import Ember from 'ember';

const { RSVP, run } = Ember;


/**
  Manages a web socket connection to a single url. Will re-open connection if
  it closes.

  Accepts an options hash with a `url` for the web socket connection. Also
  accepts an optional `prepareMessage` function that can be used to prepare
  data for sending (possibly encoding), and an optional `onMessage` callback
  for receiving data from the server.

  @class WebSocketConnection
  @param {Object} options
  @constructor
*/
function WebSocketConnection({ url, onMessage, prepareMessage } = {}) {
  this.url = url || `ws:${location.host}`;

  var identity = x => x;
  this.prepareMessage = prepareMessage || identity;
  this.onMessage = onMessage || identity;

  /**
    @property ws
    @type WebSocket|null
    @private
  */
  this.ws = null;

  /**
    @property connectingPromise
    @type Deferred|null
    @private
  */
  this.connectingPromise = null;
}

WebSocketConnection.prototype = {
  /**
    @method send
    @param {Object} msg
  */
  send(msg) {
    var payload = this.prepareMessage(msg);
    return this.getWebSocket().then(socket => socket.send(payload));
  },

  /**
    @private
    @method getSocket
    @return {Promise}
  */
  getWebSocket() {
    var readyState;

    if (this.ws) {
      readyState = this.ws.readyState;
    }

    if (readyState === WebSocket.OPEN) {
      return RSVP.Promise.resolve(this.ws);
    }

    if (readyState === WebSocket.CONNECTING) {
      return this.connectingPromise;
    }

    this.initWebSocket();  // CLOSING, CLOSED, or null

    return this.connectingPromise;
  },

  /**
    @private
    @method initWebSocket
  */
  initWebSocket() {
    this.connectingPromise = new RSVP.Promise((resolve, reject) => {
      var connectingTimeout = setTimeout(() => {
        run(() => reject('Web socket failed by timeout.'));
      }, 4000);

      this.ws = new WebSocket(this.url);

      this.ws.onmessage = msg => run(() => this.onMessage(msg.data));

      this.ws.onopen = () => {
        run(() => {
          clearTimeout(connectingTimeout);
          resolve(this.ws);
        });
      };

      this.ws.onerror = error => {
        run(() => {
          /*
            Errors from a WebSocket [can be cryptic][0]. Sometimes a WebSocket
            passes an `Event` object to the `onerror` handler, which is
            misleading to debug when logged to Sentry. This check throws a more
            explicit error when an `Event` is passed. If we see a lot of these,
            we might try to instrument the `onclose` handler to understand them
            further.

            [0]: http://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description
          */
          if (error instanceof Event) {
            reject(new Error("Could not open WebSocket"));
          } else {
            reject(error);
          }
        });
      };
    });
  }
};

export default WebSocketConnection;
