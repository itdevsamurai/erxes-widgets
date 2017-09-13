import React from 'react';
import classNames from 'classnames';
import { Launcher } from '../containers';

function App() {
  const widgetClasses = classNames('erxes-widget');

  return (
    <div className={widgetClasses}>

      <Launcher />
    </div>
  );
}

App.propTypes = {
  // isMessengerVisible: PropTypes.bool.isRequired,
  // uiOptions: PropTypes.object,
};

App.defaultProps = {
  uiOptions: null,
};

export default App;
