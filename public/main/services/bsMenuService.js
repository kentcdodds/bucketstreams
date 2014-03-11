angular.module('bs.app').factory('bsMenuService', function() {
  
  var menuItems = [];
  
  function MenuItem(text, icon, onClick, genieIcon, children) {
    this.text = text;
    this.icon = icon;
    this.onClick = onClick;
    this.genieIcon = genieIcon || icon;
    this.children = children;
  }
  
  return {
    menuItems: menuItems,
    MenuItem: MenuItem
  };
});