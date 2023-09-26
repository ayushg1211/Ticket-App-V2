let addBtn = document.querySelector(".add-button");
let modal = document.querySelector(".model-cont");
let mainCont = document.querySelector(".main-cont");
let textAreaCont = document.querySelector(".textarea-cont");
let colors = ["yellow", "green", "purple", "blue"];
let modalPriorityColor = colors[colors.length - 1];
let allPriorityColors = document.querySelectorAll(".priority-color");
let removeBtn = document.querySelector(".remove-button");
let ticketContArr = document.querySelectorAll(".ticket-cont");
let toolBoxColors = document.querySelectorAll(".color");
let ticketName = document.querySelector(".ticket-name");
let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";
let addFlag = false;
let remFlag = false;
let ticketsContArr = [];

if (localStorage.getItem("Jira-Tickets")) {
  // retrieve the existing tickets from local storage.
  ticketsContArr = JSON.parse(localStorage.getItem("Jira-Tickets"));
  ticketsContArr.forEach((ticket) => {
    createTicket(
      ticket.text,
      ticket.ticketColor,
      ticket.ticketName,
      ticket.date,
      ticket.today,
      ticket.stat,
      ticket.ticketId
    );
  });
}

//Filter tickets according to their colors
for (let i = 0; i < toolBoxColors.length; i++) {
  toolBoxColors[i].addEventListener("click", (e) => {
    let currToolBoxColor = toolBoxColors[i].classList[0];
    console.log(ticketsContArr);

    let filteredticketArr = ticketsContArr.filter((ticketObj) => {
      return currToolBoxColor === ticketObj.ticketColor;
    });

    //remove all tickets before displaying filtered tickets
    let allTicketArr = document.querySelectorAll(".ticket-cont");
    for (let i = 0; i < allTicketArr.length; i++) {
      allTicketArr[i].remove();
    }

    // generatinting color filtered tickets
    filteredticketArr.forEach((filteredTicket) => {
      createTicket(
        filteredTicket.text,
        filteredTicket.ticketColor,
        filteredTicket.ticketName,
        filteredTicket.date,
        filteredTicket.today,
        filteredTicket.stat,
        filteredTicket.ticketId
      );
    });
  });

  // Double Click on toolbox color and remove filter
  toolBoxColors[i].addEventListener("dblclick", (e) => {
    let allTicketArr = document.querySelectorAll(".ticket-cont");
    for (let i = 0; i < allTicketArr.length; i++) {
      allTicketArr[i].remove();
    }

    ticketsContArr.forEach((ticket) => {
      createTicket(
        ticket.text,
        ticket.ticketColor,
        ticket.ticketName,
        ticket.date,
        ticket.today,
        ticket.stat,
        ticket.ticketId
      );
    });
  });
}

// Selection of modal priority color
allPriorityColors.forEach((colorEle, idx) => {
  colorEle.addEventListener("click", (e) => {
    allPriorityColors.forEach((pColor, idx) => {
      pColor.classList.remove("active"); // remove border from the selected color
    });
    colorEle.classList.add("active"); // add border to the selected color

    modalPriorityColor = colorEle.classList[0];
  });
});

addBtn.addEventListener("click", (e) => {
  // Display/Remove Modal
  // Create Ticket

  addFlag = !addFlag;
  if (addFlag) {
    modal.style.display = "block";
  } else {
    modal.style.display = "none";
  }
});

removeBtn.addEventListener("click", (e) => {
  remFlag = !remFlag;
  if (remFlag) {
    removeBtn.style.color = "#d63031";
  } else {
    removeBtn.style.color = "#dcdde1";
  }
});

// Create Ticket onKeyPress "shift"
modal.addEventListener("keydown", (e) => {
  let key = e.key;
  if (key === "Shift") {
    let time = new Date();
    let date =
      time.getDate() + "-" + (time.getMonth() + 1) + "-" + time.getFullYear();
    let min = time.getMinutes();
    if (min < 10) {
      min = "0" + min;
    }
    let today = time.getHours() + ":" + min;
    let stat = "To-Do";
    createTicket(
      textAreaCont.value,
      modalPriorityColor,
      ticketName.value,
      date,
      today,
      stat
    );
    modalSetDefault();
    addFlag = false;
  }
});

// Function for Creating Ticket
function createTicket(
  text,
  ticketColor,
  ticketName,
  date,
  today,
  stat,
  ticketId
) {
  // console.log('ticket') ;
  let id = ticketId || shortid();
  let ticketCont = document.createElement("div");
  ticketCont.setAttribute("class", "ticket-cont");
  ticketCont.innerHTML = `
    <div class="ticket-color ${ticketColor}"></div>
    <div class="head-cont">
        <div class="ticket-head" required>${ticketName}</div>
        <div class="dropdown">
            <div class="status">${stat}</div>
            <select name="Status" id="" hidden>
                <option value="Select-One">Set-Status</option>
                <option value="To-Do">To-Do</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Done">Done</option>
            </select>
        </div>

    </div>
    
    <div class="ticket-id">#${id}</div>
    <div class="task-area">${text}</div>
    <div class="display-date">
    Created ${date} at ${today}
    </div>
    <div class="ticket-lock">
        <i class="fa-solid fa-lock"></i>
    </div>`;

  if (!ticketId) {
    ticketsContArr.push({
      ticketColor,
      text,
      ticketName,
      date,
      today,
      stat,
      ticketId: id,
    });
    localStorage.setItem("Jira-Tickets", JSON.stringify(ticketsContArr));
    // localStorage.setItem('tickets', JSON.stringify(ticketArr)) ;
  }

  mainCont.appendChild(ticketCont);

  handleRemoval(ticketCont, id);

  handleLock(ticketCont, id); // Lock element should be selected only after ticket is created.

  handleColor(ticketCont, id);

  handleStatus(ticketCont, id);

  // Ticket elements are stored in ticketsContArr to create anew ticket for color filter.
}

function handleRemoval(ticket, id) {
  ticket.addEventListener("click", (e) => {
    if (!remFlag) return;

    let idx = getTicketIdx(id);
    // DB Removal
    ticketsContArr.splice(idx, 1);
    localStorage.setItem("Jira-Tickets", JSON.stringify(ticketsContArr));

    // UI Removal
    ticket.remove();
  });
}

function handleLock(ticket, id) {
  let ticketLockEle = ticket.querySelector(".ticket-lock");
  let lockEle = ticketLockEle.children[0];
  let taskArea = ticket.querySelector(".task-area");
  let ticketTaskName = ticket.querySelector(".ticket-head");
  lockEle.addEventListener("click", (e) => {
    let idx = getTicketIdx(id);

    if (lockEle.classList.contains(lockClass)) {
      lockEle.classList.remove(lockClass);
      lockEle.classList.add(unlockClass);
      taskArea.setAttribute("contenteditable", "true");
      ticketTaskName.setAttribute("contenteditable", "true");
    } else {
      lockEle.classList.remove(unlockClass);
      lockEle.classList.add(lockClass);
      taskArea.setAttribute("contenteditable", "false");
      ticketTaskName.setAttribute("contenteditable", "false");
    }

    // Modify ticket tsk data in local storage
    ticketsContArr[idx].text = taskArea.innerText;
    ticketsContArr[idx].ticketName = ticketTaskName.innerText;
    localStorage.setItem("Jira-Tickets", JSON.stringify(ticketsContArr));
  });
}

function handleColor(ticket, id) {
  let ticketColor = ticket.querySelector(".ticket-color");
  ticketColor.addEventListener("click", (e) => {
    let currColor = ticketColor.classList[1];
    // get ticketColor idx
    let currTicketColorIdx = colors.findIndex((color) => {
      // 'findIndex' is a higher order function
      return currColor === color;
    });

    currTicketColorIdx++;
    let newColorIdx = currTicketColorIdx % colors.length;
    let newTicketColor = colors[newColorIdx];

    let idx = getTicketIdx(id);

    console.log(idx);
    ticketsContArr[idx].ticketColor = newTicketColor;

    ticketColor.classList.remove(currColor);
    ticketColor.classList.add(newTicketColor);

    localStorage.setItem("Jira-Tickets", JSON.stringify(ticketsContArr));
  });
}

// function handleStatusChange(ticket, id) {
//     let dropdown = ticket.querySelector(".dropdown");
//     let statusDrop = ticket.querySelector("select") ;
//     statusDrop.addEventListener("change", (e) => {
//         let idx = getTicketIdx(id);
//         let dropVal = dropdown.value;
//         let dropIdx = statusDrop.findIndex((i)=>{
//             return i === dropVal ;
//         })
//         // dropdown.selectedIndex = dropIdx ;
//         ticketsContArr[idx].status.selectedIndex = dropIdx;
//         localStorage.setItem('Jira-Tickets', JSON.stringify(ticketsContArr));
//     })
// }

function handleStatus(ticket, id) {
  let dropdown = ticket.querySelector(".dropdown");
  let statusDrop = ticket.querySelector("select");
  let status = ticket.querySelector(".status") ;

  statusDrop.addEventListener("change", (e) => {

    let idx = getTicketIdx(id);
    let dropVal = statusDrop.value;
    console.log(dropVal);
    // dropdown.selectedIndex = dropIdx ;

    // console.log(ticketsContArr[idx].stat, ".............");

    ticketsContArr[idx].stat = dropVal;
    status.innerText = dropVal ;

    // console.log(ticketsContArr[idx].stat, "............2");

    localStorage.setItem("Jira-Tickets", JSON.stringify(ticketsContArr));

    // createTicket(ticket.text, ticket.ticketColor, ticket.ticketName, ticket.date, ticket.today, ticket.stat, ticket.ticketId);
    // console.log(ticketsContArr[idx].stat, "............3");
  });
}

function modalSetDefault() {
  allPriorityColors.forEach((pColor, idx) => {
    pColor.classList.remove("active"); // remove border from the selected color
  });
  allPriorityColors[allPriorityColors.length - 1].classList.add("active");
  modal.style.display = "none";
  textAreaCont.value = "";
  ticketName.value = "";

  modalPriorityColor = colors[colors.length - 1];
}

function getTicketIdx(id) {
  let ticketIdx = ticketsContArr.findIndex(function (ticketArrObj) {
    return ticketArrObj.ticketId === id;
  });
  return ticketIdx;
}
