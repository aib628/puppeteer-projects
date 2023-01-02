/**
 * the namevalue_cookies pattern as follow:
 * {'url':'',namevalues:'aa=123; bb=234'}
 * @param {*} namevalue_cookies 
 */
function namevalues_to_cookies(namevalue_cookies) {
  let cookies = [];
  for (namevalue of namevalue_cookies['namevalues'].split('; ')) {
    let kv = namevalue.split("=");
    cookies.push({
      'url': namevalue_cookies['url'],
      'name': kv[0],
      'value': kv[1]
    });
  }

  return cookies;
}

// cookies is an array of cookie instance with key : url,name,value or domain,name,value,path,expires
exports.set_cookies = async function (page, cookies) {
  await page.setRequestInterception(true);

  // support array cookies and namevalues cookie.
  if (cookies && Array.prototype.isPrototypeOf(cookies)) {
    await page.setCookie(...cookies);
  } else if (cookies && cookies['url'] && cookies['namevalues']) {
    await page.setCookie(...namevalues_to_cookies(cookies));
  } else if (cookies) {
    console.warn("Warning: invalid cookies format, cookie array or namevalues cookie supported.");
  }

  page.on('request', (request) => {
    request.continue();
  });
}

// Random delay for max milliseconds.
exports.random_delay = async function (max_milliseconds) {
  await new Promise(function (resolve) {
    setTimeout(resolve, Math.ceil(Math.random() * max_milliseconds));
  });
}

// check whether array type
exports.is_array = function (target) {
  return Array.prototype.isPrototypeOf(target);
}