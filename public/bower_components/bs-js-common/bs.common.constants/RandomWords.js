angular.module('bs.common.constants').constant('RandomWords', (function() {
  var words = {
    success: [
      'Awesome!',
      'Sweet!',
      'Terrific!',
      'Cool!',
      'Great!',
      'Tada!',
      'Fantastic!'
    ],
    error: [
      'Uh oh!',
      'Whoops!',
      'Er...',
      'Hmm...',
      'Ouch!',
      'Sorry...'
    ],
    warning: [
      'Watch out!',
      'Heads up!',
      'Whoa!',
      'Hey there!',
      'Hey!'
    ],
    info: [
      'FYI,',
      'Hey,',
      'OK,'
    ]
  };

  function getRandomWords(type) {
    return words[type][Math.floor(Math.random() * words[type].length)];
  }

  var RandomWords = {
    getRandomWords: getRandomWords
  };

  _.each(words, function(val, key) {
    RandomWords[key] = function() {
      return getRandomWords(key);
    };
  });

  return RandomWords;
})());