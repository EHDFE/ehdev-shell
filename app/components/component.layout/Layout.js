/**
 * Layout Component
 * @author ryan.bian
 */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Layout, Icon } from 'antd';
import { platform } from 'os';
// import StackBlur from 'stackblur-canvas';
// import tinycolor from 'tinycolor2';
// import throttle from 'lodash/throttle';
// import pick from 'lodash/pick';
// import isEqual from 'lodash/isEqual';
const PLATFORM = platform();

import styles from './index.less';

export default class LayoutComponent extends PureComponent {
  static defaultProps = {
    title: '',
    icon: '',
    padding: 16,
    hasContent: true,
  }
  static propTypes = {
    title: PropTypes.string,
    icon: PropTypes.string,
    padding: PropTypes.number,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
    hasContent: PropTypes.bool,
  }
  state = {
    minHeader: false,
  }
  renderLayoutHead() {
    const { title, icon } = this.props;
    const { minHeader } = this.state;
    return title ? (
      <header
        className={classnames(
          styles.Layout__Header,
          {
            [styles['Layout__Header--min']]: minHeader,
          }
        )}
      >
        <Icon
          className={styles.Layout__HeaderIcon}
          type={icon}
          style={{
            fontSize: 36,
          }}
        />
        <h1 className={styles.Layout__HeaderTitle}>{title}</h1>
      </header>
    ) : null;
  }
  renderContent() {
    const { hasContent } = this.props;
    const content = this.props.children || null;
    return hasContent ? (
      <div className={styles.Layout__Content}>
        { content }
      </div>
    ) : content;
  }
  render() {
    const { padding } = this.props;
    const layoutStyle = {
      padding,
    };
    const wrapperStyle = {
      width: `calc(100vw - 80px - ${padding * 2}px)`,
      minHeight: `calc(100vh - ${padding * 2}px)`,
    };
    return (
      <Layout className={PLATFORM}>
        <div
          className={styles.Layout}
          style={layoutStyle}
          ref={node => this.wrapper = node}
        >
          <main
            style={wrapperStyle}
            className={styles.Layout__Wrapper}>
            { this.renderLayoutHead() }
            { this.renderContent() }
          </main>
        </div>
      </Layout>
    );
  }
}
