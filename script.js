document.addEventListener("DOMContentLoaded", function () {
  const submitButton = document.getElementById("submitButton");
  const spinner = document.getElementById("spinner");
  const resultContainer = document.getElementById("resultContainer");
  const fileInput = document.getElementById("imageInput"); // Assuming file input has id 'imageInput'

  submitButton.addEventListener("click", async function () {
    const problemDescription =
      document.getElementById("problemDescription").value;
    const affectedPart = document.getElementById("affectedPart").value;
    const imageFile = fileInput.files[0];

    if (!imageFile) {
      alert("Please select an image first!");
      return;
    }

    // Show the loading spinner
    spinner.style.display = "block";
    resultContainer.innerHTML = ""; // Clear previous results

    try {
      // Convert the uploaded image to a Base64 string
      const base64Image = await convertImageToBase64(imageFile);

      // Send the image and problem description to the backend
      const response = await fetch("/api/analyze-shoe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64Image: base64Image,
          problemDescription: problemDescription,
          affectedPart: affectedPart,
        }),
      });

      const data = await response.json();
      displayResults(data); // Call displayResults to handle the response data
    } catch (error) {
      spinner.style.display = "none";
      resultContainer.innerText = `Error: ${error.message}`;
    }
  });

  // Convert the image file to Base64 string
  function convertImageToBase64(imageFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = function () {
        resolve(reader.result.split(",")[1]); // Get Base64 part (strip out the "data:image/*;base64," part)
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }

  // Function to display results dynamically based on the AI's response
  function displayResults(data) {
    // Check if data is a string and parse it if necessary
    if (typeof data === "string") {
      data = JSON.parse(data); // Parse the string into a JavaScript object
    }

    // Create and display HTML content based on the response from AI
    resultContainer.innerHTML = `
      <div><strong>Brand and Model:</strong> ${
        data.brandAndModel || "Not Available"
      }</div>

      <div><strong>Materials:</strong></div>
      <ul style="margin: 0; padding-left: 10px;">
        ${Object.entries(data.materials || {})
          .map(
            ([part, material]) => `
          <li style="margin: 2px 0;"><strong>${
            part.charAt(0).toUpperCase() + part.slice(1)
          }:</strong> ${material}</li>
        `
          )
          .join("")}
      </ul>

      <div><strong>Cleaning Recommendations:</strong></div>
      ${
        data.cleaningRecommendations && data.cleaningRecommendations.length > 0
          ? data.cleaningRecommendations
              .map(
                (rec) => `
          <div><strong>Affected Part: ${rec.affectedPart}</strong></div>
          <ul style="margin: 0; padding-left: 10px;">
              ${rec.recommendations
                .map((r) => `<li style="margin: 2px 0;">${r}</li>`)
                .join("")}
          </ul>
        `
              )
              .join("")
          : "<div>No cleaning recommendations available.</div>"
      }

      <div><strong>General Care:</strong></div>
      ${
        data.generalCare && data.generalCare.length > 0
          ? `<ul style="margin: 0; padding-left: 10px;">
            ${data.generalCare
              .map((care) => `<li style="margin: 2px 0;">${care}</li>`)
              .join("")}
          </ul>`
          : "<div>No general care information available.</div>"
      }
    `;

    // Hide the spinner and show the results
    spinner.style.display = "none";
    resultContainer.style.display = "block";
  }
});
