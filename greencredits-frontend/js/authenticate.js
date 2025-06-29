console.log("✅ authenticate.js loaded");

const creditId = localStorage.getItem('creditId');
const ipfsCID = localStorage.getItem('ipfsCID');

document.getElementById('creditId').value = creditId || '';
document.getElementById('ipfsCID').value = ipfsCID || '';

document.getElementById('authForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const metaJson = {
    carbonmarkScore: parseInt(document.getElementById('score').value),
    registry: document.getElementById('registry').value,
    registryLink: document.getElementById('registryLink').value,
    projectType: document.getElementById('projectType').value,
    authenticated: true
  };

  const res = await fetch('https://ubiquitous-lamp-4jwp6jv754qcwpq-5000.app.github.dev/api/credits/authenticate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      creditId,
      ipfsCID,
      owner: "user123",
      metaJson: JSON.stringify(metaJson)
    })
  });

  const data = await res.json();
  console.log('✅ Auth response:', data);

  document.getElementById('authOutput').textContent = JSON.stringify(data, null, 2);

  // Save for next step
  localStorage.setItem('authenticated', true);
});
