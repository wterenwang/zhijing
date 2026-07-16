// 预留：桌面端与页面的安全桥接（当前无需暴露 Node API）
window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.dataset.zhijingDesktop = '1';
});
