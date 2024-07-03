import { app } from "../config/config.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const auth = getAuth();
const db = getDatabase();

let username = document.getElementById("username");
let emailSignup = document.getElementById("emailSignup");
let passwordSignup = document.getElementById("passwordSignup");
let createAccount = document.getElementById("createAccount");
let alertDiv = document.querySelectorAll(".alertDiv");
let inpt = document.querySelectorAll(".inpt");
let emailValidAlert = document.querySelectorAll(".emailValidAlert");
let form = document.querySelector("form");
// signin
let emailLogin = document.getElementById("emailLogin");
let passwordLogin = document.getElementById("passwordLogin");
let loginBtn = document.getElementById("loginBtn");
let inptLogin = document.querySelectorAll(".inptLogin");

document.addEventListener("click", (e) => {
  if (e.target.id == "createAccount") {
    signupFun(e);
  }
});

document.addEventListener("click", (e) => {
  if (e.target.id == "loginBtn") {
    loginFun(e);
  }
});

inpt.forEach((el, index) => {
  el.addEventListener("input", (e) => {
    if (e.target.value.length > 0) {
      alertDiv[index].innerHTML = "";
    } else {
      alertDiv[index].innerHTML = "Input field is required";
    }
  });
});

inptLogin.forEach((el, index) => {
  el.addEventListener("input", (e) => {
    if (e.target.value.length > 0) {
      alertDiv[index].innerHTML = "";
    } else {
      alertDiv[index].innerHTML = "Input field is required";
    }
  });
});

let validEmail;
let validPass;

function signupFun(e) {
  e.preventDefault();
  if (
    username.value != "" &&
    emailSignup.value != "" &&
    passwordSignup.value != ""
  ) {
    inpt.forEach((el, index) => {
      if (el.value.length > 0) {
        alertDiv[index].innerHTML = "";
      } else {
        alertDiv[index].innerHTML = "Input field is required";
      }
    });

    // email validation
    let emailValid = /^[a-zA-Z0-9-_\.]+@[a-zA-Z0-9-_\.]+\.[a-zA-Z]{2,}$/g;
    let passValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$/g;

    if (emailValid.test(emailSignup.value)) {
      validEmail = true;
      emailValidAlert[0].innerHTML = "";
    } else {
      validEmail = false;
      emailValidAlert[0].innerHTML = "Email is not valid";
    }
    if (passValid.test(passwordSignup.value)) {
      validPass = true;
      emailValidAlert[1].innerHTML = "";
    } else {
      validPass = false;
      emailValidAlert[1].innerHTML =
        "password must be one digit, one lowercase, one uppercase and at least 6 charcters";
    }

    if (validEmail == true && validPass == true) {
      createUserWithEmailAndPassword(
        auth,
        emailSignup.value,
        passwordSignup.value
      )
        .then((userCredential) => {
          const user = userCredential.user;
          let userId = user.uid;
          window.localStorage.setItem("local_userId", userId);
          writeUserData(userId, username.value, emailSignup.value);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorMessage);
          console.log(errorCode);
          if (errorCode == "auth/email-already-in-use") {
            sweetAlert("error", "Email is already used!");
          }
        });
    } else {
      sweetAlert("error", "Email or password is not valid!");
    }
  } else {
    inpt.forEach((el, index) => {
      if (el.value.length > 0) {
        alertDiv[index].innerHTML = "";
      } else {
        alertDiv[index].innerHTML = "Input field is required";
      }
    });
  }
}

// set user data into database...

function writeUserData(userId, username, email) {
  set(ref(db, `users/${userId}/userAuth/`), {
    user_id: userId,
    username: username,
    email: email,
  }).then(()=>{
    sweetAlert("success" , "Your registration is done");
    window.localStorage.setItem("local_userId", userId);
    window.location.href = "../../index.html";
  })
  form.reset();
}

function sweetAlert(icon, message) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
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

// signin

function loginFun(e) {
  e.preventDefault();
  if (emailLogin.value != "" && passwordLogin.value != "") {
    inptLogin.forEach((el, index) => {
      if (el.value.length > 0) {
        alertDiv[index].innerHTML = "";
      } else {
        alertDiv[index].innerHTML = "Input field is required";
      }
    });

    signInWithEmailAndPassword(auth, emailLogin.value, passwordLogin.value)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        let userId = user.uid;
        form.reset();
        window.localStorage.setItem("local_userId", userId);
        window.location.href = "../../index.html";
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
        if (errorCode == "auth/invalid-credential") {
          sweetAlert("error", "Email or password is not valid");
        }
      });
  } else {
    inptLogin.forEach((el, index) => {
      if (el.value.length > 0) {
        alertDiv[index].innerHTML = "";
      } else {
        alertDiv[index].innerHTML = "Input field is required";
      }
    });
  }
}
