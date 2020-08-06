const { gql } = require('apollo-server-express');

module.exports = gql`
	enum Difficulty {
		EASY
		MEDIUM
		HARD
	}
	type Start {
		_id: ID!
		date: Date!
		tour: Tour!
		participants: [User]!
		staff: [User]!
		createdAt: Date
	}
	type TourMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		data: Tour
	}
	type Tour {
		_id: String!
		createdAt: Date
		updatedAt: Date
		name: String!
		author: User
		guides: [User]
		reviews(page: Int, limit: Int): ReviewsResponse
		slug: ID!
		hashtags: [String]
		firstMessage: String
		summary: String
		description: String
		imageCover: String
		images: [String]
		thumbs: [String]
		thumbCover: String
		duration: Int
		maxGroupSize: Int
		difficulty(difficulty: Difficulty): String
		price: Int
		priceDiscount: Int
		ratingsAverage: String
		ratingsQuantity: Int
		starts: [Start]
		startLocation: Location
		locations: [Location]
		draft: Boolean
		distance: Float
	}
	type Location {
		_id: ID
		type: String
		coordinates: [Float]
		address: String
		description: String
		day: Int
	}
	input LocationInput {
		_id: ID
		type: String
		coordinates: [Float]
		address: String
		description: String
		day: Int
	}
`
