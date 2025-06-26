document.getElementById('uploadForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData();
  const fileInput = document.querySelector('input[type="file"]');
  formData.append('certificate', fileInput.files[0]);

  const res = await fetch('https://ubiquitous-lamp-4jwp6jv754qcwpq-5000.app.github.dev/api/credits/upload', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  document.getElementById('output').innerText = JSON.stringify(data, null, 2);

  // Store returned data for next steps
  localStorage.setItem('creditId', data.creditId);
  localStorage.setItem('ipfsCID', data.ipfsCID);
});
