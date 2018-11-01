import React, { Component } from 'react';
import { Svg } from 'expo';
import SunCalc from 'suncalc';

export default class MoonChart extends Component {
  render () {
    const width = 100;
    const height = 100;
    const lineWidth = 8;
    const lW2 = lineWidth / 2;

    const moon = SunCalc.getMoonIllumination(this.props.date);
    const mf = moon.fraction;
    const mp = moon.phase;

    return (
      <Svg
        width={width}
        height={height}
      >
        <Svg.G
          transform={`rotate(${mp * 360}, ${width/2}, ${height/2})`}
        >
          <Svg.Path
            d={`M ${width-lW2} ${height/2} A ${width/2 - lineWidth} ${height/2 - lineWidth} 0 0 1 ${lW2} ${height/2}`}
            strokeWidth={lineWidth}
            stroke="#000"
            fillOpacity={0}
          />
          <Svg.Path
            d={`M ${lW2} ${height/2} A ${width/2 - lineWidth} ${height/2 - lineWidth} 0 0 1 ${width-lW2} ${height/2}`}
            strokeWidth={lineWidth}
            stroke="#fff"
            fillOpacity={0}
          />
        </Svg.G>
        <Svg.Path
          d={`M ${lW2} ${height/2} A ${width/2 - lineWidth} ${height/2 - lineWidth} 0 0 1 ${width-lW2} ${height/2}`}
          strokeWidth={lineWidth}
          stroke="#000"
          fillOpacity={0}
          strokeOpacity={0.3333}
        />
        <Svg.Text
          x={width/2 - 40}
          y={height/2 + 6}
          fontSize="1.5em"
        >
          {(mf*100).toFixed(4)}%
        </Svg.Text>
      </Svg>
    )
  }
}
