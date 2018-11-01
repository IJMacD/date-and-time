import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import moment from 'moment';
import Expo from 'expo';
import SunGraph from './SunGraph';
import MoonChart from './MoonChart';

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
});
