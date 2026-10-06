/**
 * GraphQL query for this app's most recent app-feature events, as the Apps service's
 * `POST /apps/feature-events/query` answers it in production and `ffc mock-server` answers it
 * locally. Values are passed as variables, never spliced into the query.
 */
export const appFeatureEventsQuery = `query AppFeatureEvents($appKey: String!, $first: Int!) {
  event_app_features(
    first: $first
    orderBy: { timestamp: DESC }
    filter: { data_appkey: { eq: $appKey }, event_name: { eq: "app-feature" } }
  ) {
    items { event_id timestamp data_feature data_body_data user_id }
  }
}`;

export default appFeatureEventsQuery;
