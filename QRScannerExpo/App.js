/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  AppRegistry
} from "react-native";
import { Button } from "react-native";
import { Dimensions } from "react-native";
import { FlatList, Alert } from "react-native";
import { BarCodeScanner, Permissions } from "expo";
import { Constants } from "expo";

type Props = {};
console.disableYellowBox = true;

export default class App extends Component<Props> {
  state = {
    data: "",
    title: "",
    open: false,
    list: [{ key: "Example Data", title: "<-Example->" }],
    refresh: false,
    hasCamera: false,
  };
  componentDidMount() {
    this.permissionRequest();
  }
  permissionRequest = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCamera: status === 'granted' });
  };
  startScan() {
    this.setState({ open: true });
    console.log(this.state.open);
  }
  onSuccess(e) {
    let titleT = "";
    let dataT = "";

    this.setState({ open: false });

    if (validURL(e.data)) {
      Linking.openURL(e.data).catch(err => console.log(err));
    } else if (e.data.includes("END:VCARD")) {
      var arrayOfInfo = parseCard(e.data);

      titleT = "Contact Card";
      dataT = arrayOfInfo;

      this.setState({ data: arrayOfInfo });
      this.setState({ title: "Contact Card" });

      Alert.alert(
        titleT,
        dataT,
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
      this.state.list.push({ key: dataT, title: titleT });
    } else if (e.data.includes("MATMSG")) {
      var arrayOfInfo1 = parseEmail(e.data);

      titleT = "E-mail";
      dataT =
        "Email: " +
        arrayOfInfo1[0] +
        "\nSubject: " +
        arrayOfInfo1[1] +
        "\nBody: " +
        arrayOfInfo1[2];

      this.setState({ data: dataT });
      this.setState({ title: titleT });

      Alert.alert(
        titleT,
        dataT,
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
      this.state.list.push({ key: dataT, title: titleT });
    } else if (e.data.includes("SMSTO")) {
      var arrayOfInfo2 = parseSMS(e.data);

      titleT = "SMS";
      dataT = arrayOfInfo2[0] + " -> " + arrayOfInfo2[1];

      this.setState({ data: dataT });
      this.setState({ title: titleT });

      Alert.alert(
        titleT,
        dataT,
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
      this.state.list.push({ key: dataT, title: titleT });
    } else {
      titleT = "String";
      dataT = e.data;

      this.setState({ data: e.data });
      this.setState({ title: "String" });

      Alert.alert(
        titleT,
        dataT,
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
      this.state.list.push({ key: dataT, title: titleT });
    }
    console.log(this.state.list);
  }
  render() {
    return (
      //style={{marginTop: Constants.statusBarHeight}}
      <View style={styles.MainContainer}>
        {this.state.open 
        ?   this.state.hasCamera === false
              ? <Text style={{marginTop : 20, marginBottom: 20, textAlign: "center"}}>
                No Permission for Camera
                    </Text>
              : <BarCodeScanner
                  height={400}
                  width={Dimensions.get("window").width}
                  onBarCodeRead={this.onSuccess.bind(this)}
                />
       
        : (
          <View />
        )}

        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "#F5FCFF"
          }}
        >
          <View
            style={{
              borderBottomColor: "black",
              borderBottomWidth: 2,
              borderTopColor: "black",
              borderTopWidth: 2,
              backgroundColor: "#00BCD4"
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#fff",
                margin: 10,
                fontWeight: "bold"
              }}
            >
              Past Scans
            </Text>
          </View>
          <FlatList
            width={Dimensions.get("window").width}
            data={this.state.list}
            extraData={this.state.list}
            renderItem={({ item }) => (
              <View style={{ width: Dimensions.get("window").width }}>
                <View style={{ backgroundColor: "#00BCD4" }}>
                  <Text
                    style={{
                      textAlign: "center",
                      width: Dimensions.get("window").width,
                      color: "#fff",
                      marginTop: 10,
                      marginBottom: 10,
                      fontWeight: "bold"
                    }}
                  >
                    {item.title}
                  </Text>
                </View>
                <Text style={{ textAlign: "center" }}>{item.key}</Text>
              </View>
            )}
          />
          <View
            style={{
              borderBottomColor: "black",
              borderBottomWidth: 2
            }}
          />
          <TouchableOpacity
            style={styles.SubmitButtonStyle}
            activeOpacity={0.5}
            onPress={() => this.startScan()}
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
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return !!pattern.test(str);
}

//Parse the Contact Card Info Layout
function parseCard(re) {
  //Remove for tag (only first instance)
  re = re.replace("\n", "");
  re = re.replace("BEGIN:VCARD", "");
  re = re.replace("END:VCARD", "");

  var next = re.indexOf("N");
  var version = re.substring(0, next + 1);

  re = re.replace(version, "");

  var next1 = re.indexOf("N");
  var version1 = re.substring(0, next1 + 2);

  re = re.replace(version1, "");

  return re;
}

//Parse the Email Info Layout
function parseEmail(re) {
  var semiRemove = re.indexOf(":");

  //Remove for tag (only first instance)
  re = re.replace("MATMSG:", "");
  re = re.replace("TO:", "");
  re = re.replace(" ", "");

  var semi = re.indexOf(";");

  var Email = re.substring(0, semi);

  re = re.replace(Email, "");
  re = re.slice(1);
  re = re.replace("SUB:", "");

  var semi1 = re.indexOf(";");

  var Subject = re.substring(0, semi1);

  re11 = re.replace("BODY:", "");

  var semi2 = re.indexOf(";");

  var Body = re.substring(0, semi2);

  return [Email, Subject, Body];
}

//Parse the SMS Info Layout
function parseSMS(re) {
  //Remove for tag (only first instance)
  re = re.replace("SMSTO:", "");

  var colon = re.indexOf(":");

  var PhoneNumber = re.substring(0, colon);

  var SMS = re.substring(colon + 1, re.length);

  return [PhoneNumber, SMS];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 36
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    margin: 10,
    borderRadius: 5,
    padding: 5
  },
  MainContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#F5FCFF",
    marginTop: Constants.statusBarHeight
  },

  SubmitButtonStyle: {
    marginTop: 10,
    paddingTop: 15,
    marginBottom: 20,
    paddingBottom: 15,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: "#00BCD4",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000"
  },
  TextStyle: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold"
  }
});
