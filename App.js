import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import moment from 'moment';
import Expo, { Svg } from 'expo';
import suncalc from 'suncalc';
import ProgressCircle from 'react-native-progress-circle'
const { Localization } = Expo.DangerZone;

export default class App extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      now: Date.now(),
      tz: null,
      loc: null,
    };

    this.tick = this.tick.bind(this);
  }

  tick () {
    if (this.visible) {
      this.setState({ now: Date.now() });
      requestAnimationFrame(this.tick);
    }
  }

  async componentDidMount () {
    this.visible = true;
    requestAnimationFrame(this.tick);

    navigator.geolocation.getCurrentPosition(loc => this.setState({ loc }));

    const tz = await Localization.getCurrentTimeZoneAsync();
    this.setState({ tz });
  }

  componentWillUnmount () {
    this.visible = false;
  }

  render() {
    const d = moment(this.state.now);

    let mf, mp;
    if (this.state.loc) {
      const today = d.toDate();
      const moon = suncalc.getMoonIllumination(today);
      mf = moon.fraction;
      mp = moon.phase;
    }

    return (
      <View style={styles.container}>
        <View style={styles.local}>
          <Text style={styles.localTime}>{d.format("Y-MM-DD")}</Text>
          <Text style={styles.localTime}>{d.format("HH:mm:ss")}</Text>
          <Text style={styles.localZone}>{`${this.state.tz} ${d.format("Z")}`}</Text>
        </View>
        <View style={styles.utc}>
          <Text style={styles.utcLabel}>UTC</Text>
          <Text style={styles.utcTime}>{d.toISOString()}</Text>
          <Text style={styles.utcTime}>{d.utc().format("GGGG-[W]WW-E")}</Text>
        </View>
        <View style={styles.sun}>
          <Text style={styles.sunLabel}>Sun</Text>
          <View style={{display:"flex", alignItems:"center"}}>
            <SunGraph date={new Date(this.state.now)} loc={this.state.loc} />
          </View>
        </View>
        <View style={styles.moon}>
          <Text style={styles.moonLabel}>Moon</Text>
          <View style={styles.moonProgress}>
          { mp && (
              <ProgressCircle
                percent={mp*100}
                radius={50}
                borderWidth={8}
                color="#000"
                shadowColor="#999"
                bgColor="#fff"
              >
                  <Text style={styles.moonTime}>{(mf * 100).toFixed(4)}%</Text>
              </ProgressCircle>
          )}
          </View>
        </View>
      </View>
    );
  }
}

const PADDING_V = 16;
const MARGIN_H_SMALL = 8;
const MARGIN_V_SMALL = 4;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  local: {
    backgroundColor: '#000',
    paddingTop: 48,
    paddingBottom: PADDING_V,
  },
  localTime: {
    color: '#fff',
    fontSize: 48,
    textAlign: 'center',
  },
  localZone: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  utc: {
    backgroundColor: '#eef',
    paddingBottom: PADDING_V,
  },
  utcLabel: {
    color: '#79f',
    fontSize: 12,
    marginLeft: MARGIN_H_SMALL,
    marginTop: MARGIN_V_SMALL,
  },
  utcTime: {
    color: '#44f',
    fontSize: 20,
    textAlign: 'center',
  },
  sun: {
    backgroundColor: '#ffd',
    paddingBottom: PADDING_V,
  },
  sunLabel: {
    color: '#a85',
    fontSize: 12,
    marginLeft: MARGIN_H_SMALL,
    marginTop: MARGIN_V_SMALL,
  },
  sunTime: {
    color: '#f80',
    fontSize:  20,
    textAlign: 'center',
  },
  moon: {
    backgroundColor: '#eee',
    paddingBottom: PADDING_V,
  },
  moonLabel: {
    color: '#666',
    fontSize: 12,
    marginLeft: MARGIN_H_SMALL,
    marginTop: MARGIN_V_SMALL,
  },
  moonTime: {
    color: '#333',
    fontSize:  18,
    textAlign: 'center',
  },
  moonProgress: {
    alignItems: 'center',
  },
});

function dateToX (date, width) {
  return (date.getHours() + date.getMinutes() / 60) / 24 * width;
}

function toDeg (r) {
  return r / Math.PI * 180;
}

function SunGraph (props) {
  const width = 300;
  const height = 80;

  if (!props.loc) {
    return null;
  }

  const { latitude, longitude } = props.loc.coords;
  const { sunrise, sunset, solarNoon } = suncalc.getTimes(props.date, latitude, longitude);
  const sr = moment(sunrise);
  const ss = moment(sunset);
  const sn = moment(solarNoon);
  const dl = moment.duration(ss.diff(sr));
  const sp = suncalc.getPosition(props.date, latitude, longitude);
  const srp = suncalc.getPosition(sunrise, latitude, longitude);
  const ssp = suncalc.getPosition(sunset, latitude, longitude);
  const snp = suncalc.getPosition(solarNoon, latitude, longitude);

  const srx = dateToX(sr.toDate(), width);
  const ssx = dateToX(ss.toDate(), width);
  const snx = dateToX(sn.toDate(), width);

  const sHeight = snp.altitude / (Math.PI / 2) * height;
  const sOffset = height - sHeight;

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
        d={`M 0 ${height-sOffset/2} C ${width/4} ${height-sOffset/2} ${width/4} ${sOffset/2} ${width/2} ${sOffset/2} C ${width*3/4} ${sOffset/2} ${width*3/4} ${height-sOffset/2} ${width} ${height-sOffset/2}`}
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
        >{Math.round(toDeg(srp.azimuth))}°</Svg.TSpan>
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
        >{Math.round(toDeg(ssp.azimuth))}°</Svg.TSpan>
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
        >{Math.round(toDeg(snp.azimuth))}°</Svg.TSpan>
      </Svg.Text>
      <Svg.Text
        id="daylength-text"
        x={width / 2 - 30}
        y={height - 1}
        fill="#f80"
      >{`${dl.hours()}:${padStart(dl.minutes())}:${padStart(dl.seconds())}`}</Svg.Text>
      <Svg.Circle
        id="sun"
        cx={dateToX(props.date, width)}
        cy={(height / 2)-sp.altitude/(Math.PI/2)*(height/2)}
        r={5}
        fill="#f80"
      />
    </Svg>
  );
}

function padStart (n, c="0") {
  return n < 10 ? c + n : n;
}