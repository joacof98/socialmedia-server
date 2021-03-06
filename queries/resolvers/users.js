const User = require('../../models/User');
const {SECRET_KEY} = require('../../config');
const {UserInputError} = require('apollo-server');

const {validateRegisterInput} = require('../../util/validators');
const {validateLoginInput} = require('../../util/validators');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function generateToken(user) {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username
		},
		SECRET_KEY,
		{expiresIn: '1h'}
	);
}

module.exports = {
	Mutation: {
		async login(_,{username, password}) {
			//Err of sintaxis
			const {errors, valid} = validateLoginInput(username, password);
			if(!valid){
				throw new UserInputError('Errors',{errors});
			}

			const user = await User.findOne({username});
			//Err of db
			if(!user) {
				errors.general = 'User not found';
				throw new UserInputError('User not found', {errors});
			}
			//Compare if input pass match with db pass
			const match = await bcrypt.compare(password,user.password);
			if(!match) {
				errors.general = 'Wrong credentials';
				throw new UserInputError('Wrong credentials', {errors});
			}

			const token = generateToken(user);

			return {
				...user._doc,
				id: user._id,
				token
			}
		},
		async register(
			_,
			{
				registerInput: {username, email, password, confirmPassword}
			}
		) {
			//Validate user data
			const {valid, errors} = validateRegisterInput(username, email, password, confirmPassword);
			if(!valid){
				throw new UserInputError('Errors',{errors});
			}
			//Check if user exists
			const user = await User.findOne({username});
			if(user) {
				throw new UserInputError('Username taken',{
					errors: {
						username: 'This username is already taken'
					}
				});
			}
			//Encrypt pass, create token for user
			password = await bcrypt.hash(password,12);

			const newUser = new User({
				email,
				username,
				password,
				createdAt: new Date().toISOString()
			});

			const res = await newUser.save();
			const token = generateToken(res);

			return {
				...res._doc,
				id: res._id,
				token
			}
		}
	}
}