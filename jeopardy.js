const WIDTH = 6;
const HEIGHT = 5;

/*
    Functions list:
        * getCategoryIds() - returns array of random catIds
        * getCategory(catId)
        async fillTable()
        handleClick(evt)
        showLoadingView() - show spinning wheel
        hideLoadingView() - hide spinning wheel
        async setupAndStart()
*/

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
const NUM_CATEGORIES = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

function getCategoryIds() {
    for (let i = 0; i < WIDTH; i++) {
        let randomCategory = Math.floor(Math.random() * 10000);
        NUM_CATEGORIES.push(randomCategory)
    }   
    console.log(NUM_CATEGORIES);    // remember to delete
    return NUM_CATEGORIES;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) { 
    let res = await axios.get("https://jservice.io/api/category", {params: {id: catId}});
    // console.log(res.data.clues);      // remember to delete
    let cluesLength = res.data.clues.length;
    if (res.data.clues.length < HEIGHT) {
        console.log(`${cluesLength} is too short.`);
    }
    let clueArray = [];
    let clues = res.data.clues;
    for (let x = 0; x < clues.length; x++) {
        const clueObject = {
            question: clues[x].question,
            answer: clues[x].answer,
            showing: null
        }
        clueArray.push(clueObject);
    }

    const catObject = {
        title: res.data.title,
        clues: clueArray
    };
    console.log(catObject);
    return catObject;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    const table = document.querySelector("#jeopardy");

    let top = document.createElement("tr"); // top row for categories
    top.setAttribute("id", "categories");

    // create cells for categories
    for (let x = 0; x < WIDTH; x++) {
        let headCell = document.createElement("td");
        headCell.setAttribute("id", x);
        top.append(headCell);

        let category = document.createElement("h1");
        category.innerHTML = categories[x].title;       // call function to get category name from api. 
        headCell.append(category);
    }
    table.append(top);
    
    // ----- body ----- 

    for (let y = 0; y < HEIGHT; y++) {
        const row = document.createElement("tr");
        row.setAttribute("id", "questions")
        for (let x = 0; x < WIDTH; x++) {
            const cell = document.createElement("td");
            cell.setAttribute("id", `${y}-${x}`);
            cell.addEventListener("click", handleClick)

            const question = document.createElement("p");
            question.innerHTML = "<i class='fas fa-question-circle'></i>";
            cell.append(question);
            row.append(cell);
        }
        table.append(row);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    evt.preventDefault();

    const evtId = evt.target.id || evt.target.parentElement.id || evt.target.parentElement.parentElement.id;
    const evtArray = evtId.split("-");
    const row = evtArray[0];
    const col = evtArray[1];
    let evtClue = evt.target;
    if (categories[col].clues[row].showing == null) {
        // show question and set .showing to "question"
        evtClue.classList.remove("fas", "fa-question-circle");
        evtClue.innerHTML = categories[col].clues[row].question;
        categories[col].clues[row].showing = "question";
    } else if (categories[col].clues[row].showing == "question") {
        // show answer and set .showing to "answer"
        evtClue.innerHTML = categories[col].clues[row].answer;
        evt.target.classList.add("answered");
        categories[col].clues[row].showing = "answer";
    } else if (categories[col].clues[row].showing == "answer") {
        console.log("click ignored");
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    document.getElementById("loader").style.display = "block";
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    document.getElementById("loader").style.display = "none";
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    let arr = getCategoryIds();
    for (let i = 0; i < WIDTH; i++) {
        let pushCatObject = await getCategory(arr[i]);
        categories.push(pushCatObject);
    }
    await fillTable();
    hideLoadingView();
}

const btn = document.querySelector("#button");
btn.classList.add("start");
btn.addEventListener("click", () => {
    if (button.getAttribute("class") == "start") {
        button.setAttribute("class", "restart");
        button.innerText = "Restart";
        showLoadingView();
        setupAndStart();
    } else if (button.getAttribute("class") == "restart") {
        // console.log("it worked");
        window.location.reload();
        setupAndStart();
    }
});
