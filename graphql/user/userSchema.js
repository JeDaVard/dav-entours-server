const { gql } = require('apollo-server-express');

module.exports = gql`
	enum Role {
		USER
		GUIDE
		ADMIN
	}
	type User {
		_id: ID!
		name: String!
		email: String!
		photo: String
		createdAt: Date
		speaks: [String]
		role(role: Role): String
		tours: [Tour]
		reviews(page: Int, limit: Int): ReviewsResponse
		ownReviews(page: Int, limit: Int): ReviewsResponse
		draft: [Tour]
	}
`
