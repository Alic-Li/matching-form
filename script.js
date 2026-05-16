const form = document.getElementById("matchingForm");
const statusBox = document.getElementById("status");
const submitButton = form.querySelector("button[type='submit']");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";
  statusBox.style.display = "none";

  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Submission failed.");
    }

    statusBox.textContent = "Thanks! Your information has been submitted.";
    statusBox.style.display = "block";
    form.reset();
  } catch (err) {
    alert(err.message || "Submission failed. Please try again later.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
  }
});