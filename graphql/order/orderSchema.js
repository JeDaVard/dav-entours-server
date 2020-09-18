const { gql } = require('apollo-server-express');

module.exports = gql`
	type OrderMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		data: [Order]!
	}
	
	input TourOrderInput {
		tourId: String!
        startId: String!
		firstMessage: String!
		invitedIds: String
	}
    type PaymentIntention {
		publicKey: String
		clientSecret: String!
    }
	type Order {
		_id: ID!
		createdAt: Date
		tour: Tour!
		buyer: User!
		start: Start!
		amount: Int!
		invited: [User]!
	}
`;