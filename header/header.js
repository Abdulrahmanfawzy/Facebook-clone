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
const db = getDatabase();
const dbRef = ref(getDatabase());

function getUserData() {
  return new Promise((resolve, reject) => {
    get(child(dbRef, `users/${user_id}/userAuth`))
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

let userData = await getUserData();

export function headerFun(obj) {
  return `
        <div class="content">

        <div class="row">

            <div class="logo col-sm-3 ">
                <a href="${obj.Home}">
                    <img src="${obj.imgLogo}" class="d-block" alt="">
                </a>
            </div>

            <div class="search col-sm-6  d-flex align-items-center">
                <i id="searchIcon" class="fa-solid fa-magnifying-glass"></i>
                <input type="text" autocomplete="off" id="searchInpt" placeholder="Search For Friends...">
                <div id="searchResult"></div>
                <div id="searchNoResult">No Result Founded</div>
                
            </div>

            <div class="profile col-sm-3  text-end">
                <a href="${obj.chatPage}?userId=${user_id}" class="text-decoration-none">
                  <span class="message me-3 d-inline-block me-2">
                    <i class="fa-regular fa-comment-dots"></i>
                  </span>
                </a>
                <a href="${obj.userProfile}?userId=${user_id}">
                    <img src="${(userData.imageUrl)?userData.imageUrl:'../imgs/profileImage.png'}" alt="">
                </a>
                <div class="bars">
                    <i id="barMenu" class="fa-solid fa-bars-staggered"></i>
                </div>
            </div>

        </div>

    </div>`;
}
