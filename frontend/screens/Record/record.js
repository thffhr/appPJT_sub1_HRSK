import React, {Component, useRef, useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  // ProgressBarAndroid,
  Animated,
  Dimensions,
  Image,
  AsyncStorage,
} from 'react-native';
import {
  Calendar,
  CalendarList,
  Agenda,
  LocaleConfig,
  Arrow,
} from 'react-native-calendars';
import Pie from 'react-native-pie';
import Icon from 'react-native-vector-icons/Ionicons';
import {get} from 'react-native/Libraries/Utilities/PixelRatio';

const {width, height} = Dimensions.get('screen');
const serverUrl = 'http://10.0.2.2:8080/';

LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ],
  monthNamesShort: [
    'Janv.',
    'Févr.',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juil.',
    'Août',
    'Sept.',
    'Oct.',
    'Nov.',
    'Déc.',
  ],
  dayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = 'fr';

let today = new Date();
let year = today.getFullYear(); // 년도
let month = today.getMonth() + 1; // 월
let date = today.getDate(); // 날짜
let day = today.getDay(); // 요일

//////////////////////////////////////////////
// let animation = useRef(new Animated.Value(0));
// const [progress, setProgress] = useState(0);
// useInterval(() => {
//   if (progress < 100) {
//     setProgress(progress + 1);
//   }
// }, 1000);

// useEffect(() => {
//   Animated.timing(animation.current, {
//     toValue: progress,
//     duration: 100,
//   }).start();
// }, [progress]);

// const width = animation.current.interpolate({
//   inputRange: [0, 100],
//   outputRange: ['0%', '100%'],
//   extrapolate: 'clamp',
// });
//////////////////////////////////////////////

export default class Record extends Component {
  constructor(props) {
    super(props);

    this.state = {
      btn1_color: '#FCA652',
      btn2_color: '#FFFBE6',
      btn3_color: '#FFFBE6',
      active: 'btn1',
      // btn1
      pictures: [],
      selected: {id: null, image: null},
      // btn2
      dateTime: {
        year: year,
        month: month,
        date: date,
        day: day,
      },
      whatInfo: false,
      dayMenus: {},
      // btn3
      selectedDate: {
        date: null,
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snack: 0,
        total: 0,
      },
      nextDays: {},
    };
  }
  componentDidMount() {
    this.onBtn1();
  }
  onBtn1 = async () => {
    this.setState({
      btn1_color: '#FCA652',
      btn2_color: '#FFFBE6',
      btn3_color: '#FFFBE6',
      active: 'btn1',
    });
    const token = await AsyncStorage.getItem('auth-token');
    fetch(`${serverUrl}gallery/myImgs/`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        this.setState({
          pictures: response,
          selected: {id: response[0].id, image: response[0].image},
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  onBtn2 = async () => {
    const authToken = await AsyncStorage.getItem('auth-token');
    this.setState({
      btn1_color: '#FFFBE6',
      btn2_color: '#FCA652',
      btn3_color: '#FFFBE6',
      active: 'btn2',
      token: authToken,
      whatInfo: false,
    });
    this.onFetch(year, month, date, day);
  };
  onBtn3 = async () => {
    const authToken = await AsyncStorage.getItem('auth-token');
    this.setState({
      btn1_color: '#FFFBE6',
      btn2_color: '#FFFBE6',
      btn3_color: '#FCA652',
      active: 'btn3',
    });
    fetch(`${serverUrl}gallery/getCalendar/`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${authToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          nextDays: response,
        });
        var tempObject = {};
        for (var key of Object.keys(this.state.nextDays)) {
          tempObject = {
            ...tempObject,
            [key]: {
              marked: true,
              dotColor: '#FCA652',
            },
          };
        }
        this.setState({
          newDaysObject: tempObject,
        });
      })
      .catch((err) => console.error(err));
  };
  // btn3
  onMacro = (day) => {
    if (Object.keys(this.state.nextDays).includes(day.dateString)) {
      this.setState({
        selectedDate: {
          ...this.state.selectedDate,
          date: day.dateString,
          breakfast: this.state.nextDays[day.dateString][0],
          lunch: this.state.nextDays[day.dateString][1],
          dinner: this.state.nextDays[day.dateString][2],
          snack: this.state.nextDays[day.dateString][3],
          total: this.state.nextDays[day.dateString][4],
        },
      });
    } else {
      this.setState({
        selectedDate: {
          ...this.state.selectedDate,
          date: day.dateString,
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snack: 0,
          total: 0,
        },
      });
    }
  };
  // btn2
  getEndOfDay = (y, m) => {
    switch (m) {
      case 1:
      case 3:
      case 5:
      case 7:
      case 8:
      case 10:
      case 12:
        return 31;
      case 4:
      case 6:
      case 9:
      case 11:
        return 30;
      case 2:
        if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
          return 29;
        } else {
          return 28;
        }
      default:
        return 0;
    }
  };

  yesterday = (year, month, date, day) => {
    if (date !== 1) {
      date--;
    } else {
      month--;
      if (month === 0) {
        month = 12;
        year--;
      }
      date = this.getEndOfDay(year, month);
    }
    day--;
    if (day === -1) {
      day = 6;
    }
    this.onFetch(year, month, date, day);
  };

  tomorrow = (year, month, date, day) => {
    var endDate = this.getEndOfDay(year, month);
    if (date !== endDate) {
      date++;
    } else {
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      date = 1;
    }
    day++;
    if (day === 7) {
      day = 0;
    }
    this.onFetch(year, month, date, day);
  };

  onFetch = (year, month, date, day) => {
    // console.log(this.state.dateTime);
    this.setState({
      dateTime: {
        ...this.state.dateTime,
        year: year,
        month: month,
        date: date,
        day: day,
      },
    });
    var newYear = this.pad(`${year}`, 4);
    var newMonth = this.pad(`${month}`, 2);
    var newDate = this.pad(`${date}`, 2);
    var sendDate = `${newYear}-${newMonth}-${newDate}`;
    // console.log(sendDate);
    fetch(`${serverUrl}gallery/getChart/${sendDate}`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((response) => {
        this.setState({
          dayMenus: response,
        });
        // console.log(this.state.dayMenus);
      })
      .catch((err) => console.error(err));
  };

  //댓글
  touchCalbox = () => {
    this.setState({
      whatInfo: !this.state.whatInfo,
    });
  };

  pad = (n, width) => {
    n = n + '';
    return n.length >= width
      ? n
      : new Array(width - n.length + 1).join('0') + n;
  };

  getDayInfo = () => {
    const YMD = `${this.state.dateTime.year}-${this.state.dateTime.month}-${this.state.dateTime.day}`;
    fetch(`${serverUrl}gallery/`, {
      method: 'GET',
      body: YMD,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${this.state.authToken}`,
      },
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => console.log(error));
  };
  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.navbar}>
          <Text style={styles.haru}>하루세끼</Text>
        </View>
        <View style={styles.btnList}>
          <TouchableOpacity
            onPress={this.onBtn1}
            style={[styles.btn, {borderBottomColor: this.state.btn1_color}]}>
            <Text style={styles.btnText}>사진</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.onBtn2}
            style={[styles.btn, {borderBottomColor: this.state.btn2_color}]}>
            <Text style={styles.btnText}>기록</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.onBtn3}
            style={[styles.btn, {borderBottomColor: this.state.btn3_color}]}>
            <Text style={styles.btnText}>달력</Text>
          </TouchableOpacity>
        </View>
        <View style={{width: '100%'}}>
          {this.state.active == 'btn2' && ( // chart
            <View style={styles.chartArea}>
              {/* 여기는 요일 */}
              <View style={styles.chartDay}>
                <Icon
                  name="chevron-back-outline"
                  style={styles.chartDayicon}
                  onPress={() =>
                    this.yesterday(
                      this.state.dateTime.year,
                      this.state.dateTime.month,
                      this.state.dateTime.date,
                      this.state.dateTime.day,
                    )
                  }></Icon>
                <View style={styles.chartDaybox}>
                  <Text style={styles.chartDaytxt}>
                    {this.state.dateTime.month}월 {this.state.dateTime.date}일 (
                    {
                      LocaleConfig.locales['fr'].dayNames[
                        this.state.dateTime.day
                      ]
                    }
                    )
                  </Text>
                </View>
                <Icon
                  name="chevron-forward-outline"
                  style={styles.chartDayicon}
                  onPress={() =>
                    this.tomorrow(
                      this.state.dateTime.year,
                      this.state.dateTime.month,
                      this.state.dateTime.date,
                      this.state.dateTime.day,
                    )
                  }></Icon>
              </View>
              {/* 여기는 총 칼로리*/}
              <Text style={styles.caltxt}>1000/1500</Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={
                    ([styles.progressBarFill],
                    {backgroundColor: '#8BED4F', width: '66%'}) //, chartwidth
                  }
                />
              </View>
              {/* 여기는 영양소 */}
              <View
                style={{
                  width: '100%',
                  marginTop: 50,
                  alignItems: 'center',
                }}>
                {Object.entries(this.state.dayMenus).map(([k, v], idx) => {
                  return (
                    <>
                      {/* <Text key={idx}>{k}</Text> */}
                      <View style={styles.calbox} key={idx}>
                        <TouchableOpacity onPress={this.touchCalbox}>
                          <Text>차트보기</Text>
                        </TouchableOpacity>
                        <View style={styles.calboxTitle}>
                          <Icon
                            name="restaurant-outline"
                            style={{fontSize: 20, marginTop: 2}}></Icon>
                          <Text style={{fontSize: 20, marginLeft: 5}}>{k}</Text>
                        </View>
                        {!this.state.whatInfo && (
                          <>
                            {v['meal'].map((m, i) => {
                              return (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    borderBottomWidth: 1,
                                    marginTop: 10,
                                  }}
                                  key={i}>
                                  <Text style={{fontSize: 18, marginLeft: 10}}>
                                    {m[0]}
                                  </Text>
                                  <Text style={{fontSize: 18}}>{m[1]}kcal</Text>
                                  <Text style={{fontSize: 18}}>1그릇</Text>
                                </View>
                              );
                            })}
                          </>
                        )}
                        {this.state.whatInfo && (
                          //  v['nutrient'][0] //탄수화물
                          // v['nutrient'][1] //단백질
                          // v['nutrient'][2] //지방
                          <View style={{margin: 20, alignContent: 'center'}}>
                            <Pie
                              radius={80}
                              sections={[
                                {
                                  percentage: v['nutrient'][0],
                                  color: '#FBC02D',
                                },
                                {
                                  percentage: v['nutrient'][1],
                                  color: '#FFEB3B',
                                },
                                {
                                  percentage: v['nutrient'][2],
                                  color: '#FFF59D',
                                },
                              ]}
                              strokeCap={'butt'}
                            />
                          </View>
                        )}
                      </View>
                    </>
                  );
                })}
              </View>
            </View>
          )}
          {this.state.active == 'btn1' && (
            <View style={styles.pictureBox}>
              {this.state.pictures.map((picture) => {
                const borderColor =
                  picture.id === this.state.selected.id
                    ? '#FCA652'
                    : 'transparent';
                return (
                  <TouchableOpacity
                    style={[styles.imgBtn, {borderColor: borderColor}]}
                    key={picture.id}
                    onPress={() => {
                      this.setState({
                        selected: {id: picture.id, image: picture.image},
                      });
                      this.props.navigation.push('DetailImage', {
                        imageId: picture.id,
                        image: picture.image,
                        // dateTime: this.state.dateTime,
                      });
                    }}>
                    <Image
                      style={styles.picture}
                      source={{
                        uri: `${serverUrl}gallery` + picture.image,
                      }}
                    />
                  </TouchableOpacity>
                );
              })}
              {/* {Object.entries(this.state.pictures).map(([key, value], i) => {
                return (
                  <TouchableOpacity
                    style={styles.imageBox}
                    key={i}
                    onPress={() => {
                      this.onDetailImage(key, value, i);
                    }}>
                    <Text>
                      {key} {value}
                    </Text>
                  </TouchableOpacity>
                );
              })} */}
            </View>
          )}
          {this.state.active == 'btn3' && ( // calendar
            <View style={styles.calendarArea}>
              <CalendarList
                horizontal={true}
                pagingEnabled={true}
                // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
                minDate={'2020-01-01'}
                // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
                maxDate={'2022-12-31'}
                // Handler which gets executed on day press. Default = undefined
                onDayPress={(day) => {
                  this.onMacro(day);
                }}
                // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                monthFormat={'yyyy MM'}
                // Handler which gets executed when visible month changes in calendar. Default = undefined
                onMonthChange={(month) => {
                  console.log('month changed', month);
                }}
                // Hide month navigation arrows. Default = false
                hideArrows={true}
                // Replace default arrows with custom ones (direction can be 'left' or 'right')
                renderArrow={(direction) => <Arrow />}
                // Do not show days of other months in month page. Default = false
                hideExtraDays={true}
                // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
                // day from another month that is visible in calendar page. Default = false
                disableMonthChange={true}
                // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
                firstDay={1}
                // Hide day names. Default = false
                hideDayNames={false}
                // Show week numbers to the left. Default = false
                showWeekNumbers={false}
                // Handler which gets executed when press arrow icon left. It receive a callback can go back month
                onPressArrowLeft={(subtractMonth) => subtractMonth()}
                // Handler which gets executed when press arrow icon right. It receive a callback can go next month
                onPressArrowRight={(addMonth) => addMonth()}
                // Disable left arrow. Default = false
                disableArrowLeft={true}
                // Disable right arrow. Default = false
                disableArrowRight={true}
                // Disable all touch events for disabled days. can be override with disableTouchEvent in markedDates
                disableAllTouchEventsForDisabledDays={true}
                // Replace default month and year title with custom one. the function receive a date as parameter.
                // renderHeader={(date) => {/*Return JSX*/}}
                // Enable the option to swipe between months. Default = false
                enableSwipeMonths={true}
                // markedDates={{
                // '2020-10-05': {marked: true},
                // }}
                theme={{
                  todayTextColor: '#FCA652',
                  backgroundColor: '#FFFBE6',
                }}
                markedDates={this.state.newDaysObject}
              />
              {Object.keys(this.state.nextDays).includes(
                this.state.selectedDate.date,
              ) && (
                <View style={styles.dateBox}>
                  <Text>{this.state.selectedDate.date}</Text>
                  {Object.entries(this.state.selectedDate)
                    .filter(([key, value]) => key !== 'date')
                    .map(([key, value], i) => {
                      return (
                        <View style={styles.macroBox} key={i}>
                          <Text>
                            {key} {value}
                          </Text>
                          <Text>kcal</Text>
                        </View>
                      );
                    })}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    width: '100%',
    flex: 1,
    backgroundColor: '#FFFBE6',
  },
  navbar: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    backgroundColor: '#fca652',
  },
  haru: {
    fontSize: 30,
    // fontWeight: 'bold',
    fontFamily: 'BMJUA',
    color: '#fff',
  },
  btnList: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  btn: {
    flexDirection: 'row',
    width: '33.3%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 6,
  },
  btnText: {
    fontFamily: 'BMJUA',
    color: '#737373',
  },
  // btn2
  chartArea: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  chartDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartDayicon: {
    fontSize: 50,
  },
  chartDaybox: {
    width: '50%',
    borderWidth: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartDaytxt: {
    fontSize: 20,
    margin: 10,
  },
  calbox: {
    marginTop: 20,
    padding: 10,
    width: '90%',
    borderWidth: 1,
    borderRadius: 5,
  },
  calboxTitle: {
    flexDirection: 'row',
  },
  calchart: {},
  caltxt: {
    fontSize: 30,
    fontWeight: 'bold',
    margin: 10,
  },
  progressBar: {
    height: 20,
    width: '80%',
    backgroundColor: 'white',
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 5,
    flexDirection: 'row',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  // btn1
  pictureBox: {
    // width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imgBtn: {
    width: '25%',
    height: 100,
    borderColor: 'white',
    borderWidth: 2,
  },
  picture: {
    width: '100%',
    height: '100%',
  },
  // btn3
  dateBox: {
    marginTop: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000',
  },
  macroBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  calendarArea: {
    width: '100%',
    marginBottom: 30,
  },
});
