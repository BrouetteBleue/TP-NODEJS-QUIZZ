function addAnswer() {
  let container = document.getElementById("answers-container");
  let div = document.createElement("div");

    let answerCount = document.querySelectorAll("#AnswerD").length;

    if (answerCount >= 5) {
      console.log("maximum 5 réponses possibles");
      document.getElementById("max-answer").style.visibility = "visible";
      exit();
    }

  let label = document.createElement("label");
  label.setAttribute("for", "answer" + (answerCount + 1));
  label.innerText = "Réponse " + (answerCount + 1) + " :";
  
  let input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("id", "answer" + (answerCount + 1));
  input.setAttribute("name", "answer["+ (answerCount + 1)+"][answer]");

  let checkbox = document.createElement("input");
  checkbox.setAttribute("type", "checkbox");
  checkbox.setAttribute("name", "answer["+ (answerCount + 1)+"][correct]");
  let checkboxLabel = document.createElement("label");
  checkboxLabel.setAttribute("for", "Bonne réponse");
  checkboxLabel.innerText = "Bonne réponse";


  div.setAttribute("id", "AnswerD");

  container.appendChild(div);
  div.appendChild(label);
    div.appendChild(input);
    div.appendChild(checkbox);
    div.appendChild(checkboxLabel);


}

// function to redirect to the question page
function startQuizz(theme) {
  window.location.href = "/quizz/" + theme;
}
