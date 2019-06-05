## Overview
This 8base project adds a custom mutation `todo1UserLogin` to the 8base GraphQL API. Service description is in `8base.yml` file ([see docs](https://docs.8base.com/docs/8baseyml)). Implementation is in `src/mutations/todo1UserLogin/index.js`. Read more on custom resolvers - functions that are exposed in the GraphQL API - [here](https://docs.8base.com/docs/resolvers).

## How to deploy
1. Install 8base CLI (requires NPM): `$ npm install -g 8base`
2. `$ cd custom-authentication-service`
3. `$ npm install`
4. `$ 8base login`
5. `$ 8base deploy`

## Sample API query:
```graphql
mutation {
  todo1UserLogin(data: {
    username: "user01@test.com"
    password: "qwerty"
  }) {
    success
    error
  }
}
```
