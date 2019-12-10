const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

module.exports = {
	/*Every time a mutation or query happens:
	parent is the last query we do.*/
	Post: {
		likeCount: (parent) => parent.likes.length,
		commentCount: (parent) => parent.comments.length
	},
	Query: {
		...postsResolvers.Query
	},
	Mutation: {
		...usersResolvers.Mutation,
		...postsResolvers.Mutation,
		...commentsResolvers.Mutation
	}
}