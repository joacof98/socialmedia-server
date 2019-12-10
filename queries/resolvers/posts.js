const Post = require('../../models/Post');
const checkAuth = require('../../util/checkAuth');
const {AuthenticationError, UserInputError} = require('apollo-server');

module.exports = {
	Query: {
		async getPosts() {
			try{
				const posts = await Post.find().sort({createdAt: -1});
				return posts;
			} catch(err){
				console.log(err);
			}
		},
		async getPost(_,{postId}) {
			try{
				const post = await Post.findById(postId);
				if(post) {
					return post;
				} else {
					throw new Error('Post not found');
				}
			} catch(err) {
				throw new Error(err);
			}
		}	
	},
	Mutation: {
		// context access config in index, now can we see if user is authenticated
		async createPost(_, {body}, context) {
			const user = checkAuth(context);

			if(body.trim() === "") {
				throw new Error('Post body must be not empty');
			}

			//if theres no errors
			const newPost = new Post({
				body,
				user: user.id,
				username: user.username,
				createdAt: new Date().toISOString()
			});

			const post = newPost.save();
			return post;
		},
		async deletePost(_, {postId}, context) {
			const user = checkAuth(context);
			try{
				const post = await Post.findById(postId);
				if(user.username === post.username) {
					await post.delete();
					return "Post deleted!";
				} else {
					throw new AuthenticationError('Action not allowed >:(');
				}
			} catch(err) {
				throw new Error(err);
			}
			
		},
		async likePost(_, {postId}, context) {
			const {username} = checkAuth(context);

			const post = await Post.findById(postId);
			if(post) {
				if(post.likes.find(like => like.username === username)) {
					//Post already liked! Unlike it!
					post.likes = post.likes.filter(like => like.username !== username);
				} else {
					//Not like, like it.
					post.likes.push({
						username,
						createdAt: new Date().toISOString()
					});
				}

				await post.save();
				return post;
			} else throw new UserInputError('Post not found');
		}
	}
}
