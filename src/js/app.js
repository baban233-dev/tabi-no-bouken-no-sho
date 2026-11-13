/**
 * 旅の冒険の書 — アプリ主処理
 * フェーズ1: タブ切り替え + モーダル開閉
 *
 * 注意: window.onload を使わない（過去の事故教訓）
 */

(function () {
  'use strict';

  // ----------------------------------------
  // タブ切り替え
  // ----------------------------------------
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function switchTab(tabName) {
    // ボタンのactive切り替え
    tabButtons.forEach(function (btn) {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // パネルの表示切り替え
    tabPanels.forEach(function (panel) {
      if (panel.id === 'tab-' + tabName) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchTab(btn.dataset.tab);
    });
  });

  // ----------------------------------------
  // 記録ボタン（教会）
  // ----------------------------------------
  const btnRecord = document.getElementById('btn-record');
  const modalRecord = document.getElementById('modal-record');
  const btnCloseRecord = document.getElementById('btn-close-record');

  if (btnRecord && modalRecord) {
    btnRecord.addEventListener('click', function () {
      modalRecord.classList.remove('hidden');
    });
  }

  if (btnCloseRecord && modalRecord) {
    btnCloseRecord.addEventListener('click', function () {
      modalRecord.classList.add('hidden');
    });
  }

  // バックドロップクリックで閉じる
  if (modalRecord) {
    modalRecord.addEventListener('click', function (e) {
      if (e.target === modalRecord) {
        modalRecord.classList.add('hidden');
      }
    });
  }

  // ----------------------------------------
  // 初期表示（ダミーデータ）
  // ----------------------------------------
  // 後でスプレッドシートから読み込む形に変更する
  function updateStatus(data) {
    data = data || {};
    const lv = document.getElementById('status-lv');
    const towns = document.getElementById('status-towns');
    const items = document.getElementById('status-items');
    const treasures = document.getElementById('status-treasures');
    const conquest = document.getElementById('conquest-count');
    const expBar = document.getElementById('exp-bar');

    if (lv) lv.textContent = data.lv || 1;
    if (towns) towns.textContent = data.towns || 0;
    if (items) items.textContent = data.items || 0;
    if (treasures) treasures.textContent = data.treasures || 0;
    if (conquest) conquest.textContent = data.towns || 0;
    if (expBar) expBar.style.width = (data.expPercent || 15) + '%';
  }

  // スライムメッセージを更新
  function setSlimeMessage(html) {
    const el = document.getElementById('slime-message');
    if (el) el.innerHTML = html;
  }

  // 初期化（DOMContentLoaded を使う。window.onloadは使わない）
  document.addEventListener('DOMContentLoaded', function () {
    updateStatus({
      lv: 1,
      towns: 0,
      items: 0,
      treasures: 0,
      expPercent: 15
    });

    // 記録ゼロ時のメッセージ（すでにHTMLに書いてあるが、後で動的に変更する用）
    // setSlimeMessage('...');
  });

  // 全局に公開（後で他モジュールから呼ぶ用）
  window.BoukenApp = {
    switchTab: switchTab,
    updateStatus: updateStatus,
    setSlimeMessage: setSlimeMessage
  };

})();
