import React from 'react';
import { StyleSheet, Text, View, ScrollView, AsyncStorage } from 'react-native';
import moment from 'moment';
import Expo from 'expo';
import SunGraph from './SunGraph';
import MoonChart from './MoonChart';
import MoonGraph from './MoonGraph';
import CombinedGraph from './CombinedGraph';

const { Localization } = Expo.DangerZone;

const LOCATION_KEY = "location";

// date/time constants and conversions
// copied from suncalc.js

var dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545;

function toJulian(t) { return t / dayMs - 0.5 + J1970; }
function fromJulian(j)  { return new Date((j + 0.5 - J1970) * dayMs); }
function toDays(date)   { return toJulian(date) - J2000; }

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

    navigator.geolocation.getCurrentPosition(loc => {
      this.setState({ loc, locLive: true });
      AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
    });

    const savedLocation = await AsyncStorage.getItem(LOCATION_KEY);
    if (savedLocation) {
      try {
        this.setState(oldState => !oldState.locLove && { loc: JSON.parse(savedLocation) });
      } catch (e) {}
    }

    const tz = await Localization.getCurrentTimeZoneAsync();
    this.setState({ tz });
  }

  componentWillUnmount () {
    this.visible = false;
  }

  render() {
    const d = moment(this.state.now);

    return (
      <ScrollView>
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
            <Text style={styles.utcTime}>{toJulian(this.state.now).toFixed(5)}</Text>
          </View>
          <View style={styles.sun}>
            <Text style={styles.sunLabel}>Sun</Text>
            <View style={{display:"flex", alignItems:"center"}}>
              <SunGraph date={new Date(this.state.now)} location={this.state.loc} />
            </View>
          </View>
          <View style={styles.moon}>
            <Text style={styles.moonLabel}>Moon</Text>
            <View style={styles.moonProgress}>
              <MoonChart date={new Date(this.state.now)} />
              <MoonGraph date={new Date(this.state.now)} location={this.state.loc} />
            </View>
          </View>
          <View style={styles.combined}>
            <Text style={styles.combinedLabel}>Azimuth</Text>
            <View style={{display:"flex", alignItems:"center"}}>
              <CombinedGraph date={new Date(this.state.now)} location={this.state.loc} />
            </View>
          </View>
        </View>
      </ScrollView>
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
  combined: {
    backgroundColor: '#fde',
  },
  combinedLabel: {
    color: '#856',
    fontSize: 12,
    marginLeft: MARGIN_H_SMALL,
    marginTop: MARGIN_V_SMALL,
  },
});
