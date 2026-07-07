import React, { useState } from 'react';
import { Layout } from '../components/Layout.js';
import { LinkGenerator } from '../components/LinkGenerator.js';
import { Loader } from '../components/Loader.js';

export const GeneratePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage] = useState('Generating secure checkout prefill code...');

  return (
    <Layout showBackButton>
      {isLoading && <Loader message={loadingMessage} />}
      <LinkGenerator
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </Layout>
  );
};

export default GeneratePage;
