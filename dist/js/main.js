function main(text) {

  text = text.replace(/ /ig, '+');
  var URL = "https://pixabay.com/api/?key=2980920-46f1aa264b036ffc6e45ebad0&orientation=vertical&q=" + text + "&min_height=500";
  $.getJSON(URL, function (data) {
    if (parseInt(data.totalHits) > 0) {
      var parent = $("#bodyContainer");
      parent.children(".block").remove();
      $.each(data.hits, function (i, hit) {
        var savedBlock = getFrom(savedBlocks, hit.id + "");
        if (savedBlock)
          insertBlock(parent, hit.id + "", savedBlock.image, savedBlock.tags, savedBlock.likes, savedBlock.src, savedBlock.approve, savedBlock.decline, true, savedBlock.comments);
        else
          insertBlock(parent, hit.id + "", hit.previewURL, hit.tags, hit.likes, hit.pageURL);
      });
    } else
      alert('No hits');
  });
}

var name = "Test: "
var savedBlocks = [];
var viewBlocks = [];

var plus = ".positive";
var minus = ".negative";
var classApprove = "block--approve";
var classDecline = "block--decline";

function updateBlock(arr, id, obj) {
  if (arr) {
    var index = -1;
    arr.forEach(function (item, i, arr) {
      if (item.id === id) {
        index = i;
      }
    });
    if (index !== -1) {
      for (var prop in obj) {
        arr[index][prop] = obj[prop];
      }
      return true;
    } else {
      console.log(arr);
      alert("Error while updating1");
      return false;
    }
  } else {
    alert("Error while updating");
    return false;
  }
}

function saveToLocalStorage() {
  localStorage.setItem(name + "savedBlocks", JSON.stringify(savedBlocks));
}

function getFromLocalStorage() {
  savedBlocks = JSON.parse(localStorage.getItem(name + "savedBlocks"));
  if (!savedBlocks)
    savedBlocks = [];
  refreshSavedCount();
}

function isConsist(arr, id) {
  if (arr) {
    var index = -1;
    arr.forEach(function (item, i, arr) {
      if (item.id === id) {
        index = i;
      }
    });
    if (index !== -1) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function getFrom(arr, id) {
  if (arr) {
    var index = -1;
    arr.forEach(function (item, i, arr) {
      if (item.id === id) {
        index = i;
      }
    });
    if (index !== -1) {
      return savedBlocks[index];
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function saveBlock(block) {
  var id = block.id;
  if (viewBlocks) {
    var index = -1;
    viewBlocks.forEach(function (item, i, arr) {
      if (item.id === id) {
        index = i;
      }
    });
    if (index !== -1) {
      savedBlocks.push(viewBlocks[index]);
      return true;
    } else {
      alert("Error while saving");
      return false;
    }
  } else {
    alert("Error while saving");
    return false;
  }
}

function deleteFromArray(block, arr) {
  var id = block.id;
  if (arr) {
    var index = -1;
    arr.forEach(function (item, i, arr) {
      if (item.id === id) {
        index = i;
      }
    });
    if (index !== -1) {
      arr.splice(index, 1);
      return true;
    } else {
      alert("Error while deleting");
      return false;
    }
  } else {
    alert("Error while deleting");
    return false;
  }
}

function makeDecision(target, parent, block, isApprove) {
  var classA;
  var classB;
  var findA;
  var like;
  if (isApprove) {
    classA = classApprove;
    classB = classDecline;
    findA = minus;
    like = 1;
  } else {
    classA = classDecline;
    classB = classApprove;
    findA = plus;
    like = -1;
  }
  if (!block.classList.contains(classA)) {
    if (block.classList.contains(classB)) {
      $(parent).find(findA).removeAttr("disabled");
      block.classList.remove(classB);
    }
    block.classList.add(classA);
    target.setAttribute("disabled", "true");

    var likes = $(block).find(".block__likes");
    var count = parseInt(likes.text()) + like;
    likes.text(count);
  }
}

$(document).ready(function () {
  function Listener(element) {
    var container = element;

    this.deleteBlock = function (target) {
      if (deleteFromArray(target.parentNode, viewBlocks))
        container.removeChild(target.parentNode);
    };

    this.decline = function (target) {
      var parent = target.parentNode;
      var block = parent.parentNode;
      var containerId = block.parentNode.id;

      if (containerId === "modalContainer") {
        if (isConsist(viewBlocks, block.id)) {
          var blockModal = $("#bodyContainer >#" + block.id);
          var parentModal = $(blockModal).find(".block__decision");
          var childModal = $(parentModal).find(minus);
          makeDecision(childModal[0], parentModal[0], blockModal[0], false);
          updateBlock(viewBlocks, blockModal[0].id, {
            "approve": false,
            "decline": true
          });
        }
        makeDecision(target, parent, block, false);
      } else {
        makeDecision(target, parent, block, false);
        updateBlock(viewBlocks, block.id, {
          "approve": false,
          "decline": true
        });
      }
      if (isConsist(savedBlocks, block.id)) {
        updateBlock(savedBlocks, block.id, {
          "approve": false,
          "decline": true
        });
        saveToLocalStorage();
      }
    };

    this.approve = function (target) {
      var parent = target.parentNode;
      var block = parent.parentNode;
      var containerId = block.parentNode.id;

      if (containerId === "modalContainer") {
        if (isConsist(viewBlocks, block.id)) {
          var blockModal = $("#bodyContainer >#" + block.id);
          var parentModal = $(blockModal).find(".block__decision");
          var childModal = $(parentModal).find(plus);
          makeDecision(childModal[0], parentModal[0], blockModal[0], true);
          updateBlock(viewBlocks, blockModal[0].id, {
            "approve": true,
            "decline": false
          });
        }
        makeDecision(target, parent, block, true);
      } else {
        makeDecision(target, parent, block, true);
        updateBlock(viewBlocks, block.id, {
          "approve": true,
          "decline": false
        });
      }
      if (isConsist(savedBlocks, block.id)) {
        updateBlock(savedBlocks, block.id, {
          "approve": true,
          "decline": false
        });
        saveToLocalStorage();
      }
    };

    this.addComment = function (target) {
      var parent = target.parentNode;
      var comments = parent.parentNode;
      var text = $(parent).find(".commentText").val();
      if (text !== "") {
        $(comments).find(".block__comments-view").append("<li>" + text + "<button data-action='delComment'>Delete</button></li>");
      }
    };

    this.delComment = function (target) {
      var parent = target.parentNode;
      var commentsView = parent.parentNode;
      commentsView.removeChild(parent);
    };

    this.save = function (target) {
      target.setAttribute("data-action", "delete");
      target.innerHTML = "Delete";
      if (saveBlock(target.parentNode)) {
        saveToLocalStorage();
        refreshSavedCount();
      }
    };

    this.delete = function (target) {
      target.setAttribute("data-action", "save");
      target.innerHTML = "Save";
      if (deleteFromArray(target.parentNode, savedBlocks)) {
        saveToLocalStorage();
        refreshSavedCount();
      }
    };

    var self = this;

    container.onclick = function (e) {
      var target = e.target;
      var action = target.getAttribute('data-action');
      if (action) {
        self[action](target);
      }
    };
  }

  new Listener(document.getElementById("bodyContainer"));
  new Listener(document.getElementById("modalContainer"));

  var modal = document.getElementById('myModal');
  var btnSaved = document.getElementById("savedBtn");
  var btnSearch = document.getElementById("searchBtn");
  var span = document.getElementById("close");

  btnSaved.onclick = function () {
    modal.style.display = "block";
    window.onscroll = function () {
      window.scrollTo(0, 0);
    };
    var parent = $("#modalContainer");
    for (var j = 0; j < savedBlocks.length; j++) {
      insertBlock(parent, savedBlocks[j].id, savedBlocks[j].image, savedBlocks[j].tags, savedBlocks[j].likes, savedBlocks[j].src, savedBlocks[j].approve, savedBlocks[j].decline, true, savedBlocks[j].comments);
    }

  }
  btnSearch.onclick = function () {
    var parent = btnSearch.parentNode;
    var text = $(parent).find(".search__text").val();
    if (text !== "") {
      main(text);
    }
  }

  modal.onclick = function (event) {
    if (event.target === modal) {
      var parent = $("#modalContainer");
      parent.children('.block').remove();
      modal.style.display = "none";
      window.onscroll = function () {};
    }
  }

  span.onclick = function () {
    var parent = $("#modalContainer");
    parent.children('.block').remove();
    modal.style.display = "none";
    window.onscroll = function () {};
  }


  getFromLocalStorage();
  main("robot");

});

function refreshSavedCount() {
  if (savedBlocks) {
    var count = document.getElementById("savedCount");
    count.innerHTML = savedBlocks.length;
  }
}

function insertBlock(parent, id, image, tags, likes, src, approve, decline, saved, comments) {
  approve = approve || false;
  decline = decline || false;
  saved = saved || false;
  comments = comments || [];
  if (approve)
    likes++;
  if (decline)
    likes--;
  if (parent.attr('id') === "bodyContainer") {
    var obj = {};
    obj.id = id;
    obj.image = image;
    obj.tags = tags;
    obj.likes = likes;
    obj.src = src;
    obj.approve = approve;
    obj.decline = decline;
    obj.saved = saved;
    obj.comments = comments;
    viewBlocks.push(obj);
  }

  var block = document.createElement("div");
  block.className = "block";
  block.id = id;

  var deleteBtn = document.createElement("button");
  deleteBtn.className = "block__delete";
  deleteBtn.setAttribute("data-action", "deleteBlock");
  block.appendChild(deleteBtn);

  var likesBlock = document.createElement("div");
  likesBlock.className = "block__likes";
  likesBlock.innerHTML = likes;
  block.appendChild(likesBlock);

  var srcBlock = document.createElement("a");
  srcBlock.href = src;
  srcBlock.setAttribute("target", "_blank");
  srcBlock.setAttribute("rel", "noopener noreferrer");
  var imageBlock = document.createElement("img");
  imageBlock.className = "block__image";
  imageBlock.src = image;
  srcBlock.appendChild(imageBlock);
  block.appendChild(srcBlock);

  var tagsBlock = document.createElement("ul");
  tagsBlock.className = "block__tags";
  for (var i = 0; i < tags.length; i++) {
    var liBlock = document.createElement("li");
    liBlock.innerHTML = tags[i];
    tagsBlock.appendChild(liBlock);
  }
  block.appendChild(tagsBlock);

  var decisionBlock = document.createElement("div");
  decisionBlock.className = "block__decision";
  var declineBtn = document.createElement("button");
  declineBtn.className = "negative";
  declineBtn.setAttribute("data-action", "decline");
  declineBtn.innerHTML = "Decline";
  var approveBtn = document.createElement("button");
  approveBtn.className = "positive";
  approveBtn.setAttribute("data-action", "approve");
  approveBtn.innerHTML = "Approve";
  decisionBlock.appendChild(declineBtn);
  decisionBlock.appendChild(approveBtn);
  if (decline) {
    block.className = "block block--decline";
    declineBtn.setAttribute("disabled", "true");
  }
  if (approve) {
    block.className = "block block--approve";
    approveBtn.setAttribute("disabled", "true");
  }
  block.appendChild(decisionBlock);

  var saveBtn = document.createElement("button");
  saveBtn.className = "block__save";
  if (saved) {
    saveBtn.setAttribute("data-action", "delete");
    saveBtn.innerHTML = "Delete";
  } else {
    saveBtn.setAttribute("data-action", "save");
    saveBtn.innerHTML = "Save";
  }
  block.appendChild(saveBtn);

  var commentsBlock = document.createElement("div");
  commentsBlock.className = "block__comments";
  var commentsAddBlock = document.createElement("div");
  commentsAddBlock.className = "block__comments-add";
  var commentsInputBlock = document.createElement("input");
  commentsInputBlock.className = "commentText";
  commentsInputBlock.type = "text";
  commentsAddBlock.appendChild(commentsInputBlock);
  var addCommentBtn = document.createElement("button");
  addCommentBtn.setAttribute("data-action", "addComment");
  addCommentBtn.innerHTML = "Add";
  commentsAddBlock.appendChild(addCommentBtn);
  commentsBlock.appendChild(commentsAddBlock);

  var commentsViewBlock = document.createElement("ul");
  commentsViewBlock.className = "block__comments-view";
  for (var i = 0; i < comments.length; i++) {
    var liBlock = document.createElement("li");
    liBlock.innerHTML = comments[i] + '<button data-action="delComment">Delete</button>';
    commentsViewBlock.appendChild(liBlock);
  }
  commentsBlock.appendChild(commentsViewBlock);
  block.appendChild(commentsBlock);
  parent.append(block);
}
