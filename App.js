import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
  Image,
  Button,
  SafeAreaView,
  FlatList,
  ScrollView,
  TextInput,
  TouchableHighlight,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Entypo, MaterialIcons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import moment from 'moment';

//colors:
//#0b5688 blue
// #ffffff white
//#f8d062 yellow
//#f3944e orange
//#6ac6a5 green

/*
<SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} />
        <Button title="Share" onPress={sharePic} />
        {hasMediaLibraryPermission ? <Button title="Save" onPress={savePhoto} /> : undefined}
        <Button title="Discard" onPress={() => setPhoto(undefined)} />
      </SafeAreaView>
*/




export default function App() {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const [screenNumber, setScreenNumber] = useState(1);
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();
  const [initialLat, setInitialLat] = useState(37.0902);
  const [initialLon, setInitialLon] = useState(-95.7129);
  const [initialLatDelta, setInitialLatDelta] = useState(30);
  const [initialLonDelta, setInitialLonDelta] = useState(60.0099);
  const [followUserLocationBoolean, setFollowUserLocationBoolean] = useState(true);
  const [coordinates, setCoordinates] = useState([]);
  const [navigatorColor1, setNavigatorColor1] = useState('white');
  const [navigatorColor2, setNavigatorColor2] = useState('#949494');
  const [navigatorColor3, setNavigatorColor3] = useState('#949494');
  const [longitude, setLongitude] = useState();
  const [previewScreen, setPreviewScreen] = useState();
  const [latitude, setLatitude] = useState();
  const [itemId, setItemId] = useState(1);
  const [address, setAddress] = useState();
  const [mount, setMount] = useState(false);
  const [description, setDescription] = useState("None");
  const [storedImages, setStoredImages] = useState([])
  
  const [data, setData] = useState([
    
  ])
  
  var GEOURL1 = 'http://api.positionstack.com/v1/reverse?access_key=(APIKEY)&query=';

  useEffect(() => {
    if (mount && latitude != null && longitude != null){
      var GEOURL = GEOURL1 + latitude + "," + longitude;
      var wrong = false;
      fetch(GEOURL)
      .then(response => response.json())
      .then(dataGeo => {
        setAddress(dataGeo.data[0].label);
      })
      .catch (() => {
        if (wrong == false){
          wrong = true;
          showAlert();
        }
      })
      
      const showAlert = () => {
        if(wrong){
          Alert.alert(
            "Location Error",
            "Unable to retrieve data"
          )
        }
      }
    }
    else{
      setMount(true);
    }
  }, [photo])

  function previewFunction(x){
    setPreviewScreen(x);
    setScreenNumber(3.5)
  }

  function changeScreens(x){
    if (x == 1){
      setScreenNumber(1);
      setNavigatorColor1('white')
      setNavigatorColor2('#949494')
      setNavigatorColor3('#949494')
    }
    if (x == 2){
      setScreenNumber(2);
      setNavigatorColor1('#949494')
      setNavigatorColor2('white')
      setNavigatorColor3('#949494')
    }
    if (x == 3){
      setScreenNumber(3);
      setNavigatorColor1('#949494')
      setNavigatorColor2('#949494')
      setNavigatorColor3('white')
    }
  }


  function setLocation(e) {
    setLatitude(e.nativeEvent.coordinate.latitude);
    setLongitude(e.nativeEvent.coordinate.longitude);
    var c = e.nativeEvent.coordinate;
    var temp = [];
    for (let i = 0; i < coordinates.length; i++) {
      temp.push(coordinates[i]);
    }
    temp.push({
      latitude: c.latitude,
      longitude: c.longitude,
    });
    setCoordinates(temp);
  }

  function changeDescription(x){
    if (x.length > 100){
      x = x.substring(0, 175);
    }
    setDescription(x);
  }
  
  function changeMapView(region) {
    setInitialLat(region.latitude);
    setInitialLon(region.longitude);
    setInitialLatDelta(region.latitudeDelta);
    setInitialLonDelta(region.longitudeDelta);
  }

  function retakePhoto (){
    let temp = data;
    temp.pop();
    setData(temp);
    setPhoto(undefined);
    setDescription("None")
  }

  function deleteReport(x){
    let temp = data;
    temp.splice(x , 1);
    setData(temp);
    changeScreens(1);
  }

  let cameraRef = useRef();

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === undefined) {
    return <Text style={{top: 300, left: 10}}>Requesting permissions...</Text>
  } else if (!hasCameraPermission) {
    return <Text style={{top: 300, left: 10}}>Permission for camera not granted. Please change this in settings.</Text>
  }

  const takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
    let temp = storedImages;
    temp.push(newPhoto.uri);
    setStoredImages(temp);
    var adjust = {
      image: newPhoto.uri,
      longitude: longitude,
      latitude: latitude,
      key: itemId.toString(),
      address: address,
      description: "",
      time: ""
    }
    setItemId(itemId + 1);
    let adding = data;
    adding.push(adjust)
    setData(adding);
  };

  function addPhoto(){
    var date = moment()
      .utcOffset('-04:00')
      .format('YYYY-MM-DD hh:mm a');
    var temp = data;
    temp[temp.length - 1].description = description;
    temp[temp.length - 1].address = address;
    temp[temp.length - 1].time = date;
    setData(temp)
    changeScreens(1);
    setPhoto(undefined)
    setDescription("None")
  }

  const NavigatorCode = () => {
    return(
      <View style={{flex: 0.12}}>
        <View style={{flex: 1, flexDirection: 'row', backgroundColor: 'black'}}>
          <View style={{flex: 1}}>
            <TouchableOpacity
            onPress={() => changeScreens(1)}
            style={{flex: 1, alignSelf: 'center'}}
            >
              <Entypo name="map" size={40} color={navigatorColor1} />
            </TouchableOpacity>
            <Text style={{textAlign: 'center', bottom: '25%', fontWeight: 'bold', color: navigatorColor1}}>
              Map
            </Text>
          </View>
          <View style={{flex: 1}}>
            <TouchableOpacity
            onPress={() => changeScreens(2)}
            style={{flex: 1, alignSelf: 'center'}}
            >
              <MaterialIcons name="report" size={40} color={navigatorColor2} />
            </TouchableOpacity>
            <Text style={{textAlign: 'center', bottom: '25%', fontWeight: 'bold', color: navigatorColor2}}>
              Report
            </Text>
          </View>
          <View style={{flex: 1}}>
            <TouchableOpacity
            onPress={() => changeScreens(3)}
            style={{flex: 1, alignSelf: 'center'}}
            >
              <AntDesign name="calendar" size={40} color={navigatorColor3} />
            </TouchableOpacity>
            <Text style={{textAlign: 'center', bottom: '25%', fontWeight: 'bold', color: navigatorColor3}}>
              History
            </Text>
          </View>
        </View>
      </View>
    )
  }



  //Map Screen
  if (screenNumber == 1){
    return (
      <View style={{flex: 1}}>
        <View style={styles.container}>
          <MapView
            style={styles.map}
            mapType="hybrid"
            showsUserLocation
            //followsUserLocation={followUserLocationBoolean}
            showsPointsOfInterest
            showsCompass
            onRegionChange={(region) => changeMapView(region)}
            onUserLocationChange={(e) => setLocation(e)}
            initialRegion={{
              latitude: initialLat,
              longitude: initialLon,
              latitudeDelta: initialLatDelta,
              longitudeDelta: initialLonDelta,
            }}
          >
            {data.map((marker, index) => (
              <Marker 
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              key={index}
              title={marker.address}
              >
                <View 
                  style={{height: 110, width: 55, backgroundColor: 'black', alignSelf: 'center', justifyContent: 'center', alignItems: 'center'}}
                >
                  <TouchableOpacity 
                    style={{flex: 1}}
                  >
                    <Image source={{ uri: marker.image }} style={{height: 105, width: 50, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', top: 2.5}} resizeMode={'fit'}/>
                  </TouchableOpacity>
                </View>
              </Marker>
            ))}
          </MapView>
        </View>
        <NavigatorCode/>
      </View>
    );
  }




  //Camera Screen
  else if (screenNumber == 2){
    if (photo) {
      let sharePic = () => {
        shareAsync(photo.uri).then(() => {
          setPhoto(undefined);
        });
      };
  
      let savePhoto = () => {
        MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
          setPhoto(undefined);
        });
      };
      
      //Report Details Screen
      return (
        <View style={{flex: 1, backgroundColor: 'black'}}>
          <SafeAreaView style={{flex: 1}}>
            <View style={{flex: 0.7, backgroundColor: 'black'}}>
              <TouchableOpacity
              onPress={() => retakePhoto()}
              style={{flex: 1, alignSelf: 'center'}}
              >
                <Text style={{
                  color: 'white', 
                  alignSelf: 'center', 
                  textAlign: 'center', 
                  fontSize: 30, 
                  fontWeight: 'bold', 
                  textShadowColor: 'white',
                  textShadowRadius: 5
                }}>
                  Retake
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{flex: 4}}>
              <View style={{alignSelf: 'center', width: '45%', height: '100%', backgroundColor: 'white', borderRadius: 20}}>
                <View style={{alignSelf: 'center', width: '95%', height: '97%', backgroundColor: 'black', borderRadius: 20, top: '1.5%'}}>
                  <TouchableOpacity
                    style={{flex: 1, alignSelf: 'center', right: '45%', top: '5%'}}
                    onPress={() => setScreenNumber(2.5)}
                  >
                    <ImageBackground
                      style={{height: '95%', width: '95%'}}
                      resizeMode={'contain'}
                      source={{ uri: storedImages[storedImages.length - 1] }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
                
            </View>
            <View style={{flex: 0.7}}>
              <TextInput 
                style={styles.input}
                placeholder="Enter Description..."
                onChangeText={(x) => changeDescription(x)}
                keyboardType="default"
              />
            </View>
            <View style={{flex: 2, backgroundColor: 'white', borderRadius: 20}}>
              <View style={{width: '98.5%', height: '97%', alignSelf: 'center', backgroundColor: 'black', borderRadius: 20, top: '1.5%'}}>
                <Text style={{
                  top: '10%',
                  color: 'white', 
                  alignSelf: 'center', 
                  textAlign: 'center', 
                  fontSize: 15, 
                  fontWeight: 'bold', 
                  textShadowColor: 'white',
                  textShadowRadius: 3
                }}>
                  Longitude: {longitude}
               </Text>
               <Text  style={{
                  color: 'white', 
                  top: '10%',
                  alignSelf: 'center', 
                  textAlign: 'center', 
                  fontSize: 15, 
                  fontWeight: 'bold', 
                  textShadowColor: 'white',
                  textShadowRadius: 3
                }}>
                  Latitude: {latitude}
               </Text>
               <Text  style={{
                  color: 'white', 
                  top: '10%',
                  alignSelf: 'center', 
                  textAlign: 'center', 
                  fontSize: 15, 
                  fontWeight: 'bold', 
                  textShadowColor: 'white',
                  textShadowRadius: 3
                }}>
                  Address: {address}
               </Text>
               <Text  style={{
                  color: 'white', 
                  top: '10%',
                  alignSelf: 'center', 
                  textAlign: 'center', 
                  fontSize: 15, 
                  fontWeight: 'bold', 
                  textShadowColor: 'white',
                  textShadowRadius: 3
                }}>
                Description: {description}
               </Text>
              </View>
               
            </View>
            <View style={{flex: 1}}>
              <TouchableOpacity
              onPress={() => addPhoto(photo)}
              style={{justifyContent: 'center', alignItems: 'center', alignSelf: 'center', width: '40%', height: '80%'}}
              >
                <Text style={{textAlign: 'center', fontSize: 30, fontWeight: 'bold', color: 'white', textShadowColor: 'white', textShadowRadius: 5}}>Submit</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          <NavigatorCode/>
        </View>
        
      );
    }
    

    //Image taking (camera) screen
    return (
      <Camera style={styles.container} ref={cameraRef}>
        <View style={{ flex: 1, alignSelf: 'center' }}>
          <TouchableOpacity
          onPress={() => changeScreens(1)}
          style={{position: 'absolute', height: '7%', width: '35%', top: '7%', backgroundColor: '#3b3832', alignSelf: 'center', borderRadius: 20, borderWidth: 2, borderColor: 'black', opacity: 0.8}}
          >
            <Text style={{fontWeight: 'bold', fontSize: 30, color: 'white', textAlign: 'center', top: '16.5%'}}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ alignSelf: 'center', justifyContent:'center', top: '86.69420%', backgroundColor: 'white', height: 80, width: 80, borderRadius: 160 }}
          >
            <View
            style={{ alignSelf: 'center', justifyContent:'center', backgroundColor: 'black', height: 75, width: 75, borderRadius: 150 }}
            >
              <TouchableOpacity
              style={{ alignSelf: 'center', justifyContent:'center', backgroundColor: 'white', height: 70, width: 70, borderRadius: 140 }}
              onPress={takePic}
              />
            </View>
          </TouchableOpacity>
        </View>
        <StatusBar style="auto" />
      </Camera>
    );
  }



  //Image Preview Screen
  else if (screenNumber == 2.5){
    return(
      <View style={{flex: 1}}>
        <ImageBackground
        style={{flex: 1}}
        resizeMode={'contain'}
        source={{ uri: storedImages[storedImages.length - 1] }}
        />
        <TouchableOpacity
        onPress={() => setScreenNumber(2)}
        style={{position: 'absolute', height: '7%', width: '35%', top: '7%'}}
        >
          <Text style={{
          color: 'white', 
          alignSelf: 'center', 
          textAlign: 'center', 
          fontSize: 30, 
          fontWeight: 'bold', 
          textShadowColor: 'white',
          textShadowRadius: 5
        }}>
            {'← Back'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  
  //History Screen
  else if (screenNumber == 3){
    return(
      <View style={{flex: 1, width: '100%', backgroundColor: 'black'}}>
        <SafeAreaView style={{flex: 1, width: '100%'}}>
          <Text 
          style={{
            color: 'white', 
            alignSelf: 'center', 
            textAlign: 'center', 
            fontSize: 30, 
            fontWeight: 'bold', 
            textShadowColor: 'white',
            textShadowRadius: 5
          }}
          >
            History
          </Text>
          <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View
              style={{
              width: '90%',
              height: 300,
              alignSelf: 'center',
              marginVertical: 20,
              borderRadius: 20,
              borderColor: 'white',
              borderWidth: 4,
            }}
            >
              <View style={{flex: 1}}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                  <TouchableOpacity style={{flex: 1.5, paddingVertical: 5}} onPress={() => previewFunction(item.image)}>
                    <ImageBackground
                    style={{flex: 1, margin: '3%'}}
                    imageStyle={{ borderRadius: 20 }}
                    resizeMode={'fit'}
                    source={{ uri: item.image }}
                    />
                  </TouchableOpacity>
                  <View style={{flex: 2, paddingVertical: '3%'}}>
                    <View style={{flex: 1, flexDirection: 'column'}}>
                      <View style={{flex: 1}}> 
                        <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Date: {item.time}</Text>
                      </View>
                      <View style={{flex: 1}}> 
                        <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Lat: {item.latitude}</Text>
                      </View>
                      <View style={{flex: 1}}> 
                        <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Lon: {item.longitude}</Text>
                      </View>
                      <View style={{flex: 4}}> 
                      <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Location: {'\n'}{item.address}</Text>
                      </View>
                      <View style={{flex: 8}}> 
                        <Text style={{fontWeight: 'bold', fontSize: 13, color: 'white'}}>Description: {item.description}</Text>
                      </View>
                      <View style={{flex: 1}}>
                        <TouchableOpacity 
                          style={{width: '10%', left: '85%'}} 
                          onPress={() => deleteReport(item)}
                        >
                          <FontAwesome5 name="trash" size={24} color="red" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
          />
        </SafeAreaView>
        <NavigatorCode/>
      </View>
    )
  }


  else if (screenNumber == 3.5){
    return(
      <View style={{flex: 1}}>
        <ImageBackground
        style={{flex: 1}}
        resizeMode={'contain'}
        source={{ uri: previewScreen }}
        />
        <TouchableOpacity
        onPress={() => setScreenNumber(3)}
        style={{position: 'absolute', height: '7%', width: '35%', top: '7%'}}
        >
          <Text style={{
          color: 'white', 
          alignSelf: 'center', 
          textAlign: 'center', 
          fontSize: 30, 
          fontWeight: 'bold', 
          textShadowColor: 'white',
          textShadowRadius: 5
        }}>
            {'← Back'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  input: {
    height: 40,
    marginVertical: '2.5%',
    borderWidth: 1,
    width: '95%',
    alignSelf: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 15
  },
});
