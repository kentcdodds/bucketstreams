(function() {
  // dumb hack for facebook authentication...
  if (window.location.hash && window.location.hash == '#_=_') {
    window.location.hash = '';
  }
})();
