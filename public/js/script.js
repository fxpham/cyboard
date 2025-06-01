document.addEventListener('DOMContentLoaded', function () {
  function updateExecutedCommands() {
    fetch('/')
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newList = doc.querySelector('.column-2 .custom-list');
        if (newList) {
          const col2 = document.querySelector('.column-2 .custom-list');
          if (col2) {
            col2.innerHTML = newList.innerHTML;
            bindScreenshotButtons();
            bindResultButtons();
          }
          const col3 = document.querySelector('.column-3');
          if (col3) {
            const newResult = doc.querySelector('.column-3');
            if (newResult) {
              col3.innerHTML = newResult.innerHTML;
            }
          }
        }
      });
  }

  // Show progress info in the UI
  function updateProgressInfo() {
    fetch('/command/progress')
    .then(res => res.json())
    .then(data => {
      let info = `Executed: ${data.executedCount} | Queue: ${data.queueLength}`;
      let progressRunning = document.getElementById('progress-running');
      progressRunning.textContent = data.running ? `Running: ${data.running}` : '';
      let progressStatus = document.getElementById('progress-status');
      progressStatus.textContent = info;
    });
  }
  updateProgressInfo();

  function bindResultButtons() {
    document.querySelectorAll('.show-result-command').forEach(function (btn) {
      btn.onclick = function () {
        const command = btn.getAttribute('data-command');
        fetch(`/result/log/${encodeURIComponent(command)}`)
          .then(response => response.json())
          .then(data => {
            const resultCol = document.getElementById('command-result');
            if (resultCol) {
              let copyBtn = '';
              if (data.result && data.result.trim() !== '') {
                copyBtn = '<button id="copy-result-btn" class="copy-result-btn">Copy Result</button>';
              }
              resultCol.innerHTML = `<h3>${command}</h3><p>${data.created}</p><pre id="result-content" class="result-content">${data.result}</pre>${copyBtn}<button id="show-detail-btn" class="show-detail-btn">Detail</button><div id="detail-section" class="detail-section" style="display:none;"></div>`;
              if (copyBtn) {
                document.getElementById('copy-result-btn').onclick = function () {
                  const text = document.getElementById('result-content').textContent;
                  navigator.clipboard.writeText(text).then(() => {
                    this.textContent = 'Copied!';
                    setTimeout(() => { this.textContent = 'Copy Result'; }, 1200);
                  });
                };
              }
              document.getElementById('show-detail-btn').onclick = function () {
                const detailSection = document.getElementById('detail-section');
                if (detailSection.style.display === 'none') {
                  detailSection.style.display = 'block';
                  detailSection.innerHTML = `<h3>Detail</h3><pre class='detail-pre'>${data.detail}</pre>`;
                  this.textContent = 'Hide Detail';
                } else {
                  detailSection.style.display = 'none';
                  this.textContent = 'Detail';
                }
              };
            }
          })
          .catch(err => {
            const resultCol = document.getElementById('command-result');
            if (resultCol) {
              resultCol.innerHTML = `<h2>Result for ${command}</h2><pre>Error loading result: ${err}</pre>`;
            }
          });
      };
    });
  }

  function bindScreenshotButtons() {
    document.querySelectorAll('.show-screenshot-command').forEach(function (btn) {
      btn.onclick = function () {
        const command = btn.getAttribute('data-command');
        fetch(`/result/screenshot/${encodeURIComponent(command)}`)
          .then(response => response.json())
          .then(data => {
            const resultCol = document.getElementById('command-result');
            if (resultCol) {
              if (data.images && data.images.length > 0) {
                const oldModal = document.getElementById('screenshot-modal');
                if (oldModal) oldModal.remove();
                let grid = '<div id="screenshot-gallery-grid" class="screenshot-gallery-grid">' +
                  data.images.map((img, idx) =>
                    `<img src="${img}" alt="screenshot" class="screenshot-thumb" data-idx="${idx}" />`
                  ).join('') + '</div>';
                let downloadBtn = `<a href="/result/screenshot/${encodeURIComponent(command)}/download" class="download-screenshot-btn" download>Download All as ZIP</a>`;
                resultCol.innerHTML = `<h2>Screenshots for ${command}</h2>${downloadBtn}${grid}`;
                let modal = document.createElement('div');
                modal.id = 'screenshot-modal';
                modal.className = 'screenshot-modal';
                modal.innerHTML = `<div id="screenshot-modal-content" class="screenshot-modal-content">
                  <div class="screenshot-modal-img-wrap">
                    <img id="screenshot-modal-img" src="" alt="screenshot" class="screenshot-modal-img" />
                  </div>
                  <div id="screenshot-modal-name" class="screenshot-modal-name"></div>
                  <button id="screenshot-modal-close" class="screenshot-modal-close">Close</button>
                </div>`;
                document.body.appendChild(modal);
                document.querySelectorAll('.screenshot-thumb').forEach(function (thumb) {
                  thumb.onclick = function () {
                    const idx = parseInt(thumb.getAttribute('data-idx'));
                    document.getElementById('screenshot-modal-img').src = data.images[idx];
                    document.getElementById('screenshot-modal-name').textContent = data.images[idx].split('/').pop();
                    modal.style.display = 'flex';
                  };
                });
                document.getElementById('screenshot-modal-close').onclick = function () {
                  modal.style.display = 'none';
                };
                modal.onclick = function (e) {
                  if (e.target === modal) modal.style.display = 'none';
                };
              } else {
                resultCol.innerHTML = `<h2>Screenshots for ${command}</h2><p>No screenshots found.</p>`;
              }
            }
          })
          .catch(err => {
            const resultCol = document.getElementById('command-result');
            if (resultCol) {
              resultCol.innerHTML = `<h2>Screenshots for ${command}</h2><pre>Error loading screenshots: ${err}</pre>`;
            }
          });
      };
    });
  }

  document.querySelectorAll('.run-spec-command').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const command = btn.getAttribute('data-command');
      btn.disabled = true;
      btn.textContent = 'Running...';
      updateProgressInfo();
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
            // alert('Command finished! Check logs or console for output.');
            updateExecutedCommands();
          }
          updateProgressInfo();
        })
        .catch(err => {
          btn.textContent = 'Run';
          btn.disabled = false;
          alert('Request failed: ' + err);
        });
    });
  });

  // Handle Delete all button
  const deleteAllBtn = document.getElementById('delete-all-btn');
  if (deleteAllBtn) {
    deleteAllBtn.onclick = function () {
      if (!confirm('Are you sure you want to delete all results? This action cannot be undone.')) return;
      fetch('/result/delete', { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('All results deleted successfully.');
            updateExecutedCommands();
          } else {
            alert('Failed to delete results: ' + (data.error || 'Unknown error'));
          }
        })
        .catch(err => {
          alert('Failed to delete results: ' + err);
        });
    };
  }

  bindResultButtons();
  bindScreenshotButtons();
});
