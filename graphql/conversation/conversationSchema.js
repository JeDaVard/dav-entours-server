const { gql } = require('apollo-server-express');

module.exports = gql`
	type MessageMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		data: Message
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
`