const { gql } = require('apollo-server-express');

module.exports = gql`	
	type MessageMutationResponse implements MutationResponse {
		code: String!
		success: Boolean!
		message: String!
		data: Message
	}
	type MessagesResponse implements PaginatedResponse {
		hasMore: Boolean
		nextPage: Int
		total: Int
		data: [Message]
	}
	type Conversation {
		_id: ID!
		start: Start
		tour: Tour
		messages(page: Int, limit: Int): MessagesResponse
		lastMessage: Message
		createdAt: Date
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