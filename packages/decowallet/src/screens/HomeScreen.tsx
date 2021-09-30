import React from 'react';
import { ScrollView } from 'react-native';
import { View, Text, TouchableOpacity } from 'react-native-picasso';
import { useRecoilState } from 'recoil';
import walletUtils from '../core/wallets/wallet-utils';
import useInterval from '../hooks/useInterval';
import { IInvoice } from '../services/lndhub.service.types';
import walletState, { IWallet } from '../state/atoms/wallet.atom';

const HomeScreen: React.FC = () => {
  const [wallet, setWallet] = useRecoilState(walletState);

  const handlePoll = async (lnw: IWallet) => {
    const updatedWallet = await walletUtils.refreshWallet(lnw);

    setWallet(updatedWallet);
  };

  useInterval(() => {
    if (wallet) handlePoll(wallet);
  }, 5000);

  const handleCreateWallet = async () => {
    const lndw = await walletUtils.createWallet();

    setWallet(lndw);
  };

  const renderWallet = (lndw: IWallet) => {
    return (
      <View key={lndw.accessToken} className="p-md bg-secondary bb-1 bc-primary">
        <Text>Lightning Wallet</Text>
        <Text>{lndw.refillAddresses[0]}</Text>
        <Text>Balance : {lndw.balance} SATS</Text>
      </View>
    );
  };

  const renderInvoices = (invoice: IInvoice) => {
    return (
      <View className="bg-secondary p-sm bb-1 cell bt-1">
        <View className="f-r jc-between">
          <Text>{invoice.amt}</Text>
          <Text>{invoice.ispaid ? 'paid' : 'waiting'}</Text>
        </View>
        <Text className="c-secondary">{invoice.description || 'no description'}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <View className="flex-row">
        <TouchableOpacity onPress={handleCreateWallet} className="bg-primary f-1 p-md ai-c jc-c br-1">
          <Text className="c-white w-bold">Create wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => wallet && walletUtils.saveWallet(wallet)} className="bg-primary f-1 p-md ai-c jc-c">
          <Text className="c-white w-bold">Save wallet</Text>
        </TouchableOpacity>
      </View>
      {wallet && renderWallet(wallet)}
      <View className="p-md">
        <Text className="s-xl w-bold">Transactions</Text>
      </View>
      <ScrollView>{wallet?.invoices && wallet.invoices.map(renderInvoices)}</ScrollView>
    </View>
  );
};

export default HomeScreen;
