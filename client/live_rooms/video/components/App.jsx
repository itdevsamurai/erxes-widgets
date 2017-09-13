import React from 'react';
import classNames from 'classnames';

function App() {
  const widgetClasses = classNames('erxes-widget');

  return (
    <div className={widgetClasses}>
      <div>
        Live room test
      </div>
    </div>
  );
}

App.propTypes = {
  // isMessengerVisible: PropTypes.bool.isRequired,
  // uiOptions: PropTypes.object,
};

App.defaultProps = {
};

export default App;
