define('utils', function () {
  function isObject(d) {
    return typeof d === 'object' && d.length === undefined;
  }

  /**
   * 
   * @param {*} index 
   */
  function parseData(text) {
    if (text.length) {
      try {
        var obj = JSON.parse(text)
        if (isObject(obj)) {
          return obj;
        }
      } catch { }
    }
    return '';
  }

  /**
   * 1234567 -> 1,234,567
   * @param {*} str
   */
  function commaSeparated(str) {
    return str.split('').reverse().join('')
      .split(/([0-9]{3})/)
      .filter(c => c.length)
      .map(c => c.split('').reverse().join(''))
      .reverse()
      .join(',');
  }

  return {
    isObject: isObject,
    parseData: parseData,
    commaSeparated: commaSeparated
  };
})