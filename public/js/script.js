document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.run-spec-command').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const command = btn.getAttribute('data-command');
      btn.disabled = true;
      btn.textContent = 'Running...';
      fetch(`/command/execute/${encodeURIComponent(command)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => {
          btn.textContent = 'Run';
          btn.disabled = false;
          if (data.error) {
            alert('Error: ' + data.error);
          } else {
            alert('Command finished! Check logs or console for output.');
          }
        })
        .catch(err => {
          btn.textContent = 'Run';
          btn.disabled = false;
          alert('Request failed: ' + err);
        });
    });
  });

  // Add event listeners for Result buttons in executed commands
  document.querySelectorAll('.show-result-command').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const command = btn.getAttribute('data-command');
      fetch(`/result/log/${encodeURIComponent(command)}`)
        .then(response => response.json())
        .then(data => {
          // Display result in the third column
          const resultCol = document.querySelector('.column-3');
          if (resultCol) {
            resultCol.innerHTML = `<h2>Result for ${command}</h2><pre style="white-space: pre-wrap;">${data.result}</pre>`;
          }
        })
        .catch(err => {
          const resultCol = document.querySelector('.column-3');
          if (resultCol) {
            resultCol.innerHTML = `<h2>Result for ${command}</h2><pre>Error loading result: ${err}</pre>`;
          }
        });
    });
  });
});
