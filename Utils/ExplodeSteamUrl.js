isAbsoluteURL = str => {
  return /^[a-z][a-z0-9+.-]*:/.test(str);
};

getAppType = url => {
  return url.toLowerCase().indexOf("/sub/") !== -1 ? "sub" : "app";
};

getAppId = (url, type) => {
  let index = null;
  const segments = url.split("/");
  segments.forEach((segment, i) => {
    if (segment.toLowerCase() === type) {
      index = i + 1;
    }
  });
  return segments[index];
};

const ExplodeSteamUrl = url => {
  const exploded = {
    type: null,
    id: null
  };

  if (!isAbsoluteURL(url)) {
    return false;
  }

  exploded.type = getAppType(url);
  exploded.id = getAppId(url, exploded.type);

  if (isNaN(exploded.id) || !exploded.id) {
    return false;
  }

  return exploded;
};

module.exports = ExplodeSteamUrl;
