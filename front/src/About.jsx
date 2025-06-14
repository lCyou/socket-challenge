import React from 'react';
import Chat from './components/Chat';
// import './components/Chat.css';

const About = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>マルチルーム WebSocketデモアプリについて</h1>
        <p>
          このアプリは、ReactとExpressを使用して複数のチャットルームでのWebSocketによるリアルタイム通信を実装したデモです。
        </p>
        
        <h2>主な機能</h2>
        <ul>
          <li>複数のチャットルーム対応</li>
          <li>ルーム間でのリアルタイムメッセージ送受信</li>
          <li>ルーム別の接続ユーザー数表示</li>
          <li>ルーム内でのタイピングインジケーター</li>
          <li>ルーム切り替え機能</li>
          <li>ルーム別のメッセージ履歴保持</li>
        </ul>

        <h2>利用可能なルーム</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: '#f0f8ff' }}>
            <h4>🌟 一般</h4>
            <p>誰でも参加できる一般的な話題</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: '#f0fff0' }}>
            <h4>⚡ 技術</h4>
            <p>プログラミングや技術の話題</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: '#fff8f0' }}>
            <h4>💬 雑談</h4>
            <p>自由な雑談スペース</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: '#f8f0ff' }}>
            <h4>🎮 ゲーム</h4>
            <p>ゲームに関する話題</p>
          </div>
        </div>

        <h2>技術スタック</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', margin: '1rem 0' }}>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>フロントエンド</h3>
            <ul>
              <li>React 18</li>
              <li>Socket.IO Client</li>
              <li>React Router</li>
              <li>CSS3</li>
            </ul>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>バックエンド</h3>
            <ul>
              <li>Node.js</li>
              <li>Express.js</li>
              <li>Socket.IO Server</li>
              <li>CORS</li>
            </ul>
          </div>
        </div>

        <div style={{ padding: '1rem', background: '#f0f8ff', borderRadius: '8px', margin: '1rem 0' }}>
          <h3>🚀 使い方</h3>
          <ol>
            <li>ユーザー名を入力してチャットに参加</li>
            <li>参加したいルームを選択</li>
            <li>ルーム内でメッセージを入力して送信</li>
            <li>他のユーザーとリアルタイムでやり取き</li>
            <li>「ルーム変更」ボタンで他のルームに移動可能</li>
            <li>複数のブラウザタブやデバイスでテスト可能</li>
          </ol>
        </div>
      </div>

      <Chat />
    </div>
  );
};

export default About;