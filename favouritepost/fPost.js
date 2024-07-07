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
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

if (!window.localStorage.getItem("local_userId")) {
  window.location.href = "https://abdulrahmanfawzy.github.io/Facebook-clone/register/login/login.html";
}

const db = getDatabase();
const dbRef = ref(getDatabase());
let user_id = window.localStorage.getItem("local_userId");
let postFav = document.querySelector("#postFav");


function getDataFromsavedList() {
  return new Promise((resolve, reject) => {
    const starCountRef = ref(db, `users/${user_id}/favouiteList/`);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        resolve(data);
      }else {
        postFav.innerHTML = "<h5 class='dataFav'>No Favourite Posts yet</h5>";
      }
    });
  });
}

let fitchData = await getDataFromsavedList();
let box;
let arr = [];

function getPost() {
  for (const post in fitchData) {
    get(child(dbRef, `users/${fitchData[post].userId}/posts/${fitchData[post].postId}`)).then((snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        arr.push(data);
        printPosts(arr , fitchData[post].userId);
      }
    });
  }
}

function getPostShared() {
  for (const post in fitchData) {
    get(child(dbRef, `users/${fitchData[post].userId}/postsShare/${fitchData[post].postId}`)).then((snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.val();
        arr.push(data);
        printPosts(arr , fitchData[post].userId);
      }
    });
  }
}
getPostShared();
getPost();

function printPosts(dataList , user_id_from_post){
    postFav.innerHTML = "";
    dataList.forEach((el,index) => {
        box = `
        <div class="postItem d-flex gap-3">
            <a href="../users/user.html?userId=${user_id_from_post}" class='postImage'>
              <img src="${(el.postImage)?el.postImage:(el.imageUrl)?el.imageUrl : "../imgs/profileImage.png"}" alt="" />
            </a>
            <div>
                <h4>
                    <a href="../users/user.html?userId=${user_id_from_post}">${(el.postText)? el.postText : ""}</a>
                </h4>
                <div class="d-flex align-items-center gap-2">
                    <div class="profileImage">
                      <img src="${(el.imageUrl)?el.imageUrl : "../imgs/profileImage.png"}" alt="">                    
                    </div>
                    <section>
                      Saved from <strong>${el.username}'s</strong> Post
                    </section>
                </div>
                <button id="unsavedBtn" data-userid_from_post=${user_id_from_post} data-index="${index}" data-post_id_saved="${el.postId}" class="mt-4">Unfavourite post</button>
            </div>
        </div>
        `;
        postFav.innerHTML += box;
    });

}

document.addEventListener("click",(e)=>{
  if(e.target.id == "unsavedBtn"){
    unsavedFun(+e.target.dataset.index , +e.target.dataset.post_id_saved , e.target.dataset.userid_from_post);
  }

})

function unsavedFun(index , postId,userIdFromPost){
  console.log(postId);
  let postItem = document.querySelectorAll(".postItem");
  remove(ref(db, `users/${user_id}/favouiteList/`+postId)).then((data) => {
    sweetAlert("success", "Post unsaved successfully");
    arr.splice(index,1);
    printPosts(arr , userIdFromPost);
    if(arr.length == 0){
      postFav.innerHTML = "<h5 class='dataFav'>There are no favourite posts yet</h5>";
    }
  });
}

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
