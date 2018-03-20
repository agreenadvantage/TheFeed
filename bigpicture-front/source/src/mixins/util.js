module.exports = {
  getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length == 2) {
      var info = parts.pop().split(';').shift();
      return decodeURIComponent(info);
    }

    return false;
  },

  capFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
};
