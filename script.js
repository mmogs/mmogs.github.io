document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("input");

  inputs.forEach(input => {
    input.addEventListener("input", calculateBMI);
  });

  function calculateBMI() {
    const feet = parseFloat(document.getElementById("feet").value.trim()) || 0;
    const inches = parseFloat(document.getElementById("inches").value.trim()) || 0;
    const weight = parseFloat(document.getElementById("weight").value.trim()) || 0;
    const minProtein = weight * 0.7;
    const maxProtein = weight * 1.0;

    const proteinMessage = `Protein for optimal muscle growth: ${minProtein.toFixed(0)}–${maxProtein.toFixed(0)}g/day`;
    const totalInches = (feet * 12) + inches;

    if (totalInches === 0 || weight === 0) {
      document.getElementById("result").innerText = "";
      return;
    }

    const bmi = (weight / (totalInches * totalInches)) * 703;

    // Determine BMI category
    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese"; 

    let resultText = `BMI: ${bmi.toFixed(2)} (${category})`;

    // Only show calorie adjustment if underweight or overweight/obese
    if (bmi < 18.5 || bmi >= 25) {
      const minNormalBMI = 18.5;
      const maxNormalBMI = 24.9;
      const heightInchesSquared = totalInches * totalInches;

      const minWeight = (minNormalBMI * heightInchesSquared) / 703;
      const maxWeight = (maxNormalBMI * heightInchesSquared) / 703;
      const targetWeight = (minWeight + maxWeight) / 2;

      const weightDiff = weight - targetWeight; // positive = need to lose
      const totalCalories = weightDiff * 3500; // 1 lb fat ≈ 3500 calories
      const dailyCalories = totalCalories / 365;

      if (weightDiff > 0) {
        resultText += `\nTo reach normal weight in 1 year, reduce ~${Math.abs(dailyCalories.toFixed(0))} calories/day.`;
      } else if (weightDiff < 0) {
        resultText += `\nTo reach normal weight in 1 year, increase ~${Math.abs(dailyCalories.toFixed(0))} calories/day.`;
      }
    }

    document.getElementById("result").innerText =
  resultText + "\n" + proteinMessage;
  }
});