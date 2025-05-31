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
              // Build gallery thumbnails
              let thumbnails = data.images.map((img, idx) =>
                `<img src="${img}" alt="screenshot" class="screenshot-thumb${idx === 0 ? ' active' : ''}" data-idx="${idx}" style="height:100px;width:auto;margin:0 8px 8px 0;cursor:pointer;border:2px solid #ccc;flex:0 0 auto;" />`
              ).join('');
              // Initial full image
              let imgName = data.images[0].split('/').pop();
              let fullImg = `<div id="screenshot-img-name" style="text-align:center;font-weight:bold;margin-bottom:8px;">${imgName}</div><img id="screenshot-full-img" src="${data.images[0]}" alt="screenshot" style="max-width:100%;display:block;margin:0 auto 8px auto;" />`;
              resultCol.innerHTML = `<h2>Screenshots for ${command}</h2><div id="screenshot-gallery-thumbs" style="display:flex;flex-wrap:nowrap;overflow-x:auto;margin-bottom:12px;">${thumbnails}</div><div id="screenshot-gallery-full">${fullImg}</div>`;
              // Add click event for thumbnails
              document.querySelectorAll('.screenshot-thumb').forEach(function (thumb) {
                thumb.addEventListener('click', function () {
                  const idx = parseInt(thumb.getAttribute('data-idx'));
                  const fullImgEl = document.getElementById('screenshot-full-img');
                  const imgNameEl = document.getElementById('screenshot-img-name');
                  fullImgEl.src = data.images[idx];
                  imgNameEl.textContent = data.images[idx].split('/').pop();
                  // Remove active from all, add to clicked
                  document.querySelectorAll('.screenshot-thumb').forEach(t => t.classList.remove('active'));
                  thumb.classList.add('active');
                });
              });
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
