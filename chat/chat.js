import { app } from "../config/config.js";
import {
  getDatabase,
  ref,
  onValue,
  get,
  child,
  update,
  onChildAdded,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

  
if (!window.localStorage.getItem("local_userId")) {
  window.location.href = "../Facebook-clone/register/login/login.html";
}

const db = getDatabase();
const dbRef = ref(getDatabase());
let user_id = window.localStorage.getItem("local_userId");
let urlSearch = window.location.search;
let urlObj = new URLSearchParams(urlSearch);
let userIdUrl = urlObj.get("userId");
let user_links_div = document.getElementById("user_links_div");
let messages = document.getElementById("messages");
let search_users = document.getElementById("search_users");
let all_users_search = document.getElementById("all_users_search");
let container;
let loading = document.querySelector(".loading");

function getAllusersFun() {
  return new Promise((resolve) => {
    const starCountRef = ref(db, `users/`);
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

search_users.addEventListener("input", (e) => {
  getAllUsersInSearch(search_users.value);
});
let no_users = document.getElementById("no_users");
async function getAllUsersInSearch(val) {
  let getAllusersVar = await getAllusersFun();
  all_users_search.style.display = "block";
  all_users_search.innerHTML = "";
  if (val != "") {
    let box;
    let arr = [];
    for (const item in getAllusersVar) {
      if(getAllusersVar[item].userAuth.user_id != user_id){
        if (getAllusersVar[item].userAuth.username.toLowerCase().startsWith(val.toLowerCase())) {
          arr.push(getAllusersVar[item].userAuth.username)
          box = `
          <div data-id_of_user="${getAllusersVar[item].userAuth.user_id}" class="d-flex align-items-center border-bottom pb-2 mb-2" id="searchLink">
          <img class="user_in_search" data-id_of_user="${getAllusersVar[item].userAuth.user_id}" src="${
            getAllusersVar[item].userAuth.imageUrl
            ? getAllusersVar[item].userAuth.imageUrl
            : "../imgs/profileImage.png"}" alt="">
            <h4 class="user_in_search" data-id_of_user="${getAllusersVar[item].userAuth.user_id}">
            ${getAllusersVar[item].userAuth.username}</h4>
          </div>
          `;
          all_users_search.innerHTML += box;
        }else{
          if(arr.length == 0){
            no_users.style.display = "block";
          }else{
            no_users.style.display = "none";
          }
        }
      }
    }
  }else{
    no_users.style.display = "none";
    all_users_search.style.display = "none";
  }
}

async function printAllUsers() {
  let getAllUsers = await getAllusersFun();
  for (const user in getAllUsers) {
    if (getAllUsers[user].userAuth.user_id != userIdUrl) {
      container = `
        <div id="user_link" data-id_of_user="${
          getAllUsers[user].userAuth.user_id
        }" class="d-flex gap-3 p-2  align-items-center user">
            <div class="user_image">
                <img data-id_of_user="${
                  getAllUsers[user].userAuth.user_id
                }" src="${
        getAllUsers[user].userAuth.imageUrl
          ? getAllUsers[user].userAuth.imageUrl
          : "../imgs/profileImage.png"
      }" alt="">
            </div>
            <div class="user_username">
                <h5 data-id_of_user="${getAllUsers[user].userAuth.user_id}">${
        getAllUsers[user].userAuth.username
      }</h5>
                <section id="user_message_title" data-id_of_user="${
                  getAllUsers[user].userAuth.user_id
                }" data-id_ofs_users="${
        getAllUsers[user].userAuth.user_id
      }" class="user_message_title">
                Message
                </section>
            </div>
        </div>
        `;
      user_links_div.innerHTML += container;
    }
  }
  loading.style.display = "none";
}
printAllUsers();

let div_bottom = document.getElementById("div_bottom");
let smile_icon = document.getElementById("smile_icon");
let emoji_icons = document.querySelector(".emoji_icons");
let emoji;
document.addEventListener("click", (e) => {
  if (e.target.dataset.id_of_user) {
    displayChat();
    getIdOfUser(e.target.dataset.id_of_user);
    getMessages(e.target.dataset.id_of_user);
    chat_at_bottom.style.display = "block";
    messages.style.scrollBehavior = "smooth";
    setTimeout(() => {
      messages.scrollTop = messages.scrollHeight;
    }, 200);
  }
});

function displayChat(){
  let chat_div = document.getElementById("chat_div");
  let backBtn = document.getElementById("backBtn");
  chat_div.style.display = "block";
  document.addEventListener("click",(e)=>{
    if(e.target.classList.contains("backBtn")){
      chat_div.style.display = "none";
    }
  })
  // console.log(backBtn);
  // backBtn.addEventListener("click" , ()=>{
  //   chat_div.style.display = "none";
  // })
}


smile_icon.addEventListener("click", () => {
  if (emoji_icons.style.display == "block") {
    emoji_icons.style.display = "none";
  } else {
    emoji_icons.style.display = "block";
  }
});

function getEmojis() {
  fetch(
    `https://emoji-api.com/emojis?access_key=7ce370ab562996f5a22a4557a65e384c247e046d`
  )
    .then((result) => result.json())
    .then((data) => {
      data.forEach((el, index) => {
        if (index <= 479) {
          emoji = `
              <span class="emojis_icon_span">
                ${el.character}
              </span>
            `;
          emoji_icons.innerHTML += emoji;
        }
      });
    });
}
getEmojis();

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("emojis_icon_span")) {
    message_inpt.value += e.target.innerHTML.trim();
  }
});

function getIdOfUser(id_of_user) {
  get(child(dbRef, `users/${id_of_user}/`))
    .then(async (snapshot) => {
      let data = snapshot.val();
      printSpecificUserInChat(data);
    })
    .catch((error) => {
      console.error(error);
    });
}

let box;
let chat_user = document.getElementById("chat_user");
let sendIcon = document.getElementById("send");
let chat_at_bottom = document.getElementById("chat_at_bottom");
async function printSpecificUserInChat(dataOfUser) {
  let arr = [];
  let { userAuth } = dataOfUser;
  let { followers } = dataOfUser;
  for (const item in followers) {
    arr.push(followers[item]);
  }
  box = `
    <div class="chat_title border-bottom pb-3 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
            <button class="btn btn-light d-block d-md-none backBtn"><i class="backBtn fa-solid fa-angle-left"></i></button>
            <a href="../users/user.html?userId=${userAuth.user_id}">
                <img class="rounded-circle" src="${
                  userAuth.imageUrl
                    ? userAuth.imageUrl
                    : "../imgs/profileImage.png"
                }" alt="">
            </a>
            <a href="../users/user.html?userId=${
              userAuth.user_id
            }" class="text-decoration-none">
                <h4 class="mb-0 text-dark titleChatName">${userAuth.username}</h4>
                <section><span class="active"></span>Active Now</section>
            </a>
        </div>
        <button class="btn btn-light btnChatName">
            ${arr.length > 0 ? `${arr.length} Following` : `No Following`}
        </button>
    </div>
  `;
  window.localStorage.setItem("id_of_user", userAuth.user_id);
  chat_user.innerHTML = box;
}

function getSpecificId() {
  return new Promise((resolve) => {
    get(child(dbRef, `users/${user_id}/`))
      .then(async (snapshot) => {
        let data = snapshot.val();
        resolve(data);
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

function getSpecificIdFromLocal(id) {

  return new Promise((resolve) => {
    get(child(dbRef, `users/${id}/userAuth/`))
      .then(async (snapshot) => {
        let data = snapshot.val();
        resolve(data);
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

let message_inpt = document.getElementById("message_inpt");
message_inpt.addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    setMessageDatabase();
    emoji_icons.style.display = "none";
    setTimeout(() => {
      messages.scrollTop = messages.scrollHeight;
    }, 150);
  }
});
sendIcon.addEventListener("click", () => {
  setMessageDatabase();
  emoji_icons.style.display = "none";
  setTimeout(() => {
    messages.scrollTop = messages.scrollHeight;
  }, 150);
});
const arabicRegex =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

message_inpt.addEventListener("input", (e) => {
  if (arabicRegex.test(message_inpt.value)) {
    message_inpt.style.textAlign = "right";
    message_inpt.style.direction = "rtl";
    message_inpt.placeholder = "أكتب رسالتك هنا...";
  } else {
    message_inpt.style.textAlign = "left";
    message_inpt.style.direction = "ltr";
    message_inpt.placeholder = "Write your message...";
  }
});

async function setMessageDatabase() {
  let { userAuth } = await getSpecificId();
  if (message_inpt.value != "") {
    if (message_inpt.value != " ") {
      let user_id_for_message = window.localStorage.getItem("id_of_user");
      update(ref(db, `chats/messages/` + Date.now()), {
        message: message_inpt.value.trim(),
        messageId: Date.now(),
        imageUrl: userAuth.imageUrl
          ? userAuth.imageUrl
          : "../imgs/profileImage.png",
        senderId: user_id, // message for him
        recieverId: user_id_for_message, // message for him
        timestamp: Date.now(),
      });
      message_inpt.value = "";
    } else {
      sweetAlert("info", "Space is not a message!");
    }
  } else {
    sweetAlert("error", "write message first!");
  }
}

async function getMessages(id_user) {
  let user_message_title = document.getElementById("user_message_title");
  let localUserName = await getSpecificIdFromLocal(id_user);

  messages.innerHTML = "";
  const starCountRef = ref(db, `chats/messages/`);
  onChildAdded(starCountRef, (snapshot) => {
    const data = snapshot.val();
    if (data.senderId == id_user && data.recieverId == user_id) {
      messages.innerHTML += `
        <div class="d-flex sender gap-2 align-items-center">
          <img src="${data.imageUrl}" alt="">
          <div class="mb-3">
            <section dir="${
              arabicRegex.test(data.message) ? "rtl" : "ltr"
            }" class="message_him ${
        arabicRegex.test(data.message) ? "text-end" : "text-start"
      }">${data.message}</section>
            <section class="time">${timeAgo(data.timestamp)}</section>
          </div>
        </div>
      `;
      setTimeout(() => {
        messages.scrollTop = messages.scrollHeight;
      }, 120);
      document.querySelector(`[data-id_ofs_users="${id_user}"]`).innerHTML = `${
        localUserName.username.split(" ")[0]
      } ${data.message}`;
    }
    if (data.recieverId == id_user && data.senderId == user_id) {
      messages.innerHTML += `
      <div class="mb-3">
        <section dir="${
          arabicRegex.test(data.message) ? "rtl" : "ltr"
        }" class="message_me ${
        arabicRegex.test(data.message) ? "text-end" : "text-start"
      }">${data.message}</section>
        <section class="time special_time">${timeAgo(data.timestamp)}</section>
      </div>
      `;
      setTimeout(() => {
        messages.scrollTop = messages.scrollHeight;
      }, 125);
      document.querySelector(
        `[data-id_ofs_users="${id_user}"]`
      ).innerHTML = `You: ${data.message}`;
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
