import { app } from "../config/config.js";
import {
  getDatabase,
  ref,
  onValue,
  update,
  set,
  remove,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  getStorage,
  ref as refStorage,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const storage = getStorage();
const db = getDatabase();
const dbRef = ref(getDatabase());
let user_id = window.localStorage.getItem("local_userId");

if (user_id == null) {
  window.location.href = "../register/login/login.html";
}

function getAllUsersFun() {
  return new Promise((resolve, reject) => {
    get(child(dbRef, `users/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

let all_users = document.getElementById("all_users");
let box;
async function addUsersToPage() {
  all_users.innerHTML = "";
  let getAllUsers = await getAllUsersFun();
  for (const user in getAllUsers) {
    if (user != user_id) {
      box = `
            <div class="mb-1 mt-3 freind gap-3 d-flex justify-content-between align-items-center">
                <h6 class="mb-0">
                <a class="text-dark d-flex align-items-center text-decoration-none" href="../users/user.html?userId=${
                  getAllUsers[user].userAuth.user_id
                }">
                <img src="${
                  getAllUsers[user].userAuth.imageUrl
                    ? getAllUsers[user].userAuth.imageUrl
                    : "../imgs/profileImage.png"
                }" alt="">
                  <section>${getAllUsers[user].userAuth.username}</section>
                </a>
                </h6>
    
                <button class="btns" data-follow="${user}" data-userid="${user}" id="follow">Follow</button>
    
            </div>
            `;
      all_users.innerHTML += box;
    }
  }
  return all_users;
}

addUsersToPage();

// get all data of user_id
function getFollowerFromFirebase() {
  return new Promise((resolve, reject) => {
    get(child(dbRef, `users/${user_id}/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          // followers
          let data = snapshot.val();
          if (data) {
            resolve(data);
          }
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

let handleFollowersInBeginning = async () => {
  let { followers } = await getFollowerFromFirebase();
  if (followers) {
    let follows = document.querySelectorAll("[data-follow]");
    if (followers) {
      for (let item in followers) {
        if (document.querySelector(`[data-follow="${item}"]`)) {
          document.querySelector(`[data-follow="${item}"]`).innerHTML =
            "Unfollow";
        }
      }
    }
  }
};
handleFollowersInBeginning();

document.addEventListener("click", (e) => {
  if (e.target.id == "follow") {
    handleFollowing(e, e.target.dataset.userid);
  }
});

function getFollowerFun(id) {
  return new Promise((resolve, reject) => {
    get(child(dbRef, `users/${id}/userAuth/`))
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

async function handleFollowing(e, id) {
  let getFollower = await getFollowerFun(id);
  if (e.target.innerHTML == "Follow") {
    e.target.innerHTML = "Unfollow";
    set(ref(db, `users/${user_id}/followers/` + id), {
      userId: id,
      parentUserId: user_id,
    });
    sweetAlert("success", `you are following ${getFollower.username}`);
  } else {
    e.target.innerHTML = "Follow";
    remove(ref(db, `users/${user_id}/followers/` + id));
    sweetAlert("success", `you are not following ${getFollower.username}`);
  }
}

async function getFollowersMeFun() {
  let getAllUsers = await getAllUsersFun();
  for (const item in getAllUsers) {
    let { followers } = getAllUsers[item];
    if (followers) {
      checkFollowerFun(followers);
    }
  }
}
getFollowersMeFun();

let followersArr = [];

function checkFollowerFun(followers) {
  for (const item in followers) {
    if (user_id == followers[item].userId) {
      if (followers[item].parentUserId) {
        getAllFollowersMe(followers[item].parentUserId);
      }
    }
  }
}

let printFollow;
// get all data of user_id
function getAllFollowersMe(id) {
  let followersDiv = document.getElementById("followersDiv");
  followersDiv.innerHTML = "";
  if (id) {
    get(child(dbRef, `users/${id}/userAuth/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          // followers
          let data = snapshot.val();
          if (data) {
            printFollow = `
              <div class="mb-3 followerBack d-flex justify-content-between align-items-center">
              <h6 class="mb-0">
              <a class="text-dark text-decoration-none" href="../users/user.html?userId=${
                data.user_id
              }">
              <img src="${
                data.imageUrl ? data.imageUrl : "../imgs/profileImage.png"
              }" alt="">
                ${data.username}
              </a>
              </h6>
  
              <button class="btns btnFollwers" data-follower_icon="${data.user_id}" data-follower="${data.user_id}" id="follows">
                <i id="followIcon" data-follower_icon="${data.user_id}" class="fa-solid fa-user-plus followBack"></i>
              </button>
  
              </div>
              `;
            followersDiv.innerHTML += printFollow;
          }
        }
        getIdOfFollowers(document.querySelectorAll(".btnFollwers"));
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

async function getIdOfFollowers(btns) {
  let { followers } = await getFollowerFromFirebase();
  btns.forEach((el) => {
    for (const item in followers) {
      if (item == el.dataset.follower) {
        document.querySelector(`[data-follower='${item}']`).innerHTML = "Unfollow";
      }
    }
  });
}

document.addEventListener("click" , (e)=>{
  if(e.target.dataset.follower_icon){
    checkFollowerIfFound(e , e.target.dataset.follower_icon)
  }
})

async function checkFollowerIfFound(e , followerId){
  let {username} = await getFollowerFun(followerId)
  if(e.target.classList.contains("fa-solid")){
    set(ref(db, `users/${user_id}/followers/` + followerId), {
      userId: followerId,
      parentUserId: user_id,
    });
    e.target.parentElement.innerHTML = "Unfollow";
    sweetAlert("success", `you are following ${username}`);
  }else{
    remove(ref(db, `users/${user_id}/followers/` + followerId));
    e.target.innerHTML = `<i id="followIcon" data-follower_icon="${followerId}" class="fa-solid fa-user-plus followBack"></i>`;
    sweetAlert("success", `you are not following ${username}`);
  }
}

function sweetAlert(icon, message) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  Toast.fire({
    icon: icon,
    title: message,
  });
}
