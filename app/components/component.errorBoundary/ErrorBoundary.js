/**
 * Error Boundary Component
 * @author ryan.bian
 */
import { Component } from 'react';

import styles from './index.less';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({
      hasError: true,
      error,
      info,
    });
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      const { error, info } = this.state;
      return (
        <div className={styles.ErrorBoundary}>
          <div className={styles.ErrorBoundary__overlay} />
          <div className={styles.ErrorBoundary__terminal}>
            <h1>
              Error&nbsp;
              <span className={styles.ErrorBoundary__errorcode} />
            </h1>
            <p className={styles.ErrorBoundary__output}>{error.message}</p>
            <p className={styles.ErrorBoundary__output}>{error.stack}</p>
            <p className={styles.ErrorBoundary__output}>
              {info.componentStack}
            </p>
            <p className={styles.ErrorBoundary__output}>Good luck</p>
          </div>
        </div>
      );
    }
    /* eslint-disable react/prop-types */
    return this.props.children;
  }
}
