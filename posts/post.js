import { app } from "../config/config.js";
import {
  getDatabase,
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

<<<<<<< HEAD

if (!window.localStorage.getItem("local_userId")) {
  window.location.href = "../register/login/login.html";
=======
if (!window.localStorage.getItem("local_userId")) {
  window.location.href = "../Facebook-clone/register/login/login.html";
>>>>>>> 1d197ffa6f6f096408b409721156e4b455ba26d5
}

let user_id = window.localStorage.getItem("local_userId");
let urlSearch = window.location.search;
let urlObj = new URLSearchParams(urlSearch);
let userIdUrl = urlObj.get("userId");
const db = getDatabase();
const dbRef = ref(getDatabase());

<<<<<<< HEAD


=======
>>>>>>> 1d197ffa6f6f096408b409721156e4b455ba26d5
function getUserData() {
  return new Promise((resolve, reject) => {
    get(child(dbRef, `users/${user_id}/userAuth/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

function getUserDataToOther() {
  if(userIdUrl){
    return new Promise((resolve, reject) => {
      get(child(dbRef, `users/${userIdUrl}/userAuth/`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.val());
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }
}

// console.log(user_id);

let userData = await getUserData();
let userDataToAnother = await getUserDataToOther();
// console.log(userData);

export function postStructure() {
  let box = `
  <div class="item_parent">
  <div class="share_parent border-bottom d-flex gap-2 align-items-start">
      <div class="share_img">
          <img src="${
            userData.imageUrl ? userData.imageUrl : "../imgs/profileImage.png"
          }" alt="">
      </div>
      <div class="text_post mt-2">
          <textarea class="border" id="postInpt" placeholder="${
            userIdUrl
              ? userIdUrl == user_id
                ? "What's on your mind?"
                : `Write something to ${
                  userDataToAnother.username.split(" ")[0]
                  }...`
              : "What's on your mind?"
          }"></textarea>
          <div class="imageUploadDiv">
              <img data-uploaded="false" src="../imgs/profileImage.png" alt="">
              <div class="cancelImage" id="cancelImage">
                  <i class="fa-solid fa-circle-xmark"></i>
              </div>
          </div>
          <button id="postBtn" class="btn btn-primary w-100 mt-3">Post</button>
      </div>
  </div>
  <div id="processDiv"></div>
  <div class="share_child d-flex justify-content-center align-items-center">
      <li class="photo" id="photo">
          <label id="fileUploadLabel" for="fileUpload">
            <i class="fa-solid fa-image"></i>
            Photo
          </label>
          <input type="file" accept="image/*" id="fileUpload" class="d-none" />
          
      </li>
      <div class="feelingDiv">
        <li class="feeling d-flex justify-content-center align-items-center gap-1">
            <i class="fa-regular fa-face-laugh-beam"></i>
            Feeling
        </li>
        <section id="emojis"></section>
      </div>
      <li class="video">
          <i class="fa-solid fa-video"></i>
          Video
      </li>
  </div>
  </div>
        `;
  return new Promise((resolve) => {
    resolve(box);
  });
}
