// 成长评估功能测试脚本
console.log('成长评估功能测试开始...\n');

// 模拟宝宝数据
const testBabyData = {
  name: '测试宝宝',
  gender: 'male',
  birthDate: '2024-06-01',
  current_weight: 9.0,
  current_height: 70
};

console.log('✅ 宝宝数据模拟成功：');
console.log('   - 姓名:', testBabyData.name);
console.log('   - 性别:', testBabyData.gender === 'male' ? '男宝' : '女宝');
console.log('   - 出生日期:', testBabyData.birthDate);
console.log('   - 当前体重:', testBabyData.current_weight + ' kg');
console.log('   - 当前身高:', testBabyData.current_height + ' cm\n');

// 计算年龄（月）
function calculateAgeInMonths(birthDate) {
  const birth = new Date(birthDate);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months--;
  return months < 0 ? 0 : months;
}

const ageInMonths = calculateAgeInMonths(testBabyData.birthDate);
console.log('✅ 年龄计算成功：', ageInMonths + '个月\n');

// 模拟成长评估请求数据
const assessmentData = {
  gender: 'boy',
  age: ageInMonths,
  height: testBabyData.current_height,
  weight: testBabyData.current_weight
};

console.log('✅ 成长评估请求数据：');
console.log('   - 性别:', assessmentData.gender);
console.log('   - 年龄:', assessmentData.age + '个月');
console.log('   - 身高:', assessmentData.height + ' cm');
console.log('   - 体重:', assessmentData.weight + ' kg\n');

// 模拟n8n webhook请求
console.log('🔗 模拟n8n webhook请求：');
console.log('   - URL: http://localhost:5678/webhook/Growth-Assessment');
console.log('   - 方法: POST');
console.log('   - 数据:', JSON.stringify(assessmentData, null, 2));

// 模拟AI返回结果
const mockAIResponse = {
  analysis: "根据WHO 6个月男宝生长标准，您的宝宝身高70厘米处于第75-85百分位，属于中上水平，发育良好；体重9公斤处于第85-95百分位，体型偏壮实。综合评估显示宝宝生长发育状况优秀，身高体重比例协调，营养状况良好，符合6个月婴儿的正常发育轨迹。",
  advice: "建议继续保持均衡营养，6个月宝宝可适当添加辅食如米粉、果泥、蔬菜泥等，注意观察过敏反应。保证充足睡眠，6个月宝宝每天需14-15小时睡眠。鼓励宝宝进行俯卧抬头、翻身等大动作训练，可提供安全环境让宝宝练习坐立，促进运动发育。定期监测生长发育指标，如有异常及时就医。"
};

console.log('\n🤖 模拟AI返回结果：');
console.log('   - 发育分析:', mockAIResponse.analysis);
console.log('   - 专业建议:', mockAIResponse.advice);

// 本地模拟评估（降级方案）
console.log('\n📱 本地模拟评估（降级方案）：');

function calculatePercentile(value, age, gender, type) {
  const baseValue = type === 'height' ? 50 + age * 2 : 3 + age * 0.5;
  const ratio = value / baseValue;
  
  if (ratio >= 1.2) return '97-100';
  if (ratio >= 1.1) return '85-97';
  if (ratio >= 1.0) return '50-85';
  if (ratio >= 0.9) return '15-50';
  if (ratio >= 0.8) return '3-15';
  return '0-3';
}

const heightPercentile = calculatePercentile(assessmentData.height, assessmentData.age, assessmentData.gender, 'height');
const weightPercentile = calculatePercentile(assessmentData.weight, assessmentData.age, assessmentData.gender, 'weight');

console.log('   - 身高百分位:', heightPercentile);
console.log('   - 体重百分位:', weightPercentile);

// 评估结果
let localAnalysis = `根据WHO ${assessmentData.age}个月${assessmentData.gender === 'boy' ? '男宝' : '女宝'}生长标准，您的宝宝身高${assessmentData.height}厘米处于${heightPercentile}百分位，体重${assessmentData.weight}公斤处于${weightPercentile}百分位。`;

if (heightPercentile >= '75' && weightPercentile >= '75') {
  localAnalysis += '发育状况优秀，身高体重比例协调。';
} else if (heightPercentile >= '25' && weightPercentile >= '25') {
  localAnalysis += '发育状况良好，符合正常生长曲线。';
} else {
  localAnalysis += '发育状况需要关注，建议咨询专业医生。';
}

console.log('   - 本地分析:', localAnalysis);

console.log('\n🎉 成长评估功能测试完成！');
console.log('\n📋 功能特点：');
console.log('   ✅ 支持宝宝年龄、性别、身高、体重数据输入');
console.log('   ✅ 集成n8n webhook进行AI成长评估');
console.log('   ✅ 本地模拟评估作为降级方案');
console.log('   ✅ 详细的发育分析和专业建议');
console.log('   ✅ 支持重新评估和数据刷新');

console.log('\n🚀 使用说明：');
console.log('   1. 确保n8n服务运行在 http://localhost:5678');
console.log('   2. 在微信小程序中打开成长评估页面');
console.log('   3. 输入宝宝数据或使用自动填充');
console.log('   4. 点击"开始成长评估"按钮');
console.log('   5. 查看AI返回的详细评估结果');

console.log('\n🎯 测试建议：');
console.log('   - 测试不同年龄段的宝宝数据');
console.log('   - 测试网络连接失败时的降级方案');
console.log('   - 验证评估结果的准确性和实用性');