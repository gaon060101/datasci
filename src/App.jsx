import React, { useState } from 'react';
import { 
  Database, Upload, Send, FileSpreadsheet, 
  BarChart3, AlertTriangle, Link as LinkIcon, 
  Settings, User, CheckCircle2, Search, Plus, Download, Table, X, Code
} from 'lucide-react';
import './index.css';

function App() {
  const [step, setStep] = useState(0); // 0: Init, 1: Uploaded, 2: Results
  const [activeProject, setActiveProject] = useState('new'); // 'new' or 'aging'
  const [inputText, setInputText] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);

  const handleRecentProjectClick = () => {
    setActiveProject('aging');
    setStep(2); 
    setInputText('');
  };

  const handleNewProjectClick = () => {
    setActiveProject('new');
    setStep(0);
    setInputText('');
  };

  const handleSendClick = () => {
    if (activeProject === 'new') {
      if (step === 0) setStep(1);
      else if (step === 1) setStep(2);
    }
    setInputText('');
  };

  const handleFileUpload = () => {
    if (activeProject === 'new' && step === 0) setStep(1);
  };

  return (
    <div className="flex min-h-screen relative">
      {/* Sidebar */}
      <aside className="w-[280px] bg-slate-800 border-r border-white/10 p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <Database size={28} className="text-blue-500" />
          <span className="text-xl font-bold tracking-tight">DataGov AI</span>
        </div>
        
        <div className="flex flex-col gap-4">
          <button 
            className="flex items-center justify-start p-2.5 rounded-lg transition-colors" 
            style={{ background: activeProject === 'new' ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: activeProject === 'new' ? 'white' : '#94a3b8' }}
            onClick={handleNewProjectClick}
          >
            <Plus size={18} className="mr-2" /> 새 연구 프로젝트
          </button>
          
          <div className="mt-8">
            <h3 className="text-xs text-slate-400 mb-4 uppercase tracking-wider">최근 연구 (진행 중)</h3>
            <div className="flex flex-col gap-2">
              <div 
                className={`text-sm cursor-pointer py-2.5 px-3 rounded-lg transition-colors ${activeProject === 'aging' ? 'bg-slate-700 text-white border border-slate-600' : 'text-slate-400 hover:text-white'}`}
                onClick={handleRecentProjectClick}
              >
                📊 인구 노령화와 지역 경제 상관관계
              </div>
              <div className="text-sm text-slate-400 hover:text-white cursor-pointer py-2 px-3">수도권 교통량 변화 추이 (2020-2023)</div>
              <div className="text-sm text-slate-400 hover:text-white cursor-pointer py-2 px-3">환경 데이터 기반 미세먼지 예측</div>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-3 text-sm text-slate-400 cursor-pointer hover:text-white">
          <Settings size={18} />
          <span>연구자 설정</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 flex flex-col gap-8 main-bg relative max-w-full overflow-hidden">
        <header className="flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-bold mb-2">{activeProject === 'aging' ? '인구 노령화와 지역 경제 상관관계' : '공공데이터 분석 어시스턴트'}</h1>
            <p className="text-slate-400">{activeProject === 'aging' ? '진행 중인 연구 프로젝트입니다.' : '연구 목적에 맞춘 데이터 전처리, 통합 및 시각화'}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <Search size={18} />
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0">
              <User size={20} />
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-4 pr-2" style={{ maxHeight: 'calc(100vh - 240px)' }}>
          {/* AI Welcome Message */}
          <div className="flex gap-4 max-w-[85%] self-start">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <Database size={20} color="white" />
            </div>
            <div className="bg-slate-800 py-4 px-5 rounded-2xl border border-white/10 text-[15px] leading-relaxed text-slate-200 shadow-sm">
              안녕하세요, 연구자님. 공공데이터 전문 분석 AI입니다.<br/><br/>
              분석하실 <strong>데이터(CSV)</strong>를 업로드해 주시고, <strong>연구 목적과 요구사항</strong>(예: 두 기관 데이터 통합, 시각화, 특정 정보 추출 등)을 말씀해 주세요.
            </div>
          </div>

          {/* New Project Flow */}
          {activeProject === 'new' && (
            <>
              {step >= 1 && (
                <div className="flex gap-4 max-w-[85%] self-end flex-row-reverse">
                  <div className="w-10 h-10 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center shrink-0">
                    <User size={20} />
                  </div>
                  <div className="bg-blue-600 py-4 px-5 rounded-2xl border border-blue-500 text-[15px] leading-relaxed text-white shadow-sm">
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg w-max max-w-full overflow-hidden">
                        <FileSpreadsheet size={18} className="text-blue-200 shrink-0" />
                        <span className="text-sm truncate">2023_서울시_기상데이터.csv</span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg w-max max-w-full overflow-hidden">
                        <FileSpreadsheet size={18} className="text-blue-200 shrink-0" />
                        <span className="text-sm truncate">보건복지부_호흡기질환_통계.csv</span>
                      </div>
                    </div>
                    이 두 기관의 데이터를 통합해서 기상 변화(특히 미세먼지)와 호흡기 질환 환자 수의 상관관계를 분석해줘.
                    연구 목적에 맞게 필요한 데이터만 추출해서 시각화해주고, 데이터 신뢰도에 대한 주의사항도 알려줘.
                  </div>
                </div>
              )}

              {step >= 2 && (
                <div className="flex gap-4 w-full self-start">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Database size={20} color="white" />
                  </div>
                  <div className="flex-1 w-full bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm">
                    <p className="mb-5 font-medium text-slate-100 text-[15px]">요청하신 두 기관의 데이터를 성공적으로 통합 및 분석했습니다. 다음은 연구 목적에 맞춘 분석 결과입니다.</p>
                    
                    {/* Alerts */}
                    <div className="flex flex-col gap-3 mb-8">
                      <div className="flex gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[15px] mb-1">데이터 통합 완료</strong>
                          <p className="text-xs text-emerald-400/80 leading-relaxed">날짜(Date) 및 지역(Region) 컬럼을 기준으로 두 데이터셋(기상청, 보건복지부)을 성공적으로 결합했습니다.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[15px] mb-1">데이터 신뢰도 주의사항</strong>
                          <p className="text-xs text-amber-400/80 leading-relaxed">보건복지부 통계 중 2023년 3월 2주차 데이터 일부가 결측치 처리되어 있습니다. 연구 논문 작성 시 이 부분을 명시하시길 권장합니다.</p>
                        </div>
                      </div>
                    </div>

                    {/* Results Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* Visualization Mockup */}
                      <div className="glass-card-effect rounded-2xl p-6 flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center gap-2 text-[15px] font-semibold text-blue-400">
                          <BarChart3 size={20} />
                          미세먼지 농도와 호흡기 질환 환자 수 추이
                        </div>
                        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 p-4 flex items-end justify-between min-h-[200px] relative overflow-hidden">
                          <svg viewBox="0 0 100 100" className="w-full h-full opacity-80" preserveAspectRatio="none">
                             <path d="M0,80 C20,70 40,90 60,40 C80,10 100,30 100,30" fill="none" stroke="#3b82f6" strokeWidth="2" />
                             <path d="M0,90 C30,85 50,60 70,30 C90,15 100,20 100,20" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4,2" />
                          </svg>
                          <div className="absolute bottom-3 left-4 text-[11px] text-slate-500">시간(월)</div>
                          <div className="absolute top-3 right-4 flex flex-col gap-1.5 bg-slate-900/80 p-2 rounded-lg border border-slate-700/50">
                            <div className="flex items-center gap-2 text-[11px] text-slate-300"><div className="w-2 h-2 bg-blue-500 rounded-full"></div>미세먼지(PM10)</div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-300"><div className="w-2 h-2 bg-purple-500 rounded-full"></div>환자 수</div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg">
                          <strong className="text-white block mb-1">💡 분석 요약:</strong> 미세먼지 농도 상승 약 3~5일 후 호흡기 질환 환자 수가 유의미하게 증가하는 패턴이 확인됩니다. 상관계수(r) = 0.78
                        </p>
                      </div>

                      {/* Detailed Extracted Data & Download */}
                      <div className="glass-card-effect rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center justify-between text-[15px] font-semibold text-blue-400">
                          <div className="flex items-center gap-2">
                            <Table size={20} />
                            연구 맞춤 추출 데이터
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-1">
                          <span className="inline-flex items-center px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[12px] text-slate-300">상관계수 &gt; 0.7 구간</span>
                          <span className="inline-flex items-center px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[12px] text-slate-300">서울시 한정</span>
                        </div>
                        
                        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 text-[13px] text-slate-300 flex-1 min-h-[140px]">
                          <table className="w-full text-left">
                            <thead className="bg-slate-800 text-slate-200">
                              <tr>
                                <th className="p-3 border-b border-slate-700 font-medium">날짜</th>
                                <th className="p-3 border-b border-slate-700 font-medium">지역</th>
                                <th className="p-3 border-b border-slate-700 font-medium">PM10</th>
                                <th className="p-3 border-b border-slate-700 font-medium">환자 수</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="hover:bg-slate-800/50">
                                <td className="p-3 border-b border-slate-800">23-03-01</td>
                                <td className="p-3 border-b border-slate-800">강남구</td>
                                <td className="p-3 border-b border-slate-800">72.4</td>
                                <td className="p-3 border-b border-slate-800 text-blue-300 font-medium">1,530</td>
                              </tr>
                              <tr className="hover:bg-slate-800/50">
                                <td className="p-3 border-b border-slate-800">23-03-02</td>
                                <td className="p-3 border-b border-slate-800">강남구</td>
                                <td className="p-3 border-b border-slate-800">85.1</td>
                                <td className="p-3 border-b border-slate-800 text-blue-300 font-medium">1,820</td>
                              </tr>
                              <tr className="hover:bg-slate-800/50">
                                <td className="p-3 border-b border-slate-800">23-03-03</td>
                                <td className="p-3 border-b border-slate-800">서초구</td>
                                <td className="p-3 border-b border-slate-800">81.0</td>
                                <td className="p-3 border-b border-slate-800 text-blue-300 font-medium">1,790</td>
                              </tr>
                              <tr>
                                <td className="p-3 text-slate-500 text-center text-xs" colSpan="4">... 필터링된 총 342개 데이터</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="flex gap-2 mt-1">
                          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20">
                            <Download size={18} />
                            가공된 전체 데이터 다운로드 (.csv)
                          </button>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <h4 className="text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider">데이터 출처 및 분석 로직 검증</h4>
                          <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2 text-[12px] text-slate-300 hover:text-white cursor-pointer group transition-colors" onClick={() => setShowLogModal(true)}>
                              <LinkIcon size={14} className="text-blue-400 group-hover:text-blue-300" /> 
                              <span>[공공데이터포털] 기상청_지상관측자료 (2023)</span>
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-slate-300 hover:text-white cursor-pointer group transition-colors" onClick={() => setShowLogModal(true)}>
                              <LinkIcon size={14} className="text-blue-400 group-hover:text-blue-300" /> 
                              <span>[보건의료빅데이터] 건강보험심사평가원 통계</span>
                            </div>
                            <div className="flex items-center gap-2 text-[12px] text-purple-300 hover:text-purple-200 cursor-pointer group transition-colors bg-purple-500/10 p-2 rounded-lg mt-1" onClick={() => setShowLogModal(true)}>
                              <Code size={14} /> 
                              <span className="font-medium">데이터 전처리 및 병합 스크립트 로그 보기</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Aging Project Flow (Ongoing Research Simulation) */}
          {activeProject === 'aging' && (
            <>
              <div className="flex gap-4 max-w-[85%] self-end flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center shrink-0"><User size={20} /></div>
                <div className="bg-blue-600 py-4 px-5 rounded-2xl border border-blue-500 text-[15px] leading-relaxed text-white shadow-sm">
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg w-max max-w-full overflow-hidden">
                      <FileSpreadsheet size={18} className="text-blue-200 shrink-0" />
                      <span className="text-sm truncate">2022_행안부_연령별인구현황.csv</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg w-max max-w-full overflow-hidden">
                      <FileSpreadsheet size={18} className="text-blue-200 shrink-0" />
                      <span className="text-sm truncate">2022_통계청_지역별상권매출액.csv</span>
                    </div>
                  </div>
                  이 데이터들로 지역별 65세 이상 인구 비율과 지역 상권 매출액의 상관관계를 분석해줘.
                </div>
              </div>
              
              <div className="flex gap-4 max-w-[85%] self-start">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0"><Database size={20} color="white" /></div>
                <div className="bg-slate-800 py-4 px-5 rounded-2xl border border-white/10 text-[15px] leading-relaxed text-slate-200 shadow-sm">
                  데이터 결합을 완료했습니다. 분석 결과, 65세 이상 인구 비율과 지역 상권 매출액 간에는 강한 음의 상관관계(r = -0.65)가 나타났습니다. 특히 의료 서비스 및 약국 관련 매출은 상승하였으나, 요식업 및 엔터테인먼트 매출은 감소하는 경향을 보였습니다.
                </div>
              </div>

              <div className="flex gap-4 max-w-[85%] self-end flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center shrink-0"><User size={20} /></div>
                <div className="bg-blue-600 py-4 px-5 rounded-2xl border border-blue-500 text-[15px] leading-relaxed text-white shadow-sm">
                  고령화 비율이 20%를 초과하는(초고령사회 진입) 지역들만 따로 추려서, 그 지역들의 주요 매출 감소 업종을 표로 정리해주고 분석 데이터를 다운로드 할 수 있게 해줘.
                </div>
              </div>

              <div className="flex gap-4 w-full self-start">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0"><Database size={20} color="white" /></div>
                <div className="flex-1 w-full bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm">
                  <p className="mb-5 font-medium text-slate-100 text-[15px]">조건(고령 인구 20% 초과 지역)을 적용하여 데이터를 재가공했습니다. 결과는 다음과 같습니다.</p>
                  
                  <div className="grid grid-cols-1">
                    <div className="glass-card-effect rounded-2xl p-6 flex flex-col gap-4">
                      <div className="flex items-center justify-between text-base font-semibold text-blue-400">
                        <div className="flex items-center gap-2">
                          <Table size={20} />
                          초고령사회 진입 지역 매출 감소 주요 업종 현황
                        </div>
                      </div>
                      
                      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 text-sm text-slate-300">
                        <table className="w-full text-left">
                          <thead className="bg-slate-800 text-slate-200">
                            <tr>
                              <th className="p-4 border-b border-slate-700 font-medium">지역명</th>
                              <th className="p-4 border-b border-slate-700 font-medium">고령 인구 비율</th>
                              <th className="p-4 border-b border-slate-700 font-medium">가장 크게 감소한 업종</th>
                              <th className="p-4 border-b border-slate-700 font-medium">전년 대비 매출 변화율</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="hover:bg-slate-800/50">
                              <td className="p-4 border-b border-slate-800">전남 고흥군</td>
                              <td className="p-4 border-b border-slate-800 font-bold text-red-400">43.2%</td>
                              <td className="p-4 border-b border-slate-800">문화/레저</td>
                              <td className="p-4 border-b border-slate-800 text-red-400 font-medium">-15.4%</td>
                            </tr>
                            <tr className="hover:bg-slate-800/50">
                              <td className="p-4 border-b border-slate-800">경북 의성군</td>
                              <td className="p-4 border-b border-slate-800 font-bold text-red-400">42.8%</td>
                              <td className="p-4 border-b border-slate-800">일반 요식업</td>
                              <td className="p-4 border-b border-slate-800 text-red-400 font-medium">-12.1%</td>
                            </tr>
                            <tr className="hover:bg-slate-800/50">
                              <td className="p-4 border-b border-slate-800">경북 군위군</td>
                              <td className="p-4 border-b border-slate-800 font-bold text-red-400">41.5%</td>
                              <td className="p-4 border-b border-slate-800">의류/잡화</td>
                              <td className="p-4 border-b border-slate-800 text-red-400 font-medium">-18.7%</td>
                            </tr>
                            <tr>
                              <td className="p-4 text-slate-500 italic text-center" colSpan="4">... 필터링된 지역 총 112곳 조회 완료</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="flex gap-4 mt-4">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5">
                          <Download size={18} />
                          필터링된 분석 데이터 전체 다운로드 (.csv)
                        </button>
                        <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-slate-600">
                          <BarChart3 size={18} />
                          이 데이터를 기반으로 차트 생성하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Input Form Area */}
        <div className="shrink-0 mt-auto">
          {step === 0 && activeProject === 'new' && (
            <div 
              className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 bg-black/20 hover:border-blue-500 hover:bg-blue-500/5 mb-6" 
              onClick={handleFileUpload}
            >
              <Upload size={36} className="mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2 text-white">분석할 공공데이터 업로드</h3>
              <p className="text-sm text-slate-400">CSV, Excel, JSON 형식을 드래그 앤 드롭 하거나 클릭하여 선택하세요</p>
            </div>
          )}

          <div className="bg-slate-800 border border-white/10 rounded-2xl p-4 flex gap-4 items-end shadow-lg focus-within:border-blue-500/50 transition-colors">
            <button className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors" onClick={handleFileUpload}>
              <Upload size={22} />
            </button>
            <textarea 
              className="flex-1 bg-transparent border-none text-white text-[15px] resize-none outline-none min-h-[48px] py-3 font-sans leading-relaxed placeholder:text-slate-500"
              placeholder={
                activeProject === 'new' 
                  ? (step === 0 ? "데이터를 먼저 업로드해 주세요..." : "연구 목적, 분석 방향, 필요한 시각화 형태 등을 자유롭게 입력하세요...")
                  : "추가적인 분석 요청이나 시각화 조건을 입력하세요..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendClick();
                }
              }}
            ></textarea>
            <button 
              className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-md shadow-blue-500/20" 
              onClick={handleSendClick}
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Modal for Logs & Sources */}
        {showLogModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-700/80 bg-slate-800/80">
                <div className="flex items-center gap-3 text-white font-semibold text-lg">
                  <Code size={22} className="text-purple-400" />
                  데이터 분석 및 가공 백그라운드 프로세스
                </div>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setShowLogModal(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1 flex flex-col gap-8 bg-[#0b1120]">
                <div>
                  <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                    <Database size={18} className="text-blue-400" /> 공공데이터 API 연결 및 데이터셋 가져오기
                  </h3>
                  <div className="bg-slate-800/50 rounded-xl p-5 text-sm text-slate-300 flex flex-col gap-4 border border-slate-700/50">
                    <div className="flex">
                      <span className="inline-block w-28 text-slate-500 font-medium">대상 기관 API</span> 
                      <span className="text-blue-400 font-mono">https://apis.data.go.kr/1360000/AsosDalyInfoService/</span>
                    </div>
                    <div className="flex">
                      <span className="inline-block w-28 text-slate-500 font-medium">조회 파라미터</span> 
                      <span className="font-mono text-emerald-400">startDt: 20230101, endDt: 20231231, stnIds: 108</span>
                    </div>
                    <div className="flex">
                      <span className="inline-block w-28 text-slate-500 font-medium">라이선스</span> 
                      <span className="bg-white/10 px-2 py-0.5 rounded text-white text-xs">공공누리 제1유형 (출처 표시)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                    <Code size={18} className="text-purple-400" /> Python 전처리 및 병합 스크립트 실행 로그
                  </h3>
                  <div className="bg-black/80 rounded-xl p-5 text-[13px] font-mono text-green-400/90 overflow-x-auto border border-slate-700/80 shadow-inner">
                    <pre className="leading-loose">
{`[SYSTEM] Initializing secure Python 3.11 environment for data processing...
[10:24:01] Loading dataset A: '2023_서울시_기상데이터.csv' (Rows: 365, Cols: 14)
[10:24:02] Loading dataset B: '보건복지부_호흡기질환_통계.csv' (Rows: 12,450, Cols: 8)
[10:24:04] Executing pandas preprocessing...
           > Standardizing date formats to ISO-8601
           > Validating schema integrity... DONE
[10:24:04] Extracting 'PM10', 'PM2.5' columns from dataset A...
[10:24:05] Grouping dataset B by Region='서울시' & aggregating 'Patient_Count' by Date...
[10:24:06] Performing pd.merge() using LEFT JOIN on 'Date' key...
[10:24:06] Warning: 14 rows in dataset B contain NaN values for 'Patient_Count'.
[10:24:07] Handling missing values using linear interpolation method.
[10:24:08] Calculating Pearson correlation coefficient:
           > PM10 vs Patient Count: r = 0.781 (p-value < 0.001)
[10:24:09] Generated final merged dataset (Rows: 365, Cols: 5)
[10:24:09] Exporting dataframe to secure blob storage... SUCCESS
[SYSTEM] Process completed in 8.42s.`}
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-t border-slate-700/80 bg-slate-800/80 flex justify-end">
                <button 
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-[15px] font-semibold transition-colors shadow-lg"
                  onClick={() => setShowLogModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
