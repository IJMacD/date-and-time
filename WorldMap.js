import React, { Component } from 'react';
import { Svg } from 'expo';
import SunCalc from './suncalc';
import moment from 'moment';

/**
 * Props for SunPosition
 * @typedef {Object} WorldMapProps
 * @prop {Date} date
 */

export default class WorldMap extends Component {

  shouldComponentUpdate (nextProps) {
    const m0 = moment(this.props.date);
    const m1 = moment(nextProps.date);
    return !m0.isSame(m1, 'minute');
  }

  render () {
    const width = 300;
    const height = 80;
    const { date } = this.props;

    const gutterLeft = 32;
    const gutterTop = 12;
    const gutterRight = 20;
    const gutterBottom = 12;

    const gp = SunCalc.getGeographicalPosition(date);
    const mgp = SunCalc.getMoonGeographicalPosition(date);

    return (
      <Svg
        width={width+gutterLeft+gutterRight}
        height={height+gutterTop+gutterBottom}
      >
        <Svg.G
          transform={`translate(${gutterLeft}, ${gutterTop})`}
        >
          <Svg.Path
            id="horizon"
            d={`M 0 ${height/2} H ${width}`}
            stroke="#999"
            fillOpacity="0"
          />
          <Svg.Path
            id="g_meridian"
            d={`M ${width/2} 0 V ${height}`}
            stroke="#999"
            fillOpacity="0"
          />
          <Svg.Circle
            id="sun"
            cx={lonToX(gp.lon, width)}
            cy={latToY(gp.lat, height)}
            r={5}
            fill="#f80"
          />
          <Svg.Circle
            id="moon"
            cx={lonToX(mgp.lon, width)}
            cy={latToY(mgp.lat, height)}
            r={4}
            fill="#fff"
            stroke="#000"
          />
        </Svg.G>
      </Svg>
    );
  }
}

function lonToX (lon, width) {
  return (1 + (lon / Math.PI)) * width / 2;
}

function latToY (lat, height) {
  return (0.5 - lat / Math.PI) * height;
}