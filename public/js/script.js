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
});
