const { gql } = require('apollo-server-express');

module.exports = gql`
	type Review {
		_id: ID!
		review: String!
		rating: Int!
		createdAt: Date
		tour: Tour
		tourAuthor: User
		author: User
	}
`