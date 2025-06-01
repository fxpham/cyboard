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
                copyBtn = '<button id="copy-result-btn" style="margin-top:12px;margin-right:8px;">Copy Result</button>';
              }
              resultCol.innerHTML = `<h3>${command}</h3><p>${data.created}</p><pre id="result-content" style="white-space: pre-wrap;">${data.result}</pre>${copyBtn}<button id="show-detail-btn" style="margin-top:12px;">Detail</button><div id="detail-section" style="display:none;"></div>`;
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
                  detailSection.innerHTML = `<h3>Detail</h3><pre style='white-space: pre-wrap;'>${data.detail}</pre>`;
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
                let grid = '<div id="screenshot-gallery-grid" style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;">' +
                  data.images.map((img, idx) =>
                    `<img src="${img}" alt="screenshot" class="screenshot-thumb" data-idx="${idx}" style="height:240px;width:auto;cursor:pointer;border:2px solid #ccc;object-fit:cover;max-width:100%;" />`
                  ).join('') + '</div>';
                let downloadBtn = `<a href="/result/screenshot/${encodeURIComponent(command)}/download" class="download-screenshot-btn" style="display:inline-block;margin:12px 0 16px 0;padding:8px 18px;background:#007bff;color:#fff;border-radius:4px;text-decoration:none;" download>Download All as ZIP</a>`;
                resultCol.innerHTML = `<h2>Screenshots for ${command}</h2>${downloadBtn}${grid}`;
                let modal = document.createElement('div');
                modal.id = 'screenshot-modal';
                modal.style = 'display:none;position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);justify-content:center;align-items:center;';
                modal.innerHTML = `<div id="screenshot-modal-content" style="background:#fff;padding:16px;border-radius:8px;max-width:90vw;max-height:90vh;display:flex;flex-direction:column;align-items:center;">
                  <div style="overflow:auto;max-width:80vw;max-height:80vh;">
                    <img id="screenshot-modal-img" src="" alt="screenshot" style="max-width:100%;max-height:100%;display:block;margin-bottom:8px;" />
                  </div>
                  <div id="screenshot-modal-name" style="text-align:center;font-weight:bold;margin-bottom:8px;"></div>
                  <button id="screenshot-modal-close" style="padding:6px 18px;">Close</button>
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
