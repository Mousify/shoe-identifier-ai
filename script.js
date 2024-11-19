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

    // Send the image and problem description to the backend (Vercel's serverless function)
    const response = await fetch("/api/analyze-shoe", {
      // Use relative URL for Vercel serverless function
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
