import React, { Component } from 'react';
import { Svg } from 'expo';
import SunCalc from 'suncalc';
import moment from 'moment';

function dateToX (date, width) {
  return (date.getHours() + date.getMinutes() / 60) / 24 * width;
}

function altToY (altitude, height) {
  return (height / 2)-altitude/(Math.PI/2)*(height/2);
}

function toDeg (r) {
  return r / Math.PI * 180;
}

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

    if (!this.props.location) {
      return (
        <Svg
          width={width}
          height={height}
        >
          <Svg.Path
            id="horizon"
            d={`M 0 ${height/2} H ${width}`}
            stroke="#999"
            fillOpacity="0"
          />
        </Svg>
      );
    }

    const noon = new Date(this.props.date);
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

    const srx = dateToX(sr.toDate(), width);
    const ssx = dateToX(ss.toDate(), width);
    const snx = dateToX(sn.toDate(), width);

    const sHeight = snp.altitude / (Math.PI / 2) * height;
    const sOffset = height - sHeight;

    const sps = [];
    const d = new Date(this.props.date);
    d.setHours(0, 0, 0);
    for(let i = 0; i <= 24; i++) {
      d.setHours(i);
      const p = SunCalc.getPosition(d, latitude, longitude);
      const y = altToY(p.altitude, height);

      if (i == 0) {
        sps.push("M 0 " + y);
      } else if (i == 24) {
        sps.push(`L ${width} ${y}`);
      } else {
        sps.push(`L ${(i/24)*width} ${y}`);
      }
    }

    const solarPath = sps.join(" ");

    return (
      <Svg
        width={width}
        height={height}
      >
        <Svg.Path
          id="horizon"
          d={`M 0 ${height/2} H ${width}`}
          stroke="#999"
          fillOpacity="0"
        />
        <Svg.Path
          id="sunpath"
          d={solarPath}
          stroke="#88f"
          fillOpacity="0"
        />
        <Svg.Path
          id="daylength-line"
          d={`M ${srx} ${height - 4} v 4 H ${ssx} v -4`}
          stroke="#f80"
          fillOpacity={0}
        />
        <Svg.Text
          id="sunrise-text"
          x={srx - 16}
          y={height/2 + 12}
          fill="#f80"
        >
          {sr.format("HH:mm")}
          <Svg.TSpan
            x={srx - 12}
            dy="1.2em"
            fill="#f80"
          >{Math.round(toDeg(srp.azimuth+Math.PI))}°</Svg.TSpan>
        </Svg.Text>
        <Svg.Text
          id="sunset-text"
          x={ssx - 16}
          y={height/2 + 12}
          fill="#f80"
        >
          {ss.format("HH:mm")}
          <Svg.TSpan
            x={ssx - 12}
            dy="1.2em"
            fill="#f80"
          >{Math.round(toDeg(ssp.azimuth+Math.PI))}°</Svg.TSpan>
        </Svg.Text>
        <Svg.Text
          id="solarnoon-text"
          x={snx - 16}
          y={height/6}
          fill="#f80"
        >
          {sn.format("HH:mm")}
          <Svg.TSpan
            x={snx - 40}
            fill="#f80"
          >{Math.round(toDeg(snp.altitude))}°</Svg.TSpan>
          <Svg.TSpan
            x={snx - 12}
            dy="1.2em"
            fill="#f80"
          >{Math.round(toDeg(snp.azimuth+Math.PI))}°</Svg.TSpan>
        </Svg.Text>
        <Svg.Text
          id="daylength-text"
          x={width / 2 - 30}
          y={height - 1}
          fill="#f80"
        >{`${dl.hours()}:${padStart(dl.minutes())}:${padStart(dl.seconds())}`}</Svg.Text>
        <Svg.Circle
          id="sun"
          cx={dateToX(this.props.date, width)}
          cy={altToY(sp.altitude, height)}
          r={5}
          fill="#f80"
        />
      </Svg>
    );
  }
}

function padStart (n, c="0") {
  return n < 10 ? c + n : n;
}