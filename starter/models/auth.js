class Auth {
    static validate(username, password) {
        return (username === 'admin' && password === 'securepassword');
    }
}

module.exports = Auth;
