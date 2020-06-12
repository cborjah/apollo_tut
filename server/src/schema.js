const { gql } = require("apollo-server");

/**
 * A field's type can be either an object type OR a scalar type.
 * A scalar type is a primitive (like ID, String, Boolean, or Int) that resolves to a single value. In addition to
 * GraphQL's built-in scalar types, you can define custom scalar types.
 *
 * * An exclamation point (!) after a declared field's type means "this field's value can never be null."
 *
 * * It's good practice for a mutation to return whatever objects it modifies so the requesting client can update its
 * * cache and UI without needing to make a followup query.
 */

const typeDefs = gql`
  type Launch {
    id: ID!
    site: String
    mission: Mission
    rocket: Rocket
    isBooked: Boolean!
  }

  type Rocket {
    id: ID!
    name: String
    type: String
  }

  type User {
    id: ID!
    email: String!
    trips: [Launch]!
  }

  type Mission {
    name: String
    missionPatch(size: PatchSize): String
  }

  enum PatchSize {
    SMALL
    LARGE
  }

  type Query {
    launches: [Launch]!
    launch(id: ID!): Launch
    me: User
  }

  type Mutation {
    bookTrips(launchIds: [ID]!): TripUpdateResponse!
    cancelTrip(launchId: ID!): TripUpdateResponse!
    login(email: String): String # login token
  }

  type TripUpdateResponse {
    success: Boolean!
    message: String
    launches: [Launch]
  }
`;

module.exports = typeDefs;
