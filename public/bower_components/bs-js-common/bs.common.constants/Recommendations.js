angular.module('bs.common.constants').constant('Recommendations', (function() {

  function makeThings(arry) {
    return arry.map(function(a) {
      return { name: a, selected: false };
    });
  }

  function getBucketSections() {
    return [
      { name: 'Popular', things: makeThings([
        'Friends',
        'Family',
        'Fun',
        'thing1',
        'thing2',
        'thing3',
        'thing1',
        'thing2',
        'thing3',
        'thing1',
        'thing2',
        'thing3',
        'thing1',
        'thing2',
        'thing3'
      ])},
      { name: 'Other', things: makeThings([
        'thing1',
        'thing2',
        'thing3',
        'thing1',
        'thing2',
        'thing3',
        'thing1',
        'thing2',
        'thing3',
        'thing1',
        'thing2',
        'thing3',
        'thing1',
        'thing2',
        'thing3'
      ])}
    ];
  }

  function getStreamSections() {
    return [
      { name: 'Popular', things: makeThings([
        'thing1',
        'thing2',
        'thing3'
      ])}
    ];
  }

  return {
    buckets: getBucketSections(),
    streams: getStreamSections()
  }
})());