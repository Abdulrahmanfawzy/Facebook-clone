import { app } from "../config/config.js";
import {
  getDatabase,
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

if (!window.localStorage.getItem("local_userId")) {
  window.location.href = "https://abdulrahmanfawzy.github.io/Facebook-clone/register/login/login.html";
}

let user_id = window.localStorage.getItem("local_userId");
let urlSearch = window.location.search;
let urlObj = new URLSearchParams(urlSearch);
let userIdUrl = urlObj.get("userId");
const db = getDatabase();
const dbRef = ref(getDatabase());


function getUserData() {
  return new Promise((resolve, reject) => {
    if (userIdUrl) {
      get(child(dbRef, `users/${userIdUrl}/userAuth/`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            if (snapshot.val()) {
              resolve(snapshot.val());
            }
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });
}

let userData = await getUserData();

export function profileImagesFun() {
  return new Promise((resolve) => {
    let box = `
    <div id="profile_details">
      <div class="cover_image_div position-relative">
        <div id="cover_image">
        ${
          userData.coverImage ? `<img src="${userData.coverImage}" alt="">` : ""
        }
        </div>
          <div class="processDivCoverProfile"></div>
          <div class="cover_postion d-${
            user_id == userIdUrl ? "block" : "none"
          }">
              <label for="cover_imageInpt">
                  <i class="fa-solid fa-camera"></i> 
                  Add cover photo
              </label>
              <input type="file" class="d-none" accept="image/*" id="cover_imageInpt">
          </div>
      </div>
      <div class="profile_img_div gap-3 d-flex justify-content-between align-items-center">
          <div class=" inside_profile d-flex align-items-center gap-3">
              <div class="position-relative">
                <img id="user_img" src="${
                  userData.imageUrl
                    ? userData.imageUrl
                    : "../imgs/profileImage.png"
                }" alt="">
                <div class="processDivProfile text-center"></div>
                <div class="image_upload d-${
                  user_id == userIdUrl ? "block" : "none"
                }">
                    <label for="file_upload_profile_image">
                        <i id="profile_image_icon" class="fa-solid fa-camera"></i> 
                    </label>
                    <input type="file" class="d-none" accept="image/*" id="file_upload_profile_image">
              </div>
              </div>
              
              <div>
                <h2 class="mb-1">${userData.username}</h2>
                <div class="d-flex justify-content-center justify-content-md-start align-items-center gap-3">
                  <section id="followersNum"></section>
                  <span id="line"></span>
                  <section id="followeringNum"></section>
                </div>
              </div>
          </div>

          
          
          ${userIdUrl != user_id ? `<button class="btns" id="profile_follow">Follow</button>` : ""}
          
      </div>
    </div>`;

    resolve(box);
  });
}


