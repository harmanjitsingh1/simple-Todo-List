let todoList = JSON.parse(localStorage.getItem("todoList")) || [];
const todoItemsContainer = document.querySelector(".todoItemsContainer");
let isCompleted = document.querySelector("#isCompleted");
const tabsContainer = document.querySelector(".tabsContainer");
let todoHeading = document.querySelector(".todoHeading");
const addTodoBtn = document.querySelector(".addTodoBtn");
let todoItem = document.querySelector(".todoItem");

let sideBarBtn = document.querySelector(".sideBarBtn");
let sideBar = document.querySelector(".sideBar");
let sideBarContainer = document.querySelector(".sideBarContainer");
let modelPage = document.createElement("div");

let currentActiveTabValue = "All";

heandleTabChange(currentActiveTabValue);

function heandleTabChange(tabName) {
  tabName = tabName?.toLowerCase() || "all";

  let currentActiveTabElm = document.querySelector(".active");

  let changedTab = document.querySelector(`.${tabName}`);

  if (!changedTab) {
    console.error("Tab not found:", tabName);
    return;
  }

  currentActiveTabElm.classList.remove("active");
  currentActiveTabElm.firstElementChild.setAttribute("fill", "#484848");
  currentActiveTabElm = changedTab;
  currentActiveTabElm.classList.add("active");
  currentActiveTabElm.firstElementChild.setAttribute("fill", "#fff");

  currentActiveTabValue = currentActiveTabElm.dataset.value;

  todoHeading.innerHTML =
    currentActiveTabValue === "Trash"
      ? "Trash"
      : currentActiveTabValue + " Tasks";

  listTodos(currentActiveTabValue);

  if (sideBar.classList.contains("openSideBar")) {
    toggleSideBar();
  }
}

function listTodos(sortBy = currentActiveTabValue) {
  todoItemsContainer.innerHTML = "";

  let outputList = [];

  outputList = todoList.filter((todo) => {
    if (sortBy === "All") {
      return !todo.trash;
    } else if (sortBy === "Pending") {
      return !todo.trash && todo.status === "Pending";
    } else if (sortBy === "Completed") {
      return !todo.trash && todo.status === "Completed";
    } else if (sortBy === "Trash") {
      return todo.trash;
    }
    return todo.status === sortBy;
  });

  if (outputList.length === 0 || !outputList) {
    todoItemsContainer.innerHTML = `<div class="nothing">Nothing to Show Here!</div>`;
    return;
  }

  outputList.map((todo) => {
    let newTodo = document.createElement("li");
    newTodo.classList.add("todoItem");
    newTodo.dataset.id = todo.id;

    let statusElm = document.createElement("div");

    let isTrashed = todo?.trash || "";
    let todoStatus = todo?.status || "";

    statusElm.innerHTML = `<div class="status ${todoStatus?.toLowerCase()}">${
      todoStatus || ""
    }</div>`;

    newTodo.innerHTML = `
      <div class="left">
        ${
          isTrashed
            ? ""
            : ` <input
              type="checkbox"
              name="isCompleted"
              id="isCompleted"
              title="Mark as Completed"
              ${todoStatus === "Completed" ? "checked" : ""}
            /> `
        }
        <div class="details">
          <div class="title">${todo?.title}</div>
          <p class="description">${todo?.description}</p>
        </div>
      </div>
      ${statusElm.innerHTML}

      ${getActionBtns(todo?.trash)}

      <div class="menuBtn">:</div>

    `;
    todoItemsContainer.append(newTodo);
  });
}

function heandleAddTodo(e) {
  e.preventDefault();
  let todoTitleElm = document.querySelector("#todoTitle");
  let todoDescriptionElm = document.querySelector("#todoDescription");

  let newTodo = {
    id: `${Date.now()}`,
    title: todoTitleElm.value,
    description: todoDescriptionElm.value,
    status: "Pending",
  };

  if (todoList.length <= 0) {
    todoList = [newTodo];
  } else {
    todoList.unshift(newTodo);
  }

  saveToLoacal(todoList);

  todoTitleElm.value = "";
  todoDescriptionElm.value = "";

  heandleTabChange("All");

  closeModelPage(modelPage);
}

function editTodo(e, todoItem) {
  if (!todoItem || !e) {
    console.log("Invalid todo item or event");
    closeModelPage(modelPage);
    return;
  }

  e.preventDefault();
  let newTitle = e.target.todoTitle.value;
  let newDescription = e.target.todoDescription.value;

  let updatedList = todoList.map((item) => {
    if (item.id === todoItem.id) {
      item.title = newTitle;
      item.description = newDescription;
    }
    return item;
  });

  todoList = updatedList;
  saveToLoacal(updatedList);
  listTodos();

  closeModelPage(modelPage);
}

function deleteTodo(id) {
  let finalTodoList = todoList.filter((obj) => {
    return obj.id != id;
  });
  todoList = finalTodoList;
  saveToLoacal(todoList);

  listTodos();

  closeModelPage(modelPage);
}

function restoreTodo(id) {
  let updatedList = todoList.map((todo) => {
    if (todo.id === id) {
      todo.trash = false;
    }
    return todo;
  });

  todoList = updatedList;
  saveToLoacal(todoList);
  closeModelPage(modelPage);
  setTimeout(() => {
    listTodos();
  }, 500);
}

function showModelPage({ type, props }) {
  modelPage.classList.add("modelPage");

  if (type === "AddTodo") {
    modelPage.innerHTML = `
      <form class="modelForm">
        <div class="modelHeader">
          <h3>Add New Task</h3> 
        </div>
        <label for="todoTitle">Title</label>
        <input
          type="text"
          id="todoTitle"
          name="todoTitle"
          placeholder="Enter your task here..."
          required
        />

        <label for="todoDescription">Description</label>
        <input
          type="text"
          id="todoDescription"
          name="todoDescription"
          placeholder="Description..."
        />

        <div class="buttons">
          <button class="cancel">Cancel</button>
          <button class="submitBtn">Add Task</button>
        </div>
      </form>
    `;

    const form = modelPage.querySelector(".modelForm");

    form.addEventListener("submit", (e) => {
      heandleAddTodo(e);
    });

    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        heandleAddTodo(e);
      }
    });
  }

  if (type === "deleteTodo") {
    modelPage.innerHTML = `
      <div class="modelForm">
        <h3>Are you sure you want to permanently delete this item?</h3> 
        <div class="buttons">
          <button class="cancel">Cancel</button>
          <button class="deleteBtn">Delete Permanently</button>
        </div>
      </div>
    `;

    const deleteBtn = modelPage.querySelector(".deleteBtn");

    deleteBtn.addEventListener("click", (e) => {
      deleteTodo(props);
    });
  }

  if (type === "moveToTrash") {
    modelPage.innerHTML = `
    <div class="modelForm">
    <h3>Move to Trash?</h3> 
        <div class="buttons">
          <button class="cancel">Cancel</button>
          <button class="trashBtn">Trash</button>
        </div>
      </div>
    `;
    const trashBtn = modelPage.querySelector(".trashBtn");

    trashBtn.addEventListener("click", (e) => {
      moveToTrash(props);
    });
  }

  if (type === "restoreTodo") {
    modelPage.innerHTML = `
    <div class="modelForm">
    <h3>Restore Task?</h3> 
        <div class="buttons">
          <button class="cancel">Cancel</button>
          <button class="restoreBtn">Restore</button>
        </div>
      </div>
    `;
    const restoreBtn = modelPage.querySelector(".restoreBtn");

    restoreBtn.addEventListener("click", (e) => {
      restoreTodo(props);
    });
  }

  if (type === "editTodo") {
    let editTodoItem = todoList.find((todo) => todo.id === props);
    let date = new Date(Number(editTodoItem.id)).toDateString();
    modelPage.innerHTML = `
      <form class="modelForm">
      <div class="modelHeader">
        <h3>Edit Task</h3> 
        <p>${date}</p>
      </div>
        <label for="todoTitle">Title</label>
        <input
          type="text"
          id="todoTitle"
          name="todoTitle"
          placeholder="Enter your task here..."
          value="${editTodoItem.title}"
          required
        />

        <label for="todoDescription">Description</label>
        <input
          type="text"
          id="todoDescription"
          name="todoDescription"
          placeholder="Description..."
          value="${editTodoItem.description}"
        />

        <div class="buttons">
          <button class="cancel">Cancel</button>
          <button class="submitBtn">Save Changes</button>
        </div>
      </form>
    `;

    const form = modelPage.querySelector(".modelForm");

    form.addEventListener("submit", (e) => {
      editTodo(e, editTodoItem);
    });

    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        editTodo(e, editTodoItem);
      }
    });
  }
  document.body.append(modelPage);

  modelPage.addEventListener("click", (e) => {
    if (e.target === modelPage || e.target.classList.contains("cancel")) {
      closeModelPage(modelPage);
    }
  });
}

function closeModelPage(element) {
  document.body.removeChild(element);
}

function markAsCompleted(id) {
  let updatedList = todoList.map((todo) => {
    if (todo.id === id) {
      if (todo.status === "Completed") {
        todo.status = "Pending";
      } else if (todo.status === "Pending") {
        todo.status = "Completed";
      }
    }
    return todo;
  });

  todoList = updatedList;
  saveToLoacal(todoList);

  setTimeout(() => {
    listTodos();
  }, 500);
}

function moveToTrash(id) {
  todoList = todoList.filter((todo) => {
    if (todo.id === id) {
      todo.trash = true;
    }
    return todo;
  });

  // todoList = updatedList;
  saveToLoacal(todoList);

  setTimeout(() => {
    listTodos(currentActiveTabValue);
  }, 500);

  closeModelPage(modelPage);
}

function saveToLoacal(list) {
  localStorage.setItem("todoList", JSON.stringify(list));
}

// let sideBar = document.querySelector(".sideBar");
function toggleSideBar() {
  sideBar.classList.toggle("openSideBar");
  if (sideBar.classList.contains("openSideBar")) {
    sideBarContainer.style.display = "flex";
  } else {
    sideBarContainer.style.display = "none";
  }
}

sideBarContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("sideBarContainer")) {
    toggleSideBar();
  }
});

todoItemsContainer.addEventListener("click", (e) => {
  if (e.target.closest(".trashBtn")) {
    showModelPage({
      type: "moveToTrash",
      props: e.target.closest(".todoItem").dataset.id,
    });
  }

  if (e.target.closest(".deleteBtn")) {
    showModelPage({
      type: "deleteTodo",
      props: e.target.closest(".todoItem").dataset.id,
    });
  }

  if (e.target.closest(".edit")) {
    showModelPage({
      type: "editTodo",
      props: e.target.closest(".todoItem").dataset.id,
    });
  }

  if (e.target.closest(".restore")) {
    showModelPage({
      type: "restoreTodo",
      props: e.target.closest(".todoItem").dataset.id,
    });
  }

  if (e.target.closest("#isCompleted")) {
    markAsCompleted(e.target.closest(".todoItem").dataset.id);
  }

  if (e.target.closest(".menuBtn")) {
    showActions(e.target.closest(".todoItem").dataset.id);
  }
});

function getActionBtns(isTrashed) {
  let actions = document.createElement("div");
  if (isTrashed) {
    actions.innerHTML = `
    <div class="actions">
      <button class="restore" title="Restore Task">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#484848"><path d="M440-320h80v-166l64 62 56-56-160-160-160 160 56 56 64-62v166ZM280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"/></svg>
      </button>
      <button class="deleteBtn" title="Delete Premanently">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(220, 20, 60)"><path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"/></svg>
      </button>
    </div>
    `;
  } else {
    actions.innerHTML = `
    <div class="actions">
      <button class="edit" title="Edit Task">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#484848"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg> 
      </button>
      <button class="trashBtn" title="Move to Trash">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(220, 20, 60)"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
      </button>
    </div>
    `;
  }
  return actions.innerHTML;
}

function showActions(id) {
  let isTrashed;

  todoList.forEach((todo) => {
    if (todo.id === id) isTrashed = todo.trash;
  });
  console.log(isTrashed);

  let actionsModel = document.createElement("div");
  actionsModel.innerHTML = `
    <div class="actionsModel">
      <div class="actions">
        ${
          isTrashed
            ? ` <button class="restoreBtn">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#484848"><path d="M440-320h80v-166l64 62 56-56-160-160-160 160 56 56 64-62v166ZM280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"/></svg>
              Restore
            </button> `
            : ` <button class="editBtn">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#484848"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
              Edit
            </button> `
        }
        ${
          isTrashed
            ? ` <button class="deleteBtn">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(220, 20, 60)"><path d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"/></svg>
              Delete Permanently
            </button> `
            : ` <button class="trashBtn">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(220, 20, 60)"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
              Trash
            </button> `
        }
      </div>
    </div>
  `;

  document.body.append(actionsModel);

  actionsModel.addEventListener("click", (e) => {

    if (e.target.classList.contains("actionsModel")) {
      closeModelPage(actionsModel);
    }

    
    if (e.target.closest(".trashBtn")) {
      closeModelPage(actionsModel);
      showModelPage({
        type: "moveToTrash",
        props: id,
      });
    }

    if (e.target.closest(".deleteBtn")) {
      closeModelPage(actionsModel);
      showModelPage({
        type: "deleteTodo",
        props: id,
      });
    }
    
    if (e.target.closest(".editBtn")) {
      closeModelPage(actionsModel);
      showModelPage({
        type: "editTodo",
        props: id,
      });
    }
    
    if (e.target.closest(".restoreBtn")) {
      closeModelPage(actionsModel);
      showModelPage({
        type: "restoreTodo",
        props: id,
      });
    }
  });
}

tabsContainer.addEventListener("click", (e) => {
  if (e.target.closest(".tab")) {
    heandleTabChange(e.target.dataset.value);
  }
});

addTodoBtn.addEventListener("click", (e) => {
  showModelPage({ type: "AddTodo" });
});

sideBarBtn.addEventListener("click", (e) => {
  if (e.target.closest(".sideBarBtn")) {
    toggleSideBar();
  }
});
