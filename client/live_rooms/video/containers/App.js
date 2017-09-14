import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { connection } from '../connection';
import { App as DumbApp } from '../components';

const propTypes = {
  data: PropTypes.shape({
    getLiveRoom: PropTypes.shape({
      status: PropTypes.string,
      participantOne: PropTypes.string,
      participantTwo: PropTypes.string,
      token: PropTypes.string,
      identity: PropTypes.string,
    }),
    loading: PropTypes.bool,
  }),
};

const App = (props) => {
  const extendedProps = {
    ...props,
    liveRoom: props.data.getLiveRoom,
  };

  if (props.data.loading) {
    return null;
  }

  console.log('connection2: ', connection);
  return <DumbApp {...extendedProps} />;
};

App.propTypes = propTypes;

const AppWithData = graphql(
  gql`
    query getLiveRoom($brandCode: String!) {
      getLiveRoom(brandCode: $brandCode) {
        status
        participantOne
        participantTwo
        identity
        token
      }
    }
  `,
  {
    options: (ownProps) => ({
      fetchPolicy: 'network-only',
      variables: {
        brandCode: connection.setting.brandCode,
      },
    }),
  },
)(App);

export default connect()(AppWithData);
