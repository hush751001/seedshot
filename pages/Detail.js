/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import RNFS from 'react-native-fs';

async function getPhotoFiles(folderName) {
  // 폴더 목록 확인
  try {
    const result = await RNFS.readDir(folderName);
    return result.filter((dir) => {
      return dir.isFile();
    });
  } catch (e) {
    console.error(e);
  }
  return [];
}

class Detail extends React.Component {
  state = {
    files: [],
    numColumns: 3,
  };

  async componentDidMount() {
    const {folderName} = this.props.route.params;
    const files = await getPhotoFiles(folderName);
    console.log(files);
    this.setState({
      files,
    });
  }

  handleClickItem(item) {
    console.log(item);
    // sub화면으로 이동
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
          <Image
            style={{width: '100%', height: '100%'}}
            source={{uri: 'file://' + item.path}}
          />
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
    const {files, numColumns} = this.state;
    return (
      <FlatList
        style={styles.container}
        data={this.formatRow(files, numColumns)}
        renderItem={this.renderItem}
        keyExtractor={(item) => item.path}
        numColumns={numColumns}
      />
    );
  }
}

//

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'lightgray',
    padding: 10,
    flex: 1,
  },
  item: {
    backgroundColor: '#fff',
    flex: 1,
    margin: 2,
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },
});

export default Detail;
