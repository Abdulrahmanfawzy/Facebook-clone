import { app } from "../config/config.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  child,
  update,
  remove,
  orderByChild,
  query,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  getStorage,
  ref as refStorage,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { profileImagesFun } from "../profile/profile.js";

if (!window.localStorage.getItem("local_userId")) {
  window.location.href = "https://abdulrahmanfawzy.github.io/Facebook-clone/register/login/login.html";
}

const db = getDatabase();
const dbRef = ref(getDatabase());
const storage = getStorage();
let user_id = window.localStorage.getItem("local_userId");
let post_container = document.getElementById("post_container");
let urlSearch = window.location.search;
let urlObj = new URLSearchParams(urlSearch);
let userIdUrl = urlObj.get("userId");
let loading = document.querySelector(".loading");
let profileImage = document.getElementById("profileImage");

profileImage.innerHTML = await profileImagesFun();

let close_profile = document.querySelector(".close_profile");
let open_profile = document.querySelector(".open_profile");
let profile_postion = document.querySelector(".profile_postion");
close_profile.addEventListener("click", () => {
  profile_postion.style.right = "-100%";
  open_profile.style.display = "block";
});
open_profile.addEventListener("click", () => {
  profile_postion.style.right = "0";
  open_profile.style.display = "none";
});

window.onresize = () => {
  console.log(window.innerWidth);
  if (window.innerWidth > 768) {
    open_profile.style.display = "none";
  }
};

window.onload = () => {
  loading.style.display = "none";
};

function getNumOfFollowering() {
  let arr = [];
  return new Promise((resolve) => {
    get(child(dbRef, `users/${user_id}/followers/`))
      .then((snapshot) => {
        let data = snapshot.val();
        for (const item in data) {
          arr.push(data[item]);
        }
        resolve(arr);
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

let getNumFollowering = await getNumOfFollowering();
let followersNum = document.getElementById("followersNum");
followersNum.innerHTML = `${
  getNumFollowering
    ? getNumFollowering.length >= 1
      ? `${getNumFollowering.length} Following`
      : "No Following"
    : ""
} `;

function handleFollowWordFun() {
  let element = document.getElementById("profile_follow");
  if (element) {
    getNumFollowering.forEach((el) => {
      if (el.userId == userIdUrl) {
        element.innerHTML = "Unfollow";
      } else {
        element.innerHTML = "Follow";
      }
    });
  }
}
handleFollowWordFun();

document.addEventListener("click", (e) => {
  if (e.target.id == "profile_follow") {
    handleProfileFollowFun(e.target);
  }
});

function handleProfileFollowFun(element) {
  if (element.innerHTML == "Follow") {
    element.innerHTML = "Unfollow";
    set(ref(db, `users/${user_id}/followers/` + userIdUrl), {
      userId:  userIdUrl,
      parentUserId: user_id,
    });
    sweetAlert("success", `Following is done`);
    location.reload();
  } else {
    element.innerHTML = "Follow";
    remove(ref(db, `users/${user_id}/followers/` + userIdUrl));
    sweetAlert("success", `Following is canceled`);
    location.reload();
  }
}

function getNumOfFollowers() {
  let arr2 = [];
  get(child(dbRef, `users/`)).then((snapshot) => {
    let data = snapshot.val();

    for (const item in data) {
      if (data[item].followers) {
        let followers = data[item].followers;
        for (const follower in followers) {
          console.log(followers[follower]);
          if (followers[follower].userId == userIdUrl) {
            console.log(followers[follower].userIdUrl);
            arr2.push(followers[follower].userIdUrl);
          }

        }
      }
    }
    console.log(arr2);
    getFollowersFun(arr2);
  });
}
getNumOfFollowers();

function getFollowersFun(arr3) {
  let getfollowerersNum = document.getElementById("followeringNum");
  console.log(arr3);
  getfollowerersNum.innerHTML = `${
    arr3.length == 0
      ? "No Followers"
      : arr3.length == 1
      ? `${arr3.length} Follower`
      : `${arr3.length} Followers`
  } `;
}

function getDataFromDatabase() {
  return new Promise((resolve, reject) => {
    const starCountRef = ref(db, `users/${userIdUrl}/`);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        resolve(data);
      } else {
        reject("error happend in user page");
      }
    });
  });
}

let title = await getDataFromDatabase();

document.title = `${title.userAuth.username}'s page`;

function getUsernameBasedLocalId() {
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
    const starCountRef = ref(db, `users/${user_id}/favouiteList/`);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data != null) {
        resolve(data);
      }
    });
  });
}

function getUserData() {
  return new Promise((resolve, reject) => {
    get(child(dbRef, `users/${userIdUrl}/userAuth`))
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
let box;
let postBtn = document.getElementById("postBtn");
let noPosts = document.querySelector(".noPosts");

document.addEventListener("click", (e) => {
  if (e.target.id == "postBtn") {
    printPostsInPage();
  }
});

export function getDataFromDatabase2() {
  return new Promise((resolve, reject) => {
    const starCountRef = ref(db, `users/${user_id}/`);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        resolve(data);
      } else {
        reject("error happend in user page");
      }
    });
  });
}

function getTimeStampFun() {
  return new Promise((resolve, reject) => {
    get(child(dbRef, `users/${user_id}/posts/`))
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

async function printPostsInPage() {
  if (userIdUrl != user_id) {
    handlePrintPosts(getDataFromDatabase);
  } else {
    handlePrintPosts(getDataFromDatabase2);
  }
}
printPostsInPage();

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
async function handlePrintPosts(funParam) {
  let count = 0;
  post_container.innerHTML = "";
  let { posts } = await funParam();
  let { userAuth } = await funParam();
  if (posts) {
    noPosts.style.display = "none";
    let dataArray = Object.entries(posts);
    dataArray.sort((a, b) => b[1].createdAt - a[1].createdAt);
    let sortedData = Object.fromEntries(dataArray);
    for (const post in sortedData) {
      box = `

        <div class="postItemInUser">
        ${
          sortedData[post].shared
            ? `
          <div>
          <div class="postItemFlex d-flex justify-content-between align-items-center">
              <a href="../users/user.html?userId=${
                userAuth.user_id
              }" class="post_title d-flex align-items-center gap-2">
              <img src=${
                userAuth.imageUrl
                  ? userAuth.imageUrl
                  : "../imgs/profileImage.png"
              } alt="" />
              <div> 
                  <h6 class="mb-0 text-start d-flex align-items-center " id="usernameAnother">${
                    userAuth.username
                  }</h6>
                  <section>${timeAgo(sortedData[post].sharedAt)}</section>
              </div>
              </a>
              <div class="icons">
              <i id="favourite_icon" data-favoure_id="${post}" class="fa-regular fa-star"></i>
              <i id="saved_icon" data-postid="${post}" class="fa-regular fa-bookmark savedIcon ms-1"></i>
              ${
                userIdUrl == user_id
                  ? `<i id="delete_icon" data-deleteid="${post}" class="ms-2 fa-solid fa-trash"></i>`
                  : ""
              }
              </div>

            
          </div>`
            : ""
        }
        <div class="${
          sortedData[post].shared ? "border mx-2 mt-2 pt-3 rounded-2" : ""
          }">
          <div class=" ${sortedData[post].shared ? "py-0 px-2" : ""} postItemFlex d-flex justify-content-between align-items-center">
              <a href="../users/user.html?userId=${sortedData[post].userIdShared ? sortedData[post].userIdShared : userAuth.user_id}" class="post_title d-flex align-items-center gap-2">
              <img src=${
                sortedData[post].shared
                  ? sortedData[post].sharedImage
                  : sortedData[post].image ? sortedData[post].image : 
                  userAuth.imageUrl
                  ? userAuth.imageUrl
                  : "../imgs/profileImage.png"
              } alt="" />
              <div> 
                  <h6 class="mb-0 d-flex align-items-center justify-content-center" id="usernameAnother">${
                    sortedData[post].username == userAuth.username
                      ? userAuth.username
                      : sortedData[post].username
                  }</h6>
                  <section>${timeAgo(sortedData[post].createdAt)}</section>
              </div>
              </a>
              ${
                sortedData[post].shared
                  ? ""
                  : `
                <div class="icons">
                <i id="favourite_icon" data-favoure_id="${post}" class="fa-regular fa-star"></i>
                <i id="saved_icon" data-postid="${post}" class="fa-regular fa-bookmark savedIcon ms-1"></i>
                ${
                  userIdUrl == user_id
                    ? `<i id="delete_icon" data-deleteid="${post}" class="ms-2 fa-solid fa-trash"></i>`
                    : ""
                }
                </div>
                `
              }
              
          </div>
          
          <div class="post_text mb-2 mt-3">
            <section class="${sortedData[post].shared ? "px-2" : ""}">
              ${
                sortedData[post].postText
                  ? `${
                      arabicRegex.test(sortedData[post].postText)
                        ? `<section dir="rtl">${sortedData[post].postText}</section>`
                        : sortedData[post].postText
                    }`
                  : ""
              }
            </section>
          </div>
          
          ${
            sortedData[post].postImage
              ? `<div class="post_image mt-2"><img src="${sortedData[post].postImage}" alt="" /></div>`
              : ""
          }
        </div>
        

        <div class="numbers mt-2 mb-2 d-flex justify-content-between">
            <div>
                <i class="fa-regular fa-heart"></i>
                <span data-love_span_count="${count}" data-post_id="${
        sortedData[post].postId
      }" class="loveNum">0</span>
            </div>
            <div class="d-flex gap-3">
                <div>
                    <i class="fa-regular fa-comment"></i>
                    <span class="commentNum" data-comment_span_count="${count}" data-post_id="${
        sortedData[post].postId
      }">0</span>
                </div>
                
                <div>
                    <i class="fa-solid fa-share"></i>
                    <span data-added="false" id="shareNum" data-count_num="${count}" data-share_span_count="${count}" data-post_id_share="${
        sortedData[post].postId
      }">0</span>
                </div>
            </div>
        </div>

        <div class="iteractive border-top d-flex justify-content-between align-items-center mt-2">
            <div class="inter_icons loveBtnClass w-100">
             <i id="like" data-love_in_database="${
               sortedData[post].postId
             }" data-lovenumber="${count}" class="fa-regular fa-heart me-1"></i> Love
            </div>
            <div data-counter="${count}" data-commented="commented" class="d-flex inter_icons align-items-center justify-content-center commentBtnClass">
              <i id="comment" data-counter="${count}" data-commented="commented" class="fa-regular fa-comment"></i>
              <span data-counter="${count}" data-commented="commented" class="ms-2">Comment</span>
            </div>
            ${ (sortedData[post].userid != user_id) ? 
              (userIdUrl != user_id)
                ? 
                `<div class="d-flex inter_icons align-items-center justify-content-center ">
                  <span data-share="share" data-user_id_share="${userIdUrl}" data-share_btn="${sortedData[post].postId}" class="ms-2">
                    <i id="share" data-user_id_share="${userIdUrl}" data-share_in_database="${sortedData[post].postId}" data-sharenumber="${count}" class="fa-regular fa-share-from-square">
                    </i> Share
                  </span>
                </div>`
                : ""
                : ""
            }
        </div>

        <div class="comment_section gap-2 mt-1 mb-2 ">
           
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
        user_id == userIdUrl
          ? "Comment as " + userData.username
          : `Write something to ${userData.username}`
      }">
                
                <div  class="comment_icon_smile">
                  <i class="fa-regular fa-face-smile"></i>
                </div>

                <div>
                  <i id="send_comment" data-count_id_comment="${count}" data-post_id_comment="${
        sortedData[post].postId
      }" class="fa-regular fa-paper-plane"></i>
                </div>
                </div>
                <div class="comment_emojis"><div>

                </div>
                </div>

             
                
            <div class="post_comment_area" data-count="${count}" data-postid= "${
        sortedData[post].postId
      }">
            </div>
        </div>
             
        </div>
        
        `;
      post_container.innerHTML += box;
      count++;
    }
    addAllcommentsInPage();
    savedAddFun();
    favouriteAddFun();
    loveFun();
    commentFun();
  }
}

function addAllcommentsInPage() {
  let post_comment_area = document.querySelectorAll(".post_comment_area");

  post_comment_area.forEach((el, index) => {
    const starCountRef = ref(
      db,
      `users/${userIdUrl}/posts/${el.dataset.postid}/comments/`
    );
    onValue(starCountRef, async (snapshot) => {
      const data = snapshot.val();

      if (data) {
        post_comment_area[index].innerHTML = "";
        for (const post in data) {
          box = `
              <div class="my-2 mt-1 comments_added gap-2 d-flex ">
                  <div>
                    <img id="image_comment" src="${
                      data[post].userImage
                    }" alt="">
                  </div>
                  <div class="comment_content" data-user_id_for_img="${user_id}">
                  <h6>${data[post].commentName}</h6>
                  <section id="commentText">
                    ${
                      arabicRegex.test(data[post].commentText)
                        ? `<section dir="rtl">${data[post].commentText}</section>`
                        : data[post].commentText
                    }
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

// favourites fun

async function favouiteFun() {
  let addFavourites = await getDataFromDatabase();
  let arr = [];
  for (const item in addFavourites) {
    if (addFavourites[item].favouites) {
      arr.push(addFavourites[item]);
    }
  }
  arr.forEach((el) => {
    let x = document.querySelector(`[data-favoure_id='${el.postId}']`);
    x.classList.replace("fa-regular", "fa-solid");
  });
}
favouiteFun();

function sweetAlert(icon, message) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1000,
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

document.addEventListener("click", (e) => {
  if (e.target.id == "delete_icon") {
    deletePost(+e.target.dataset.deleteid);
  }

  if (e.target.id == "saved_icon") {
    savedFun(+e.target.dataset.postid, e);
  }
  if (e.target.id == "favourite_icon") {
    favouritesFun(+e.target.dataset.favoure_id, e);
  }

  if (e.target.id == "like") {
    likeFun(+e.target.dataset.lovenumber, +e.target.dataset.love_in_database);
  }

  if (e.target.id == "share") {
    shareFun(
      +e.target.dataset.sharenumber,
      +e.target.dataset.share_in_database,
      e.target.dataset.user_id_share,
    );
  }

  if (e.target.dataset.share) {
    shareFun(
      +e.target.children[0].dataset.sharenumber,
      +e.target.children[0].dataset.share_in_database,
      e.target.dataset.user_id_share,
    );
  }

  if (e.target.classList.contains("inter_icons")) {
    likeFun(
      +e.target.children[0].dataset.lovenumber,
      +e.target.children[0].dataset.love_in_database
    );
  }

  if (e.target.id == "send_comment") {
    let post_comment_area = document.querySelectorAll(".post_comment_area");
    post_comment_area[+e.target.dataset.count_id_comment].style.maxHeight =
      "230px";
    addCommentFun(
      +e.target.dataset.post_id_comment,
      +e.target.dataset.count_id_comment
    );
    changeSpanOfComment(
      +e.target.dataset.count_id_comment,
      +e.target.dataset.post_id_comment
    );
  }
});
let getUsernameFromLocalId = await getUsernameBasedLocalId();
let shareNum = document.getElementById("shareNum");

function getShareNum() {
  get(child(dbRef, `users/${userIdUrl}/posts/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        let result = snapshot.val();
        for (const item in result) {
          document.querySelector(`[data-post_id_share="${item}"]`).innerHTML =
            result[item].shareNum ? result[item].shareNum : 0;
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
getShareNum();

function getShareNumFun() {
  get(child(dbRef, `users/${user_id}/shareList/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        let result = snapshot.val();
        if (result) {
          for (const item in result) {
            if (document.querySelector(`[data-post_id_share="${item}"]`)) {
              document
                .querySelector(`[data-post_id_share="${item}"]`)
                .setAttribute("data-added", "true");
            }
          }
        }
      }
    })
    .catch((error) => {
      console.log(error.code);
    });
}

getShareNumFun();

function shareFun(count, postId , userIdShared) {
  return new Promise((resolve) => {
    get(child(dbRef, `users/${userIdShared}/posts/${postId}/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          let data = snapshot.val();
          resolve(data);
          addSharedPost(data , postId , userIdShared);
          incrementShareNum(postId);
        }
      })
      .catch((error) => {
        console.log(error.message);
        console.log(error.code);
      });
  });
}

async function addSharedPost(data , postId , userIdShared){
  let oraginalData = await checkPostsShare();
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
    userid: data.userid,
    userIdShared: user_id,
    postId: data.postId,
    oraginal_username: oraginalData.username,
    oraginal_image: oraginalData.imageUrl ? oraginalData.imageUrl : "../imgs/profileImage.png"
  });
}

function checkPostsShare() {
  return new Promise((resolve) => {
    get(child(dbRef, `users/${user_id}/userAuth/`))
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


function incrementShareNum(postId) {
  let shareDiv = document.querySelector(`[data-post_id_share="${postId}"]`);
  set(ref(db, `users/${user_id}/shareList/` + postId), {
    postId: postId,
  });

  if (shareDiv.dataset.added == "false") {
    shareDiv.dataset.added = "true";
    window.localStorage.setItem("dataAdded", "true");
    shareDiv.innerHTML = +shareDiv.innerHTML + 1;
    update(ref(db, `users/${userIdUrl}/posts/${postId}/`), {
      shareNum: Number(shareDiv.innerHTML),
    });
    sweetAlert("success", "post shared successfully in your account");
  } else {
    sweetAlert("info", "you already shared this post");
  }
}


function getSharedPosts() {
  return new Promise((resolve) => {
    get(child(dbRef, `users/${userIdUrl}/postsShare/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          let data = snapshot.val();
          resolve(data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

let file_upload_profile_image = document.getElementById(
  "file_upload_profile_image"
);
let cover_imageInpt = document.getElementById("cover_imageInpt");
let user_img = document.getElementById("user_img");
let cover_image = document.getElementById("cover_image");
let processDivProfile = document.querySelector(".processDivProfile");
let processDivCoverProfile = document.querySelector(".processDivCoverProfile");

file_upload_profile_image.addEventListener("change", (e) => {
  uploadImageFun(e);
});

cover_imageInpt.addEventListener("change", (e) => {
  uploadImage_cover_Fun(e);
});

function uploadImage_cover_Fun(e) {
  const file = e.target.files[0];
  const storageRef = refStorage(storage, "profileCoverImage/" + file.name);
  const uploadTask = uploadBytesResumable(
    storageRef,
    file,
    "profileCoverImage/*"
  );

  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      loading.style.display = "flex";
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      const progress = Math.floor(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      processDivCoverProfile.style.width = progress + "%";
    },
    (error) => {
      console.log(error.message);
    },
    () => {
      // Upload completed successfully, now we can get the download URL
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        // processDivProfile.innerHTML = "";
        console.log(cover_image);

        cover_image.innerHTML = `<img src="${downloadURL}" alt="" />`;
        // cover_image.classList.replace("d-none", "d-block");
        loading.style.display = "none";
        processDivCoverProfile.style.width = 0;
        sweetAlert("success", "image updated successfully");
        addImage_CoverUrl_ToUserAuth(downloadURL);
      });
    }
  );
}

function addImage_CoverUrl_ToUserAuth(downloadURL) {
  update(ref(db, `users/${user_id}/userAuth/`), {
    coverImage: downloadURL,
  });
}
function uploadImageFun(e) {
  // Upload file and metadata to the object 'images/mountains.jpg';
  const file = e.target.files[0];
  const storageRef = refStorage(storage, "profileImages/" + file.name);
  const uploadTask = uploadBytesResumable(storageRef, file, "profileImages/*");

  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      loading.style.display = "flex";
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      const progress = Math.floor(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      processDivProfile.innerHTML = progress + "%";
    },
    (error) => {
      console.log(error.message);
    },
    () => {
      // Upload completed successfully, now we can get the download URL
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        processDivProfile.innerHTML = "";
        user_img.src = downloadURL;
        loading.style.display = "none";
        sweetAlert("success", "image updated successfully");
        addImageUrlToUserAuth(downloadURL);
      });
    }
  );
}

function addImageUrlToUserAuth(downloadURL) {
  update(ref(db, `users/${user_id}/userAuth/`), {
    imageUrl: downloadURL,
  }).then((result) => {
    location.reload();
    sweetAlert("success", "Image profile is updated successfully");
  });
}
let commentInpt = document.querySelectorAll(".commentInpt");

commentInpt.forEach((el) => {
  el.addEventListener("input", (e) => {
    if (arabicRegex.test(e.target.value)) {
      el.style.direction = "rtl";
    } else {
      el.style.direction = "ltr";
    }
  });
});

function addCommentFun(id, num) {
  let commentInpt = document.querySelectorAll(".commentInpt");
  let timeId = Date.now();
  if (commentInpt[num].value != "") {
    commentInpt[num].setAttribute("data-comment_done", "true");
    set(ref(db, `users/${userIdUrl}/posts/${id}/comments/` + timeId), {
      userImage: getUsernameFromLocalId.imageUrl
        ? getUsernameFromLocalId.imageUrl
        : "../imgs/profileImage.png",
      commentId: timeId,
      commentName: getUsernameFromLocalId.username,
      commentText: commentInpt[num].value,
    });
    commentInpt[num].value = "";
  } else {
    sweetAlert("error", "Write a comment please...");
  }
}

function deletePost(id) {
  remove(ref(db, `users/${userIdUrl}/posts/${id}`)).then((data) => {
    sweetAlert("success", "Post removed successfully");
    printPostsInPage();
  });
  remove(ref(db, `users/${userIdUrl}/postsShare/${id}`)).then((data) => {
    sweetAlert("success", "Post removed successfully");
  });
  remove(ref(db, `users/${user_id}/shareList/${id}`));
}

function savedFun(id, event) {
  if (event.target.classList.contains("fa-regular")) {
    event.target.classList.replace("fa-regular", "fa-solid");
    // saved post
    if (userIdUrl == user_id) {
      set(ref(db, `users/${userIdUrl}/savedList/` + id), {
        postId: id,
        userId: userIdUrl,
      }).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    } else {
      set(ref(db, `users/${user_id}/savedList/` + id), {
        postId: id,
        userId: userIdUrl,
      }).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    }
  } else {
    event.target.classList.replace("fa-solid", "fa-regular");
    // remove save

    if (userIdUrl == user_id) {
      remove(ref(db, `users/${userIdUrl}/savedList/` + id)).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    } else {
      remove(ref(db, `users/${user_id}/savedList/` + id)).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    }
  }
}

function favouritesFun(id, event) {
  if (event.target.classList.contains("fa-regular")) {
    event.target.classList.replace("fa-regular", "fa-solid");
    // saved post
    if (userIdUrl == user_id) {
      set(ref(db, `users/${userIdUrl}/favouiteList/` + id), {
        postId: id,
        userId: userIdUrl,
      }).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    } else {
      set(ref(db, `users/${user_id}/favouiteList/` + id), {
        postId: id,
        userId: userIdUrl,
      }).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    }
  } else {
    event.target.classList.replace("fa-solid", "fa-regular");
    // remove save

    if (userIdUrl == user_id) {
      remove(ref(db, `users/${userIdUrl}/favouiteList/` + id)).then(
        (result) => {
          sweetAlert("success", "post saved successfully");
        }
      );
    } else {
      remove(ref(db, `users/${user_id}/favouiteList/` + id)).then((result) => {
        sweetAlert("success", "post saved successfully");
      });
    }
  }
}

function likeFun(element, postId) {
  let loveIcon = document.querySelectorAll("[data-lovenumber]");
  if (loveIcon[element]) {
    if (loveIcon[element].classList.contains("fa-regular")) {
      loveIcon[element].classList.replace("fa-regular", "fa-solid");
      changeNumOfLove(element, "fa-solid", postId);
    } else {
      loveIcon[element].classList.replace("fa-solid", "fa-regular");
      changeNumOfLove(element, "fa-regular", postId);
    }
  }
}

function changeSpanOfComment(id, postId) {
  let commentNum = document.querySelectorAll(".commentNum");
  let commentInpt = document.querySelectorAll(".commentInpt");
  if (commentInpt[id].dataset.comment_done == "true") {
    commentInpt[id].dataset.comment_done = "";
    commentNum[id].innerHTML = +commentNum[id].innerHTML + 1;
    update(ref(db, `users/${userIdUrl}/posts/${postId}`), {
      commentNum: Number(+commentNum[id].innerHTML),
    });
  }
}

function changeNumOfLove(id, iconClass, postId) {
  let loveNum = document.querySelectorAll(".loveNum");
  if (loveNum[id].innerHTML == "undefined") {
    loveNum[id].innerHTML = 0;
  }
  if (iconClass == "fa-solid") {
    loveNum[id].innerHTML = +loveNum[id].innerHTML + 1;
    addLoveNumberToDatabase(postId, +loveNum[id].innerHTML);
  } else {
    loveNum[id].innerHTML = +loveNum[id].innerHTML - 1;
    removeLoveNumberToDatabase(postId, +loveNum[id].innerHTML);
  }
}

function addLoveNumberToDatabase(postId, id) {
  set(ref(db, `users/${userIdUrl}/posts/${postId}/loveList/` + user_id), {
    loveList: user_id,
  });
  update(ref(db, `users/${userIdUrl}/posts/${postId}`), {
    loveNum: Number(id),
  });
}

function removeLoveNumberToDatabase(postId, id) {
  remove(ref(db, `users/${userIdUrl}/posts/${postId}/loveList/` + user_id));

  update(ref(db, `users/${userIdUrl}/posts/${postId}`), {
    loveNum: Number(id),
  });
}

// saved posts
async function savedAddFun() {
  let savedListData = await savedPostsFromDatabase();
  let box;
  if (savedListData) {
    for (const item in savedListData) {
      box = document.querySelector(
        `[data-postid='${savedListData[item].postId}']`
      );
      if (document.querySelector(`[data-saver='${item}']`)) {
        document
          .querySelector(`[data-saver='${item}']`)
          .classList.replace("fa-regular", "fa-solid");
      }
      if (box != null) {
        document
          .querySelector(`[data-postid='${savedListData[item].postId}']`)
          .classList.replace("fa-regular", "fa-solid");
      }
    }
  }
}
savedAddFun();
async function favouriteAddFun() {
  let favouriteListData = await favouritePostsFromDatabase();
  let box;
  if (favouriteListData) {
    for (const item in favouriteListData) {
      box = document.querySelector(
        `[data-favoure_id='${favouriteListData[item].postId}']`
      );
      if (document.querySelector(`[data-fourite='${item}']`)) {
        document
          .querySelector(`[data-fourite='${item}']`)
          .classList.replace("fa-regular", "fa-solid");
      }
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
favouriteAddFun();

function loveFun() {
  const starCountRef = ref(db, `users/${userIdUrl}/posts/`);
  onValue(starCountRef, async (snapshot) => {
    const data = await snapshot.val();
    for (const item in data) {
      let icon = document.querySelector(
        `[data-love_in_database='${data[item].postId}']`
      );
      let loveSpan = document.querySelector(
        `[data-post_id='${data[item].postId}']`
      );
      if (loveSpan) {
        loveSpan.innerHTML = data[item].loveNum ? data[item].loveNum : "0";
      }
      let obj = data[item].loveList;

      ///////////////////////////////////////////////////////////////////

      for (let itemIter in obj) {
        if (itemIter == user_id) {
          icon.classList.replace("fa-regular", "fa-solid");
        }
      }
    }
  });
}
loveFun();

function commentFun() {
  let commentNumber = document.querySelectorAll("[data-comment_span_count]");
  commentNumber.forEach((el, index) => {
    get(
      child(dbRef, `users/${userIdUrl}/posts/${el.dataset.post_id}/commentNum/`)
    )
      .then((snapshot) => {
        if (snapshot.exists()) {
          let num = snapshot.val();
          commentNumber[el.dataset.comment_span_count].innerHTML = num;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
}
commentFun();

let edit_Bio_btn = document.getElementById("edit_Bio_btn");
let edit_details_btn = document.getElementById("edit_details_btn");
let bio_cancel = document.getElementById("bio_cancel");
let bio_save = document.getElementById("bio_save");
let bio_inpt = document.getElementById("bio_inpt");
let result_Bio = document.querySelector(".result_Bio");
let no_intro = document.querySelector(".no_intro");
let inpts = document.querySelectorAll(".inpts");
let bio_display_val = document.getElementById("bio_display_val");
let details_display_result = document.getElementById("details_display_result");
let details_display_val = document.getElementById("details_display_val");
let cancel_details_btn = document.getElementById("cancel_details_btn");
let save_details_btn = document.getElementById("save_details_btn");

let eductaion_inpt = document.getElementById("eductaion_inpt");
let work_inpt = document.getElementById("work_inpt");
let city_in_inpt = document.getElementById("city_in_inpt");
let city_from_inpt = document.getElementById("city_from_inpt");
let relationship = document.getElementById("relationship");
let education_div = document.querySelector(".education_div");
let work_div = document.querySelector(".work_div");
let liveIn_div = document.querySelector(".liveIn_div");
let from_div = document.querySelector(".from_div");
let relation_div = document.querySelector(".relation_div");
let no_details = document.getElementById("no_details");

function profile_details_fun() {
  if (user_id == userIdUrl) {
    edit_Bio_btn.style.display = "block";
    edit_details_btn.style.display = "block";
    handleDetailsFun();
  } else {
    edit_Bio_btn.style.display = "none";
    edit_details_btn.style.display = "none";
  }
}
profile_details_fun();

function handleDetailsFun() {
  edit_Bio_btn.addEventListener("click", () => {
    result_Bio.style.display = "block";
  });
  bio_cancel.addEventListener("click", () => {
    result_Bio.style.display = "none";
  });
  bio_save.addEventListener("click", saveBioFun);
  edit_details_btn.addEventListener("click", editDetailsFun);
}

function getBioFromDatabase() {
  get(child(dbRef, `users/${userIdUrl}/profile/`))
    .then((snapshot) => {
      let data = snapshot.val();
      if (data) {
        no_intro.style.display = "none";
        bio_display_val.style.display = "block";
        bio_display_val.innerHTML = data.Bio
          ? data.Bio
          : "No Intro has been added yet";
        bio_inpt.value = data.Bio ? data.Bio : "";
        eductaion_inpt.value = data.eductaion ? data.eductaion : "";
        work_inpt.value = data.work ? data.work : "";
        city_in_inpt.value = data.cityIn ? data.cityIn : "";
        city_from_inpt.value = data.relationship ? data.relationship : "";
        relationship.value = data.relationship ? data.relationship : "";

        education_div.innerHTML = data.eductaion
          ? `<li>${eductaion_inpt.dataset.pre_display_details} <strong>${data.eductaion}</strong></li>`
          : "";
        work_div.innerHTML = data.work
          ? `<li>${work_inpt.dataset.pre_display_details} <strong>${data.work}</strong></li>`
          : "";
        liveIn_div.innerHTML = data.cityIn
          ? `<li>${city_in_inpt.dataset.pre_display_details} <strong>${data.cityIn}</strong></li>`
          : "";
        from_div.innerHTML = data.cityFrom
          ? `<li>${city_from_inpt.dataset.pre_display_details} <strong>${data.cityFrom}</strong></li>`
          : "";
        relation_div.innerHTML = data.relationship
          ? `<li>${relationship.dataset.pre_display_details} <strong>${data.relationship}</strong></li>`
          : "";

        if (
          education_div.innerHTML != "" ||
          work_div.innerHTML != "" ||
          liveIn_div.innerHTML != "" ||
          from_div.innerHTML != "" ||
          relation_div.innerHTML != ""
        ) {
          no_details.style.display = "none";
        } else {
          no_details.style.display = "block";
        }
      } else {
        no_intro.style.display = "block";
        no_details.style.display = "block";
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

getBioFromDatabase();

function editDetailsFun() {
  details_display_val.style.display = "block";
  save_details_btn.addEventListener("click", () => {
    handleDetailsInptsFun();
  });
  cancel_details_btn.addEventListener("click", () => {
    details_display_val.style.display = "none";
    if (
      education_div.innerHTML != "" ||
      work_div.innerHTML != "" ||
      liveIn_div.innerHTML != "" ||
      from_div.innerHTML != "" ||
      relation_div.innerHTML != ""
    ) {
      no_details.style.display = "none";
    } else {
      no_details.style.display = "block";
    }
  });
}
function saveBioFun() {
  if (bio_inpt.value != "") {
    bio_display_val.style.display = "block";
    bio_display_val.innerHTML = bio_inpt.value;
    result_Bio.style.display = "none";
    no_intro.style.display = "none";
    update(ref(db, `users/${user_id}/profile/`), {
      Bio: bio_inpt.value,
    });
    sweetAlert("success", "Your bio added successfully");
  } else {
    update(ref(db, `users/${user_id}/profile/`), {
      Bio: "",
    });
    bio_display_val.innerHTML = "<h6>No Intro has been added yet</h6>";
  }
}

function handleDetailsInptsFun() {
  if (
    education_div.innerHTML != "" ||
    work_div.innerHTML != "" ||
    liveIn_div.innerHTML != "" ||
    from_div.innerHTML != "" ||
    relation_div.innerHTML != ""
  ) {
    no_details.style.display = "none";
  } else {
    no_details.style.display = "block";
  }
  inpts.forEach((el, index) => {
    document.querySelector(`[class="${el.dataset.info}"]`).innerHTML = el.value
      ? `<li>${el.dataset.pre_display_details} <strong>${el.value}</strong>`
      : "";
    update(ref(db, `users/${user_id}/profile/`), {
      eductaion: eductaion_inpt.value,
      work: work_inpt.value,
      cityIn: city_in_inpt.value,
      cityFrom: city_from_inpt.value,
      relationship: relationship.value,
    });
  });
}
