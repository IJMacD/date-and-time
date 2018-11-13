import React, { Component } from 'react';
import { Svg } from 'expo';
import SunCalc from 'suncalc';
import moment from 'moment';
import { pointsToPath } from './path';


/**
 * Props for CombinedGraph
 * @typedef {Object} CombinedGraphProps
 * @prop {Date} date
 * @prop {{latitude: number, longitude: number}} location
 */

export default class CombinedGraph extends Component {

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
    const height = 80;
    const { date } = this.props;

    const gutterLeft = 32;
    const gutterTop = 24;
    const gutterRight = 20;
    const gutterBottom = 12;

    const degreeMarkersD = Array(9).fill(0).map((x,i) => `M ${i/8 * width} ${height/2} v 4`).join(" ");

    if (!this.props.location) {
      return false;
    }

    // clone to mutate
    const noon = new Date(date);
    noon.setHours(12, 0, 0);

    const { latitude, longitude } = this.props.location.coords;
    const { sunrise, sunset, solarNoon } = SunCalc.getTimes(noon, latitude, longitude);
    const sr = moment(sunrise);
    const ss = moment(sunset);
    const sn = moment(solarNoon);
    const dl = moment.duration(ss.diff(sr));
    const sp = SunCalc.getPosition(this.props.date, latitude, longitude);
    const srp = SunCalc.getPosition(sunrise, latitude, longitude);
    const ssp = SunCalc.getPosition(sunset, latitude, longitude);
    const snp = SunCalc.getPosition(solarNoon, latitude, longitude);

    const srx = azmToX(srp.azimuth, width);
    const ssx = azmToX(ssp.azimuth, width);
    const snx = azmToX(snp.azimuth, width);

    const { rise, set } = SunCalc.getMoonTimes(noon, latitude, longitude);
    const mr = moment(rise);
    const ms = moment(set);
    const ml = moment.duration(ms.diff(mr));
    const mp = SunCalc.getMoonPosition(this.props.date, latitude, longitude);
    const mrp = SunCalc.getMoonPosition(rise, latitude, longitude);
    const msp = SunCalc.getMoonPosition(set, latitude, longitude);

    const mrx = azmToX(mrp.azimuth, width);
    const msx = azmToX(msp.azimuth, width);
    const { phase, angle } = SunCalc.getMoonIllumination(this.props.date);

    const sunPoints = [];
    const moonPoints = [];
    // clone to mutate
    const d = new Date(date);
    const t = +d;
    const delta = (15 * 60 * 1000);

    for(let i = -12*4; i <= 12*4; i++) {
      d.setTime(t + i * delta);

      const sp = SunCalc.getPosition(d, latitude, longitude);
      const sy = altToY(sp.altitude, height);
      const sx = azmToX(sp.azimuth, width);
      sunPoints.push([sx, sy]);

      const mp = SunCalc.getMoonPosition(d, latitude, longitude);
      const my = altToY(mp.altitude, height);
      const mx = azmToX(mp.azimuth, width);
      moonPoints.push([mx, my]);
    }

    const solarPath = pointsToPath(sunPoints, 0);
    const lunarPath = pointsToPath(moonPoints, 0);

    // console.log(solarPath);
    // console.log(lunarPath);

    const moonInvert = ms < mr;

    return (
      <Svg
        width={width+gutterLeft+gutterRight}
        height={height+gutterTop+gutterBottom}
        viewBox={`0 0 ${width+gutterLeft+gutterRight} ${height+gutterTop+gutterBottom}`}
      >
        <Svg.Defs>
            <Svg.ClipPath id="moon-clip">
                <Svg.Circle
                  cx={0}
                  cy={0}
                  r={4.5}
                />
            </Svg.ClipPath>
        </Svg.Defs>
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
            id="degree-markers"
            d={degreeMarkersD}
            stroke="#999"
            fillOpacity="0" />
          <Svg.Text
            id="S-text"
            x={- 4}
            y={height / 2 + 13}
            fill="#999"
          >N</Svg.Text>
          <Svg.Text
            id="S-text"
            x={width / 2 - 4}
            y={height / 2 + 13}
            fill="#999"
          >S</Svg.Text>
          <Svg.Text
            id="S-text"
            x={width / 4 - 4}
            y={height / 2 + 13}
            fill="#999"
          >E</Svg.Text>
          <Svg.Text
            id="S-text"
            x={width * 3 / 4 - 4}
            y={height / 2 + 13}
            fill="#999"
          >W</Svg.Text>
          <Svg.Text
            id="S-text"
            x={width - 4}
            y={height / 2 + 13}
            fill="#999"
          >N</Svg.Text>
          <Svg.Path
            id="sunpath"
            d={solarPath}
            stroke="#88f"
            fillOpacity="0"
          />
          <Svg.Path
            id="moonpath"
            d={lunarPath}
            stroke="#333"
            fillOpacity="0"
          />
          <Svg.Text
            id="sunazm-text"
            x={azmToX(sp.azimuth, width) - 8}
            y={24 - gutterTop}
            fill="#f80"
          >{Math.round(toDeg(sp.azimuth+Math.PI))}°</Svg.Text>
          <Svg.Text
            id="moonazm-text"
            x={azmToX(mp.azimuth, width) - 8}
            y={12 - gutterTop}
            fill="#666"
          >{Math.round(toDeg(mp.azimuth+Math.PI))}°</Svg.Text>
          <Svg.Circle
            id="sun"
            cx={azmToX(sp.azimuth, width)}
            cy={altToY(sp.altitude, height)}
            r={5}
            fill="#f80"
          />
          <Svg.Text
            id="moonrise-text"
            x={mrx - 12}
            y={height/2 + 18}
            fill="#666"
          >
            {Math.round(toDeg(mrp.azimuth+Math.PI))}°
          </Svg.Text>
          <Svg.Text
            id="moonset-text"
            x={msx - 12}
            y={height/2 + 18}
            fill="#666"
          >
            {Math.round(toDeg(msp.azimuth+Math.PI))}°
          </Svg.Text>
          <Svg.Text
            id="sunrise-text"
            x={srx - 12}
            y={height/2 + 30}
            fill="#f80"
          >
            {Math.round(toDeg(srp.azimuth+Math.PI))}°
          </Svg.Text>
          <Svg.Text
            id="sunset-text"
            x={ssx - 12}
            y={height/2 + 30}
            fill="#f80"
          >
            {Math.round(toDeg(ssp.azimuth+Math.PI))}°
          </Svg.Text>
          <Svg.Text
            id="solarnoon-text"
            x={snx - 12}
            y={height/2 + 30}
            fill="#f80"
          >{Math.round(toDeg(snp.azimuth+Math.PI))}°</Svg.Text>
          <Svg.G
            id="moon-shade"
            clipPath="url(#moon-clip)"
            transform={`translate(${azmToX(mp.azimuth, width)}, ${altToY(mp.altitude, height)}) rotate(${toDeg(angle - mp.parallacticAngle)})`}
          >
            <Svg.Circle
              id="moon"
              cx={0}
              cy={0}
              r={4}
              fill="#fff"
              stroke="#000"
            />
            <Svg.G
              id="moon-shade"
              transform={`translate(${-16 * phase}, 0)`}
            >
              <Svg.Rect
                x={-4}
                y={-4}
                width={8}
                height={8}
                fill="#000"
              />
              <Svg.Rect
                x={12}
                y={-4}
                width={8}
                height={8}
                fill="#000"
              />
            </Svg.G>
          </Svg.G>
        </Svg.G>
      </Svg>
    );
  }
}

/**
 *
 * @param {Date} date
 * @param {number} width
 * @returns {number}
 */
function dateToX (date, width) {
  return (date.getHours() + date.getMinutes() / 60) / 24 * width;
}

/**
 * Returns x coordinate based on azimuth with south being in centre
 * @param {number} azimuth
 * @param {number} width
 * @returns {number}
 */
function azmToX (azimuth, width) {
  // Northern hemisphere implementation!
  // For southern hemisphere:
  //    return (width - result);
  return (azimuth + Math.PI) / Math.PI / 2 * width;
}

function altToY (altitude, height) {
  return (height / 2)-altitude/(Math.PI/2)*(height/2);
}

function toDeg (r) {
  return r / Math.PI * 180;
}

function padStart (n, c="0") {
  return n < 10 ? c + n : n;
}

const Fragment = props => props.children;