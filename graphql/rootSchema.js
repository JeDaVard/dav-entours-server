const { gql } = require('apollo-server-express');

module.exports = gql`    
	scalar Date
	interface MutationResponse {
		code: String!
		success: Boolean!
		message: String!
	}
	interface PaginatedResponse {
		hasMore: Boolean
		nextPage: Int
		total: Int
	}
    type SearchPaginatedResponse implements PaginatedResponse{
		hasMore: Boolean
		hasPrevPage: Boolean
		nextPage: Int
		prevPage: Int
		total: Int
        page: Int
		limit: Int
		pagingCounter: Int
		totalPages: Int
        data: [Tour]!
    }
	type AuthMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		data: Me
		isOperational: Boolean
	}
	type ProfileMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		data: Me
		isOperational: Boolean
	}
	type InviteMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		data: User
	}
	input SearchInput {
		coordinates: String!
		dates: String!
		participants: Int!
		maxGroupSize: Int!
        page: Int
        limit: Int
	}
	type Query {
		users: [User]
		user(id: ID!): User
		me: Me
		tours: [Tour]
		tour(id: ID!): Tour
        search(initInput: SearchInput): SearchPaginatedResponse
        recommended: [Tour]!
	}
	type Mutation {
		me: MeMutationResponse
		sendMessage(convId: ID!, text: String! isImage:Boolean): MessageMutationResponse
		removeMessage(id: ID! key: String): MessageMutationResponse
		login(email: String!, password: String!): AuthMutationResponse!
		signUp(email: String!, password: String!, name: String!): AuthMutationResponse!
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
			firstMessage: String
			summary: String
			description: String
			guides: [String]!
		): TourMutationResponse
		manageStart(id: ID! date: Date startId: String ): TourMutationResponse
		tourLocations(id: ID locations: [LocationInput]): TourMutationResponse
		tourGallery(
            id: ID!
            imageCover: String
            images: [String]!
            removeImage: String
        ): TourMutationResponse
		inviteUser(email: String!): InviteMutationResponse!
		uploadImage(
			id: ID!
			fileName: String!
			contentType: String!
			genre: String!
		): SignedURL
        saveTour(id: ID!): [Tour]!
		updateProfile(photo: String): ProfileMutationResponse!
        removeSavedTour(id: ID!): [Tour]!
		cancelOrder(id: ID!): OrderMutationResponse!
		intentTourPayment(tourOrderInput: TourOrderInput!): PaymentIntention!
		deactivate: String
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