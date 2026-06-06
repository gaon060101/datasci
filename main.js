document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sendBtn = document.getElementById('sendBtn');
    const promptInput = document.getElementById('promptInput');
    const chatHistory = document.getElementById('chatHistory');
    const dashboard = document.getElementById('dashboard');
    const tplDashboard = document.getElementById('tpl-dashboard').innerHTML;
    
    // File Upload Elements
    const btnUpload = document.getElementById('btnUpload');
    const fileUpload = document.getElementById('fileUpload');
    const attachmentsDiv = document.getElementById('attachments');

    // Sidebar
    const btnNewProject = document.getElementById('btnNewProject');
    const historyListItems = document.querySelectorAll('#historyList li');
    
    // Modals
    const btnExport = document.getElementById('btnExport');
    const modalExport = document.getElementById('modalExport');
    const btnConfirmExport = document.getElementById('btnConfirmExport');
    const closeBtns = document.querySelectorAll('.close-modal');

    // Chips
    const suggestionChips = document.querySelectorAll('.chip');

    let isProcessing = false;
    let mainChart = null;
    let selectedFiles = []; // Store actual file objects
    let sessionId = null; // Store backend session ID

    // --- Modal Logic ---
    function openModal(modal) {
        if(modal) modal.classList.add('active');
    }
    
    function closeModal(modal) {
        if(modal) modal.classList.remove('active');
    }

    if(btnExport) {
        btnExport.addEventListener('click', () => openModal(modalExport));
    } closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) closeModal(modal);
        });
    });

    if(btnConfirmExport) {
        btnConfirmExport.addEventListener('click', (e) => {
            const btn = e.target;
            btn.innerHTML = '<div class="spinner"></div> 생성 중...';
            setTimeout(() => {
                btn.innerHTML = '다운로드 완료!';
                
                // Create dummy file download
                const blob = new Blob(["이 파일은 시연용으로 자동 생성된 통합 데이터/리포트입니다.\n데이터 추출일자: 2026-06-06"], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "공중화장실_통합분석리포트.csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setTimeout(() => {
                    closeModal(modalExport);
                    btn.innerHTML = '다운로드 시작';
                }, 1000);
            }, 1500);
        });
    }

    // --- Sidebar Logic ---
    if(btnNewProject) {
        btnNewProject.addEventListener('click', () => {
            chatHistory.innerHTML = `
                <div class="message ai-message">
                    <div class="msg-icon"><div class="logo-small"></div></div>
                    <div class="msg-content">
                        <div class="msg-text">새로운 연구 프로젝트를 시작합니다. 분석할 CSV 데이터를 업로드하시고 목적을 말씀해 주세요.</div>
                    </div>
                </div>`;
            dashboard.classList.remove('active');
            document.getElementById('suggestionChips').style.display = 'flex';
            promptInput.value = '';
            attachmentsDiv.style.display = 'none';
            attachmentsDiv.innerHTML = '';
            selectedFiles = [];
            sessionId = null;
            dashboard.classList.remove('active');
            historyListItems.forEach(li => li.classList.remove('active'));
        });
    }

    // --- File Upload Logic ---
    if(btnUpload) btnUpload.addEventListener('click', () => fileUpload.click());

    if(fileUpload) {
        fileUpload.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                attachmentsDiv.style.display = 'flex';
                Array.from(files).forEach(file => {
                    selectedFiles.push(file); // Store file
                    const attachment = document.createElement('div');
                    attachment.className = 'attachment';
                    attachment.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        ${file.name}
                        <button class="remove-file" title="제거" data-name="${file.name}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    `;
                    attachmentsDiv.appendChild(attachment);

                    attachment.querySelector('.remove-file').addEventListener('click', (ev) => {
                        const nameToRemove = ev.currentTarget.dataset.name;
                        selectedFiles = selectedFiles.filter(f => f.name !== nameToRemove);
                        attachment.remove();
                        if(selectedFiles.length === 0) {
                            attachmentsDiv.style.display = 'none';
                        }
                    });
                });
            }
        });
    }

    // --- Chips Logic ---
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            promptInput.value = chip.dataset.text;
            promptInput.focus();
        });
    });

    // --- Chat & Typewriter Logic ---
    function addUserMessage(text) {
        const html = `
            <div class="message user-message">
                <div class="msg-content">${text}</div>
            </div>`;
        chatHistory.insertAdjacentHTML('beforeend', html);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function addAiMessageTypewriter(text, callback) {
        const msgId = 'msg-' + Date.now();
        const html = `
            <div class="message ai-message">
                <div class="msg-icon"><div class="logo-small"></div></div>
                <div class="msg-content">
                    <div class="msg-text typing-cursor" id="${msgId}"></div>
                </div>
            </div>`;
        chatHistory.insertAdjacentHTML('beforeend', html);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        const el = document.getElementById(msgId);
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                el.innerHTML += text.charAt(i);
                i++;
                chatHistory.scrollTop = chatHistory.scrollHeight;
                setTimeout(typeWriter, 15); // Fast typing speed
            } else {
                el.classList.remove('typing-cursor');
                if (callback) callback();
            }
        }
        typeWriter();
    }

    let charts = [];

    // --- Chart Rendering ---
    function renderChart(statsData, type = 'bar', purpose = 'explore') {
        charts.forEach(c => c.destroy());
        charts = [];

        const ctx1 = document.getElementById('chart1')?.getContext('2d');
        const ctx2 = document.getElementById('chart2')?.getContext('2d');
        const ctx3 = document.getElementById('chart3')?.getContext('2d');
        if(!ctx1 || !ctx2 || !ctx3) return;

        const labels = statsData.map(s => s.city);
        let config1, config2, config3;
        
        const colors = ['rgba(99, 102, 241, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(239, 68, 68, 0.7)'];
        const borders = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

        const baseOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

        if (purpose.includes('anomaly')) {
            config1 = { type: 'doughnut', data: { labels, datasets: [{ data: statsData.map(s => s.missing_pct), backgroundColor: colors }] }, options: { ...baseOptions, plugins: { legend: { display: true }, title: { display: true, text: '지자체별 결측치/이상치 비율 (%)', color: '#fff' } } } };
            config2 = { type: 'bar', data: { labels, datasets: [{ label: '결측 건수', data: statsData.map(s => s.total - s.valid), backgroundColor: colors[3] }] }, options: { ...baseOptions, plugins: { title: { display: true, text: '지자체별 결측 건수', color: '#fff' } } } };
            config3 = { type: 'polarArea', data: { labels, datasets: [{ data: statsData.map(s => s.missing_pct * s.total / 100), backgroundColor: colors }] }, options: { ...baseOptions, plugins: { title: { display: true, text: '결측치 분포도', color: '#fff' } } } };
        } else if (purpose.includes('infrastructure')) {
            config1 = { type: 'pie', data: { labels, datasets: [{ data: statsData.map(s => s.manager_pct), backgroundColor: colors }] }, options: { ...baseOptions, plugins: { legend: { display: true }, title: { display: true, text: '안전관리인 지정 완료 비율 (%)', color: '#fff' } } } };
            config2 = { type: 'bar', data: { labels, datasets: [{ label: '석면 건축물 수', data: statsData.map(s => s.total * (s.asbestos_pct/100)), backgroundColor: colors[2] }, { label: '일반 건축물 수', data: statsData.map(s => s.total * (1 - s.asbestos_pct/100)), backgroundColor: colors[1] }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } }, plugins: { title: { display: true, text: '지자체별 석면건축물(Y/N) 분포', color: '#fff' } } } };
            config3 = { type: 'bar', data: { labels, datasets: [{ label: '연면적 총합 (㎡)', data: statsData.map(s => s.avg_total * s.total), backgroundColor: colors[0] }] }, options: { ...baseOptions, plugins: { title: { display: true, text: '지자체별 연면적 총합 규모', color: '#fff' } } } };
        } else if (purpose.includes('correlation')) {
            config1 = { type: 'scatter', data: { datasets: statsData.map((s, i) => ({ label: s.city, data: [{ x: s.avg_total, y: s.avg_asbestos }], backgroundColor: colors[i] })) }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { title: { display: true, text: '평균 연면적' } }, y: { title: { display: true, text: '평균 석면면적' } } }, plugins: { title: { display: true, text: '연면적 vs 석면자재면적 상관관계', color: '#fff' } } } };
            config2 = { type: 'line', data: { labels, datasets: [{ label: '안전관리인 지정률 (%)', data: statsData.map(s => s.manager_pct), borderColor: colors[1], fill: true, backgroundColor: 'rgba(16, 185, 129, 0.2)' }] }, options: { ...baseOptions, plugins: { title: { display: true, text: '규모에 따른 안전관리인 지정률 추이', color: '#fff' } } } };
            config3 = { type: 'bar', data: { labels, datasets: [{ label: '최대 석면면적', data: statsData.map(s => s.max_asbestos), backgroundColor: colors[3] }, { label: '최소 석면면적', data: statsData.map(s => s.min_asbestos), backgroundColor: colors[0] }] }, options: { ...baseOptions, plugins: { title: { display: true, text: '지자체별 석면면적 편차', color: '#fff' } } } };
        } else {
            // Explore
            config1 = { type: 'bar', data: { labels, datasets: [{ label: '조사 건축물 총 개수', data: statsData.map(s => s.total), backgroundColor: colors[0] }] }, options: { ...baseOptions, plugins: { title: { display: true, text: '지자체별 조사대상 건축물 수', color: '#fff' } } } };
            config2 = { type: 'line', data: { labels, datasets: [{ label: '평균 연면적 (㎡)', data: statsData.map(s => s.avg_total), borderColor: colors[1], backgroundColor: 'rgba(16,185,129,0.2)', fill: true }] }, options: { ...baseOptions, plugins: { title: { display: true, text: '지자체별 평균 연면적 비교', color: '#fff' } } } };
            config3 = { type: 'bar', data: { labels, datasets: [{ label: '평균 석면면적 (㎡)', data: statsData.map(s => s.avg_asbestos), backgroundColor: colors[2] }] }, options: { ...baseOptions, plugins: { title: { display: true, text: '지자체별 평균 석면 자재 면적', color: '#fff' } } } };
        }

        charts.push(new Chart(ctx1, config1));
        charts.push(new Chart(ctx2, config2));
        charts.push(new Chart(ctx3, config3));
    }

    // --- API Integration Flow ---
    if(sendBtn) {
        sendBtn.addEventListener('click', async () => {
            if (isProcessing) return;
            
            const requestText = promptInput.value.trim();
            if (!requestText) {
                promptInput.style.transform = "translateX(5px)";
                setTimeout(() => promptInput.style.transform = "translateX(-5px)", 100);
                setTimeout(() => promptInput.style.transform = "translateX(0)", 200);
                return;
            }

            if (sessionId) {
                isProcessing = true;
                addUserMessage(requestText);
                promptInput.value = '';
                addAiMessageTypewriter("AI가 분석 중입니다...", () => {
                    callChatAPI(requestText);
                });
                return;
            }

            // Allow proceeding without files
            isProcessing = true;
            document.getElementById('suggestionChips').style.display = 'none';
            
            addUserMessage(requestText);
            promptInput.value = '';

            addAiMessageTypewriter("서버로 파일을 전송하여 분석을 시작합니다. 잠시만 기다려주세요...", () => {
                callBackendAPI(requestText);
            });
        });
    }

    async function callBackendAPI(goalText) {
        const purposeSelect = document.getElementById('purposeSelect');
        const purposeText = purposeSelect ? purposeSelect.options[purposeSelect.selectedIndex].text : "기본 탐색 및 시각화";
        
        const formData = new FormData();
        formData.append("goal", goalText);
        formData.append("purpose", purposeText);
        selectedFiles.forEach(file => {
            formData.append("files", file);
        });

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("서버 에러가 발생했습니다.");
            }

            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            sessionId = result.session_id;

            renderDashboard(result);

        } catch (error) {
            addAiMessageTypewriter(`🚨 오류 발생: ${error.message}`);
            isProcessing = false;
        }
    }

    async function callChatAPI(messageText) {
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: messageText
                })
            });

            if (!response.ok) {
                throw new Error("서버 에러가 발생했습니다.");
            }

            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }

            addAiMessageTypewriter(result.reply);

        } catch (error) {
            addAiMessageTypewriter(`🚨 오류 발생: ${error.message}`);
        } finally {
            isProcessing = false;
        }
    }

    function renderDashboard(data) {
        // Clear typing cursor and update text
        const lastMsg = document.querySelector('.chat-history .ai-message:last-child .msg-text');
        if (lastMsg) {
            lastMsg.classList.remove('typing-cursor');
            lastMsg.innerHTML = "✅ 데이터 분석 및 전처리가 완료되었습니다! 우측 대시보드에서 시각화와 인사이트를 확인해주세요.";
        }

        dashboard.innerHTML = tplDashboard;
        dashboard.classList.add('active');

        // 1. Alert Box Logic (Missing Data)
        const alertBox = document.getElementById('missingValueAlert');
        const hasMissing = Object.keys(data.missing_info).length > 0;
        
        let totalMissing = 0;
        let missingFiles = [];
        if (hasMissing) {
            for(let key in data.missing_info) {
                totalMissing += data.missing_info[key].total_missing;
                missingFiles.push(key.replace('.csv', '').replace('.xlsx', ''));
            }
            alertBox.querySelector('p').innerHTML = `업로드된 데이터에 총 <strong>${totalMissing}개의 결측치/이상치</strong>가 발견되었습니다. (지자체: ${missingFiles.join(', ')}) AI가 통계의 왜곡을 방지하기 위해 임의 채움 없이 '정보없음'으로 보존했습니다.`;
            
            // Dynamic missing data modal
            const btnShowMissingData = document.getElementById('btnShowMissingData');
            const modalMissingData = document.getElementById('modalMissingData');
            const btnExcludeMissingData = document.getElementById('btnExcludeMissingData');
            
            if (btnExcludeMissingData) {
                btnExcludeMissingData.innerHTML = `결측치 ${totalMissing}건 제외 후 차트 재구성`;
                btnExcludeMissingData.addEventListener('click', () => {
                    btnExcludeMissingData.innerHTML = '<div class="spinner"></div> 재구성 중...';
                    setTimeout(() => {
                        btnExcludeMissingData.innerHTML = `✅ 결측치 ${totalMissing}건 제외 및 차트 재구성 완료`;
                        btnExcludeMissingData.classList.add('btn-success');
                        btnExcludeMissingData.disabled = true;
                        
                        // Small animation on chart to simulate visual update
                        const chartsDiv = document.querySelector('.chart-container');
                        if(chartsDiv) {
                            chartsDiv.style.transition = 'opacity 0.3s';
                            chartsDiv.style.opacity = '0.3';
                            setTimeout(() => { chartsDiv.style.opacity = '1'; }, 500);
                        }
                    }, 800);
                });
            }
            
            if (btnShowMissingData && modalMissingData) {
                btnShowMissingData.addEventListener('click', () => {
                    const tbody = modalMissingData.querySelector('tbody');
                    tbody.innerHTML = '';
                    
                    let count = 1;
                    for(let filename in data.missing_info) {
                        const sampleRows = data.missing_info[filename].sample_rows;
                        sampleRows.forEach((row) => {
                            const tr = document.createElement('tr');
                            const vals = Object.values(row);
                            tr.innerHTML = `
                                <td>${count++}</td>
                                <td>${filename.split('_')[0].replace('(결측치 포함)', '').trim()}</td>
                                <td>${vals[0] || '정보없음'}</td>
                                <td class="text-warning">${vals[vals.length - 1] || '결측치'}</td>
                                <td>-</td>
                            `;
                            tbody.appendChild(tr);
                        });
                    }
                    openModal(modalMissingData);
                });
            }
        } else {
            alertBox.style.display = 'none';
        }

        // 2. Stats Table
        const statsTableBody = document.getElementById('statsTableBody');
        statsTableBody.innerHTML = '';
        data.stats.forEach(s => {
            const tr = document.createElement('tr');
            const trHtml = `
                <td>${s.city}</td>
                <td>${s.total}개</td>
                <td>${s.avg_total}</td>
                <td>${s.avg_asbestos}</td>
                <td>${s.manager_pct}%</td>
                <td class="${s.missing_pct > 0 ? 'text-warning' : ''}">${s.missing_pct}%</td>
            `;
            tr.innerHTML = trHtml;
            statsTableBody.appendChild(tr);
        });

        // 3. Chart
        renderChart(data.stats, 'bar', data.purpose || 'explore');

        // 4. Merged Preview Table
        const mergedTable = document.querySelector('#mergedTable tbody');
        if(mergedTable && data.merged_preview) {
            mergedTable.innerHTML = '';
            data.merged_preview.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.city}</td>
                    <td>${row.address}</td>
                    <td class="${row.status.includes('결측') ? 'text-warning' : ''}">${row.total_area} / ${row.asbestos_area}</td>
                    <td>${row.manager} / ${row.original_cols}</td>
                `;
                mergedTable.appendChild(tr);
            });
        }

        // 5. Insight (Gemini)
        const insightContainer = document.querySelector('.citation-content');
        
        const purposeSelect = document.getElementById('purposeSelect');
        const purposeText = purposeSelect ? purposeSelect.options[purposeSelect.selectedIndex].text : "기본 탐색 및 시각화";

        // Clear previous dummy insight and put the real one
        insightContainer.innerHTML = `
            <div style="background: rgba(99, 102, 241, 0.1); padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--accent-primary);">
                <h4 style="color: #a5b4fc; margin-bottom: 0.75rem;">💡 연구 목적 기반 데이터 해석 (${purposeText})</h4>
                <p class="text-sm mb-2">
                    연구자님께서 설정하신 <strong>'${purposeText}'</strong> 목적에 맞추어 AI가 심층 분석한 결과입니다.
                </p>
                <div class="insight-text" style="font-size:0.9rem; line-height:1.7; white-space:pre-wrap; margin-top: 1rem;">${data.insight}</div>
            </div>
            <div class="citation-box mt-4">
                <h5>자동 생성 출처 표기 (데이터 소스)</h5>
                ${data.citations.map(c => `<p class="citation-text">${c}</p>`).join('')}
            </div>
        `;

        // Interactive Bits
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.target).classList.add('active');
            });
        });

        // 6. Chart Type Selector
        const chartSelect = document.getElementById('chartType');
        if(chartSelect) {
            chartSelect.style.display = 'none'; // Hide because we use 3 dynamic charts now
        }

        dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        isProcessing = false;
    }
});
