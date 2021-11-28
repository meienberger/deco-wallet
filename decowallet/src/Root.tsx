import React from 'react';
import { RecoilRoot } from 'recoil';
import App from './App';

const Root: React.FC = () => {
  return (
    <RecoilRoot>
      <App />
    </RecoilRoot>
  );
};

export default Root;
