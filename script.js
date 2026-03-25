const inputs = document.querySelectorAll("input");

inputs.forEach(input => {
  input.addEventListener("input", calculateBMI);
});

function calculateBMI() {
  const feet = parseFloat(document.getElementById("feet").value) || 0;
  const inches = parseFloat(document.getElementById("inches").value) || 0;
  const weight = parseFloat(document.getElementById("weight").value) || 0;

  const totalInches = (feet * 12) + inches;

  if (totalInches === 0 || weight === 0) {
    document.getElementById("result").innerText = "";
    return;
  }

  const bmi = (weight / (totalInches * totalInches)) * 703;

  let category = "";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  document.getElementById("result").innerText =
    `BMI: ${bmi.toFixed(2)} (${category})`;
}
