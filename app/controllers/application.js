import Ember from 'ember';

export default Ember.Controller.extend({
  startedVideo: false,

  actions: {
    startVideo() {
      this.set('startedVideo', true);
    },

    restart() {
      this.set('startedVideo', false);
    }
  }
});
