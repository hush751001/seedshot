/* eslint-disable react/no-did-mount-set-state */
/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import Marker from 'react-native-image-marker';
import RNFS from 'react-native-fs';

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

export default class CameraScreen extends React.Component {
  state = {
    incrementNo: 1,
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    autoFocusPoint: {
      normalized: {x: 0.5, y: 0.5}, // normalized values required for autoFocusPointOfInterest
      drawRectPosition: {
        x: Dimensions.get('window').width * 0.5 - 32,
        y: Dimensions.get('window').height * 0.5 - 32,
      },
    },
    depth: 0,
    type: 'back',
    whiteBalance: 'auto',
    ratio: '16:9',
  };

  componentDidMount() {
    this.setState({
      incrementNo: this.props.route.params.startNumber,
    });
  }

  toggleFacing() {
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back',
    });
  }

  toggleFlash() {
    this.setState({
      flash: flashModeOrder[this.state.flash],
    });
  }

  toggleWB() {
    this.setState({
      whiteBalance: wbOrder[this.state.whiteBalance],
    });
  }

  touchToFocus(event) {
    const {pageX, pageY} = event.nativeEvent;
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const isPortrait = screenHeight > screenWidth;

    let x = pageX / screenWidth;
    let y = pageY / screenHeight;
    // Coordinate transform for portrait. See autoFocusPointOfInterest in docs for more info
    if (isPortrait) {
      x = pageY / screenHeight;
      y = -(pageX / screenWidth) + 1;
    }

    this.setState({
      autoFocusPoint: {
        normalized: {x, y},
        drawRectPosition: {x: pageX, y: pageY},
      },
    });
  }

  zoomOut() {
    this.setState({
      zoom: Math.max(this.state.zoom - 1, 0),
    });
  }

  zoomIn() {
    this.setState({
      zoom: Math.min(this.state.zoom + 1, 10),
    });
  }

  takePicture = async function () {
    if (this.camera) {
      const data = await this.camera.takePictureAsync({
        exif: true,
      });
      console.warn('takePicture ', data);
      this.savePicture(data.uri, data.exif);
    }
  };

  getCurFileName() {
    const {folderName, subFileName} = this.props.route.params;
    const strIncrementNo = String(this.state.incrementNo).padStart(4, '0');
    return `${folderName}-${subFileName}-${strIncrementNo}`;
  }

  async savePicture(uri, exif) {
    // TODO: 폴더명는 현재 선택된 앨범명으로 처리, 파일명도 자동증가 처리
    const {folderName} = this.props.route.params;
    const folderPath = `${RNFS.ExternalStorageDirectoryPath}/SeedShot/${folderName}`;

    const todayDate = new Date();
    const todayYYYYMMDD =
      todayDate.getFullYear() +
      String(todayDate.getMonth() + 1).padStart(2, '0') +
      String(todayDate.getDate()).padStart(2, '0');
    const fileName = this.getCurFileName();
    const res = await Marker.markText({
      src: uri,
      text: `${fileName}    ${todayYYYYMMDD}`,
      X: 0,
      Y: 0,
      color: '#fff',
      fontSize: 80,
      textBackgroundStyle: {
        type: 'stretchX',
        paddingX: 20,
        paddingY: 20,
        color: '#000',
      },
      scale: 1,
      quality: 100,
    });

    console.log(res);

    await RNFS.mkdir(folderPath);
    RNFS.moveFile(res, `${folderPath}/${fileName}`);

    this.setState({
      incrementNo: this.state.incrementNo + 1,
    });
  }

  renderCamera() {
    const drawFocusRingPosition = {
      top: this.state.autoFocusPoint.drawRectPosition.y - 32,
      left: this.state.autoFocusPoint.drawRectPosition.x - 32,
    };
    return (
      <RNCamera
        ref={(ref) => {
          this.camera = ref;
        }}
        style={{flex: 1, justifyContent: 'space-between'}}
        type={this.state.type}
        flashMode={this.state.flash}
        autoFocus={this.state.autoFocus}
        autoFocusPointOfInterest={this.state.autoFocusPoint.normalized}
        zoom={this.state.zoom / 10}
        whiteBalance={this.state.whiteBalance}
        ratio={this.state.ratio}
        focusDepth={this.state.depth}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}>
        <View style={StyleSheet.absoluteFill}>
          <View style={[styles.autoFocusBox, drawFocusRingPosition]} />
          <TouchableWithoutFeedback onPress={this.touchToFocus.bind(this)}>
            <View style={{flex: 1}} />
          </TouchableWithoutFeedback>
        </View>
        <View
          style={{
            flex: 0.5,
            height: 72,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={this.toggleFacing.bind(this)}>
            <Text style={styles.flipText}> FLIP </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={this.toggleFlash.bind(this)}>
            <Text style={styles.flipText}> FLASH: {this.state.flash} </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={this.toggleWB.bind(this)}>
            <Text style={styles.flipText}> WB: {this.state.whiteBalance} </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flipButton]}
            onPress={this.zoomIn.bind(this)}>
            <Text style={styles.flipText}> + </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flipButton]}
            onPress={this.zoomOut.bind(this)}>
            <Text style={styles.flipText}> - </Text>
          </TouchableOpacity>
        </View>
        <View style={{bottom: 0}}>
          <Text style={[styles.flipText, styles.zoomText]}>
            {this.getCurFileName()}
          </Text>
          <View
            style={{
              height: 120,
              marginBottom: 40,
              backgroundColor: 'transparent',
              flexDirection: 'row',
              alignSelf: 'center',
            }}>
            <TouchableOpacity
              style={[styles.flipButton, styles.picButton]}
              onPress={this.takePicture.bind(this)}>
              <Text style={styles.flipText}></Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNCamera>
    );
  }

  render() {
    return <View style={styles.container}>{this.renderCamera()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#000',
  },
  flipButton: {
    flex: 1,
    height: 80,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoFocusBox: {
    position: 'absolute',
    height: 64,
    width: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    opacity: 0.4,
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  zoomText: {
    position: 'absolute',
    bottom: 10,
    zIndex: 2,
    width: '100%',
    fontSize: 20,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
  },
  picButton: {
    flex: 0.2,
    backgroundColor: '#faa',
    opacity: 0.5,
    borderRadius: 40,
  },
});
