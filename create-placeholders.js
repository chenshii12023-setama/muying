// 创建占位符图片文件
const fs = require('fs');

const imageFiles = [
  // avatars
  'images/avatars/user1.jpg',
  'images/avatars/user2.jpg', 
  'images/avatars/user3.jpg',
  'images/avatars/user4.jpg',
  
  // products
  'images/products/car-seat-1.jpg',
  'images/products/stroller-1.jpg',
  'images/products/crib-1.jpg',
  'images/products/toys-1.jpg',
  'images/products/walker-1.jpg',
  'images/products/clothes-1.jpg',
  
  // knowledge
  'images/knowledge/baby-food.jpg',
  'images/knowledge/fever.jpg',
  'images/knowledge/sleep.jpg'
];

const placeholderContent = '#placeholder-image';

imageFiles.forEach(file => {
  try {
    fs.writeFileSync(file, placeholderContent);
    console.log('✅ Created:', file);
  } catch (error) {
    console.log('❌ Failed:', file, error.message);
  }
});

console.log('🎉 占位符文件创建完成！');