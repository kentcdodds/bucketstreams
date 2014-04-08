angular.module('bs.common.constants').constant('Recommendations', (function() {

  function makeThings(arry, selected) {
    return arry.map(function(a) {
      return { name: a, selected: !!selected };
    });
  }

  var sections = [
    { name: 'Popular', things: makeThings([
      'Sports', 'Music', 'Religion', 'Events'
    ])},
    { name: 'Health & Food', things: makeThings([
      'Healthy Foods', 'Running', 'Yoga', 'Recipes'
    ])},
    { name: 'Tech & Nerd', things: makeThings([
      'Techie stuff', 'Apple', 'Android', 'Microsoft',
      'Treky stuff'
    ])}
  ];
  // add selected items to popular
  sections[0].things = makeThings([
    'Family', 'Friends', 'Current Events'
  ], true).concat(sections[0].things);

  return {
    buckets: sections,
    streams: sections
  }
})());