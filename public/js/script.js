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
          // Display result in the third column with Detail button
          const resultCol = document.querySelector('.column-3');
          if (resultCol) {
            resultCol.innerHTML = `<h2>Result for ${command}</h2><pre id="result-content" style="white-space: pre-wrap;">${data.result}</pre><button id="copy-result-btn" style="margin-top:12px;margin-right:8px;">Copy Result</button><button id="show-detail-btn" style="margin-top:12px;">Detail</button><div id="detail-section" style="display:none;"></div>`;
            document.getElementById('copy-result-btn').onclick = function () {
              const text = document.getElementById('result-content').textContent;
              navigator.clipboard.writeText(text).then(() => {
                this.textContent = 'Copied!';
                setTimeout(() => { this.textContent = 'Copy Result'; }, 1200);
              });
            };
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
          const resultCol = document.querySelector('.column-3');
          if (resultCol) {
            resultCol.innerHTML = `<h2>Result for ${command}</h2><pre>Error loading result: ${err}</pre>`;
          }
        });
    });
  });

  // Add event listeners for Screenshot buttons in executed commands
  document.querySelectorAll('.show-screenshot-command').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const command = btn.getAttribute('data-command');
      fetch(`/result/screenshot/${encodeURIComponent(command)}`)
        .then(response => response.json())
        .then(data => {
          const resultCol = document.querySelector('.column-3');
          if (resultCol) {
            if (data.images && data.images.length > 0) {
              // Build grid of thumbnails (6 per row)
              let grid = '<div id="screenshot-gallery-grid" style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;">' +
                data.images.map((img, idx) =>
                  `<img src="${img}" alt="screenshot" class="screenshot-thumb" data-idx="${idx}" style="height:240px;width:auto;cursor:pointer;border:2px solid #ccc;object-fit:cover;max-width:100%;" />`
                ).join('') + '</div>';
              // Add Download button
              let downloadBtn = `<a href="/result/screenshot/${encodeURIComponent(command)}/download" class="download-screenshot-btn" style="display:inline-block;margin:12px 0 16px 0;padding:8px 18px;background:#007bff;color:#fff;border-radius:4px;text-decoration:none;" download>Download All as ZIP</a>`;
              resultCol.innerHTML = `<h2>Screenshots for ${command}</h2>${downloadBtn}${grid}`;
              // Modal HTML (hidden by default)
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
              // Add click event for thumbnails
              document.querySelectorAll('.screenshot-thumb').forEach(function (thumb) {
                thumb.addEventListener('click', function () {
                  const idx = parseInt(thumb.getAttribute('data-idx'));
                  document.getElementById('screenshot-modal-img').src = data.images[idx];
                  document.getElementById('screenshot-modal-name').textContent = data.images[idx].split('/').pop();
                  modal.style.display = 'flex';
                });
              });
              // Close modal on button click or background click
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
          const resultCol = document.querySelector('.column-3');
          if (resultCol) {
            resultCol.innerHTML = `<h2>Screenshots for ${command}</h2><pre>Error loading screenshots: ${err}</pre>`;
          }
        });
    });
  });
});
