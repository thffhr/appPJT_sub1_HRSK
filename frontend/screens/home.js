import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  AsyncStorage,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {CommonActions} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-picker';

const {width, height} = Dimensions.get('screen');

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      avatarSource: '',
      authToken: '',
    };
  }
  async componentDidMount() {
    // you might want to do the I18N setup here
    this.setState({
      username: await AsyncStorage.getItem('username'),
      authToken: await AsyncStorage.getItem('auth-token'),
    });
  }
  onProfile = () => {
    this.props.navigation.push('Profile');
  };
  onCamera = () => {
    const options = {
      title: 'Select Avatar',
      // customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
      storageOptions: {
        skipBackup: true,
        path: 'images',
        allowsEditing: true,
        // maxWidth: width,
        // maxHeight: width,
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);
    
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      // } else if (response.customButton) {
      //   console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = { uri: response.uri };
        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        this.setState({
          avatarSource: source,
        });
        var data = new FormData();
        data.append('file', response);
        fetch('http://10.0.2.2:8080/gallery/saveImg/', {
        method: 'POST',
        body: data,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Token ${this.state.authToken}`,
        },
      })
        .then((response) => {
          console.log('보내기 성공');
          console.log(response);
        })
        .catch((error) => console.log(error));
      }
    });
  };
  onCommunity = () => {
    this.props.navigation.push('Community');
  };
  onRank = () => {
    this.props.navigation.push('Rank');
  };
  
  render() {
    return (
      <View style={styles.Container}>
        <View style={styles.Nav}>
          <Text style={styles.title}>하루세끼</Text>
          <TouchableOpacity
            style={styles.user}
            onPress={async () => {
              const token = await AsyncStorage.getItem('auth-token');
              console.log(token);
              if (token !== null) {
                fetch('http://10.0.2.2:8080/rest-auth/logout/', {
                  method: 'POST',
                  header: {
                    Authorization: `Token ${token}`,
                  },
                })
                  .then(() => {
                    console.log('로그아웃 성공');
                    AsyncStorage.clear();
                    this.props.navigation.dispatch(
                      CommonActions.reset({
                        index: 1,
                        routes: [{name: 'Login'}],
                      }),
                    );
                  })
                  .catch((err) => console.error(err));
              }
            }}>
            <Text style={styles.user}>로그아웃</Text>
          </TouchableOpacity>
          <Text style={styles.user} onPress={this.onProfile}>
            <Image
              style={styles.profileImg}
              source={{
                uri:
                  'https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/profle-256.png',
              }}
            />
          </Text>
        </View>
        <View style={styles.body1}>
          <TouchableOpacity 
            onPress={this.onCamera}>
            <Icon name="camera-outline" style={styles.photo}></Icon>
            {/* <Text style={styles.photo}>사진 등록</Text> */}
          </TouchableOpacity>
        </View>
        <View style={styles.body2}>
          <View style={styles.body3}>
            <Icon name="calendar-outline" style={styles.record} />
            <Text style={styles.record}>내 기록</Text>
          </View>
          <View style={styles.body4}>
            <TouchableOpacity
              style={styles.communityBtn}
              onPress={this.onCommunity}>
              <View style={styles.btnContent}>
                <Icon name="earth-outline" style={styles.community} />
                <Text style={styles.community}>커뮤니티</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.body5}>
          <View style={styles.body6}>
            <TouchableOpacity style={styles.rankBtn} onPress={this.onRank}>
              <View style={styles.btnContent}>
                <Icon name="medal-outline" style={styles.ranking} />
                <Text style={styles.ranking}>랭킹</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.body7}>
            <TouchableOpacity>
              <View style={styles.btnContent}>
                <Icon name="trophy-outline" style={styles.game} />
                <Text style={styles.game}>식단월드컵</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

export default Home;

const styles = StyleSheet.create({
  Container: {
    backgroundColor: 'white',
    width: width,
    flex: 1,
  },
  Nav: {
    backgroundColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
  },
  user: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
  },
  profileImg: {
    width: 25,
    height: 25,
  },
  body1: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 4,
    borderWidth: 1,
    borderColor: 'black',
  },
  photo: {
    fontSize: 100,
    fontWeight: 'bold',
  },
  body2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 2,
  },
  body3: {
    width: '50%',
    // flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
  },
  record: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  body4: {
    width: '50%',
    // flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'blue',
    padding: 0,
  },
  communityBtn: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    backgroundColor: 'yellow',
    justifyContent: 'center',
    alignItems: 'center',
  },
  community: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  body5: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 2,
  },
  body6: {
    width: '50%',
    // flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'green',
  },
  rankBtn: {
    // flexDirection: 'row',
    width: '100%',
    height: '100%',
    backgroundColor: 'yellow',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ranking: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  body7: {
    width: '50%',
    // flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
  },
  game: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  btnContent: {
    alignItems: 'center',
  },
});
