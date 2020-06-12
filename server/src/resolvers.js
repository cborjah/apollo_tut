/**
 * Resolver function signature:
 *  fieldName: (parent, args, context, info) => data;
 *
 * parent	- This is the return value of the resolver for this field's parent (the resolver for a parent field always
 * executes before the resolvers for that field's children).
 *
 * args	- This object contains all GraphQL arguments provided for this field.
 *
 * context - This object is shared across all resolvers that execute for a particular operation. Use this to share
 * per-operation state, such as authentication information and access to data sources.
 *
 * info	- This contains information about the execution state of the operation (used only in advanced cases).
 *
 * * Most of the logic they rely on is part of the LaunchAPI and UserAPI data sources.
 * * By keeping resolvers thin as a best practice, you can safely refactor your backing logic while reducing the
 * * likelihood of breaking your API.
 *
 * 1) Create API's
 * 2) Add to server using dataSources key
 * 3) Define resolvers
 * 4) Add resolvers to server
 */

const { paginateResults } = require("./utils");

module.exports = {
  Query: {
    launches: async (_, { pageSize = 20, after }, { dataSources }) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      // we want these in reverse chronological order
      allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches
      });
      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        // if the cursor at the end of the paginated results is the same as the
        // last item in _all_ results, then there are no more results after this
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !==
            allLaunches[allLaunches.length - 1].cursor
          : false
      };
    },
    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
  },
  Mission: {
    // The default size is 'LARGE' if not provided
    missionPatch: (mission, { size } = { size: "LARGE" }) => {
      return size === "SMALL"
        ? mission.missionPatchSmall
        : mission.missionPatchLarge;
    }
  },
  Launch: {
    isBooked: async (launch, _, { dataSources }) =>
      dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id })
  },
  User: {
    trips: async (_, __, { dataSources }) => {
      // get ids of launches by user
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser();
      if (!launchIds.length) return [];
      // look up those launches by their ids
      return (
        dataSources.launchAPI.getLaunchesByIds({
          launchIds
        }) || []
      );
    }
  }
};
