import gql from 'graphql-tag';
import client from '../../apollo-client';

export const connect = (brandCode) =>
  client.query({
    query: gql`
      query getLiveRoom($brandCode: String!) {
        getLiveRoom(brandCode: $brandCode) {
          status
        }
      }`,

    variables: {
      brandCode,
    },
  });
