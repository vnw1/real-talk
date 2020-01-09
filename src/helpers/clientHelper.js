import moment from "moment"

export let bufferToBase64 = (bufferFrom) => {
  return Buffer.from(bufferFrom).toString("base64");
};

export let lastItemOfArray = (array) => {
  if (!array.length) {
    return [];
  }
  return array[array.length - 1];
};

export let convertTimeStampToHumanTime = (timestamp) => {
  if (!timestamp) {
    return "";
  }
  return moment(timestamp).locale("en").startOf("second").fromNow();
};