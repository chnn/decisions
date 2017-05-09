import Ember from 'ember';

const manifest = [
  {
    file: '1.mp4',
    option1File: '3.mp4',
    option2File: '2.mp4'
  },
  {
    file: '3.mp4',
    option1File: '6-5.mp4',
    option2File: '4.mp4'
  },
  {
    file: '4.mp4',
    option1File: '5.mp4',
    option2File: '7.mp4'
  },
  {
    file: '5.mp4',
    option1File: '7.mp4',
    option2File: '10-25.mp4'
  },
  {
    file: '7.mp4',
    option1File: '8-5.mp4',
    option2File: '13-5.mp4'
  },
  {
    file: '6-5.mp4',
    option1File: '13-5.mp4',
    option2File: '8-25.mp4'
  },
  {
    file: '8-5.mp4',
    option1File: '10.mp4',
    option2File: '10.mp4',
    option3File: '10.mp4'
  },
  {
    file: '8-25.mp4',
    option1File: '10.mp4',
    option2File: '10.mp4',
    option3File: '10.mp4'
  },
  {
    file: '10-25.mp4',
    option1File: '11.mp4',
    option2File: '12.mp4'
  },
  {
    file: '13-5.mp4',
    option1File: '8-25.mp4',
    option2File: '14.mp4'
  },
  {
    file: '11.mp4',
    isLastVideo: true,
  },
  {
    file: '12.mp4',
    isLastVideo: true,
  },
  {
    file: '14.mp4',
    option1File: '8-25.mp4',
    option2File: '14.mp4'
  },
  {
    file: '2.mp4',
    option1File: '6.mp4',
    option2File: '3.mp4'
  },
  {
    file: '6.mp4',
    option1File: '8.mp4',
    option2File: '13.mp4'
  },
  {
    file: '8.mp4',
    option1File: '10.mp4',
    option2File: '10-25.mp4',
    option3File: '10.mp4',
    option4File: '10.mp4'
  },
  {
    file: '13.mp4',
    option1File: '8.mp4',
    option2File: '14.mp4'
  },
  {
    file: '10.mp4',
    option1File: '11.mp4',
    option2File: '12.mp4'
  },
];

function maxByKey(obj) {
  let maxVal = -Infinity;
  let maxKey;

  for (let key in obj) {
    if (obj[key] > maxVal) {
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

  option1Votes: 0,
  option2Votes: 0,
  option3Votes: 0,
  option4Votes: 0,
  displayVotes: false,
  currentVideoFile: null,
  countdown: 0,
  ended: false,

  currentVideoURL: Ember.computed('currentVideoData', function() {
    return `videos/${this.get('currentVideoData.file')}`;
  }),

  init() {
    this._super(...arguments);

    let ws = new WebSocket(`ws://${location.host}/ws`);

    ws.onmessage = message => {
      Ember.run(this, 'voteReceived', JSON.parse(message.data).value)
    };

    this.set('currentVideoData', manifest[0]);
  },

  didInsertElement() {
    let el = this.$('video')[0];

    el.addEventListener('ended', () => this.videoEnded(), true); 
  },

  videoEnded() {
    if (this.get('currentVideoData.isLastVideo')) {
      this.set('ended', true);

      return;
    }

    this.setProperties({
      option1Votes: 0,
      option2Votes: 0,
      option3Votes: 0,
      option4Votes: 0,
      displayVotes: true,
      countdown: 15
    });

    Ember.run.later(this, 'countdownTick', 1000);
  },

  countdownTick() {
      this.set('countdown', this.get('countdown') - 1);
      
      if (this.get('countdown') <= 0) {
        this.set('displayVotes', false);
        this.playNextVideo();

        return;
      }

      Ember.run.later(this, 'countdownTick', 1000);
  },

  playNextVideo() {
    let votes = this.getProperties('option1Votes', 'option2Votes', 'option3Votes', 'option4Votes');
    let maxVotesKey = maxByKey(votes);

    let nextVideoFileKey = {
      'option1Votes': 'option1File',
      'option2Votes': 'option2File',
      'option3Votes': 'option3File',
      'option4Votes': 'option4File'
    }[maxVotesKey];

    let nextVideoFile = this.get(`currentVideoData.${nextVideoFileKey}`);
    let nextVideoData = findByKey('file', nextVideoFile, manifest);

    this.set('currentVideoData', nextVideoData);

    this.initCurrentVideo()
  },

  voteReceived(value) {
    if (['1', '2', '3', '4'].includes(value)) {
      this.incrementProperty(`option${value}Votes`);
    } else {
      console.warn(`Unknown value '${value}' received.`);
    }
  }
});
