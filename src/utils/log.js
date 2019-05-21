const gql = require('graphql-tag');

const LOG_CREATE_MUTATION = gql`
  mutation LogCreate($data: LogCreateInput!) {
    logCreate(data: $data) {
      id
    }
  }
`;

module.exports = (ctx, logData) => {
  return ctx.api.gqlRequest(LOG_CREATE_MUTATION, { data: logData });
};
