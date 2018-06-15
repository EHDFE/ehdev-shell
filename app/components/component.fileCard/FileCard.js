/**
 * File Card Component
 * @author ryan.bian
 */
import { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import { getIcon } from 'pretty-file-icons';

import styles from './index.less';

export default class FileCard extends Component {
  static defaultProps = {
    name: null,
    url: null,
    type: undefined,
    mask: [],
  }
  static propTypes = {
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    mask: PropTypes.array,
  }
  coverImage = createRef()
  componentDidMount() {
    const { name, type } = this.props;
    if (type.startsWith('image/')) return;
    const iconName = getIcon(name);
    import(`pretty-file-icons/svg/${iconName}.svg`)
      .then(res => {
        const iconUrl = res.default;
        this.coverImage.current.setAttribute('src', iconUrl);
      });
  }
  /**
   * if the file type is image
   * then show the image directly.
   */
  renderImage() {
    return (
      <figure className={styles.FileCard__figure}>
        <img src={this.props.url} alt={this.props.name} />
      </figure>
    );
  }
  /**
   * show the icon by the file type.
   */
  renderFileIcon() {
    return (
      <figure className={styles.FileCard__fileIcon}>
        <img ref={this.coverImage} alt={this.props.name} />
      </figure>
    );
  }
  render() {
    const {
      name,
      type,
      mask,
    } = this.props;

    return (
      <div className={styles.FileCard__block}>
        {
          type.startsWith('image/') ? this.renderImage() : this.renderFileIcon(name)
        }
        <div className={styles.FileCard__mask}>{ mask }</div>
        <div className={styles.FileCard__meta}>
          <Tooltip title={name}>{name}</Tooltip>
        </div>
      </div>
    );
  }
}
