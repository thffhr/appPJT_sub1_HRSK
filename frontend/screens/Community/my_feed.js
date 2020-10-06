import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  AsyncStorage,
  Dimensions,
  Modal,
  TouchableHighlight,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const {width, height} = Dimensions.get('screen');
const serverUrl = 'http://10.0.2.2:8080/';

export default class MyFeed extends Component {
  constructor(props) {
    super(props);

    this.state = {
      article: this.props.route.params.article,
      profileImage: null,
      modalData: '',
      modalVisible: false,
    };
  }
  onBack = () => {
    this.props.navigation.navigate('Community');
  };
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.navbar}>
          <Text style={styles.haru}>하루세끼</Text>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}>
          <View
            style={{
              width: '100%',
              height: height,
              backgroundColor: 'black',
              opacity: 0.5,
            }}></View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={{marginBottom: 10}}>레시피 내용</Text>
              {this.state.modalData
                .split('|')
                .filter((word) => word)
                .map((line, i) => {
                  return (
                    <Text>
                      {i + 1}. {line}
                    </Text>
                  );
                })}
              <TouchableHighlight
                style={{...styles.openButton, backgroundColor: '#2196F3'}}
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}>
                <Text style={styles.textStyle}>Hide Modal</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>

        <ScrollView>
          {/* <View style={styles.detailHeader}>
            <Icon
              name="arrow-back"
              onPress={this.onBack}
              style={styles.backBtn}></Icon>
          </View> */}
          <View style={styles.profileBox}>
            <View style={styles.imgBox}>
              {this.state.article.user.profileImage && (
                <Image
                  style={styles.profileImg}
                  source={{
                    uri:
                      `${serverUrl}gallery` +
                      this.state.article.user.profileImage,
                  }}
                />
              )}
              {!this.state.article.user.profileImage && (
                <Image
                  style={styles.profileImg}
                  source={{
                    uri:
                      'https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/profle-256.png',
                  }}
                />
              )}
              <Text
                style={{
                  fontSize: 20,
                  marginLeft: 5,
                }}>
                {this.state.article.user.username}
              </Text>
            </View>
            <View style={styles.cntBox}>
              <Text style={styles.cntContent}>게시글</Text>
              <Text style={styles.cntContent}>0</Text>
            </View>
            <View style={styles.cntBox}>
              <Text style={styles.cntContent}>팔로워</Text>
              <Text style={styles.cntContent}>0</Text>
            </View>
            <View style={styles.cntBox}>
              <Text style={styles.cntContent}>팔로잉</Text>
              <Text style={styles.cntContent}>0</Text>
            </View>
          </View>

          <View style={styles.article}>
            <View style={styles.writer}>
              {this.state.article.user.profileImage && (
                <Image
                  style={styles.writerImg}
                  source={{
                    uri:
                      `${serverUrl}gallery` +
                      this.state.article.user.profileImage,
                  }}
                />
              )}
              {!this.state.article.user.profileImage && (
                <Image
                  style={styles.writerImg}
                  source={{
                    uri:
                      'https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/profle-256.png',
                  }}
                />
              )}
              <Text
                style={{
                  marginLeft: 10,
                  fontSize: 20,
                  fontWeight: 'bold',
                }}>
                {this.state.article.user.username}
              </Text>
            </View>

            <Image
              style={styles.articleImg}
              source={{
                uri: `${serverUrl}gallery` + this.state.article.image,
              }}
            />

            <View style={styles.articleBtns}>
              <TouchableOpacity
                style={{marginRight: 10}}
                onPress={async () => {
                  const token = await AsyncStorage.getItem('auth-token');
                  fetch(`${serverUrl}articles/articleLikeBtn/`, {
                    method: 'POST',
                    body: JSON.stringify({articleId: this.state.article.id}),
                    headers: {
                      Authorization: `Token ${token}`,
                      'Content-Type': 'application/json',
                    },
                  })
                    .then((response) => response.json())
                    .then((response) => {
                      console.log(response);
                      const isliked = this.state.article.isliked;
                      const num_of_like = this.state.article.num_of_like;
                      if (response === 'like') {
                        this.setState({
                          article: {
                            ...this.state.article,
                            isliked: !isliked,
                            num_of_like: num_of_like + 1,
                          },
                        });
                      } else if (response === 'dislike') {
                        this.setState({
                          article: {
                            ...this.state.article,
                            isliked: !isliked,
                            num_of_like: num_of_like - 1,
                          },
                        });
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }}>
                {this.state.article.isliked && (
                  <Icon name="heart" style={{fontSize: 40, color: 'red'}} />
                )}
                {!this.state.article.isliked && (
                  <Icon name="heart-outline" style={{fontSize: 40}} />
                )}
              </TouchableOpacity>
              {this.state.article.canComment && (
                <TouchableOpacity
                  style={{marginRight: 10}}
                  onPress={() => {
                    this.props.navigation.push('Comment', {
                      articleId: this.state.article.id,
                    });
                  }}>
                  <Icon
                    name="chatbubble-ellipses-outline"
                    style={{fontSize: 40}}
                  />
                </TouchableOpacity>
              )}
              {this.state.article.recipe !== '' && (
                <TouchableOpacity
                  style={{marginRight: 10}}
                  onPress={() => {
                    this.setModalVisible(true, this.state.article.recipe);
                  }}>
                  <Icon name="list-circle" style={{fontSize: 40}} />
                </TouchableOpacity>
              )}
              {!this.state.article.recipe && (
                <TouchableOpacity
                  style={{marginRight: 10}}
                  onPress={() => {
                    alert('레시피가 없습니다');
                  }}>
                  <Icon name="list-circle-outline" style={{fontSize: 40}} />
                </TouchableOpacity>
              )}
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {this.state.article.num_of_like > 0 && (
                <Icon
                  name="heart"
                  style={{
                    fontSize: 20,
                    color: 'red',
                    marginRight: 5,
                  }}
                />
              )}
              {this.state.article.num_of_like === 0 && (
                <Icon
                  name="heart-outline"
                  style={{fontSize: 20, marginRight: 5}}
                />
              )}
              {this.state.article.num_of_like > 2 && (
                <Text style={styles.likeText}>
                  {article.user_1.username}외 {article.num_of_like - 1}
                  명이 좋아합니다.
                </Text>
              )}
              {this.state.article.num_of_like === 2 &&
                this.state.article.isliked && (
                  <Text style={styles.likeText}>
                    {this.state.article.user_1.username}님과 회원님이
                    좋아합니다.
                  </Text>
                )}
              {this.state.article.num_of_like === 2 &&
                !this.state.article.isliked && (
                  <Text style={styles.likeText}>
                    {this.state.article.user_1.username}님과{' '}
                    {this.state.article.user_2.username}님이 좋아합니다.
                  </Text>
                )}
              {this.state.article.num_of_like === 1 &&
                this.state.article.isliked && (
                  <Text style={styles.likeText}>회원님이 좋아합니다.</Text>
                )}
              {this.state.article.num_of_like === 1 &&
                !this.state.article.isliked && (
                  <Text style={styles.likeText}>
                    {this.state.article.user_1.username}님이 좋아합니다.
                  </Text>
                )}
              {this.state.article.num_of_like === 0 && (
                <Text style={styles.likeText}>
                  이 게시물에 첫 좋아요를 눌러주세요!
                </Text>
              )}
            </View>
            <Text style={styles.articleContent}>
              {this.state.article.content}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffbe6',
    width: '100%',
    flex: 1,
  },
  navbar: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fca652',
    elevation: 5,
  },
  haru: {
    fontSize: 30,
    color: '#FFFFFF',
    fontFamily: 'BMJUA',
    marginLeft: 15,
  },
  // detailHeader: {
  //   flexDirection: 'row',
  // },
  // backBtn: {
  //   fontSize: 30,
  // },

  // profileBox
  profileBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 20,
  },
  imgBox: {},
  profileImg: {
    borderRadius: 50,
    width: 50,
    height: 50,
  },
  cntBox: {},
  cntContent: {
    textAlign: 'center',
    fontSize: 20,
  },

  article: {
    flexDirection: 'column',
    width: '100%',
    marginVertical: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#232323',
  },
  writer: {
    marginLeft: '5%',
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  writerImg: {
    borderRadius: 50,
    width: 50,
    height: 50,
  },
  articleImg: {
    width: '100%',
    height: 400,
    marginBottom: 10,
  },
  articleBtns: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 10,
  },
  likeText: {
    marginBottom: 10,
    fontSize: 20,
    textAlign: 'center',
  },
  articleContent: {
    fontSize: 20,
    fontFamily: 'BMEULJROTTF',
  },
});