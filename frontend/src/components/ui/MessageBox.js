import React from 'react';

const MessageBox = ({ message, type = 'info', show }) => (
  <div className={`message-box ${type} ${show ? 'show' : ''}`}>{message}</div>
);

export default MessageBox;
