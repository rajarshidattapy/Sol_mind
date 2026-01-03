import React from 'react';
import Marketplace from './Marketplace';
import Staking from './Staking';

interface MarketplaceViewProps {
  activeSubTab: string;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = ({ activeSubTab }) => {
  if (activeSubTab === 'staking') {
    return <Staking />;
  }
  
  return <Marketplace />;
};

export default MarketplaceView;