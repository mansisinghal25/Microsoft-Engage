window.onload = function () {
  // Adding the web app's Firebase configurations
  var firebaseConfig = {
    apiKey: "AIzaSyB9ljMRErZ35zJ-79mi11Kst5AUBgw1Vq4",
    authDomain: "teams-clone-2fb09.firebaseapp.com",
    databaseURL: "https://teams-clone-2fb09-default-rtdb.firebaseio.com",
    projectId: "teams-clone-2fb09",
    storageBucket: "teams-clone-2fb09.appspot.com",
    messagingSenderId: "737191486060",
    appId: "1:737191486060:web:21c1b289c21e2ca6a52e49",
    measurementId: "G-S12V1CCYKC",
  };
  // Initializing Firebase
  firebase.initializeApp(firebaseConfig);
  var db = firebase.database();

  class M_CHAT {
    home() {
      //function for creating the home page
      document.body.innerHTML = "";
      this.create_title();
      this.create_join_form();
    }
    chat() {
      //function for creating chat page elements
      this.create_title();
      this.create_chat();
    }

    create_title() {
      // creates the main header of the webpage
      var title_container = document.createElement("div");
      title_container.setAttribute("id", "title_container");
      var title_inner_container = document.createElement("div");
      title_inner_container.setAttribute("id", "title_inner_container");

      var title = document.createElement("h1");
      title.setAttribute("id", "title");
      title.textContent = "Mansi's Teams Clone";
      var t1_button_container = document.createElement("div");
      t1_button_container.setAttribute("id", "t1_button_container");

      // Adding the two chat and video chat buttons in the header
      var t1_button = document.createElement("button");
      t1_button.setAttribute("id", "t1_button");
      t1_button.innerHTML = '<i class="far fa-comments"></i>';
      var t2_button_container = document.createElement("div");
      t2_button_container.setAttribute("id", "t2_button_container");
      var t2_button = document.createElement("button");
      t2_button.setAttribute("id", "t2_button");
      t2_button.innerHTML = '<i class="fas fa-video"></i>';
      t1_button_container.append(t1_button);
      t2_button_container.append(t2_button);
      title_inner_container.append(title);
      title_inner_container.append(t1_button_container);
      title_inner_container.append(t2_button_container);
      title_container.append(title_inner_container);
      document.body.append(title_container);

      t1_button.onclick = function () {
        //function that displays the chat element on full screen
        if (localStorage.getItem("name") != null) {
          video_container.remove();
          var chat_container = document.getElementById("chat_container");
          chat_container.style.width = "100%";
        }
      };
      t2_button.onclick = function () {
        //function that calls the video calling html file as an iframe and displays both chat and videochat on the webpage.
        var video_container = document.createElement("div");
        video_container.setAttribute("id", "video_container");
        var trial = document.createElement("iframe");
        trial.setAttribute("src", "index1.html"); //index1 is the html file for video calling page
        trial.setAttribute("title", "Iframe Example");
        trial.setAttribute("height", "100%");
        trial.setAttribute("width", "100%");
        video_container.append(trial);
        document.body.append(video_container);
        var chat_container = document.getElementById("chat_container");
        chat_container.style.width = "29%";
      };
    }

    create_join_form() {
      // this function creates the initial homepage
      var parent = this;
      var img = document.createElement("img");
      img.src = "hhh.gif";
      img.setAttribute("id", "image1");
      var welcome_container = document.createElement("div");
      welcome_container.setAttribute("id", "welcome_container");
      var txt = document.createElement("h1");
      txt.setAttribute("id", "txt");
      txt.textContent = "Welcome,";
      var str = txt.textContent.split("");
      var txt1 = document.createElement("h1");
      txt1.setAttribute("id", "txt1");
      txt1.textContent = " Please sign in for entering the chat.";
      var str = txt1.textContent.split("");
      (function animate() {
        //adding an animation for the text
        str.length > 0
          ? (welcome_container.innerHTML += str.shift())
          : clearTimeout(running);
        var running = setTimeout(animate, 90);
      })();

      var join_container = document.createElement("div");
      join_container.setAttribute("id", "join_container");
      var join_inner_container = document.createElement("div");
      join_inner_container.setAttribute("id", "join_inner_container");

      var join_button_container = document.createElement("div");
      join_button_container.setAttribute("id", "join_button_container");

      var join_button = document.createElement("button");
      join_button.setAttribute("id", "join_button");
      join_button.innerHTML =
        'Sign in using Google <i class="fas fa-sign-in-alt"></i>';

      join_button.onclick = function () {
        //firebase user authentication
        const auth = firebase.auth();
        const googleProvider = new firebase.auth.GoogleAuthProvider();

        auth.signInWithPopup(googleProvider).then(() => {
          //pop up for signing in
          parent.save_name(firebase.auth().currentUser.displayName);
          join_button_container.remove();
          join_container.remove();
          img.remove();
          welcome_container.remove();
          txt.remove();
          parent.create_chat();
        });
      };

      join_button_container.append(join_button);
      document.body.append(txt);
      document.body.append(welcome_container);
      document.body.append(img);
      document.body.append(join_button_container);
    }
    create_load(id) {
      var parent = this;
      var container = document.getElementById(id);
      container.innerHTML = "";

      var loader_container = document.createElement("div");
      loader_container.setAttribute("class", "loader_container");

      var loader = document.createElement("div");
      loader.setAttribute("class", "loader");

      loader_container.append(loader);
      container.append(loader_container);
    }

    create_chat() {
      //this function creates and displays all chat related components
      var parent = this;
      var title_container = document.getElementById("title_container");
      var title = document.getElementById("title");
      title_container.classList.add("chat_title_container");
      title.classList.add("chat_title");

      var chat_container = document.createElement("div");
      chat_container.setAttribute("id", "chat_container");

      var chat_inner_container = document.createElement("div");
      chat_inner_container.setAttribute("id", "chat_inner_container");

      var chat_content_container = document.createElement("div");
      chat_content_container.setAttribute("id", "chat_content_container");

      var chat_input_container = document.createElement("div");
      chat_input_container.setAttribute("id", "chat_input_container");

      var chat_input_send = document.createElement("button");
      chat_input_send.setAttribute("id", "chat_input_send");
      chat_input_send.setAttribute("disabled", true);
      chat_input_send.innerHTML = `<i class="far fa-paper-plane"></i>`;

      var chat_input = document.createElement("input");
      chat_input.setAttribute("id", "chat_input");
      chat_input.setAttribute("maxlength", 1000);
      chat_input.placeholder = `${localStorage.getItem(
        "name"
      )}, Type your message here...`;

      chat_input.onkeyup = function () {
        if (chat_input.value.length > 0) {
          chat_input_send.removeAttribute("disabled");
          chat_input_send.classList.add("enabled");
          chat_input_send.onclick = function () {
            chat_input_send.setAttribute("disabled", true);
            chat_input_send.classList.remove("enabled");
            if (chat_input.value.length <= 0) {
              return;
            }

            parent.create_load("chat_content_container");
            parent.send_message(chat_input.value);
            chat_input.value = "";
            // Focus on the input there after
            chat_input.focus();
          };
        } else {
          chat_input_send.classList.remove("enabled");
        }
      };
      // adding the logout option which takes the user back to the home page.
      var chat_logout_container = document.createElement("div");
      chat_logout_container.setAttribute("id", "chat_logout_container");

      var chat_logout = document.createElement("button");
      chat_logout.setAttribute("id", "chat_logout");
      chat_logout.textContent = `${localStorage.getItem("name")} • logout`;
      chat_logout.onclick = function () {
        localStorage.clear();
        parent.home();
      };

      chat_logout_container.append(chat_logout);
      chat_input_container.append(chat_input, chat_input_send);
      chat_inner_container.append(
        chat_content_container,
        chat_input_container,
        chat_logout_container
      );
      chat_container.append(chat_inner_container);

      document.body.append(chat_container);
      parent.create_load("chat_content_container");

      this.refresh_chat();
    }

    save_name(name) {
      localStorage.setItem("name", name);
    }
    send_message(message) {
      var parent = this;
      if (parent.get_name() == null && message == null) {
        return;
      }
      //sending the messages to the database
      var messages = db.ref("chats/");
      messages.once("value", function (snapshot) {
        var index = parseFloat(snapshot.numChildren()) + 1;
        db.ref("chats/" + `message_${index}`)
          .set({
            name: parent.get_name(),
            message: message,
            index: index,
          })
          .then(function () {
            parent.refresh_chat();
          });
      });
    }
    get_name() {
      if (localStorage.getItem("name") != null) {
        return localStorage.getItem("name");
      } else {
        this.home();
      }
    }
    refresh_chat() {
      var chat_content_container = document.getElementById(
        "chat_content_container"
      );
      //getting the messages from the database.
      var messages = db.ref("chats/");
      messages.on("value", function (snapshot) {
        chat_content_container.innerHTML = "";
        if (snapshot.numChildren() == 0) {
          return;
        }
        var values = Object.values(snapshot.val());
        var guide = [];
        var unordered = [];
        var ordered = [];
        for (var i, i = 0; i < values.length; i++) {
          guide.push(i + 1);
          unordered.push([values[i], values[i].index]);
        }

        guide.forEach(function (key) {
          var found = false;
          unordered = unordered.filter(function (item) {
            if (!found && item[1] == key) {
              ordered.push(item[0]);
              found = true;
              return false;
            } else {
              return true;
            }
          });
        });

        ordered.forEach(function (data) {
          var name = data.name;
          var message = data.message;

          var message_container = document.createElement("div");
          message_container.setAttribute("class", "message_container");

          var message_inner_container = document.createElement("div");
          message_inner_container.setAttribute(
            "class",
            "message_inner_container"
          );

          var message_user_container = document.createElement("div");
          message_user_container.setAttribute(
            "class",
            "message_user_container"
          );

          var message_user = document.createElement("p");
          message_user.setAttribute("class", "message_user");
          message_user.textContent = `${name}`;

          var message_content_container = document.createElement("div");
          message_content_container.setAttribute(
            "class",
            "message_content_container"
          );

          var message_content = document.createElement("p");
          message_content.setAttribute("class", "message_content");
          message_content.textContent = `${message}`;

          message_user_container.append(message_user);
          message_content_container.append(message_content);
          message_inner_container.append(
            message_user_container,
            message_content_container
          );
          message_container.append(message_inner_container);

          chat_content_container.append(message_container);
        });
        // Going to the recent message at the bottom of the container
        chat_content_container.scrollTop = chat_content_container.scrollHeight;
      });
    }
  }

  app = new M_CHAT();
  // if user is not logged in take them to the homepage
  if (localStorage.getItem("name") == null) {
    app.home();
  } else {
    // else take them to the chat page.
    app.chat();
  }
};
