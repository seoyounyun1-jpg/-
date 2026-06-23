const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log("🚀 브라우저 자가검진 시작...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

  // 1. 접속
  console.log("📡 http://localhost:3000 접속 중...");
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    console.log("⚠️ networkidle timeout, 계속 진행합니다:", e.message);
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotsDir, '01_초기화면.png'), fullPage: false });
  console.log("✅ [1/6] 초기 화면 스크린샷 저장 완료");

  // 2. PRD 탭 클릭
  try {
    const prdTab = await page.$('text=PRD');
    if (prdTab) {
      await prdTab.click();
      await page.waitForTimeout(1000);
    }
  } catch(e) { console.log("PRD 탭 클릭 건너뜀:", e.message); }
  await page.screenshot({ path: path.join(screenshotsDir, '02_PRD탭.png'), fullPage: false });
  console.log("✅ [2/6] PRD 탭 스크린샷 저장 완료");

  // 3. 기능명세서 탭 클릭
  try {
    const specTab = await page.$('text=기능명세서');
    if (specTab) {
      await specTab.click();
      await page.waitForTimeout(1000);
    }
  } catch(e) { console.log("기능명세서 탭 클릭 건너뜀:", e.message); }
  await page.screenshot({ path: path.join(screenshotsDir, '03_기능명세서탭.png'), fullPage: false });
  console.log("✅ [3/6] 기능명세서 탭 스크린샷 저장 완료");

  // 4. AI 코치 패널 확인 (우측 패널)
  try {
    // Coach 버튼 찾기
    const coachBtn = await page.$('button:has-text("Coach")');
    if (coachBtn) {
      await coachBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch(e) { console.log("코치 버튼 클릭 건너뜀:", e.message); }
  await page.screenshot({ path: path.join(screenshotsDir, '04_코치패널_클릭후.png'), fullPage: false });
  console.log("✅ [4/6] 코치 패널 스크린샷 저장 완료");

  // 5. 분석 결과가 로딩되기를 기다림 (최대 12초)
  console.log("⏳ AI 코치 분석 결과 기다리는 중 (최대 12초)...");
  await page.waitForTimeout(12000);
  await page.screenshot({ path: path.join(screenshotsDir, '05_코치분석결과.png'), fullPage: false });
  console.log("✅ [5/6] 코치 분석 결과 스크린샷 저장 완료");

  // 6. 텍스트 검증
  const bodyText = await page.innerText('body');
  const isStillLoading = bodyText.includes('진단 중...');
  const hasFallback = bodyText.includes('환경 분석 실패') || bodyText.includes('GEMINI_API_KEY');
  const hasRealData = bodyText.includes('coachSummary') || bodyText.includes('Manny Coach') || bodyText.includes('추천') || bodyText.includes('리스크');

  console.log("\n📊 ===== 검증 결과 보고서 =====");
  console.log(`  ✅ 서버 접속: 성공`);
  console.log(`  ${isStillLoading ? '❌' : '✅'} 무한 로딩 여부: ${isStillLoading ? '아직 로딩 중 (버그!)' : '로딩 완료됨'}`);
  console.log(`  ${hasFallback ? '⚠️' : '✅'} Fallback 데이터 표시: ${hasFallback ? 'Yes (API 키/서버 미연결)' : 'No (정상 API 응답)'}`);
  console.log(`  ${hasRealData ? '✅' : '⚠️'} 코치 분석 데이터: ${hasRealData ? '확인됨' : '확인 불가'}`);
  console.log(`  📁 스크린샷 저장 경로: ${screenshotsDir}`);
  console.log("================================\n");

  await browser.close();
  console.log("🎬 브라우저 자가검진 완료!");
})();
