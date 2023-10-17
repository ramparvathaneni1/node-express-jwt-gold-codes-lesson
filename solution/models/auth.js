class Auth {
  static validate(username, password) {
    // We could validate the userName/password from a database instead
    return (username === 'admin' && password === 'securepassword');
  }
}

module.exports = Auth;
