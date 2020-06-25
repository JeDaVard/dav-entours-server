const { gql } = require('apollo-server-express');

module.exports = gql`
	enum Difficulty {
		EASY
		MEDIUM
		HARD
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
		participants: [User]
		reviews: [Review]
		slug: ID!
		hashtags: [String]
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
		startDates: [String]
		startLocation: Location
		locations: [Location]
		draft: Boolean
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
