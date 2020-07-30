const { gql } = require('apollo-server-express');

module.exports = gql`
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
		tour: Tour!
		buyer: User!
		start: Start!
		amount: Int!
		invited: [User]!
	}
`;