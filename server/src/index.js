const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const { createStore } = require("./utils");
const resolvers = require("./resolvers");
const isEmail = require("isemail");

const LaunchAPI = require("./datasources/launch");
const UserAPI = require("./datasources/user");

const store = createStore();

const server = new ApolloServer({
  /**
   * The context function is called once for every GraphQL operation that clients send to the
   * server. The return value of this function becomes the context argument that's passed to every
   * resolver that runs as part of that operation.
   *
   * By creating this context object at the beginning of each operation's execution, all of our resolvers can
   * access the details for the logged-in user and perform actions specifically for that user.
   */
  context: async ({ req }) => {
    // Obtain the value of the Authorization header (if any) included in the incoming request.
    const auth = (req.headers && req.headers.authorization) || "";

    // Decode the value of the Authorization header.
    const email = Buffer.from(auth, "base64").toString("ascii");

    // If the decoded value resembles an email address, obtain user details for that email address from the
    // database and return an object that includes those details in the user field.
    if (!isEmail.validate(email)) return { user: null };

    // find a user by their email
    const users = await store.users.findOrCreate({ where: { email } });
    const user = (users && users[0]) || null;
    return { user: { ...user.dataValues } };
  },
  typeDefs,
  resolvers,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  })
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
