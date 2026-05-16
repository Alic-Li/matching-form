const form = document.getElementById("matchingForm");
const statusBox = document.getElementById("status");
const submitButton = form.querySelector("button[type='submit']");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";
  statusBox.style.display = "none";
  statusBox.textContent = "";

  try {
    let result = await submitForm(data);

    if (result.code === "DUPLICATE_NAME") {
      const shouldOverwrite = confirm(
        "This name already exists. Do you want to overwrite the existing submission?"
      );

      if (!shouldOverwrite) {
        return;
      }

      result = await submitForm({
        ...data,
        overwrite: true
      });
    }

    statusBox.textContent = result.overwritten
      ? "Your previous submission has been updated successfully."
      : "Thanks! Your information has been submitted successfully.";

    statusBox.style.display = "block";
    form.reset();

    alert("Submission successful!");
  } catch (err) {
    alert(err.message || "Submission failed. Please try again later.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
  }
});

async function submitForm(data) {
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const text = await res.text();

  let result = {};
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Server did not return valid JSON.");
  }

  if (!res.ok && result.code !== "DUPLICATE_NAME") {
    throw new Error(result.error || "Submission failed.");
  }

  return result;
}