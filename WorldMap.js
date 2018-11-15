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
    if (!this.props.location && nextProps.location) {
      return true;
    }

    const m0 = moment(this.props.date);
    const m1 = moment(nextProps.date);
    return !m0.isSame(m1, 'minute');
  }

  render () {
    const width = 300;
    const height = 152;
    const { date } = this.props;

    const gutterLeft = 10;
    const gutterTop = 10;
    const gutterRight = 10;
    const gutterBottom = 10;

    const gp = SunCalc.getGeographicalPosition(date);
    const mgp = SunCalc.getMoonGeographicalPosition(date);

    const locPos = this.props.location && coordsToXY(this.props.location.coords, width, height);

    return (
      <Svg
        width={width+gutterLeft+gutterRight}
        height={height+gutterTop+gutterBottom}
      >
        <Svg.G
          transform={`translate(${gutterLeft}, ${gutterTop})`}
        >
          <Svg.Path
            id="map"
            d={require('./worldmap.json')}
            fill="#008000"
          />
          <Svg.Path
            id="horizon"
            d={`M 0 ${height/2+0.5} H ${width}`}
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
            id="location"
            cx={locPos ? locPos.x : -100}
            cy={locPos ? locPos.y : -100}
            r={2}
            fill="#44f"
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
  return (1 + (lon / 180)) * width / 2;
}

function latToY (lat, height) {
  return (0.5 - lat / 180) * height;
}

function coordsToXY (coords, width, height) {
  // https://en.wikipedia.org/wiki/Robinson_projection
  const lat_abs = Math.abs(coords.latitude);
  const i = Math.floor(lat_abs/5);
  const c = lat_abs / 5 - i;

  const PLEN = [1.0000,0.9986,0.9954,0.9900,0.9822,0.9730,0.9600,0.9427,0.9216,0.8962,0.8679,0.8350,0.7986,0.7597,0.7186,0.6732,0.6213,0.5722,0.5322];
  const ax = PLEN[i];
  const bx = PLEN[i+1];
  const rx = ax * (1 - c) + bx * c;
  const x = rx * lonToX(coords.longitude, width);

  const PDFE = [0.0000,0.0620,0.1240,0.1860,0.2480,0.3100,0.3720,0.4340,0.4958,0.5571,0.6176,0.6769,0.7346,0.7903,0.8435,0.8936,0.9394,0.9761,1.0000];
  const ay = PDFE[i];
  const by = PDFE[i+1];
  const ry = ay * (1 - c) + by * c;
  const sy = coords.latitude < 0 ? -1 : 1;
  const y = (0.5 - sy * ry * 0.5072) * height * 0.5072 * 2;

  return {
    x,
    y,
  };
}
