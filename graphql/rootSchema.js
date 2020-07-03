const { gql } = require('apollo-server-express');

module.exports = gql`
	scalar Date
	interface MutationResponse {
		code: String!
		success: Boolean!
		message: String!
	}
	type Query {
		users: [User]
		user(id: ID!): User
		search: [Tour]
		me: Me
		tours: [Tour]
		tour(id: ID!): Tour
	}
	type Mutation {
		me: MeMutationResponse
		sendMessage(convId: ID!, text: String!): MessageMutationResponse
		removeMessage(id: ID!): MessageMutationResponse
		login(email: String!, password: String!): Me!
		signUp(email: String!, password: String!, name: String!): Me!
		signOut: String
		makeATour(
			name: String!
			difficulty: String!
			maxGroupSize: Int!
		): TourMutationResponse
		tourHeading(
			id: ID!
			name: String!
			difficulty: String!
			maxGroupSize: Int!
			hashtags: String
			price: Int
		): TourMutationResponse
		tourDetails(
			id: ID!
			summary: String
			description: String
		): TourMutationResponse
		tourLocations(id: ID locations: [LocationInput]): TourMutationResponse
		tourGallery(
            id: ID!
            imageCover: String
            images: [String]!
            removeImage: String
        ): TourMutationResponse
		uploadImage(id: ID! fileName: String! contentType: String!): SignedURL
        saveTour(id: ID!): [Tour]!
        removeSavedTour(id: ID!): [Tour]!
	}
    
	
	type SignedURL {
		url: String
		key: String
	}
	
	scalar Upload
	type Subscription {
		messageAdded(convId: ID!): Message
	}
	schema {
		query: Query
		mutation: Mutation
		subscription: Subscription
	}
`