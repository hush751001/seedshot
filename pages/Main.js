import React from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import RNFS from 'react-native-fs';
import {PermissionsAndroid, Platform} from 'react-native';
import {rootFolderPath} from '../App';

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
  };

  handleOpenModal = () => {
    this.setState({
      modalVisible: true
    });
  };

  handleCloseModal = async (isPressedBackKey) => {
    if (isPressedBackKey !== true) {
      // 폴더 추가
      if (this.state.modalFileName) {
        console.log(`makeFodler ${rootFolderPath}/${this.state.modalFileName}`);
        await RNFS.mkdir(`${rootFolderPath}/${this.state.modalFileName}`);
        const folders = await getPhotoFolders();
        this.setState({
          folders,
        });

        this.props.navigation.navigate('TakePicture', {
          folderName: this.state.modalFileName,
        });
      }
    }
    this.setState({
      modalVisible: false
    });
  };

  handleModalFileNameChange = (text) => {
    this.setState({
      modalFileName: text
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

    const folders = await getPhotoFolders();
    console.log(folders);
    this.setState({
      folders,
    });
  }

  render() {
    const {folders,modalVisible} = this.state;
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ScrollView style={{backgroundColor: 'yellow', width: '100%'}}>
          {folders.map((folder) => {
            return (
              <View style={styles.folderItem} key={folder.path}>
                <Text>{folder.name}</Text>
              </View>
            );
          })}
        </ScrollView>
        <View
          style={{position: 'absolute', bottom: 0, height: 100, opacity: 0.3}}>
          <TouchableOpacity
            style={styles.btnTake}
            onPress={this.handleOpenModal}>
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
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.field}>
                  <Text style={styles.modalText}>파일명</Text>
                  <TextInput style={styles.textinput} value={this.state.modalFileName} onChangeText={this.handleModalFileNameChange} />
                </View>
                <View style={styles.field}>
                  <Text style={styles.modalText}>하위명</Text>
                  <TextInput style={styles.textinput}></TextInput>
                </View>
                <View style={styles.field}>
                  <Text style={styles.modalText}>자동명</Text>
                  <TextInput style={styles.textinput}></TextInput>
                </View>

                <TouchableHighlight
                  style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                  onPress={this.handleCloseModal}
                >
                  <Text style={styles.textStyle}>추가</Text>
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
    backgroundColor: 'red',
  },
  btnTakeText: {
    width: 100,
    height: 50,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  folderItem: {
    backgroundColor: 'red',
    padding: 10,
    borderBottomColor: 'black',
    borderBottomWidth: 2,
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
