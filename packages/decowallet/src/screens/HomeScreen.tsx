import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import LightningWallet from '../core/wallets/LightningWallet';
import walletUtils from '../core/wallets/wallet-utils';

const HomeScreen: React.FC = () => {
  const [wallet, setWallet] = useState<LightningWallet>();

  const renderWallet = (lndw: LightningWallet) => {
    return (
      <View key={lndw.accessToken} style={{ padding: 20, backgroundColor: 'orange', borderBottomWidth: 1 }}>
        <Text>Lightning Wallet</Text>
        <Text>{lndw.refillAddresses[0]}</Text>
        <Text>Balance : {lndw.getBalance()} SATS</Text>
      </View>
    );
  };

  const handleLoadWallet = async () => {
    const lndw = await walletUtils.loadWallet();

    setWallet(lndw);
  };

  const handleCreateWallet = async () => {
    const lndw = await walletUtils.createWallet();

    setWallet(lndw);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={handleCreateWallet} style={{ padding: 20, backgroundColor: 'red', borderBottomWidth: 1, flex: 1 }}>
          <Text style={{ fontFamily: 'inter' }}>Create wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => wallet && walletUtils.saveWallet(wallet)} style={{ padding: 20, flex: 1, backgroundColor: 'green', borderBottomWidth: 1 }}>
          <Text>Save wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLoadWallet} style={{ padding: 20, flex: 1, backgroundColor: 'yellow', borderBottomWidth: 1 }}>
          <Text>Load wallet</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>{wallet && renderWallet(wallet)}</ScrollView>
    </View>
  );
};

export default HomeScreen;
