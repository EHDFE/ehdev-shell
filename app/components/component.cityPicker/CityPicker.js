import React from 'react';
import PropTypes from 'prop-types';
import { Cascader  } from 'antd';
import citys from './city';

class CityPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || []
    };
  }

  render() {
    const {citys, onChange, size, placehoder} = this.props;
    const {value} = this.state;
    const province = Object.keys(citys);
    let address = [];
    if (province.length) {
      address = province.map(item=>{
        const value = item;
        const label = item;
        const children = citys[item].map(city=>{
          return {
            value: city,
            label: city
          };
        });

        return {
          value,
          label,
          children
        };
      });
    }

    return (
      <Cascader options={address} size={size} placeholder={placehoder} onChange={onChange} defaultValue={value}></Cascader>
    );
  }
}

CityPicker.defaultProps = {
  citys,
  onChange: undefined,
  size: 'default',
  placehoder: '请选择'
};

CityPicker.propTypes = {
  citys: PropTypes.object,
  onChange: PropTypes.func,
  value: PropTypes.array,
  size: PropTypes.string,
  placehoder: PropTypes.string
};

export default CityPicker;
