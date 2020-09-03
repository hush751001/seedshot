
import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import RNFS from 'react-native-fs';
import { rootFolderPath } from '../App';

async function getPhotoFolders() {
  // 폴더 목록 확인
  try {
    const result = await RNFS.readDir(rootFolderPath);
    return result.filter((dir) => {
      return dir.isDirectory()
    });
  } catch( e ) {
    console.error( e );
  }
  return [];
}

class Main extends React.Component {
  state = {
    folders: [],
  };

  async componentDidMount() {
    const { navigation } = this.props;
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity style={{margin: 10}} onPress={()=>{alert("you clicked me")}}>
            <Text>➕</Text>
          </TouchableOpacity>
        </View>
      ),
    });

    const folders = await getPhotoFolders();
    this.setState({
      folders
    });
  }

  render() {
    const { folders } = this.state;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ScrollView style={{backgroundColor: 'yellow', width: '100%'}}>
          {
            folders.map((folder) => {
              return (
                <View style={styles.folderItem}>
                  <Text>{folder.name}</Text>
                </View>
              );
            })
          }
        </ScrollView>
        <View style={{position: 'absolute', bottom: 0, height: 100, opacity: 0.3}}>
          <TouchableOpacity style={styles.btnTake} onPress={() => navigation.navigate('TakePicture') }>
            <Text style={styles.btnTakeText}>사진 찍기</Text>
          </TouchableOpacity>
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
    marginRight: 10
  },
  btnTake: {
    backgroundColor: 'red',
  },
  btnTakeText: {
    width: 100,
    height: 50,
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  folderItem: {
    backgroundColor:'red',
    padding: 10,
    borderBottomColor: 'black',
    borderBottomWidth: 2,
  }
});

export default Main;
