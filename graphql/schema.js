const { gql } = require('apollo-server-express');

module.exports = gql`
    scalar Date
    enum Role {
        USER
        GUIDE
        ADMIN
    }
    enum Difficulty {
        EASY
        MEDIUM
        HARD
    }
    interface MutationResponse {
        code: String!
        success: Boolean!
        message: String!
    }
    type TourMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        data: Tour
    }
    type MeMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        data: Me
    }
    type MessageMutationResponse implements MutationResponse {
        code: String!
        success: Boolean!
        message: String!
        data: Message
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
    type Review {
        _id: ID!
        review: String!
        rating: Int!
        createdAt: Date
        tour: Tour
        tourAuthor: User
        author: User
    }
    type User {
        _id: ID!
        name: String!
        email: String!
        photo: String
        createdAt: Date
        speaks: [String]
        role(role: Role): String
        tours: [Tour]
        reviews: [Review]
        draft: [Tour]
        #remove the following
        conversations: [Conversation]
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
        saved: [Tour]
        myTour(slug: String!): Tour
        draft: [Tour]
    }
    type MessagesResponse {
        hasMore: Boolean
        nextPage: Int
        total: Int
        messages: [Message]
    }
    type Conversation {
        _id: ID!
        createdAt: Date
        messages(page: Int, limit: Int): MessagesResponse
        tour: Tour
        guides: [User]
        participants: [User]
        lastMessage: Message
    }
    type Message {
        _id: ID!
        text: String!
        createdAt: Date
        sender: User!
        isImage: Boolean
        conversation: Conversation!
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

    type AuthData {
        token: String!
        expires: String!
        user: User
    }

    type Query {
        users: [User]
        user(id: ID!): User
        search: [Tour]
        me: Me
        tours: [Tour]
        tour(id: ID!): Tour
    }
    
    input LocationInput {
		_id: ID
		type: String
		coordinates: [Float]
		address: String
		description: String
		day: Int
    }

    type Mutation {
        me: MeMutationResponse
        sendMessage(convId: ID!, text: String!): MessageMutationResponse
        removeMessage(id: ID!): MessageMutationResponse
        login(email: String!, password: String!): AuthData
        signUp(email: String!, password: String!, name: String!): AuthData
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
		tourGallery(id: ID file: Upload!): TourMutationResponse
        addTour: Tour
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
`;
