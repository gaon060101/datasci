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
    const modalExport = document.getElementById('modalExport');
    const modalSettings = document.getElementById('modalSettings');
    const modalMissingData = document.getElementById('modalMissingData');
    const btnExport = document.getElementById('btnExport');
    const btnSettings = document.getElementById('btnSettings');
    const closeBtns = document.querySelectorAll('.close-modal');

    // Chips
    const suggestionChips = document.querySelectorAll('.chip');

    let isProcessing = false;
    let mainChart = null;

    // --- Modal Logic ---
    function openModal(modal) {
        modal.classList.add('active');
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
    }

    btnExport.addEventListener('click', () => openModal(modalExport));
    btnSettings.addEventListener('click', () => openModal(modalSettings));

    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) closeModal(modal);
        });
    });

    document.getElementById('btnConfirmExport').addEventListener('click', (e) => {
        const btn = e.target;
        btn.innerHTML = '<div class="spinner"></div> 생성 중...';
        setTimeout(() => {
            btn.innerHTML = '다운로드 완료!';
            setTimeout(() => {
                closeModal(modalExport);
                btn.innerHTML = '다운로드 시작';
            }, 1000);
        }, 1500);
    });

    // --- Sidebar Logic ---
    btnNewProject.addEventListener('click', () => {
        chatHistory.innerHTML = `
            <div class="message ai-message">
                <div class="msg-icon"><div class="logo-small"></div></div>
                <div class="msg-content">
                    <div class="msg-text">새로운 연구 프로젝트를 시작합니다. 어떤 공공데이터를 분석하시겠어요?</div>
                </div>
            </div>`;
        dashboard.classList.remove('active');
        document.getElementById('suggestionChips').style.display = 'flex';
        promptInput.value = '';
        attachmentsDiv.style.display = 'none';
        attachmentsDiv.innerHTML = '';
        historyListItems.forEach(li => li.classList.remove('active'));
    });

    historyListItems.forEach(li => {
        li.addEventListener('click', () => {
            historyListItems.forEach(l => l.classList.remove('active'));
            li.classList.add('active');
            
            if(li.dataset.id === "1") {
                dashboard.classList.add('active');
            } else {
                dashboard.classList.remove('active');
                chatHistory.innerHTML = `
                    <div class="message ai-message">
                        <div class="msg-icon"><div class="logo-small"></div></div>
                        <div class="msg-content">
                            <div class="msg-text">이전 분석 기록을 불러왔습니다. 이어서 진행할 내용을 입력해주세요.</div>
                        </div>
                    </div>`;
            }
        });
    });

    // --- File Upload Logic ---
    btnUpload.addEventListener('click', () => fileUpload.click());

    fileUpload.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            attachmentsDiv.style.display = 'flex';
            Array.from(files).forEach(file => {
                const attachment = document.createElement('div');
                attachment.className = 'attachment';
                attachment.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    ${file.name}
                    <button class="remove-file" title="제거">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                `;
                attachmentsDiv.appendChild(attachment);

                attachment.querySelector('.remove-file').addEventListener('click', () => {
                    attachment.remove();
                    if(attachmentsDiv.children.length === 0) {
                        attachmentsDiv.style.display = 'none';
                    }
                });
            });
        }
    });

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
                setTimeout(typeWriter, 20); // Faster typing speed
            } else {
                el.classList.remove('typing-cursor');
                if (callback) callback();
            }
        }
        typeWriter();
    }

    // --- Chart Rendering ---
    function renderChart(excludeMissing = false, type = 'bar') {
        const canvas = document.getElementById('areaChart');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        
        if (mainChart) mainChart.destroy();

        const valYongin = 45.2;
        const valYangju = excludeMissing ? 35.0 : 32.8;

        mainChart = new Chart(ctx, {
            type: type,
            data: {
                labels: ['용인시 (평균 면적)', '양주시 (평균 면적)'],
                datasets: [{
                    label: '면적 (㎡)',
                    data: [valYongin, valYangju],
                    backgroundColor: ['rgba(99, 102, 241, 0.7)', 'rgba(16, 185, 129, 0.7)'],
                    borderColor: ['#6366f1', '#10b981'],
                    borderWidth: 2,
                    borderRadius: type === 'bar' ? 6 : 0,
                    tension: 0.3,
                    fill: type === 'line' ? true : false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 13 } }
                    }
                }
            }
        });
    }

    // --- Dashboard Tabs Logic ---
    function initDashboardInteractions() {
        // Tabs
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

        // Chart Type Switcher
        const chartSelect = document.getElementById('chartType');
        if(chartSelect) {
            chartSelect.addEventListener('change', (e) => {
                // Determine if missing is excluded based on alert box state
                const isExcluded = !document.querySelector('.missing-row');
                renderChart(isExcluded, e.target.value);
            });
        }

        // Missing Data Actions
        const btnShowMissingData = document.getElementById('btnShowMissingData');
        const btnExcludeMissingData = document.getElementById('btnExcludeMissingData');
        
        if(btnShowMissingData) {
            btnShowMissingData.addEventListener('click', () => {
                openModal(modalMissingData);
            });
        }

        if(btnExcludeMissingData) {
            btnExcludeMissingData.addEventListener('click', () => {
                const btn = btnExcludeMissingData;
                btn.innerHTML = '<div class="spinner"></div> 데이터 재계산 중...';
                
                setTimeout(() => {
                    // Get current chart type
                    const currentType = document.getElementById('chartType').value;
                    
                    // Update Chart
                    renderChart(true, currentType);
                    
                    // Update Detailed Stats Table
                    const statsTbody = document.getElementById('statsTableBody');
                    if (statsTbody) {
                        statsTbody.innerHTML = `
                            <tr><td>용인시</td><td>214개</td><td>45.2</td><td>120.5</td><td>12.0</td><td>0.0%</td></tr>
                            <tr style="background-color: rgba(16, 185, 129, 0.1);">
                                <td>양주시</td><td>153개 <span style="font-size:0.7rem;color:#10b981;">(5개제외)</span></td>
                                <td style="color:#10b981;font-weight:bold;">35.0 (왜곡 수정됨)</td><td>95.0</td><td>8.5</td><td>0.0% (수정완료)</td>
                            </tr>
                        `;
                    }
                    
                    // Update Merged Data Table (hide missing rows)
                    const missingRows = document.querySelectorAll('.missing-row');
                    missingRows.forEach(row => row.style.display = 'none');

                    // Change alert style to success
                    const alertBox = document.getElementById('missingValueAlert');
                    alertBox.className = 'glass-card alert mb-4'; // remove warning and animate classes
                    alertBox.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
                    alertBox.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                    alertBox.innerHTML = `
                        <div class="alert-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <div class="alert-content">
                            <h4 style="color: #10B981;">데이터 정제 및 신뢰도 확보 완료</h4>
                            <p>결측치 및 이상치가 포함된 5개 행을 제외하고 정상 데이터 367건(용인 214건, 양주 153건)만으로 통합 및 시각화를 성공적으로 재구성했습니다.</p>
                        </div>
                    `;
                }, 1200);
            });
        }
    }


    // --- Main Flow Simulation ---
    sendBtn.addEventListener('click', () => {
        if (isProcessing) return;
        
        const requestText = promptInput.value.trim();
        if (!requestText) {
            promptInput.style.transform = "translateX(5px)";
            setTimeout(() => promptInput.style.transform = "translateX(-5px)", 100);
            setTimeout(() => promptInput.style.transform = "translateX(0)", 200);
            return;
        }

        isProcessing = true;
        document.getElementById('suggestionChips').style.display = 'none';
        
        addUserMessage(requestText);
        promptInput.value = '';

        if(attachmentsDiv.children.length === 0) {
             addAiMessageTypewriter("분석을 위해 '용인시_공중화장실.csv'와 '양주시_공중화장실.csv' 샘플 데이터를 로드합니다...", startDashboardProcess);
        } else {
             startDashboardProcess();
        }
        
    });

    function startDashboardProcess() {
        setTimeout(() => {
            addAiMessageTypewriter("두 지자체의 데이터 양식이 다릅니다 (예: '소재지도로명주소' vs '소재지도로명'). AI가 의미를 파악하여 '주소'와 '면적'으로 정규화 병합을 진행합니다. 병합 중 결측치/이상치가 감지되어 리포트를 생성합니다.", () => {
                setTimeout(() => {
                    dashboard.innerHTML = tplDashboard;
                    dashboard.classList.add('active');
                    
                    initDashboardInteractions();
                    renderChart(false, 'bar');
    
                    dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    isProcessing = false;
                }, 600);
            });
        }, 1000);
    }
});
