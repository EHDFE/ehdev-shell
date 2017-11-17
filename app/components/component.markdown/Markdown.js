/**
 * Markdown Component
 * @author ryan.bian
 */
import React from 'react';
import PropTypes from 'prop-types';
import Remarkable from 'remarkable';

import styles from './index.less';

const md = new Remarkable();

const Markdown = ({ source }) => (
  <article
    className={styles.Markdown}
    dangerouslySetInnerHTML={{__html: md.render(source)}}
  />
);

Markdown.propTypes = {
  source: PropTypes.string.isRequired,
};

export default Markdown;
