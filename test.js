const { chromium } = require('playwright');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log("Navigating to http://localhost:3000 ...");
  await page.goto('http://localhost:3000');
  
  // Wait for React to render
  await page.waitForTimeout(2000);
  console.log("Page loaded. Active Tab initially should be PRD.");

  // Check if AI Coach is open, if not open it
  try {
    console.log("Clicking AI Coach floating button...");
    await page.click('text=AI Coach', { timeout: 3000 });
  } catch (e) {
    console.log("AI Coach might already be open.");
  }

  await page.waitForTimeout(1000);

  console.log("Clicking '기능명세서' tab...");
  await page.click('text=기능명세서');
  
  // Wait for fetch/API to complete (should take max 10s due to timeout, or immediately if successful/error)
  console.log("Waiting for Coach Analysis to update...");
  await page.waitForTimeout(12000); 

  const pageText = await page.content();
  if (pageText.includes("진단 중...")) {
      console.log("❌ ERROR: Right panel is STILL loading (진단 중...) after 12 seconds!");
  } else {
      console.log("✅ SUCCESS: Loading finished. The panel is displaying the result or fallback.");
      if (pageText.includes("환경 분석 실패") || pageText.includes("대체 데이터")) {
          console.log("✅ RESULT: API failed and Fallback Mock Data is properly shown.");
      } else if (pageText.includes("Manny Coach")) {
          console.log("✅ RESULT: Real API response is shown.");
      }
  }

  await browser.close();
})();
