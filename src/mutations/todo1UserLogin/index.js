const bcrypt = require('bcrypt');
const gql = require('graphql-tag');

const log = require('../../utils/log');

const USER_QUERY = gql`
  query Todo1User($id: ID, $email: String) {
    byEmail: todo1User(email: $email) {
      ...userFields
    }
    byId: todo1User(id: $id) {
      ...userFields
    }
  }

  fragment userFields on Todo1User {
    id
    isBlocked
    passwordHash
    failedAttemptCount
  }
`;

const USER_UPDATE_MUTATION = gql`
  mutation Todo1UserUpdate($data: Todo1UserUpdateInput!) {
    todo1UserUpdate(data: $data) {
      id
    }
  }
`;

module.exports = async (event, ctx) => {
  const { username, password } = event.data.data;
  const onUnsuccess = async (errorMessage, userID) => {
    if (userID) {
      await log(ctx, { userID, event: 'login', success: false });
    }

    return {
      data: {
        success: false,
        error: errorMessage,
      },
    };
  };

  // Check if there is a user with such email or ID
  const response = await ctx.api.gqlRequest(USER_QUERY, {
    id: username,
    email: username,
  });
  const { data } = JSON.parse(response);

  const user = data.byEmail || data.byId;

  if (!user || user.isBlocked) {
    return await onUnsuccess(
      process.env.ERR_INVALID_CREDENTIALS,
      user && user.id,
    );
  }

  // Compare password and password hash
  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    const newFailedAttemptCount = user.failedAttemptCount + 1;
    await ctx.api.gqlRequest(USER_UPDATE_MUTATION, {
      data: {
        id: user.id,
        failedAttemptCount: newFailedAttemptCount,
        isBlocked: newFailedAttemptCount >= 3,
      },
    });

    return await onUnsuccess(process.env.ERR_INVALID_CREDENTIALS, user.id);
  }

  // Reset count of failed attempts to zero on success login
  await ctx.api.gqlRequest(USER_UPDATE_MUTATION, {
    data: {
      id: user.id,
      failedAttemptCount: 0,
    },
  });

  await log(ctx, { userID: user.id, event: 'login', success: true });

  return {
    data: {
      success: true,
    },
  };
};
