import Ember from 'ember';

const manifest = [
  {
    file: 'a.mp4',
    optionAFile: 'b.mp4',
    optionBFile: 'c.mp4',
    optionAText: 'Meow!',
    optionBText: 'Rawr!',
    question: 'This is the question for a?'
  },
  {
    file: 'b.mp4',
  },
  {
    file: 'c.mp4',
  }
];

function maxByKey(obj) {
  let maxKey;
  let maxVal;

  for (let key in obj) {
    if (Ember.isEmpty(maxVal) || obj[key] < maxVal) {
      maxKey = key;
      maxVal = obj[key];
    } 
  }

  return maxKey;
}

function findByKey(key, keyValue, coll) {
  for (let obj of coll) {
    if (obj[key] === keyValue) {
      return obj;
    }
  }
}

export default Ember.Component.extend({
  classNames: ['video-layout'],

  optionAVotes: 0,
  optionBVotes: 0,
  optionCVotes: 0,
  currentVideoFile: null,
  displayQuestion: false,

  currentVideoURL: Ember.computed('currentVideoData', function() {
    return `videos/${this.get('currentVideoData.file')}`;
  }),

  init() {
    this._super(...arguments);

    let ws = new WebSocket(`ws://${location.host}/ws`);

    ws.onmessage = message => this.voteReceived(JSON.parse(message.data).value);

    this.set('currentVideoData', manifest[0]);
  },

  didInsertElement() {
    this.initCurrentVideo();
  },

  initCurrentVideo() {
    let el = this.$('video')[0];

    el.addEventListener('ended', () => this.videoEnded(), true); 
  },

  videoEnded() {
    this.set('displayQuestion', true);

    setTimeout(() => {
      this.playNextVideo();
    }, 1000 * 15)
  },

  playNextVideo() {
    let votes = this.getProperties('optionAVotes', 'optionBVotes', 'optionCVotes');
    let maxVotesKey = maxByKey(votes);

    let nextVideoFileKey = {
      'optionAVotes': 'optionAFile',
      'optionBVotes': 'optionBFile',
      'optionCVotes': 'optionCFile'
    }[maxVotesKey];

    let nextVideoFile = this.get(`currentVideoData.${nextVideoFileKey}`);
    let nextVideoData = findByKey('file', nextVideoFile, manifest);

    this.setProperties({
      displayQuestion: false,
      currentVideoData: nextVideoData,
      optionAVotes: 0,
      optionBVotes: 0,
      optionCVotes: 0
    });

    this.initCurrentVideo()
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
});
