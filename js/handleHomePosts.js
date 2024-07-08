import { app } from "../config/config.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  child,
  update,
  query,
  orderByChild,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import {
  getStorage,
  ref as refStorage,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const db = getDatabase();
const dbRef = ref(getDatabase());
const storage = getStorage();
let user_id = window.localStorage.getItem("local_userId");
let post_container = document.getElementById("post_container");
let loading = document.querySelector(".loading");

if (user_id == null) {
  window.location.href = "../register/login/login.html";
}

function getUsernameBasedLocalId() {
  return new Promise((resolve, reject) => {
    get(child(dbRef, `users/${user_id}/userAuth/`))
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

let userData = await getUsernameBasedLocalId();

function savedPostsFromDatabase() {
  return new Promise((resolve, reject) => {
    const starCountRef = ref(db, `users/${user_id}/savedList/`);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        resolve(data);
      }
    });
  });
}

function favouritePostsFromDatabase() {
  return new Promise((resolve, reject) => {
    const starCountRef = ref(db, `users/${user_id}/favouiteList`);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        resolve(data);
      }
    });
  });
}

function getUsersFromDatabase() {
  return new Promise((resolve) => {
    const starCountRef = ref(db, `users/`);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        resolve(data);
      }
    });
  });
}

let box;

let imageSrc;

if(window.location.pathname.includes("/users/user.html")){
  imageSrc = "../imgs/profileImage.png";
}else{
  imageSrc = "imgs/profileImage.png";
}

let friends_zone = document.querySelector(".friends_zone");
let arr = [];
async function addUsersToPage() {
  friends_zone.innerHTML = "";
  let followerss = await getUsersFromDatabase();

  for (const item in followerss){
    arr.push(followerss[item]);
  }

  // Limit the array to the first 5 items
  let limitedFollowers = arr.slice(0, 12);

  limitedFollowers.forEach(user => {
    if (user.userAuth.user_id != user_id) {
      let box = `
        <div class="mb-1  d-flex justify-content-between align-items-center">
            <h6 class="mb-0">
            <a class="d-flex align-items-center gap-2" href="users/user.html?userId=${
              user.userAuth.user_id
            }">
            <img src="${
              user.userAuth.imageUrl
                ? user.userAuth.imageUrl
                : imageSrc
            }" alt="">
              <section>
              ${user.userAuth.username}
              </section>
            </a>
            </h6>

            <button class="btns" data-follow="${user.userAuth.user_id}" data-userid="${user.userAuth.user_id}" id="follow">Follow</button>

        </div>
        `;
      friends_zone.innerHTML += box;
    }
  });

  return friends_zone;
}

let realFollowers = await addUsersToPage();

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

document.addEventListener("click", (e) => {
  if (e.target.id == "follow") {
    handleFollowing(e, e.target.dataset.userid);
  }
});

async function handleFollowing(e, id) {
  let getFollower = await getFollowerFun(id);
  if (e.target.innerHTML == "Follow") {
    e.target.innerHTML = "Unfollow";
    set(ref(db, `users/${user_id}/followers/` + id), {
      userId: id,
      parentUserId: user_id,
    });
    // sweetAlert("success", `you are following ${getFollower.username}`);
    location.reload();
  } else {
    e.target.innerHTML = "Follow";
    remove(ref(db, `users/${user_id}/followers/` + id));
    // sweetAlert("success", `you are not following ${getFollower.username}`);
    location.reload();
  }
}
let globalId;
let globalIdArr = [];
async function setPostsOfFollowerUser() {
  let postsOfUsers = await getFollowerFromFirebase();
  let { followers } = postsOfUsers;
  let arr = [];
  return new Promise((resolve) => {
    for (const follower in followers) {
      globalId = follower;
      globalIdArr.push(follower);
      get(child(dbRef, `users/${follower}/posts/`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            arr.push(snapshot.val());
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
    resolve(arr);
  });
}
let finalArr = await setPostsOfFollowerUser();
globalIdArr.forEach((id) => {
  handlePostInHome(id);
});

function handlePostInHome(id) {
  const postsQuery = query(
    child(dbRef, `users/${id}/posts`),
    orderByChild("createdAt")
  );

  get(postsQuery)
    .then((snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        let dataArray = Object.entries(data);
        dataArray.sort((a, b) => b[1].createdAt - a[1].createdAt);
        let sortedData = Object.fromEntries(dataArray);
        printPostInHome(sortedData);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function timeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now - date) / 1000);

  const secondsInMinute = 60;
  const secondsInHour = 60 * secondsInMinute;
  const secondsInDay = 24 * secondsInHour;
  const secondsInMonth = 30 * secondsInDay;
  const secondsInYear = 12 * secondsInMonth;

  if (diffInSeconds < secondsInMinute) {
    return diffInSeconds === 1 ? "1 second ago" : `a few seconds ago`;
  } else if (diffInSeconds < secondsInHour) {
    const minutes = Math.floor(diffInSeconds / secondsInMinute);
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  } else if (diffInSeconds < secondsInDay) {
    const hours = Math.floor(diffInSeconds / secondsInHour);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else if (diffInSeconds < secondsInMonth) {
    const days = Math.floor(diffInSeconds / secondsInDay);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } else if (diffInSeconds < secondsInYear) {
    const months = Math.floor(diffInSeconds / secondsInMonth);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    const years = Math.floor(diffInSeconds / secondsInYear);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
}
const arabicRegex =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
let count = 0;
async function printPostInHome(post) {
  document.querySelector(".firstView").style.display = "none";
  console.log(post);
  for (const item in post) {
    box = `
        <div class="postItemInUser">
        ${
          post[item].shared
            ? `
          <div>
          <div class="postItemFlex d-flex justify-content-between align-items-center">
              <a href="../users/user.html?userId=${
                post[item].userIdShared
              }" class="post_title d-flex align-items-center gap-2">
              <img src=${
                 post[item].oraginal_image
                  ?  post[item].oraginal_image
                  : "../imgs/profileImage.png"
              } alt="" />
              <div> 
                  <h6 class="mb-0 d-flex align-items-center justify-content-center" id="usernameAnother">${
                     post[item].oraginal_username
                  }</h6>
                  <section>${timeAgo(post[item].sharedAt)}</section>
              </div>
              </a>
              <div class="icons">
                <i id="favourite_icon" data-favoure_id="${item}" data-user_id_f_post="${
               post[item].userid
                }" class="fa-regular fa-star me-1"></i>
                <i id="saved_icon" data-postid="${item}" data-user_id_f_post="${
                post[item].userid
                }" class="fa-regular fa-bookmark savedIcon"></i>
              </div>

            
          </div>`
            : ""
        }
          <div class="${
            post[item].shared ? "border mt-2 pt-3 rounded-2" : ""
            }">
            <div class="${post[item].shared ? "py-1 px-2" : ""} postItemFlex d-flex justify-content-between align-items-center">
                <a href="../users/user.html?userId=${
                  post[item].userid
                }" class="post_title d-flex align-items-center gap-2">
                <img src=${
                  post[item].imageUrl
                    ? post[item].imageUrl
                    : "../imgs/profileImage.png"
                } alt="" /><div>
                    <h6 class="mb-0" id="usernameAnother">
                        ${post[item].username}
                    </h6>
                    <section>${timeAgo(post[item].createdAt)}</section>
                </div>
                </a>

                ${
                  post[item].shared
                    ? ""
                    : `
                    <div class="icons gap-1">
                      <i id="favourite_icon" data-favoure_id="${item}" data-user_id_f_post="${
                    post[item].userid
                      }" class="fa-regular fa-star me-1"></i>
                      <i id="saved_icon" data-postid="${item}" data-user_id_f_post="${
                      post[item].userid
                      }" class="fa-regular fa-bookmark savedIcon"></i>
                      </div>
                  `
                }
                
                
                
            </div>


            
            <div class="post_text mt-3">
                <section class="${post[item].shared ? "" : ""}">
                  ${
                    post[item].postText
                      ? `${
                          arabicRegex.test(post[item].postText)
                            ? `<section dir="rtl">${post[item].postText}</section>`
                            : post[item].postText
                        }`
                      : ""
                  }
                </section>
            </div>
            
            ${
              post[item].postImage
                ? `<div class="post_image mt-2"><img src="${post[item].postImage}" alt="" /></div>`
                : ""
            }
          </div>

          <div class="numbers mt-2 mb-2 d-flex justify-content-between">
              <div>
                  <i class="fa-regular fa-heart"></i>
                  <span data-love_span_count="${count}" data-post_id="${
              post[item].postId
              }" class="loveNum">0</span>
              </div>
              <div class="d-flex gap-3">
                  <div>
                      <i class="fa-regular fa-comment"></i>
                      <span class="commentNum" data-user_id_f_post="${
                        post[item].userid
                      }" data-comment_span_count="${count}" data-post_id="${
                post[item].postId
                }">0</span>
                  </div>
                  <div>
                    <i class="fa-solid fa-share"></i>
                    <span data-added="false" id="shareNum" data-count_num="${count}" data-share_span_count="${count}" data-post_id_share="${
                post[item].postId
                }">0</span>
                </div>
              </div>
          </div>

          <div class="iteractive border-top d-flex justify-content-between align-items-center mt-2">
              <div class="inter_icons loveBtnClass w-100">
               <i id="likeInHome" data-user_id_f_post_home="${
                 post[item].userid
               }" data-love_in_database_home="${
                    post[item].postId
                  }" data-lovenumber="${count}" class="fa-regular fa-heart me-1 iconLoves"></i> Love
              </div>
              <div data-counter="${count}" data-commented="commented" class="d-flex inter_icons align-items-center justify-content-center commentBtnClass">
                <i data-counter="${count}" data-commented="commented" id="comment" class="fa-regular fa-comment"></i>
                <span data-counter="${count}" data-commented="commented" class="ms-2">Comment</span>
              </div>
              ${post[item].userid == user_id ?
                ""
                : `
                <div class="d-flex inter_icons align-items-center justify-content-center ">
              <span data-share="share" data-user_id_share="${
                post[item].userid
              }" data-share_btn="${post[item].postId}" class="ms-2 shareBtn">
                <i id="share" data-user_id_share="${
                  post[item].userid
                }" data-share_in_database="${
      post[item].postId
    }" data-sharenumber="${count}" class="fa-regular fa-share-from-square">
                </i> Share
              </span>
            </div>
                `
              }
              
          </div>
         
          <div class="comment_section gap-2 mt-1 mb-2">
            <div class="commentInputText">
              <div class="commentFlex d-flex align-items-center justify-content-between">

                <div class="comment_img me-3">
                  <img src="${
                    userData.imageUrl
                      ? userData.imageUrl
                      : "../imgs/profileImage.png"
                  }" alt=""/>
                </div>

                <input type="text" data-count_id_comment="${count}" class="commentInpt" id="commentInpt" placeholder="${
      "Comment as " + userData.username
    }">

                <div class="comment_icon_smile">
                  <i class="fa-regular fa-face-smile"></i>
                </div>

                  <div>
                    <i id="send_comment" data-user_id_f_post="${
                      post[item].userid
                    }" data-count_id_comment="${count}" data-post_id_comment="${
      post[item].postId
    }" class="fa-regular fa-paper-plane"></i>
                  </div>
              </div>
              <div class="comment_emojis"><div>
              </div>

              
              </div>
              <div class="post_comment_area" data-post_id_for_comment="${
                post[item].postId
              }" data-count="${count}" data-user_id_f_post="${
      post[item].userid
    }" data-postid="${post[item].postId}">
              </div>
          </div>

        </div>

          `;

    post_container.innerHTML += box;
    count++;
    savedAddFun();
    favouriteAddFun();
    // commentFun();
    getShareNum(post[item].userid);
  }

  addAllcommentsInPage();
  checkerSolidLove();
}

function addAllcommentsInPage() {
  let post_comment_area = document.querySelectorAll(".post_comment_area");
  post_comment_area.forEach((el, index) => {
    const starCountRef = ref(
      db,
      `users/${el.dataset.user_id_f_post}/posts/${el.dataset.post_id_for_comment}/comments/`
    );
    onValue(starCountRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        post_comment_area[index].innerHTML = "";
        for (const post in data) {
          box = `
            <div class="my-2 mt-1 comments_added gap-2 d-flex ">
                <div>
                    <img id="image_comment" src="${data[post].userImage}" alt="">
                </div>
                <div class="comment_content" data-user_id_for_img="${user_id}">
                <h6>${data[post].commentName}</h6>
                <section id="commentText">
                    ${data[post].commentText}
                </section>
                </div>
            </div>
            `;
          post_comment_area[index].innerHTML += box;
        }
      }
    });
  });
}

document.addEventListener("click", (e) => {
  if (e.target.id == "saved_icon") {
    savedFun(+e.target.dataset.postid, e, e.target.dataset.user_id_f_post);
  }
  if (e.target.id == "favourite_icon") {
    favouritesFun(
      +e.target.dataset.favoure_id,
      e,
      e.target.dataset.user_id_f_post
    );
  }

  if (e.target.id == "likeInHome") {
    likeFun(
      +e.target.dataset.lovenumber,
      +e.target.dataset.love_in_database_home,
      e.target.dataset.user_id_f_post_home
    );
  }
  if (e.target.classList.contains("inter_icons")) {
    likeFun(
      +e.target.children[0].dataset.lovenumber,
      +e.target.children[0].dataset.love_in_database_home,
      e.target.children[0].dataset.user_id_f_post_home
    );
  }

  if (e.target.id == "send_comment") {
    addCommentFun(
      +e.target.dataset.post_id_comment,
      +e.target.dataset.count_id_comment,
      e.target.dataset.user_id_f_post
    );
    changeSpanOfComment(
      +e.target.dataset.count_id_comment,
      +e.target.dataset.post_id_comment,
      e.target.dataset.user_id_f_post
    );
  }

  if (e.target.id == "share") {
    shareFun(
      +e.target.dataset.sharenumber,
      +e.target.dataset.share_in_database,
      e.target.dataset.user_id_share
    );
  }

  if (e.target.dataset.share) {
    shareFun(
      +e.target.children[0].dataset.sharenumber,
      +e.target.children[0].dataset.share_in_database,
      e.target.dataset.user_id_share
    );
  }
});

function shareFun(count, postId , userIdShared) {
  return new Promise((resolve) => {
    get(child(dbRef, `users/${userIdShared}/posts/${postId}/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          let data = snapshot.val();
          resolve(data);
          addSharedPost(data , postId , userIdShared);
          incrementShareNum(postId , userIdShared);
        }
      })
      .catch((error) => {
        console.error(error);
        console.log(error.message);
        console.log(error.code);
      });
  });
}
function checkPostsShare(id) {
  return new Promise((resolve) => {
    get(child(dbRef, `users/${id}/userAuth/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          let data = snapshot.val();
          if (data) {
            resolve(data);
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

async function addSharedPost(data , postId , userIdShared){
  let oraginalData = await checkPostsShare(userIdShared);
  console.log(oraginalData);
  update(ref(db, `users/${user_id}/posts/` + postId), {
    postText: data.postText ? data.postText : "",
    postImage: data.postImage ? data.postImage : "",
    loveNum: 0,
    shared: true,
    shareNum: (data.shareNum)?data.shareNum : 0,
    username: data.username,
    sharedAt: Date.now(),
    createdAt: data.createdAt,
    sharedImage: data.imageUrl ? data.imageUrl : "",
    imageUrl: data.imageUrl ? data.imageUrl : "",
    userid: user_id,
    userIdShared: userIdShared,
    postId: data.postId,
    oraginal_username: oraginalData.username,
    oraginal_image: oraginalData.imageUrl ? oraginalData.imageUrl : "../imgs/profileImage.png"
  });
}

function getShareNum(data) {
  get(child(dbRef, `users/${data}/posts/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        let result = snapshot.val();
        for (const item in result) {
          if(document.querySelector(`[data-post_id_share="${item}"]`)){
            document.querySelector(`[data-post_id_share="${item}"]`).innerHTML =
              result[item].shareNum ? result[item].shareNum : 0;
          }
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function incrementShareNum(postId , userIdShared) {
  let shareDiv = document.querySelector(`[data-post_id_share="${postId}"]`);
  set(ref(db, `users/${user_id}/shareList/` + postId), {
    postId: postId,
  });

  if (shareDiv.dataset.added == "false") {
    shareDiv.dataset.added = "true";
    window.localStorage.setItem("dataAdded", "true");
    shareDiv.innerHTML = +shareDiv.innerHTML + 1;
    update(ref(db, `users/${userIdShared}/posts/${postId}/`), {
      shareNum: Number(shareDiv.innerHTML),
    });
    update(ref(db, `users/${user_id}/posts/${postId}/`), {
      shareNum: Number(shareDiv.innerHTML),
    });
    sweetAlert("success", "post shared successfully in your account");
  } else {
    sweetAlert("info", "you already shared this post");
  }
}

function getShareNumFun() {
  get(child(dbRef, `users/${user_id}/shareList/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        let result = snapshot.val();
        console.log(result);
        for (const item in result) {
          if (document.querySelector(`[data-post_id_share="${item}"]`)) {
            document
              .querySelector(`[data-post_id_share="${item}"]`)
              .setAttribute("data-added", "true");
          }
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

getShareNumFun();

async function savedAddFun() {
  let savedListData = await savedPostsFromDatabase();
  let box;
  if (savedListData) {
    for (const item in savedListData) {
      box = document.querySelector(
        `[data-postid='${savedListData[item].postId}']`
      );
      if (box) {
        document
          .querySelector(`[data-postid='${savedListData[item].postId}']`)
          .classList.replace("fa-regular", "fa-solid");
      }
    }
  }
}

function savedFun(id, event, idOfUser) {
  if (event.target.classList.contains("fa-regular")) {
    event.target.classList.replace("fa-regular", "fa-solid");
    // saved post
    if (idOfUser == user_id) {
      set(ref(db, `users/${idOfUser}/savedList/` + id), {
        postId: id,
        userId: idOfUser,
      }).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    } else {
      set(ref(db, `users/${user_id}/savedList/` + id), {
        postId: id,
        userId: idOfUser,
      }).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    }
  } else {
    event.target.classList.replace("fa-solid", "fa-regular");
    // remove save

    if (idOfUser == user_id) {
      remove(ref(db, `users/${idOfUser}/savedList/` + id)).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    } else {
      remove(ref(db, `users/${user_id}/savedList/` + id)).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    }

    update(ref(db, `users/${idOfUser}/posts/${id}`), {
      saved: null,
    }).then((result) => {
      sweetAlert("success", "post unsaved");
    });
  }
}

function favouritesFun(id, event, idOfUser) {
  if (event.target.classList.contains("fa-regular")) {
    event.target.classList.replace("fa-regular", "fa-solid");
    // saved post
    if (idOfUser == user_id) {
      set(ref(db, `users/${idOfUser}/favouiteList/` + id), {
        postId: id,
        userId: idOfUser,
      }).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    } else {
      set(ref(db, `users/${user_id}/favouiteList/` + id), {
        postId: id,
        userId: idOfUser,
      }).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    }
  } else {
    event.target.classList.replace("fa-solid", "fa-regular");
    // remove save

    if (idOfUser == user_id) {
      remove(ref(db, `users/${idOfUser}/favouiteList/` + id)).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    } else {
      remove(ref(db, `users/${user_id}/favouiteList/` + id)).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    }

    update(ref(db, `users/${idOfUser}/posts/${id}`), {
      favouites: null,
    }).then((result) => {
      sweetAlert("success", "post unsaved");
    });
  }
}

async function favouriteAddFun() {
  let favouriteListData = await favouritePostsFromDatabase();
  let box;
  if (favouriteListData) {
    for (const item in favouriteListData) {
      box = document.querySelector(
        `[data-favoure_id='${favouriteListData[item].postId}']`
      );
      if (box != null) {
        document
          .querySelector(
            `[data-favoure_id='${favouriteListData[item].postId}']`
          )
          .classList.replace("fa-regular", "fa-solid");
      }
    }
  }
}

function likeFun(index, postId, userIdLove) {
  let love = document.querySelectorAll(`[data-love_in_database_home]`);
  let loveNum = document.querySelectorAll(`.loveNum`);
  if (love[index]) {
    if (love[index].classList.contains("fa-solid")) {
      love[index].classList.replace("fa-solid", "fa-regular");
      loveNum[index].innerHTML = +loveNum[index].innerHTML - 1;
      update(ref(db, `users/${userIdLove}/posts/${postId}`), {
        loveNum: Number(loveNum[index].innerHTML),
      });
      console.log(userIdLove);
      remove(
        ref(db, `users/${userIdLove}/posts/${postId}/loveList/` + user_id)
      );
    } else {
      love[index].classList.replace("fa-regular", "fa-solid");
      loveNum[index].innerHTML = +loveNum[index].innerHTML + 1;
      update(ref(db, `users/${userIdLove}/posts/${postId}`), {
        loveNum: Number(loveNum[index].innerHTML),
      });
      set(ref(db, `users/${userIdLove}/posts/${postId}/loveList/` + user_id), {
        loveList: user_id,
      });
    }
  }
}

function checkerSolidLove() {
  let love = document.querySelectorAll(`[data-love_in_database_home]`);
  let loveNum = document.querySelectorAll(`.loveNum`);
  love.forEach((el, index) => {
    if (el.dataset.lovenumber == index) {
      get(
        child(
          dbRef,
          `users/${el.dataset.user_id_f_post_home}/posts/${el.dataset.love_in_database_home}/`
        )
      )
        .then((snapshot) => {
          if (snapshot.exists()) {
            let sharenum = snapshot.val();
            let { loveList } = sharenum;            
            loveNum[index].innerHTML = sharenum.loveNum ? sharenum.loveNum : 0;
            for (const item in loveList) {
              if (item == user_id) {
                document
                  .querySelector(`[data-lovenumber='${index}']`)
                  .classList.replace("fa-regular", "fa-solid");
              }
            }
            for (const item in sharenum) {
              if (sharenum[item].loverNum == 0) {
                document
                  .querySelector(`[data-lovenumber='${index}']`)
                  .classList.replace("fa-solid", "fa-regular");
              }
            }
          }
        })
        .catch((error) => {
          console.error(error.message);
        });
    }
  });
}

let getUsernameFromLocalId = await getUsernameBasedLocalId();

function addCommentFun(id, num, idOfUser) {
  let commentInpt = document.querySelectorAll(".commentInpt");
  let post_comment_area = document.querySelectorAll(".post_comment_area");
  let timeId = Date.now();
  if (commentInpt[num].value != "") {
    post_comment_area[num].style.maxHeight = "230px";
    commentInpt[num].setAttribute("data-comment_done", "true");
    set(ref(db, `users/${idOfUser}/posts/${id}/comments/` + timeId), {
      userImage: getUsernameFromLocalId.imageUrl
        ? getUsernameFromLocalId.imageUrl
        : "../imgs/profileImage.png",
      commentId: timeId,
      commentName: getUsernameFromLocalId.username,
      commentText: commentInpt[num].value,
      userid: idOfUser,
    });
    commentInpt[num].value = "";
  } else {
    sweetAlert("error", "you have to fill Comment input");
  }
}

function changeSpanOfComment(id, postId, idOfUser) {
  let commentNum = document.querySelectorAll(".commentNum");
  let commentInpt = document.querySelectorAll(".commentInpt");
  if (commentInpt[id].dataset.comment_done == "true") {
    commentInpt[id].dataset.comment_done = "";
    commentNum[id].innerHTML = +commentNum[id].innerHTML + 1;
    update(ref(db, `users/${idOfUser}/posts/${postId}/`), {
      commentNum: Number(+commentNum[id].innerHTML),
    });
  }
}

function commentFun() {
  let commentNumber = document.querySelectorAll("[data-comment_span_count]");
  commentNumber.forEach((el, index) => {
    get(
      child(
        dbRef,
        `users/${el.dataset.user_id_f_post}/posts/${el.dataset.post_id}/commentNum/`
      )
    )
      .then((snapshot) => {
        if (snapshot.exists()) {
          let num = snapshot.val();
          commentNumber[index].innerHTML = num;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
}
commentFun();

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
let iconsDiv = document.querySelectorAll(".iconsDiv");

