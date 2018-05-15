import { PureComponent } from 'react';
import * as monaco from 'monaco-editor';
import PropTypes from 'prop-types';

class Editor extends PureComponent {
  static defaultProps = {
    language: 'javascript',
    content: '',
  }
  static propTypes = {
    language: PropTypes.string,
    content: PropTypes.string,
  }
  componentDidMount() {
    const { language, content } = this.props;
    this.editor = monaco.editor.create(this.root, {
      value: content,
      language,
      minimap: {
        enable: false,
      },
      automaticLayout: true,
      autoIndent: true,
    });
    this.model = this.editor.getModel();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.content !== this.props.content) {
      this.model.setValue(nextProps.content);
    }
  }
  getValue() {
    return this.model.getValue();
  }
  render() {
    const style = {
      width: '100%',
      height: '100%',
    };
    return <div
      style={style}
      ref={node => this.root = node}
    />;
  }
}

export default Editor;
