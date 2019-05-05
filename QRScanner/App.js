/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform, StyleSheet, Text, View, TouchableOpacity,
  Linking, AppRegistry
} from 'react-native';
import { Button } from 'react-native';
import QRCode from 'react-native-qrcode';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Dialog, { DialogContent } from 'react-native-popup-dialog';
import { Dimensions } from 'react-native'
import { List, ListItem } from 'react-native-elements'
import { FlatList } from 'react-native';


type Props = {};
console.disableYellowBox = true;

export default class App extends Component<Props> {
  state = {
    visible: false,
    data: "",
    title: "",
    qrvis: false,
    isHidden: 0,
    list: [{ key: "Example Data", title: "<-Example->" }],
  }


  onSuccess(e) {
    let titleT = "";
    let dataT = "";
    this.setState({ isHidden: 0 });

      if (validURL(e.data)) {
        Linking
          .openURL(e.data)
          .catch(err =>
            console.log(err)

          );
      } else if (e.data.includes("END:VCARD")) {
        var arrayOfInfo = parseCard(e.data);

        titleT = "Contact Card";
        dataT = arrayOfInfo;

        this.setState({ data: arrayOfInfo });
        this.setState({ title: "Contact Card" });

        this.state.list.push(({ key: dataT, title: titleT }));

      } else if (e.data.includes("MATMSG")) {
        var arrayOfInfo1 = parseEmail(e.data);

        titleT = "E-mail";
        dataT = "Email: " + arrayOfInfo1[0] + "\nSubject: " + arrayOfInfo1[1] + "\nBody: " + arrayOfInfo1[2];

        this.setState({ data: dataT });
        this.setState({ title: titleT });
        
      
        this.state.list.push(({ key: dataT, title: titleT }));

    } else if (e.data.includes("SMSTO")) {
        var arrayOfInfo2 = parseSMS(e.data);

        titleT = "SMS";
        dataT = arrayOfInfo2[0] + " -> " + arrayOfInfo2[1];

        this.setState({ data: dataT });
        this.setState({ title: titleT });
        
        this.state.list.push(({ key: dataT, title: titleT }));

    } else {

        titleT = "String";
        dataT = e.data;

        this.setState({ data: e.data})
        this.setState({ title: "String" })
        
        this.state.list.push(({ key: dataT, title: titleT }));

      }
      this.setState({ visible: true });

    }
    
    render() {
    let scanner;
    const startScan = () => {
      if (scanner) {
        scanner.reactivate(true);
        this.setState({ qrvis: true });
        this.setState({ isHidden: 300 });

      }
    };
    return (

      <View style={styles.MainContainer}>
        <View height={this.state.isHidden}>
          <QRCodeScanner
            onRead={this.onSuccess.bind(this)}
            ref={(node) => { scanner = node }}
            reactivate={false}
            vibrate={this.state.qrvis}
          />
        </View>

        <Dialog
          dialogTitle={<View style={{ backgroundColor: '#2196f3' }}><Text style={{ textAlign: 'center', margin: 10, fontWeight: 'bold' }}>{this.state.title}</Text></View>}
          width={Dimensions.get('window').width - 30}
          visible={this.state.visible}
          onTouchOutside={() => {
            this.setState({ visible: false });
          }}
        >
          <DialogContent>
            <Text style={{ textAlign: 'center', marginTop: 15 }}>{this.state.data}</Text>
          </DialogContent>
        </Dialog>

        <View style={{flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#F5FCFF'}}>
          <View style={{ borderBottomColor: 'black', borderBottomWidth: 2, borderTopColor: 'black', borderTopWidth: 2, backgroundColor: '#00BCD4' }}><Text style={{ textAlign: 'center', color: '#fff', margin: 10, fontWeight: 'bold' }}>Past Scans</Text></View>
          <FlatList
            width={Dimensions.get('window').width}
            data={this.state.list}
            extraData={this.state.list}
            renderItem={({ item }) =>

              <View style={{width: Dimensions.get('window').width}}>
                <View style={{backgroundColor: '#00BCD4'}}><Text style={{ textAlign: 'center', width: Dimensions.get('window').width, color: '#fff', marginTop: 10, marginBottom: 10, fontWeight: 'bold' }}>{item.title}</Text></View>
                <Text style={{textAlign: 'center'}}>{item.key}</Text>
              </View>
            }
          />
          <View
            style={{
              borderBottomColor: 'black',
              borderBottomWidth: 2,
            }}
          />
          <TouchableOpacity
            style={styles.SubmitButtonStyle}
            activeOpacity={.5}
            onPress={() => startScan()}
          >
            <Text style={styles.TextStyle}> Scan </Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  }
}

//Check If the URL is Valid
function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?' + 
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + 
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' + 
    '(\\#[-a-z\\d_]*)?$', 'i'); 
  return !!pattern.test(str);
}

//Parse the Contact Card Info Layout
function parseCard(re) {

  //Remove for tag (only first instance)
  re = re.replace("\n", '');
  re = re.replace("BEGIN:VCARD", '');
  re = re.replace("END:VCARD", '');

  var next = re.indexOf("N");;
  var version = re.substring(0, next + 1);

  re = re.replace(version, '');

  var next1 = re.indexOf("N");;
  var version1 = re.substring(0, next1 + 2);

  re = re.replace(version1, '');

  return re;
}

//Parse the Email Info Layout
function parseEmail(re) {
  var semiRemove = re.indexOf(":");
 
  //Remove for tag (only first instance)
  re = re.replace("MATMSG:", '');
  re = re.replace("TO:", '');
  re = re.replace(" ", '');

  var semi = re.indexOf(";");

  var Email = re.substring(0, semi);

  re = re.replace(Email, '');
  re = re.slice(1);
  re = re.replace("SUB:", '');

  var semi1 = re.indexOf(";");

  var Subject = re.substring(0, semi1);

  re11 = re.replace("BODY:", '');

  var semi2 = re.indexOf(";");

  var Body = re.substring(0, semi2);

  return [Email, Subject, Body];
}

//Parse the SMS Info Layout
function parseSMS(re) {

  //Remove for tag (only first instance)
  re = re.replace("SMSTO:", '');

  var colon = re.indexOf(":");

  var PhoneNumber = re.substring(0, colon);

  var SMS = re.substring(colon + 1, re.length);

  return [PhoneNumber, SMS];
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    borderRadius: 5,
    padding: 5,
  },
  MainContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#F5FCFF',

  },

  SubmitButtonStyle: {

    marginTop: 10,
    paddingTop: 15,
    marginBottom: 20,
    paddingBottom: 15,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: '#00BCD4',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000'
  },
  TextStyle: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

/**
 * /**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow


import React, { Component } from 'react';
import {
  Platform, StyleSheet, Text, View, TouchableOpacity,
  Linking, AppRegistry
} from 'react-native';
import { Button } from 'react-native';
import QRCode from 'react-native-qrcode';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Dialog, { DialogContent } from 'react-native-popup-dialog';
import { Dimensions } from 'react-native'
import { List, ListItem } from 'react-native-elements'
import { FlatList } from 'react-native';


type Props = {};
console.disableYellowBox = true;

export default class App extends Component<Props> {
  state = {
    visible: false,
    data: "",
    title: "",
    qrvis: false,
    isHidden: 0,
    list: [{ key: "Example Data", title: "<-Example->" }],
  }


  onSuccess(e) {
    let titleT = "";
    let dataT = "";

    this.setState({ open: false });

      if (validURL(e.data)) {
        Linking
          .openURL(e.data)
          .catch(err =>
            console.log(err)

          );
      } else if (e.data.includes("END:VCARD")) {
        var arrayOfInfo = parseCard(e.data);

        titleT = "Contact Card";
        dataT = arrayOfInfo;

        this.setState({ data: arrayOfInfo });
        this.setState({ title: "Contact Card" });

        this.state.list.push(({ key: dataT, title: titleT }));

      } else if (e.data.includes("MATMSG")) {
        var arrayOfInfo1 = parseEmail(e.data);

        titleT = "E-mail";
        dataT = "Email: " + arrayOfInfo1[0] + "\nSubject: " + arrayOfInfo1[1] + "\nBody: " + arrayOfInfo1[2];

        this.setState({ data: dataT });
        this.setState({ title: titleT });
        
      
        this.state.list.push(({ key: dataT, title: titleT }));

    } else if (e.data.includes("SMSTO")) {
        var arrayOfInfo2 = parseSMS(e.data);

        titleT = "SMS";
        dataT = arrayOfInfo2[0] + " -> " + arrayOfInfo2[1];

        this.setState({ data: dataT });
        this.setState({ title: titleT });
        
        Alert.alert(
          (titleT),
          (dataT),
          [
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
          { cancelable: false }
        )
        this.state.list.push(({ key: dataT, title: titleT }));

    } else {

        titleT = "String";
        dataT = e.data;

        this.setState({ data: e.data})
        this.setState({ title: "String" })
        
        Alert.alert(
          (titleT),
          (dataT),
          [
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ],
          { cancelable: false }
        )  
        this.state.list.push(({ key: dataT, title: titleT }));

      }
    }
    
    render() {
    let scanner;
    const startScan = () => {
      if (scanner) {
        scanner.reactivate(true);
        this.setState({ qrvis: true });
        this.setState({ isHidden: 300 });

      }
    };
    return (

      <View style={styles.MainContainer}>
        <View height={this.state.isHidden}>
          <QRCodeScanner
            onRead={this.onSuccess.bind(this)}
            ref={(node) => { scanner = node }}
            reactivate={false}
            vibrate={this.state.qrvis}
          />
        </View>

        <Dialog
          dialogTitle={<View style={{ backgroundColor: '#2196f3' }}><Text style={{ textAlign: 'center', margin: 10, fontWeight: 'bold' }}>{this.state.title}</Text></View>}
          width={Dimensions.get('window').width - 30}
          visible={this.state.visible}
          onTouchOutside={() => {
            this.setState({ visible: false });
          }}
        >
          <DialogContent>
            <Text style={{ textAlign: 'center', marginTop: 15 }}>{this.state.data}</Text>
          </DialogContent>
        </Dialog>

        <View style={{flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#F5FCFF'}}>
          <View style={{ borderBottomColor: 'black', borderBottomWidth: 2, borderTopColor: 'black', borderTopWidth: 2, backgroundColor: '#00BCD4' }}><Text style={{ textAlign: 'center', color: '#fff', margin: 10, fontWeight: 'bold' }}>Past Scans</Text></View>
          <FlatList
            width={Dimensions.get('window').width}
            data={this.state.list}
            extraData={this.state.list}
            renderItem={({ item }) =>

              <View style={{width: Dimensions.get('window').width}}>
                <View style={{backgroundColor: '#00BCD4'}}><Text style={{ textAlign: 'center', width: Dimensions.get('window').width, color: '#fff', marginTop: 10, marginBottom: 10, fontWeight: 'bold' }}>{item.title}</Text></View>
                <Text style={{textAlign: 'center'}}>{item.key}</Text>
              </View>
            }
          />
          <View
            style={{
              borderBottomColor: 'black',
              borderBottomWidth: 2,
            }}
          />
          <TouchableOpacity
            style={styles.SubmitButtonStyle}
            activeOpacity={.5}
            onPress={() => startScan()}
          >
            <Text style={styles.TextStyle}> Scan </Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  }
}

//Check If the URL is Valid
function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?' + 
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + 
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' + 
    '(\\#[-a-z\\d_]*)?$', 'i'); 
  return !!pattern.test(str);
}

//Parse the Contact Card Info Layout
function parseCard(re) {

  //Remove for tag (only first instance)
  re = re.replace("\n", '');
  re = re.replace("BEGIN:VCARD", '');
  re = re.replace("END:VCARD", '');

  var next = re.indexOf("N");;
  var version = re.substring(0, next + 1);

  re = re.replace(version, '');

  var next1 = re.indexOf("N");;
  var version1 = re.substring(0, next1 + 2);

  re = re.replace(version1, '');

  return re;
}

//Parse the Email Info Layout
function parseEmail(re) {
  var semiRemove = re.indexOf(":");
 
  //Remove for tag (only first instance)
  re = re.replace("MATMSG:", '');
  re = re.replace("TO:", '');
  re = re.replace(" ", '');

  var semi = re.indexOf(";");

  var Email = re.substring(0, semi);

  re = re.replace(Email, '');
  re = re.slice(1);
  re = re.replace("SUB:", '');

  var semi1 = re.indexOf(";");

  var Subject = re.substring(0, semi1);

  re11 = re.replace("BODY:", '');

  var semi2 = re.indexOf(";");

  var Body = re.substring(0, semi2);

  return [Email, Subject, Body];
}

//Parse the SMS Info Layout
function parseSMS(re) {

  //Remove for tag (only first instance)
  re = re.replace("SMSTO:", '');

  var colon = re.indexOf(":");

  var PhoneNumber = re.substring(0, colon);

  var SMS = re.substring(colon + 1, re.length);

  return [PhoneNumber, SMS];
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    borderRadius: 5,
    padding: 5,
  },
  MainContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#F5FCFF',

  },

  SubmitButtonStyle: {

    marginTop: 10,
    paddingTop: 15,
    marginBottom: 20,
    paddingBottom: 15,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: '#00BCD4',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000'
  },
  TextStyle: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

 */