import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { remote } from 'electron';

import commandManager from '../../service/command';

import { actions as projectAction } from '../module.project';

class Controller extends PureComponent {
  static propTypes = {
    setProjectRoot: PropTypes.func,
    children: PropTypes.any,
  };
  componentDidMount() {
    this.removeAllListeners = commandManager.addListeners({
      'project:open': () => {
        remote.dialog.showOpenDialog({
          properties: [
            'openDirectory',
          ],
        }, filePaths => {
          if (filePaths && filePaths.length > 0) {
            this.props.setProjectRoot(filePaths[0]);
          }
        });
      },
    });
  }
  componentWillUnmount() {
    this.removeAllListeners();
  }
  render() {
    return (
      <div>
        { this.props.children }
      </div>
    );
  }
}

const mapStateToProps = state => ({

});
const mapDispatchToProps = dispatch => ({
  setProjectRoot: rootPath => dispatch(projectAction.env.setRootPath(rootPath)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Controller);
