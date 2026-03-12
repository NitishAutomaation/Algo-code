const path = require('path');
const fs = require('fs');
 
const baseReportsDir = 'reports';
 
// Read tag from npm
const TAG = process.env.npm_config_tag;
 
// Timestamped folder
const timestamp = `${new Date().getDate()}-${String(new Date().getMonth() + 1).padStart(2,'0')}-${String(new Date().getFullYear()).slice(-2)}_${String(new Date().getHours()).padStart(2,'0')}-${String(new Date().getMinutes()).padStart(2,'0')}-${String(new Date().getSeconds()).padStart(2,'0')}`;
const testReportFolder = path.join(baseReportsDir, `TestReport_${timestamp}`);
 
if (!fs.existsSync(testReportFolder)) {
  fs.mkdirSync(testReportFolder, { recursive: true });
}
 
fs.writeFileSync(
  path.join(baseReportsDir, 'latest.json'),
  JSON.stringify({ testReportFolder }, null, 2)
);
 
const common = `
  --require-module ts-node/register
  --require config.ts
  --require common/*.ts
  --require stepdefinitions/*.ts
  ${TAG ? `--tags "${TAG}"` : ''}
  --format json:${testReportFolder}/report.json
  --format message:${testReportFolder}/report.ndjson
  --format html:${testReportFolder}/report.html
  --format summary
  --format progress-bar
  --format @cucumber/pretty-formatter
  --format allure-cucumberjs/reporter --format-options ${JSON.stringify({
    resultsDir: `${testReportFolder}/allure-results`,
    snippetInterface: 'async-await',
  })}
`;
 
module.exports = {
  default: common,
};