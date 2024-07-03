import { app } from "../config/config.js";
import {
  getDatabase,
  ref,
  onValue,
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
import { postStructure } from "../posts/post.js";

if (!window.localStorage.getItem("local_userId")) {
  window.location.href = "https://abdulrahmanfawzy.github.io/Facebook-clone/register/login/login.html";
}

const storage = getStorage();
const db = getDatabase();
const dbRef = ref(getDatabase());
let user_id = window.localStorage.getItem("local_userId");
let urlSearch = window.location.search;
let urlObj = new URLSearchParams(urlSearch);
let userIdUrl = urlObj.get("userId");


let friend_parent = document.querySelector(".friend_parent");
let suggestions = document.querySelector("#suggestions");
let suggest_overlay = document.querySelector("#suggest_overlay");

document.addEventListener("click", (e) => {
  if (e.target.id == "suggest_overlay") {
    suggest_overlay.style.display = "none";
    friend_parent.style.right = "-60%";
    suggestions.innerHTML = "suggestions";
    suggestions.style.left = "-74px";
  }
});

if (suggestions) {
  suggestions.addEventListener("click", (e) => {
    if (friend_parent.style.right == "0px") {
      friend_parent.style.right = "-60%";
      suggestions.innerHTML = "suggestions";
      suggestions.style.left = "-74px";
      suggest_overlay.style.display = "none";
    } else {
      friend_parent.style.right = "0px";
      suggestions.innerHTML = "close";
      suggestions.style.left = "-47px";
      suggest_overlay.style.display = "block";
    }
  });
}

function getUserDatas() {
  if (userIdUrl) {
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
function getUserDatasToOther() {
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
let userDatas = await getUserDatas();
let userDatasToAnother = await getUserDatasToOther();

let post = document.getElementById("post");
if (post) {
  post.innerHTML = await postStructure();
}

let postInpt = document.getElementById("postInpt");

if (postInpt) {
  postInpt.addEventListener("input", (e) => {
    const arabicRegex =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

    if (arabicRegex.test(e.target.value)) {
      e.target.style.direction = "rtl";
    } else {
      e.target.style.direction = "ltr";
    }
  });
}

function handlePost() {
  let left_items = document.querySelector(".left_items");
  let barMenu = document.getElementById("barMenu");
  let cancelMenu = document.querySelector(".cancelMenu");

  let postBtn = document.getElementById("postBtn");
  let photo = document.querySelector(".photo");
  let imageUploadDiv = document.querySelector(".imageUploadDiv");
  let imageUpload = document.querySelector(".imageUploadDiv img");
  let cancelImage = document.querySelector(".cancelImage");
  let fileUpload = document.querySelector("#fileUpload");
  let loading = document.querySelector(".loading");

  loading.style.display = "none";
  document.addEventListener("click", (e) => {
    if (e.target.id == "barMenu") {
      left_items.style.left = "0px";
    }
  });
  cancelMenu.addEventListener("click", () => {
    left_items.style.left = "-250px";
  });
  let open_profile = document.querySelector(".open_profile");

  window.onresize = () => {
    if (window.innerWidth > 991) {
      if (suggest_overlay) {
        suggest_overlay.style.display = "none";
      }
    }
    if (window.innerWidth < 991) {
      if (friend_parent) {
        if (friend_parent.style.right == "0px") {
          suggest_overlay.style.display = "block";
        } else {
          suggest_overlay.style.display = "none";
        }
      }
    }
    if (window.innerWidth > 768) {
      left_items.style.left = "20px";
      if (open_profile) {
        open_profile.style.display = "none";
      }
    } else {
      left_items.style.left = "-250px";
      if (open_profile) {
        open_profile.style.display = "block";
      }
    }
  };

  if (postInpt) {
    postInpt.addEventListener("input", (e) => {
      postInptHeight(e);
      if (e.target.value.length > 0) {
        showPostBtnFun();
      } else {
        hidePostBtnFun();
      }
    });
  }

  if (imageUpload) {
    if (imageUpload.dataset.uploaded == "true") {
      imageUpload.dataset.uploaded = "false";
      showPostBtnFun();
    } else {
      hidePostBtnFun();
    }
  }

  function postInptHeight(e) {
    if (e.target.value.length > 0) {
      postInpt.style.height = postInpt.scrollHeight + "px";
      if (postInpt.scrollHeight > 100) {
        postInpt.style.overflow = "auto";
      }
    } else {
      postInpt.style.height = "45px";
      postInpt.style.overflow = "hidden";
    }
  }

  if (cancelImage) {
    cancelImage.addEventListener("click", cancelImageFun);
  }

  // photo.addEventListener("click", () => {
  //   // imageUploadDiv.style.display = "block";
  //   // postBtn.style.display = "block";
  // });

  function showPostBtnFun() {
    postBtn.style.display = "block";
  }
  function hidePostBtnFun() {
    postBtn.style.display = "none";
  }

  function cancelImageFun() {
    if (postInpt.value.length > 0) {
      showPostBtnFun();
    } else {
      hidePostBtnFun();
    }
    imageUpload.dataset.uploaded = "false";
    imageUpload.src = "";
    processDiv.style.width = 0;
    imageUploadDiv.style.display = "none";
  }

  // post functions

  let processDiv = document.querySelector("#processDiv");

  if (postBtn) {
    postBtn.addEventListener("click", () => {
      document.getElementById("emojis").style.display = "none";
      addPost();
    });
  }

  function addPost() {
    if (!userIdUrl) {
      handleDisplayingPost();
    }
    if (userIdUrl == user_id) {
      handleDisplayingPost();
    } else {
      handleDisplayingPost2();
    }
  }

  function handleDisplayingPost() {
    let timeId = Date.now();
    postInpt.style.direction = "ltr";
    if (postInpt.value != "" && imageUpload.dataset.uploaded == "false") {
      set(ref(db, `users/${user_id}/posts/` + timeId), {
        postId: timeId,
        postText: postInpt.value,
        username: userDatasToAnother.username,
        imageUrl: userDatasToAnother.imageUrl
          ? userDatasToAnother.imageUrl
          : "../imgs/profileImage.png",
        userid: user_id,
        createdAt: Date.now(),
      });
      sweetAlert("success", "post published successfully");
      postInpt.value = "";
      imageUpload.dataset.uploaded = "false";
      imageUploadDiv.style.display = "none";
    }
    if (postInpt.value == "" && imageUpload.dataset.uploaded == "true") {
      set(ref(db, `users/${user_id}/posts/` + timeId), {
        postId: timeId,
        postImage: imageUpload.src,
        username: userDatasToAnother.username,
        imageUrl: userDatasToAnother.imageUrl
          ? userDatasToAnother.imageUrl
          : "../imgs/profileImage.png",
        userid: user_id,
        createdAt: Date.now(),
      });
      sweetAlert("success", "post published successfully");
      postInpt.value = "";
      imageUpload.dataset.uploaded = "false";
      imageUploadDiv.style.display = "none";
    }
    if (postInpt.value != "" && imageUpload.dataset.uploaded == "true") {
      set(ref(db, `users/${user_id}/posts/` + timeId), {
        postId: timeId,
        postText: postInpt.value,
        postImage: imageUpload.src,
        username: userDatasToAnother.username,
        imageUrl: userDatasToAnother.imageUrl
          ? userDatasToAnother.imageUrl
          : "../imgs/profileImage.png",
        userid: user_id,
        createdAt: Date.now(),
      });
      sweetAlert("success", "post published successfully");
      postInpt.value = "";
      imageUpload.dataset.uploaded = "false";
      imageUploadDiv.style.display = "none";
    }
    hidePostBtnFun();
    processDiv.style.width = 0;
  }

  function handleDisplayingPost2() {
    let timeId = Date.now();

    if (postInpt.value != "" && imageUpload.dataset.uploaded == "false") {
      set(ref(db, `users/${userIdUrl}/posts/` + timeId), {
        postId: timeId,
        postText: postInpt.value,
        username: `<span>${userDatasToAnother.username}</span> <i class="fa-solid fa-caret-right"></i> <span>${userDatas.username}</span>`,
        imageUrl: userDatas.imageUrl
          ? userDatas.imageUrl
          : "../imgs/profileImage.png",
        userid: userIdUrl,
        createdAt: Date.now(),
        image: userDatasToAnother.imageUrl
          ? userDatasToAnother.imageUrl
          : "../imgs/profileImage.png",
      });
      sweetAlert("success", "post published successfully");
      postInpt.value = "";
      imageUpload.dataset.uploaded = "false";
      imageUploadDiv.style.display = "none";
    }
    if (postInpt.value == "" && imageUpload.dataset.uploaded == "true") {
      set(ref(db, `users/${userIdUrl}/posts/` + timeId), {
        postId: timeId,
        postImage: imageUpload.src,
        username: `${userDatasToAnother.username} <i class="fa-solid fa-caret-right"></i> ${userDatas.username}`,
        imageUrl: userDatas.imageUrl
          ? userDatas.imageUrl
          : "../imgs/profileImage.png",
        userid: userIdUrl,
        createdAt: Date.now(),
        image: userDatasToAnother.imageUrl
          ? userDatasToAnother.imageUrl
          : "../imgs/profileImage.png",
      });
      sweetAlert("success", "post published successfully");
      postInpt.value = "";
      imageUpload.dataset.uploaded = "false";
      imageUploadDiv.style.display = "none";
    }
    if (postInpt.value != "" && imageUpload.dataset.uploaded == "true") {
      set(ref(db, `users/${userIdUrl}/posts/` + timeId), {
        postId: timeId,
        postText: postInpt.value,
        postImage: imageUpload.src,
        username: `${userDatasToAnother.username} <i class="fa-solid fa-caret-right"></i> ${userDatas.username}`,
        imageUrl: userDatas.imageUrl
          ? userDatas.imageUrl
          : "../imgs/profileImage.png",
        userid: userIdUrl,
        createdAt: Date.now(),
        image: userDatasToAnother.imageUrl
          ? userDatasToAnother.imageUrl
          : "../imgs/profileImage.png",
      });
      sweetAlert("success", "post published successfully");
      postInpt.value = "";
      imageUpload.dataset.uploaded = "false";
      imageUploadDiv.style.display = "none";
    }
    hidePostBtnFun();
    processDiv.style.width = 0;
  }

  if (fileUpload) {
    fileUpload.addEventListener("change", (e) => {
      imageUploadFun(e);
    });
  }

  function imageUploadFun(e) {
    // Upload file and metadata to the object 'images/mountains.jpg';
    const file = e.target.files[0];
    const storageRef = refStorage(storage, "images/" + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file, "image/*");

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        loading.style.display = "flex";
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = Math.floor(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        processDiv.style.width = progress + "%";
      },
      (error) => {
        console.log(error.message);
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          imageUploadDiv.style.display = "block";
          imageUpload.src = downloadURL;
          imageUpload.setAttribute("data-uploaded", "true");
          loading.style.display = "none";
          postBtn.style.display = "block";
        });
      }
    );
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

handlePost();

// add users in home page.

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

// search function
let getUsersNameForSearch = await getUsersFromDatabase();
let searchInpt = document.getElementById("searchInpt");
let searchIcon = document.getElementById("searchIcon");
let searchResult = document.getElementById("searchResult");

searchIcon.addEventListener("click", (e) => handelSearch(e));
searchInpt.addEventListener("keyup", (e) => {
  const arabicRegex =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  if (arabicRegex.test(e.target.value)) {
    e.target.style.direction = "rtl";
  } else {
    e.target.style.direction = "ltr";
  }
  handelSearch(e);
});
let searchDiv = document.querySelector(".search");
let searchNoResult = document.querySelector("#searchNoResult");
function handelSearch(e) {
  if (searchInpt.value != "") {
    searchResult.style.display = "block";
    searchResult.innerHTML = "";
    let arr = [];
    searchDiv.style.borderBottomLeftRadius = "0px";
    searchDiv.style.borderBottomRightRadius = "0px";
    for (const item in getUsersNameForSearch) {
      let { userAuth } = getUsersNameForSearch[item];
      if (
        userAuth.username
          .toLowerCase()
          .startsWith(searchInpt.value.toLowerCase())
      ) {
        arr.push(userAuth.username);
        printSearchResults(userAuth);
        searchNoResult.style.display = "none";
      } else {
        if (arr.length == 0) {
          searchNoResult.style.display = "block";
        } else {
          searchNoResult.style.display = "none";
        }
      }
    }
  } else {
    searchResult.style.display = "none";
    searchNoResult.style.display = "none";
    searchDiv.style.borderBottomLeftRadius = "30px";
    searchDiv.style.borderBottomRightRadius = "30px";
    if (e.type == "click" && searchInpt.value.length < 1) {
      sweetAlert("error", "Fill search input please!");
    }
  }
}

let box;
function printSearchResults(objectOfUser) {
  box = `
      <a class="d-flex align-items-center border-bottom pb-2 mb-2" id="searchLink" href="${
        userIdUrl
          ? `../users/user.html?userId=${objectOfUser.user_id}`
          : `users/user.html?userId=${objectOfUser.user_id}`
      }">
        <img src="${
          objectOfUser.imageUrl
            ? objectOfUser.imageUrl
            : userIdUrl
            ? "../imgs/profileImage.png"
            : window.location.pathname.includes("/friends")
            ? "../imgs/profileImage.png"
            : "imgs/profileImage.png"
        }" alt="">
        <h4>${objectOfUser.username}</h4>
      </a>
      `;
  searchResult.innerHTML += box;
}

let feeling = document.querySelector(".feeling");
let loader = document.querySelector(".loader");
let emojis = document.getElementById("emojis");
let emoji;
if (feeling) {
  feeling.addEventListener("click", (e) => {
    if (emojis.style.display == "block") {
      emojis.style.display = "none";
    } else {
      emojis.style.display = "block";
    }
  });
}

function displayImojisFun() {
  return new Promise((resolve) => {
    fetch(
      `https://emoji-api.com/emojis?access_key=7ce370ab562996f5a22a4557a65e384c247e046d`
    )
      .then((result) => result.json())
      .then((data) => {
        data.forEach((el, index) => {
          if (index <= 300) {
            emoji = `
              <span class="emojis_icons">
                ${el.character}
              </span>
            `;
            if (emojis) {
              emojis.innerHTML += emoji;
            }
          }
        });
        resolve(emojis);
      });
  });
}
await displayImojisFun();

function emojiFun() {
  let emojis_icons = document.querySelectorAll(".emojis_icons");
  emojis_icons.forEach((el) => {
    el.addEventListener("click", (e) => {
      postInpt.value += e.target.innerHTML.trim();
      postBtn.style.display = "block";
    });
  });
}
emojiFun();

let comment_icon_smile = document.querySelectorAll(".comment_icon_smile");
let comment_emojis = document.querySelectorAll(".comment_emojis");
let emojiComment;
comment_icon_smile.forEach((el, index) => {
  if (el) {
    el.addEventListener("click", (e) => {
      if (comment_emojis[index].style.display == "block") {
        comment_emojis[index].style.display = "none";
      } else {
        comment_emojis[index].style.display = "block";
      }
    });
  }
});

function displayImojisFunComment() {
  let comment_emojis = document.querySelectorAll(".comment_emojis");
  return new Promise((resolve) => {
    fetch(
      `https://emoji-api.com/emojis?access_key=7ce370ab562996f5a22a4557a65e384c247e046d`
    )
      .then((result) => result.json())
      .then((data) => {
        data.forEach((el, index) => {
          if (index <= 300) {
            emojiComment = `
              <span class="emojis_icons">
                ${el.character}
              </span>
            `;
            comment_emojis.forEach((el) => {
              el.innerHTML += emojiComment;
            });
          }
        });
        resolve(comment_emojis);
      });
  });
}
await displayImojisFunComment();

function emojiFunComment() {
  let comment_icon_smile = document.querySelectorAll(".comment_icon_smile");
  let commentInpt = document.querySelectorAll(".commentInpt");
  let emojis_icons = document.querySelectorAll(".emojis_icons");
  emojis_icons.forEach((el, index) => {
    el.addEventListener("click", (e) => {
      if (el.parentElement.previousElementSibling.children[1]) {
        el.parentElement.previousElementSibling.children[1].value +=
          el.innerHTML.trim();
      }
    });
  });
}
emojiFunComment();

document.addEventListener("click", (e) => logoutFun(e));

function logoutFun(e) {
  if (e.target.id == "logout") {
    window.localStorage.removeItem("local_userId");
    window.location.href = "/Facebook-clone/register/login/login.html";
  }
}

document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("video") ||
    e.target.classList.contains("groups") ||
    e.target.classList.contains("pages")
  ) {
    sweetAlert("info", "This feature will be added soon");
  }
  if (e.target.dataset.commented) {
    let post_comment_area = document.querySelectorAll(`.post_comment_area`);
    let comment_emojis = document.querySelectorAll(`.comment_emojis`);
    let counter = document.querySelector(
      `[data-counter="${e.target.dataset.counter}"]`
    );

    if (
      post_comment_area[e.target.dataset.counter].style.maxHeight == "230px"
    ) {
      post_comment_area[e.target.dataset.counter].style.maxHeight = "0px";
      comment_emojis[e.target.dataset.counter].style.top = "100%";
    } else {
      post_comment_area[e.target.dataset.counter].style.maxHeight = "230px";
      comment_emojis[e.target.dataset.counter].style.top = "40%";
    }
  }
});
