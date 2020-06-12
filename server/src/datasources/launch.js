/**
 * The RESTDataSource class automatically caches responses from REST resources with no additional setup. We
 * call this feature partial query caching. It enables you to take advantage of the caching logic that the REST
 * API already exposes.
 *
 * * The get method on the RESTDataSource makes an HTTP GET request. Similarly, there are methods built-in to
 * * allow for POST, PUT, PATCH, and DELETE requests.
 *
 * ! If you're using TypeScript, make sure to import the RequestOptions type:
 * import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';
 * ex: willSendRequest(request: RequestOptions)
 *
 *
 */
const { RESTDataSource } = require("apollo-datasource-rest");

class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.spacexdata.com/v2/";
  }

  async getAllLaunches() {
    // Sends GET request to https://api.spacexdata.com/v2/launches
    const response = await this.get("launches");

    return Array.isArray(response)
      ? response.map(launch => this.launchReducer(launch)) // Transform data to match Launch type in schema
      : [];
  }

  async getLaunchById({ launchId }) {
    const response = await this.get("launches", { flight_number: launchId });
    return this.launchReducer(response[0]); // Transform data to match Launch type in schema
  }

  getLaunchesByIds({ launchIds }) {
    return Promise.all(
      launchIds.map(launchId => this.getLaunchById({ launchId })) // Transform data to match Launch type in schema
    );
  }

  /**
   * Using a reducer like this enables the getAllLaunches method to remain concise as our definition of a
   * Launch potentially changes and grows over time. It also helps with testing the LaunchAPI class.
   */
  launchReducer(launch) {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type
      }
    };
  }
}

module.exports = LaunchAPI;
