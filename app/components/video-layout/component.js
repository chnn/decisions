import Ember from 'ember';
import WebSocketConnection from 'decisions/utils/websocket-connection';

export default Ember.Component.extend({
  classNames: ['video-layout'],

  wsConnection: null,
  optionAVotes: 0,
  optionBVotes: 0,
  optionCVotes: 0,
  loading: true,

  init() {
    this._super(...arguments);

    let wsConnection = new WebSocketConnection({
      url: `ws://${location.host}/ws`,

      onMessage: data => {
        this.voteReceived(data.value);
      }
    });

    wsConnection
      .getWebSocket()
      .then(() => this.set('loading', false));

    this.set('wsConnection', wsConnection);
  },

  voteReceived(value) {
    if (value === 1 || value === 'a' || value === 'A') {
      this.incrementProperty('optionAVotes');
    } else if (value === 2 || value === 'b' || value === 'B') {
      this.incrementProperty('optionBVotes');
    } else if (value === 3 || value === 'c' || value === 'C') {
      this.incrementProperty('optionCVotes');
    } else {
      throw new Error(`Unknown value '${value}' received.`);
    }
  }
})
