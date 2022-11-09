"use strict";
var messageForm = document.getElementByld("message-form");
var messagelnput = document.getElementBylId("new-post-message");
var titlelnput = document.getElementByld("new-post-title");
var signlnButton = document.getElementByld("sign-in-button");
var signOutButton = document.getElementByld("sign-out-button");
var splashPage = document.getElementByld("page-splash");
var addPost = document.getElementById("add-post");
var addButton = document.getElementById("add");
var recentPostsSection = document.getElementByld("recent-posts-list");
var userPostsSection = document.getElementById("user-posts-list");
var topUserPostsSection = document.getElementBylId("top-user-posts-list");
var recentMenuButton = document.getElementByld("menu-recent");
var myPostsMenuButton = document.getElementByld("menu-my-posts");
var myTopPostsMenuButton = document.getElementByld("menu-my-top-posts");
var listeningFirebaseRefs = [];
function writeNewPost(uid, username, picture, title, body) {
  var postData = {
    author: username,
    uid: uid,
    body: body,
    title: title,
    authorPic: picture,
  };
  var newPostKey = firebase.database().ref().child("posts").push().key;
  var updates = {};
  updates["/posts/" + newPostKey] = postData;
  updates["/user-posts/" + uid + "/" + newPostKey] = postData;
  return firebase.database().ref().update(updates);
}
function createPostElement(postld, title, text, author, authorld, authorPic) {
  var uid = firebase.auth().currentUser.uid;
  var html =
    '<div class="post post-' +
    postId +
    " mdl-cell mdl-cell--12-col " +
    'mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">' +
    '<div class="mdl-card mdl-shadow--2dp">' +
    '<div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white">' +
    '<h4 class="mdl-card__title-text"></h4>' +
    "<div>" +
    '<div class="header">' +
    "<div>" +
    '<div class="avatar"></div>' +
    '<div class="username mdl-color-text--black"></div>' +
    "</div>" +
    "</div>" +
    '<div class="text"></div>' +
    "</div>" +
    "</div>";
  var div = document.createElement("div");
  div.innerHTML = html;
  var postElement = div.firstChild;
  postElement.getElementsByClassName("text")[0].innerText = text;
  postElement.getElementsByClassName("mdl-card__title-text")[0].innerText =
    title;
  postElement.getElementsByClassName("username")[0].innerText =
    author || "Anonymous";
  postElement.getElementsByClassName("avatar")[0].style.backgroundImage =
    'url("' + (authorPic || "/silhouette.jpg") + '")';
  return postElement;
}
function startDatabaseQueries() {
  var myUserld = firebase.auth().currentUser.uid;
  var recentPostsRef = firebase.database().ref("posts").limitToLast(100);
  var topUserPostsRef = firebase.database().ref("notice").limitToLast(100);
  var userPostsRef = firebase.database().ref("user-posts/" + myUserId);
  var fetchPosts = function (postsRef, sectionElement) {
    postsRef.on("child_added", function (data) {
      var author = data.val().author || "Anonymous";
      var containerElement =
        sectionElement.getElementsByClassName("posts-container")[0];
      containerElement.insertBefore(
        createPostElement(
          data.key,
          data.val().title,
          data.val().body,
          author,
          data.val().uid,
          data.val().authorPic
        ),
        containerElement.firstChild
      );
    });
    postsRef.on("child_changed", function (data) {
      var containerElement =
        sectionElement.getElementsByClassName("posts-container")[0];
      var postElement = containerElement.getElementsByClassName(
        "post-" + data.key
      )[0];
      postElement.getElementsByClassName("mdl-card__title-text")[0].innerText =
        data.val().title;
      postElement.getElementsByClassName("username")[0].innerText =
        data.val().author;
      postElement.getElementsByClassName("text")[0].innerText = data.val().body;
    });
    postsRef.on("child_removed", function (data) {
      var containerElement =
        sectionElement.getElementsByClassName("posts-container")[0];
      var post = containerElement.getElementsByClassName("post-" + data.key)[0];
      post.parentElement.removeChild(post);
    });
  };
  fetchPosts(topUserPostsRef, topUserPostsSection);
  fetchPosts(recentPostsRef, recentPostsSection);
  fetchPosts(userPostsRef, userPostsSection);
  listeningFirebaseRefs.push(topUserPostsRef);
  listeningFirebaseRefs.push(recentPostsRef);
  listeningFirebaseRefs.push(userPostsRef);
}
function writeUserData(userld, name, email, imageUrl) {
  firebase
    .database()
    .ref("users/" + userld)
    .set({
      username: name,
      email: email,
      profile_picture: imageUrl,
    });
}
function cleanupUi() {
  topUserPostsSection.getElementsByClassName("posts-container")[0].innerHTML =
    "";
  recentPostsSection.getElementsByClassName("posts-container")[0].innerHTML =
    "";
  userPostsSection.getElementsByClassName("posts-container")[0].innerHTML = "";
  listeningFirebaseRefs.forEach(function (ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}
var currentUID;
var admin = "DtpX2PGSHeUs0QXWkVCxaZM2Njv2";
var n = 1;
function onAuthStateChanged(user) {
  if (user && currentUID === user.uid) {
    return;
  }
  cleanupUi();
  if (user) {
    currentUID = user.uid;
    if (currentUID === admin) {
      n = l;
    } else {
      n = 0;
    }
    splashPage.style.display = "none";
    writeUserData(user.uid, user.displayName, user.email, user.photoURL);
    startDatabaseQueries();
  } else {
    currentUID = null;
    splashPage.style.display = "";
  }
}
function newPostForCurrentUser(title, text) {
  var userld = firebase.auth().currentUser.uid;
  return firebase
    .database()
    .ref("/users/" + userld)
    .once("value")
    .then(function (snapshot) {
      var username = (snapshot.val() && snapshot.val().username) || "Anonymous";
      return writeNewPost(
        firebase.auth().currentUser.uid,
        username,
        firebase.auth().currentUser.photoURL,
        title,
        text
      );
    });
}
function showSection(sectionElement, buttonElement) {
  recentPostsSection.style.display = "none";
  userPostsSection.style.display = "none";
  topUserPostsSection.style.display = "none";
  addPost.style.display = "none";
  myTopPostsMenuButton.classList.remove("is-active");
  recentMenuButton.classList.remove("is-active");
  myPostsMenuButton.classList.remove("is-active");
  if (sectionElement) {
    sectionElement.style.display = "block";
  }
  if (buttonElement) {
    buttonElement.classList.add("is-active");
  }
}
window.addEventListener(
  "load",
  function () {
    signinButton.addEventListener("click", function () {
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
    });
    signOutButton.addEventListener("click", function () {
      firebase.auth().signOut();
    });
    firebase.auth().onAuthStateChanged(onAuthStateChanged);
    messageForm.onsubmit = function (e) {
      e.preventDefault();
      var text = messagelnput.value;
      var title = titleInput.value;
      if (text && title) {
        newPostForCurrentUser(title, text).then(function () {
          myPostsMenuButton.click();
        });
        messagelnput.value = "";
        titleInput.value = "";
      }
    };
    recentMenuButton.onclick = function () {
      if (n == 1) {
        showSection(recentPostsSection, recentMenuButton);
      }
    };
    myPostsMenuButton.onclick = function () {
      showSection(userPostsSection, myPostsMenuButton);
    };
    myTopPostsMenuButton.onclick = function () {
      showSection(topUserPostsSection, myTopPostsMenuButton);
    };
    addButton.onclick = function () {
      showSection(addPost);
      messagelnput.value = "";
      titleInput.value = "";
    };
    myPostsMenuButton.onclick;
  },
  false
);
