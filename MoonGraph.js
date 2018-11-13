import React, { Component } from 'react';
import { Svg } from 'expo';
import SunCalc from 'suncalc';
import moment from 'moment';
import {pointsToPath } from './path';

/**
 * Props for SunGraph
 * @typedef {Object} SunGraphProps
 * @prop {Date} date
 * @prop {{latitude: number, longitude: number}} location
 */

export default class SunGraph extends Component {

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

    const gutterLeft = 32;
    const gutterTop = 12;
    const gutterRight = 20;
    const gutterBottom = 12;

    const timeMarkersD = Array(25).fill(0).map((x,i) => `M ${i/24 * width} ${height/2} v 4`).join(" ");

    if (!this.props.location) {
      return false;
    }

    const noon = new Date(this.props.date);
    noon.setHours(12, 0, 0);

    const { latitude, longitude } = this.props.location.coords;
    const { rise, set } = SunCalc.getMoonTimes(noon, latitude, longitude);
    const mr = moment(rise);
    const ms = moment(set);
    const ml = moment.duration(ms.diff(mr));
    const mp = SunCalc.getMoonPosition(this.props.date, latitude, longitude);
    const mrp = SunCalc.getMoonPosition(rise, latitude, longitude);
    const msp = SunCalc.getMoonPosition(set, latitude, longitude);

    const mrx = dateToX(mr.toDate(), width);
    const msx = dateToX(ms.toDate(), width);
    const { phase, angle } = SunCalc.getMoonIllumination(this.props.date);

    const points = [];
    const d = new Date(this.props.date);
    d.setHours(0, 0, 0);
    for(let i = 0; i <= 24; i++) {
      d.setHours(i);
      const p = SunCalc.getMoonPosition(d, latitude, longitude);
      const y = altToY(p.altitude, height);
      const x = i/24 * width;
      points.push([x, y]);
    }

    const lunarPath = pointsToPath(points);

    const moonInvert = ms < mr;

    return (
      <Svg
        width={width+gutterLeft+gutterRight}
        height={height+gutterTop+gutterBottom}
      >
        <Svg.Defs>
            <Svg.ClipPath id="moon-clip">
                <Svg.Circle
                  cx={dateToX(this.props.date, width)}
                  cy={altToY(mp.altitude, height)}
                  r={4}
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
            id="time-markers"
            d={timeMarkersD}
            stroke="#999"
            fillOpacity="0" />
          <Svg.Path
            id="moonpath"
            d={lunarPath}
            stroke="#333"
            fillOpacity="0"
          />
          <Svg.Text
            id="moonalt-text"
            x={0 - gutterLeft}
            y={altToY(mp.altitude, height) + 6}
            fill="#666"
          >{toDeg(mp.altitude).toFixed(1)}°</Svg.Text>
          <Svg.Text
            id="moonrise-text"
            x={mrx - 12}
            y={height/2 + 18}
            fill="#666"
          >
            <Svg.TSpan
              x={mrx - 16}
              dy="1.2em"
              fill="#666"
            >{mr.format("HH:mm")}</Svg.TSpan>
          </Svg.Text>
          <Svg.Text
            id="moonset-text"
            x={msx - 12}
            y={height/2 + 18}
            fill="#666"
          >
            <Svg.TSpan
              x={msx - 16}
              dy="1.2em"
              fill="#666"
            >{ms.format("HH:mm")}</Svg.TSpan>
          </Svg.Text>
          { moonInvert ?
            <Fragment>
              <Svg.Path
                id="moonlength-line1"
                d={`M ${mrx} ${height - 4} v 4 H ${width}`}
                stroke="#666"
                fillOpacity={0}
              />
              <Svg.Path
                id="moonlength-line2"
                d={`M 0 ${height - 4} v 4 H ${msx} v -4`}
                stroke="#666"
                fillOpacity={0}
              />
            </Fragment>
            :
            <Fragment>
              <Svg.Text
                id="moonlength-text"
                x={(mrx + msx) / 2 - 30}
                y={height - 2}
                fill="#666"
              >{`${ml.hours()}:${padStart(ml.minutes())}:${padStart(ml.seconds())}`}</Svg.Text>
              <Svg.Path
                id="moonlength-line"
                d={`M ${mrx} ${height - 4} v 4 H ${msx} v -4`}
                stroke="#666"
                fillOpacity={0}
              />
            </Fragment>
          }
          <Svg.Circle
            id="moon"
            cx={dateToX(this.props.date, width)}
            cy={altToY(mp.altitude, height)}
            r={4}
            fill="#fff"
            stroke="#000"
          />
          <Svg.G
            id="moon-shade"
            clipPath="url(#moon-clip)"
            transform={`rotate(${toDeg(angle - mp.parallacticAngle)}, ${dateToX(this.props.date, width)}, ${altToY(mp.altitude, height)})`}
          >
            <Svg.G
              id="moon-shade"
              transform={`translate(${dateToX(this.props.date, width) + 4 - (16 * phase)}, ${altToY(mp.altitude, height) - 4})`}
            >
              <Svg.Rect
                x={-8}
                y={0}
                width={8}
                height={8}
                fill="#000"
              />
              <Svg.Rect
                x={8}
                y={0}
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

function dateToX (date, width) {
  return (date.getHours() + date.getMinutes() / 60) / 24 * width;
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