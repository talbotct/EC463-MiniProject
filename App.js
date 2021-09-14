import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, Button } from 'react-native';
import { RNCamera } from 'react-native-camera';
import axios from 'react-native-axios';
import { ListItem, List } from 'react-native-elements';

export default class App extends React.Component {

  state = {
    nutritionInfo: '',
    loading: false,
    query: '',
    barcodes: [],
    foods: [],
    data: '',
    cameraOn: false
  };

  barcodeRecognized = ({ barcodes }) => {
    barcodes.forEach(barcode => console.log(barcode.data))
    this.setState({ barcodes })
  }

  renderBarcodes = () => (
    <View>{this.state.barcodes.map(this.renderBarcode)}</View>
  )

  renderHomePage () {
    return (
      <View style={{
        justifyContent: "center",
        alignItems: "center", 
        }}>
        <Text style={styles.title}>MyRecipe</Text>
        <TextInput style = {styles.search} 
          onChangeText={this.handleInputTextChange} 
          value={this.state.query}
          placeholder="Enter a meal or ingredient"
        />
        <Button 
        onPress = {() => this.setState({ cameraOn: true })}
        title = "Scan Barcode"
        ></Button>
        <FlatList 
          data={this.state.foods}
          renderItem={this.renderItem}
          keyExtractor={item => item.fdcID}
        />
        
      </View>
    );
  }

  renderItem = ({ item }) => (
  <ListItem bottomDivider>
    <Text>{item.description}</Text>
  </ListItem>
  )

  renderCamera() {
    return (
      <View style={styles.container}>
        <RNCamera
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          captureAudio = {false}
          ref={ref => {
            this.camera = ref
          }}
          style={styles.scanner}
          onGoogleVisionBarcodesDetected={this.barcodeRecognized}>
          {this.renderBarcodes}
        </RNCamera>
      </View>
    )
  }
  
  renderBarcode = ({ data }) =>
    Alert.alert(
      'Scanned Data',
      data,
      [
        {
          text: 'Okay',
          onPress: () => console.log('Okay Pressed'),
          style: 'cancel'
        }
      ],
      { cancelable: false }
    )

  search = async (val) => {
    this.setState({ loading: true });
    try{
      const res = await axios(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=fZ4u39zBJOhv0a2FK1EY8sGRBaYm7R0mYa8JSkl1&query=${val}`
      );  
      var nutritionInfo = await res.data.foods[0].description;
      var foods = await res.data.foods;
      var data = await res.data;

      this.setState({ nutritionInfo, foods, loading: true });   
     
      console.log(this.state.query)
      if (this.state.query === ''){
        this.setState({ data: '' })
        console.log(data);
      }
    }
    catch{
      this.setState({ nutritionInfo: '', foods: [] })
    }
  };

  handleInputTextChange = (newText) => {
    this.search(newText);
    this.setState({ query: newText })
  }

  get renderNutritionInfo() {
    console.log( this.state.data.totalHits );
    let nutritionInfo = <Text>No Information Found</Text>;
  
    if (this.state.nutritionInfo) {
      nutritionInfo = <Text>{this.state.nutritionInfo}</Text> ;
    }

    return nutritionInfo;
  } 

  render() {
    if (!this.state.cameraOn){
      return this.renderHomePage();
    }
    else {
      return this.renderCamera();
    }
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 60,
    color: "#05CDE4",
  },
  search: {
    height: 100,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  scanner: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
})