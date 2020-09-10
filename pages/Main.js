/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import RNFS from 'react-native-fs';
import {PermissionsAndroid, Platform} from 'react-native';
import {rootFolderPath} from '../App';
import Orientation from 'react-native-orientation';

async function hasAndroidPermission() {
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  const hasPermission = await PermissionsAndroid.check(permission);

  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission);
  return status === 'granted';
}

async function getPhotoFolders() {
  if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
    return;
  }
  // 폴더 목록 확인
  try {
    const result = await RNFS.readDir(rootFolderPath);
    return result.filter((dir) => {
      return dir.isDirectory();
    });
  } catch (e) {
    console.error(e);
  }
  return [];
}

class Main extends React.Component {
  state = {
    folders: [],
    modalVisible: false,
    modalFileName: '',
    modalSubFileName: '',
    numColumns: 3,
  };

  handleOpenModal = () => {
    this.setState({
      modalVisible: true,
    });
  };

  handleCloseModal = async (isPressedBackKey) => {
    if (isPressedBackKey !== true) {
      // 폴더 추가
      if (this.state.modalFileName && this.state.modalSubFileName) {
        console.log(`makeFodler ${rootFolderPath}/${this.state.modalFileName}`);
        await RNFS.mkdir(`${rootFolderPath}/${this.state.modalFileName}`);
        const folders = await getPhotoFolders();
        this.setState({
          folders,
        });

        this.props.navigation.navigate('TakePicture', {
          folderName: this.state.modalFileName,
          subFileName: this.state.modalSubFileName,
          startNumber: 1,
        });
      }
    }
    this.setState({
      modalVisible: false,
    });
  };

  handleModalFileNameChange = (text) => {
    this.setState({
      modalFileName: text,
    });
  };

  handleModalSubFileNameChange = (text) => {
    this.setState({
      modalSubFileName: text,
    });
  };

  async componentDidMount() {
    const {navigation} = this.props;
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableHighlight
            style={styles.openButton}
            onPress={this.handleOpenModal}>
            <Text>➕</Text>
          </TouchableHighlight>
        </View>
      ),
    });

    const unsubscribe = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });

    const folders = await getPhotoFolders();
    console.log(folders);
    this.setState({
      folders,
    });
  }

  handleClickItem(item) {
    this.props.navigation.navigate('Detail', {
      folderName: item.path,
    });
  }

  renderItem = ({item}) => {
    if (item.empty === true) {
      return <View style={[styles.item, styles.itemInvisible]} />;
    }
    return (
      <TouchableWithoutFeedback onPress={() => this.handleClickItem(item)}>
        <View
          style={[
            styles.item,
            {height: Dimensions.get('window').width / this.state.numColumns},
          ]}
          key={item.path}>
          <Text>{item.name}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  formatRow = (data, numColumns) => {
    const numberOfFullRows = Math.floor(data.length / numColumns);
    let numberOfElementsLastRow = data.length - numberOfFullRows * numColumns;
    while (
      numberOfElementsLastRow !== numColumns &&
      numberOfElementsLastRow !== 0
    ) {
      data.push({key: `blank-${numberOfElementsLastRow}`, empty: true});
      numberOfElementsLastRow++;
    }
    return data;
  };

  render() {
    const {folders, modalVisible, numColumns} = this.state;
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <FlatList
          style={{
            backgroundColor: 'lightgray',
            width: '100%',
            padding: 10,
          }}
          data={this.formatRow(folders, numColumns)}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.path}
          numColumns={numColumns}
        />
        <View style={styles.btnTake}>
          <TouchableOpacity onPress={this.handleOpenModal}>
            <Text style={styles.btnTakeText}>사진 찍기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centeredView}>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              this.handleCloseModal(true);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.field}>
                  <Text style={styles.modalText}>파일명</Text>
                  <TextInput
                    style={styles.textinput}
                    value={this.state.modalFileName}
                    onChangeText={this.handleModalFileNameChange}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.modalText}>하위명</Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    maxLength={4}
                    style={styles.textinput}
                    value={this.state.modalSubFileName}
                    onChangeText={this.handleModalSubFileNameChange}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.modalText}>자동명</Text>
                  <TextInput style={styles.textinput} />
                </View>

                <TouchableHighlight
                  style={{...styles.openButton, backgroundColor: '#2196F3'}}
                  onPress={this.handleCloseModal}>
                  <Text style={styles.textStyle}>사진찍기 시작</Text>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    );
  }
}

//

const styles = StyleSheet.create({
  headerButtons: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  btnTake: {
    position: 'absolute',
    bottom: 60,
    opacity: 0.3,
    backgroundColor: 'red',
    borderRadius: 30,
  },
  btnTakeText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 20,
  },
  item: {
    backgroundColor: '#ff3',
    flex: 1,
    margin: 2,
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
  modalText: {
    textAlignVertical: 'center',
    flexBasis: 60,
  },
  textinput: {
    borderColor: 'black',
    borderWidth: 1,
    flex: 1,
    marginLeft: 10,
  },
  field: {
    flexDirection: 'row',
    marginBottom: 10,
  },
});

export default Main;
