const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Tour {
        _id: ID!
        createdAt: String
        updatedAt: String
        name: String!
        author: User
        guides: [User]
        participants: [User]
        reivews: [Review]
        slug: String!
        hashtags: [String]
        summary: String
        description: String
		imageCover: String
        images: [String]
        duration: Int
		maxGroupSize: Int
		difficulty: String
        price: Int
		priceDiscount: Int
		ratingsAverage: Int
		ratingsQuantity: Int
		startDates: [String]
		startLocation: Location
        locations: [Location]
	}
	type Location {
		_id: ID!
        type: String
		coordinates: [Float]
		address: String
		description: String
        day: Int
	}
    type Review {
        _id: ID!
        review: String!
        rating: Int!
		createdAt: String
        tour: Tour
		author: User
    }
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        photo: String
        joined: String
        speaks: String
        tours: [Tour]
        reivews: [Review]
        conversations: [Conversation]
    }
    type Conversation {
        _id: ID!
        messages: [Message]
        author: User
        participants: [User]
    }
    type Message {
        _id: ID!
        text: String!
        createdAt: String
        sender: String!
        conversation: Conversation
    }
    type Query {
        users: [User]
        tours: [Tour]
        reviews: [Review]
        messages: [Message]
        conversations: [Conversation]
    }
`;

const resolvers = {
    Query: {
        messages: () => ({messages: 'messages'})
    }
};

module.exports = {
    typeDefs,
    resolvers
}