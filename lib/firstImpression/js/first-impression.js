/**
 * firstImpression.js
 * Copyright (c) 2012 Rob Flaherty (@robflaherty)
 * Licensed under the MIT and GPL licenses.
 * 
 * The author of Weeble has slightly modified this file.
 */

/**
 * Returns true for a new user and false for a returning one. The default
 * cookie name is "_firstImpression", but a cookie name can be specified as
 * well. When cookie == null, the default cookie is removed, and when
 * days == null, the cookie passed in is removed.
 * @param {string} [cookie] - The cookie's key value
 * @param {number} [days] - How many days until the cookie expires
 * @returns {boolean} Whether or not the user has visited the site before
 */
window.firstImpression = function (cookie, days) {
  /**
   * Plain JS port of jquery.cookie plugin
   * Copyright (c) 2010 Klaus Hartl (stilbuero.de)
   * Dual licensed under the MIT and GPL licenses.
   */

  /* Option defaults */

  if (cookie === undefined) {
    cookie = "_firstImpression";
  }

  if (days === undefined) {
    days = 365;
  }

  const isObject = (obj) => (
    typeof obj === 'object'
    && !Array.isArray(obj)
    && obj !== null
  );

  const cookieMachine = function (key, value, attributes) {
    if (arguments.length > 1 && String(value) !== "[object Object]") {
      if (!attributes || !isObject(attributes)) {
        attributes = {};
      }

      if (value === null || value === undefined) {
        attributes.expires = -1;
      }

      if (typeof attributes.expires === 'number') {
        const expiration = attributes.expires;
        const time = attributes.expires = new Date();
        time.setTime(time.getTime() + expiration * 24 * 60 * 60 * 1000);
      }

      /* Makes cookie accessible from whole domain */
      attributes.path = '/';

      const newCookie = [
        encodeURIComponent(key),
        '=',
        encodeURIComponent(value),
        attributes.expires ? '; expires=' + attributes.expires.toUTCString() : '',
        attributes.path ? '; path=' + attributes.path : '',
        attributes.domain ? '; domain=' + attributes.domain : '',
        attributes.sameSite ? '; SameSite=' + attributes.sameSite : '',
        attributes.secure ? '; secure' : ''
      ].join('')
      return (document.cookie = newCookie);
    }

    const cookieFinder = new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`);
    const result = cookieFinder.exec(document.cookie);
    return result ? decodeURIComponent(result[1]) : null;
  };

  /* Delete cookie if either option is null */

  if (cookie === null || days === null) {
    cookieMachine(cookie ? cookie : "_firstImpression", null);
    return;
  }

  const getCookie = () => cookieMachine(cookie);
  const setCookie = () => cookieMachine(cookie, true, {
    expires: days,
    secure: true,
  });

  const checkUser = function () {
    const status = getCookie();

    /* Set cookie if new user */
    if (!status) {
      setCookie();
    }

    return !status;
  };

  return checkUser();
};