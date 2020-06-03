const graphql = require('graphql');
const _ = require('lodash');
const User = require('../models/user');
const Tour = require('../models/tour');


const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;


const TourType = new GraphQLObjectType({
    name: 'Tour',
    fields: () => ({
        _id: { type: GraphQLString },
        name: { type: GraphQLString },
        imageCover: { type: GraphQLString },
        author: {
            type: UserType,
            resolve(parentValue, args) {
                return User.findById(parentValue.author)
            }
        }
    })
})

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLString },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        tours: {
            type: new GraphQLList(TourType),
            async resolve(parentValue, args) {
                const user = await User.findById(parentValue._id)
                    .populate({path: 'tours'});
                return user.tours
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { _id: { type: GraphQLString } },
            resolve(parent, args) {
                return User.findOne({ _id: args._id })
            }
        },
        tour: {
            type: TourType,
            args: { _id: { type: GraphQLString } },
            resolve(parent, args) {
                return Tour.findOne({ _id: args._id })
            }
        }
    }
})

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createUser: {
            type: UserType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parentValue, { name, email, password }) {
                return User.create({ name, email, password })
            }
        },
        updateUser: {
            type: UserType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                _id: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parentValue, { name, email, _id }) {
                return User.findOneAndUpdate({ _id }, { name, email }, { new: true })
            }
        },
        deactivateUser: {
            type: UserType,
            args: {
                _id: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parentValue, { _id }) {
                return User.findOneAndUpdate({ _id }, { active: false }, { new: true })
            }
        },
        removeUser: {
            type: UserType,
            args: {
                _id: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parentValue, { _id }) {
                return User.findByIdAndDelete(_id)
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})