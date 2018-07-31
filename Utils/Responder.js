const stdSuccess = (results, r, status = 200) => {
  r.status(status).jsonp(results);
};

const stdError = (error, r, status = 404) => {
  r.status(status).jsonp({ error });
};

module.exports = {
  stdSuccess,
  stdError
};
