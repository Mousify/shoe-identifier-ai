document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("shoeImage");
  const previewImage = document.getElementById("previewImage");
  const resultContainer = document.getElementById("resultContainer");
  const spinner = document.getElementById("spinner");
  const submitButton = document.getElementById("submitButton");

  // Preview the uploaded image
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.style.display = "block"; // Show the preview image
      };
      reader.readAsDataURL(file);
    }
  });

  // Analyze the shoe image when the user clicks the submit button
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
      const response = await fetch("http://192.168.1.163:3000/analyze-shoe", {
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

  // Function to handle image upload and convert it to Base64
  function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // Extract the Base64 string
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file); // Read the image file as a data URL
    });
  }

  // Function to display results with reduced gaps
  function displayResults(data) {
    // Check if data is a string and parse it if necessary
    if (typeof data === "string") {
      data = JSON.parse(data); // Parse the string into a JavaScript object
    }

    // Create a formatted string for display with reduced gaps and minimal whitespace
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
