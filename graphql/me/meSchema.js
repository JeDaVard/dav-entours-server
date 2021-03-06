const { gql } = require('apollo-server-express');

module.exports = gql`
	type MeMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		data: Me
	}
	type Me {
		_id: ID!
		name: String!
		email: String!
		password: String
		photo: String
		createdAt: Date
		speaks: [String]
		role(role: Role): String
		tours: [Tour]
		asGuide: [Tour]
		reviews: [Review]
		conversations: [Conversation]
		conversation(id: ID!, page: Int, limit: Int): Conversation
		saved: [Tour]!
		myTour(slug: String!): Tour
		orders: [Order]!
        pastOrders: [Order]!
		draft: [Tour]!
	}
	input LoginInput {
		email: String!
		password: String!
	}
	input SignUpInput {
		email: String!
		Password: String!
		name: String!
	}
`
