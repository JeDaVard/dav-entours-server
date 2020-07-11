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
`;