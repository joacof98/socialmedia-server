const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require('../config');
const {AuthenticationError} = require('apollo-server');

module.exports = (context) => {
	/* context = { ... headers} when a user needs to create post,
	this will check the request of the context, to see if the user have a token
	that means, the user is logged*/
	const authHeader = context.req.headers.authorization;
	if(authHeader) {
		//Store in token, the string after Bearer
		const token = authHeader.split('Bearer ')[1]
		if(token) {
			try {
				const user = jwt.verify(token,SECRET_KEY);
				return user;
			} catch(err) {
				throw new AuthenticationError('Invalid/Expired Token');
			}
		}
		throw new Error('Authentication token must be well formated (Bearer token)');
	}
	throw new Error('Authorization header must be provided');

}